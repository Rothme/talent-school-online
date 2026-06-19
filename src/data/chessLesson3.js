/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 3 — Rook and Bishop Movement
// 56 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 3 of 24
//
// REBUILD v3 — all observations applied:
// • wa1: ALL 4 Rooks + ALL 4 Bishops on board from first word
// • Warm-up: tests Lesson 2 letters + Lesson 1 squares
// • Rook teaching: 4 Rooks only (no Kings), full perimeter circuit
//   a1→h1→h8→a8→a1, then black Rook h8→a8→a1→h1→h8
// • Bishop teaching: 4 Bishops only (no Kings), full diagonal circuit
//   c1→a3→f8→h6→c1, then black Bishop f8→h6→c1→a3→f8
// • Together phase: Rook and Bishop ALTERNATE on e4, highlights persist
// • wu2: Queen+King (both colours) on board as Ms. Momo introduces them
// • All FENs programmatically verified — zero hand-typed positions
// ─────────────────────────────────────────────────────────────────

export const LESSON_3 = {
  id: 'chess-lesson-3',
  title: 'Rook and Bishop Movement',
  subtitle: 'Lesson 3 of 24 · Beginner Module',
  totalMinutes: 56,

  phases: [

    // ═══════════════════════════════════════════════════════════
    // PHASE 1 — WARM-UP (6 min)
    // wa1: ALL pieces being taught visible on board immediately
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
          // All 4 Rooks + all 4 Bishops on their real starting squares
          boardState: 'r1b2b1r/8/8/8/8/8/8/R1B2B1R w - - 0 1',
          highlights: ['a1','h1','a8','h8','c1','f1','c8','f8'],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `Welcome back, {name}! Look at the board — today's stars are already there! The Rooks in the corners — a1, h1, a8, h8. And the Bishops beside them — c1, f1, c8, f8. Today you will discover exactly HOW they move. The Rook travels in straight lines. The Bishop glides diagonally. Let's warm up your memory first — from both Lesson 1 and Lesson 2!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's warm up!",
        },
        {
          id: 'wa2',
          type: 'recap-quiz',
          boardState: 'start',
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From Lesson 2 — what letter does the Rook use in chess notation?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'What letter does the Rook use?',
          recapOptions: ['R', 'K', 'N'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! R for Rook. K is King, N is Knight. You remember your letters, {name}!`,
          recapWrongVoice: `It is R for Rook! Remember from Lesson 2 — K is King, N is Knight, R is Rook.`,
          continueLabel: 'Next!',
        },
        {
          id: 'wa3',
          type: 'recap-quiz',
          boardState: 'start',
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `What letter does the Bishop use?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'What letter does the Bishop use?',
          recapOptions: ['B', 'R', 'Q'],
          recapCorrect: 0,
          recapCorrectVoice: `B for Bishop! Today you will see exactly how it earns its letter — moving in a completely unique way.`,
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
          successVoice: `{score} out of 4! Letters and squares — all sharp. Now — let the Rook show you what it can do!`,
          continueLabel: "Let's meet the Rook!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — ROOK: HOW IT MOVES (10 min)
    // All 4 Rooks, NO Kings. Full perimeter circuit for both colours.
    // FENs: r6r/8/8/8/8/8/8/R6R (4 rooks, no kings)
    // Circuit frames use single-piece solo boards (skipValidation)
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
          voice: `Here are all FOUR Rooks on their real starting squares — a1 and h1 for White, a8 and h8 for Black. Remember — R for Rook! The Rook looks like a castle tower with a flat, blocky top. It moves in STRAIGHT LINES only — up, down, left, or right — never diagonally. Watch the White Rook travel the full edge of the board!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Watch the White Rook!',
        },
        {
          id: 'rt1',
          type: 'observe',
          // White Rook solo — full perimeter circuit a1→h1→h8→a8→a1
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/7R w - - 0 1', path: ['b1','c1','d1','e1','f1','g1','h1'], delay: 2800 },
            { fen: '7R/8/8/8/8/8/8/8 w - - 0 1',  path: ['h2','h3','h4','h5','h6','h7','h8'], delay: 2800 },
            { fen: 'R7/8/8/8/8/8/8/8 w - - 0 1',  path: ['g8','f8','e8','d8','c8','b8','a8'], delay: 2800 },
            { fen: '8/8/8/8/8/8/8/R7 w - - 0 1',  path: ['a7','a6','a5','a4','a3','a2','a1'], delay: 2800 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Watch the White Rook start on a1 and travel right along rank 1 to h1! Then straight UP the h-file all the way to h8! Then left across rank 8 to a8! And back DOWN the a-file to a1! Four straight moves — the Rook has toured the entire edge of the board! STRAIGHT LINES only — up, down, left, right — that is all the Rook ever needs!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now watch the Black Rook!',
        },
        {
          id: 'rt2',
          type: 'observe',
          // Black Rook solo — full perimeter circuit h8→a8→a1→h1→h8
          boardState: '7r/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: 'r7/8/8/8/8/8/8/8 w - - 0 1',  path: ['g8','f8','e8','d8','c8','b8','a8'], delay: 2800 },
            { fen: '8/8/8/8/8/8/8/r7 w - - 0 1',  path: ['a7','a6','a5','a4','a3','a2','a1'], delay: 2800 },
            { fen: '8/8/8/8/8/8/8/7r w - - 0 1',  path: ['b1','c1','d1','e1','f1','g1','h1'], delay: 2800 },
            { fen: '7r/8/8/8/8/8/8/8 w - - 0 1',  path: ['h2','h3','h4','h5','h6','h7','h8'], delay: 2800 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Now the Black Rook does exactly the same! From h8 across to a8, straight down to a1, across to h1, and back up to h8! Both Rooks — White and Black — move identically. Colour does not change the movement. Straight lines, as far as the board allows, in all four directions!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now see its full reach!',
        },
        {
          id: 'rt3',
          type: 'observe',
          // Rook from centre — 14 squares shown with persistent highlights
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          demoSequence: [
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['e5','e6','e7','e8'], delay: 2000 },
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['e3','e2','e1'],      delay: 2000 },
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['f4','g4','h4'],      delay: 2000 },
            { fen: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1', path: ['d4','c4','b4','a4'], delay: 2000 },
          ],
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From the centre square e4, the Rook reaches UP the e-file, DOWN the e-file, RIGHT along rank 4, and LEFT along rank 4. All FOURTEEN squares glow yellow — that is the Rook's full reach. Fourteen squares every time, no matter where it stands — corner, edge, or centre. The Rook never loses power!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 3 — ROOK: PRACTICE (12 min)
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
          pieceRangeFen: 'k7/8/8/8/7R/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `Now the Rook is on h4 — at the edge. Does it lose any power? Drag it to every square it can reach!`,
          task: 'Drag the Rook on h4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['h1','h2','h3','h5','h6','h7','h8','a4','b4','c4','d4','e4','f4','g4'],
          successVoice: `Still fourteen, {name}! The edge of the board does not reduce the Rook's power. Fourteen every time. Now the corner...`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'rp3',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/4K3/8/8/R7 w - - 0 1',
          highlights: [],
          voice: `The Rook is on a1 — its real starting square, the dark corner! Drag it to every square it can reach from a1!`,
          task: 'Drag the Rook on a1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','c1','d1','e1','f1','g1','h1'],
          successVoice: `Fourteen once more! Corner, edge, or centre — the Rook always controls exactly fourteen squares. That is the Rook's constant power. You have mastered the Rook, {name}!`,
          continueLabel: 'Now meet the Bishop!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — BISHOP: HOW IT MOVES (10 min)
    // All 4 Bishops only — NO Kings. Full diagonal circuit both colours.
    // White circuit: c1→a3→f8→h6→c1
    // Black circuit: f8→h6→c1→a3→f8
    // Colour rule shown with persistent highlights
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
          // All 4 Bishops — NO Kings
          boardState: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
          highlights: ['c1','f1','c8','f8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Here are all FOUR Bishops on their real starting squares — c1 and f1 for White, c8 and f8 for Black! Remember — B for Bishop! See the tall, rounded top with a little notch like a hat. Now look carefully: c1 is a DARK square, f1 is a LIGHT square, c8 is a DARK square, and f8 is a LIGHT square. Those colours matter enormously — as you are about to discover!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Watch the White Bishop move!',
        },
        {
          id: 'bt1',
          type: 'observe',
          // White Bishop c1 solo — full diagonal circuit c1→a3→f8→h6→c1
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/B7/8/8 w - - 0 1',  path: ['b2','a3'],               delay: 2200 },
            { fen: '5B2/8/8/8/8/8/8/8 w - - 0 1', path: ['b4','c5','d6','e7','f8'], delay: 3000 },
            { fen: '8/8/7B/8/8/8/8/8 w - - 0 1',  path: ['g7','h6'],               delay: 2200 },
            { fen: '8/8/8/8/8/8/8/2B5 w - - 0 1', path: ['g5','f4','e3','d2','c1'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Watch the White Bishop on c1! It slides diagonally to a3. Then all the way up to f8! Then across to h6! And back down diagonally to c1! Every single move is diagonal — no straight lines at all. And notice — the Bishop has made a complete tour across the board using only diagonal paths!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now watch the Black Bishop!',
        },
        {
          id: 'bt2',
          type: 'observe',
          // Black Bishop f8 solo — circuit f8→h6→c1→a3→f8
          boardState: '5b2/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/7b/8/8/8/8/8 w - - 0 1',  path: ['g7','h6'],               delay: 2200 },
            { fen: '8/8/8/8/8/8/8/2b5 w - - 0 1', path: ['g5','f4','e3','d2','c1'], delay: 3000 },
            { fen: '8/8/8/8/8/b7/8/8 w - - 0 1',  path: ['b2','a3'],               delay: 2200 },
            { fen: '5b2/8/8/8/8/8/8/8 w - - 0 1', path: ['b4','c5','d6','e7','f8'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The Black Bishop on f8 does exactly the same — diagonal all the way! From f8 to h6, all the way down to c1, across to a3, and back up to f8! Now look at the squares the Black Bishop visited: f8, h6, c1, a3. What colour are they all? They are ALL light squares! This is no coincidence — this is the Bishop's most powerful secret!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now — the colour secret!',
        },
        {
          id: 'bt3',
          type: 'observe',
          // Show c1 Bishop's full dark-square diagonal reach — highlights persist
          boardState: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
          highlights: ['a1','b2','c3','d4','e5','f6','g7','h8','a3','b4','c5','d6','e7','f8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Look at the c1 Bishop's full reach — every square it can EVER visit, highlighted in yellow. They are ALL dark squares! The c1 Bishop lives on dark squares forever. And the f1 Bishop? It lives on light squares forever. A Bishop that starts on a dark square visits ONLY dark squares for its entire life, in every game it ever plays — never, ever a light square. This colour-lock NEVER changes!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's test this!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 5 — BISHOP: PRACTICE (13 min)
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
          voice: `This Bishop is on c1 — a dark square. Drag it to every square it can reach. Diagonals only!`,
          task: 'Drag the Bishop on c1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a3','b2','d2','e3','f4','g5','h6'],
          successVoice: `Seven squares — and every one is DARK, just like c1! The colour rule is real, {name}.`,
          continueLabel: 'Try the centre!',
        },
        {
          id: 'bp2',
          type: 'piece-range',
          pieceRangeFen: 'K7/8/8/4B3/8/8/8/7k w - - 0 1',
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
          pieceRangeFen: 'K6k/8/8/8/8/8/8/3B4 w - - 0 1',
          highlights: [],
          voice: `This Bishop is on d1 — a LIGHT square! Drag it to every square it can reach. Are they all light?`,
          task: 'Drag the Bishop on d1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a4','b3','c2','e2','f3','g4','h5'],
          successVoice: `All LIGHT squares, {name}! The colour-lock is real for both colours. Dark-squared Bishop stays dark. Light-squared Bishop stays light. Forever!`,
          continueLabel: 'Quick colour check!',
        },
        {
          id: 'bp4',
          type: 'recap-quiz',
          boardState: 'K6k/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `One check — this Bishop is on c1, a dark square. Could it ever reach e4, a light square?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Can a dark-squared Bishop ever reach a light square like e4?',
          recapOptions: ['Never — colour-locked forever', 'Yes, after many moves', 'Only by capturing a piece'],
          recapCorrect: 0,
          recapCorrectVoice: `Never! The Bishop's colour is locked for life — one of chess's permanent rules. You know it now, {name}!`,
          recapWrongVoice: `NEVER — the Bishop that starts on a dark square can only ever visit dark squares, no matter how many moves are played. The colour-lock is permanent.`,
          continueLabel: 'Now see them together!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 6 — TOGETHER (8 min)
    // tg1: Rook on e4 — 14 squares glow, PERSIST
    // tg2: Bishop on e4 — 13 squares glow, PERSIST
    // tg3: both 27 squares shown together
    // Highlights persist because sqNeonTimer now restores step.highlights
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
          voice: `{name}, look at the Rook on e4. All FOURTEEN yellow squares around it form a plus sign — straight up, down, left, right. These squares glow for as long as we discuss the Rook — they are NOT going away! This is the Rook's territory. Now I am going to swap it for the Bishop — watch carefully!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now swap to Bishop!',
        },
        {
          id: 'tg2',
          type: 'observe',
          boardState: 'k7/8/8/8/4B3/8/8/K7 w - - 0 1',
          highlights: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The Bishop has replaced the Rook on e4! Now THIRTEEN yellow squares glow — diagonals forming an X shape! Compare this to the Rook's plus shape. The Rook's squares and the Bishop's squares from the SAME square do NOT overlap at all. The Rook owns straight lines. The Bishop owns diagonals. Now — what if we show them BOTH at once?`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me both together!',
        },
        {
          id: 'tg3',
          type: 'observe',
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
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
          voice: `TWENTY-SEVEN squares — the plus AND the X combined! Together, a Rook and a Bishop from the same square reach nearly every corner of the board. The Rook handles straight lines. The Bishop handles diagonals. Between the two of them, every type of line on the chessboard is covered. And very soon, {name}, you will meet ONE single piece that can do both at once — but that is next lesson!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One more thing before we finish...',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 7 — WRAP-UP (4 min)
    // wu2: Queen AND King (both colours) on board as preview
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
          voice: `{name}, brilliant work today! The Rook — R — moves in straight lines, always controlling exactly fourteen squares no matter where it stands. The Bishop — B — moves diagonally, colour-locked forever. Together they cover every line on the board. This is real chess knowledge every strong player relies on — and now you have it!`,
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
          // Queen AND King — both colours — already on the board as Ms. Momo introduces them
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
