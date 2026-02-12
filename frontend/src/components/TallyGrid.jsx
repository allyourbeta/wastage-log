import { useState, useEffect, useCallback } from 'react';
import * as api from '../api.js';
import {
  DEFAULT_REASON, REASONS, getReasonLabel, getReasonEmoji,
  getItemEmoji, formatDate, todayStr, shiftDate,
} from '../constants.js';
import ReasonPicker from './ReasonPicker.jsx';

function TipBanner({ onDismiss }) {
  const defaultLabel = REASONS[DEFAULT_REASON]?.label || DEFAULT_REASON;
  return (
    <div className="tip-banner">
      <div className="tip-icon">💡</div>
      <div className="tip-body">
        <div className="tip-title">Quick tip</div>
        <div className="tip-text">
          <strong>Tap +</strong> to log as "{defaultLabel}" ·{' '}
          <strong>Hold +</strong> to pick reason ·{' '}
          <strong>Hold −</strong> to undo specific reason
        </div>
      </div>
      <button className="tip-close" onClick={onDismiss}>✕</button>
    </div>
  );
}

function ItemTile({ item, count, breakdown, onTap, onLongPressPlus, onTapMinus, onLongPressMinus }) {
  const [pT, setPT] = useState(null);
  const [pP, setPP] = useState(false);
  const [mT, setMT] = useState(null);
  const [mP, setMP] = useState(false);

  const startPP = () => { setPP(true); setPT(setTimeout(() => { onLongPressPlus(); setPP(false); }, 500)); };
  const endPP = (t) => { if (pT) { clearTimeout(pT); setPT(null); } if (pP && t) onTap(); setPP(false); };
  const cancelPP = () => { if (pT) { clearTimeout(pT); setPT(null); } setPP(false); };

  const startMP = () => { if (count === 0) return; setMP(true); setMT(setTimeout(() => { onLongPressMinus(); setMP(false); }, 500)); };
  const endMP = (t) => { if (mT) { clearTimeout(mT); setMT(null); } if (mP && t) onTapMinus(); setMP(false); };
  const cancelMP = () => { if (mT) { clearTimeout(mT); setMT(null); } setMP(false); };

  const hasReasons = Object.keys(breakdown).length > 0;
  const emoji = getItemEmoji(item.name);

  return (
    <div className={`tile-item ${count > 0 ? 'has-count' : ''}`}>
      {count > 0 && <div className="tile-badge">{count}</div>}
      <div className="tile-emoji-wrap"><span className="tile-emoji">{emoji}</span></div>
      <div className="tile-name">{item.name}</div>

      {hasReasons && (
        <div className="tile-chips">
          {Object.entries(breakdown).map(([rId, qty]) => (
            <span key={rId} className={`reason-chip ${rId}`}>
              {getReasonEmoji(rId)}{qty}
            </span>
          ))}
        </div>
      )}

      <div className="tile-controls">
        <button className={`tile-btn-minus ${count > 0 ? 'enabled' : ''}`}
          disabled={count === 0}
          onTouchStart={startMP} onTouchEnd={() => endMP(true)}
          onTouchCancel={cancelMP} onMouseDown={startMP}
          onMouseUp={() => endMP(true)} onMouseLeave={cancelMP}
        >−</button>
        <button className="tile-btn-plus"
          onTouchStart={startPP} onTouchEnd={() => endPP(true)}
          onTouchCancel={cancelPP} onMouseDown={startPP}
          onMouseUp={() => endPP(true)} onMouseLeave={cancelPP}
        >+</button>
      </div>
    </div>
  );
}

