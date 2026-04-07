export default function StatsPanel({ monthStats, weekStats, subjectStats, subjects, streakDays }) {
  const getSubjectColor = (name) =>
    subjects.find(s => s.name === name)?.color || '#6366f1';

  // Donut chart
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (monthStats.percentage / 100) * circumference;

  // Subject breakdown sorted by total
  const subjectEntries = Object.entries(subjectStats)
    .sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Month</div>
          <div className="text-2xl font-bold text-white mt-1">{monthStats.completed}<span className="text-sm text-gray-500">/{monthStats.total}</span></div>
          <div className="text-xs text-indigo-400 font-medium">{monthStats.percentage}% done</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">This Week</div>
          <div className="text-2xl font-bold text-white mt-1">{weekStats.completed}<span className="text-sm text-gray-500">/{weekStats.total}</span></div>
          <div className="text-xs text-purple-400 font-medium">{weekStats.percentage}% done</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Remaining</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{monthStats.total - monthStats.completed}</div>
          <div className="text-xs text-gray-500">tasks left</div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Streak</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{streakDays} 🔥</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      </div>

      {/* Monthly Progress Donut */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-bold text-white mb-4">Monthly Progress</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#1f2937"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={monthStats.percentage === 100 ? '#10b981' : '#6366f1'}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${
                monthStats.percentage === 100 ? 'text-green-400' : 'text-white'
              }`}>
                {monthStats.percentage}%
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      {subjectEntries.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-bold text-white mb-3">Subject Breakdown</h3>
          <div className="space-y-3">
            {subjectEntries.map(([name, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSubjectColor(name) }} />
                      <span className="text-xs text-gray-300 truncate max-w-[120px]">{name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{stats.completed}/{stats.total} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: getSubjectColor(name),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
