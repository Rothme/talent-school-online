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

**Suppression:** Orange teaching highlights are OFF during exercises/tests/quizzes:
`independent-squares`, `speed-round`, `colour-quiz`, `file-name-quiz`,
`click-file`, `click-rank`, `click-square`, `piece-range`, `recap-quiz`,
`piece-spot-quiz`, `piece-letter-quiz`. The student must work from memory, not
hints. **Exception:** Green confirmation ticks (✓) after correct drops are always
permitted in all exercise types including `piece-range` — these are feedback, not
hints. See Rule 25.

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

## 5. Piece Introduction Pattern (4-Step Structure)

Every chess piece, when first taught, follows exactly this sequence. See Rule 24 for full implementation detail of steps 2 and 3.

1. **Intro step** (`observe`) — piece appears on its REAL game-starting square
   (King e1/e8, Queen d1/d8, Rook a1+h1/a8+h8, Bishop c1+f1/c8+f8, Knight
   b1+g1/b8+g8, Pawn rank2/rank7). BOTH White and Black versions must appear
   together on an otherwise empty board — never just one colour alone. For pieces
   with 2+ units per colour, show ALL of them (both Rooks, both Bishops, both
   Knights, all 8 Pawns).

2. **Narrated highlight from starting square** (`piece-intro-guided`) — piece
   alone on its real starting square. Ms. Momo narrates each direction, squares
   light up one by one along each path in orange, accumulate and stay lit. Student
   drags piece to each orange square — snaps back, square turns green with ✓ tick.
   See Rule 24 for full mechanic. Knight uses `pathSquares` to show L-shape legs.

3. **Narrated highlight from central square** (`piece-intro-guided`) — same
   mechanic from a central square (E4 or D4) for maximum directional coverage.

4. **Unguided practice** (`piece-range`) — piece on a different square, no orange
   highlights. Student drags from memory. Green ✓ tick on correct drops. Piece
   snaps back after each drop.

**FEN verification is mandatory.** Every `targetSquares` set must be checked with
chess.js (`c.moves({square, verbose:true})`). The piece's current square must
never appear in `targetSquares`. Hand-counted FEN strings are prohibited.

---

## 6. Yellow Path Dots (`pathSqs`)

Any time a piece moves in a `demoSequence` frame or a `notation-demo` step,
every square along its path gets a small yellow dot in the centre
(`radial-gradient`), not a full highlight. This lets the student mentally connect
start → path → destination, especially for sliding pieces (Rook, Bishop, Queen)
and the Knight's L-shape corner.

`step.path` (single move) or `frame.path` (within a `demoSequence`) is an array
of square names. Dots clear when the piece returns to its start square or when
the step changes.

For `recap-quiz` steps with a single-frame `demoSequence`, the piece is left on
its destination square (does NOT loop back to start) so the student has a visual
reference while choosing their answer.

**Exception — `piece-intro-guided` steps:** These use the narrated square-by-square
orange highlight mechanic defined in Rule 24 instead of path dots. The Knight's
`pathSquares` in `piece-intro-guided` show yellow trail squares for the L-shape
legs, which serve the same visual purpose as path dots but are implemented
differently. Rule 6 path dots do not apply to `piece-intro-guided` steps.

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
- King introduction steps where both the White King and Black King appear together on their starting squares E1 and E8 on an otherwise empty board.

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

Target squares must display in vivid orange before the student clicks them. Green confirmation colour must only appear after a correct click is registered. Showing a target square in green before any interaction is a Rule 19 violation.

---

## 20. Piece Path Animation

Every piece move must animate the piece sequentially through each square in the path
array, one square at a time, before arriving at the destination. The piece must never
teleport or jump directly to the destination square.

**Rule:** The yellow path dots and the piece animation must be in sync — the piece
travels through each dot in order. This applies to all `demoSequence` frames and all
drag-and-drop feedback animations. The Knight is not exempt — its L-shape path must
be broken into its two legs (e.g. two squares forward, one square right) and the piece
must travel each leg visibly.

---

## 21. Bonus Round Fills Remaining Time

The bonus round must continue running for the full duration of remaining lesson time.
If time remains after the bonus trivia questions are exhausted, the speed rounds must
loop or extend until time expires. The bonus round must never end early while the
session timer still has minutes remaining.

**Rule:** A `complete` step only triggers when time has genuinely run out.

---

## 22. Quiz and Challenge Variety

No more than two consecutive steps in any phase may use the same quiz or challenge
mechanic. Each lesson must include at least three distinct challenge types drawn from:
square-identification, piece-placement, capture-target, path-counting, speed-tap, and
story-framed challenges.

**Rule:** "Choose the correct square" type tasks must not exceed 40% of all quiz steps
in a lesson. Designers must consult Lichess puzzle patterns and Chess Kid challenge
formats for inspiration when building quiz phases.

**Exception** — LESSON_X_BONUS recap-quiz steps are exempt from the consecutive-mechanic limit. The bonus trivia bank is an optional recall phase, not a teaching sequence, and consecutive recap-quiz steps are intentional by design.

---

## 23. Step State Reset

Every step must load with a completely clean board state. The component must explicitly reset all of the following before applying new step values: clicked squares, wrong squares, neonFile, neonRank, neonSquares, and any active word-trigger highlights. No highlight colour, clicked state, or file/rank fill from a previous step may carry over into a new step. A step that inherits visual state from a previous step is always a Rule 23 violation.

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
- [ ] Piece moves animate through every square in the path array sequentially; Knight travels both legs visibly (Rule 20)
- [ ] Bonus round loops until time expires; `complete` step only fires when time runs out (Rule 21)
- [ ] No more than two consecutive steps with same mechanic; ≥3 distinct challenge types; "choose the correct square" ≤40% of quiz steps (Rule 22)
- [ ] Step state fully reset on every step change: clicked, wrong, neonFile, neonRank, neonSquares, word-trigger highlights (Rule 23)
- [ ] Run `node scripts/auditLesson.js` — zero violations
- [ ] Build compiles with no errors
- [ ] Piece intro follows 4-step narrated highlight pattern per Rule 24
- [ ] All piece exercises show green ✓ tick on correct drops (Rule 25)
- [ ] UI fits on screen without scrolling; continue button always visible (Rule 26)
- [ ] boardWidth prop matches rendered board pixel width; no CSS transforms on board parent (Rule 27)
- [ ] Piece always snaps back after drop; drag pickup not blocked by pointer-events (Rule 27)
- [ ] Ms. Momo voice lines have age variants for meetpieces steps; no repeated encouragements (Rule 28)
- [ ] True-or-false voice does not name coordinates that trigger answer-leaking highlights (Rule 28)
- [ ] Quiz questions are unambiguous; piece-spot-quiz shows piece on board (Rule 29)
- [ ] Warm-up tests previous lessons only; main lesson tests current lesson only; bonus round is the only cross-lesson phase (Rule 30)
- [ ] Lesson ends with bonus round (if time remains) then animated celebration screen with student name, stars, and Next Lesson button (Rule 31)
- [ ] Any notation-teaching phase includes at least one drag-based exercise after the click-based introduction (Rule 32)
- [ ] Starting-square teaching uses piece-placement taskType with draggable palette, progressive board fill, green ✓ on correct placement, snap-back on incorrect (Rule 33)
- [ ] No board change, piece movement, or highlight fires before or during the narration that announces it (Rule 34)
- [ ] Piece-placement exercises include a guided phase followed by an unguided phase with ≥5 random challenges (Rule 35)

---

## 24. Piece Introduction — Narrated Highlight Sequence (piece-intro-guided)

The standard 3-step piece introduction pattern (Rule 5) is replaced by a 4-step pattern for all pieces:

1. **Intro step** (`observe`) — BOTH White and Black pieces on their real starting squares, empty board otherwise. Ms. Momo introduces the piece by name, starting square, and one-sentence description of its role.

2. **Narrated highlight from starting square** (`piece-intro-guided`) — piece alone on its real starting square. Ms. Momo narrates each direction of movement. As she speaks each direction, squares light up one by one along the path in orange. Squares accumulate and stay lit. When narration ends, all reachable squares are orange. Student then drags the piece to each orange square — piece snaps back to start after each successful drop, square turns green with a ✓ tick. Step completes when all squares are visited.

3. **Narrated highlight from central square** (`piece-intro-guided`) — same mechanic repeated from a central square (E4 or D4) so the student sees the full range of the piece from a position with maximum coverage. All 8 directions visible for King, Queen, Bishop, Knight. All 4 straight directions for Rook. Forward directions for Pawn.

4. **Unguided practice** (`piece-range`) — piece on a different square, no orange highlights. Student drags from memory. Green tick appears on correct drops, same as guided. Piece snaps back after each drop.

**Knight special case:** The Knight's narration must show the L-shape path using `pathSquares` — intermediate squares light up yellow (the two-square leg), then the destination lights up orange. Path squares fade after a brief pause, destination stays orange. This visually traces the L-shape so the student can follow the movement logic.

