import { useState } from "react";

const VENDORS_AND_ITEMS = [
  { vendor: "Galant", items: ["Bacon Burrito", "Chile Verde Burrito", "Plant Based Burrito", "Chicken Sausage Sandwich"] },
  { vendor: "Dining Hall", items: ["Turkey Pesto", "Eggything"] },
  { vendor: "Firebrand", items: ["Everything Bagel Croissant", "Butter Croissant", "Almond Croissant", "Chocolate Croissant", "Ham & Cheese Croissant", "Banana Walnut Loaf", "Sea Salt Pretzel"] },
  { vendor: "Third Culture", items: ["Chocolate Donut", "Ube Donut", "Red Velvet Muffin", "Seasonal Muffin/Donut"] },
  { vendor: "Boichik Bagels", items: ["Everything Bagel", "Sesame Bagel", "Cin Raisin Bagel", "Plain Bagel"] },
  { vendor: "Sysco", items: ["Chocolate Chunk Cookie"] },
];

const REASONS = [
  { id: "staff_meal", label: "Staff Meal", emoji: "👨‍🍳", color: "#2d8659", bg: "#e6f5ed" },
  { id: "spoiled", label: "Spoiled", emoji: "🤢", color: "#cc3333", bg: "#fde8e8" },
  { id: "lost", label: "Lost", emoji: "❓", color: "#d4722e", bg: "#fef0e4" },
  { id: "loyalty_card", label: "Loyalty Card", emoji: "💳", color: "#7044c9", bg: "#f0ebfa" },
  { id: "too_good_to_go", label: "2G2G", emoji: "📦", color: "#1a7f9e", bg: "#e4f4f8" },
  { id: "other", label: "Other", emoji: "📝", color: "#777", bg: "#f0f0f0" },
];
const DEFAULT_REASON = "lost";

const ALL_ITEMS = [];
let nid = 1;
VENDORS_AND_ITEMS.forEach(({ vendor, items }) => {
  items.forEach((name) => { ALL_ITEMS.push({ id: nid++, name, vendor }); });
});

function formatDate(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }); }

function Toast({ message }) {
  if (!message) return null;
  return <div style={{
    position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
    background: "#1a1a1a", color: "#fff", padding: "14px 28px",
    borderRadius: 18, fontSize: 16, fontWeight: 700, zIndex: 999,
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)", whiteSpace: "nowrap",
    animation: "fadeInUp 0.25s ease-out",
  }}>{message}</div>;
}

function TipBanner({ onDismiss }) {
  return (
    <div style={{
      background: "#1a7f9e", color: "#fff", borderRadius: 12,
      padding: "14px 16px", marginBottom: 14, display: "flex",
      alignItems: "flex-start", gap: 12, border: "2px solid #15687f",
    }}>
      <div style={{ fontSize: 22, flexShrink: 0 }}>💡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>Quick tip</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.95 }}>
          <strong>Tap +</strong> to log as "Lost" · <strong>Hold +</strong> to pick reason · <strong>Hold −</strong> to undo specific reason
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: "rgba(255,255,255,0.25)", border: "none", color: "#fff",
        width: 28, height: 28, borderRadius: "50%", fontSize: 15, fontWeight: 700,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}>✕</button>
    </div>
  );
}

