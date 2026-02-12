import { useState } from 'react';
import { formatDateLong } from './constants.js';
import TallyGrid from './components/TallyGrid.jsx';
import TodayLog from './components/TodayLog.jsx';
import Reports from './components/Reports.jsx';
import ManageItems from './components/ManageItems.jsx';

const TABS = [
  { id: 'tally', label: 'LOG' },
  { id: 'today', label: 'TODAY' },
  { id: 'reports', label: 'REPORTS' },
  { id: 'manage', label: 'MANAGE' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('tally');
  const [toast, setToast] = useState(null);
  const [dailyTotal, setDailyTotal] = useState(0);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="app-container">
      {/* Header — gradient slab */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-cafe-icon">☕</span>
          <div>
            <h1>EDMONDS CAFE</h1>
            <div className="subtitle">WASTAGE LOG</div>
          </div>
        </div>
        <div className="header-right">
          <div className="date-display">
            {formatDateLong(new Date()).toUpperCase()}
          </div>
          <div className="header-badge">
            {dailyTotal > 0 ? `${dailyTotal} LOGGED` : '0'}
          </div>
        </div>
      </header>

      {/* Tabs — filled segmented control */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-seg ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tally' && (
        <TallyGrid onToast={showToast} onTotalChange={setDailyTotal} />
      )}
      {activeTab === 'today' && <TodayLog onToast={showToast} />}
      {activeTab === 'reports' && <Reports />}
      {activeTab === 'manage' && <ManageItems onToast={showToast} />}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