**FEN verification is mandatory** for all `targetSquares` in every `piece-intro-guided` step. Use chess.js `c.moves({square, verbose:true})` to generate the correct squares programmatically. Never hand-count.

**The piece's current square must never appear in `targetSquares`.** Only squares the piece can legally move TO are included.

---

## 25. Green Tick Feedback on All Piece Exercises

Every piece exercise step — guided (`piece-intro-guided`) and unguided (`piece-range`) — must show a green background with a white ✓ tick on squares the student has successfully visited. This applies universally:

- Orange squares = unvisited targets (guided only)
- Green ✓ squares = correctly visited targets (both guided and unguided)
- No orange squares = unguided (student works from memory, green ticks appear as reward)

The tick must be rendered via `customSquareRenderer` so it appears on both light and dark squares consistently. The tick div must NOT have `pointer-events: none` — this blocks piece drag pickup.

---

## 26. UI Layout Standards (Beginner Tier)

The chess lesson interface uses a fixed three-column layout:

- **Left panel (20%)** — Ms. Momo card (avatar, name, subtitle, speech bubble showing current voice text, rewind/pause/play controls) + YOUR QUEST phase progress list
- **Centre panel (60%)** — THE BATTLEFIELD label + chessboard + task bar below board
- **Right panel (20%)** — SQUARES FOUND score card + ACHIEVEMENTS badges + age mode toggle (6–8 / 9–12 / 13+)

**All content must fit on screen without scrolling.** The continue button must always be visible. Quiz options, score, and age toggle must all be simultaneously visible. If content overflows the right panel, reduce font sizes or card padding — never allow the continue button to be pushed off screen.

**The board must always be a perfect square.** Use `aspect-ratio: 1/1` with `width: 100%` and `max-height: calc(100vh - 140px)`. The `boardWidth` prop passed to the Chessboard component must exactly match the rendered pixel width of the board wrapper — mismatch causes drop coordinate offset.

**Phase progress list** shows all lesson phases with icons: ✓ green for completed, ▶ orange for active, · dim for upcoming. Phase names must always be visible — never truncated or hidden.

**Context-sensitive right panel:** The right panel must only display metrics and widgets relevant to the current lesson's objectives. "Squares Found" must not appear in lessons where no square-finding exercise exists. Every achievement badge must display a short descriptive label beneath the badge name explaining the condition that earned it (e.g. "First Hit — answered correctly on first attempt"). Vague badge names alone are not sufficient.

---

## 27. Piece Exercise Drag and Drop Standards

**Piece always snaps back to starting square** after every drop in `piece-intro-guided` and `piece-range` steps. The piece never stays on the destination square during exercises. Return false from `onPieceDrop` always.

**Drop acceptance must be forgiving.** The `boardWidth` prop must exactly match the rendered board pixel width so drop coordinates are correctly aligned. No CSS `transform`, `scale`, or `zoom` may be applied to any parent of the board wrapper — these shift the coordinate system and make drops register in the wrong square.

**Drag pickup must never be blocked.** The `customSquareRenderer` divs must not have `pointer-events: none` — this blocks the student from grabbing pieces. React-chessboard handles its own piece drag events independently of the custom renderer.

**Narration must complete before drag is enabled** in `piece-intro-guided` steps. While Ms. Momo is narrating and squares are lighting up, `onPieceDrop` returns false immediately. Only after narration is complete (`narrationComplete === true`) does drag become active.

---

## 28. Voice Quality Standards (Ms. Momo Character Bible)

Ms. Momo speaks in short, punchy sentences. Maximum 12 words per sentence. No sentence starts with "I am going to" or "Let me" — she states directly. She never repeats the same encouragement phrase twice in a lesson.

**Age variants are mandatory** for every voice line in meetpieces and complex teaching steps:
- `young` (6–8): Enthusiastic, simple words, exclamation marks, child-friendly analogies
- `mid` (9–12): Confident coach tone, slightly more technical, fewer exclamations  
- `teen` (13–15): Minimal, direct, chess-specific terminology, no babying

**Word-triggered highlights must not leak answers.** In true-or-false steps, Ms. Momo must not speak any coordinate that would trigger a board highlight and reveal the correct answer. If the step tests whether square X is named correctly, the voice must not mention X by name — use descriptions instead ("this glowing square", "the highlighted file").

---

## 29. Quiz Design Standards