function ReasonSheet({ title, subtitle, reasons, onSelect, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(6px)", zIndex: 500,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.15s ease-out",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520,
        padding: "22px 20px 34px", animation: "slideUp 0.25s ease-out",
        border: "3px solid #2c1810", borderBottom: "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{subtitle}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a" }}>{title}</div>
          </div>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: "50%", background: "#eee",
            border: "2px solid #ccc", fontSize: 20, color: "#555", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
          }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {reasons.map((r) => (
            <button key={r.id} onClick={() => onSelect(r.id)} style={{
              padding: "16px 10px", borderRadius: 14,
              border: `3px solid ${r.color}`,
              background: r.bg, cursor: "pointer", textAlign: "center",
              transition: "transform 0.1s",
            }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.94)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{ fontSize: 26, marginBottom: 4 }}>{r.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: r.color }}>{r.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ItemTile({ item, count, reasonBreakdown, onTap, onLongPressPlus, onTapMinus, onLongPressMinus }) {
  const [pT, setPT] = useState(null); const [pP, setPP] = useState(false);
  const [mT, setMT] = useState(null); const [mP, setMP] = useState(false);
  const startPP = () => { setPP(true); setPT(setTimeout(() => { onLongPressPlus(); setPP(false); }, 500)); };
  const endPP = (t) => { if (pT) { clearTimeout(pT); setPT(null); } if (pP && t) onTap(); setPP(false); };
  const cancelPP = () => { if (pT) { clearTimeout(pT); setPT(null); } setPP(false); };
  const startMP = () => { if (count === 0) return; setMP(true); setMT(setTimeout(() => { onLongPressMinus(); setMP(false); }, 500)); };
  const endMP = (t) => { if (mT) { clearTimeout(mT); setMT(null); } if (mP && t) onTapMinus(); setMP(false); };
  const cancelMP = () => { if (mT) { clearTimeout(mT); setMT(null); } setMP(false); };

  const hasReasons = Object.keys(reasonBreakdown).length > 0;
  const isActive = count > 0;

  return (
    <div style={{
      background: isActive ? "#fef8f2" : "#fff",
      borderRadius: 14,
      padding: "16px 10px 14px",
      display: "flex", flexDirection: "column", alignItems: "center",
      border: isActive ? "3px solid #d4722e" : "3px solid #c8bfb4",
      transition: "all 0.2s",
      userSelect: "none", WebkitUserSelect: "none",
      position: "relative",
    }}>
      {/* Count badge */}
      {isActive && (
        <div style={{
          position: "absolute", top: -10, right: -6,
          background: "#d4722e", color: "#fff",
          minWidth: 32, height: 32, borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 900, padding: "0 8px",
          border: "3px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>{count}</div>
      )}

      {/* Item name */}
      <div style={{
        fontSize: 16, fontWeight: 800, color: "#1a1a1a",
        textAlign: "center", lineHeight: 1.3,
        minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 4px",
      }}>{item.name}</div>

      {/* Reason chips */}
      {hasReasons && (
        <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {Object.entries(reasonBreakdown).map(([rId, qty]) => {
            const r = REASONS.find((x) => x.id === rId);
            if (!r) return null;
            return <span key={rId} style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "3px 8px", borderRadius: 14,
              fontSize: 13, fontWeight: 800,
              background: r.bg, color: r.color,
              border: `2px solid ${r.color}44`,
            }}>{r.emoji}{qty}</span>;
          })}
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginTop: hasReasons ? 10 : 14, justifyContent: "center",
      }}>
        <button disabled={count === 0}
          onTouchStart={startMP} onTouchEnd={() => endMP(true)} onTouchCancel={cancelMP}
          onMouseDown={startMP} onMouseUp={() => endMP(true)} onMouseLeave={cancelMP}
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: isActive ? "#f5ede4" : "#f5f5f5",
            border: isActive ? "2.5px solid #c8a882" : "2.5px solid #ddd",
            fontSize: 24, fontWeight: 800,
            color: isActive ? "#7a5a3a" : "#ccc",
            cursor: isActive ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>−</button>
        <button
          onTouchStart={startPP} onTouchEnd={() => endPP(true)} onTouchCancel={cancelPP}
          onMouseDown={startPP} onMouseUp={() => endPP(true)} onMouseLeave={cancelPP}
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: "#d4722e", border: "3px solid #a85a1a",
            fontSize: 30, color: "#fff", fontWeight: 900,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 10px rgba(212,114,46,0.4)",
          }}>+</button>
      </div>
    </div>
  );
}

