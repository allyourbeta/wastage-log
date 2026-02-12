/* KPI stat cards for the Reports dashboard */

export default function ReportCards({ totalWaste, dailyAvg, worstItem, worstDay, worstDayQty }) {
  const cards = [
    {
      icon: '📊', label: 'TOTAL WASTE',
      value: totalWaste, sub: 'for selected period',
      color: '#5B8DEF', bg: '#EBF1FD',
    },
    {
      icon: '📈', label: 'DAILY AVERAGE',
      value: dailyAvg, sub: 'items per day',
      color: '#34A853', bg: '#E6F5ED',
    },
    {
      icon: '🔴', label: 'TOP WASTED ITEM',
      value: worstItem?.item_name || '—',
      sub: worstItem ? `${worstItem.total_quantity} items` : '',
      color: '#EA4335', bg: '#FDE8E8',
      smallValue: true,
    },
    {
      icon: '📅', label: 'WORST DAY',
      value: worstDay || '—',
      sub: worstDayQty ? `${worstDayQty} items` : '',
      color: '#CD853F', bg: '#FEF3E8',
    },
  ];

  return (
    <div className="rpt-kpi-grid">
      {cards.map((c) => (
        <div key={c.label} className="rpt-kpi-card" style={{ background: c.bg }}>
          <div className="rpt-kpi-icon" style={{ background: c.color }}>
            {c.icon}
          </div>
          <div className="rpt-kpi-label">{c.label}</div>
          <div className={`rpt-kpi-value ${c.smallValue ? 'small' : ''}`}>
            {c.value}
          </div>
          {c.sub && <div className="rpt-kpi-sub">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}
