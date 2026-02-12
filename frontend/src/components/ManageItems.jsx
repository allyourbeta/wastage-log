import { useState, useEffect } from 'react';
import * as api from '../api.js';

/**
 * ManageItems: Admin view for managing items and vendors.
 * Toggle items active/inactive, add new items and vendors.
 */
export default function ManageItems({ onToast }) {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemVendor, setNewItemVendor] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);

  const loadData = async () => {
    try {
      const [itemData, vendorData] = await Promise.all([
        api.getItems(false), // include inactive
        api.getVendors(),
      ]);
      setItems(itemData);
      setVendors(vendorData);
      if (vendorData.length > 0 && !newItemVendor) {
        setNewItemVendor(vendorData[0].id);
      }
    } catch (err) {
      console.error('Failed to load:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (itemId, currentActive) => {
    try {
      await api.updateItem(itemId, { is_active: !currentActive });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_active: !currentActive ? 1 : 0 } : i))
      );
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemVendor) return;
    try {
      await api.createItem(Number(newItemVendor), newItemName.trim());
      setNewItemName('');
      setShowAddItem(false);
      onToast?.(`Added ${newItemName.trim()}`);
      loadData();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;
    try {
      const result = await api.createVendor(newVendorName.trim());
      setNewVendorName('');
      setShowAddVendor(false);
      onToast?.(`Added vendor ${newVendorName.trim()}`);
      loadData();
    } catch (err) {
      console.error('Failed to add vendor:', err);
    }
  };

  // Group by vendor
  const grouped = {};
  items.forEach((item) => {
    if (!grouped[item.vendor_name]) grouped[item.vendor_name] = [];
    grouped[item.vendor_name].push(item);
  });

  return (
    <div className="manage-container">
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => { setShowAddItem(!showAddItem); setShowAddVendor(false); }}
          style={{
            flex: 1, padding: '12px', background: 'var(--accent)',
            color: 'white', borderRadius: 'var(--radius-md)',
            fontWeight: 500, fontSize: '0.85rem',
          }}
        >
          + Add Item
        </button>
        <button
          onClick={() => { setShowAddVendor(!showAddVendor); setShowAddItem(false); }}
          style={{
            flex: 1, padding: '12px', background: 'var(--bg-card)',
            color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
            fontWeight: 500, fontSize: '0.85rem',
            border: '1px solid var(--border)',
          }}
        >
          + Add Vendor
        </button>
      </div>

      {/* Add item form */}
      {showAddItem && (
        <form onSubmit={handleAddItem} style={{
          background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-md)',
          marginBottom: 16, boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem',
              }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <select
              value={newItemVendor}
              onChange={(e) => setNewItemVendor(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem',
                background: 'white',
              }}
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{
            width: '100%', padding: '10px', background: 'var(--accent)',
            color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 500,
          }}>
            Add Item
          </button>
        </form>
      )}

      {/* Add vendor form */}
      {showAddVendor && (
        <form onSubmit={handleAddVendor} style={{
          background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-md)',
          marginBottom: 16, boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Vendor name"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem',
              }}
              autoFocus
            />
          </div>
          <button type="submit" style={{
            width: '100%', padding: '10px', background: 'var(--accent)',
            color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 500,
          }}>
            Add Vendor
          </button>
        </form>
      )}

      {/* Items grouped by vendor */}
      {Object.entries(grouped).map(([vendor, vendorItems]) => (
        <div key={vendor}>
          <div className="vendor-group-header">{vendor}</div>
          {vendorItems.map((item) => (
            <div key={item.id} className="manage-item">
              <div style={{ flex: 1 }}>
                <div className="manage-item-name" style={{
                  opacity: item.is_active ? 1 : 0.4,
                  textDecoration: item.is_active ? 'none' : 'line-through',
                }}>
                  {item.name}
                </div>
              </div>
              <button
                className={`manage-toggle ${item.is_active ? 'active' : ''}`}
                onClick={() => handleToggle(item.id, item.is_active)}
                aria-label={item.is_active ? 'Deactivate' : 'Activate'}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