function TodayLogView({ logs, onDelete }) {
  const total = logs.reduce((s, l) => s + l.quantity, 0);
  if (logs.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#888" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>No entries yet today</div>
    </div>
  );
  return (
    <div style={{ padding: "16px 24px 80px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ background: "#fef0e4", borderRadius: 12, padding: "12px 18px", display: "flex", justifyContent: "space-between", marginBottom: 14, border: "2.5px solid #e8c9a8" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#7a5a3a" }}>Today's entries</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#d4722e" }}>{logs.length} entries · {total} items</span>
      </div>
      {logs.map((log) => {
        const reason = REASONS.find((r) => r.id === log.reason) || REASONS[5];
        return (
          <div key={log.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 7, border: "2.5px solid #d8d0c6", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: reason.bg, border: `2px solid ${reason.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{reason.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{log.itemName}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span style={{ padding: "3px 10px", borderRadius: 14, fontSize: 13, fontWeight: 800, background: reason.bg, color: reason.color, border: `2px solid ${reason.color}44` }}>{reason.label}</span>
                <span style={{ fontSize: 13, color: "#999", fontWeight: 600 }}>{log.time}</span>
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#d4722e" }}>{log.quantity}</div>
            <button onClick={() => onDelete(log.id)} style={{ width: 38, height: 38, borderRadius: 10, background: "#fde8e8", border: "2.5px solid #e8a0a0", color: "#cc3333", fontSize: 17, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

function ReportsView({ logs }) {
  if (logs.length === 0) return <div style={{ textAlign: "center", padding: "80px 20px", color: "#888" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📊</div><div style={{ fontSize: 20, fontWeight: 800 }}>No data yet</div></div>;
  const byItem = {}; logs.forEach((l) => { byItem[l.itemName] = (byItem[l.itemName] || 0) + l.quantity; });
  const itemRows = Object.entries(byItem).sort((a, b) => b[1] - a[1]); const maxI = itemRows[0]?.[1] || 1;
  const byReason = {}; logs.forEach((l) => { byReason[l.reason] = (byReason[l.reason] || 0) + l.quantity; });
  const rRows = Object.entries(byReason).sort((a, b) => b[1] - a[1]); const tot = logs.reduce((s, l) => s + l.quantity, 0);
  return (
    <div style={{ padding: "16px 24px 80px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ background: "#fef0e4", borderRadius: 12, padding: "12px 18px", display: "flex", justifyContent: "space-between", marginBottom: 20, border: "2.5px solid #e8c9a8" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#7a5a3a" }}>Session total</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#d4722e" }}>{tot} items</span>
      </div>
      <SecH>By Reason</SecH>
      {rRows.map(([rId, q]) => { const r = REASONS.find((x) => x.id === rId) || REASONS[5]; return <RRow key={rId} label={`${r.emoji} ${r.label}`} value={q} barPct={(q / tot) * 100} barColor={r.color} barBg={r.bg} />; })}
      <SecH>By Item</SecH>
      {itemRows.map(([n, q]) => <RRow key={n} label={n} value={q} barPct={(q / maxI) * 100} />)}
    </div>
  );
}
function SecH({ children }) { return <div style={{ fontSize: 14, fontWeight: 900, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", padding: "18px 4px 8px" }}>{children}</div>; }
function RRow({ label, value, barPct, barColor = "#d4722e", barBg = "#fef0e4" }) {
  return <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 7, border: "2.5px solid #d8d0c6" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 900, color: "#d4722e" }}>{value}</span>
    </div>
    {barPct !== undefined && <div style={{ height: 7, background: barBg, borderRadius: 4, marginTop: 8, overflow: "hidden", border: `1px solid ${barColor}33` }}><div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 4, transition: "width 0.5s" }} /></div>}
  </div>;
}

// ─── Main ───
export default function WastageLog() {
  const [tab, setTab] = useState("log");
  const [counts, setCounts] = useState(() => { const o = {}; ALL_ITEMS.forEach((i) => { o[i.id] = 0; }); return o; });
  const [breakdowns, setBreakdowns] = useState(() => { const o = {}; ALL_ITEMS.forEach((i) => { o[i.id] = {}; }); return o; });
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const [plusPicker, setPlusPicker] = useState(null);
  const [minusPicker, setMinusPicker] = useState(null);
  const [showTip, setShowTip] = useState(true);
  const [lid, setLid] = useState(1);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 1800); };

  const addLog = (itemId, reason) => {
    const item = ALL_ITEMS.find((i) => i.id === itemId);
    const r = REASONS.find((x) => x.id === reason);
    setCounts((p) => ({ ...p, [itemId]: (p[itemId] || 0) + 1 }));
    setBreakdowns((p) => ({ ...p, [itemId]: { ...p[itemId], [reason]: (p[itemId]?.[reason] || 0) + 1 } }));
    setLogs((p) => [{ id: lid, itemId, itemName: item.name, quantity: 1, reason, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }, ...p]);
    setLid((c) => c + 1);
    showToast(`+1 ${item.name} — ${r.label}`);
    if (showTip) setShowTip(false);
  };

  const removeByReason = (itemId, reason) => {
    const log = logs.find((l) => l.itemId === itemId && l.reason === reason);
    if (!log) return;
    setCounts((p) => ({ ...p, [itemId]: Math.max(0, p[itemId] - 1) }));
    setBreakdowns((p) => { const br = { ...p[itemId] }; br[reason] = Math.max(0, (br[reason] || 0) - 1); if (br[reason] === 0) delete br[reason]; return { ...p, [itemId]: br }; });
    setLogs((p) => p.filter((l) => l.id !== log.id));
    showToast(`-1 ${log.itemName}`);
  };

  const handleTapMinus = (itemId) => {
    if ((counts[itemId] || 0) <= 0) return;
    const log = logs.find((l) => l.itemId === itemId);
    if (log) removeByReason(itemId, log.reason);
  };

  const handleDeleteLog = (logId) => {
    const log = logs.find((l) => l.id === logId);
    if (!log) return;
    setCounts((p) => ({ ...p, [log.itemId]: Math.max(0, (p[log.itemId] || 0) - 1) }));
    setBreakdowns((p) => { const br = { ...p[log.itemId] }; br[log.reason] = Math.max(0, (br[log.reason] || 0) - 1); if (br[log.reason] === 0) delete br[log.reason]; return { ...p, [log.itemId]: br }; });
    setLogs((p) => p.filter((l) => l.id !== logId));
    showToast(`Removed ${log.itemName}`);
  };

  const dailyTotal = Object.values(counts).reduce((s, v) => s + v, 0);
  const tabs = [
    { id: "log", label: "Log", emoji: "📋" },
    { id: "today", label: "Today", emoji: "📝" },
    { id: "reports", label: "Reports", emoji: "📊" },
  ];

  const minusReasons = minusPicker
    ? Object.entries(breakdowns[minusPicker] || {}).filter(([, q]) => q > 0).map(([rId, q]) => {
        const r = REASONS.find((x) => x.id === rId);
        return r ? { ...r, label: `${r.label} (${q})` } : null;
      }).filter(Boolean)
    : [];

  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#eae5de", minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(14px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-tap-highlight-color: transparent; }
        .item-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 12px;
        }
        @media (min-width: 1024px) {
          .item-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
        }
        .vendor-row {
          grid-column: 1 / -1;
          font-size: 15px; font-weight: 900; color: #6a5d50;
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 16px 4px 6px;
          border-bottom: 3px solid #c8bfb4;
          margin-bottom: 2px;
        }
        .vendor-row:first-child { padding-top: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#2c1810", color: "#fff",
        padding: "18px 24px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "4px solid #d4722e",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 34 }}>☕</span>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>Edmonds Cafe</div>
            <div style={{ fontSize: 14, opacity: 0.5, fontWeight: 600 }}>Wastage Log</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.85 }}>{formatDate(new Date())}</div>
          {dailyTotal > 0 && (
            <div style={{
              fontSize: 16, background: "#d4722e",
              padding: "6px 18px", borderRadius: 20, fontWeight: 900,
              border: "2px solid #fff3",
            }}>{dailyTotal} logged</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "3px solid #c8bfb4" }}>
        <div style={{ display: "flex", maxWidth: 500, margin: "0 auto" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "14px 8px 12px", border: "none", background: "none",
              fontSize: 15, fontWeight: tab === t.id ? 900 : 600,
              color: tab === t.id ? "#d4722e" : "#aaa",
              borderBottom: tab === t.id ? "4px solid #d4722e" : "4px solid transparent",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "log" && (
        <div style={{ padding: "16px 16px 80px" }}>
          {showTip && <TipBanner onDismiss={() => setShowTip(false)} />}
          <div style={{
            background: dailyTotal > 0 ? "#fef0e4" : "#f0ebe3",
            borderRadius: 12, padding: "14px 18px", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            border: dailyTotal > 0 ? "2.5px solid #e8c9a8" : "2.5px solid #d8d0c6",
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#7a5a3a" }}>Today's total</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: dailyTotal > 0 ? "#d4722e" : "#aaa" }}>{dailyTotal} items</span>
          </div>

          <div className="item-grid">
            {VENDORS_AND_ITEMS.map(({ vendor, items }) => (
              <>
                <div key={`v-${vendor}`} className="vendor-row">{vendor}</div>
                {items.map((name) => {
                  const item = ALL_ITEMS.find((i) => i.name === name);
                  return <ItemTile key={item.id} item={item}
                    count={counts[item.id] || 0} reasonBreakdown={breakdowns[item.id] || {}}
                    onTap={() => addLog(item.id, DEFAULT_REASON)}
                    onLongPressPlus={() => setPlusPicker(item.id)}
                    onTapMinus={() => handleTapMinus(item.id)}
                    onLongPressMinus={() => { if (Object.keys(breakdowns[item.id] || {}).length > 0) setMinusPicker(item.id); }}
                  />;
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {tab === "today" && <TodayLogView logs={logs} onDelete={handleDeleteLog} />}
      {tab === "reports" && <ReportsView logs={logs} />}

      {plusPicker && <ReasonSheet title={ALL_ITEMS.find((i) => i.id === plusPicker)?.name}
        subtitle="Log as..." reasons={REASONS}
        onSelect={(r) => { addLog(plusPicker, r); setPlusPicker(null); }}
        onClose={() => setPlusPicker(null)} />}
      {minusPicker && minusReasons.length > 0 && <ReasonSheet title={ALL_ITEMS.find((i) => i.id === minusPicker)?.name}
        subtitle="Remove which?" reasons={minusReasons}
        onSelect={(r) => { removeByReason(minusPicker, r); setMinusPicker(null); }}
        onClose={() => setMinusPicker(null)} />}

      <Toast message={toast} />
    </div>
  );
}
