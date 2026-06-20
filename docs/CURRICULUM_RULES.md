# Talent School Chess LMS — Curriculum & Build Rules

**Status: BINDING for all lessons (1–24).** These rules were established through
iterative correction across Lessons 1 and 2. They are not stylistic preferences —
each one exists because its absence produced a real, observed defect. Every new
lesson must be checked against this document before deploy, and ideally verified
with the automated audit script at the bottom of this file.

---

## 1. Voice and Button Gating

**Rule:** Every interactive button — Continue, quiz answers, colour buttons, file
buttons, board clicks, drag-and-drop — must remain grey and unclickable until
Ms. Momo's voice has completely finished. This applies to the main narration AND
to any feedback/compliment voice ("Well done!", "Not quite..."). No exceptions,
not even for one-word compliments.

**Implementation:** `speakingFb` state (true whenever any feedback voice plays)
combined with `voiceFinished` (true when the main step voice ends). Every button's
`disabled` prop must check `!voiceFinished || speakingFb`.

**Why:** Clicking mid-sentence seizes the next voice (a browser audio-gesture
issue) and requires Pause/Play to recover. This breaks the lesson flow for a child
with no way to self-correct.

---

## 2. The Two Highlight Styles

There are exactly two highlight styles. Never invent a third without updating
this document.

**Style 1 — Full fill** (`backgroundColor: rgba(255,210,0,0.55)`)
Used when an ENTIRE file or rank is the subject — "file a", "rank 4", "the second
row". The whole column/row fills solid yellow.

**Style 2 — Border only** (`backgroundColor: transparent`, `boxShadow: inset 0 0
0 4px rgba(255,210,0,1)`)
Used when a SPECIFIC SQUARE is the subject — a named square, a square's colour,
a piece's starting square, the intersection square when both a file and rank are
active. The true light/dark colour of the square must always show through.

**Intersection rule:** When a file AND a rank are both active (e.g. teaching "e4"
by file+rank), the column and row get Style 1, and the intersection square
overrides to Style 2.

**Persistence:** No auto-timeout during teaching. Highlights clear only on step
change or when the student completes the task. Quiz highlights stay lit until
the student answers (not until they get distracted and the glow vanishes).

**Suppression:** All highlights are OFF during exercises/tests/quizzes:
`independent-squares`, `speed-round`, `colour-quiz`, `file-name-quiz`,
`click-file`, `click-rank`, `click-square`, `piece-range`, `recap-quiz`,
`piece-spot-quiz`, `piece-letter-quiz`. The student must work from memory, not
hints.

---

## 3. Word-Triggered Highlighting (`applyNeonWord`)

When Ms. Momo's spoken word matches a board element, that element glows in sync
with her speech — like a tutor pointing as they talk.

- File letter (a–h) → Style 1 column, opens an 8-word "file context" window so
  sequences like "a, b, c, d, e, f, g, h" all glow even without repeating "file"
  each time.
- Rank number (1–8) → Style 1 row. Context opens on "rank", "ranks", "row", or
  "rows".
- Square coordinate (e.g. "e4") → Style 2 border, immediate, no context window
  needed.
- Piece name (King/Queen/Rook/Bishop/Knight/Pawn) → orange border on every
  square containing that piece type on the current board.

**Repeated mentions:** Each highlight type has its own clear-then-set pattern
(`setX(null)` then `setTimeout(() => setX(value), 50)`) so React re-renders even
when the same value is set twice in a row (e.g. "file a... file a").

**Separate timers per type:** `fileNeonTimer`, `rankNeonTimer`, `sqNeonTimer`,
`pieceNeonTimer` — never share one timer across highlight types, or clearing one
will cancel another mid-glow.

---

## 4. Visual Reference Panels (Right Side)

**Core principle: children must SEE what they are told, not just hear it.**
Anything spoken that names a piece-letter or a chess move must have a
corresponding visual element on the right panel. This is checked automatically
(see audit script below).

**`pieceLetterRef`** — array of `{ icon, letter, name }`. Renders as a stacked
list of cards on the right. Use whenever Ms. Momo says "K for King", "the
Knight's letter is N", or similar. Build it PROGRESSIVELY across a teaching
sequence (step 1 shows 1 card, step 2 shows 2 cards, etc.) so the student watches
their reference list grow — this reinforces memory better than showing all 6 at
once.

**`moveNotation` + `moveExplain`** — large yellow monospace text (e.g. "Nf3")
with a one-line explanation underneath ("N = Knight moved to f3"). Use whenever
Ms. Momo recites a chess move in any taskType — `observe`, `notation-demo`, or
`recap-quiz`. The display condition must NOT be restricted to a specific
taskType; it triggers on `step.moveNotation` existing, full stop.

