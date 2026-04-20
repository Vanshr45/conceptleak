// AI Auditor chat page.

const QUICK_CHIPS = [
  "What are the critical issues?",
  "How do I fix the target leakage?",
  "Generate a clean version of this dataset",
  "Explain the risk score",
];

const Auditor = ({ dataset, seed, setActiveDataset, onNav, clearSeed }) => {
  const d = dataset || DATASETS[0];
  const r = RISK[d.severity];
  const findings = d.findings || [];
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const scrollRef = React.useRef(null);

  const greet = React.useCallback(() => {
    const crit = (findings || []).filter(f => f.severity === 'CRITICAL');
    const high = (findings || []).filter(f => f.severity === 'HIGH');
    const most = crit[0] || findings[0];
    const text =
`I've analyzed **${d.name}**. I found **${findings.length}** issues — **${crit.length}** critical, **${high.length}** high priority.

The most urgent is **${most?.column || '—'}**: ${most?.description?.split('.')[0] || 'a serious leakage risk'}. [[${most?.severity || 'CRITICAL'}]]

Want me to walk you through all the findings, or start with fixes for the critical ones?`;
    streamAI(text);
  }, [d]);

  // Proactive greeting on dataset change
  React.useEffect(() => {
    setMessages([]); setInput(''); setStreaming(false);
    const t = setTimeout(greet, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [d.id]);

  // Seeded question from Insights "Ask AI about this"
  React.useEffect(() => {
    if (!seed?.finding) return;
    const f = seed.finding;
    const q = `How do I fix the ${LEAKAGE_TYPES[f.type].label.toLowerCase()} in \`${f.column}\`?`;
    const t = setTimeout(() => send(q, { seededFinding: f }), 900);
    clearSeed?.();
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [seed]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streaming]);

  const streamAI = (full) => {
    setStreaming(true);
    setMessages(m => [...m, { role: 'ai', text: '' }]);
    // Tokenize on whitespace; stream word-by-word.
    const tokens = full.match(/(\s+|\S+)/g) || [];
    let i = 0;
    const tick = () => {
      i += 1;
      const chunk = tokens.slice(0, i).join('');
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'ai', text: chunk };
        return copy;
      });
      if (i < tokens.length) setTimeout(tick, 18 + Math.random() * 32);
      else setStreaming(false);
    };
    setTimeout(tick, 120);
  };

  const canned = (q, ctx) => {
    const finding = ctx?.seededFinding;
    if (finding) {
      return `Absolutely — let's fix **${finding.column}** ([[${finding.severity}]]).

**Why it leaks:** ${finding.description}

Here's the minimal pandas fix:

\`\`\`python
${finding.fix?.code || '# drop the column before training\ndf = df.drop(columns=["' + finding.column + '"])'}
\`\`\`

After the fix, re‑run the scanner — I expect the risk score to drop from **${d.score}** to the **40s**. Want me to also check the remaining ${(findings.length - 1)} findings for related leakage patterns?`;
    }
    const lower = q.toLowerCase();
    if (lower.includes('critical')) {
      const crit = findings.filter(f => f.severity === 'CRITICAL');
      return `You have **${crit.length} critical** issues in \`${d.name}\`:

${crit.map((f, i) => `${i+1}. **${f.column}** — ${LEAKAGE_TYPES[f.type].label} · score **${f.score}**\n   ${f.description.split('.')[0]}.`).join('\n\n')}

All three must be resolved before training. I'd tackle them in order — \`patient_diagnosis_code\` first because it's effectively a re‑encoding of the label. Want the fix snippets?`;
    }
    if (lower.includes('target') || lower.includes('correlation')) {
      return `The target leakage comes from two columns that correlate too tightly with \`heart_disease\`:

- \`patient_diagnosis_code\` — Pearson **0.97** [[CRITICAL]]
- \`insurance_claim_approved\` — Pearson **0.71** [[HIGH]]

The first is a direct re‑encoding. Drop it before the split:

\`\`\`python
df = df.drop(columns=["patient_diagnosis_code"])
X = df.drop(columns=["heart_disease"])
y = df["heart_disease"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
\`\`\`

For \`insurance_claim_approved\`, verify temporality first — if the claim timestamp post‑dates your prediction horizon, it's leaking forward.`;
    }
    if (lower.includes('clean') || lower.includes('generate')) {
      return `Here's a one‑shot cleaned pipeline for **${d.name}**:

\`\`\`python
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv("${d.name}")

# 1. Drop direct leakage
LEAKED = ["patient_id", "patient_diagnosis_code",
          "attending_physician_email", "insurance_claim_approved"]
df = df.drop(columns=LEAKED)

# 2. Remove post‑event timestamps
df = df.drop(columns=["follow_up_visit_date"])

# 3. Reduce zip granularity
df["zip3"] = df["zipcode"].astype(str).str[:3]
df = df.drop(columns=["zipcode"])

X = df.drop(columns=["heart_disease"])
y = df["heart_disease"]
\`\`\`

This brings the risk score from **${d.score}** down to an estimated **22** ([[LOW]]).`;
    }
    if (lower.includes('score') || lower.includes('explain')) {
      return `The **risk score** is a 0‑100 composite.

It weights four signals:
- **ID leakage** (30%) — unique identifiers that shouldn't be features
- **Target correlation** (35%) — columns that trivially predict the label
- **Temporal leakage** (20%) — features that post‑date the prediction horizon
- **PII** (15%) — legal + representational risk

Your current score of **${d.score}** ([[${d.severity}]]) is driven primarily by \`patient_diagnosis_code\` (target) and \`patient_id\` (ID). Resolving those two drops the score to ~**40** before touching anything else.`;
    }
    return `I see. For \`${d.name}\`, the fastest path forward is to resolve the three critical findings first — they account for **${Math.round((findings.filter(f=>f.severity==='CRITICAL').reduce((a,f)=>a+f.score,0)/findings.reduce((a,f)=>a+f.score,0))*100)}%** of the total risk. Want me to generate a ready‑to‑run cleaning script?`;
  };

  const send = (raw, ctx) => {
    const q = (raw ?? input).trim();
    if (!q || streaming) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setTimeout(() => streamAI(canned(q, ctx)), 420);
  };

  return (
    <div className="flex h-[calc(100vh-60px)]">
      {/* Left context panel */}
      <aside className="w-[300px] shrink-0 border-r border-app bg-surface overflow-y-auto">
        <div className="p-4 border-b border-app">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-2">Active dataset</div>
          <DatasetPicker current={d} onChange={(id) => setActiveDataset(id)}/>
        </div>

        <div className="p-4 border-b border-app">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-elevated rounded-md p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-muted mb-1">Rows</div>
              <div className="text-pri tabular text-[14px]">{d.rows.toLocaleString()}</div>
            </div>
            <div className="bg-elevated rounded-md p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-muted mb-1">Columns</div>
              <div className="text-pri tabular text-[14px]">{d.columns}</div>
            </div>
            <div className="col-span-2 bg-elevated rounded-md p-2.5">
              <div className="text-[9px] uppercase tracking-wider text-muted mb-1.5">Risk score</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular" style={{color: r.color}}>{d.score}</span>
                <RiskBadge level={d.severity} size="xs"/>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Current issues</div>
            <span className="text-[10px] font-mono text-sec tabular">{findings.length}</span>
          </div>
          <div className="space-y-1">
            {findings.map(f => {
              const fr = RISK[f.severity];
              return (
                <button key={f.id}
                  onClick={() => send(`Explain the risk in \`${f.column}\` and how to fix it.`, { seededFinding: f })}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-hover text-left transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background: fr.color}}/>
                  <span className="font-mono text-[11.5px] text-pri truncate flex-1">{f.column}</span>
                  <span className="font-mono text-[10px] tabular" style={{color: fr.color}}>{f.score}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Chat */}
      <section className="flex-1 flex flex-col min-w-0">
        <div className="px-6 h-[52px] border-b border-app flex items-center gap-3 text-[12px]">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
               style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.32)', color: '#60a5fa' }}>
            <Icon.Bot size={14}/>
          </div>
          <div>
            <div className="text-[12px] font-semibold">AI Auditor</div>
            <div className="text-[10px] text-muted font-mono">grounded on {d.name} · leakage rubric v2.0</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-sec">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{background: 'var(--low)'}}/>
            live
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} text={m.text} streaming={streaming && i === messages.length - 1 && m.role === 'ai'}/>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-app bg-surface px-6 py-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_CHIPS.map(q => (
              <button key={q} onClick={() => send(q)}
                disabled={streaming}
                className="text-[11.5px] px-3 h-7 rounded-full border border-app hover:border-app-strong text-sec hover:text-pri transition-colors disabled:opacity-40">
                {q}
              </button>
            ))}
          </div>

          <div className="relative bg-elevated border border-app rounded-xl focus-within:border-app-strong transition-colors">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={2}
              placeholder={`Ask about ${d.name}…`}
              className="w-full bg-transparent resize-none outline-none px-4 py-3 pr-14 text-[13.5px] text-pri placeholder:text-muted"
            />
            <button onClick={() => send()} disabled={!input.trim() || streaming}
              className="absolute right-2 bottom-2 w-9 h-9 rounded-lg flex items-center justify-center text-black disabled:opacity-30"
              style={{ background: 'var(--accent)' }}>
              <Icon.Send size={14}/>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted font-mono">
            <span>↵ send · shift + ↵ newline</span>
            <span className="flex items-center gap-1.5"><Icon.Zap size={10} style={{color:'#60a5fa'}}/> llama-3.1-70b via Groq · ~280 tok/s</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const DatasetPicker = ({ current, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const r = RISK[current.severity];
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-md bg-elevated border border-app hover:border-app-strong transition-colors">
        <Icon.FileSpreadsheet size={15} style={{color: r.color}}/>
        <div className="flex-1 min-w-0 text-left">
          <div className="font-mono text-[12.5px] text-pri truncate">{current.name}</div>
          <div className="text-[10px] text-muted font-mono">{current.rows.toLocaleString()} rows · {current.columns} cols</div>
        </div>
        <Icon.ChevronDown size={13} className="text-sec"/>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-elevated border border-app-strong rounded-md z-30 overflow-hidden shadow-2xl">
          {DATASETS.map(d => {
            const dr = RISK[d.severity];
            return (
              <button key={d.id}
                onClick={() => { onChange(d.id); setOpen(false); }}
                className={cx("w-full flex items-center gap-2.5 p-2.5 text-left hover:bg-hover", d.id === current.id && 'bg-hover')}>
                <Icon.FileSpreadsheet size={13} style={{color: dr.color}}/>
                <span className="font-mono text-[12px] text-pri flex-1 truncate">{d.name}</span>
                <span className="font-mono text-[10px] tabular" style={{color: dr.color}}>{d.score}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

window.Auditor = Auditor;
