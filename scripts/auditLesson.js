#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────
// Lesson rule-compliance audit — run before every deploy.
// Usage: node scripts/auditLesson.js src/data/chessLessonN.js
//
// Checks (see docs/CURRICULUM_RULES.md for full rule definitions):
//   1. Every spoken chess move (e.g. "Nf3") has a visual counterpart
//      (moveNotation, pieceLetterRef, demoSequence, or demoFen).
//   2. Every spoken piece-letter mention ("N for Knight") has a
//      pieceLetterRef panel on that step.
//
// This is a floor, not a ceiling — it does not verify FEN legality,
// animation timing, or button-gating logic. Those must still be
// checked by hand against docs/CURRICULUM_RULES.md.
// ─────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/auditLesson.js <path-to-lesson-file.js>');
  process.exit(1);
}

const fullPath = path.resolve(file);
const code = fs.readFileSync(fullPath, 'utf8');
const exportMatches = [...code.matchAll(/export const (\w+)\s*=/g)];
if (exportMatches.length === 0) {
  console.error('Could not find any "export const X =" in this file.');
  process.exit(1);
}
// Use the first export that looks like the main lesson (not a _BONUS variant)
const mainExport = exportMatches.find(m => !m[1].includes('BONUS')) || exportMatches[0];
const exportName = mainExport[1];
let test = code;
exportMatches.forEach(m => { test = test.replace(`export const ${m[1]}`, `const ${m[1]}`); });

let L;
try {
  L = new Function(test + `; return ${exportName};`)();
} catch (e) {
  console.error('Failed to parse lesson file as JS:', e.message);
  process.exit(1);
}

let violations = 0;

L.phases.forEach(p => {
  p.steps.forEach(s => {
    const voice = s.voice || '';

    // Rule: spoken moves must have a visual counterpart
    const movePattern = /"[A-Za-z]{0,2}[a-h][1-8]"/g;
    const moveMatches = voice.match(movePattern) || [];
    const hasVisual = !!(s.moveNotation || s.pieceLetterRef?.length || s.demoSequence?.length || s.demoFen);
    if (moveMatches.length > 0 && !hasVisual) {
      console.log(`VIOLATION [${p.id}/${s.id}]: speaks ${JSON.stringify(moveMatches)} but has no moveNotation/pieceLetterRef/demoSequence/demoFen`);
      violations++;
    }

    // Rule: spoken piece-letter mentions must have pieceLetterRef
    const letterPattern = /\b(letter is [A-Z]\b|[A-Z] for [A-Z][a-z]+|[A-Z]'s letter)/g;
    const letterMatches = voice.match(letterPattern) || [];
    if (letterMatches.length > 0 && !s.pieceLetterRef) {
      console.log(`VIOLATION [${p.id}/${s.id}]: mentions letters ${JSON.stringify(letterMatches)} but has no pieceLetterRef`);
      violations++;
    }
  });
});

let totalSteps = 0;
L.phases.forEach(p => totalSteps += p.steps.length);

console.log('');
console.log(`Lesson: "${L.title}"`);
console.log(`Phases: ${L.phases.length} | Total steps: ${totalSteps} | Total minutes: ${L.totalMinutes}`);
console.log(`Violations: ${violations}`);
console.log('');

if (violations > 0) {
  console.log('❌ FAILED — fix the violations above before deploying.');
  process.exit(1);
} else {
  console.log('✅ PASSED — no rule violations found by this audit.');
  console.log('   Remember: this does not check FEN legality, animation timing,');
  console.log('   or button-gating logic. Verify those by hand against');
  console.log('   docs/CURRICULUM_RULES.md before deploying.');
}
