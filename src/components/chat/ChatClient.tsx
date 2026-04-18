"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Bot, User, Database, Zap, AlertTriangle,
  Info, Code2, Loader2, Mic, Paperclip
} from "lucide-react";
import type { ChatMessage, Dataset } from "@/types";

const QUICK_PROMPTS = [
  { icon: AlertTriangle, label: "Risk Assessment", prompt: "What are the main risks in my current dataset?" },
  { icon: Info, label: "Explain Leakage", prompt: "Explain concept leakage and why it matters for ML." },
  { icon: Code2, label: "How to Fix", prompt: "How do I fix the concept leakage issues you found?" },
  { icon: Database, label: "Column Analysis", prompt: "Analyze the columns in my active dataset for leakage." },
];

const QUICK_COMMANDS = [
  { label: "/REDACT", prompt: "Redact all PII columns from my dataset." },
  { label: "/FILTER_LEAKS", prompt: "Filter and list only the leaking columns." },
  { label: "/SUMMARIZE_RISKS", prompt: "Summarize all detected risks in my dataset." },
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}
      >
        <Bot className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
          <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
          <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
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

${activeDatasetId ? "I've loaded your selected dataset. Try asking for a risk assessment!" : "Select a dataset from the left panel to get a focused analysis, or ask me anything about concept leakage!"}`,
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

  // Derived findings for left panel (from activeDataset)
  const privacyScore = activeDataset ? 100 - (activeDataset.riskScore || 0) : null;

  return (
    <div
      className="flex h-[calc(100vh-3.5rem)] overflow-hidden animate-fade-in"
      style={{ margin: "-1.5rem -1.5rem -2rem" }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex flex-col w-[280px] shrink-0 overflow-y-auto"
        style={{
          background: "#0d0d14",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="p-4 space-y-4">
          {/* CONTEXT */}
          <div>
            <p className="section-label mb-2">Context</p>
            <select
              value={activeDatasetId || ""}
              onChange={(e) => setActiveDatasetId(e.target.value || undefined)}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
              style={{
                background: "#1a1a24",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ebebf0",
              }}
            >
              <option value="" style={{ background: "#1a1a24" }}>
                No dataset selected
              </option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id} style={{ background: "#1a1a24" }}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          {activeDataset && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-lg font-bold" style={{ color: "#ebebf0" }}>
                    {activeDataset.rowCount?.toLocaleString() || "—"}
                  </p>
                  <p className="section-label mt-0.5">ROWS</p>
                </div>
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-lg font-bold" style={{ color: "#ebebf0" }}>
                    {activeDataset.columnCount || "—"}
                  </p>
                  <p className="section-label mt-0.5">COLS</p>
                </div>
              </div>

              {privacyScore !== null && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="section-label">PRIVACY SCORE</p>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color:
                          privacyScore >= 70
                            ? "#22c55e"
                            : privacyScore >= 40
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    >
                      {privacyScore}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${privacyScore}%`,
                        background:
                          privacyScore >= 70
                            ? "#22c55e"
                            : privacyScore >= 40
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FINDINGS */}
          <div>
            <p className="section-label mb-2">Findings</p>
            {activeDataset ? (
              <div className="space-y-1">
                {[
                  {
                    color: activeDataset.riskScore && activeDataset.riskScore >= 70 ? "#ef4444" : "#f97316",
                    label: "Target Leakage Risk",
                    sub: `Score: ${activeDataset.riskScore || 0}/100`,
                  },
                  {
                    color: "#22c55e",
                    label: "Schema Validated",
                    sub: `${activeDataset.columnCount || 0} columns parsed`,
                  },
                  {
                    color: "#f97316",
                    label: "PII Scan",
                    sub: "Review recommended",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1 shrink-0"
                      style={{ background: item.color }}
                    />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#ebebf0" }}>
                        {item.label}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#4a4a5a" }}>
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "#4a4a5a" }}>
                Select a dataset to see findings
              </p>
            )}
          </div>

          {/* AGENT STATUS */}
          <div>
            <p className="section-label mb-2">Agent Status</p>
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#22c55e" }} />
              <p className="text-xs font-semibold" style={{ color: "#22c55e" }}>
                Active &amp; Syncing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 animate-fade-in ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={
                  msg.sender === "user"
                    ? {
                        background: "rgba(249,115,22,0.2)",
                        border: "1px solid rgba(249,115,22,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {msg.sender === "user" ? (
                  <User className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
                ) : (
                  <Bot className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
                )}
              </div>

              {/* Bubble */}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3"
                style={
                  msg.sender === "user"
                    ? {
                        background: "rgba(249,115,22,0.12)",
                        border: "1px solid rgba(249,115,22,0.25)",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "#111118",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {/* Header */}
                <div
                  className="flex items-center gap-2 mb-1.5 text-[10px] font-semibold tracking-[0.06em]"
                  style={{ color: "#4a4a5a" }}
                >
                  {msg.sender === "bot" ? (
                    <>
                      <Bot className="w-3 h-3" style={{ color: "#f97316" }} />
                      <span style={{ color: "#f97316" }}>AI CHAT</span>
                      <span>·</span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>USER</span>
                    </>
                  )}
                </div>

                {msg.sender === "bot" ? (
                  <div className="chat-markdown text-sm leading-relaxed" style={{ color: "#ebebf0" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "#ebebf0" }}>
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          ))}

          {sending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 shrink-0">
          {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              onClick={() => sendMessage(prompt)}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap shrink-0 disabled:opacity-50 transition-colors hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#7b7b8d",
              }}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div
          className="rounded-2xl p-3 shrink-0"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-end gap-3">
            <Paperclip className="w-4 h-4 mb-1 shrink-0 cursor-pointer" style={{ color: "#4a4a5a" }} />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about concept leakage, data risks, or analysis…"
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ color: "#ebebf0", minHeight: "24px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />
            <Mic className="w-4 h-4 mb-1 shrink-0 cursor-pointer" style={{ color: "#4a4a5a" }} />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 glow-orange-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#f97316" }}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Quick command chips */}
          <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            {QUICK_COMMANDS.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                disabled={sending}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider disabled:opacity-50 transition-colors hover:opacity-80"
                style={{
                  background: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.2)",
                  color: "#f97316",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] mt-1.5" style={{ color: "#4a4a5a" }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
