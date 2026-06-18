/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 3 — Rook and Bishop Movement
// 55 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 3 of 24
// Builds on Lesson 1 (squares, files, ranks, piece shapes) and
// Lesson 2 (notation - piece letters R and B)
//
// CONCEPT (from Super Curriculum): Rooks control files and ranks.
// Bishops live on one colour forever. Together they cover everything.
// OBJECTIVE: Student can move Rook and Bishop correctly and identify
// what squares they control.
//
// SCOPE GUARDRAILS:
// - Pure movement-range only. NO captures, NO attacking other pieces,
//   NO "best move" judgments.
// - Bishop colour-bound rule is drilled with multiple examples per the
//   Tutor Note ("one of the most misunderstood rules - drill it").
//
// REBUILD NOTE (per docs/CURRICULUM_RULES.md): every piece intro now
// follows the 3-step pattern from Lessons 1-2 — real starting square
// first, then an animated demoSequence with path dots showing every
// direction, THEN the practice round. All FENs verified with chess.js.
// pieceLetterRef panels reinforce the R/B letters from Lesson 2.
// ─────────────────────────────────────────────────────────────────

export const LESSON_3 = {
  id: 'chess-lesson-3',
  title: 'Rook and Bishop Movement',
  subtitle: 'Lesson 3 of 24 · Beginner Module',
  totalMinutes: 56,

  phases: [

    // ═══════════════════════════════════════════════════════════
    // PHASE 1 — WARM-UP (5 minutes) — recall squares + notation
    // ═══════════════════════════════════════════════════════════
    {
      id: 'warmup',
      title: 'Warm-up — Squares and Letters',
      type: 'warmup',
      durationMins: 5,
      steps: [
        {
          id: 'wa1',
          type: 'observe',
          boardState: 'empty',
          highlights: [],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `Welcome back, {name}! Last time you learned the secret language of chess — algebraic notation. You know that R means Rook and B means Bishop. Today, we find out HOW these two pieces actually move around the board! First, a quick warm-up — I'm going to highlight some squares, and I want you to say their names before clicking them. Ready?`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's warm up!",
        },
        {
          id: 'wa2',
          type: 'independent-squares',
          boardState: 'empty',
          highlights: [],
          voice: `Here is the first square. What is its name?`,
          task: 'Click the highlighted squares and say their names.',
          taskType: 'independent-squares',
          targetSquares: ['d4', 'a1', 'h8', 'e5'],
          voiceCorrect: ['d4 — correct!', 'a1 — the dark corner!', 'h8 — the light corner!', 'e5 — well done!'],
          voiceWrong: `Not quite! This square is {sq} — file {file}, rank {rank}.`,
          successVoice: `Great recall, {name}! You scored {score} out of 4. Files, ranks, and squares are all still fresh in your memory. Now — let's meet the Rook properly!`,
          continueLabel: 'Meet the Rook!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — ROOK: HOW IT MOVES (7 minutes, was 6)
    // 3-step pattern: real square intro → demo with path dots → practice
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rookteach',
      title: 'The Rook — Straight Lines',
      type: 'teach',
      durationMins: 7,
      steps: [
        {
          id: 'rt0',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/R7 w - - 0 1',
          highlights: ['a1'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `{name}, here is the ROOK on its real starting square — a1, the dark corner you know from Lesson 1! Remember the Rook's letter from last time — capital R. Look at its shape — a little castle tower with a flat, blocky top. In a real chess game, you have TWO Rooks, starting on a1 and h1.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'How does it move?',
        },
        {
          id: 'rt1',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/R7 w - - 0 1',
          highlights: ['a1'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `The Rook moves in STRAIGHT LINES — up, down, left, or right — for as many squares as the board allows, as long as nothing is in the way. It can NOT move diagonally — not even one square! Watch closely as I show you both directions from a1.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me its reach!',
        },
        {
          id: 'rt2',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/R7 w - - 0 1',
          demoSequence: [
            { fen: 'R3k3/8/8/8/4K3/8/8/8 w - - 0 1', path: ['a2','a3','a4','a5','a6','a7','a8'], delay: 2400 },
            { fen: '4k3/8/8/8/4K3/8/8/7R w - - 0 1', path: ['b1','c1','d1','e1','f1','g1','h1'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Watch the Rook slide all the way up the a-file to a8! Now watch it slide all the way along rank 1 to h1! From a1, those are the only two directions available — but from the centre of the board, a Rook can go in all FOUR directions. Straight lines, as far as the board allows!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me from the centre!',
        },
        {
          id: 'rt3',
          type: 'observe',
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          demoSequence: [
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['e5','e6','e7','e8'], delay: 2200 },
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['e3','e2','e1'], delay: 2200 },
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['f4','g4','h4'], delay: 2200 },
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['d4','c4','b4','a4'], delay: 2200 },
          ],
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From the CENTRE square e4, the Rook reaches all FOUR directions — up the e-file, down the e-file, left along rank 4, and right along rank 4. That is FOURTEEN squares in total! The Rook is a powerful long-range piece, no matter which direction it travels.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 3 — ROOK: PRACTICE (12 minutes)
    // Three positions: center, edge, corner — drag and drop
    // FENs verified with chess.js — unchanged from original
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
          pieceRangeFen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `The Rook is on e4 again — this time, YOU find its reach! Drag the Rook to EVERY square it could move to. Remember — straight lines only, in all four directions. Take your time and find all fourteen!`,
          task: 'Drag the Rook on e4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          successVoice: `Excellent, {name}! All fourteen squares — the whole e-file and the whole 4th rank. Now let's try the Rook from a different spot!`,
          continueLabel: 'Next position!',
        },
        {
          id: 'rp2',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/8/7R/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `Now the Rook is on h4 — right at the EDGE of the board. Does that change how many squares it can reach? Drag the Rook to every square it can move to!`,
          task: 'Drag the Rook on h4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['h1','h2','h3','h5','h6','h7','h8','a4','b4','c4','d4','e4','f4','g4'],
          successVoice: `Still fourteen squares, {name}! Even on the edge of the board, the Rook's straight-line power doesn't change — it just reaches in fewer DIRECTIONS but the SAME total count, because the board doesn't continue past the edge. Now — the trickiest spot of all!`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'rp3',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/4K3/8/8/R7 w - - 0 1',
          highlights: [],
          voice: `The Rook is on a1 — the dark corner you know so well from Lesson 1! From a corner, the Rook can only move in TWO directions instead of four. Drag the Rook to every square it can reach from a1!`,
          task: 'Drag the Rook on a1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','c1','d1','e1','f1','g1','h1'],
          successVoice: `Fourteen again, {name}! Amazing — no matter WHERE a Rook stands on an empty board, it always controls exactly fourteen squares. Corner, edge, or centre — the Rook's power never changes. You have mastered the Rook's movement!`,
          continueLabel: 'Now meet the Bishop!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — BISHOP: HOW IT MOVES + COLOUR RULE (8 minutes, was 7)
    // 3-step pattern with both real starting squares shown
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishopteach',
      title: 'The Bishop — Diagonal Lines',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'bt0',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/2B2B2 w - - 0 1',
          highlights: ['c1', 'f1'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `{name}, here are both Bishops on their real starting squares — c1 and f1! Remember the Bishop's letter — capital B. See the tall, rounded top with a little notch, like a hat. Look closely — c1 is a DARK square, and f1 is a LIGHT square. That difference is about to matter a LOT.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'How does it move?',
        },
        {
          id: 'bt1',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The Bishop moves only DIAGONALLY — in the four diagonal directions, for as many squares as the board allows, as long as nothing is in the way. It can NEVER move in a straight line like the Rook does. Watch this Bishop slide from c1!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me its diagonals!',
        },
        {
          id: 'bt2',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/2B5 w - - 0 1',
          demoSequence: [
            { fen: '4k3/8/7B/8/4K3/8/8/8 w - - 0 1', path: ['d2','e3','f4','g5','h6'], delay: 2400 },
            { fen: '4k3/8/8/8/4K3/B7/8/8 w - - 0 1', path: ['b2','a3'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Watch the Bishop slide from c1 all the way to h6! And now watch it slide the other diagonal way, to a3! Notice something already — every square it touches is a DARK square, just like c1 itself. We will come back to that secret in a moment.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me from the centre!',
        },
        {
          id: 'bt3',
          type: 'observe',
          boardState: 'K7/8/8/4B3/8/8/8/7k w - - 0 1',
          demoSequence: [
            { fen: 'K6B/8/8/8/8/8/8/7k w - - 0 1', path: ['f6','g7','h8'], delay: 2200 },
            { fen: 'K7/8/8/8/8/8/8/B6k w - - 0 1', path: ['d4','c3','b2','a1'], delay: 2200 },
            { fen: 'K7/8/8/8/8/8/7B/7k w - - 0 1', path: ['f4','g3','h2'], delay: 2200 },
            { fen: 'KB6/8/8/8/8/8/8/7k w - - 0 1', path: ['d6','c7','b8'], delay: 2200 },
          ],
          highlights: ['a1','b2','c3','d4','f6','g7','h8','b8','c7','d6','f4','g3','h2'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Now from the CENTRE square e5, watch the Bishop reach all four diagonal directions — up to h8, down to a1, and the other diagonal from b8 down to h2. That is THIRTEEN squares — one less than the Rook's fourteen, because diagonals from the centre don't quite reach every corner.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now — the colour secret!',
        },
        {
          id: 'bt4',
          type: 'observe',
          boardState: 'K7/8/8/4B3/8/8/8/7k w - - 0 1',
          highlights: ['a1','b2','c3','d4','f6','g7','h8','b8','c7','d6','f4','g3','h2'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Here is the most important Bishop secret of all, {name}. Look at e5 — what colour is it? Dark! And look at EVERY single square the Bishop just lit up. They are ALL dark squares too! A Bishop that starts on a dark square can ONLY EVER visit dark squares — for its entire life, in every game it ever plays. It can NEVER, EVER reach a light square. The same is true for a light-squared Bishop — it stays on light squares forever!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's prove it again!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 5 — BISHOP: PRACTICE (13 minutes)
    // FENs verified with chess.js — unchanged from original
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
          pieceRangeFen: 'K6k/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: [],
          voice: `This Bishop is on c1 — a dark square, near the corner. Drag the Bishop to every square it can reach. Remember — diagonals only!`,
          task: 'Drag the Bishop on c1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a3','b2','d2','e3','f4','g5','h6'],
          successVoice: `Seven squares, {name} — and every single one is a DARK square, just like c1 itself! The colour rule holds again.`,
          continueLabel: 'Try the centre!',
        },
        {
          id: 'bp2',
          type: 'piece-range',
          pieceRangeFen: 'K7/8/8/4B3/8/8/8/7k w - - 0 1',
          highlights: [],
          voice: `Now the Bishop is back on e5, in the centre. From the centre, a Bishop can usually reach MORE squares than from a corner. Drag the Bishop to every square it reaches from e5!`,
          task: 'Drag the Bishop on e5 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a1','b2','b8','c3','c7','d4','d6','f4','f6','g3','g7','h2','h8'],
          successVoice: `Thirteen squares from the centre — almost double the corner Bishop's seven! And once again, e5 is dark, and all thirteen squares are dark too. {name}, can you guess what would happen with a Bishop on a LIGHT square?`,
          continueLabel: 'Try a light-squared Bishop!',
        },
        {
          id: 'bp3',
          type: 'piece-range',
          pieceRangeFen: 'K6k/8/8/8/8/8/8/3B4 w - - 0 1',
          highlights: [],
          voice: `This Bishop is on d1 — and d1 is a LIGHT square! Drag the Bishop to every square it can reach. Let's see what colour they all are...`,
          task: 'Drag the Bishop on d1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a4','b3','c2','e2','f3','g4','h5'],
          successVoice: `Just as you might have guessed, {name} — all seven squares are LIGHT squares! A light-squared Bishop stays on light squares forever, exactly like a dark-squared Bishop stays on dark squares forever. This is one of the most important rules in all of chess — and now YOU know it for life!`,
          continueLabel: 'Quick colour check!',
        },
        {
          id: 'bp4',
          type: 'recap-quiz',
          boardState: 'K6k/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `One more check, {name}. A Bishop starts the game on c1 — a dark square. After twenty moves, could this Bishop ever land on a light square like e4?`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'See the comparison!',
          recapQuestion: 'A dark-squared Bishop — could it ever reach a light square like e4?',
          recapOptions: ['Never — it stays on dark squares forever', 'Yes, after many moves', 'Only if it captures a piece'],
          recapCorrect: 0,
          recapCorrectVoice: `Exactly right, {name}! NEVER. A Bishop's colour is fixed for the whole game — it is one of chess's permanent rules.`,
          recapWrongVoice: `Not quite — the answer is NEVER. A Bishop that starts on a dark square can only ever move to dark squares, for the entire game, no matter how many moves are played.`,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 6 — TOGETHER: ROOK + BISHOP COVER EVERYTHING (8 minutes)
    // Now with animated comparison instead of static highlights only
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
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `{name}, remember the Rook on e4? It reached these fourteen squares — straight lines, like a plus sign. Now watch what happens when we add a Bishop to the SAME square...`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Add the Bishop!',
        },
        {
          id: 'tg2',
          type: 'observe',
          boardState: 'k7/8/8/8/4B3/8/8/K7 w - - 0 1',
          highlights: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Now here is a Bishop on e4 instead — and it lights up these diagonal squares, like an X shape! Notice something amazing — the Rook's squares and the Bishop's squares from the SAME starting square e4 do not overlap AT ALL. The Rook covers the plus-shape. The Bishop covers the X-shape. Together...`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me together!',
        },
        {
          id: 'tg3',
          type: 'observe',
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4','a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `...together, a Rook and a Bishop from the same square would cover TWENTY-SEVEN squares — the plus-shape AND the X-shape combined! That is the meaning of "together they cover everything," {name}. The Rook handles straight lines. The Bishop handles diagonals. Between the two of them, every type of line on the chessboard is covered. This is exactly why, very soon, you will meet a piece that can do BOTH at once — but that is a story for next time!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One more thing before we finish...',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 7 — WRAP-UP (4 minutes)
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
          voice: `{name}, what a lesson! Let's recap: the Rook moves in straight lines — up, down, left, right — and always controls fourteen squares on an empty board, no matter where it stands. The Bishop moves diagonally, and is locked to ONE COLOUR of square forever — a dark-squared Bishop visits only dark squares, and a light-squared Bishop visits only light squares, for the whole game. Together, the Rook and Bishop cover every line on the board — straight AND diagonal. You should be very proud — this is real chess knowledge that every strong player relies on!`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'Which piece is locked to squares of ONE colour for the whole game?',
          recapOptions: ['The Rook', 'The Bishop', 'Both of them'],
          recapCorrect: 1,
          recapCorrectVoice: `Yes! The Bishop — locked to one colour forever. The Rook can visit both light and dark squares.`,
          recapWrongVoice: `Not quite — it's the Bishop. A Bishop that starts on a dark square stays on dark squares forever, and the same for light. The Rook can move to both colours.`,
        },
        {
          id: 'wu2',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          voice: `Next time, {name}, we meet the Queen — the most powerful piece on the board, who moves like the Rook AND the Bishop combined! And we'll also meet the King, the piece that must be protected at all costs. You already know straight lines from the Rook and diagonals from the Bishop — so the Queen will feel familiar from the very first moment. See you next session!`,
          task: null,
          taskType: 'complete',
          continueLabel: 'Finish lesson!',
        },
      ],
    },

  ],
};
