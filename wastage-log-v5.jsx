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

const ITEM_EMOJIS = {
  "Bacon Burrito": "🌯", "Chile Verde Burrito": "🌯", "Plant Based Burrito": "🌱",
  "Chicken Sausage Sandwich": "🥪", "Turkey Pesto": "🥪", "Eggything": "🍳",
  "Everything Bagel Croissant": "🥐", "Butter Croissant": "🥐", "Almond Croissant": "🥐",
  "Chocolate Croissant": "🥐", "Ham & Cheese Croissant": "🥐", "Banana Walnut Loaf": "🍌",
  "Sea Salt Pretzel": "🥨", "Chocolate Donut": "🍩", "Ube Donut": "🍩",
  "Red Velvet Muffin": "🧁", "Seasonal Muffin/Donut": "🧁",
  "Everything Bagel": "🥯", "Sesame Bagel": "🥯", "Cin Raisin Bagel": "🥯",
  "Plain Bagel": "🥯", "Chocolate Chunk Cookie": "🍪",
};

const ALL_ITEMS = [];
let nid = 1;
VENDORS_AND_ITEMS.forEach(({ vendor, items }) => {
  items.forEach((name) => {
    ALL_ITEMS.push({ id: nid++, name, vendor, emoji: ITEM_EMOJIS[name] || "🍽️" });
  });
});

function formatDate(d) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

// ─── Toast ───
function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#1a1a1a", color: "#fff", padding: "12px 24px",
      borderRadius: 18, fontSize: 15, fontWeight: 600, zIndex: 999,
      boxShadow: "0 12px 40px rgba(0,0,0,0.3)", whiteSpace: "nowrap",
      animation: "fadeInUp 0.25s ease-out",
    }}>{message}</div>
  );
}

// ─── Tip Banner ───
function TipBanner({ onDismiss }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a7f9e 0%, #15687f 100%)",
      color: "#fff", borderRadius: 14, padding: "14px 16px",
      marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 12,
      boxShadow: "0 4px 16px rgba(26,127,158,0.25)",
    }}>
      <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>Quick tip</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, opacity: 0.9 }}>
          <strong>Tap +</strong> to log as "Lost" · <strong>Hold +</strong> to pick reason · <strong>Hold −</strong> to undo specific reason
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
        width: 28, height: 28, borderRadius: "50%", fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>✕</button>
    </div>
  );
}

