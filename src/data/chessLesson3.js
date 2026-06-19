/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 3 — Rook and Bishop Movement
// 56 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 3 of 24
//
// REBUILD v4 — all Lesson 1+2 rules applied as hard rules:
//
// RULE: Only the piece being taught appears on the board — NO Kings,
//       NO other pieces unless the step explicitly introduces them.
// RULE: Circuit movements use SEPARATE steps per leg so each step's
//       boardState = piece at the START of that leg. The component
//       resets boardState on each step transition, so continuous
//       circuit animation is achieved through sequential steps,
//       NOT through a single demoSequence that returns to start.
// RULE: Warm-up must test ALL prior lessons (L1: squares, L2: letters).
// RULE: Pieces introduced in wa1 must appear on the board immediately.
// RULE: Together phase — Rook and Bishop alternate on e4, highlights
//       match the piece currently on e4, no Kings.
// RULE: wu2 preview introduces next lesson pieces on the board.
//
// ALL FENs programmatically verified with chess.js (skipValidation
// for single-piece display boards). Zero hand-typed positions.
// ─────────────────────────────────────────────────────────────────

export const LESSON_3 = {
  id: 'chess-lesson-3',
  title: 'Rook and Bishop Movement',
  subtitle: 'Lesson 3 of 24 · Beginner Module',
  totalMinutes: 56,

  phases: [

    // ═══════════════════════════════════════════════════════════
    // PHASE 1 — WARM-UP (6 min)
    // wa1: ALL pieces being taught visible on board from first word
    // wa2/wa3: test Lesson 2 letters (R, B)
    // wa4: test Lesson 1 squares
    // ═══════════════════════════════════════════════════════════
    {
      id: 'warmup',
      title: 'Warm-up — Letters and Squares',
      type: 'warmup',
      durationMins: 6,
      steps: [
        {
          id: 'wa1',
          type: 'observe',
          boardState: 'r1b2b1r/8/8/8/8/8/8/R1B2B1R w - - 0 1',
          highlights: ['a1','h1','a8','h8','c1','f1','c8','f8'],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `Welcome back, {name}! Look at the board right now — today's stars are already there! The Rooks sit in the corners: a1, h1, a8, and h8. The Bishops are right beside them: c1, f1, c8, and f8. Today you discover exactly HOW they move. The Rook travels in straight lines. The Bishop glides diagonally. Let us warm up your memory first — from both Lesson 1 and Lesson 2!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's warm up!",
        },
        {
          id: 'wa2',
          type: 'recap-quiz',
          boardState: 'r1b2b1r/8/8/8/8/8/8/R1B2B1R w - - 0 1',
          highlights: ['a1','h1','a8','h8'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From Lesson 2 — what letter does the Rook use in chess notation?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'What letter does the Rook use in chess notation?',
          recapOptions: ['R', 'K', 'N'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! R for Rook. K is King, N is Knight. You remember your letters well, {name}!`,
          recapWrongVoice: `It is R for Rook! From Lesson 2 — K is King, N is Knight, R is Rook.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'wa3',
          type: 'recap-quiz',
          boardState: 'r1b2b1r/8/8/8/8/8/8/R1B2B1R w - - 0 1',
          highlights: ['c1','f1','c8','f8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Good! Now — what letter does the Bishop use in chess notation?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'What letter does the Bishop use in chess notation?',
          recapOptions: ['B', 'R', 'Q'],
          recapCorrect: 0,
          recapCorrectVoice: `B for Bishop! Today you see exactly how the Bishop earns its letter — moving in a completely unique way.`,
          recapWrongVoice: `B for Bishop! Not R — that is the Rook. Today we see exactly how the Bishop moves.`,
          continueLabel: 'One more!',
        },
        {
          id: 'wa4',
          type: 'independent-squares',
          boardState: 'empty',
          highlights: [],
          voice: `And from Lesson 1 — let us check your squares. Find each square I call!`,
          task: 'Click every square Ms. Momo calls.',
          taskType: 'independent-squares',
          targetSquares: ['a1','h8','e4','d5'],
          voiceCorrect: [
            'a1 — the dark corner, where the White Rook starts!',
            'h8 — the light corner, where the Black Rook starts!',
            'e4 — the most famous square in chess!',
            'd5 — right in the centre!',
          ],
          voiceWrong: `Not quite — this square is {sq}. File letter first, then rank number!`,
          successVoice: `{score} out of 4! Letters and squares all sharp. Now — let the Rook show you what it can do!`,
          continueLabel: "Meet the Rook!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — ROOK: HOW IT MOVES (10 min)
    // rt0: All 4 Rooks on board — no Kings
    // rt1a-rt1d: White Rook circuit — SEPARATE STEP PER LEG
    //   rt1a: a1→h1  rt1b: h1→h8  rt1c: h8→a8  rt1d: a8→a1
    // rt2a-rt2d: Black Rook circuit — SEPARATE STEP PER LEG
    //   rt2a: h8→a8  rt2b: a8→a1  rt2c: a1→h1  rt2d: h1→h8
    // rt3: Rook on e4 — 14 squares, no Kings
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rookteach',
      title: 'The Rook — Straight Lines',
      type: 'teach',
      durationMins: 10,
      steps: [
        {
          id: 'rt0',
          type: 'observe',
          boardState: 'r6r/8/8/8/8/8/8/R6R w - - 0 1',
          highlights: ['a1','h1','a8','h8'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Here are all FOUR Rooks on their real starting squares — a1 and h1 for White, a8 and h8 for Black. R for Rook! The Rook looks like a castle tower with a flat, blocky top. It moves in STRAIGHT LINES only — up, down, left, or right. Never diagonal. Watch the White Rook travel the full edge of the board — one move at a time!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Watch the White Rook — step 1!',
        },
        // WHITE ROOK CIRCUIT — one step per leg so piece stays at destination
        {
          id: 'rt1a',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/7R w - - 0 1', path: ['b1','c1','d1','e1','f1','g1','h1'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `The White Rook starts on a1 and slides RIGHT along rank 1 — all the way to h1! Straight line along the rank. Seven squares in one move!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'rt1b',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/7R w - - 0 1',
          demoSequence: [
            { fen: '7R/8/8/8/8/8/8/8 w - - 0 1', path: ['h2','h3','h4','h5','h6','h7','h8'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From h1 the Rook goes straight UP the h-file — all the way to h8! Seven squares upward in one move!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'rt1c',
          type: 'observe',
          boardState: '7R/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: 'R7/8/8/8/8/8/8/8 w - - 0 1', path: ['g8','f8','e8','d8','c8','b8','a8'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From h8, the Rook slides LEFT along rank 8 — all the way to a8! Straight line along the top rank!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'rt1d',
          type: 'observe',
          boardState: 'R7/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/R7 w - - 0 1', path: ['a7','a6','a5','a4','a3','a2','a1'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `And from a8, the Rook drops straight DOWN the a-file — back to a1! The White Rook has toured the entire edge of the board in four straight moves: right, up, left, down. That is the Rook's power — straight lines in all four directions!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now watch the Black Rook!',
        },
        // BLACK ROOK CIRCUIT — one step per leg
        {
          id: 'rt2a',
          type: 'observe',
          boardState: '7r/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: 'r7/8/8/8/8/8/8/8 w - - 0 1', path: ['g8','f8','e8','d8','c8','b8','a8'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `The Black Rook starts on h8 and slides LEFT along rank 8 to a8. Exactly the same straight-line movement!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'rt2b',
          type: 'observe',
          boardState: 'r7/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/r7 w - - 0 1', path: ['a7','a6','a5','a4','a3','a2','a1'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From a8 straight DOWN the a-file to a1. The Black Rook travels the same paths as the White Rook — colour does not change movement!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'rt2c',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/r7 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/7r w - - 0 1', path: ['b1','c1','d1','e1','f1','g1','h1'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From a1 RIGHT along rank 1 to h1. Straight line — just like the White Rook did!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Final move!',
        },
        {
          id: 'rt2d',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/7r w - - 0 1',
          demoSequence: [
            { fen: '7r/8/8/8/8/8/8/8 w - - 0 1', path: ['h2','h3','h4','h5','h6','h7','h8'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `And from h1 straight UP the h-file back to h8! The Black Rook has completed the same full circuit. White or Black — the Rook moves identically. Straight lines only, as far as the board allows!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now see its full reach!',
        },
        {
          id: 'rt3',
          type: 'observe',
          // Rook on e4 — NO Kings
          boardState: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['e5','e6','e7','e8'], delay: 2000 },
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['e3','e2','e1'],      delay: 2000 },
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['f4','g4','h4'],      delay: 2000 },
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['d4','c4','b4','a4'], delay: 2000 },
          ],
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From the centre square e4, the Rook reaches UP the e-file, DOWN the e-file, RIGHT along rank 4, and LEFT along rank 4. All FOURTEEN yellow squares light up — that is the Rook's full reach from the centre. Fourteen squares every time, no matter where it stands — corner, edge, or centre!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 3 — ROOK: PRACTICE (12 min)
    // All practice FENs: Rook only — NO Kings
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rookpractice',
      title: 'Rook Practice — Find the Reach',
      type: 'practice',
      durationMins: 12,
      steps: [
        {
          id: 'rp1',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          highlights: [],
          voice: `The Rook is on e4. Drag it to EVERY square it can reach — straight lines only, all fourteen!`,
          task: 'Drag the Rook on e4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          successVoice: `All fourteen, {name}! The whole e-file and the whole 4th rank. Now the edge...`,
          continueLabel: 'Try the edge!',
        },
        {
          id: 'rp2',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/7R/8/8/8 w - - 0 1',
          highlights: [],
          voice: `Now the Rook is on h4 — at the edge of the board. Does it lose power? Drag it to every square it can reach!`,
          task: 'Drag the Rook on h4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['h1','h2','h3','h5','h6','h7','h8','a4','b4','c4','d4','e4','f4','g4'],
          successVoice: `Still fourteen, {name}! The edge does not reduce the Rook. Fourteen every time. Now the corner...`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'rp3',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/8/8/R7 w - - 0 1',
          highlights: [],
          voice: `The Rook is on a1 — its real starting square! Drag it to every square it can reach from a1!`,
          task: 'Drag the Rook on a1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','c1','d1','e1','f1','g1','h1'],
          successVoice: `Fourteen once more! Corner, edge, or centre — always fourteen. That is the Rook's constant power. You have mastered the Rook, {name}!`,
          continueLabel: 'Now meet the Bishop!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — BISHOP: HOW IT MOVES (10 min)
    // bt0: All 4 Bishops — NO Kings
    // bt1a-bt1d: White Bishop circuit — SEPARATE STEP PER LEG
    //   c1→a3  a3→f8  f8→h6  h6→c1
    // bt2a-bt2d: Black Bishop circuit — SEPARATE STEP PER LEG
    //   f8→h6  h6→c1  c1→a3  a3→f8
    // bt3: Colour rule with persistent highlights
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishopteach',
      title: 'The Bishop — Diagonal Lines',
      type: 'teach',
      durationMins: 10,
      steps: [
        {
          id: 'bt0',
          type: 'observe',
          boardState: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
          highlights: ['c1','f1','c8','f8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Here are all FOUR Bishops on their real starting squares — c1 and f1 for White, c8 and f8 for Black. B for Bishop! See the tall, rounded top with a little notch like a hat. The Bishop moves only DIAGONALLY — in four diagonal directions, as far as the board allows. Never in a straight line. Watch the White Bishop on c1 make a complete diagonal tour!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Watch the White Bishop — step 1!',
        },
        // WHITE BISHOP CIRCUIT — one step per leg
        {
          id: 'bt1a',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/B7/8/8 w - - 0 1', path: ['b2','a3'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The White Bishop starts on c1 and slides diagonally to a3 — two squares, up-left diagonal. Only diagonal — never straight!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'bt1b',
          type: 'observe',
          boardState: '8/8/8/8/8/B7/8/8 w - - 0 1',
          demoSequence: [
            { fen: '5B2/8/8/8/8/8/8/8 w - - 0 1', path: ['b4','c5','d6','e7','f8'], delay: 3200 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `From a3, the Bishop slides a long diagonal all the way to f8 — five squares, up-right! Look at the path: b4, c5, d6, e7, f8. Pure diagonal the whole way!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'bt1c',
          type: 'observe',
          boardState: '5B2/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/7B/8/8/8/8/8 w - - 0 1', path: ['g7','h6'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `From f8, the Bishop slides diagonally down-right to h6 — two squares. Short diagonal step!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Final move!',
        },
        {
          id: 'bt1d',
          type: 'observe',
          boardState: '8/8/7B/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', path: ['g5','f4','e3','d2','c1'], delay: 3200 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `And from h6, the Bishop slides all the way back to c1 — five squares, down-left diagonal! The White Bishop has completed its full diagonal tour: c1 to a3, to f8, to h6, and back to c1. Every single move diagonal — that is the Bishop's way!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now watch the Black Bishop!',
        },
        // BLACK BISHOP CIRCUIT — one step per leg
        {
          id: 'bt2a',
          type: 'observe',
          boardState: '5b2/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/7b/8/8/8/8/8 w - - 0 1', path: ['g7','h6'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The Black Bishop starts on f8 — a light square. It slides diagonally to h6. Same diagonal movement as the White Bishop!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'bt2b',
          type: 'observe',
          boardState: '8/8/7b/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/2b5 w - - 0 1', path: ['g5','f4','e3','d2','c1'], delay: 3200 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `From h6, down the long diagonal to c1 — five squares, down-left! Notice the squares: h6, g5, f4, e3, d2, c1. What colour are they all?`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next move!',
        },
        {
          id: 'bt2c',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/2b5 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/b7/8/8 w - - 0 1', path: ['b2','a3'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `From c1, a short diagonal up-left to a3. Still all light squares!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Final move!',
        },
        {
          id: 'bt2d',
          type: 'observe',
          boardState: '8/8/8/8/8/b7/8/8 w - - 0 1',
          demoSequence: [
            { fen: '5b2/8/8/8/8/8/8/8 w - - 0 1', path: ['b4','c5','d6','e7','f8'], delay: 3200 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `And from a3, the long diagonal back to f8. The Black Bishop visited f8, h6, c1, a3, and back to f8 — they are ALL light squares! This is the Bishop's great secret — it is locked to ONE colour for life. The White Bishop on c1 lives on DARK squares forever. The Black Bishop on f8 lives on LIGHT squares forever. The colour NEVER changes!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now — the colour secret!',
        },
        {
          id: 'bt3',
          type: 'observe',
          boardState: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
          highlights: ['a1','b2','c3','d4','e5','f6','g7','h8','a3','b4','c5','d6','e7','f8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Look — every square the c1 Bishop can EVER visit, highlighted in yellow. They are ALL dark squares! The c1 Bishop lives on dark squares forever. The f1 Bishop lives on light squares forever. A Bishop that starts on a dark square visits ONLY dark squares for its entire life, in every game it ever plays. This colour-lock NEVER changes!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's test this!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 5 — BISHOP: PRACTICE (13 min)
    // All practice FENs: Bishop only — NO Kings
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishoppractice',
      title: 'Bishop Practice — Find the Diagonals',
      type: 'practice',
      durationMins: 13,
      steps: [
        {
          id: 'bp1',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: [],
          voice: `The Bishop is on c1 — a dark square. Drag it to every square it can reach. Diagonals only!`,
          task: 'Drag the Bishop on c1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a3','b2','d2','e3','f4','g5','h6'],
          successVoice: `Seven squares — and every one is DARK, just like c1! The colour rule is real, {name}.`,
          continueLabel: 'Try the centre!',
        },
        {
          id: 'bp2',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/4B3/8/8/8/8 w - - 0 1',
          highlights: [],
          voice: `Now the Bishop is on e5 in the centre. Drag it to every square it can reach!`,
          task: 'Drag the Bishop on e5 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a1','b2','b8','c3','c7','d4','d6','f4','f6','g3','g7','h2','h8'],
          successVoice: `Thirteen from the centre — almost double! And all dark squares again. Now try a light-squared Bishop...`,
          continueLabel: 'Try a light-squared Bishop!',
        },
        {
          id: 'bp3',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/8/8/3B4 w - - 0 1',
          highlights: [],
          voice: `This Bishop is on d1 — a LIGHT square! Drag it to every square it can reach. Are they all light?`,
          task: 'Drag the Bishop on d1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a4','b3','c2','e2','f3','g4','h5'],
          successVoice: `All LIGHT squares! The colour-lock holds for both colours. Dark Bishop stays dark, light Bishop stays light — forever!`,
          continueLabel: 'Quick colour check!',
        },
        {
          id: 'bp4',
          type: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `One check — this Bishop is on c1, a dark square. Could it ever reach e4, a light square?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Can a dark-squared Bishop ever reach a light square like e4?',
          recapOptions: ['Never — colour-locked forever', 'Yes, after many moves', 'Only by capturing a piece'],
          recapCorrect: 0,
          recapCorrectVoice: `Never! The Bishop's colour is locked for life. One of chess's permanent rules — and you know it now, {name}!`,
          recapWrongVoice: `NEVER. The Bishop that starts on a dark square can only ever visit dark squares. The colour-lock is permanent.`,
          continueLabel: 'Now see them together!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 6 — TOGETHER (8 min)
    // tg1: Rook on e4 — 14 squares — NO Kings
    // tg2: Bishop on e4 — 13 squares — NO Kings
    // tg3: Both sets combined — NO Kings
    // ═══════════════════════════════════════════════════════════
    {
      id: 'together',
      title: 'Together They Cover Everything',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'tg1',
          type: 'observe',
          boardState: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Look at the Rook on e4. All FOURTEEN yellow squares form a plus sign — straight up, down, left, right. These highlights stay on screen as long as we discuss the Rook. This is the Rook's territory on e4. Now I am going to swap the piece — watch what changes!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Swap to Bishop!',
        },
        {
          id: 'tg2',
          type: 'observe',
          boardState: '8/8/8/8/4B3/8/8/8 w - - 0 1',
          highlights: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The Bishop has replaced the Rook on e4! Now THIRTEEN yellow squares glow — diagonals forming an X shape. Notice: the Rook's plus squares and the Bishop's X squares from the SAME square e4 do NOT overlap at all. The Rook owns straight lines. The Bishop owns diagonals. Now — what if we combine them?`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me both together!',
        },
        {
          id: 'tg3',
          type: 'observe',
          boardState: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          highlights: [
            'e1','e2','e3','e5','e6','e7','e8',
            'a4','b4','c4','d4','f4','g4','h4',
            'a8','b1','b7','c2','c6','d3','d5',
            'f3','f5','g2','g6','h1','h7',
          ],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `TWENTY-SEVEN squares — the plus AND the X combined! Together, a Rook and a Bishop from the same square cover nearly every corner of the board. The Rook handles straight lines. The Bishop handles diagonals. Between them, every type of line on the chessboard is covered. And very soon, {name}, you will meet ONE single piece that can do both at once — but that is next lesson!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One more thing before we finish...',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 7 — WRAP-UP (4 min)
    // wu2: Queen + King both colours on board for Lesson 4 preview
    // ═══════════════════════════════════════════════════════════
    {
      id: 'wrapup',
      title: 'Lesson Complete!',
      type: 'wrapup',
      durationMins: 4,
      steps: [
        {
          id: 'wu1',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `{name}, brilliant work today! The Rook — R — moves in straight lines, always controlling exactly fourteen squares no matter where it stands. The Bishop — B — moves diagonally, colour-locked forever to the colour of its starting square. Together they cover every line on the board. This is real chess knowledge that every strong player relies on — and now you have it!`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Which piece is locked to ONE colour of square for the whole game?',
          recapOptions: ['The Bishop', 'The Rook', 'Both of them'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! The Bishop — colour-locked forever. The Rook visits both light and dark squares freely.`,
          recapWrongVoice: `It is the BISHOP. A Bishop that starts on a dark square stays on dark squares forever. The Rook can move to any colour.`,
          continueLabel: 'One more thing before we finish...',
        },
        {
          id: 'wu2',
          type: 'wrapup',
          boardState: '3qk3/8/8/8/8/8/8/3QK3 w - - 0 1',
          highlights: ['d1','e1','d8','e8'],
          pieceLetterRef: [
            { icon: '♕', letter: 'Q', name: 'Queen' },
            { icon: '♔', letter: 'K', name: 'King' },
          ],
          voice: `Next time, {name}, we meet THESE two — look at them on the board right now! The Queen on d1 and d8, the King on e1 and e8. The Queen moves like the Rook AND Bishop combined — straight lines AND diagonals — making her the most powerful piece on the board! The King moves just one careful step in any direction. Everything you learned today will make the Queen feel familiar from the very first moment. See you next session!`,
          task: null,
          taskType: 'complete',
          continueLabel: 'Finish lesson!',
        },
      ],
    },
  ],
};
