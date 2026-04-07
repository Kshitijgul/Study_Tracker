export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getWeekDay(year, month, day) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(year, month, day).getDay()];
}

export function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export function getWeeksOfMonth(year, month) {
  const totalDays = getDaysInMonth(year, month);
  const weeks = [];
  let currentWeek = [];

  for (let day = 1; day <= totalDays; day++) {
    currentWeek.push(day);
    const dow = new Date(year, month, day).getDay();
    if (dow === 6 || day === totalDays) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}

export function getWeekNumber(year, month, day) {
  const weeks = getWeeksOfMonth(year, month);
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].includes(day)) return i + 1;
  }
  return 1;
}

export function getWeekDates(baseDate) {
  const dates = [];
  const day = baseDate.getDay();
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - day);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(formatDate(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return dates;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getTodayString() {
  const t = new Date();
  return formatDate(t.getFullYear(), t.getMonth(), t.getDate());
}