**Questions must be unambiguous.** Never ask "how many squares can a King move to?" without specifying the King's position — the answer varies by location. Ask about directions ("in how many directions can the King move?") or use a board-positioned question ("how many squares can the King reach from E4?").

**True-or-false steps** must suppress all word-triggered highlights (Rule 3). The board highlight is the teaching clue — the voice must not add a second clue by naming the coordinate.

**Piece-spot-quiz steps** must always show the piece being identified on the board. An empty board with an identification question is always a Rule 19 violation. The board must display `quizItems[currentQuizItemIndex].fen` during each question, not `step.boardState`.

**Quiz options must be plausible distractors.** Wrong answers must be squares or names that a confused student might genuinely pick — not obviously wrong options that make the question trivial.

---

## 30. Exercise Content Scope

Exercises and challenges within a lesson must be scoped to appropriate content:

- **Warm-up phase:** recap of previous lessons only. Never introduce current lesson content in the warm-up.
- **Main lesson exercises:** current lesson content only. Never test knowledge from a previous lesson inside the core teaching flow.
- **Bonus round:** open scope — may draw from all previous lessons plus the current lesson. This is the only phase where cross-lesson challenge content is permitted.

A speed challenge, quiz, or interactive exercise that tests content from a different lesson appearing in the main teaching flow is always a Rule 30 violation.

---

## 31. Lesson Completion Flow

A lesson must never end abruptly. When the final teaching step is complete:

1. If time remains on the lesson timer, the bonus round triggers automatically before the completion screen.
2. After the bonus round (or immediately if no time remains), a celebration screen fires showing: what the student learned today, stars earned, Ms. Momo's closing encouragement, and a clear "Next Lesson" button.
3. The celebration screen must be animated — not a static card.
4. Ms. Momo must speak a closing line personalised with the student's name.

Ending a lesson on the final quiz step without a celebration screen or bonus round trigger is always a Rule 31 violation.

---

## 32. Drag-Based Notation Practice

Any phase that teaches chess notation — piece letter plus square equals a move (e.g. "Ra4 means the Rook moved to a4") — must include at least one drag-based exercise where the student physically moves the piece to the notated square on the board. Click-to-answer quiz options alone are insufficient for notation teaching. The drag exercise must come after the click-based introduction, not replace it.

---

## 33. Piece Placement taskType (piece-placement)

Phases teaching starting square positions ("Where Every Piece Starts") must use the `piece-placement` taskType:

- Pieces are rendered outside the board as a draggable palette (left and right sides of the board, or below it).
- Ms. Momo calls each piece and its starting square(s). The student drags the piece from the palette onto the correct square(s).
- On correct placement, the piece stays on the square (does not snap back). A green ✓ tick confirms the placement.
- On incorrect placement, the piece returns to the palette.
- The board fills progressively as each piece is placed correctly.
- This taskType is also used in the bonus round for timed full-board setup challenges.

---

## 34. Narration-Before-Action Sequencing

Any board state change, piece movement, or square highlight that 
accompanies a narrated instruction must not occur until Ms. Momo has 
spoken the relevant part of her narration. The board must never 
pre-empt or give away the answer before Ms. Momo's voice reaches that 
point. Specifically:

- If Ms. Momo says "Watch the Rook move to d1" — the Rook must not 
  move until she finishes that sentence
- If Ms. Momo says "Rd1 — which square? d1!" — the piece must not 
  appear on d1 until after she names it
- This rule applies to all taskTypes: observe, piece-intro-guided, 
  notation-drag, piece-placement, and any future taskType

A board change that fires before or during the narration that announces 
it is always a Rule 34 violation.

---

## 35. Guided vs Unguided Practice (piece-placement)

Every piece-placement exercise must include two sequential phases:

**Guided phase (piece-placement taskType):** Ms. Momo calls each piece 
and its starting square one at a time. The relevant piece slot in the 
palette is highlighted/active while others are dimmed. Student drags 
the named piece to the correct square. Board fills progressively.

**Unguided phase (piece-placement-unguided taskType):** All palette 
pieces are active and draggable simultaneously — no piece is highlighted 
or dimmed. Board starts empty. Ms. Momo gives a minimum of 5 random 
placement challenges with no visual hints. Student must recall starting 
positions from memory. Correct placement confirmed with green tick. 
Wrong placement returns piece to palette with Ms. Momo feedback.

The unguided phase must always follow the guided phase within the same 
lesson. A piece-placement exercise without an unguided follow-up phase 
is always a Rule 35 violation.

