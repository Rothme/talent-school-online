// ─────────────────────────────────────────────
// TEST ACCOUNTS — bypass Firebase for review
// Remove before public launch
// ─────────────────────────────────────────────

export const TEST_PARENT = {
  uid: 'test-parent-001',
  email: 'test@talentschool.com',
  password: 'test1234',
  displayName: 'Test Parent',
  role: 'parent',
  children: ['test-child-001', 'test-child-002'],
  subscription: 'trial',
};

export const TEST_CHILDREN = [
  {
    id: 'test-child-001',
    name: 'Chidera',
    age: 10,
    avatar: '👧',
    avatarColor: '#6c63ff',
    studentId: 'TSO-0001-C',
    pin: '1234',
    parentUid: 'test-parent-001',
    learningPrefs: { chess: 40, coding: 40, typing: 20 },
    progress: { chess: 0, coding: 0, typing: 0 },
    lessonsComplete: { chess: 0, coding: 0, typing: 0 },
    streak: 7,
    totalXP: 420,
    // ── TEST ACCOUNT FLAG ──────────────────────────
    // Bypasses timetable restriction — all subjects
    // accessible freely. TEST ACCOUNTS ONLY.
    isTestAccount: true,
  },
  {
    id: 'test-child-002',
    name: 'Temi',
    age: 8,
    avatar: '👦',
    avatarColor: '#1d9e75',
    studentId: 'TSO-0002-T',
    pin: '5678',
    parentUid: 'test-parent-001',
    learningPrefs: { chess: 33, coding: 34, typing: 33 },
    progress: { chess: 0, coding: 0, typing: 0 },
    lessonsComplete: { chess: 0, coding: 0, typing: 0 },
    streak: 3,
    totalXP: 180,
    // ── TEST ACCOUNT FLAG ──────────────────────────
    isTestAccount: true,
  },
];

export function isTestParentLogin(email, password) {
  return email === TEST_PARENT.email && password === TEST_PARENT.password;
}

export function findTestChild(studentId, pin) {
  return TEST_CHILDREN.find(
    c => c.studentId === studentId.toUpperCase().trim() && c.pin === pin
  );
}

// Returns true if the currently logged-in child is a test account.
// Reads from both childSession and parentPreview.
export function isActiveTestAccount() {
  try {
    const raw =
      sessionStorage.getItem('childSession') ||
      sessionStorage.getItem('parentPreview');
    if (!raw) return false;
    const child = JSON.parse(raw);
    return child?.isTestAccount === true;
  } catch {
    return false;
  }
}