**`cl-indep-target`** — large bold yellow square name for unguided "find this
square" exercises (`independent-squares`).

---

## 5. Piece Introduction Pattern (3-Step Structure)

Every chess piece, when first taught, follows exactly this sequence:

1. **Intro step** (`observe`) — piece appears on its REAL game-starting square
   (King e1/e8, Queen d1/d8, Rook a1+h1/a8+h8, Bishop c1+f1/c8+f8, Knight
   b1+g1/b8+g8, Pawn rank2/rank7). Solo board — every other piece type is absent.
   For pieces with 2+ units per colour, show ALL of them (both Rooks, both
   Bishops, both Knights, all 8 Pawns).
2. **Demo step** (`observe` with `demoSequence`) — same solo board. The piece
   slides through every direction it can legally move, ONE direction at a time,
   returning to its starting square between each. Yellow path dots trail every
   square along the route (see Rule 6). For multi-unit pieces, animate ONE unit
   at a time — never move two pieces simultaneously in one frame, it reads as
   erratic.
3. **Practice step** (`piece-range`) — piece relocates to a CENTRAL square
   (typically d5/e4) for maximum square coverage. Student drags the piece (not
   click — drag and drop) to every reachable square. Piece snaps back to origin
   after each successful drop so the student can continue to the next target.

**FEN verification is mandatory.** Every `demoSequence` frame and every
`pieceRangeFen`/`targetSquares` set must be checked with chess.js
(`c.moves({square, verbose:true})`) before being written into lesson data. Hand-
counted FEN strings have produced real bugs (Queen jumping to non-diagonal
squares, Knight jumping erratically) — always verify programmatically.

---

## 6. Yellow Path Dots (`pathSqs`)

Any time a piece moves — in a `demoSequence` frame, a `notation-demo` step, or
a `recap-quiz` move-reading question — every square along its path gets a small
yellow dot in the centre (`radial-gradient`), not a full highlight. This lets the
student mentally connect start → path → destination, especially for sliding
pieces (Rook, Bishop, Queen) and the Knight's L-shape corner.

`step.path` (single move) or `frame.path` (within a `demoSequence`) is an array
of square names. Dots clear when the piece returns to its start square or when
the step changes.

For `recap-quiz` steps with a single-frame `demoSequence`, the piece is left on
its destination square (does NOT loop back to start) so the student has a visual
reference while choosing their answer.

---

## 7. Lesson Completion

Every lesson must end with a `taskType: 'complete'` step that:
- Has a warm, specific congratulations voice naming what was learned
- Triggers `setLessonDone(true)` and confetti on click
- Is reachable — verify no quiz/practice taskType upstream is in the
  `ownControls` list (which hides the Continue button) without also calling
  `completeTask()` on its last item to unlock it.

**Known trap:** Quiz types (`piece-spot-quiz`, `piece-letter-quiz`, `colour-quiz`,
`file-name-quiz`) use their own answer buttons DURING the quiz, but once the
last item is answered they must hand off to the standard Continue button via
`completeTask()`. If a quiz taskType is left in `ownControls`, the lesson dead-
ends with no way to proceed — this has happened twice and is the single most
disruptive bug class in this codebase.

---

## 8. Lesson Timing and Depth

A 55–60 minute lesson must contain genuine teaching depth, not padding:

- Break abstract concepts into smaller granular steps rather than one long
  voice block (e.g. "two-part move structure" got its own step before the
  worked examples).
- Every new concept gets a worked example shown on the board, THEN a guided
  practice question testing it, before moving to the next concept.
- Recap/revision phases should end with 2–3 recall quiz questions, not just a
  verbal summary.
- When in doubt about whether a lesson is long enough, count `phases` ×
  average `durationMins`, and count total `steps` — more steps generally means
  better-paced teaching, not bloat.

---

## 9. Test Account Tooling

A phase-jump dropdown (`cl-test-jumper`) appears in the banner ONLY for
`isTest` accounts. Selecting a phase resets all interaction state (clicks,
scores, feedback, neon highlights, voice flags) and jumps immediately —
bypassing the need to replay the lesson from the start during QA. Never expose
this to real student accounts.

---

## 10. Pre-Deploy Audit (Run This Every Time)

Before pushing any lesson data change, run this Node script against the lesson
file. It catches the two most common — and most disruptive — violations: spoken
moves/letters with no visual counterpart.

