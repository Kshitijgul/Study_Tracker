import { useRef, useState } from 'react';
import { MONTH_NAMES } from '../utils/calender.js';

export default function Sidebar({
  subjects,
  addSubject,
  removeSubject,
  updateSubject,
  selectedDate,
  setSelectedDate,
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  onCloseMobile,
  onExportData,
  onImportData,
  onResetApp,
}) {
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef(null);

  const handleAdd = () => {
    if (newSubject.trim()) {
      addSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateSubject(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        onImportData(parsed);
      } catch {
        alert('Invalid JSON file. Please choose a valid backup file.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Mini calendar
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDow = new Date(currentYear, currentMonth, 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDow; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-screen overflow-y-auto flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800 relative">
        <button
          onClick={onCloseMobile}
          className="lg:hidden absolute right-4 top-4 text-gray-400 hover:text-white bg-gray-800 border border-gray-700 rounded-lg px-2 py-1"
          aria-label="Close sidebar"
        >
          ✕
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2 pr-10">
          <span className="text-2xl">📚</span> StudyTracker
        </h1>
        <p className="text-xs text-gray-500 mt-1">Plan & Track Your Studies</p>
      </div>

      {/* Month/Year Nav */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
              else setCurrentMonth(currentMonth - 1);
            }}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition"
          >
            ◀
          </button>
          <span className="text-white font-semibold text-sm">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => {
              if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
              else setCurrentMonth(currentMonth + 1);
            }}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition"
          >
            ▶
          </button>
        </div>

        {/* Mini Calendar */}
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] text-gray-600 font-medium py-1">{d}</div>
          ))}
          {calDays.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`text-xs py-1 rounded transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold'
                    : isToday
                    ? 'bg-indigo-900/50 text-indigo-300 font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setSelectedDate(todayStr);
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
          }}
          className="mt-3 w-full text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 py-1.5 rounded transition font-medium"
        >
          📍 Go to Today
        </button>
      </div>

      {/* Subjects */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          My Subjects
        </h3>
        <div className="space-y-1.5 mb-3">
          {subjects.map(s => (
            <div key={s.id} className="flex items-center gap-2 group">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              {editingId === s.id ? (
                <div className="flex-1 flex gap-1">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    className="flex-1 bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-700 focus:border-indigo-500 outline-none"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="text-green-400 text-xs hover:text-green-300">✓</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs hover:text-gray-300">✕</button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-gray-300 flex-1 truncate">{s.name}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button onClick={() => startEdit(s)} className="text-gray-500 hover:text-indigo-400 text-[10px]">✏️</button>
                    <button onClick={() => removeSubject(s.id)} className="text-gray-500 hover:text-red-400 text-[10px]">🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          <input
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add subject..."
            className="flex-1 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 outline-none placeholder-gray-600"
          />
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition"
          >
            +
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Backup</h3>
          <button
            onClick={onExportData}
            className="w-full text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-lg border border-gray-700 transition"
          >
            Export Data (.json)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-lg border border-gray-700 transition"
          >
            Import Data (.json)
          </button>

          <div className="pt-3 border-t border-red-900/40">
            <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold mb-2">Danger Zone</p>
            <button
              onClick={onResetApp}
              className="w-full text-xs bg-red-900/30 hover:bg-red-900/40 text-red-300 py-2 rounded-lg border border-red-800 transition"
            >
              Reset App
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