export default function TallyGrid({ onToast, onTotalChange }) {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({});
  const [breakdowns, setBreakdowns] = useState({});
  const [currentDate, setCurrentDate] = useState(todayStr());
  const [plusPicker, setPlusPicker] = useState(null);
  const [minusPicker, setMinusPicker] = useState(null);
  const [showTip, setShowTip] = useState(true);

  const isToday = currentDate === todayStr();

  const loadData = useCallback(async () => {
    try {
      const [itemData, totalData] = await Promise.all([
        api.getItems(true), api.getDailyTotals(currentDate),
      ]);
      setItems(itemData);
      const tm = {}; totalData.forEach((t) => { tm[t.item_id] = t.total_quantity; }); setTotals(tm);
      if (isToday) {
        const logs = await api.getTodayLogs();
        const bds = {};
        logs.forEach((l) => {
          if (!bds[l.item_id]) bds[l.item_id] = {};
          bds[l.item_id][l.reason] = (bds[l.item_id][l.reason] || 0) + l.quantity;
        });
        setBreakdowns(bds);
      }
    } catch (err) { console.error('Failed to load:', err); }
  }, [currentDate, isToday]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    onTotalChange?.(Object.values(totals).reduce((s, v) => s + v, 0));
  }, [totals, onTotalChange]);

  const handleIncrement = async (itemId, reason = DEFAULT_REASON) => {
    try {
      await api.createLog(itemId, 1, reason);
      setTotals((p) => ({ ...p, [itemId]: (p[itemId] || 0) + 1 }));
      setBreakdowns((p) => ({
        ...p, [itemId]: { ...(p[itemId] || {}), [reason]: ((p[itemId] || {})[reason] || 0) + 1 },
      }));
      const item = items.find((i) => i.id === itemId);
      onToast?.(`+1 ${getItemEmoji(item?.name)} ${item?.name} — ${getReasonLabel(reason)}`);
      if (showTip) setShowTip(false);
    } catch (err) { onToast?.('Error logging item'); }
  };

  const handleTapMinus = async (itemId) => {
    if ((totals[itemId] || 0) <= 0) return;
    try {
      const todayLogs = await api.getTodayLogs();
      const log = todayLogs.find((l) => l.item_id === itemId);
      if (!log) return;
      await api.deleteLog(log.id);
      setTotals((p) => ({ ...p, [itemId]: Math.max(0, (p[itemId] || 0) - 1) }));
      setBreakdowns((p) => {
        const br = { ...(p[itemId] || {}) };
        br[log.reason] = Math.max(0, (br[log.reason] || 0) - 1);
        if (br[log.reason] === 0) delete br[log.reason];
        return { ...p, [itemId]: br };
      });
      const item = items.find((i) => i.id === itemId);
      onToast?.(`-1 ${getItemEmoji(item?.name)} ${item?.name}`);
    } catch (err) { console.error('Failed to decrement:', err); }
  };

  const handleRemoveByReason = async (itemId, reason) => {
    try {
      const todayLogs = await api.getTodayLogs();
      const log = todayLogs.find((l) => l.item_id === itemId && l.reason === reason);
      if (!log) return;
      await api.deleteLog(log.id);
      setTotals((p) => ({ ...p, [itemId]: Math.max(0, (p[itemId] || 0) - 1) }));
      setBreakdowns((p) => {
        const br = { ...(p[itemId] || {}) };
        br[reason] = Math.max(0, (br[reason] || 0) - 1);
        if (br[reason] === 0) delete br[reason];
        return { ...p, [itemId]: br };
      });
      const item = items.find((i) => i.id === itemId);
      onToast?.(`-1 ${getItemEmoji(item?.name)} ${item?.name} — ${getReasonLabel(reason)}`);
    } catch (err) { console.error('Failed to remove by reason:', err); }
  };

  const dailyTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  // Group items by vendor
  const grouped = [];
  let lastVendor = null;
  items.forEach((item) => {
    if (item.vendor_name !== lastVendor) {
      grouped.push({ type: 'header', vendor: item.vendor_name });
      lastVendor = item.vendor_name;
    }
    grouped.push({ type: 'item', ...item });
  });

  const minusReasons = minusPicker
    ? Object.entries(breakdowns[minusPicker] || {}).filter(([, q]) => q > 0).map(([rId, q]) => {
        const r = REASONS[rId];
        return r ? { id: rId, label: `${r.label} (${q})`, emoji: r.emoji } : null;
      }).filter(Boolean)
    : [];

  return (
    <div className="tally-grid">
      <div className="tally-date-nav">
        <button onClick={() => setCurrentDate(shiftDate(currentDate, -1))}>◂</button>
        <span className="current-date">{isToday ? 'Today' : formatDate(currentDate)}</span>
        <button onClick={() => !isToday && setCurrentDate(shiftDate(currentDate, 1))}
          style={{ opacity: isToday ? 0.3 : 1 }} disabled={isToday}>▸</button>
      </div>

      {showTip && <TipBanner onDismiss={() => setShowTip(false)} />}

      <div className={`daily-total-banner ${dailyTotal > 0 ? 'has-items' : ''}`}>
        <span className="label">{isToday ? "Today's total" : `Total for ${formatDate(currentDate)}`}</span>
        <span className="value">{dailyTotal} items</span>
      </div>

      <div className="item-grid">
        {grouped.map((entry) => {
          if (entry.type === 'header') {
            return <div key={`v-${entry.vendor}`} className="vendor-label">{entry.vendor}</div>;
          }
          return (
            <ItemTile key={entry.id} item={entry}
              count={totals[entry.id] || 0}
              breakdown={breakdowns[entry.id] || {}}
              onTap={() => handleIncrement(entry.id)}
              onLongPressPlus={() => setPlusPicker(entry.id)}
              onTapMinus={() => handleTapMinus(entry.id)}
              onLongPressMinus={() => {
                const bd = breakdowns[entry.id] || {};
                if (Object.keys(bd).length > 0) setMinusPicker(entry.id);
              }}
            />
          );
        })}
      </div>

      {plusPicker && (
        <ReasonPicker
          itemName={items.find((i) => i.id === plusPicker)?.name}
          itemEmoji={getItemEmoji(items.find((i) => i.id === plusPicker)?.name)}
          subtitle="Log as..."
          onSelect={(r) => { handleIncrement(plusPicker, r); setPlusPicker(null); }}
          onClose={() => setPlusPicker(null)}
        />
      )}
      {minusPicker && minusReasons.length > 0 && (
        <ReasonPicker
          itemName={items.find((i) => i.id === minusPicker)?.name}
          itemEmoji={getItemEmoji(items.find((i) => i.id === minusPicker)?.name)}
          subtitle="Remove which?"
          reasonOverrides={minusReasons}
          onSelect={(r) => { handleRemoveByReason(minusPicker, r); setMinusPicker(null); }}
          onClose={() => setMinusPicker(null)}
        />
      )}
    </div>
  );
}