// ─── Reason Sheet ───
function ReasonSheet({ title, subtitle, itemEmoji, reasons, onSelect, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(8px)", zIndex: 500,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.15s ease-out",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 540,
        padding: "24px 22px 36px", animation: "slideUp 0.25s ease-out",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 36 }}>{itemEmoji}</span>
            <div>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{subtitle}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>{title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: "50%", background: "#f0f0f0",
            border: "none", fontSize: 20, color: "#666", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {reasons.map((r) => (
            <button key={r.id} onClick={() => onSelect(r.id)} style={{
              padding: "16px 10px", borderRadius: 16, border: `2px solid ${r.color}33`,
              background: r.bg, cursor: "pointer", textAlign: "center",
              transition: "transform 0.1s",
            }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.94)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{ fontSize: 28, marginBottom: 4 }}>{r.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Item Tile ───
function ItemTile({ item, count, reasonBreakdown, onTap, onLongPressPlus, onTapMinus, onLongPressMinus }) {
  const [plusTimer, setPlusTimer] = useState(null);
  const [plusPressing, setPlusPressing] = useState(false);
  const [minusTimer, setMinusTimer] = useState(null);
  const [minusPressing, setMinusPressing] = useState(false);

  const startPP = () => { setPlusPressing(true); setPlusTimer(setTimeout(() => { onLongPressPlus(); setPlusPressing(false); }, 500)); };
  const endPP = (t) => { if (plusTimer) { clearTimeout(plusTimer); setPlusTimer(null); } if (plusPressing && t) onTap(); setPlusPressing(false); };
  const cancelPP = () => { if (plusTimer) { clearTimeout(plusTimer); setPlusTimer(null); } setPlusPressing(false); };

  const startMP = () => { if (count === 0) return; setMinusPressing(true); setMinusTimer(setTimeout(() => { onLongPressMinus(); setMinusPressing(false); }, 500)); };
  const endMP = (t) => { if (minusTimer) { clearTimeout(minusTimer); setMinusTimer(null); } if (minusPressing && t) onTapMinus(); setMinusPressing(false); };
  const cancelMP = () => { if (minusTimer) { clearTimeout(minusTimer); setMinusTimer(null); } setMinusPressing(false); };

  const hasReasons = Object.keys(reasonBreakdown).length > 0;

  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: "14px 12px 12px",
      display: "flex", flexDirection: "column", alignItems: "center",
      boxShadow: count > 0
        ? "0 3px 14px rgba(212,114,46,0.16), 0 0 0 2.5px rgba(212,114,46,0.2)"
        : "0 1px 4px rgba(0,0,0,0.05)",
      transition: "all 0.2s", userSelect: "none", WebkitUserSelect: "none",
      position: "relative", overflow: "hidden",
    }}>
      {/* Count badge */}
      {count > 0 && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "#d4722e", color: "#fff",
          minWidth: 28, height: 28, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, padding: "0 6px",
          boxShadow: "0 2px 8px rgba(212,114,46,0.35)",
        }}>{count}</div>
      )}

      {/* Emoji */}
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: count > 0 ? "#fef0e4" : "#f5f2ed",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, transition: "all 0.2s",
        boxShadow: count > 0 ? "0 2px 8px rgba(212,114,46,0.12)" : "none",
      }}>{item.emoji}</div>

      {/* Name */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: "#1a1a1a",
        textAlign: "center", marginTop: 8, lineHeight: 1.3,
        minHeight: 34, display: "flex", alignItems: "center", justifyContent: "center",
        wordBreak: "break-word", padding: "0 2px",
      }}>{item.name}</div>

      {/* Reason chips */}
      {hasReasons && (
        <div style={{
          display: "flex", gap: 3, marginTop: 6, flexWrap: "wrap", justifyContent: "center",
        }}>
          {Object.entries(reasonBreakdown).map(([rId, qty]) => {
            const r = REASONS.find((x) => x.id === rId);
            if (!r) return null;
            return (
              <span key={rId} style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                padding: "2px 6px", borderRadius: 16,
                fontSize: 11, fontWeight: 800, background: r.bg, color: r.color,
              }}>{r.emoji}{qty}</span>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: hasReasons ? 8 : 10, width: "100%",
        justifyContent: "center",
      }}>
        <button disabled={count === 0}
          onTouchStart={startMP} onTouchEnd={() => endMP(true)}
          onTouchCancel={cancelMP} onMouseDown={startMP}
          onMouseUp={() => endMP(true)} onMouseLeave={cancelMP}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: count > 0 ? "#f5f0ea" : "transparent",
            border: count > 0 ? "2px solid #e0d6c8" : "2px solid #eee",
            fontSize: 20, fontWeight: 700, color: count > 0 ? "#7a6858" : "#ddd",
            cursor: count > 0 ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >−</button>

        <button
          onTouchStart={startPP} onTouchEnd={() => endPP(true)}
          onTouchCancel={cancelPP} onMouseDown={startPP}
          onMouseUp={() => endPP(true)} onMouseLeave={cancelPP}
          style={{
            width: 46, height: 46, borderRadius: 14,
            background: "linear-gradient(140deg, #e07a2f 0%, #c45a1a 100%)",
            border: "none", fontSize: 26, color: "#fff", fontWeight: 800,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 3px 12px rgba(212,114,46,0.4)", transition: "transform 0.1s",
          }}
        >+</button>
      </div>
    </div>
  );
}

