import { DAY_NAMES } from '../utils/calender.js';

export default function WeeklyProgressLineChart({ weekDates, getDayStats, selectedDate, setSelectedDate }) {
  const chartWidth = 760;
  const chartHeight = 220;
  const padding = { top: 24, right: 20, bottom: 34, left: 34 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = weekDates.map((dateStr, i) => {
    const stats = getDayStats(dateStr);
    const x = padding.left + (i * innerW) / (weekDates.length - 1 || 1);
    const y = padding.top + ((100 - stats.percentage) / 100) * innerH;
    return { x, y, date: dateStr, ...stats };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${padding.left + innerW} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Weekly Progress Trend</h3>
        <span className="text-[11px] text-gray-500">Completion % by day</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[620px]" preserveAspectRatio="xMidYMid meet">
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = padding.top + ((100 - pct) / 100) * innerH;
            return (
              <g key={pct}>
                <line x1={padding.left} y1={y} x2={padding.left + innerW} y2={y} stroke="#1f2937" strokeWidth="0.8" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#6b7280">
                  {pct}%
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="#6366f1" fillOpacity="0.1" />
          <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="2.5" />

          {points.map((point, i) => {
            const isSelected = point.date === selectedDate;
            return (
              <g key={point.date} className="cursor-pointer" onClick={() => setSelectedDate(point.date)}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 5 : 4}
                  fill={point.percentage === 100 ? '#10b981' : '#818cf8'}
                  stroke={isSelected ? '#ffffff' : '#111827'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={point.x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isSelected ? '#c7d2fe' : '#6b7280'}
                >
                  {DAY_NAMES[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
