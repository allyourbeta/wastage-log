import { useState } from 'react';
import * as api from '../api.js';
import { getReasonLabel, getReasonEmoji, REASONS } from '../constants.js';

export default function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

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

  if (!report && !loading) {
    return (
      <div className="reports-container">
        <div className="report-controls">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button onClick={loadReport}>Run Report</button>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">Select dates and run a report</div>
          <div className="empty-state-sub">See wastage breakdowns by item, reason, and vendor</div>
        </div>
      </div>
    );
  }

  const maxByItem = report?.by_item?.[0]?.total_quantity || 1;
  const maxByVendor = report?.by_vendor?.[0]?.total_quantity || 1;
  const totalReason = report?.by_reason?.reduce((s, r) => s + r.total_quantity, 0) || 1;

  return (
    <div className="reports-container">
      <div className="report-controls">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={loadReport} disabled={loading}>
          {loading ? 'Loading...' : 'Run Report'}
        </button>
        {report && (
          <button onClick={handleExportCSV} style={{ background: '#2d8659' }}>
            Export CSV
          </button>
        )}
      </div>

      {report && (
        <>
          <div className="report-section">
            <h3>By Reason</h3>
            {report.by_reason.map((row) => {
              const r = REASONS[row.reason];
              return (
                <div key={row.reason} className="report-row">
                  <div className="report-row-top">
                    <span className="report-row-label">
                      {getReasonEmoji(row.reason)} {getReasonLabel(row.reason)}
                    </span>
                    <span className="report-row-value">{row.total_quantity}</span>
                  </div>
                  <div className="report-bar" style={{ background: r?.bg || '#f0f0f0' }}>
                    <div className="report-bar-fill" style={{
                      width: `${(row.total_quantity / totalReason) * 100}%`,
                      background: r?.color || '#999',
                    }} />
                  </div>
                </div>
              );
            })}
            {report.by_reason.length === 0 && (
              <div className="report-row">
                <div className="report-row-top">
                  <span className="report-row-label" style={{ color: '#bbb' }}>No data</span>
                </div>
              </div>
            )}
          </div>

          <div className="report-section">
            <h3>By Item</h3>
            {report.by_item.map((row) => (
              <div key={row.item_name} className="report-row">
                <div className="report-row-top">
                  <span className="report-row-label">{row.item_name}</span>
                  <span className="report-row-value">{row.total_quantity}</span>
                </div>
                <div className="report-bar">
                  <div className="report-bar-fill" style={{
                    width: `${(row.total_quantity / maxByItem) * 100}%`,
                    background: '#d4722e',
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div className="report-section">
            <h3>By Vendor</h3>
            {report.by_vendor.map((row) => (
              <div key={row.vendor_name} className="report-row">
                <div className="report-row-top">
                  <span className="report-row-label">{row.vendor_name}</span>
                  <span className="report-row-value">{row.total_quantity}</span>
                </div>
                <div className="report-bar" style={{ background: '#e6f5ed' }}>
                  <div className="report-bar-fill" style={{
                    width: `${(row.total_quantity / maxByVendor) * 100}%`,
                    background: '#2d8659',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