// ─── Today Log ───
function TodayLogView({ logs, onDelete }) {
  const total = logs.reduce((s, l) => s + l.quantity, 0);
  if (logs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#aaa" }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>No entries yet today</div>
        <div style={{ fontSize: 14, marginTop: 6, color: "#bbb" }}>Tap + on an item to get started</div>
      </div>
    );
  }
  return (
    <div style={{ padding: "12px 16px 80px" }}>
      <div style={{
        background: "#fef0e4", borderRadius: 16, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", marginBottom: 14,
        alignItems: "center", border: "2px solid rgba(212,114,46,0.2)",
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#8a6540" }}>Today's entries</span>
        <span style={{ fontSize: 17, fontWeight: 900, color: "#d4722e" }}>{logs.length} entries · {total} items</span>
      </div>
      {logs.map((log) => {
        const reason = REASONS.find((r) => r.id === log.reason) || REASONS[5];
        return (
          <div key={log.id} style={{
            background: "#fff", borderRadius: 16, padding: "12px 14px",
            marginBottom: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: reason.bg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>{reason.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{log.itemName}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 12,
                  fontWeight: 800, background: reason.bg, color: reason.color,
                }}>{reason.label}</span>
                <span style={{ fontSize: 12, color: "#aaa" }}>{log.time}</span>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#d4722e", minWidth: 28, textAlign: "center" }}>{log.quantity}</div>
            <button onClick={() => onDelete(log.id)} style={{
              width: 36, height: 36, borderRadius: 10, background: "#fde8e8",
              border: "none", color: "#cc3333", fontSize: 16, fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Reports ───
function ReportsView({ logs }) {
  if (logs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#aaa" }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>No data yet</div>
      </div>
    );
  }
  const byItem = {}; logs.forEach((l) => { byItem[l.itemName] = (byItem[l.itemName] || 0) + l.quantity; });
  const itemRows = Object.entries(byItem).sort((a, b) => b[1] - a[1]);
  const maxItem = itemRows[0]?.[1] || 1;
  const byReason = {}; logs.forEach((l) => { byReason[l.reason] = (byReason[l.reason] || 0) + l.quantity; });
  const reasonRows = Object.entries(byReason).sort((a, b) => b[1] - a[1]);
  const totalAll = logs.reduce((s, l) => s + l.quantity, 0);
  const byVendor = {}; logs.forEach((l) => { const v = ALL_ITEMS.find((i) => i.name === l.itemName)?.vendor || "?"; byVendor[v] = (byVendor[v] || 0) + l.quantity; });
  const vendorRows = Object.entries(byVendor).sort((a, b) => b[1] - a[1]); const maxV = vendorRows[0]?.[1] || 1;

  return (
    <div style={{ padding: "12px 16px 80px" }}>
      <div style={{ background: "#fef0e4", borderRadius: 16, padding: "12px 16px", display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center", border: "2px solid rgba(212,114,46,0.2)" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#8a6540" }}>Session total</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#d4722e" }}>{totalAll} items</span>
      </div>
      <SecH>By Reason</SecH>
      {reasonRows.map(([rId, qty]) => { const r = REASONS.find((x) => x.id === rId) || REASONS[5]; return <RRow key={rId} label={`${r.emoji} ${r.label}`} value={qty} barPct={(qty / totalAll) * 100} barColor={r.color} barBg={r.bg} />; })}
      <SecH>By Item</SecH>
      {itemRows.map(([n, q]) => <RRow key={n} label={n} value={q} barPct={(q / maxItem) * 100} />)}
      <SecH>By Vendor</SecH>
      {vendorRows.map(([n, q]) => <RRow key={n} label={n} value={q} barPct={(q / maxV) * 100} barColor="#2d8659" barBg="#e6f5ed" />)}
    </div>
  );
}
function SecH({ children }) { return <div style={{ fontSize: 13, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", padding: "18px 4px 8px" }}>{children}</div>; }
function RRow({ label, value, barPct, barColor = "#d4722e", barBg = "#fef0e4" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#d4722e", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
      {barPct !== undefined && <div style={{ height: 6, background: barBg, borderRadius: 3, marginTop: 7, overflow: "hidden" }}><div style={{ height: "100%", width: `${barPct}%`, background: barColor, borderRadius: 3, transition: "width 0.5s" }} /></div>}
    </div>
  );
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
  const [nid, setNid] = useState(1);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 1800); };

  const addLog = (itemId, reason) => {
    const item = ALL_ITEMS.find((i) => i.id === itemId);
    const r = REASONS.find((x) => x.id === reason);
    setCounts((p) => ({ ...p, [itemId]: (p[itemId] || 0) + 1 }));
    setBreakdowns((p) => ({ ...p, [itemId]: { ...p[itemId], [reason]: (p[itemId]?.[reason] || 0) + 1 } }));
    setLogs((p) => [{ id: nid, itemId, itemName: item.name, quantity: 1, reason, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }, ...p]);
    setNid((c) => c + 1);
    showToast(`+1 ${item.emoji} ${item.name} — ${r.label}`);
    if (showTip) setShowTip(false);
  };

  const removeByReason = (itemId, reason) => {
    const log = logs.find((l) => l.itemId === itemId && l.reason === reason);
    if (!log) return;
    setCounts((p) => ({ ...p, [itemId]: Math.max(0, p[itemId] - 1) }));
    setBreakdowns((p) => { const br = { ...p[itemId] }; br[reason] = Math.max(0, (br[reason] || 0) - 1); if (br[reason] === 0) delete br[reason]; return { ...p, [itemId]: br }; });
    setLogs((p) => p.filter((l) => l.id !== log.id));
    const item = ALL_ITEMS.find((i) => i.id === itemId);
    showToast(`-1 ${item.emoji} ${log.itemName}`);
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
      background: "#f7f4f0", minHeight: "100vh",
      margin: "0 auto", position: "relative",
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
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 0;
        }

        @media (min-width: 700px) {
          .item-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 900px) {
          .item-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (min-width: 1100px) {
          .item-grid { grid-template-columns: repeat(6, 1fr); }
        }
        @media (orientation: landscape) and (min-width: 700px) {
          .item-grid { grid-template-columns: repeat(5, 1fr); gap: 8px; }
        }
        @media (orientation: landscape) and (min-width: 1000px) {
          .item-grid { grid-template-columns: repeat(7, 1fr); gap: 8px; }
        }

        .vendor-label {
          grid-column: 1 / -1;
          font-size: 13px;
          font-weight: 800;
          color: #b0a090;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 14px 4px 4px;
        }
        .vendor-label:first-child { padding-top: 0; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(140deg, #4a3425 0%, #2a1a0e 100%)",
        color: "#fff", padding: "18px 20px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>☕ Edmonds Cafe</div>
          <div style={{ fontSize: 13, opacity: 0.5, marginTop: 2, fontWeight: 500 }}>Wastage Log</div>
        </div>
        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.85 }}>{formatDate(new Date())}</div>
          {dailyTotal > 0 && (
            <div style={{
              fontSize: 14, background: "rgba(212,114,46,0.35)",
              padding: "4px 14px", borderRadius: 20, fontWeight: 900,
            }}>{dailyTotal}</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", background: "#fff", borderBottom: "2.5px solid #ece6dc",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "12px 8px 10px", border: "none", background: "none",
            fontSize: 13, fontWeight: tab === t.id ? 800 : 500,
            color: tab === t.id ? "#d4722e" : "#bbb",
            borderBottom: tab === t.id ? "3px solid #d4722e" : "3px solid transparent",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 18 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "log" && (
        <div style={{ padding: "12px 12px 80px" }}>
          {showTip && <TipBanner onDismiss={() => setShowTip(false)} />}

          <div style={{
            background: dailyTotal > 0 ? "#fef0e4" : "#f0ebe3",
            borderRadius: 14, padding: "10px 16px", marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            border: dailyTotal > 0 ? "2px solid rgba(212,114,46,0.2)" : "2px solid transparent",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#8a6540" }}>Today's total</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: dailyTotal > 0 ? "#d4722e" : "#bbb" }}>{dailyTotal} items</span>
          </div>

          <div className="item-grid">
            {VENDORS_AND_ITEMS.map(({ vendor, items }) => (
              <>
                <div key={`v-${vendor}`} className="vendor-label">{vendor}</div>
                {items.map((name) => {
                  const item = ALL_ITEMS.find((i) => i.name === name);
                  return (
                    <ItemTile key={item.id} item={item}
                      count={counts[item.id] || 0}
                      reasonBreakdown={breakdowns[item.id] || {}}
                      onTap={() => addLog(item.id, DEFAULT_REASON)}
                      onLongPressPlus={() => setPlusPicker(item.id)}
                      onTapMinus={() => handleTapMinus(item.id)}
                      onLongPressMinus={() => {
                        const bd = breakdowns[item.id] || {};
                        if (Object.keys(bd).length > 0) setMinusPicker(item.id);
                      }}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {tab === "today" && <TodayLogView logs={logs} onDelete={handleDeleteLog} />}
      {tab === "reports" && <ReportsView logs={logs} />}

      {plusPicker && (
        <ReasonSheet title={ALL_ITEMS.find((i) => i.id === plusPicker)?.name}
          subtitle="Log as..." itemEmoji={ALL_ITEMS.find((i) => i.id === plusPicker)?.emoji}
          reasons={REASONS} onSelect={(r) => { addLog(plusPicker, r); setPlusPicker(null); }}
          onClose={() => setPlusPicker(null)} />
      )}
      {minusPicker && minusReasons.length > 0 && (
        <ReasonSheet title={ALL_ITEMS.find((i) => i.id === minusPicker)?.name}
          subtitle="Remove which?" itemEmoji={ALL_ITEMS.find((i) => i.id === minusPicker)?.emoji}
          reasons={minusReasons} onSelect={(r) => { removeByReason(minusPicker, r); setMinusPicker(null); }}
          onClose={() => setMinusPicker(null)} />
      )}

      <Toast message={toast} />
    </div>
  );
}
