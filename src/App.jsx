import { useState, useMemo, useCallback } from "react";
import { useStudyTracker } from "./hooks/useStudyTracker";
import Sidebar from "./components/Sidebar";
import DaySchedule from "./components/DaySchedule";
import WeeklyView from "./components/WeeklyView";
import WeeklyProgressLineChart from "./components/WeeklyProgressLineChart";
import MonthlyChart from "./components/MonthlyChart";
import MonthlyProgressLineChart from "./components/MonthlyProgressLineChart";
import StatsPanel from "./components/StatsPanel";
import { getWeekDates, getDaysInMonth, formatDate } from "./utils/calender.js";

export default function App() {
  const tracker = useStudyTracker();
  const {
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
    selectedDate,
    setSelectedDate,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
    getDayTasks,
    getDayStats,
    getWeekStats,
    getMonthStats,
    getSubjectStats,
    exportData,
    importData,
    resetAllData,
  } = tracker;

  const parsedDate = useMemo(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return { year: y, month: m - 1 };
  }, [selectedDate]);

  const [currentMonth, setCurrentMonth] = useState(parsedDate.month);
  const [currentYear, setCurrentYear] = useState(parsedDate.year);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const syncMonthYearFromDate = useCallback((dateStr) => {
    const [y, m] = dateStr.split("-").map(Number);
    setCurrentMonth(m - 1);
    setCurrentYear(y);
  }, []);

  const handleExportData = useCallback(() => {
    const payload = exportData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `studytracker-backup-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [exportData]);

  const handleImportData = useCallback(
    (rawData) => {
      const importedDate = importData(rawData);
      syncMonthYearFromDate(importedDate);
    },
    [importData, syncMonthYearFromDate],
  );

  const handleResetApp = useCallback(() => {
    const confirmed = window.confirm(
      "This will permanently clear all subjects and tasks. Continue?",
    );
    if (!confirmed) return;
    const resetDate = resetAllData();
    syncMonthYearFromDate(resetDate);
  }, [resetAllData, syncMonthYearFromDate]);

  // Current day tasks
  const dayTasks = getDayTasks(selectedDate);

  // Week dates for selected date
  const weekDates = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    return getWeekDates(d);
  }, [selectedDate]);

  // Week stats
  const weekStats = useMemo(
    () => getWeekStats(weekDates),
    [getWeekStats, weekDates],
  );

  // Month stats
  const monthStats = useMemo(
    () => getMonthStats(currentYear, currentMonth),
    [getMonthStats, currentYear, currentMonth],
  );

  // Subject stats
  const subjectStats = useMemo(
    () => getSubjectStats(currentYear, currentMonth),
    [getSubjectStats, currentYear, currentMonth],
  );

  // Daily data for chart
  const dailyChartData = useMemo(() => {
    const days = getDaysInMonth(currentYear, currentMonth);
    const data = [];
    for (let d = 1; d <= days; d++) {
      const dateStr = formatDate(currentYear, currentMonth, d);
      const stats = getDayStats(dateStr);
      data.push({
        date: dateStr,
        day: d,
        ...stats,
      });
    }
    return data;
  }, [currentYear, currentMonth, getDayStats]);

  // Calculate streak with a bounded scan to prevent unresponsive loops.
  const streakDays = useMemo(() => {
    let streak = 0;
    const d = new Date();
    const maxDaysToScan = 366;

    for (let scanned = 0; scanned < maxDaysToScan; scanned++) {
      const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
      const stats = getDayStats(dateStr);

      if (stats.total > 0 && stats.completed === stats.total) {
        streak++;
      } else if (stats.total > 0) {
        break;
      }

      d.setDate(d.getDate() - 1);
    }

    return streak;
  }, [getDayStats]);

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* Mobile sidebar toggle: only show when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
          aria-label="Open sidebar"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 transition-transform duration-300`}
      >
        <Sidebar
          subjects={subjects}
          addSubject={addSubject}
          removeSubject={removeSubject}
          updateSubject={updateSubject}
          selectedDate={selectedDate}
          setSelectedDate={(d) => {
            setSelectedDate(d);
            syncMonthYearFromDate(d);
          }}
          currentMonth={currentMonth}
          currentYear={currentYear}
          setCurrentMonth={setCurrentMonth}
          setCurrentYear={setCurrentYear}
          onCloseMobile={() => setSidebarOpen(false)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetApp={handleResetApp}
        />
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
          {/* Top Row: Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-black text-white">Study Planner</h1>
              <p className="text-sm text-gray-500">
                Track your daily study progress — one task at a time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const t = new Date();
                  const todayStr = formatDate(
                    t.getFullYear(),
                    t.getMonth(),
                    t.getDate(),
                  );
                  setSelectedDate(todayStr);
                  setCurrentMonth(t.getMonth());
                  setCurrentYear(t.getFullYear());
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition hidden sm:block"
              >
                📍 Today
              </button>
            </div>
          </div>

          {/* Main layout: content + right stats */}
          <div className="flex gap-5">
            {/* Left: main content */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Weekly Overview */}
              <WeeklyView
                weekDates={weekDates}
                selectedDate={selectedDate}
                setSelectedDate={(d) => {
                  setSelectedDate(d);
                  syncMonthYearFromDate(d);
                }}
                getDayTasks={getDayTasks}
                getDayStats={getDayStats}
                subjects={subjects}
              />

              {/* Day Schedule */}
              <DaySchedule
                date={selectedDate}
                tasks={dayTasks}
                subjects={subjects}
                addTask={addTask}
                toggleTask={toggleTask}
                removeTask={removeTask}
                updateTask={updateTask}
                getDayTasks={getDayTasks}
              />

              <MonthlyChart
                dailyData={dailyChartData}
                selectedDate={selectedDate}
                setSelectedDate={(d) => {
                  setSelectedDate(d);
                  syncMonthYearFromDate(d);
                }}
              />

              <WeeklyProgressLineChart
                weekDates={weekDates}
                getDayStats={getDayStats}
                selectedDate={selectedDate}
                setSelectedDate={(d) => {
                  setSelectedDate(d);
                  syncMonthYearFromDate(d);
                }}
              />

              {/* Monthly Chart */}
              <MonthlyProgressLineChart
                dailyData={dailyChartData}
                selectedDate={selectedDate}
                setSelectedDate={(d) => {
                  setSelectedDate(d);
                  syncMonthYearFromDate(d);
                }}
              />
            </div>

            {/* Right: Stats panel - hidden on small screens */}
            <div className="w-64 flex-shrink-0 hidden xl:block">
              <StatsPanel
                monthStats={monthStats}
                weekStats={weekStats}
                subjectStats={subjectStats}
                subjects={subjects}
                streakDays={streakDays}
              />
            </div>
          </div>

          {/* Stats panel for smaller screens (below chart) */}
          <div className="xl:hidden mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  Month
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {monthStats.completed}
                  <span className="text-sm text-gray-500">
                    /{monthStats.total}
                  </span>
                </div>
                <div className="text-xs text-indigo-400 font-medium">
                  {monthStats.percentage}% done
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  This Week
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  {weekStats.completed}
                  <span className="text-sm text-gray-500">
                    /{weekStats.total}
                  </span>
                </div>
                <div className="text-xs text-purple-400 font-medium">
                  {weekStats.percentage}% done
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  Remaining
                </div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {monthStats.total - monthStats.completed}
                </div>
                <div className="text-xs text-gray-500">tasks left</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  Streak
                </div>
                <div className="text-2xl font-bold text-orange-400 mt-1">
                  {streakDays} 🔥
                </div>
                <div className="text-xs text-gray-500">days</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
