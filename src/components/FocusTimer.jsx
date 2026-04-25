import React, { useState, useEffect, useRef } from "react";

const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem('focusTimerSettings');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { focusTimeMin: 25, breakTimeMin: 5, sessionsNeeded: 1 };
};

const saveSettings = (focusTimeMin, breakTimeMin, sessionsNeeded) => {
  try {
    localStorage.setItem('focusTimerSettings', JSON.stringify({ focusTimeMin, breakTimeMin, sessionsNeeded }));
  } catch {}
};

function FocusTimer({
  task, date, updateTaskFocusSession,
  incrementTaskFocusSession, logFocusSession, onClose,
}) {
  const savedSettings = getSavedSettings();

  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(task.sessionsCompleted || 0);
  const [focusTimeMin, setFocusTimeMin] = useState(task.focusTime || savedSettings.focusTimeMin);
  const [breakTimeMin, setBreakTimeMin] = useState(task.breakTime || savedSettings.breakTimeMin);
  const [sessionsNeeded, setSessionsNeeded] = useState(task.sessionsNeeded || savedSettings.sessionsNeeded);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState((task.focusTime || savedSettings.focusTimeMin) * 60);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [alarmFile, setAlarmFile] = useState(null);
  const [alarmFileName, setAlarmFileName] = useState('');

  // Refs
  const intervalRef = useRef(null);
  const timeLeftRef = useRef((task.focusTime || savedSettings.focusTimeMin) * 60);
  const modeRef = useRef("focus");
  const isRunningRef = useRef(false);
  const focusTimeMinRef = useRef(task.focusTime || savedSettings.focusTimeMin);
  const breakTimeMinRef = useRef(task.breakTime || savedSettings.breakTimeMin);
  const sessionStartTimeRef = useRef(null);
  const currentSessionIdRef = useRef(null);
  const wallClockStartRef = useRef(null);
  const totalSecondsRef = useRef((task.focusTime || savedSettings.focusTimeMin) * 60);
  const audioRef = useRef(null);
  const alarmTimeoutRef = useRef(null);
  const alarmUrlRef = useRef(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { focusTimeMinRef.current = focusTimeMin; }, [focusTimeMin]);
  useEffect(() => { breakTimeMinRef.current = breakTimeMin; }, [breakTimeMin]);
  useEffect(() => { sessionStartTimeRef.current = sessionStartTime; }, [sessionStartTime]);
  useEffect(() => { currentSessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // Load saved alarm from localStorage
  useEffect(() => {
    try {
      const savedAlarmName = localStorage.getItem('alarmFileName');
      if (savedAlarmName) setAlarmFileName(savedAlarmName);
    } catch {}
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) document.exitFullscreen?.();
    }
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen]);

  // ── Alarm functions ──
  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (alarmUrlRef.current) {
      const audio = new Audio(alarmUrlRef.current);
      audio.loop = true;
      audio.volume = 0.8;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setAlarmPlaying(true);

      // Auto stop after 10 seconds
      alarmTimeoutRef.current = setTimeout(() => {
        stopAlarm();
      }, 10000);
    } else {
      // Fallback: beep using Web Audio API
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        let beepCount = 0;
        const beep = () => {
          if (beepCount >= 5) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          beepCount++;
          setTimeout(beep, 600);
        };
        beep();
        setAlarmPlaying(true);
        alarmTimeoutRef.current = setTimeout(() => setAlarmPlaying(false), 10000);
      } catch {}
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    setAlarmPlaying(false);
  };

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
      clearInterval(intervalRef.current);
      if (alarmUrlRef.current) {
        URL.revokeObjectURL(alarmUrlRef.current);
      }
    };
  }, []);

  const handleAlarmUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (alarmUrlRef.current) URL.revokeObjectURL(alarmUrlRef.current);
    alarmUrlRef.current = URL.createObjectURL(file);
    setAlarmFile(file);
    setAlarmFileName(file.name);
    try {
      localStorage.setItem('alarmFileName', file.name);
    } catch {}
  };

  // ── Complete session manually ──
  const handleCompleteSession = () => {
    stopInterval();
    setIsRunning(false);

    const sessionEndTime = new Date().toISOString();

    if (modeRef.current === "focus" && sessionStartTimeRef.current) {
      const elapsed = wallClockStartRef.current
        ? Math.floor((Date.now() - wallClockStartRef.current) / 1000)
        : focusTimeMinRef.current * 60;
      const actualMinutes = Math.max(1, Math.round(elapsed / 60));

      logFocusSession(
        date, task.id, task.subject_id,
        actualMinutes,
        sessionStartTimeRef.current,
        sessionEndTime,
      );
      incrementTaskFocusSession(date, task.id);
      setSessionsCompleted(prev => prev + 1);
    }

    playAlarm();

    // Switch to break
    modeRef.current = "break";
    setMode("break");
    const breakSecs = breakTimeMinRef.current * 60;
    totalSecondsRef.current = breakSecs;
    timeLeftRef.current = breakSecs;
    setTimeLeft(breakSecs);
    wallClockStartRef.current = null;
    sessionStartTimeRef.current = null;
    currentSessionIdRef.current = null;
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  // ── Skip break ──
  const handleSkipBreak = () => {
    stopInterval();
    setIsRunning(false);
    modeRef.current = "focus";
    setMode("focus");
    const focusSecs = focusTimeMinRef.current * 60;
    totalSecondsRef.current = focusSecs;
    timeLeftRef.current = focusSecs;
    setTimeLeft(focusSecs);
    wallClockStartRef.current = null;
    setSessionStartTime(null);
    setCurrentSessionId(null);
    sessionStartTimeRef.current = null;
    currentSessionIdRef.current = null;
  };

  const tickFn = () => {
    if (!isRunningRef.current || !wallClockStartRef.current) return;
    const elapsed = Math.floor((Date.now() - wallClockStartRef.current) / 1000);
    const newTime = Math.max(totalSecondsRef.current - elapsed, 0);
    timeLeftRef.current = newTime;
    setTimeLeft(newTime);

    if (newTime <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isRunningRef.current = false;
      setIsRunning(false);

      const sessionEndTime = new Date(
        wallClockStartRef.current + totalSecondsRef.current * 1000
      ).toISOString();

      playAlarm();

      if (modeRef.current === "focus") {
        if (sessionStartTimeRef.current && currentSessionIdRef.current) {
          logFocusSession(
            date, task.id, task.subject_id,
            focusTimeMinRef.current,
            sessionStartTimeRef.current,
            sessionEndTime,
          );
        }
        incrementTaskFocusSession(date, task.id);
        setSessionsCompleted(prev => prev + 1);

        modeRef.current = "break";
        setMode("break");
        const breakSecs = breakTimeMinRef.current * 60;
        totalSecondsRef.current = breakSecs;
        timeLeftRef.current = breakSecs;
        setTimeLeft(breakSecs);
        wallClockStartRef.current = null;
        sessionStartTimeRef.current = null;
        currentSessionIdRef.current = null;
        setSessionStartTime(null);
        setCurrentSessionId(null);
      } else {
        modeRef.current = "focus";
        setMode("focus");
        const focusSecs = focusTimeMinRef.current * 60;
        totalSecondsRef.current = focusSecs;
        timeLeftRef.current = focusSecs;
        setTimeLeft(focusSecs);
        wallClockStartRef.current = null;
      }
    }
  };

  const tick = useRef(tickFn);
  tick.current = tickFn;

  const startInterval = () => {
    if (intervalRef.current) return;
    isRunningRef.current = true;
    const alreadyElapsed = totalSecondsRef.current - timeLeftRef.current;
    wallClockStartRef.current = Date.now() - alreadyElapsed * 1000;
    intervalRef.current = setInterval(() => tick.current(), 500);
  };

  const stopInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    isRunningRef.current = false;
  };

  const handleStart = () => {
    if (mode === "focus" && !sessionStartTime) {
      const startTime = new Date().toISOString();
      const sessionId = Date.now().toString();
      setSessionStartTime(startTime);
      setCurrentSessionId(sessionId);
      sessionStartTimeRef.current = startTime;
      currentSessionIdRef.current = sessionId;
    }
    setIsRunning(true);
    startInterval();
  };

  const handlePause = () => {
    setIsRunning(false);
    stopInterval();
    timeLeftRef.current = timeLeft;
    wallClockStartRef.current = null;
  };

  const handleReset = () => {
    stopInterval();
    setIsRunning(false);
    wallClockStartRef.current = null;
    const resetTime = mode === "focus" ? focusTimeMin * 60 : breakTimeMin * 60;
    totalSecondsRef.current = resetTime;
    timeLeftRef.current = resetTime;
    setTimeLeft(resetTime);
    setSessionStartTime(null);
    setCurrentSessionId(null);
    sessionStartTimeRef.current = null;
    currentSessionIdRef.current = null;
  };

  const handleSaveSettings = () => {
    saveSettings(focusTimeMin, breakTimeMin, sessionsNeeded);
    updateTaskFocusSession(date, task.id, focusTimeMin, breakTimeMin, sessionsNeeded);
    const resetTime = mode === "focus" ? focusTimeMin * 60 : breakTimeMin * 60;
    totalSecondsRef.current = resetTime;
    timeLeftRef.current = resetTime;
    setTimeLeft(resetTime);
    focusTimeMinRef.current = focusTimeMin;
    breakTimeMinRef.current = breakTimeMin;
    wallClockStartRef.current = null;
    setShowSettings(false);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const totalTimeForMode = mode === "focus" ? focusTimeMin * 60 : breakTimeMin * 60;
  const progress = ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100;

  // ── Minimized floating pill ──
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl cursor-pointer transition-all ${
          mode === "focus"
            ? "bg-gray-900 border-indigo-500/50 shadow-indigo-500/20"
            : "bg-gray-900 border-green-500/50 shadow-green-500/20"
        }`}>
          {/* Mode indicator */}
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            mode === "focus" ? "bg-indigo-400" : "bg-green-400"
          }`} />

          {/* Timer */}
          <span className={`font-mono font-black text-xl ${
            mode === "focus" ? "text-white" : "text-green-400"
          }`}>
            {formatTime(timeLeft)}
          </span>

          <span className="text-gray-500 text-xs">
            {mode === "focus" ? "Focus" : "Break"}
          </span>

          {/* Controls */}
          <div className="flex gap-1.5 ml-1">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="w-8 h-8 rounded-lg bg-lime-400 hover:bg-lime-300 text-gray-950 flex items-center justify-center text-xs font-bold transition"
              >
                ▶
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center text-xs transition"
              >
                ⏸
              </button>
            )}
            <button
              onClick={() => setIsMinimized(false)}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-xs transition"
              title="Expand"
            >
              ⬆
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 text-gray-500 hover:text-red-400 flex items-center justify-center text-xs transition"
            >
              ✕
            </button>
          </div>

          {/* Alarm playing indicator */}
          {alarmPlaying && (
            <button
              onClick={stopAlarm}
              className="w-8 h-8 rounded-lg bg-red-500 animate-pulse text-white flex items-center justify-center text-xs"
              title="Stop alarm"
            >
              🔔
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fullscreen render
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 text-gray-500 hover:text-white text-sm w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center transition"
        >
          ✕
        </button>
        <div className="text-center">
          <div className="mb-6">
            <span className={`text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${
              mode === "focus"
                ? "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                : "text-green-400 bg-green-400/10 border-green-400/20"
            }`}>
              {mode === "focus" ? "🎯 Focus Mode" : "☕ Break Time"}
            </span>
          </div>
          <div className={`font-mono text-[160px] leading-none font-black tracking-wider ${
            mode === "focus" ? "text-white" : "text-green-400"
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="mt-6 text-gray-400 text-xl">{task.topic}</div>
          <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.subjectColor || "#6366f1" }} />
            <span>{task.subject}</span>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            {!isRunning ? (
              <button onClick={handleStart} className="px-8 py-3 bg-lime-400 hover:bg-lime-300 text-gray-950 rounded-xl font-bold text-base transition">
                ▶ Start
              </button>
            ) : (
              <button onClick={handlePause} className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-base transition">
                ⏸ Pause
              </button>
            )}
            <button onClick={handleReset} className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl font-bold text-base transition">
              ↻ Reset
            </button>
            {mode === "focus" && (
              <button onClick={handleCompleteSession} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-base transition">
                ✓ Complete
              </button>
            )}
            {mode === "break" && (
              <button onClick={handleSkipBreak} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-base transition">
                ⏭ Skip Break
              </button>
            )}
          </div>
          {alarmPlaying && (
            <button onClick={stopAlarm} className="mt-6 px-6 py-3 bg-red-500 animate-pulse text-white rounded-xl font-bold transition">
              🔔 Stop Alarm
            </button>
          )}
        </div>
      </div>
    );
  }

  // Normal modal
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">🎯 Focus Session</h3>
          <div className="flex gap-2">
            {/* Alarm upload */}
            <label
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-amber-400 hover:border-amber-400/50 flex items-center justify-center transition cursor-pointer text-sm"
              title={alarmFileName ? `Alarm: ${alarmFileName}` : "Upload alarm tone"}
            >
              🔔
              <input type="file" accept="audio/*" onChange={handleAlarmUpload} className="hidden" />
            </label>
            {/* Test alarm */}
            {alarmPlaying ? (
              <button
                onClick={stopAlarm}
                className="w-8 h-8 rounded-lg bg-red-500 animate-pulse text-white flex items-center justify-center text-xs transition"
                title="Stop alarm"
              >
                ■
              </button>
            ) : (
              <button
                onClick={playAlarm}
                className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-lime-400 hover:border-lime-400/50 flex items-center justify-center transition text-xs"
                title="Test alarm"
              >
                ▶🔔
              </button>
            )}
            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition text-xs"
              title="Minimize"
            >
              ─
            </button>
            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition text-xs"
              title="Fullscreen"
            >
              ⛶
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-400/50 flex items-center justify-center transition text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Alarm file indicator */}
        {alarmFileName && (
          <div className="mb-3 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg flex items-center gap-2">
            <span className="text-amber-400 text-xs">🔔</span>
            <span className="text-amber-400 text-[11px] truncate">{alarmFileName}</span>
          </div>
        )}

        {/* Alarm playing banner */}
        {alarmPlaying && (
          <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
            <span className="text-red-400 text-xs font-bold animate-pulse">🔔 Alarm ringing...</span>
            <button onClick={stopAlarm} className="px-3 py-1 bg-red-500 hover:bg-red-400 text-white text-xs rounded-lg font-bold transition">
              Stop
            </button>
          </div>
        )}

        {/* Task Info */}
        <div className="mb-5 p-3 bg-gray-800/60 border border-gray-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subjectColor || "#6366f1" }} />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{task.subject}</span>
          </div>
          <p className="text-white font-medium text-sm ml-4">{task.topic}</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 mb-5 p-1 bg-gray-800 rounded-xl border border-gray-700">
          <button
            onClick={() => {
              stopInterval();
              setMode("focus");
              const t = focusTimeMin * 60;
              totalSecondsRef.current = t;
              timeLeftRef.current = t;
              setTimeLeft(t);
              wallClockStartRef.current = null;
              setIsRunning(false);
              setSessionStartTime(null);
              setCurrentSessionId(null);
              sessionStartTimeRef.current = null;
              currentSessionIdRef.current = null;
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "focus" ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            🎯 Focus
          </button>
          <button
            onClick={() => {
              stopInterval();
              setMode("break");
              const t = breakTimeMin * 60;
              totalSecondsRef.current = t;
              timeLeftRef.current = t;
              setTimeLeft(t);
              wallClockStartRef.current = null;
              setIsRunning(false);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "break" ? "bg-green-600 text-white shadow-md" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            ☕ Break
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-44 h-44 mx-auto mb-5">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="72" stroke="#1f2937" strokeWidth="10" fill="none" />
            <circle
              cx="80" cy="80" r="72"
              stroke={mode === "focus" ? "#6366f1" : "#22c55e"}
              strokeWidth="10" fill="none"
              strokeDasharray={2 * Math.PI * 72}
              strokeDashoffset={2 * Math.PI * 72 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black font-mono ${mode === "focus" ? "text-white" : "text-green-400"}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              {mode === "focus" ? "Focus Time" : "Break Time"}
            </span>
            <span className="text-[9px] text-gray-600 mt-0.5">
              {focusTimeMin}m / {breakTimeMin}m break
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {!isRunning ? (
            <button onClick={handleStart} className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-950 rounded-xl font-bold transition text-sm shadow-md shadow-lime-400/20">
              ▶ Start
            </button>
          ) : (
            <button onClick={handlePause} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold transition text-sm">
              ⏸ Pause
            </button>
          )}
          <button onClick={handleReset} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl font-medium transition text-sm">
            ↻ Reset
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {mode === "focus" && (
            <button
              onClick={handleCompleteSession}
              className="flex-1 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 hover:border-green-500/50 rounded-xl font-bold text-xs transition"
            >
              ✓ Complete Session
            </button>
          )}
          {mode === "break" && (
            <button
              onClick={handleSkipBreak}
              className="flex-1 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 hover:border-indigo-500/50 rounded-xl font-bold text-xs transition"
            >
              ⏭ Skip Break
            </button>
          )}
        </div>

        {/* Sessions Progress */}
        <div className="mb-4 p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500">Sessions Completed</span>
            <span className="font-bold text-white">{sessionsCompleted} / {sessionsNeeded}</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((sessionsCompleted / sessionsNeeded) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1.5 border border-gray-800 hover:border-gray-700 rounded-xl transition"
        >
          ⚙️ {showSettings ? "Hide" : "Configure"} Settings
          {!showSettings && (
            <span className="text-[10px] text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full ml-1">
              {focusTimeMin}m focus · {breakTimeMin}m break
            </span>
          )}
        </button>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Timer Settings</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Focus (min)</label>
                <input type="number" min="1" max="120" value={focusTimeMin}
                  onChange={(e) => setFocusTimeMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Break (min)</label>
                <input type="number" min="1" max="60" value={breakTimeMin}
                  onChange={(e) => setBreakTimeMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sessions Needed</label>
              <input type="number" min="1" max="20" value={sessionsNeeded}
                onChange={(e) => setSessionsNeeded(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none" />
            </div>

            {/* Alarm section */}
            <div className="pt-2 border-t border-gray-700">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                🔔 Alarm Tone
              </label>
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 hover:border-amber-400/50 rounded-lg cursor-pointer transition">
                <span className="text-amber-400 text-sm">🔔</span>
                <span className="text-gray-400 text-xs flex-1 truncate">
                  {alarmFileName || "Click to upload alarm tone (.mp3, .wav)"}
                </span>
                <input type="file" accept="audio/*" onChange={handleAlarmUpload} className="hidden" />
              </label>
              {alarmFileName && (
                <button onClick={playAlarm} className="mt-2 w-full py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 rounded-lg text-xs font-medium transition">
                  ▶ Test Alarm
                </button>
              )}
            </div>

            <button onClick={handleSaveSettings}
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-950 rounded-xl text-xs font-bold transition">
              Save & Apply Settings
            </button>
            <p className="text-[10px] text-gray-600 text-center">Settings remembered for future sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusTimer;