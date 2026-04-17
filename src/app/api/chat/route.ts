import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getDataset, getInsights, addMessage } from "@/lib/store";

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  datasetId: z.string().optional(),
});

async function callAI(prompt: string): Promise<string | null> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Try Gemini first — fast, free, and reliable
  if (geminiKey) {
    const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
          }
        );
        if (!res.ok) { console.error(`Gemini ${model} failed (${res.status})`); continue; }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (err) {
        console.error(`Gemini ${model} threw:`, err);
      }
    }
  }

  // Fallback: OpenRouter (free tier, slower)
  if (openRouterKey) {
    const models = [
      "openai/gpt-oss-20b:free",
      "openai/gpt-oss-120b:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
    ];

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
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error(`OpenRouter model ${model} failed (${res.status}):`, errBody);
          continue;
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text;
        console.error(`OpenRouter model ${model} returned empty:`, JSON.stringify(data));
      } catch (err) {
        console.error(`OpenRouter model ${model} threw:`, err);
      }
    }
  }

  return null;
}

async function buildSystemPrompt(userId: string, datasetId?: string): Promise<string> {
  let datasetContext = "";

  if (datasetId) {
    const dataset = await getDataset(userId, datasetId);
    const insights = await getInsights(userId, datasetId);

    if (dataset) {
      datasetContext += `\n\n---\nACTIVE DATASET: "${dataset.name}"`;
      datasetContext += `\nColumns (${dataset.columnCount}): ${dataset.columns?.join(", ") || "unknown"}`;
      datasetContext += `\nRows: ${dataset.rowCount?.toLocaleString() || "unknown"} | Size: ${dataset.size} | Risk Score: ${dataset.riskScore ?? "N/A"}/100 (${dataset.riskLevel ?? "UNKNOWN"})`;

      if (insights.length > 0) {
        datasetContext += `\n\nDetected leakage issues (${insights.length} total):\n`;
        insights.forEach((ins) => {
          datasetContext += `- [${ins.riskLevel}] Feature "${ins.feature}" (score ${ins.score}/100, type: ${ins.leakageType ?? "unknown"}): ${ins.description}\n`;
        });
      } else {
        datasetContext += `\nNo leakage issues detected in this dataset.`;
      }
      datasetContext += `\n---`;
    }
  }

  return `You are a helpful AI assistant built into ConceptLeak, an ML dataset auditing platform. You can answer any question the user asks — general knowledge, coding, explanations, advice, or anything else.

You also have deep expertise in:
- Machine learning concepts, model training, and evaluation
- Concept leakage / data leakage detection in ML datasets
- Types of leakage: Direct ID leakage, Feature-Target leakage, Temporal leakage, Proxy leakage, Preprocessing leakage
- Data science best practices, feature engineering, and model validation

When a dataset is active (shown below), use its metadata and detected issues to answer dataset-specific questions intelligently. Otherwise, just be a great general-purpose assistant.

Format your responses with **bold** for emphasis, bullet points for lists, and code blocks for code. Be concise but thorough.${datasetContext}`;
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
    const systemPrompt = await buildSystemPrompt(userId, datasetId);
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

    // Try AI backend
    let reply = await callAI(fullPrompt);

    // Fallback to smart keyword-based responses
    if (!reply) {
      reply = await generateFallbackResponse(message, userId, datasetId);
    }

    // Persist to in-memory store
    if (datasetId) {
      const userMsg = {
        id: `msg-${Date.now()}-u`,
        text: message,
        sender: "user" as const,
        timestamp: new Date().toISOString(),
        datasetId,
      };
      const botMsg = {
        id: `msg-${Date.now()}-b`,
        text: reply,
        sender: "bot" as const,
        timestamp: new Date().toISOString(),
        datasetId,
      };
      addMessage(userId, datasetId, userMsg);
      addMessage(userId, datasetId, botMsg);
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateFallbackResponse(message: string, userId: string, datasetId?: string): Promise<string> {
  const lower = message.toLowerCase();

  // Dataset-aware fallbacks when Gemini is unavailable
  if (datasetId) {
    const dataset = await getDataset(userId, datasetId);
    const insights = await getInsights(userId, datasetId);

    if (lower.match(/risk|score|danger|critical|issue/)) {
      const critical = insights.filter((i) => i.riskLevel === "CRITICAL").length;
      const high = insights.filter((i) => i.riskLevel === "HIGH").length;
      const medium = insights.filter((i) => i.riskLevel === "MEDIUM").length;
      return `**Risk Assessment for "${dataset?.name}":**\n\n- 🔴 **Critical**: ${critical}\n- 🟠 **High**: ${high}\n- 🟡 **Medium**: ${medium}\n- **Total issues**: ${insights.length}\n- **Risk score**: ${dataset?.riskScore ?? "N/A"}/100 (${dataset?.riskLevel ?? "UNKNOWN"})\n\nStart with Critical findings — they have the most impact on model generalizability.`;
    }

    if (lower.match(/column|feature|variable|tell.*about|everything|what.*dataset/)) {
      if (dataset?.columns) {
        const issueLines = insights.slice(0, 5).map(
          (i) => `- **${i.feature}** [${i.riskLevel}]: ${i.description}`
        ).join("\n");
        return `**Dataset: "${dataset.name}"**\n\n- **Rows:** ${dataset.rowCount?.toLocaleString()}\n- **Columns (${dataset.columnCount}):** \`${dataset.columns.join("`, `")}\`\n- **Size:** ${dataset.size}\n- **Risk Score:** ${dataset.riskScore}/100 (${dataset.riskLevel})\n\n**Top Detected Issues:**\n${issueLines || "None detected."}`;
      }
    }
  }

  // General greeting
  if (lower.match(/^(hello|hi|hey|sup|yo)\b/)) {
    return "Hey! I'm ConceptLeak AI — your general-purpose assistant with deep ML expertise. Ask me anything: general questions, coding help, or dataset analysis. What's on your mind?";
  }

  // Generic helpful fallback (Gemini is down)
  return `I'm having trouble reaching the AI backend right now. Here's what I can help with:\n\n- **Dataset analysis** — select a dataset and ask about its risks or columns\n- **Concept leakage** — ask me to explain any leakage type\n- **Remediation** — ask how to fix leakage issues\n- **General ML questions** — model evaluation, feature engineering, best practices\n\nTry again in a moment, or ask a more specific question!`;
}
