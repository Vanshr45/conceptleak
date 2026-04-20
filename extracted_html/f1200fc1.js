// App shell: routing, layout, state.

const PAGE_META = {
  dashboard: { title: 'Dashboard', crumb: ['ConceptLeak', 'Dashboard'] },
  datasets:  { title: 'Datasets',  crumb: ['ConceptLeak', 'Datasets'] },
  insights:  { title: 'Insights',  crumb: ['ConceptLeak', 'Insights', 'Leakage audit'] },
  auditor:   { title: 'AI Auditor', crumb: ['ConceptLeak', 'AI Auditor'] },
  settings:  { title: 'Settings', crumb: ['ConceptLeak', 'Settings'] },
};

const App = () => {
  const [page, setPage] = React.useState(() => localStorage.getItem('cl:page') || 'dashboard');
  const [activeDatasetId, setActiveDatasetIdState] = React.useState(() => localStorage.getItem('cl:dataset') || DATASETS[0].id);
  const [auditorSeed, setAuditorSeed] = React.useState(null);

  React.useEffect(() => { localStorage.setItem('cl:page', page); }, [page]);
  const setActiveDataset = (id) => { setActiveDatasetIdState(id); localStorage.setItem('cl:dataset', id); };

  const activeDataset = DATASETS.find(d => d.id === activeDatasetId) || DATASETS[0];
  const meta = PAGE_META[page] || PAGE_META.dashboard;

  const onUploadCTA = () => setPage('datasets');

  return (
    <div className="min-h-screen">
      <Sidebar current={page} onNav={setPage}/>
      <div className="ml-[220px] flex flex-col min-h-screen">
        <Topbar title={meta.title} breadcrumb={meta.crumb} onUpload={onUploadCTA}/>
        <main className="flex-1">
          {page === 'dashboard' && (
            <Dashboard onNav={setPage} setActiveDataset={setActiveDataset}/>
          )}
          {page === 'datasets' && (
            <Datasets onNav={setPage} setActiveDataset={setActiveDataset}/>
          )}
          {page === 'insights' && (
            <Insights dataset={activeDataset} onNav={setPage}
                      setActiveDataset={setActiveDataset}
                      setAuditorSeed={setAuditorSeed}/>
          )}
          {page === 'auditor' && (
            <Auditor dataset={activeDataset} seed={auditorSeed}
                     setActiveDataset={setActiveDataset} onNav={setPage}
                     clearSeed={() => setAuditorSeed(null)}/>
          )}
          {page === 'settings' && <SettingsStub/>}
        </main>
      </div>
    </div>
  );
};

const SettingsStub = () => (
  <div className="p-8 max-w-[1400px]">
    <div className="bg-surface border border-app rounded-2xl p-10 text-center">
      <Icon.Settings size={28} className="mx-auto mb-3 text-muted"/>
      <div className="text-[15px] text-sec">Settings are outside the scope of this prototype.</div>
      <div className="text-[12px] text-muted mt-2 font-mono">org · api keys · leakage rubric · integrations</div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
