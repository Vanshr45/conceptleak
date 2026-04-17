"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Bot, User, Database, Zap, AlertTriangle,
  Info, Code2, Loader2
} from "lucide-react";
import type { ChatMessage, Dataset } from "@/types";

const QUICK_PROMPTS = [
  { icon: AlertTriangle, label: "Risk Assessment", prompt: "What are the main risks in my current dataset?" },
  { icon: Info, label: "Explain Leakage", prompt: "Explain concept leakage and why it matters for ML." },
  { icon: Code2, label: "How to Fix", prompt: "How do I fix the concept leakage issues you found?" },
  { icon: Database, label: "Column Analysis", prompt: "Analyze the columns in my active dataset for leakage." },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div className="w-7 h-7 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-orange-400" />
      </div>
      <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-1.5 h-1.5 bg-orange-400 rounded-full" />
          <span className="typing-dot w-1.5 h-1.5 bg-orange-400 rounded-full" />
          <span className="typing-dot w-1.5 h-1.5 bg-orange-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ChatClient() {
  const searchParams = useSearchParams();
  const datasetIdParam = searchParams.get("dataset");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | undefined>(datasetIdParam || undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId);

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((d) => setDatasets(d.datasets || []));
  }, []);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        text: `# Welcome to ConceptLeak AI 🔍

I'm your intelligent data science assistant, specialized in detecting **concept leakage** in machine learning datasets.

**I can help you with:**
- Analyzing your datasets for leakage risks
- Explaining different types of concept leakage
- Providing actionable remediation steps
- Answering questions about ML data integrity

${activeDatasetId ? "I've loaded your selected dataset. Try asking for a risk assessment!" : "Select a dataset from the dropdown above to get a focused analysis, or ask me anything about concept leakage!"}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [activeDatasetId]);

  useEffect(() => {
    if (!activeDatasetId) return;
    fetch(`/api/chat?datasetId=${activeDatasetId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.messages?.length > 0) {
          setMessages((prev) => {
            const welcomeMsg = prev.find((m) => m.id === "welcome");
            return welcomeMsg ? [welcomeMsg, ...d.messages] : d.messages;
          });
        }
      });
  }, [activeDatasetId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), datasetId: activeDatasetId }),
      });

      const contentType = res.headers.get("content-type") || "";

      // ── Streaming (Groq) ──────────────────────────────────────────────────
      if (contentType.includes("text/event-stream")) {
        const botMsgId = `b-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: botMsgId, text: "", sender: "bot", timestamp: new Date().toISOString() },
        ]);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

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
              const token = parsed?.token;
              if (token) {
                fullText += token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, text: fullText } : m
                  )
                );
              }
            } catch {}
          }
        }

      // ── Non-streaming fallback ────────────────────────────────────────────
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            text: data.reply || "Sorry, I couldn't process that. Please try again.",
            sender: "bot",
            timestamp: new Date().toISOString(),
          },
        ]);
      }

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          text: "Network error. Please check your connection and try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [sending, activeDatasetId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-400" />
            AI Chat
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Powered by Llama 3.3</p>
        </div>

        {/* Dataset selector */}
        <select
          value={activeDatasetId || ""}
          onChange={(e) => setActiveDatasetId(e.target.value || undefined)}
          className="glass rounded-xl px-3 py-2 text-sm text-slate-300 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-transparent max-w-[200px] truncate"
        >
          <option value="">No dataset selected</option>
          {datasets.map((d) => (
            <option key={d.id} value={d.id} className="bg-slate-800">
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Active dataset badge */}
      {activeDataset && (
        <div className="flex items-center gap-2 px-3 py-2 glass border border-blue-500/20 rounded-xl mb-3 shrink-0">
          <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <p className="text-xs text-slate-300 truncate">
            Active: <span className="text-blue-300 font-medium">{activeDataset.name}</span>
            <span className="text-slate-500 ml-2">{activeDataset.rowCount?.toLocaleString()} rows · Risk: {activeDataset.riskScore}/100</span>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass rounded-2xl p-4 space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-3 animate-fade-in ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === "user"
                ? "bg-orange-500/20 border border-orange-500/30"
                : "bg-blue-500/20 border border-blue-500/30"
            }`}>
              {msg.sender === "user"
                ? <User className="w-3.5 h-3.5 text-orange-400" />
                : <Bot className="w-3.5 h-3.5 text-blue-400" />
              }
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender === "user"
                  ? "bg-orange-500/20 border border-orange-500/30 rounded-br-sm text-white"
                  : "glass rounded-bl-sm"
              }`}
            >
              {msg.sender === "bot" ? (
                <div className="chat-markdown text-slate-200 text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-white">{msg.text}</p>
              )}
              <p className={`text-[10px] mt-1.5 ${msg.sender === "user" ? "text-orange-300/60 text-right" : "text-slate-600"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 shrink-0">
        {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => sendMessage(prompt)}
            disabled={sending}
            className="flex items-center gap-1.5 px-3 py-1.5 glass border border-slate-700/50 hover:border-orange-500/30 hover:bg-orange-500/5 rounded-xl text-xs text-slate-400 hover:text-orange-300 transition-all duration-150 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-3 flex items-end gap-3 shrink-0">
        <div className="w-7 h-7 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center shrink-0 self-end mb-1">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about concept leakage, data risks, or analysis…"
          rows={1}
          className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm resize-none focus:outline-none leading-relaxed max-h-32 overflow-y-auto"
          style={{ minHeight: "24px" }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 128) + "px";
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shrink-0 glow-orange-sm"
        >
          {sending
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <Send className="w-4 h-4 text-white" />
          }
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
