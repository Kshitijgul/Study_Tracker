import { DAY_NAMES } from '../utils/calender.js';

export default function WeeklyView({ weekDates, selectedDate, setSelectedDate, getDayTasks, getDayStats, subjects }) {
  const getSubjectColor = (name) => {
    return subjects.find(s => s.name === name)?.color || '#6366f1';
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculate week stats
  let weekTotal = 0;
  let weekCompleted = 0;
  weekDates.forEach(d => {
    const s = getDayStats(d);
    weekTotal += s.total;
    weekCompleted += s.completed;
  });
  const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">📅 Weekly Overview</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(weekDates[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' — '}
            {new Date(weekDates[6] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Week Progress</div>
            <div className={`text-xl font-bold ${weekPct === 100 ? 'text-green-400' : weekPct >= 50 ? 'text-indigo-400' : 'text-gray-400'}`}>
              {weekPct}%
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {weekCompleted}/{weekTotal}
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 divide-x divide-gray-800">
        {weekDates.map((dateStr, i) => {
          const d = new Date(dateStr + 'T00:00:00');
          const dayNum = d.getDate();
          const tasks = getDayTasks(dateStr);
          const stats = getDayStats(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-3 text-left transition-all min-h-[140px] flex flex-col ${
                isSelected
                  ? 'bg-indigo-900/30 ring-2 ring-indigo-500 ring-inset'
                  : isToday
                  ? 'bg-indigo-900/10'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isToday ? 'text-indigo-400' : 'text-gray-500'
                }`}>
                  {DAY_NAMES[i]}
                </span>
                <span className={`text-sm font-bold ${
                  isToday
                    ? 'bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                    : isSelected
                    ? 'text-indigo-400'
                    : 'text-gray-400'
                }`}>
                  {dayNum}
                </span>
              </div>

              {/* Tasks mini list */}
              <div className="flex-1 space-y-1">
                {tasks.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      task.done ? 'bg-green-500' : ''
                    }`} style={{ backgroundColor: task.done ? undefined : getSubjectColor(task.subject) }} />
                    <span className={`text-[10px] truncate ${
                      task.done ? 'text-gray-600 line-through' : 'text-gray-400'
                    }`}>
                      {task.topic}
                    </span>
                  </div>
                ))}
                {tasks.length > 4 && (
                  <span className="text-[9px] text-gray-600">+{tasks.length - 4} more</span>
                )}
              </div>

              {/* Day stats */}
              {tasks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-800/50">
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${stats.percentage}%`,
                        backgroundColor: stats.percentage === 100 ? '#10b981' : '#6366f1'
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-[9px] font-medium ${
                      stats.percentage === 100
                        ? 'text-green-400'
                        : isPast && stats.percentage < 100
                        ? 'text-red-400'
                        : 'text-gray-500'
                    }`}>
                      {stats.completed}/{stats.total}
                    </span>
                    <span className={`text-[9px] font-bold ${
                      stats.percentage === 100 ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {stats.percentage}%
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
