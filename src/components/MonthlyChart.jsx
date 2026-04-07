export default function MonthlyChart({ dailyData, selectedDate, setSelectedDate }) {
  const maxTasks = Math.max(...dailyData.map(d => d.total), 1);
  const chartWidth = 800;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const barWidth = Math.min(innerW / dailyData.length - 2, 20);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <h3 className="text-sm font-bold text-white mb-4">📊 Daily Task Completion</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[600px]" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + innerH * (1 - pct);
            return (
              <g key={pct}>
                <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#1f2937" strokeWidth={0.5} />
                <text x={padding.left - 5} y={y + 3} textAnchor="end" fontSize={8} fill="#6b7280">
                  {Math.round(pct * maxTasks)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {dailyData.map((d, i) => {
            const x = padding.left + (i * innerW) / dailyData.length + (innerW / dailyData.length - barWidth) / 2;
            const totalH = (d.total / maxTasks) * innerH;
            const completedH = (d.completed / maxTasks) * innerH;
            const isSelected = d.date === selectedDate;

            return (
              <g key={d.date} className="cursor-pointer" onClick={() => setSelectedDate(d.date)}>
                {/* Total bar (background) */}
                <rect
                  x={x}
                  y={padding.top + innerH - totalH}
                  width={barWidth}
                  height={totalH}
                  rx={2}
                  fill={isSelected ? '#312e81' : '#1e1b4b'}
                  opacity={0.5}
                />
                {/* Completed bar */}
                <rect
                  x={x}
                  y={padding.top + innerH - completedH}
                  width={barWidth}
                  height={completedH}
                  rx={2}
                  fill={d.percentage === 100 ? '#10b981' : isSelected ? '#818cf8' : '#6366f1'}
                />
                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize={7}
                  fill={isSelected ? '#a5b4fc' : '#6b7280'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {d.day}
                </text>
                {/* Selection indicator */}
                {isSelected && (
                  <rect
                    x={x - 2}
                    y={padding.top + innerH + 2}
                    width={barWidth + 4}
                    height={2}
                    rx={1}
                    fill="#6366f1"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-500/50" />
          <span className="text-[10px] text-gray-500">Total Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-[10px] text-gray-500">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-[10px] text-gray-500">100% Done</span>
        </div>
      </div>
    </div>
  );
}
