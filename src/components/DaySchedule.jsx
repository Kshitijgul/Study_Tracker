import { useState, useEffect } from 'react';
import { DAY_NAMES, MONTH_NAMES } from '../utils/calender';
import FocusTimer from './FocusTimer';

export default function DaySchedule({ date, tasks, subjects, addTask, toggleTask, removeTask, updateTask, getDayTasks, updateTaskFocusSession, incrementTaskFocusSession, logFocusSession }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || '');
  const [topic, setTopic] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTopic, setEditTopic] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [focusTimerTask, setFocusTimerTask] = useState(null);

  // ← KEY FIX: sync selectedSubject when subjects load after mount
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0].name);
    }
  }, [subjects]);

  const d = new Date(date + 'T00:00:00');
  const dayName = DAY_NAMES[d.getDay()];
  const monthName = MONTH_NAMES[d.getMonth()];
  const dayNum = d.getDate();
  const year = d.getFullYear();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const isToday = date === todayStr;

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = () => {
    if (!topic.trim()) return;
    const subjectToUse = selectedSubject || subjects[0]?.name;
    if (!subjectToUse) return;
    addTask(date, subjectToUse, topic.trim());
    setTopic('');
  };

  const getSubjectColor = (name) => {
    return subjects.find(s => s.name === name)?.color || '#6366f1';
  };

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTopic(task.topic);
  };

  const saveEdit = (taskId) => {
    if (editTopic.trim()) {
      updateTask(date, taskId, { topic: editTopic.trim() });
    }
    setEditingTask(null);
  };

  const copyFromYesterday = () => {
    const yesterday = new Date(date + 'T00:00:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const ydStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yTasks = getDayTasks(ydStr);
    yTasks.forEach(t => {
      addTask(date, t.subject, t.topic);
    });
  };

  const quickTemplates = [
    { subject: 'Linear Algebra', topic: 'Lecture - Eigenvalues & Eigenvectors' },
    { subject: 'Digital Logic', topic: 'Practice - K-Map Problems' },
    { subject: 'Data Structures', topic: 'Implement - Binary Search Tree' },
    { subject: 'Operating Systems', topic: 'Notes - Process Scheduling' },
    { subject: 'Computer Networks', topic: 'Revision - TCP/IP Model' },
  ];

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Day Header */}
      <div className={`px-6 py-4 border-b border-gray-800 ${isToday ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40' : 'bg-gray-900'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              {isToday && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Today
                </span>
              )}
              <h2 className="text-xl font-bold text-white">
                {dayName}, {monthName} {dayNum}, {year}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Completion</div>
                  <div className={`text-lg font-bold ${pct === 100 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {pct}%
                  </div>
                </div>
                <div className="w-12 h-12">
                  <svg viewBox="0 0 36 36" className="transform -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#1f2937" strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#6366f1'}
                      strokeWidth="3"
                      strokeDasharray={`${pct}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{completedCount} of {totalCount} tasks completed</span>
              <span>{totalCount - completedCount} remaining</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
          <div className="flex-shrink-0">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-gray-800 text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none w-full sm:min-w-[160px]"
            >
              {subjects.length === 0 && (
                <option value="">No subjects yet</option>
              )}
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Topic / Lecture / Task</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Lecture 7 - Eigenvalues"
              className="w-full bg-gray-800 text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none placeholder-gray-600"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!topic.trim() || subjects.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm px-5 py-2.5 rounded-lg font-semibold transition flex-shrink-0"
          >
            + Add Task
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={copyFromYesterday}
            className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition font-medium border border-gray-700"
          >
            📋 Copy Yesterday's Plan
          </button>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition font-medium border border-gray-700"
          >
            ⚡ Quick Templates
          </button>
        </div>

        {showQuickAdd && (
          <div className="mt-2 bg-gray-800 rounded-lg border border-gray-700 p-2 space-y-1">
            {quickTemplates
              .filter(qt => subjects.some(s => s.name === qt.subject))
              .map((qt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    addTask(date, qt.subject, qt.topic);
                    setShowQuickAdd(false);
                  }}
                  className="w-full text-left text-xs text-gray-300 hover:bg-gray-700 px-3 py-2 rounded flex items-center gap-2 transition"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getSubjectColor(qt.subject) }} />
                  <span className="font-medium text-gray-400">{qt.subject}</span>
                  <span className="text-gray-500">—</span>
                  <span>{qt.topic}</span>
                </button>
              ))}
            {quickTemplates.filter(qt => subjects.some(s => s.name === qt.subject)).length === 0 && (
              <p className="text-xs text-gray-500 px-3 py-2">Add subjects from the sidebar first</p>
            )}
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-gray-800/50">
        {tasks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-400 text-base font-medium">No tasks scheduled</p>
            <p className="text-gray-600 text-sm mt-1">Add your study plan for this day above</p>
            {subjects.length === 0 && (
              <p className="text-indigo-400 text-xs mt-3 bg-indigo-400/10 px-4 py-2 rounded-lg inline-block">
                👈 First add a subject from the sidebar
              </p>
            )}
            {subjects.length > 0 && (
              <p className="text-gray-700 text-xs mt-3">💡 Tip: Type a topic above and press Enter</p>
            )}
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`px-6 py-3.5 flex items-center gap-3 group transition-all hover:bg-gray-800/30 ${
                task.done ? 'bg-green-900/5' : ''
              }`}
            >
              {/* Number */}
              <span className="text-xs text-gray-600 w-5 text-right font-mono flex-shrink-0">
                {index + 1}
              </span>

              {/* Checkbox */}
              <button
                onClick={() => toggleTask(date, task.id)}
                className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  task.done
                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20'
                    : 'border-gray-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10'
                }`}
              >
                {task.done && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Subject badge */}
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex-shrink-0"
                style={{
                  backgroundColor: getSubjectColor(task.subject) + '20',
                  color: getSubjectColor(task.subject),
                  borderLeft: `3px solid ${getSubjectColor(task.subject)}`,
                }}
              >
                {task.subject}
              </span>

              {/* Topic */}
              {editingTask === task.id ? (
                <input
                  value={editTopic}
                  onChange={e => setEditTopic(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(task.id);
                    if (e.key === 'Escape') setEditingTask(null);
                  }}
                  onBlur={() => saveEdit(task.id)}
                  className="flex-1 bg-gray-800 text-white text-sm px-2 py-1 rounded border border-indigo-500 outline-none"
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 text-sm cursor-pointer ${
                    task.done ? 'line-through text-gray-600' : 'text-gray-200'
                  }`}
                  onDoubleClick={() => startEdit(task)}
                  title="Double-click to edit"
                >
                  {task.topic}
                </span>
              )}

              {/* Status */}
              {task.done && (
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 bg-green-400/10 px-2 py-0.5 rounded">
                  Done ✓
                </span>
              )}

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity flex-shrink-0">
                <button
                  onClick={() => setFocusTimerTask(task)}
                  className="text-gray-500 hover:text-indigo-400 text-xs p-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1"
                  title="Start Focus Session"
                >
                  🎯
                  {task.sessionsCompleted > 0 && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1 rounded">
                      {task.sessionsCompleted}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => startEdit(task)}
                  className="text-gray-500 hover:text-indigo-400 text-xs p-1.5 rounded hover:bg-gray-800 transition"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => removeTask(date, task.id)}
                  className="text-gray-500 hover:text-red-400 text-xs p-1.5 rounded hover:bg-gray-800 transition"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary footer */}
      {tasks.length > 0 && (
        <div className="px-6 py-3 bg-gray-950/50 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              <span className="text-green-400 font-bold">{completedCount}</span> completed
            </span>
            <span className="text-xs text-gray-500">
              <span className="text-amber-400 font-bold">{totalCount - completedCount}</span> pending
            </span>
          </div>
          {pct === 100 && (
            <span className="text-xs text-green-400 font-bold flex items-center gap-1">
              🎉 All done! Great work!
            </span>
          )}
        </div>
      )}

      {/* Focus Timer Modal */}
      {focusTimerTask && (
        <FocusTimer
          task={{ ...focusTimerTask, subjectColor: getSubjectColor(focusTimerTask.subject) }}
          date={date}
          updateTaskFocusSession={updateTaskFocusSession}
          incrementTaskFocusSession={incrementTaskFocusSession}
          logFocusSession={logFocusSession}
          onClose={() => setFocusTimerTask(null)}
        />
      )}
    </div>
  );
}