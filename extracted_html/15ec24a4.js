// ============================================================
// Shared, reusable UI components for ConceptLeak.
// ============================================================

const cx = (...xs) => xs.filter(Boolean).join(' ');

// ── RiskBadge ─────────────────────────────────────────────────
const RiskBadge = ({ level = 'LOW', size = 'sm', className = '' }) => {
  const r = RISK[level] || RISK.LOW;
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 tracking-[0.14em]',
    sm: 'text-[11px] px-2 py-0.5 tracking-[0.16em]',
    md: 'text-[12px] px-2.5 py-1 tracking-[0.16em]',
    lg: 'text-[13px] px-3 py-1.5 tracking-[0.18em]',
  };
  return (
    <span
      className={cx('inline-flex items-center gap-1.5 font-semibold uppercase rounded-md border', sizes[size], className)}
      style={{ color: r.color, background: r.bg, borderColor: r.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
      {r.label}
    </span>
  );
};

// ── RiskScore: big number with pulse on CRITICAL ──────────────
const RiskScore = ({ value = 0, level = 'LOW', size = 'lg', animate = true }) => {
  const r = RISK[level] || RISK.LOW;
  const [displayed, setDisplayed] = React.useState(animate ? 0 : value);

  React.useEffect(() => {
    if (!animate) { setDisplayed(value); return; }
    let raf; const start = performance.now(); const dur = 900; const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const dims = {
    sm: { num: 'text-4xl', label: 'text-[10px]', gap: 'gap-1' },
    md: { num: 'text-6xl', label: 'text-[11px]', gap: 'gap-1.5' },
    lg: { num: 'text-[128px] leading-none', label: 'text-xs', gap: 'gap-2' },
  }[size];

  const isCrit = level === 'CRITICAL';

  return (
    <div className={cx('relative inline-flex flex-col items-center', dims.gap)}>
      {isCrit && size === 'lg' && (
        <>
          <span className="absolute inset-0 -m-8 rounded-full ring-pulse" style={{ border: `2px solid ${r.color}` }} />
          <span className="absolute inset-0 -m-4 rounded-full ring-pulse" style={{ border: `2px solid ${r.color}`, animationDelay: '0.7s' }} />
        </>
      )}
      <div
        className={cx(dims.num, 'font-bold tabular tracking-tight', isCrit && 'text-glow-critical')}
        style={{ color: r.color, fontFeatureSettings: '"tnum"' }}
      >
        {displayed}
      </div>
      <div className={cx(dims.label, 'font-semibold uppercase tracking-[0.22em]')} style={{ color: r.color }}>
        {r.label} RISK
      </div>
    </div>
  );
};

// ── Segment bar for risk distribution ─────────────────────────
const RiskDistributionBar = ({ breakdown, total }) => {
  const keys = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAN'];
  const t = total ?? keys.reduce((a, k) => a + (breakdown[k] || 0), 0);
  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden bg-[#1a1a24]">
        {keys.map((k) => {
          const v = breakdown[k] || 0;
          if (!v) return null;
          return <div key={k} style={{ width: `${(v / t) * 100}%`, background: RISK[k].color }} />;
        })}
      </div>
      <div className="flex gap-4 mt-3 text-[11px] font-mono text-sec">
        {keys.map((k) => (breakdown[k] ? (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: RISK[k].color }} />
            <span className="tabular">{breakdown[k]}</span>
            <span className="uppercase tracking-wider">{RISK[k].label}</span>
          </div>
        ) : null))}
      </div>
    </div>
  );
};

// ── Colored risk bar (for table rows) ─────────────────────────
const RiskScoreBar = ({ value, level }) => {
  const r = RISK[level] || RISK.LOW;
  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: r.color, boxShadow: `0 0 8px ${r.color}55` }} />
      </div>
      <span className="font-mono text-[12px] tabular w-8 text-right" style={{ color: r.color }}>{value}</span>
    </div>
  );
};