```js
const fs = require('fs');
const file = process.argv[2]; // e.g. 'src/data/chessLesson3.js'
const code = fs.readFileSync(file, 'utf8');
const exportName = code.match(/export const (\w+)/)[1];
const test = code.replace(`export const ${exportName}`, `const ${exportName}`);
const L = new Function(test + `; return ${exportName};`)();

let violations = 0;
L.phases.forEach(p => {
  p.steps.forEach(s => {
    const voice = s.voice || '';
    const movePattern = /"[A-Za-z]{0,2}[a-h][1-8]"/g;
    const matches = voice.match(movePattern) || [];
    const hasVisual = !!(s.moveNotation || s.pieceLetterRef?.length || s.demoSequence?.length || s.demoFen);
    if (matches.length > 0 && !hasVisual) {
      console.log(`VIOLATION [${s.id}]: speaks ${JSON.stringify(matches)}, no visual`);
      violations++;
    }
    const letterPattern = /\b(letter is [A-Z]|[A-Z] for [A-Z][a-z]+|[A-Z]'s letter)/g;
    const lmatches = voice.match(letterPattern) || [];
    if (lmatches.length > 0 && !s.pieceLetterRef) {
      console.log(`VIOLATION [${s.id}]: mentions letters ${JSON.stringify(lmatches)}, no pieceLetterRef`);
      violations++;
    }
  });
});
console.log(`\nTotal violations: ${violations}`);
console.log(`Phases: ${L.phases.length}, Total minutes: ${L.totalMinutes}`);
let totalSteps = 0; L.phases.forEach(p => totalSteps += p.steps.length);
console.log(`Total steps: ${totalSteps}`);
```

Run with: `node audit.js src/data/chessLessonN.js`

This audit does not catch everything (it can't verify FEN legality or animation
timing) — it is a floor, not a ceiling. Piece movement FENs must still be
verified individually with chess.js before being committed.

---

## Quick Reference Checklist for New Lessons

- [ ] Every button checks `voiceFinished && !speakingFb`
- [ ] Files/ranks use Style 1, named squares use Style 2, intersections override
      correctly
- [ ] No highlight auto-timeouts during teaching; suppressed during exercises
- [ ] Every spoken move has `moveNotation`/`moveExplain` + board representation
- [ ] Every spoken piece-letter mention has a `pieceLetterRef` panel
- [ ] Piece intros: real starting square → demo with path dots → centre practice
      with drag-and-drop
- [ ] All FENs verified with chess.js before committing
- [ ] No quiz taskType left in `ownControls` without calling `completeTask()` on
      its last item
- [ ] Lesson ends with a reachable `complete` step + confetti
- [ ] Run the audit script — zero violations before push
- [ ] Total duration matches the target (55–60 min) with genuine depth, not
      padding

---

## 11. Board Rendering — `skipValidation` is Mandatory

`fenToPositionObj` must always parse FENs using `c.load(fen, { skipValidation: true })`.
Never use `new Chess(fen)` directly for board display. Chess.js throws on FENs missing
both Kings (all solo-piece teaching boards). The catch block silently returns a raw
string that react-chessboard cannot render — producing an empty board with no error.

**Rule:** `fenToPositionObj` always uses `skipValidation`. This applies to every FEN
passed to the board component, forever.

---

## 12. Prop-Derived State — Never Use `useState(derivedFromProp)`

