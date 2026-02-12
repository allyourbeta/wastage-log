/**
 * API helper for the wastage log backend.
 * All database calls go through here.
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  return res.json();
}

// Items
export const getItems = (activeOnly = true) =>
  request(`/items?active_only=${activeOnly}`);

export const createItem = (vendorId, name) =>
  request('/items', {
    method: 'POST',
    body: JSON.stringify({ vendor_id: vendorId, name }),
  });

export const updateItem = (itemId, updates) =>
  request(`/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

// Vendors
export const getVendors = () => request('/vendors');

export const createVendor = (name) =>
  request('/vendors', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

// Waste logs
export const createLog = (itemId, quantity = 1, reason = 'waste_unsold', notes = null) =>
  request('/logs', {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId, quantity, reason, notes }),
  });

export const deleteLog = (logId) =>
  request(`/logs/${logId}`, { method: 'DELETE' });

export const updateLog = (logId, updates) =>
  request(`/logs/${logId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const getTodayLogs = () => request('/logs/today');

export const getDailyTotals = (date = null) => {
  const params = date ? `?target_date=${date}` : '';
  return request(`/logs/daily-totals${params}`);
};

// Reports
export const getWeeklyReport = (weekStart) =>
  request(`/reports/weekly?week_start=${weekStart}`);

export const getSummaryReport = (startDate, endDate) =>
  request(`/reports/summary?start_date=${startDate}&end_date=${endDate}`);

export const getCSVExportUrl = (startDate, endDate) =>
  `${BASE}/reports/csv?start_date=${startDate}&end_date=${endDate}`;
