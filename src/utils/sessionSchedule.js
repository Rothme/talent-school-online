// ─────────────────────────────────────────────
// DAILY TIMETABLE
// Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
// Monday/Wednesday   → Chess
// Tuesday/Thursday/Friday → Coding
// Saturday           → 30min typing essay + 90min challenge
// Sunday             → Rest
// Daily warm-up      → 10 mins typing (home row drills)
// ─────────────────────────────────────────────

export const SCHEDULE = {
  1: { day: 'Monday',    subject: 'chess',     emoji: '♟️',  label: 'Chess day' },
  2: { day: 'Tuesday',   subject: 'coding',    emoji: '💻',  label: 'Coding day' },
  3: { day: 'Wednesday', subject: 'chess',     emoji: '♟️',  label: 'Chess day' },
  4: { day: 'Thursday',  subject: 'coding',    emoji: '💻',  label: 'Coding day' },
  5: { day: 'Friday',    subject: 'coding',    emoji: '💻',  label: 'Coding day' },
  6: { day: 'Saturday',  subject: 'challenge', emoji: '🏆',  label: 'Challenge Saturday' },
  0: { day: 'Sunday',    subject: 'rest',      emoji: '😊',  label: 'Rest day' },
};

export const WARMUP_DURATION_MINS   = 10;
export const MAIN_DURATION_MINS     = 50;
export const SAT_TYPING_MINS        = 30;
export const SAT_CHALLENGE_MINS     = 90;

export function getTodaySchedule() {
  const day = new Date().getDay();
  return { ...SCHEDULE[day], dayNum: day };
}

export function getSessionKey(childId) {
  const today = new Date().toISOString().slice(0, 10);
  return `session_${childId}_${today}`;
}

export function getSessionState(childId) {
  try {
    const raw = localStorage.getItem(getSessionKey(childId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSessionState(childId, state) {
  try {
    localStorage.setItem(getSessionKey(childId), JSON.stringify(state));
  } catch {}
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
  return { chess:'#1d9e75', coding:'#6c63ff', typing:'#ba7517', challenge:'#e24b4a', rest:'#9898b8' }[subject] || '#6c63ff';
}

export function getSubjectPale(subject) {
  return { chess:'#e1f5ee', coding:'#eeedfe', typing:'#faeeda', challenge:'#fcebeb', rest:'#f1f0fb' }[subject] || '#eeedfe';
}

export function isTestAccount(child) {
  return child?.studentId === 'TSO-0001-C' || child?.studentId === 'TSO-0002-T';
}
