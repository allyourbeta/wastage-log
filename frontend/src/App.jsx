import { useState } from 'react';
import { formatDateLong } from './constants.js';
import TallyGrid from './components/TallyGrid.jsx';
import TodayLog from './components/TodayLog.jsx';
import Reports from './components/Reports.jsx';
import ManageItems from './components/ManageItems.jsx';

const TABS = [
  { id: 'tally', label: 'Log', emoji: '📋' },
  { id: 'today', label: 'Today', emoji: '📝' },
  { id: 'reports', label: 'Reports', emoji: '📊' },
  { id: 'manage', label: 'Manage', emoji: '⚙️' },
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
      {/* Header - full width */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-cafe-icon">☕</span>
          <div>
            <h1>Edmonds Cafe</h1>
            <div className="subtitle">Wastage Log</div>
          </div>
        </div>
        <div className="header-right">
          <div className="date-display">{formatDateLong(new Date())}</div>
          {dailyTotal > 0 && (
            <div className="header-badge">{dailyTotal} logged</div>
          )}
        </div>
      </header>

      {/* Tab navigation - centered within full-width sticky bar */}
      <div className="tab-nav-wrap">
        <nav className="tab-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-emoji">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </nav>
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
