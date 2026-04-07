import { useState, useCallback, useEffect } from 'react';
import { getNextColor } from '../utils/colors';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const DEFAULT_SUBJECTS = [
  { id: 's1', name: 'Linear Algebra', color: '#6366f1' },
  { id: 's2', name: 'Digital Logic', color: '#ec4899' },
  { id: 's3', name: 'Data Structures', color: '#f59e0b' },
  { id: 's4', name: 'Operating Systems', color: '#10b981' },
  { id: 's5', name: 'Computer Networks', color: '#3b82f6' },
];

export function useStudyTracker() {
  const [subjects, setSubjects] = useState(() =>
    loadFromStorage('st_subjects', DEFAULT_SUBJECTS)
  );

  const [dayDataMap, setDayDataMap] = useState(() =>
    loadFromStorage('st_days', {})
  );

  const [selectedDate, setSelectedDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });

  const getTodayDateString = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage('st_subjects', subjects);
  }, [subjects]);

  useEffect(() => {
    saveToStorage('st_days', dayDataMap);
  }, [dayDataMap]);

  // Subject CRUD
  const addSubject = useCallback((name) => {
    setSubjects(prev => {
      const usedColors = prev.map(s => s.color);
      const newSubject = {
        id: generateId(),
        name,
        color: getNextColor(usedColors),
      };
      return [...prev, newSubject];
    });
  }, []);

  const removeSubject = useCallback((id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSubject = useCallback((id, name) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  }, []);

  // Task CRUD for a given date
  const addTask = useCallback((date, subject, topic) => {
    setDayDataMap(prev => {
      const dayData = prev[date] || { date, tasks: [] };
      const newTask = {
        id: generateId(),
        subject,
        topic,
        done: false,
      };
      return {
        ...prev,
        [date]: { ...dayData, tasks: [...dayData.tasks, newTask] },
      };
    });
  }, []);

  const toggleTask = useCallback((date, taskId) => {
    setDayDataMap(prev => {
      const dayData = prev[date];
      if (!dayData) return prev;
      return {
        ...prev,
        [date]: {
          ...dayData,
          tasks: dayData.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        },
      };
    });
  }, []);

  const removeTask = useCallback((date, taskId) => {
    setDayDataMap(prev => {
      const dayData = prev[date];
      if (!dayData) return prev;
      return {
        ...prev,
        [date]: {
          ...dayData,
          tasks: dayData.tasks.filter(t => t.id !== taskId),
        },
      };
    });
  }, []);

  const updateTask = useCallback((date, taskId, updates) => {
    setDayDataMap(prev => {
      const dayData = prev[date];
      if (!dayData) return prev;
      return {
        ...prev,
        [date]: {
          ...dayData,
          tasks: dayData.tasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        },
      };
    });
  }, []);

  // Stats helpers
  const getDayTasks = useCallback((date) => {
    return dayDataMap[date]?.tasks || [];
  }, [dayDataMap]);

  const getDayStats = useCallback((date) => {
    const tasks = getDayTasks(date);
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [getDayTasks]);

  const getWeekStats = useCallback((dates) => {
    let total = 0;
    let completed = 0;
    dates.forEach(d => {
      const stats = getDayStats(d);
      total += stats.total;
      completed += stats.completed;
    });
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [getDayStats]);

  const getMonthStats = useCallback((year, month) => {
    let total = 0;
    let completed = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const stats = getDayStats(dateStr);
      total += stats.total;
      completed += stats.completed;
    }
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [getDayStats]);

  const getSubjectStats = useCallback((year, month) => {
    const subjectMap = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const tasks = getDayTasks(dateStr);
      tasks.forEach(task => {
        if (!subjectMap[task.subject]) {
          subjectMap[task.subject] = { total: 0, completed: 0 };
        }
        subjectMap[task.subject].total += 1;
        if (task.done) subjectMap[task.subject].completed += 1;
      });
    }
    return subjectMap;
  }, [getDayTasks]);

  const exportData = useCallback(() => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      selectedDate,
      subjects,
      dayDataMap,
    };
  }, [selectedDate, subjects, dayDataMap]);

  const importData = useCallback((rawData) => {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid file format. Please upload a valid JSON backup.');
    }

    const nextSubjects = Array.isArray(rawData.subjects)
      ? rawData.subjects
          .filter(s => s && typeof s.name === 'string' && s.name.trim())
          .map((s, index) => ({
            id: typeof s.id === 'string' && s.id ? s.id : `sub-${index}-${generateId()}`,
            name: s.name.trim(),
            color: typeof s.color === 'string' && s.color ? s.color : getNextColor([]),
          }))
      : [];

    const sourceMap = rawData.dayDataMap;
    const nextDayDataMap = {};

    if (sourceMap && typeof sourceMap === 'object' && !Array.isArray(sourceMap)) {
      Object.entries(sourceMap).forEach(([dateKey, dayData]) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
        const tasks = Array.isArray(dayData?.tasks)
          ? dayData.tasks
              .filter(task => task && typeof task.topic === 'string' && task.topic.trim())
              .map((task, index) => ({
                id: typeof task.id === 'string' && task.id ? task.id : `task-${index}-${generateId()}`,
                subject: typeof task.subject === 'string' && task.subject.trim() ? task.subject.trim() : 'General',
                topic: task.topic.trim(),
                done: Boolean(task.done),
              }))
          : [];

        nextDayDataMap[dateKey] = { date: dateKey, tasks };
      });
    }

    const nextSelectedDate =
      typeof rawData.selectedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawData.selectedDate)
        ? rawData.selectedDate
        : getTodayDateString();

    setSubjects(nextSubjects.length > 0 ? nextSubjects : DEFAULT_SUBJECTS);
    setDayDataMap(nextDayDataMap);
    setSelectedDate(nextSelectedDate);

    return nextSelectedDate;
  }, []);

  const resetAllData = useCallback(() => {
    const today = getTodayDateString();
    setSubjects(DEFAULT_SUBJECTS);
    setDayDataMap({});
    setSelectedDate(today);
    return today;
  }, []);

  return {
    subjects,
    addSubject,
    removeSubject,
    updateSubject,
    dayDataMap,
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
  };
}
