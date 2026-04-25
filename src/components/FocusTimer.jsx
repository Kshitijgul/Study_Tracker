import React, { useState, useEffect, useRef } from "react";

function FocusTimer({
  task,
  date,
  updateTaskFocusSession,
  incrementTaskFocusSession,
  logFocusSession,
  onClose,
}) {
  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(task.sessionsCompleted || 0);
  const [focusTimeMin, setFocusTimeMin] = useState(task.focusTime || 25);
  const [breakTimeMin, setBreakTimeMin] = useState(task.breakTime || 5);
  const [sessionsNeeded, setSessionsNeeded] = useState(task.sessionsNeeded || 1);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState((task.focusTime || 25) * 60);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Refs
  const intervalRef = useRef(null);
  const timeLeftRef = useRef((task.focusTime || 25) * 60);
  const modeRef = useRef("focus");
  const isRunningRef = useRef(false);
  const focusTimeMinRef = useRef(task.focusTime || 25);
  const breakTimeMinRef = useRef(task.breakTime || 5);
  const sessionStartTimeRef = useRef(null);
  const currentSessionIdRef = useRef(null);

  // ── Wall clock refs — the KEY fix for tab switching ──
  const wallClockStartRef = useRef(null);   // when interval started
  const totalSecondsRef = useRef((task.focusTime || 25) * 60); // total for current mode

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { focusTimeMinRef.current = focusTimeMin; }, [focusTimeMin]);
  useEffect(() => { breakTimeMinRef.current = breakTimeMin; }, [breakTimeMin]);
  useEffect(() => { sessionStartTimeRef.current = sessionStartTime; }, [sessionStartTime]);
  useEffect(() => { currentSessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // Notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fullscreen handler
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

  // ── Tick function — uses wall clock, not tick count ──
  const tickFn = () => {
    if (!isRunningRef.current || !wallClockStartRef.current) return;

    // Calculate true remaining time based on real clock
    const elapsed = Math.floor((Date.now() - wallClockStartRef.current) / 1000);
    const newTime = Math.max(totalSecondsRef.current - elapsed, 0);

    timeLeftRef.current = newTime;
    setTimeLeft(newTime);

    if (newTime <= 0) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isRunningRef.current = false;
      setIsRunning(false);

      // ── Correct end time = when timer actually should have ended ──
      const sessionEndTime = new Date(
        wallClockStartRef.current + totalSecondsRef.current * 1000
      ).toISOString();

      if (modeRef.current === "focus") {
        if (sessionStartTimeRef.current && currentSessionIdRef.current) {
          logFocusSession(
            date,
            task.id,
            task.subject_id,
            focusTimeMinRef.current,
            sessionStartTimeRef.current,
            sessionEndTime,
          );
        }
        incrementTaskFocusSession(date, task.id);
        setSessionsCompleted((prev) => prev + 1);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Focus Session Complete!", { body: "Time for a break!" });
        }

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

      } else {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Break Over!", { body: "Ready for next focus session?" });
        }

        // Switch to focus
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

  // Update tick ref every render so it never captures stale closures
  const tick = useRef(tickFn);
  tick.current = tickFn;

  const startInterval = () => {
    if (intervalRef.current) return;
    isRunningRef.current = true;

    // Account for time already elapsed (pause/resume support)
    const alreadyElapsed = totalSecondsRef.current - timeLeftRef.current;
    wallClockStartRef.current = Date.now() - alreadyElapsed * 1000;

    // 500ms interval — recovers faster after tab switch throttling
    intervalRef.current = setInterval(() => tick.current(), 500);
  };

  const stopInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    isRunningRef.current = false;
    // Don't reset wallClockStartRef here — needed for pause/resume
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

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
    // Save current timeLeft so resume picks up from here
    timeLeftRef.current = timeLeft;
    wallClockStartRef.current = null; // reset so startInterval recalculates
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

  // Fullscreen render
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 text-white/50 hover:text-white text-3xl"
        >
          ✕
        </button>
        <div className="text-center">
          <div className="mb-8">
            <span className={`text-lg font-medium ${mode === "focus" ? "text-indigo-400" : "text-green-400"}`}>
              {mode === "focus" ? "🎯 FOCUS MODE" : "☕ BREAK TIME"}
            </span>
          </div>
          <div className="font-mono text-[180px] leading-none text-white font-bold tracking-wider">
            {formatTime(timeLeft)}
          </div>
          <div className="mt-8 text-white/60 text-xl">{task.topic}</div>
          <div className="mt-4 flex items-center justify-center gap-2 text-white/40 text-lg">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.subjectColor || "#6366f1" }} />
            <span>{task.subject}</span>
          </div>
          <div className="mt-12 flex items-center justify-center gap-4">
            {!isRunning ? (
              <button onClick={handleStart} className="px-8 py-3 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                ▶ Start
              </button>
            ) : (
              <button onClick={handlePause} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors">
                ⏸ Pause
              </button>
            )}
            <button onClick={handleReset} className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors">
              ↻ Reset
            </button>
          </div>
          <div className="mt-8 text-white/40 text-sm">Press ESC or click ✕ to exit fullscreen</div>
        </div>
      </div>
    );
  }

  // Normal modal render
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">🎯 Focus Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subjectColor || "#6366f1" }} />
            <span className="text-xs font-medium text-gray-600">{task.subject}</span>
          </div>
          <p className="text-gray-800 font-medium text-sm">{task.topic}</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === "focus" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === "break" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              ☕ Break
            </button>
          </div>

          <div className="relative w-40 h-40 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="72" stroke="#e5e7eb" strokeWidth="10" fill="none" />
              <circle
                cx="80" cy="80" r="72"
                stroke={mode === "focus" ? "#6366f1" : "#22c55e"}
                strokeWidth="10" fill="none"
                strokeDasharray={2 * Math.PI * 72}
                strokeDashoffset={2 * Math.PI * 72 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-800 font-mono">{formatTime(timeLeft)}</span>
              <span className="text-xs text-gray-500 mt-0.5">{mode === "focus" ? "Focus Time" : "Break Time"}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {!isRunning ? (
              <button onClick={handleStart} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm">
                ▶ Start
              </button>
            ) : (
              <button onClick={handlePause} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors text-sm">
                ⏸ Pause
              </button>
            )}
            <button onClick={handleReset} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm">
              ↻ Reset
            </button>
            <button onClick={() => setIsFullscreen(true)} className="px-4 py-2.5 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors text-sm">
              ⛶ Fullscreen
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
            <span>Sessions Completed</span>
            <span className="font-medium">{sessionsCompleted} / {sessionsNeeded}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((sessionsCompleted / sessionsNeeded) * 100, 100)}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
        >
          ⚙️ {showSettings ? "Hide" : "Configure"} Session Settings
        </button>

        {showSettings && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Focus Time (min)</label>
                <input type="number" min="1" max="120" value={focusTimeMin}
                  onChange={(e) => setFocusTimeMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Break Time (min)</label>
                <input type="number" min="1" max="60" value={breakTimeMin}
                  onChange={(e) => setBreakTimeMin(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sessions Needed</label>
              <input type="number" min="1" max="20" value={sessionsNeeded}
                onChange={(e) => setSessionsNeeded(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button onClick={handleSaveSettings}
              className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusTimer;