export default function MonthlyProgressLineChart({ dailyData, selectedDate, setSelectedDate }) {
  const chartWidth = 980;
  const chartHeight = 260;
  const padding = { top: 24, right: 20, bottom: 36, left: 36 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const points = dailyData.map((d, i) => {
    const x = padding.left + (i * innerW) / (Math.max(dailyData.length - 1, 1));
    const y = padding.top + ((100 - d.percentage) / 100) * innerH;
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${padding.left + innerW} ${padding.top + innerH} L ${padding.left} ${padding.top + innerH} Z`;

  const avg = dailyData.length
    ? Math.round(dailyData.reduce((sum, d) => sum + d.percentage, 0) / dailyData.length)
    : 0;

  return (
    <section className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Monthly Progress Trend</h3>
        <span className="text-[11px] text-gray-500">Average {avg}%</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[780px]" preserveAspectRatio="xMidYMid meet">
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

          <path d={areaPath} fill="#22c55e" fillOpacity="0.08" />
          <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="2.5" />

          {points.map((point) => {
            const isSelected = point.date === selectedDate;
            const showLabel = point.day === 1 || point.day % 5 === 0 || point.day === dailyData.length;

            return (
              <g key={point.date} className="cursor-pointer" onClick={() => setSelectedDate(point.date)}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 4.5 : 3}
                  fill={point.percentage === 100 ? '#10b981' : '#4ade80'}
                  stroke={isSelected ? '#ffffff' : '#111827'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {showLabel && (
                  <text
                    x={point.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isSelected ? '#bbf7d0' : '#6b7280'}
                  >
                    {point.day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}