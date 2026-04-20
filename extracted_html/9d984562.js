// Datasets page — upload zone (idle/scanning/complete) + dataset list.

const UploadZone = ({ onComplete }) => {
  // state: 'idle' | 'scanning' | 'complete'
  const [state, setState] = React.useState('idle');
  const [fileName, setFileName] = React.useState('heart.csv');
  const [stepsDone, setStepsDone] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [scanFlash, setScanFlash] = React.useState(false);

  const STEPS = [
    { label: 'Parsing 1,025 rows', ms: 550 },
    { label: 'Detecting column types', ms: 700 },
    { label: 'Running correlation analysis…', ms: 900, spin: true },
    { label: 'Scoring leakage risk…', ms: 900, spin: true },
  ];

  const runScan = (name) => {
    setFileName(name || 'heart.csv');
    setState('scanning');
    setStepsDone(0); setProgress(0);
    let elapsed = 0; const total = STEPS.reduce((a, s) => a + s.ms, 0);
    STEPS.forEach((s, i) => {
      elapsed += s.ms;
      setTimeout(() => {
        setStepsDone(i + 1);
        setProgress(Math.round((elapsed / total) * 100));
      }, elapsed);
    });
    setTimeout(() => {
      setScanFlash(true);
      setState('complete');
      setTimeout(() => setScanFlash(false), 800);
      onComplete?.();
    }, total + 200);
  };

  const reset = () => { setState('idle'); setStepsDone(0); setProgress(0); };

  if (state === 'complete') {
    const d = DATASETS[0];
    return (
      <div className="slide-up bg-surface border border-app rounded-2xl p-7 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center"
               style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: 'var(--low)' }}>
            <Icon.CheckCircle size={18}/>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted font-semibold">Scan complete</div>
            <div className="font-mono text-[15px]">{fileName} · 1,025 rows · 20 columns</div>
          </div>
          <button onClick={reset} className="ml-auto text-[12px] text-sec hover:text-pri flex items-center gap-1">
            <Icon.Upload size={13}/> Upload another
          </button>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-8 items-center">
          <RiskScore value={d.score} level={d.severity} size="md"/>
          <div>
            <div className="text-[12px] text-muted uppercase tracking-[0.16em] mb-2 font-semibold">8 findings · 3 critical</div>
            <RiskDistributionBar breakdown={d.breakdown}/>
            <div className="flex items-center gap-2 mt-5">
              <button className="inline-flex items-center gap-2 px-4 h-9 rounded-md font-semibold text-[13px] text-black"
                      style={{ background: 'var(--accent)' }}>
                View Report <Icon.ArrowRight size={13}/>
              </button>
              <button className="inline-flex items-center gap-2 px-4 h-9 rounded-md font-semibold text-[13px] border"
                style={{ color: '#93c5fd', borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }}>
                <Icon.Bot size={13}/> Ask the auditor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'scanning') {
    return (
      <div className={cx("relative rounded-2xl border-2 border-dashed overflow-hidden", scanFlash && 'scan-flash')}
           style={{ borderColor: 'rgba(249,115,22,0.45)', background: 'rgba(249,115,22,0.03)', minHeight: 280 }}>
        <div className="scan-line" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <Icon.Search size={20} style={{color: 'var(--accent)'}}/>
              <span className="absolute inset-0 rounded-full ring-pulse" style={{ border: '2px solid var(--accent)' }}/>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold">Scanning</div>
              <div className="font-mono text-[15px]">Scanning {fileName}…</div>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            {STEPS.map((s, i) => {
              const visible = i < stepsDone;
              const active  = i === stepsDone;
              if (!visible && !active) return <div key={i} className="h-6"/>;
              const done = visible;
              return (
                <div key={i} className="fade-in flex items-center gap-2.5 text-[13px] font-mono">
                  {done ? (
                    <Icon.Check size={14} style={{color: 'var(--low)'}}/>
                  ) : (
                    <Icon.Loader size={14} style={{color: 'var(--accent)'}} className="spin"/>
                  )}
                  <span style={{ color: done ? 'var(--text-primary)' : 'var(--accent)' }}>
                    {done ? '✓' : '⟳'} {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#151520]">
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }}/>
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="rounded-2xl border-2 border-dashed p-10 text-center relative"
         style={{ borderColor: 'var(--border-strong)', background: 'rgba(255,255,255,0.008)' }}
         onDragOver={(e)=>e.preventDefault()}
         onDrop={(e)=>{e.preventDefault(); const f=e.dataTransfer.files?.[0]; runScan(f?.name);}}>
      <div className="float-y inline-flex mb-4 w-16 h-16 rounded-2xl items-center justify-center"
           style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)', color: 'var(--accent)' }}>
        <Icon.UploadCloud size={30}/>
      </div>
      <div className="text-[20px] font-bold tracking-tight mb-1">Drop your dataset here</div>
      <div className="text-[13px] text-sec font-mono mb-5">.csv and .xlsx · Max 10MB · local processing</div>
      <button onClick={() => runScan('heart.csv')}
        className="inline-flex items-center gap-2 px-5 h-10 rounded-md font-semibold text-[13px] text-black"
        style={{ background: 'var(--accent)' }}>
        <Icon.Upload size={14}/> Browse Files
      </button>
      <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-muted font-mono">
        <span className="flex items-center gap-1"><Icon.Lock size={11}/> client‑side scan</span>
        <span className="w-1 h-1 rounded-full bg-muted"/>
        <span className="flex items-center gap-1"><Icon.Zap size={11}/> ~2.8s avg</span>
        <span className="w-1 h-1 rounded-full bg-muted"/>
        <span>pandas + ConceptLeak engine</span>
      </div>
    </div>
  );
};

const Datasets = ({ onNav, setActiveDataset }) => {
  const [sort, setSort] = React.useState('date');
  const [query, setQuery] = React.useState('');

  const sorted = React.useMemo(() => {
    const list = DATASETS.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
    const byScore = (a, b) => b.score - a.score;
    const byName  = (a, b) => a.name.localeCompare(b.name);
    return [...list].sort(sort === 'score' ? byScore : sort === 'name' ? byName : () => 0);
  }, [sort, query]);

  const open = (d, target) => { setActiveDataset(d.id); onNav(target); };

  return (
    <div className="p-8 max-w-[1400px] space-y-8">
      <UploadZone />

      {/* List */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-1">Your datasets</div>
            <div className="text-[16px] font-semibold text-pri">{DATASETS.length} files analyzed · total 420,873 rows</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon.Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"/>
              <input
                value={query} onChange={e=>setQuery(e.target.value)}
                placeholder="Filter by filename…"
                className="bg-surface border border-app rounded-md pl-8 pr-3 h-9 text-[12.5px] w-64 font-mono text-pri placeholder:text-muted focus:border-app-strong outline-none"
              />
            </div>
            <div className="flex items-center gap-1 bg-surface border border-app rounded-md p-1 text-[11px] font-mono">
              {['date','score','name'].map(k => (
                <button key={k} onClick={() => setSort(k)}
                  className={cx('px-2.5 h-7 rounded uppercase tracking-wider', sort===k ? 'text-pri' : 'text-sec hover:text-pri')}
                  style={sort===k ? { background: 'var(--bg-elevated)' } : {}}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {sorted.map(d => (
            <DatasetCard key={d.id} d={d}
                         onView={() => open(d, 'insights')}
                         onChat={() => open(d, 'auditor')}/>
          ))}
        </div>
      </section>
    </div>
  );
};

window.Datasets = Datasets;
