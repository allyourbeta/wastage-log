import { useState } from 'react';
import * as api from '../api.js';
import { getReasonLabel, getReasonEmoji, REASONS } from '../constants.js';
import ReportCards from './ReportCards.jsx';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const VIEWS = ['item', 'reason', 'vendor', 'day'];
const VIEW_LABELS = { item: '📦 By Item', reason: '🏷️ By Reason', vendor: '🏪 By Vendor', day: '📅 By Day' };

/* Bar colors per section */
const BAR_COLORS = {
  item: { bar: '#5B8DEF', bg: '#EBF1FD' },
  vendor: { bar: '#34A853', bg: '#E6F5ED' },
  day: { bar: '#CD853F', bg: '#FEF3E8' },
};

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('item');

  const loadReport = async () => {
    setLoading(true);
    try {
      setReport(await api.getSummaryReport(startDate, endDate));
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.open(api.getCSVExportUrl(startDate, endDate), '_blank');
  };

  /* Compute KPI stats */
  const totalWaste = report?.by_item?.reduce((s, r) => s + r.total_quantity, 0) || 0;
  const daySpan = Math.max(1, Math.ceil(
    (new Date(endDate) - new Date(startDate)) / 86400000
  ) + 1);
  const dailyAvg = totalWaste > 0 ? (totalWaste / daySpan).toFixed(1) : '0';
  const worstItem = report?.by_item?.[0];
  const worstDay = report?.by_dow?.reduce(
    (max, d) => (d.total_quantity > (max?.total_quantity || 0) ? d : max), null
  );

  return (
    <div className="rpt-container">
      {/* Date controls */}
      <div className="rpt-controls">
        <input type="date" value={startDate}
          onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate}
          onChange={(e) => setEndDate(e.target.value)} />
        <button className="rpt-btn-run" onClick={loadReport} disabled={loading}>
          {loading ? 'Loading…' : 'Run Report'}
        </button>
        {report && (
          <button className="rpt-btn-csv" onClick={handleExportCSV}>
            ⬇ CSV
          </button>
        )}
      </div>

      {/* Empty state */}
      {!report && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">Select dates and run a report</div>
          <div className="empty-state-sub">
            See wastage breakdowns by item, reason, vendor, and day
          </div>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading report…</div>
        </div>
      )}

      {report && (
        <>
          {/* KPI stat cards */}
          <ReportCards
            totalWaste={totalWaste}
            dailyAvg={dailyAvg}
            worstItem={worstItem}
            worstDay={worstDay ? DAY_NAMES[worstDay.dow] : null}
            worstDayQty={worstDay?.total_quantity}
          />

          {/* View pill toggles */}
          <div className="rpt-pills">
            {VIEWS.map((v) => (
              <button key={v}
                className={`rpt-pill ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}
              >{VIEW_LABELS[v]}</button>
            ))}
          </div>

          {/* Section content */}
          <div className="rpt-section-card">
            {view === 'reason' && (
              <ReasonSection data={report.by_reason} />
            )}
            {view === 'item' && (
              <BarSection data={report.by_item} labelKey="item_name"
                colors={BAR_COLORS.item} />
            )}
            {view === 'vendor' && (
              <BarSection data={report.by_vendor} labelKey="vendor_name"
                colors={BAR_COLORS.vendor} />
            )}
            {view === 'day' && (
              <DayOfWeekSection byDow={report.by_dow || []}
                byDowItem={report.by_dow_item || []} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* === Bar Section (items, vendors) === */
function BarSection({ data, labelKey, colors }) {
  const max = data?.[0]?.total_quantity || 1;
  if (!data || data.length === 0) return <EmptySection />;

  return data.map((row) => {
    const pct = Math.max(4, (row.total_quantity / max) * 100);
    return (
      <div key={row[labelKey]} className="rpt-bar-row">
        <div className="rpt-bar-label">{row[labelKey]}</div>
        <div className="rpt-bar-track" style={{ background: colors.bg }}>
          <div className="rpt-bar-fill" style={{
            width: `${pct}%`, background: colors.bar,
          }}>
            <span className="rpt-bar-value">{row.total_quantity}</span>
          </div>
        </div>
      </div>
    );
  });
}

/* === Reason Section (colored by reason) === */
function ReasonSection({ data }) {
  const total = data?.reduce((s, r) => s + r.total_quantity, 0) || 1;
  if (!data || data.length === 0) return <EmptySection />;

  return data.map((row) => {
    const r = REASONS[row.reason];
    const pct = Math.max(4, (row.total_quantity / total) * 100);
    return (
      <div key={row.reason} className="rpt-bar-row">
        <div className="rpt-bar-label">
          {getReasonEmoji(row.reason)} {getReasonLabel(row.reason)}
        </div>
        <div className="rpt-bar-track" style={{ background: r?.bg || '#f0f0f0' }}>
          <div className="rpt-bar-fill" style={{
            width: `${pct}%`, background: r?.color || '#999',
          }}>
            <span className="rpt-bar-value">{row.total_quantity}</span>
          </div>
        </div>
      </div>
    );
  });
}

/* === Day of Week Section === */
function DayOfWeekSection({ byDow, byDowItem }) {
  const maxDow = Math.max(...byDow.map((d) => d.total_quantity), 1);

  const topItemsByDay = {};
  byDowItem.forEach((row) => {
    if (!topItemsByDay[row.dow]) topItemsByDay[row.dow] = [];
    if (topItemsByDay[row.dow].length < 3) {
      topItemsByDay[row.dow].push(row);
    }
  });

  if (byDow.length === 0) return <EmptySection />;

  return DAY_NAMES.map((name, idx) => {
    const data = byDow.find((d) => d.dow === idx);
    const qty = data?.total_quantity || 0;
    const pct = Math.max(qty > 0 ? 4 : 0, (qty / maxDow) * 100);
    const isWorst = qty === maxDow && qty > 0;
    const topItems = topItemsByDay[idx] || [];

    return (
      <div key={idx} className="rpt-bar-row">
        <div className="rpt-bar-label" style={{
          fontWeight: isWorst ? 900 : 700,
          color: isWorst ? '#c0392b' : undefined,
        }}>
          {name} {isWorst && '🔴'}
        </div>
        <div className="rpt-bar-track" style={{ background: BAR_COLORS.day.bg }}>
          <div className="rpt-bar-fill" style={{
            width: `${pct}%`,
            background: isWorst ? '#c0392b' : BAR_COLORS.day.bar,
          }}>
            {qty > 0 && <span className="rpt-bar-value">{qty}</span>}
          </div>
        </div>
        {topItems.length > 0 && (
          <div className="rpt-bar-sub">
            {topItems.map((ti) => `${ti.item_name} (${ti.total_quantity})`).join(' · ')}
          </div>
        )}
      </div>
    );
  });
}

function EmptySection() {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: '#bbb', fontWeight: 700 }}>
      No data for this period
    </div>
  );
}
