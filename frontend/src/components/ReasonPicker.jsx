import { REASONS } from '../constants.js';

// Grouped reason keys matching client's categories
const OPERATIONAL_KEYS = ['spoiled', 'prep_error', 'damaged', 'staff_comp', 'customer_comp'];
const BOTTOM_KEYS = ['too_good_to_go', 'display_pull'];

/**
 * ReasonPicker: Bottom sheet for selecting a reason.
 * - subtitle: header label ("Log as..." or "Remove which?")
 * - reasonOverrides: optional array of {id, label, emoji} for minus picker
 */
export default function ReasonPicker({
  itemName, itemEmoji, subtitle = 'Log as...', reasonOverrides, onSelect, onClose,
}) {
  // Minus picker: flat grid, no grouping
  if (reasonOverrides) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-left">
              <span className="modal-header-emoji">{itemEmoji || '🍽️'}</span>
              <div>
                <div className="modal-header-label">{subtitle}</div>
                <div className="modal-header-title">{itemName}</div>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="reason-grid">
            {reasonOverrides.map((r) => (
              <button key={r.id} className={`reason-btn ${r.id}`} onClick={() => onSelect(r.id)}>
                <span className="reason-emoji">{r.emoji}</span>
                <span className="reason-label">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Plus picker: grouped layout with divider
  const opReasons = OPERATIONAL_KEYS
    .filter((k) => REASONS[k])
    .map((k) => ({ id: k, ...REASONS[k] }));
  const bottomReasons = BOTTOM_KEYS
    .filter((k) => REASONS[k])
    .map((k) => ({ id: k, ...REASONS[k] }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-header-emoji">{itemEmoji || '🍽️'}</span>
            <div>
              <div className="modal-header-label">{subtitle}</div>
              <div className="modal-header-title">{itemName}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Operational — 2-col grid */}
        <div className="reason-grid">
          {opReasons.map((r) => (
            <button key={r.id} className={`reason-btn ${r.id}`} onClick={() => onSelect(r.id)}>
              <span className="reason-emoji">{r.emoji}</span>
              <span className="reason-label">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="reason-divider">
          <div className="reason-divider-line" />
          <span className="reason-divider-label">Recovery & Display</span>
          <div className="reason-divider-line" />
        </div>

        {/* Bottom row — 2-col */}
        <div className="reason-grid">
          {bottomReasons.map((r) => (
            <button key={r.id} className={`reason-btn ${r.id}`} onClick={() => onSelect(r.id)}>
              <span className="reason-emoji">{r.emoji}</span>
              <span className="reason-label">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
