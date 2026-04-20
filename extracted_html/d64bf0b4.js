// Dashboard page — stat row, recent analysis hero, dataset list.

const Dashboard = ({ onNav, onSelectDataset, setActiveDataset }) => {
  const hero = DATASETS[0]; // heart.csv, CRITICAL
  const r = RISK[hero.severity];

  const open = (d, target) => {
    setActiveDataset(d.id);
    onNav(target);
  };

  return (
    <div className="p-8 max-w-[1400px] space-y-8">
      {/* Stats row */}
      <section className="grid grid-cols-4 gap-4">
        <StatCard label="Total Datasets" value={STATS.totalDatasets} sublabel="datasets analyzed this month" icon={Icon.Database}/>
        <StatCard label="Critical Issues" value={STATS.criticalIssues} sublabel="across 1 dataset" tone="critical" icon={Icon.AlertTriangle} pulse={STATS.criticalIssues > 0}/>
        <StatCard label="Avg Risk Score" value={STATS.avgRiskScore} sublabel="of 100 · portfolio mean" tone="accent" icon={Icon.BarChart3}/>
        <StatCard label="Columns Scanned" value={STATS.columnsScanned.toLocaleString()} sublabel="across all datasets" icon={Icon.Hash}/>
      </section>

      {/* Hero Recent Analysis */}
      <section className="bg-surface border border-app rounded-2xl overflow-hidden relative">
        {/* Diagonal threat-level stripe */}
        <div className="absolute top-0 right-0 w-[480px] h-full opacity-60 pointer-events-none"
             style={{ background: `radial-gradient(circle at top right, ${r.bg}, transparent 60%)` }}/>

        <div className="p-8 flex items-start gap-10 relative">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">Most recent analysis</span>
              <span className="w-1 h-1 rounded-full bg-muted"/>
              <span className="text-[11px] text-sec font-mono">{hero.uploaded}</span>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <Icon.FileSpreadsheet size={20} style={{color: r.color}}/>
              <div className="font-mono text-[22px] font-semibold">{hero.name}</div>
              <RiskBadge level={hero.severity} size="md"/>
            </div>

            <p className="text-sec text-[14.5px] max-w-xl leading-relaxed mb-6">
              This dataset has <span className="text-pri font-semibold">3 critical issues</span> that must be resolved before training.
              A post‑event timestamp and a direct re‑encoding of the target are the most urgent.
            </p>

            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold mb-3">Finding distribution</div>
              <RiskDistributionBar breakdown={hero.breakdown}/>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => open(hero, 'insights')}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-md font-semibold text-[13px] text-black"
                style={{ background: 'var(--accent)' }}>
                View Full Report <Icon.ArrowRight size={14}/>
              </button>
              <button onClick={() => open(hero, 'auditor')}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-md font-semibold text-[13px] border"
                style={{ color: '#93c5fd', borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>
                <Icon.Bot size={14}/> Discuss with AI
              </button>
            </div>
          </div>

          {/* Giant score */}
          <div className="shrink-0 w-[280px] flex items-center justify-center pt-4">
            <RiskScore value={hero.score} level={hero.severity} size="lg"/>
          </div>
        </div>

        {/* Mini grid of critical findings */}
        <div className="border-t border-app p-6 grid grid-cols-3 gap-4">
          {hero.findings.filter(f => f.severity === 'CRITICAL').map(f => {
            const fr = RISK[f.severity];
            const lt = LEAKAGE_TYPES[f.type];
            return (
              <div key={f.id}
                   className="rounded-lg border border-app p-3 flex items-start gap-3 hover:border-app-strong transition cursor-pointer"
                   onClick={() => open(hero, 'insights')}>
                <div className="w-1 self-stretch rounded-full" style={{ background: fr.color }}/>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted font-semibold mb-1">{lt.label}</div>
                  <div className="font-mono text-[13px] text-pri truncate">{f.column}</div>
                </div>
                <span className="font-mono text-[13px] tabular" style={{color: fr.color}}>{f.score}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent datasets table */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-1">Recent datasets</div>
            <div className="text-[16px] font-semibold text-pri">All analyzed files</div>
          </div>
          <button onClick={() => onNav('datasets')}
                  className="text-[12px] text-sec hover:text-pri flex items-center gap-1">
            Manage datasets <Icon.ArrowUpRight size={12}/>
          </button>
        </div>

        <div className="bg-surface border border-app rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_2.5fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-app text-[10px] uppercase tracking-[0.14em] text-muted font-mono font-semibold">
            <div>Dataset</div>
            <div className="text-right">Rows</div>
            <div className="text-right">Columns</div>
            <div>Risk score</div>
            <div>Severity</div>
            <div>Uploaded</div>
            <div></div>
          </div>
          {DATASETS.map(d => {
            const dr = RISK[d.severity];
            return (
              <div key={d.id}
                   className="group grid grid-cols-[2fr_1fr_1fr_2.5fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center border-b border-app last:border-b-0 hover:bg-hover transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon.FileSpreadsheet size={16} style={{color: dr.color}}/>
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] text-pri truncate">{d.name}</div>
                    <div className="text-[11px] text-muted">{d.size}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[13px] tabular text-sec">{d.rows.toLocaleString()}</div>
                <div className="text-right font-mono text-[13px] tabular text-sec">{d.columns}</div>
                <div><RiskScoreBar value={d.score} level={d.severity}/></div>
                <div><RiskBadge level={d.severity} size="xs"/></div>
                <div className="text-[11px] text-muted font-mono whitespace-nowrap">{d.uploaded}</div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => open(d, 'insights')}
                    className="text-[11px] px-2 py-1 rounded border border-app hover:border-app-strong text-sec hover:text-pri">Analyze</button>
                  <button onClick={() => open(d, 'auditor')}
                    className="text-[11px] px-2 py-1 rounded border"
                    style={{ color: '#93c5fd', borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>Chat</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

window.Dashboard = Dashboard;
