/**
 * Shared constants for the wastage log app v3.
 */

export const REASONS = {
  spoiled: { label: 'Spoiled/Expired', emoji: '🤢', color: '#cc3333', bg: '#fde8e8' },
  prep_error: { label: 'Prep Error', emoji: '🔄', color: '#d4722e', bg: '#fef0e4' },
  damaged: { label: 'Damaged/Dropped', emoji: '💥', color: '#b85c00', bg: '#fff0dd' },
  staff_comp: { label: 'Staff Comp', emoji: '👨‍🍳', color: '#2d8659', bg: '#e6f5ed' },
  customer_comp: { label: 'Customer Comp', emoji: '🎁', color: '#7044c9', bg: '#f0ebfa' },
  too_good_to_go: { label: '2Good2Go', emoji: '📦', color: '#1a7f9e', bg: '#e4f4f8' },
  display_pull: { label: 'Display Pull', emoji: '🗄️', color: '#777', bg: '#f0f0f0' },
};

export const DEFAULT_REASON = 'spoiled';

export const ITEM_EMOJIS = {
  'Bacon Burrito': '🌯',
  'Chile Verde Burrito': '🌯',
  'Plant Based Burrito': '🌱',
  'Chicken Sausage Sandwich': '🥪',
  'Turkey Pesto': '🥪',
  'Eggything': '🍳',
  'Everything Bagel Croissant': '🥐',
  'Butter Croissant': '🥐',
  'Almond Croissant': '🥐',
  'Chocolate Croissant': '🥐',
  'Ham & Cheese Croissant': '🥐',
  'Banana Walnut Loaf': '🍌',
  'Sea Salt Pretzel': '🥨',
  'Chocolate Donut': '🍩',
  'Ube Donut': '🍩',
  'Red Velvet Muffin': '🧁',
  'Seasonal Muffin/Donut': '🧁',
  'Everything Bagel': '🥯',
  'Sesame Bagel': '🥯',
  'Cin Raisin Bagel': '🥯',
  'Plain Bagel': '🥯',
  'Chocolate Chunk Cookie': '🍪',
};

export function getItemEmoji(name) {
  return ITEM_EMOJIS[name] || '🍽️';
}

export function getReasonLabel(reason) {
  return REASONS[reason]?.label || reason;
}

export function getReasonEmoji(reason) {
  return REASONS[reason]?.emoji || '📝';
}

export function getReasonBg(reason) {
  return REASONS[reason]?.bg || '#f0f0f0';
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDateLong(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
