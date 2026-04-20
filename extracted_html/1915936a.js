// Insights page — security-audit style leakage report.

const Donut = ({ breakdown, size = 180 }) => {
  const keys = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAN'];
  const total = keys.reduce((a, k) => a + (breakdown[k] || 0), 0);
  const r = size / 2 - 14;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14"/>
        {keys.map((k) => {
          const v = breakdown[k] || 0;
          if (!v) return null;
          const len = (v / total) * C;
          const el = (
            <circle key={k} cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={RISK[k].color} strokeWidth="14"
                    strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
                    strokeLinecap="butt"/>
          );
          offset += len + 2;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Findings</div>
        <div className="text-3xl font-bold tabular">{total - (breakdown.CLEAN || 0)}</div>
        <div className="text-[11px] font-mono text-sec">of {total} columns</div>
      </div>
    </div>
  );
};

const Insights = ({ dataset, onNav, setActiveDataset, setAuditorSeed }) => {
  const d = dataset || DATASETS[0];
  const r = RISK[d.severity];
  const findings = d.findings || [];
  const columns = d.columnList || [];

  const [askChat, setAskChat] = React.useState(null);

  const scrollToFinding = (col) => {
    const el = document.getElementById(`finding-${col.name}`);
    if (el) el.scrollIntoView ? window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' }) : null;
    // We avoid scrollIntoView per guidelines; use window.scrollTo.
    const y = el?.getBoundingClientRect().top + window.scrollY - 100;
    if (y != null) window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const askAI = (f) => {
    setAuditorSeed({ datasetId: d.id, finding: f });
    onNav('auditor');
  };

  const counts = findings.reduce((a, f) => { a[f.severity] = (a[f.severity] || 0) + 1; return a; }, {});

  return (
    <div className="p-8 max-w-[1400px] space-y-6">
      {/* Header */}
      <section className="bg-surface border border-app rounded-2xl p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted uppercase tracking-[0.16em] mb-2">
              <Icon.ShieldAlert size={12}/>
              Leakage audit · report #CL‑0482
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Icon.FileSpreadsheet size={22} style={{color: r.color}}/>
              <div className="font-mono text-[22px] font-semibold">{d.name}</div>
            </div>
            <div className="flex items-center gap-5 text-[12px] font-mono text-sec">
              <span><span className="text-pri tabular">{d.rows.toLocaleString()}</span> rows</span>
              <span className="w-1 h-1 rounded-full bg-muted"/>
              <span><span className="text-pri tabular">{d.columns}</span> cols</span>
              <span className="w-1 h-1 rounded-full bg-muted"/>
              <span>{d.size}</span>
              <span className="w-1 h-1 rounded-full bg-muted"/>
              <span>target: <span className="text-pri" style={{color:'#fde68a'}}>{d.targetCol || '—'}</span></span>
              <span className="w-1 h-1 rounded-full bg-muted"/>
              <span>Generated 2026‑04‑18 · 14:08 UTC</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-1">Threat level</div>
              <RiskBadge level={d.severity} size="md"/>
            </div>
            <div className="border-l border-app pl-6">
              <RiskScore value={d.score} level={d.severity} size="md"/>
            </div>
            <button className="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-app hover:border-app-strong text-[12px] font-semibold text-pri">
              <Icon.Download size={13}/> Export Report
            </button>
          </div>
        </div>
      </section>

      {/* Overview: donut + summary */}
      <section className="grid grid-cols-[auto_1fr] gap-6">
        <div className="bg-surface border border-app rounded-2xl p-6 flex items-center gap-6">
          <Donut breakdown={d.breakdown}/>
          <div className="space-y-2 min-w-[180px]">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAN'].map(k => (
              <div key={k} className="flex items-center justify-between gap-4 text-[12px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm" style={{background: RISK[k].color}}/>
                  <span className="uppercase tracking-wider text-sec">{RISK[k].label}</span>
                </div>
                <span className="tabular text-pri">{d.breakdown[k] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-app rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-2">Auditor summary</div>
            <div className="text-[18px] leading-snug text-pri max-w-2xl" style={{textWrap:'pretty'}}>
              This dataset has <span style={{color: RISK.CRITICAL.color}} className="font-semibold">{counts.CRITICAL || 0} critical issues</span> that <u className="decoration-dotted">must</u> be resolved before training.
              Two columns directly re‑encode the target; one post‑event timestamp leaks future information.
              Estimated offline‑to‑production AUC drop: <span className="font-mono text-pri">0.34</span>.
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {['ID','PII','TARGET','TEMPORAL'].map(t => {
              const n = findings.filter(f => f.type === t).length;
              const lt = LEAKAGE_TYPES[t];
              const LI = Icon[lt.icon];
              return (
                <div key={t} className="rounded-lg border border-app p-3 bg-elevated">
                  <div className="flex items-center gap-2 mb-2 text-sec">
                    <LI size={13}/>
                    <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">{lt.label}</span>
                  </div>
                  <div className="text-2xl font-bold tabular text-pri">{n}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Column health grid */}
      <section className="bg-surface border border-app rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-1">Column health</div>
            <div className="text-[14px] text-sec">Click a chip to jump to its finding. Clean columns are collapsed.</div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-sec">
            {['CRITICAL','HIGH','MEDIUM','LOW','CLEAN'].map(k => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{background: RISK[k].color}}/>
                {RISK[k].label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
        <ColumnHealthGrid columns={columns} onClickColumn={(c) => {
          if (c.severity !== 'CLEAN') scrollToFinding(c);
        }}/>
      </section>

      {/* Findings list */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-1">Findings</div>
            <div className="text-[16px] font-semibold text-pri">{findings.length} issues · sorted by severity</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[11px] font-mono text-sec hover:text-pri border border-app hover:border-app-strong rounded-md px-2.5 h-7 inline-flex items-center gap-1.5">
              <Icon.Filter size={11}/> Filter
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {findings.map(f => (
            <FindingCard key={f.id} finding={f} onAsk={askAI}/>
          ))}
        </div>
      </section>
    </div>
  );
};

window.Insights = Insights;