// ── Tiny syntax-highlighted code block ────────────────────────
const CodeBlock = ({ code }) => {
  // Very small Python highlighter — good-enough, no external deps.
  const highlight = (src) => {
    const out = [];
    const KW = new Set(['import','from','as','def','return','if','else','elif','in','for','while','not','is','and','or','lambda','with','True','False','None','pass','class','try','except','finally','raise','yield']);
    const BUILTINS = new Set(['print','len','range','map','str','int','float','bool','list','dict','set','tuple','pop','split','drop','train_test_split','GroupKFold']);
    const re = /([#][^\n]*)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^ \t\n])/g;
    let m; let i = 0;
    while ((m = re.exec(src)) !== null) {
      const [, cmt, dq, sq, num, id, ws, other] = m;
      const key = `t-${i++}`;
      if (cmt) out.push(<span key={key} className="tok-c">{cmt}</span>);
      else if (dq || sq) out.push(<span key={key} className="tok-s">{dq || sq}</span>);
      else if (num) out.push(<span key={key} className="tok-n">{num}</span>);
      else if (id) {
        if (KW.has(id)) out.push(<span key={key} className="tok-k">{id}</span>);
        else if (BUILTINS.has(id)) out.push(<span key={key} className="tok-f">{id}</span>);
        else out.push(<span key={key}>{id}</span>);
      }
      else if (ws) out.push(<span key={key}>{ws}</span>);
      else if (other) out.push(<span key={key}>{other}</span>);
    }
    return out;
  };
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="relative">
      <button onClick={onCopy}
        className="absolute right-2 top-2 text-[11px] font-mono text-sec hover:text-pri px-2 py-1 rounded border border-app hover:border-app-strong flex items-center gap-1 bg-[#0a0a10]/70">
        {copied ? <><Icon.Check size={12}/> Copied</> : <><Icon.Copy size={12}/> Copy</>}
      </button>
      <pre className="code-block whitespace-pre"><code>{highlight(code)}</code></pre>
    </div>
  );
};

// ── FindingCard ───────────────────────────────────────────────
const FindingCard = ({ finding, onAsk }) => {
  const [open, setOpen] = React.useState(false);
  const r = RISK[finding.severity];
  const lt = LEAKAGE_TYPES[finding.type];
  const LeakIcon = Icon[lt.icon] || Icon.AlertTriangle;

  return (
    <div
      id={`finding-${finding.column}`}
      className="finding-card relative bg-surface border border-app rounded-xl overflow-hidden"
      style={{ borderLeft: `3px solid ${r.color}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border"
                  style={{ color: r.color, background: r.bg, borderColor: r.border }}>
              <LeakIcon size={12} />
              {lt.label}
            </span>
            <span className="text-[11px] font-mono text-sec tabular">
              Score <span style={{ color: r.color }}>{finding.score}</span>/100
            </span>
            <span className="text-[11px] font-mono text-sec tabular">
              {finding.affectedRows.toLocaleString()} rows affected
            </span>
          </div>
          <RiskBadge level={finding.severity} size="sm" />
        </div>

        <div className="font-mono text-[19px] font-semibold text-pri mb-2 break-all">
          {finding.column}
        </div>

        <p className="text-sec text-[14px] leading-relaxed max-w-3xl">
          {finding.description}
        </p>

        <div className="flex items-center gap-2 mt-4">
          {finding.fix && (
            <button onClick={() => setOpen(o => !o)}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md bg-elevated border border-app hover:border-app-strong text-pri transition-colors">
              <Icon.Sparkles size={13}/>
              {open ? 'Hide fix' : 'How to fix'}
              <Icon.ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
            </button>
          )}
          <button onClick={() => onAsk?.(finding)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md border transition-colors"
            style={{ color: '#93c5fd', borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>
            <Icon.Bot size={13}/>
            Ask AI about this
          </button>
        </div>
      </div>

      {open && finding.fix && (
        <div className="px-5 pb-5 fade-in">
          <div className="flex items-center gap-2 text-[11px] font-mono text-sec uppercase tracking-wider mb-2">
            <span className="w-1 h-1 rounded-full bg-accent" />
            Suggested fix · {finding.fix.language}
          </div>
          <CodeBlock code={finding.fix.code} />
        </div>
      )}
    </div>
  );
};

// ── ColumnHealthGrid ──────────────────────────────────────────
const ColumnHealthGrid = ({ columns, onClickColumn }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {columns.map((c) => {
        const r = RISK[c.severity] || RISK.CLEAN;
        return (
          <button
            key={c.name}
            onClick={() => onClickColumn?.(c)}
            className="group relative font-mono text-[12px] px-2.5 py-1.5 rounded-md border transition-all hover:-translate-y-0.5"
            style={{ color: r.text, background: r.bg, borderColor: r.border }}
            title={`${c.name} · ${c.severity} · ${c.type}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
              {c.name}
              {c.isTarget && <span className="text-[9px] uppercase tracking-wider px-1 rounded border" style={{ borderColor: r.border, color: r.text }}>target</span>}
            </span>
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 -top-9 bg-elevated border border-app-strong rounded-md px-2 py-1 text-[10px] whitespace-nowrap z-10"
                  style={{ color: r.text }}>
              {c.severity} · {c.type}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ── StatCard ──────────────────────────────────────────────────
const StatCard = ({ label, value, sublabel, tone = 'default', icon: IconC, pulse = false }) => {
  const tones = {
    default: { v: 'var(--text-primary)', accent: 'var(--text-secondary)' },
    critical: { v: 'var(--critical)', accent: 'var(--critical)' },
    accent: { v: 'var(--accent)', accent: 'var(--accent)' },
    low: { v: 'var(--low)', accent: 'var(--low)' },
  }[tone];

  return (
    <div className="bg-surface border border-app rounded-xl p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-sec">{label}</div>
        {IconC && <IconC size={15} style={{ color: tones.accent }}/>}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-bold tabular tracking-tight" style={{ color: tones.v }}>{value}</div>
        {pulse && <span className="w-2.5 h-2.5 rounded-full pulse-dot" style={{ background: 'var(--critical)', boxShadow: '0 0 12px var(--critical)' }} />}
      </div>
      {sublabel && <div className="text-[12px] text-sec mt-1.5">{sublabel}</div>}
    </div>
  );
};

// ── DatasetCard ───────────────────────────────────────────────
const DatasetCard = ({ d, onView, onChat }) => {
  const r = RISK[d.severity] || RISK.LOW;
  return (
    <div className="group bg-surface border border-app hover:border-app-strong rounded-xl p-5 transition-all">
      <div className="flex items-start gap-4">
        {/* File icon tinted by risk */}
        <div className="relative shrink-0 w-12 h-14 rounded-md border flex items-center justify-center"
             style={{ background: r.bg, borderColor: r.border }}>
          <Icon.FileSpreadsheet size={22} style={{ color: r.color }} />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
               style={{ color: r.color, background: 'var(--bg-base)', border: `1px solid ${r.border}` }}>
            {d.name.split('.').pop()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="min-w-0">
              <div className="font-semibold text-pri truncate font-mono text-[15px]">{d.name}</div>
              <div className="text-[12px] text-sec mt-0.5">{d.size} · uploaded {d.uploaded}</div>
            </div>
            <RiskBadge level={d.severity} size="sm" />
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono text-sec px-2 py-0.5 rounded border border-app bg-elevated">
              <span className="tabular">{d.rows.toLocaleString()}</span> rows
            </span>
            <span className="text-[11px] font-mono text-sec px-2 py-0.5 rounded border border-app bg-elevated">
              <span className="tabular">{d.columns}</span> cols
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular" style={{ color: r.color }}>{d.score}</span>
              <span className="text-[11px] text-muted font-mono">/ 100</span>
            </div>
            <div className="flex-1">
              <RiskScoreBar value={d.score} level={d.severity} />
            </div>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="mt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
        <button onClick={() => onChat?.(d)}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-md border"
          style={{ color: '#93c5fd', borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>
          <Icon.Bot size={13}/> Chat with AI
        </button>
        <button onClick={() => onView?.(d)}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-md text-black"
          style={{ background: 'var(--accent)' }}>
          View Report <Icon.ArrowRight size={13}/>
        </button>
      </div>
    </div>
  );
};

// ── ChatMessage ───────────────────────────────────────────────
const renderMarkdownLite = (text) => {
  // Support: **bold**, `code`, ```python\n...\n```, headings #, lists -, inline risk badges [[CRITICAL]]
  const parts = [];
  const re = /```(\w+)?\n([\s\S]*?)```/g;
  let last = 0; let m; let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: 'text', v: text.slice(last, m.index), i: i++ });
    parts.push({ t: 'code', lang: m[1] || 'python', v: m[2], i: i++ });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ t: 'text', v: text.slice(last), i: i++ });

  const inline = (s) => {
    // risk tags
    let out = s.split(/(\[\[(?:CRITICAL|HIGH|MEDIUM|LOW)\]\])/g);
    return out.map((chunk, idx) => {
      const rm = chunk.match(/^\[\[(CRITICAL|HIGH|MEDIUM|LOW)\]\]$/);
      if (rm) return <RiskBadge key={idx} level={rm[1]} size="xs" className="mx-0.5 align-middle" />;
      // bold + code
      const bits = [];
      const subre = /(\*\*[^*]+\*\*|`[^`]+`)/g;
      let l = 0; let mm; let k = 0;
      while ((mm = subre.exec(chunk)) !== null) {
        if (mm.index > l) bits.push(<span key={k++}>{chunk.slice(l, mm.index)}</span>);
        const tok = mm[0];
        if (tok.startsWith('**')) bits.push(<strong key={k++} className="text-pri font-semibold font-mono">{tok.slice(2, -2)}</strong>);
        else bits.push(<code key={k++} className="font-mono text-[12px] px-1.5 py-0.5 rounded bg-[#0a0a10] border border-app" style={{color:'#fde68a'}}>{tok.slice(1, -1)}</code>);
        l = subre.lastIndex;
      }
      if (l < chunk.length) bits.push(<span key={k++}>{chunk.slice(l)}</span>);
      return <React.Fragment key={idx}>{bits}</React.Fragment>;
    });
  };

  return parts.map((p) => {
    if (p.t === 'code') return <div key={p.i} className="my-3"><CodeBlock code={p.v} /></div>;
    // split text by newlines, preserve paragraph breaks
    const lines = p.v.split('\n');
    return (
      <div key={p.i}>
        {lines.map((ln, idx) => {
          if (!ln.trim()) return <div key={idx} className="h-2" />;
          if (ln.startsWith('### ')) return <div key={idx} className="font-semibold text-pri mt-2">{inline(ln.slice(4))}</div>;
          if (ln.startsWith('- ')) return <div key={idx} className="flex gap-2"><span className="text-muted">•</span><span className="flex-1">{inline(ln.slice(2))}</span></div>;
          return <div key={idx} className="leading-relaxed">{inline(ln)}</div>;
        })}
      </div>
    );
  });
};

const ChatMessage = ({ role, text, streaming }) => {
  if (role === 'user') {
    return (
      <div className="flex justify-end fade-in">
        <div className="max-w-[78%] msg-user rounded-2xl rounded-tr-md px-4 py-3 text-[14px] text-pri">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3 fade-in">
      <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
           style={{ background: 'rgba(59,130,246,0.10)', borderColor: 'rgba(59,130,246,0.32)', color: '#60a5fa' }}>
        <Icon.Bot size={16} />
      </div>
      <div className="max-w-[82%]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#60a5fa' }}>AI Auditor</span>
          <span className="text-[10px] text-muted font-mono">· llama-3.1-70b · via Groq</span>
        </div>
        <div className="msg-ai rounded-2xl rounded-tl-md px-4 py-3 text-[14px] text-pri space-y-0.5">
          {renderMarkdownLite(text)}
          {streaming && <span className="inline-block w-[2px] h-[14px] bg-[#60a5fa] align-middle ml-0.5 cursor-blink" />}
        </div>
      </div>
    </div>
  );
};

// ── Sidebar + Topbar (layout chrome) ──────────────────────────
const Sidebar = ({ current, onNav }) => {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: Icon.LayoutDashboard },
    { key: 'datasets',  label: 'Datasets',  icon: Icon.Database, badge: DATASETS.length },
    { key: 'insights',  label: 'Insights',  icon: Icon.BarChart3 },
    { key: 'auditor',   label: 'AI Auditor', icon: Icon.Bot, hero: true },
    { key: 'settings',  label: 'Settings',  icon: Icon.Settings },
  ];
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col z-20"
           style={{ background: '#0c0c14', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-6 border-b border-app">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center border"
               style={{ background: 'rgba(249,115,22,0.10)', borderColor: 'rgba(249,115,22,0.40)', color: 'var(--accent)' }}>
            <Icon.ShieldAlert size={18}/>
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">ConceptLeak</div>
            <div className="text-[10px] text-muted font-mono">v2.0 · leak‑scan</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Workspace</div>
        {items.slice(0, 3).map(it => (
          <NavItem key={it.key} item={it} active={current === it.key} onClick={() => onNav(it.key)} />
        ))}
        <div className="px-2 pt-4 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Intelligence</div>
        {items.slice(3, 4).map(it => (
          <NavItem key={it.key} item={it} active={current === it.key} onClick={() => onNav(it.key)} />
        ))}
        <div className="px-2 pt-4 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">System</div>
        {items.slice(4).map(it => (
          <NavItem key={it.key} item={it} active={current === it.key} onClick={() => onNav(it.key)} />
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-app">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-hover transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
               style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>MR</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate">Mira Rao</div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                    style={{ background: 'rgba(136,136,170,0.12)', color: '#aaa' }}>FREE PLAN</span>
            </div>
          </div>
          <Icon.ChevronRight size={14} className="text-muted"/>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ item, active, onClick }) => {
  const I = item.icon;
  const isHero = item.hero;
  return (
    <button
      onClick={onClick}
      className={cx(
        'relative group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors text-left',
        active ? 'nav-active text-pri' : 'text-sec hover:text-pri hover:bg-hover'
      )}
      style={active ? {
        background: isHero ? 'rgba(59,130,246,0.10)' : 'rgba(249,115,22,0.08)',
      } : (isHero ? { color: '#a5c4ff' } : {})}
    >
      <span className="shrink-0" style={{ color: active ? (isHero ? '#60a5fa' : 'var(--accent)') : (isHero ? '#60a5fa' : undefined) }}>
        <I size={16}/>
      </span>
      <span className="font-medium flex-1">{item.label}</span>
      {isHero && !active && (
        <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>AI</span>
      )}
      {item.badge != null && (
        <span className="text-[10px] tabular font-mono text-muted">{item.badge}</span>
      )}
    </button>
  );
};

const Topbar = ({ title, breadcrumb, onUpload }) => {
  return (
    <header
      className="sticky top-0 z-10 h-[60px] flex items-center justify-between px-8"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <div className="flex items-center gap-2 text-[11px] text-muted font-mono uppercase tracking-[0.14em] mb-0.5">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Icon.ChevronRight size={11}/>}
              <span className={i === breadcrumb.length - 1 ? 'text-sec' : ''}>{b}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="text-[18px] font-bold tracking-tight">{title}</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-md border border-app hover:border-app-strong flex items-center justify-center text-sec hover:text-pri transition-colors">
          <Icon.Bell size={16}/>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>
        <button onClick={onUpload}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-md font-semibold text-[13px] text-black hover:brightness-110 transition"
          style={{ background: 'var(--accent)' }}>
          <Icon.Upload size={15}/> Upload Dataset
        </button>
      </div>
    </header>
  );
};

Object.assign(window, {
  cx, RiskBadge, RiskScore, RiskDistributionBar, RiskScoreBar, CodeBlock,
  FindingCard, ColumnHealthGrid, StatCard, DatasetCard, ChatMessage,
  Sidebar, Topbar, renderMarkdownLite
});
