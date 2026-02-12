import { useState, useEffect } from 'react';
import * as api from '../api.js';
import { getReasonLabel, getReasonEmoji, getReasonBg } from '../constants.js';

export default function TodayLog({ onToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await api.getTodayLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const handleDelete = async (logId, itemName) => {
    try {
      await api.deleteLog(logId);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      onToast?.(`Removed ${itemName}`);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const totalItems = logs.reduce((sum, l) => sum + l.quantity, 0);

  if (loading) {
    return (
      <div className="log-list">
        <div className="empty-state"><p>Loading...</p></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="log-list">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No entries yet today</div>
          <div className="empty-state-sub">Tap + on an item to get started</div>
        </div>
      </div>
    );
  }

  return (
    <div className="log-list">
      <div className="daily-total-banner has-items">
        <span className="label">Today's entries</span>
        <span className="value">{logs.length} entries · {totalItems} items</span>
      </div>

      {logs.map((log) => {
        const time = new Date(log.logged_at).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit',
        });

        return (
          <div key={log.id} className="log-entry">
            <div className="log-entry-reason-icon"
              style={{ background: getReasonBg(log.reason) }}>
              {getReasonEmoji(log.reason)}
            </div>
            <div className="log-entry-info">
              <div className="log-entry-item">{log.item_name}</div>
              <div className="log-entry-meta">
                <span className={`reason-tag ${log.reason}`}>
                  {getReasonLabel(log.reason)}
                </span>
                <span>{time}</span>
              </div>
            </div>
            <div className="log-entry-qty">{log.quantity}</div>
            <button className="log-entry-delete"
              onClick={() => handleDelete(log.id, log.item_name)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}
