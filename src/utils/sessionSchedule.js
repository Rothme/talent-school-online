// Daily timetable logic
// Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6, Sunday=0

export const SCHEDULE = {
  1: { day: 'Monday',    subject: 'chess',  emoji: '♟️',  label: 'Chess day' },
  2: { day: 'Tuesday',   subject: 'coding', emoji: '💻',  label: 'Coding day' },
  3: { day: 'Wednesday', subject: 'chess',  emoji: '♟️',  label: 'Chess day' },
  4: { day: 'Thursday',  subject: 'coding', emoji: '💻',  label: 'Coding day' },
  5: { day: 'Friday',    subject: 'typing', emoji: '⌨️',  label: 'Typing day' },
  6: { day: 'Saturday',  subject: 'challenge', emoji: '🏆', label: 'Challenge Saturday' },
  0: { day: 'Sunday',    subject: 'rest',   emoji: '😊',  label: 'Rest day' },
};

export const WARMUP_DURATION_MINS = 10;
export const MAIN_DURATION_MINS   = 50;
export const CHALLENGE_DURATION_MINS = 110;
export const FRIDAY_TYPING_MINS   = 60; // warmup + full lesson

export function getTodaySchedule() {
  const day = new Date().getDay();
  return { ...SCHEDULE[day], dayNum: day };
}

export function getSessionKey(childId) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `session_${childId}_${today}`;
}

export function getSessionState(childId) {
  const key = getSessionKey(childId);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveSessionState(childId, state) {
  const key = getSessionKey(childId);
  localStorage.setItem(key, JSON.stringify(state));
}

export function isSessionComplete(childId) {
  const state = getSessionState(childId);
  return state?.completed === true;
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getSubjectColor(subject) {
  const map = {
    chess:     '#1d9e75',
    coding:    '#6c63ff',
    typing:    '#ba7517',
    challenge: '#e24b4a',
    rest:      '#9898b8',
  };
  return map[subject] || '#6c63ff';
}

export function getSubjectPale(subject) {
  const map = {
    chess:     '#e1f5ee',
    coding:    '#eeedfe',
    typing:    '#faeeda',
    challenge: '#fcebeb',
    rest:      '#f1f0fb',
  };
  return map[subject] || '#eeedfe';
}
