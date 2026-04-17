import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getDataset, getInsights, getChatHistory, addMessage } from "@/lib/store";

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  datasetId: z.string().optional(),
});

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

async function callAI(
  systemPrompt: string,
  messages: AIMessage[]
): Promise<ReadableStream<Uint8Array> | string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const openAIMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // ── Groq (primary — fast, free, streaming) ────────────────────────────────
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: openAIMessages,
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        return res.body;
      }
      console.error(`Groq failed (${res.status}):`, await res.text());
    } catch (err) {
      console.error("Groq threw:", err);
    }
  }

  // ── OpenRouter fallback (non-streaming) ───────────────────────────────────
  if (openRouterKey) {
    const models = ["openai/gpt-oss-20b:free", "openai/gpt-oss-120b:free"];
    for (const model of models) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://conceptleak.vercel.app",
            "X-Title": "ConceptLeak",
          },
          body: JSON.stringify({
            model,
            messages: openAIMessages,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });
        if (!res.ok) {
          console.error(`OpenRouter ${model} failed (${res.status})`);
          continue;
        }
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
      } catch (err) {
        console.error(`OpenRouter ${model} threw:`, err);
      }
    }
  }

  return null;
}

// ── System prompt builder — injects real dataset context ──────────────────────
async function buildSystemPrompt(userId: string, datasetId?: string): Promise<string> {
  let datasetContext = "";

  if (datasetId) {
    const [dataset, insights] = await Promise.all([
      getDataset(userId, datasetId),
      getInsights(userId, datasetId),
    ]);

    if (dataset) {
      datasetContext = `
══════════════════════════════════════
ACTIVE DATASET UNDER ANALYSIS
══════════════════════════════════════
Name: ${dataset.name}
Rows: ${dataset.rowCount?.toLocaleString()} | Columns: ${dataset.columnCount} | Size: ${dataset.size}
Risk Score: ${dataset.riskScore}/100 (${dataset.riskLevel})
Column Names: ${dataset.columns?.join(", ") || "unknown"}

Detected Leakage Issues (${insights.length} total):
${
  insights.length > 0
    ? insights
        .map(
          (i) =>
            `• [${i.riskLevel}] "${i.feature}" — ${i.leakageType} (score: ${i.score}/100)\n  ${i.description}`
        )
        .join("\n")
    : "• No leakage issues detected."
}
══════════════════════════════════════`;
    }
  }

  return `You are ConceptLeak's embedded ML data auditor — a senior machine learning engineer specializing in data leakage detection, feature engineering, and model generalization.

RULES YOU MUST FOLLOW:
1. You are friendly, warm, and conversational — like a knowledgeable 
   colleague, not a robot. Match the user's energy. If they say "hi" 
   or ask how you are, respond naturally and briefly like a human would.
   Do NOT inject dataset context into casual greetings or small talk.
2. Only bring up the dataset when the user is clearly asking about it,
   or when it's genuinely relevant to their question.
3. When discussing a dataset issue: (a) why it's a problem, 
   (b) what breaks in production, (c) exact Python/pandas fix using 
   real column names.
4. Risk levels: LOW (0-30), MEDIUM (31-60), HIGH (61-80), CRITICAL (81-100).
5. Be concise — short replies for simple questions, detailed breakdowns 
   only when the user asks for depth.
6. You have conversation history — reference it naturally when relevant.
7. Never start every message by announcing the dataset risk score unprompted.
${datasetContext}`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const datasetId = req.nextUrl.searchParams.get("datasetId");
  if (!datasetId) {
    return NextResponse.json({ messages: [] });
  }
  const history = await getChatHistory(session.sub, datasetId, 50);
  return NextResponse.json({ messages: history });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = ChatSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { message, datasetId } = result.data;
    const userId = session.sub;

    const [systemPrompt, history] = await Promise.all([
      buildSystemPrompt(userId, datasetId),
      datasetId ? getChatHistory(userId, datasetId, 10) : Promise.resolve([]),
    ]);

    const historyMessages: AIMessage[] = history.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    const allMessages: AIMessage[] = [
      ...historyMessages,
      { role: "user", content: message },
    ];

    const aiResult = await callAI(systemPrompt, allMessages);

    // ── Streaming response (Groq) ────────────────────────────────────────────
    if (aiResult && typeof aiResult !== "string") {
      const stream = aiResult;
      let fullReply = "";

      const readable = new ReadableStream({
        async start(controller) {
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

              for (const line of lines) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  const token = parsed?.choices?.[0]?.delta?.content;
                  if (token) {
                    fullReply += token;
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ token })}\n\n`)
                    );
                  }
                } catch {}
              }
            }
          } finally {
            reader.releaseLock();
            controller.close();

            // Persist after stream completes
            if (datasetId && fullReply) {
              const now = Date.now();
              await Promise.all([
                addMessage(userId, datasetId, {
                  id: `msg-${now}-u`,
                  text: message,
                  sender: "user",
                  timestamp: new Date().toISOString(),
                  datasetId,
                }),
                addMessage(userId, datasetId, {
                  id: `msg-${now}-b`,
                  text: fullReply,
                  sender: "bot",
                  timestamp: new Date().toISOString(),
                  datasetId,
                }),
              ]);
            }
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // ── Non-streaming fallback (OpenRouter) ──────────────────────────────────
    const reply = typeof aiResult === "string"
      ? aiResult
      : "AI backend is temporarily unavailable. Please try again in a moment.";

    if (datasetId) {
      const now = Date.now();
      await Promise.all([
        addMessage(userId, datasetId, {
          id: `msg-${now}-u`,
          text: message,
          sender: "user",
          timestamp: new Date().toISOString(),
          datasetId,
        }),
        addMessage(userId, datasetId, {
          id: `msg-${now}-b`,
          text: reply,
          sender: "bot",
          timestamp: new Date().toISOString(),
          datasetId,
        }),
      ]);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
