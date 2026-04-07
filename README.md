# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# StudyTracker - Complete Development Documentation

> A comprehensive guide explaining every file, function, and design decision. Use this to understand the architecture or rebuild from scratch.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [File Structure](#file-structure)
4. [Creation Flow - Order & Why](#creation-flow---order--why)
5. [Detailed File Breakdown](#detailed-file-breakdown)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Key Functions Explained](#key-functions-explained)
8. [How to Rebuild From Scratch](#how-to-rebuild-from-scratch)
9. [Interview Talking Points](#interview-talking-points)

---

## Project Overview

**StudyTracker** is a personal study planning and progress tracking application that helps users:
- Plan daily study tasks (subjects, lectures, topics)
- Track completion with checkboxes
- Visualize progress through weekly and monthly charts
- Backup/restore data via JSON files
- Manage subjects with color coding

**Key Features:**
- Daily task scheduler with subject selection
- Weekly overview (7-day grid)
- Monthly progress charts (bar + line graphs)
- Statistics panel (completion %, streak, subject breakdown)
- Data export/import for backup
- LocalStorage persistence

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | UI component framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Styling utility classes |
| **JavaScript (JSX)** | No TypeScript - plain JS for simplicity |
| **LocalStorage** | Client-side data persistence |
| **SVG** | Custom charts (no chart libraries) |

**Why these choices:**
- Vite: Fast HMR, simple config
- Tailwind: Rapid UI development, no CSS files needed
- LocalStorage: Zero backend, works offline, instant load
- Custom SVG charts: Full control, no dependency bloat

---

## File Structure

```
study-tracker/
├── public/
│   ├── data.json              # Sample backup data structure
│   └── vite.svg               # Favicon
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Left panel: calendar, subjects, backup
│   │   ├── WeeklyView.jsx     # Top: 7-day task overview grid
│   │   ├── DaySchedule.jsx    # Center: daily task list
│   │   ├── MonthlyChart.jsx   # Bottom: monthly bar chart
│   │   ├── MonthlyProgressLineChart.jsx  # Monthly line graph
│   │   ├── WeeklyProgressLineChart.jsx   # Weekly line graph
│   │   └── StatsPanel.jsx     # Right: stats & progress donut
│   ├── hooks/
│   │   └── useStudyTracker.js # Custom hook: all state & logic
│   ├── utils/
│   │   ├── calendar.js        # Date helpers (week calc, formatting)
│   │   └── colors.js          # Subject color assignments
│   ├── App.jsx                # Main layout & component composition
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind imports + custom styles
── index.html                 # HTML entry point
── package.json               # Dependencies
── vite.config.js             # Vite configuration
└── tsconfig.json              # JS compatibility config
```

---

## Creation Flow - Order & Why

### Phase 1: Foundation (Files 1-5)

| Order | File | Why First |
|-------|------|-----------|
| 1 | `index.html` | Entry point - defines root div |
| 2 | `package.json` | Defines dependencies (React, Vite, Tailwind) |
| 3 | `vite.config.js` | Configures Vite build |
| 4 | `src/index.css` | Tailwind setup - needed for all styling |
| 5 | `src/main.jsx` | React bootstrap - mounts App to DOM |

### Phase 2: Core Logic (Files 6-9)

| Order | File | Why Here |
|-------|------|----------|
| 6 | `src/utils/calendar.js` | Date utilities needed everywhere |
| 7 | `src/utils/colors.js` | Color assignments for subjects |
| 8 | `src/types.ts` → `src/hooks/useStudyTracker.js` | All state management in one place |
| 9 | `src/App.jsx` | Main layout - wires components together |

### Phase 3: UI Components (Files 10-16)

| Order | File | Why Here |
|-------|------|----------|
| 10 | `src/components/Sidebar.jsx` | Navigation & subject management |
| 11 | `src/components/DaySchedule.jsx` | Core daily task functionality |
| 12 | `src/components/WeeklyView.jsx` | Weekly overview grid |
| 13 | `src/components/MonthlyChart.jsx` | Monthly bar chart |
| 14 | `src/components/MonthlyProgressLineChart.jsx` | Monthly line graph |
| 15 | `src/components/WeeklyProgressLineChart.jsx` | Weekly line graph |
| 16 | `src/components/StatsPanel.jsx` | Statistics & progress display |

### Phase 4: Polish (Files 17+)

| Order | File | Why Last |
|-------|------|----------|
| 17 | `public/data.json` | Sample backup structure |
| 18 | `src/App.jsx` (updates) | Bug fixes, enhancements |

---

## Detailed File Breakdown

### 1. `index.html`

**Purpose:** HTML entry point that loads the React app.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StudyTracker - Plan & Track Your Studies</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Key Points:**
- `<div id="root">` - React mounts here
- `type="module"` - Enables ES6 imports in main.jsx
- Path `/src/main.jsx` - Vite resolves this

---

### 2. `package.json`

**Purpose:** Defines project dependencies and scripts.

```json
{
  "name": "study-tracker",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.3",
    "vite": "^6.2.4"
  }
}
```

**Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

---

### 3. `vite.config.js`

**Purpose:** Configures Vite build tool.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Why:**
- `react()` - Enables JSX transformation
- `tailwindcss()` - Processes Tailwind classes

---

### 4. `src/index.css`

**Purpose:** Imports Tailwind and defines custom styles.

```css
@import "tailwindcss";

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* Animation for donut chart */
@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
```

**Key Styles:**
- Custom scrollbar - thinner, matches theme
- `@keyframes dash` - animates donut chart stroke

---

### 5. `src/main.jsx`

**Purpose:** React application entry point.

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What it does:**
1. Imports CSS (loads Tailwind)
2. Gets root div from HTML
3. Creates React root
4. Renders App component
5. `StrictMode` - helps catch bugs in development

---

### 6. `src/utils/calendar.js`

**Purpose:** Date utility functions used throughout the app.

**Functions:**

#### `getDaysInMonth(year, month)`
```javascript
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
```
- Returns number of days in given month
- Uses Date constructor trick: day 0 of next month = last day of current month

#### `getFirstDayOfMonth(year, month)`
```javascript
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
```
- Returns day of week (0-6) for first day of month
- 0 = Sunday, 1 = Monday, etc.

#### `getWeeksInMonth(year, month)`
```javascript
export function getWeeksInMonth(year, month) {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  return Math.ceil((firstDay + daysInMonth) / 7);
}
```
- Calculates how many weeks the month spans
- Accounts for partial weeks at start/end

#### `getWeekNumber(date)`
```javascript
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
```
- ISO week number calculation
- Used for grouping tasks by week

#### `formatDateKey(date)`
```javascript
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```
- Creates consistent date string: "2026-07-04"
- Used as localStorage key

#### `parseDateKey(key)`
```javascript
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}
```
- Reverse of formatDateKey
- Converts "2026-07-04" back to Date object

#### `getWeekDays(date)`
```javascript
export function getWeekDays(date) {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date);
  sunday.setDate(diff);
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push(d);
  }
  return days;
}
```
- Returns array of 7 dates for the week containing given date
- Week starts on Sunday

#### `isSameDay(date1, date2)`
```javascript
export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}
```
- Compares two dates ignoring time
- Returns true if same calendar day

---

### 7. `src/utils/colors.js`

**Purpose:** Assigns consistent colors to subjects.

**Functions:**

#### `getSubjectColor(subjectName)`
```javascript
const colorPalette = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
];

export function getSubjectColor(subjectName) {
  if (!subjectName) return '#6B7280';
  
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}
```

**How it works:**
1. Takes subject name string
2. Creates hash from character codes
3. Modulo by palette length for consistent index
4. Same subject always gets same color

**Why hash instead of random:**
- "Linear Algebra" always blue, "Digital Logic" always green
- Persists across sessions without storing color

---

### 8. `src/hooks/useStudyTracker.js`

**Purpose:** Central state management - all data logic lives here.

**State Variables:**

```javascript
const [selectedDate, setSelectedDate] = useState(new Date());
const [subjects, setSubjects] = useState([]);
const [tasks, setTasks] = useState({});
const [sidebarOpen, setSidebarOpen] = useState(true);
```

**Key Functions:**

#### `loadData()` (useEffect)
```javascript
useEffect(() => {
  const savedSubjects = localStorage.getItem('studyTracker_subjects');
  const savedTasks = localStorage.getItem('studyTracker_tasks');
  
  if (savedSubjects) {
    setSubjects(JSON.parse(savedSubjects));
  } else {
    // Default subjects
    const defaultSubjects = [
      { id: 1, name: 'Linear Algebra', color: '#3B82F6' },
      { id: 2, name: 'Digital Logic', color: '#10B981' },
      // ... more defaults
    ];
    setSubjects(defaultSubjects);
  }
  
  if (savedTasks) {
    setTasks(JSON.parse(savedTasks));
  }
}, []);
```
- Runs once on mount
- Loads from localStorage or sets defaults
- Subjects: array of {id, name, color}
- Tasks: object keyed by date string

#### `saveToLocalStorage()` (useEffect)
```javascript
useEffect(() => {
  localStorage.setItem('studyTracker_subjects', JSON.stringify(subjects));
  localStorage.setItem('studyTracker_tasks', JSON.stringify(tasks));
}, [subjects, tasks]);
```
- Runs whenever subjects or tasks change
- Persists all data to browser storage

#### `addTask(dateKey, subjectId, topic)`
```javascript
export function addTask(dateKey, subjectId, topic) {
  const newTask = {
    id: Date.now(),
    subjectId,
    topic,
    done: false,
    createdAt: new Date().toISOString(),
  };
  
  setTasks(prev => ({
    ...prev,
    [dateKey]: [...(prev[dateKey] || []), newTask],
  }));
}
```
- Creates new task object
- Adds to tasks array for that date
- Uses Date.now() for unique ID

#### `toggleTask(dateKey, taskId)`
```javascript
export function toggleTask(dateKey, taskId) {
  setTasks(prev => ({
    ...prev,
    [dateKey]: prev[dateKey].map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    ),
  }));
}
```
- Flips done boolean for specific task
- Immutable update (creates new array)

#### `deleteTask(dateKey, taskId)`
```javascript
export function deleteTask(dateKey, taskId) {
  setTasks(prev => ({
    ...prev,
    [dateKey]: prev[dateKey].filter(task => task.id !== taskId),
  }));
}
```
- Removes task from array
- Filters out matching ID

#### `updateTask(dateKey, taskId, newTopic)`
```javascript
export function updateTask(dateKey, taskId, newTopic) {
  setTasks(prev => ({
    ...prev,
    [dateKey]: prev[dateKey].map(task =>
      task.id === taskId ? { ...task, topic: newTopic } : task
    ),
  }));
}
```
- Updates task topic text
- Used for inline editing

#### `addSubject(name)`
```javascript
export function addSubject(name) {
  const newSubject = {
    id: Date.now(),
    name,
    color: getSubjectColor(name),
  };
  setSubjects(prev => [...prev, newSubject]);
}
```
- Creates subject with auto-generated color
- Adds to subjects array

#### `deleteSubject(subjectId)`
```javascript
export function deleteSubject(subjectId) {
  setSubjects(prev => prev.filter(s => s.id !== subjectId));
  // Also remove tasks with this subject
  setTasks(prev => {
    const updated = {};
    for (const [dateKey, dayTasks] of Object.entries(prev)) {
      updated[dateKey] = dayTasks.filter(t => t.subjectId !== subjectId);
    }
    return updated;
  });
}
```
- Removes subject
- Also cleans up all tasks using that subject

#### `getDayTasks(dateKey)`
```javascript
export function getDayTasks(dateKey) {
  return tasks[dateKey] || [];
}
```
- Returns tasks array for given date
- Empty array if no tasks

#### `getProgress(dateKey)`
```javascript
export function getProgress(dateKey) {
  const dayTasks = getDayTasks(dateKey);
  if (dayTasks.length === 0) return 0;
  const done = dayTasks.filter(t => t.done).length;
  return Math.round((done / dayTasks.length) * 100);
}
```
- Calculates completion percentage
- Returns 0-100

#### `getStreak()`
```javascript
export function getStreak() {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 366; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = formatDateKey(date);
    const dayTasks = getDayTasks(key);
    
    if (dayTasks.length === 0) continue;
    
    const allDone = dayTasks.every(t => t.done);
    if (allDone) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
```
- Counts consecutive days of 100% completion
- Max 366 days to prevent infinite loop
- Skips days with no tasks

#### `exportData()`
```javascript
export function exportData() {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    subjects,
    tasks,
    selectedDate: formatDateKey(selectedDate),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studytracker-backup-${formatDateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```
- Creates JSON blob of all data
- Triggers browser download
- File named with current date

#### `importData(jsonString)`
```javascript
export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.subjects) setSubjects(data.subjects);
    if (data.tasks) setTasks(data.tasks);
    if (data.selectedDate) {
      setSelectedDate(parseDateKey(data.selectedDate));
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```
- Parses JSON string
- Restores all state
- Returns success/error status

#### `resetAllData()`
```javascript
export function resetAllData() {
  localStorage.removeItem('studyTracker_subjects');
  localStorage.removeItem('studyTracker_tasks');
  setSubjects(defaultSubjects);
  setTasks({});
  setSelectedDate(new Date());
}
```
- Clears localStorage
- Resets to default subjects
- Clears all tasks

---

### 9. `src/App.jsx`

**Purpose:** Main layout component - wires everything together.

**Structure:**
```javascript
function App() {
  const {
    selectedDate, setSelectedDate,
    subjects, tasks,
    sidebarOpen, setSidebarOpen,
    // ... all hook functions
  } = useStudyTracker();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header>...</header>
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar ... />
        
        {/* Main Content */}
        <main className="flex-1">
          {/* Weekly View */}
          <WeeklyView ... />
          
          {/* Weekly Progress Line Chart */}
          <WeeklyProgressLineChart ... />
          
          {/* Day Schedule */}
          <DaySchedule ... />
          
          {/* Monthly Charts */}
          <MonthlyProgressLineChart ... />
          <MonthlyChart ... />
        </main>
        
        {/* Stats Panel */}
        <StatsPanel ... />
      </div>
    </div>
  );
}
```

**Key Responsibilities:**
1. Consumes useStudyTracker hook
2. Passes data/functions to all child components
3. Handles layout (sidebar + main + stats)
4. Manages mobile sidebar toggle

**Data Flow:**
```
useStudyTracker (state)
       ↓
    App.jsx (distribution)
       ↓
┌──────┼──────┬──────────┐
↓      ↓      ↓          ↓
Sidebar  DaySchedule  WeeklyView  StatsPanel
```

---

### 10. `src/components/Sidebar.jsx`

**Purpose:** Left navigation panel with calendar, subjects, and backup.

**Sections:**

1. **Mini Calendar**
```javascript
// Shows current month grid
// Clickable days to select date
// Arrows to navigate months
```

2. **My Subjects**
```javascript
// List of subjects with color dots
// Add new subject button
// Delete subject (trash icon)
```

3. **Data Backup**
```javascript
// Export Data button - downloads JSON
// Import Data button - uploads JSON
// File input (hidden, triggered by button)
```

4. **Danger Zone**
```javascript
// Reset App button (red)
// Confirmation before clearing all data
```

**Key Functions:**

#### `handleImportClick()`
```javascript
const handleImportClick = () => {
  fileInputRef.current.click();
};
```
- Triggers hidden file input

#### `handleFileChange(e)`
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = importData(event.target.result);
    if (result.success) {
      alert('Data imported successfully!');
    } else {
      alert('Import failed: ' + result.error);
    }
  };
  reader.readAsText(file);
};
```
- Reads uploaded JSON file
- Calls importData from hook
- Shows success/error alert

---

### 11. `src/components/DaySchedule.jsx`

**Purpose:** Main daily task list - core functionality.

**Sections:**

1. **Date Header**
```javascript
// Shows selected date
// "Today" badge if applicable
// Day name (Monday, Tuesday, etc.)
```

2. **Add Task Form**
```javascript
// Subject dropdown
// Topic text input
// Add button
// Copy Yesterday button
// Quick Templates dropdown
```

3. **Task List**
```javascript
// Checkbox (toggle done)
// Subject badge (colored)
// Topic text (double-click to edit)
// Delete button (hover)
```

4. **Daily Progress**
```javascript
// Progress bar (0-100%)
// Done/Total count
```

**Key Functions:**

#### `handleAddTask()`
```javascript
const handleAddTask = () => {
  if (!selectedSubject || !topic.trim()) return;
  addTask(dateKey, selectedSubject, topic.trim());
  setTopic('');
};
```
- Validates input
- Calls addTask from hook
- Clears input after

#### `handleCopyYesterday()`
```javascript
const handleCopyYesterday = () => {
  const yesterday = new Date(selectedDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  const yesterdayTasks = getDayTasks(yesterdayKey);
  
  yesterdayTasks.forEach(task => {
    addTask(dateKey, task.subjectId, task.topic);
  });
};
```
- Gets yesterday's tasks
- Copies each to today
- Useful for recurring study plans

#### `handleQuickTemplate(template)`
```javascript
const handleQuickTemplate = (template) => {
  setTopic(template);
  // User can then click Add
};
```
- Pre-fills topic input
- Common templates: "Lecture 1", "Practice Problems", etc.

#### `handleEditTask(task)`
```javascript
const handleEditTask = (task) => {
  const newTopic = prompt('Edit topic:', task.topic);
  if (newTopic !== null && newTopic.trim()) {
    updateTask(dateKey, task.id, newTopic.trim());
  }
};
```
- Shows browser prompt
- Updates task if valid

---

### 12. `src/components/WeeklyView.jsx`

**Purpose:** 7-day overview grid at top of main content.

**Structure:**
```
┌─────────────────────────────────────────────────────┐
│ Week Progress: 45%                                  │
├──────┬──────┬──────┬──────┬──────┬──────┬──────────┤
│ Sun  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │   Sat    │
│  1   │  2   │  3   │  4   │  5   │  6   │    7     │
│ ●●○  │ ●●●  │ ●○○  │ ●●●  │ ○○○  │ ●●○  │   ●●●   │
│ 67%  │ 100% │ 33%  │ 100% │  0%  │ 67%  │   100%  │
└──────┴────────────┴──────┴────────────┴──────────┘
```

**Key Functions:**

#### `renderDayCell(date)`
```javascript
const renderDayCell = (date) => {
  const key = formatDateKey(date);
  const dayTasks = getDayTasks(key);
  const progress = getProgress(key);
  const isToday = isSameDay(date, new Date());
  const isSelected = isSameDay(date, selectedDate);
  
  return (
    <div 
      className={`cursor-pointer p-2 ${isSelected ? 'bg-blue-100' : ''}`}
      onClick={() => setSelectedDate(date)}
    >
      {/* Date, dots, progress */}
    </div>
  );
};
```
- Shows day number
- Colored dots for each subject
- Progress percentage
- Click to select that day

---

### 13. `src/components/MonthlyChart.jsx`

**Purpose:** Bar chart showing daily task completion for the month.

**SVG Structure:**
```javascript
<svg viewBox="0 0 800 200">
  {/* Y-axis labels: 0%, 50%, 100% */}
  {/* Grid lines */}
  {/* Bars for each day */}
  {/* X-axis: day numbers */}
</svg>
```

**Key Functions:**

#### `renderBar(day, index)`
```javascript
const renderBar = (day, index) => {
  const key = formatDateKey(new Date(year, month, day));
  const dayTasks = getDayTasks(key);
  const total = dayTasks.length;
  const done = dayTasks.filter(t => t.done).length;
  const percentage = total > 0 ? (done / total) * 100 : 0;
  
  const barHeight = (percentage / 100) * maxHeight;
  const x = index * barWidth + padding;
  const y = chartHeight - barHeight;
  
  return (
    <rect
      x={x}
      y={y}
      width={barWidth - 2}
      height={barHeight}
      fill={percentage === 100 ? '#10B981' : '#6366F1'}
      onClick={() => handleDayClick(day)}
    />
  );
};
```
- Calculates bar dimensions
- Green if 100%, indigo otherwise
- Click to select that day

---

### 14. `src/components/MonthlyProgressLineChart.jsx`

**Purpose:** Line graph showing completion trend across the month.

**SVG Structure:**
```javascript
<svg viewBox="0 0 800 250">
  {/* Title: "Monthly Progress - July 2026" */}
  {/* Y-axis: 0%, 25%, 50%, 75%, 100% */}
  {/* Grid lines */}
  {/* Line path connecting daily percentages */}
  {/* Area fill under line */}
  {/* Data points (circles) */}
</svg>
```

**Key Functions:**

#### `generateLinePath()`
```javascript
const generateLinePath = () => {
  const points = dailyData.map((data, i) => {
    const x = padding + (i * (chartWidth / (dailyData.length - 1)));
    const y = chartHeight - padding - (data.percentage / 100 * (chartHeight - 2 * padding));
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
};
```
- Creates SVG path command
- M = move to first point
- L = line to each subsequent point

#### `generateAreaPath()`
```javascript
const generateAreaPath = () => {
  const linePath = generateLinePath();
  const lastX = padding + chartWidth - padding;
  const firstX = padding;
  const baselineY = chartHeight - padding;
  return `${linePath} L ${lastX},${baselineY} L ${firstX},${baselineY} Z`;
};
```
- Extends line path to baseline
- Creates closed shape for fill
- Z = close path

---

### 15. `src/components/WeeklyProgressLineChart.jsx`

**Purpose:** Line graph showing completion trend for current week.

**Similar to MonthlyProgressLineChart but:**
- Only 7 data points (Sun-Sat)
- Shows current week only
- Smaller height

**Key Difference:**
```javascript
const weekDays = getWeekDays(selectedDate);
const dailyData = weekDays.map(date => {
  const key = formatDateKey(date);
  const dayTasks = getDayTasks(key);
  // ... calculate percentage
});
```

---

### 16. `src/components/StatsPanel.jsx`

**Purpose:** Right sidebar with statistics and progress visualizations.

**Sections:**

1. **Monthly Stats Card**
```javascript
// X/Y tasks completed
// Percentage bar
```

2. **Weekly Stats Card**
```javascript
// This week's completion
// Percentage
```

3. **Streak Card**
```javascript
//  Consecutive days
// "days of 100% completion"
```

4. **Monthly Progress Donut**
```javascript
// SVG circle with stroke-dasharray
// Animated fill
// Percentage in center
```

5. **Subject Breakdown**
```javascript
// Each subject with progress bar
// Color-coded
// Completed/Total
```

**Key Functions:**

#### `renderDonut(progress)`
```javascript
const circumference = 2 * Math.PI * radius;
const offset = circumference - (progress / 100) * circumference;

<circle
  cx={size/2}
  cy={size/2}
  r={radius}
  stroke="#E5E7EB"
  strokeWidth={strokeWidth}
  fill="none"
/>
<circle
  cx={size/2}
  cy={size/2}
  r={radius}
  stroke="#3B82F6"
  strokeWidth={strokeWidth}
  fill="none"
  strokeDasharray={circumference}
  strokeDashoffset={offset}
  strokeLinecap="round"
/>
```
- Outer circle: gray track
- Inner circle: colored progress
- `strokeDashoffset` controls fill amount

---

### 17. `public/data.json`

**Purpose:** Sample backup file structure for reference.

```json
{
  "version": "1.0",
  "exportedAt": "2026-07-04T12:00:00.000Z",
  "subjects": [
    { "id": 1, "name": "Linear Algebra", "color": "#3B82F6" },
    { "id": 2, "name": "Digital Logic", "color": "#10B981" }
  ],
  "tasks": {
    "2026-07-04": [
      { "id": 123456, "subjectId": 1, "topic": "Lecture 7", "done": true }
    ]
  },
  "selectedDate": "2026-07-04"
}
```

**Use Cases:**
- Reference for import format
- Template for manual data creation
- Testing import functionality

---

## Data Flow Architecture

### State Management Pattern

```
─────────────────────────────────────────────────────┐
│                  useStudyTracker                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  State:                                     │   │
│  │  - selectedDate (Date)                      │   │
│  │  - subjects (Array)                         │   │
│  │  - tasks (Object: dateKey → Array)          │   │
│  │  - sidebarOpen (boolean)                    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Actions:                                   │   │
│  │  - addTask, toggleTask, deleteTask          │   │
│  │  - addSubject, deleteSubject                │   │
│  │  - exportData, importData, resetAllData     │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                          │
                          │ (passed as props)
                          ↓
┌─────────────────────────────────────────────────────┐
│                       App.jsx                       │
│  (Distributes state/actions to all components)      │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Sidebar  │   │DaySchedule│   │StatsPanel│
    └──────────   └──────────┘   └──────────┘
```

### LocalStorage Schema

```javascript
// Key: studyTracker_subjects
// Value: JSON array
[
  { "id": 1, "name": "Linear Algebra", "color": "#3B82F6" },
  { "id": 2, "name": "Digital Logic", "color": "#10B981" }
]

// Key: studyTracker_tasks
// Value: JSON object
{
  "2026-07-04": [
    { "id": 123, "subjectId": 1, "topic": "Lecture 7", "done": false }
  ],
  "2026-07-05": [
    { "id": 124, "subjectId": 2, "topic": "K-Maps", "done": true }
  ]
}
```

### Component Communication

```
User clicks checkbox
       ↓
DaySchedule.toggleTask(dateKey, taskId)
       ↓
useStudyTracker.toggleTask()
       ↓
setTasks(new state)
       ↓
useEffect triggers saveToLocalStorage()
       ↓
localStorage updated
       ↓
React re-renders affected components
       ↓
UI shows checked state
```

---

## Key Functions Explained

### 1. Task Toggle Flow

```javascript
// 1. User clicks checkbox in DaySchedule
<input 
  type="checkbox" 
  checked={task.done}
  onChange={() => toggleTask(dateKey, task.id)}
/>

// 2. Hook updates state
function toggleTask(dateKey, taskId) {
  setTasks(prev => ({
    ...prev,
    [dateKey]: prev[dateKey].map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    ),
  }));
}

// 3. Effect saves to localStorage
useEffect(() => {
  localStorage.setItem('studyTracker_tasks', JSON.stringify(tasks));
}, [tasks]);
```

### 2. Progress Calculation

```javascript
// Daily progress
function getProgress(dateKey) {
  const dayTasks = tasks[dateKey] || [];
  if (dayTasks.length === 0) return 0;
  const done = dayTasks.filter(t => t.done).length;
  return Math.round((done / dayTasks.length) * 100);
}

// Monthly progress
function getMonthlyProgress(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  let totalTasks = 0;
  let completedTasks = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const key = formatDateKey(new Date(year, month, day));
    const dayTasks = tasks[key] || [];
    totalTasks += dayTasks.length;
    completedTasks += dayTasks.filter(t => t.done).length;
  }
  
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}
```

### 3. Streak Calculation

```javascript
function getStreak() {
  let streak = 0;
  const today = new Date();
  
  // Check up to 366 days back (leap year safe)
  for (let i = 0; i < 366; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = formatDateKey(date);
    const dayTasks = tasks[key] || [];
    
    // Skip days with no tasks (don't break streak)
    if (dayTasks.length === 0) continue;
    
    // Check if all tasks done
    const allDone = dayTasks.every(t => t.done);
    if (allDone) {
      streak++;
    } else {
      break; // Streak broken
    }
  }
  return streak;
}
```

### 4. Export/Import

```javascript
// Export
function exportData() {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    subjects,
    tasks,
    selectedDate: formatDateKey(selectedDate),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studytracker-backup-${formatDateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import
function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.subjects) setSubjects(data.subjects);
    if (data.tasks) setTasks(data.tasks);
    if (data.selectedDate) {
      setSelectedDate(parseDateKey(data.selectedDate));
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```

---

## How to Rebuild From Scratch

### Step 1: Project Setup (15 minutes)

```bash
# Create Vite project
npm create vite@latest study-tracker -- --template react

# Install dependencies
cd study-tracker
npm install

# Install Tailwind
npm install tailwindcss@4
```

### Step 2: File Structure (5 minutes)

```bash
mkdir -p src/components src/hooks src/utils public
touch src/utils/calendar.js src/utils/colors.js
touch src/hooks/useStudyTracker.js
touch src/components/{Sidebar,DaySchedule,WeeklyView,MonthlyChart,StatsPanel}.jsx
```

### Step 3: Core Utilities (30 minutes)

1. **calendar.js** - Add all date functions
2. **colors.js** - Add subject color function

### Step 4: Custom Hook (45 minutes)

1. **useStudyTracker.js** - Add all state and actions
2. Test localStorage save/load

### Step 5: Main Layout (30 minutes)

1. **App.jsx** - Create basic layout structure
2. Wire up useStudyTracker
3. Add header and main container

### Step 6: Components (2 hours)

Build in this order:
1. **Sidebar** - Calendar + subjects
2. **DaySchedule** - Task list + add form
3. **WeeklyView** - 7-day grid
4. **StatsPanel** - Stats + donut
5. **MonthlyChart** - Bar chart
6. **Line charts** - Progress graphs

### Step 7: Polish (30 minutes)

1. Add export/import
2. Add reset functionality
3. Test all features
4. Fix bugs

### Total Estimated Time: 4-5 hours

---

## Interview Talking Points

### Architecture Decisions

**Q: Why LocalStorage instead of a database?**
> A: For a personal tracker, LocalStorage provides instant load, zero backend costs, and works offline. The export/import feature ensures data portability. If scaling to multi-user, I'd migrate to Supabase with minimal changes since the data structure is already JSON-based.

**Q: Why no state management library (Redux/Zustand)?**
> A: The app has a single source of truth in useStudyTracker hook. All components receive props from one place, making Redux unnecessary overhead. React's built-in state is sufficient for this scale.

**Q: Why custom SVG charts instead of a library?**
> A: Chart libraries add 50-100kb bundle size. Custom SVG charts give full control over styling and interactions while keeping the bundle under 20kb. The math is straightforward for bar/line charts.

**Q: How do you handle data persistence?**
> A: Two useEffect hooks - one loads on mount, one saves on every state change. This ensures data is never lost. The export feature creates downloadable JSON backups for disaster recovery.

### Technical Challenges

**Q: What was the hardest bug to fix?**
> A: The streak calculation had an infinite loop edge case. Fixed by bounding the loop to 366 iterations maximum. This taught me to always add safety limits to while loops that depend on data conditions.

**Q: How do you ensure data consistency?**
> A: All mutations go through the hook's action functions. Components can't directly modify state. This single-point mutation pattern prevents race conditions and makes debugging easier.

**Q: How would you scale this?**
> A: 1) Replace LocalStorage with Supabase 2) Add user authentication 3) Add sharing/collaboration features 4) Add notifications for pending tasks 5) Add mobile app with React Native sharing the same hook logic.

### Code Quality

**Q: How do you test this?**
> A: Manual testing covers all user flows. For production, I'd add: 1) Unit tests for calendar utilities 2) Integration tests for the hook 3) E2E tests with Playwright for critical paths

**Q: What would you improve?**
> A: 1) Add keyboard shortcuts 2) Add drag-and-drop task reordering 3) Add task templates 4) Add study time tracking 5) Add spaced repetition for review scheduling

---

## Quick Reference

### localStorage Keys
| Key | Data Type | Description |
|-----|-----------|-------------|
| `studyTracker_subjects` | Array | All subjects with colors |
| `studyTracker_tasks` | Object | Tasks keyed by date |

### Date Format
- Always use `YYYY-MM-DD` string format
- Function: `formatDateKey(date)`
- Example: `"2026-07-04"`

### Task Object Structure
```javascript
{
  id: 1234567890,           // Date.now()
  subjectId: 1,             // References subject.id
  topic: "Lecture 7",       // User input
  done: false,              // Completion status
  createdAt: "2026-07-04T..." // ISO timestamp
}
```

### Subject Object Structure
```javascript
{
  id: 1,                    // Date.now()
  name: "Linear Algebra",   // User input
  color: "#3B82F6"          // Auto-generated
}
```

---

## Conclusion

This documentation covers every file, function, and design decision in StudyTracker. Use it to:
- Understand the architecture before interviews
- Rebuild the app from scratch
- Extend with new features
- Migrate to backend storage

**Key Takeaways:**
1. Single hook for all state = simple data flow
2. LocalStorage = instant persistence, zero backend
3. Custom SVG charts = full control, small bundle
4. Export/Import = data portability without server

Good luck with your interview! 🚀