`useState(derivedValue)` only evaluates its initial value once — on the very first
mount, before React has resolved prop values. If `lessonData` prop hasn't arrived yet,
the board initialises from the wrong lesson (or from `undefined`, falling back to
Lesson 1's empty board).

**Rule:** Never initialise `boardFen` or any prop-derived state with
`useState(derivedFromProp)`. Always use:
```js
useEffect(() => {
  setBoardFen(step?.boardState || 'start');
}, [lessonData]);
```

---

## 13. Circuit Demonstrations — One Step Per Leg

`demoSequence` returns the piece to `startFen` between every frame. For multi-direction
teaching (showing 4 directions from e4) this is correct. For continuous circuit
demonstrations (a1→h1→h8→a8→a1) it causes the piece to snap back after each leg —
looking like an illegal jump.

**Rule:** Circuits use one `observe` step per leg. Each step's `boardState` = piece
at the START of that leg. One `demoSequence` frame per step = one clean move. Single-
frame sequences never return to start (piece stays at destination until Continue).

**Rule:** Never use a multi-frame `demoSequence` to represent a continuous circuit.

---

## 14. Timer Callbacks Must Use Refs, Not Closed-Over Variables

Any `setTimeout` callback that references `step` captures the value at the time the
timer is created — not at the time it fires. If the student advances to the next step
before the timer fires, the callback runs in the NEW step but restores the OLD step's
highlights (stale closure bug).

**Rule:** All timer callbacks that need the current step use `currentStepRef.current`
instead of the closed-over `step` variable. `currentStepRef` is updated synchronously
at the top of every step-change `useEffect`.

---

## 15. Comparing Two Pieces — Always Separate Boards, Separate Steps

Attempting to show two pieces on the same square with overlapping highlights, or to
animate a piece-swap within a single step, produces consistent failures:
stale closures overwrite highlights, animation timers interfere, highlights from
the previous piece persist into the next step.

**Rule:** When comparing two pieces (e.g. Rook vs Bishop reach), show each on its own
board in its own step. Use DIFFERENT squares (e.g. Rook on e4, Bishop on e5) so there
is zero visual ambiguity. Never animate a piece swap within a single step. Static
boards with static highlights are always more reliable than animated transitions
for teaching concepts.

---

## 16. Every Lesson Has a Bonus Export

Every lesson file exports both the main lesson AND a bonus:
```js
export const LESSON_X = { ... };
export const LESSON_X_BONUS = { ... };
```

The bonus must contain at minimum:
- 8 trivia `recap-quiz` questions covering that lesson's content
- 2 speed rounds using `targetCount` (not `targetSquares`) for random fresh squares
- A `complete` step at the end

The component `lessonBonusMap` is updated whenever a new lesson is added:
```js
const lessonBonusMap = {
  'chess-lesson-1': LESSON_1_BONUS,
  'chess-lesson-3': LESSON_3_BONUS,
  // add each new lesson here
};
```

---

## 17. Speed Rounds in Bonus Phases — Use `targetCount`

Speed round steps in bonus phases use `targetCount` instead of `targetSquares`.
The component generates `targetCount` random squares, making every bonus play-through
different. This keeps repeat sessions fresh for fast learners.

Speed rounds in MAIN lesson phases use explicit `targetSquares` for pedagogical
control over exactly which squares are tested.

---

## 18. Solo-Piece Boards — King Scan Before Every Deploy (Hardened)

Kings must NEVER appear on solo-piece teaching boards. The pre-deploy King scan
must pass with zero violations before any lesson data commit.

Approved King-present steps (whitelist):
- Steps using the full starting position (`boardState: 'start'`)
- The King introduction step (`pl1` in Lesson 2)
- Starting position review steps (`sp0`–`sp8` in Lesson 2)
- Preview steps showing the NEXT lesson's featured pieces (`wu2` in Lessons 2/3)
- Multi-piece boards where Kings are part of the lesson subject
- Promotion teaching boards where a black King or black pieces serve as contextual
  opponents, provided the lesson subject is the Pawn's promotion mechanic, not the
  King itself.

Any FEN not in this whitelist that contains K or k is a violation. Zero exceptions.

---

## 19. Board-Voice Synchronisation

Every piece Ms. Momo names or discusses must be visibly present on the board at
the moment she speaks about it. When she transitions from one piece to another
mid-step, the board must update to show the new piece. When she describes a
piece's movement, the piece must demonstrate that movement on the board. A static
board showing the wrong piece — or no piece — while Ms. Momo speaks about a
different one is a Rule 19 violation. This applies to warm-up, teaching, recap,
and wrap-up steps equally.

**Implementation:** If a single voice covers multiple pieces, split it into
separate steps — one per piece — each with the correct `boardState`. Never
describe a piece in voice that isn't currently on the board.

**Exception — Bonus trivia recap-quiz steps:** These steps are exempt from Rule 19
board-presence requirements. They are memory recall tests where the absence of the
piece on the board is intentional. The `pieceLetterRef` panel must still be present
for all pieces named in the voice or question text.

---

## Updated Pre-Deploy Checklist

- [ ] Rules 1-10 (original checklist)
- [ ] `fenToPositionObj` uses `skipValidation` (Rule 11)
- [ ] No `useState(derivedFromProp)` for board or lesson state (Rule 12)
- [ ] Circuit demonstrations use one step per leg (Rule 13)
- [ ] Timer callbacks use `currentStepRef.current` not closed-over `step` (Rule 14)
- [ ] Piece comparisons use separate boards on separate steps (Rule 15)
- [ ] Lesson has a `LESSON_X_BONUS` export (Rule 16)
- [ ] Bonus speed rounds use `targetCount` not `targetSquares` (Rule 17)
- [ ] King scan passes with zero violations against whitelist (Rule 18)
- [ ] Board-voice sync: every spoken piece is visible on the board at the moment it's named (Rule 19)
- [ ] Run `node scripts/auditLesson.js` — zero violations
- [ ] Build compiles with no errors
