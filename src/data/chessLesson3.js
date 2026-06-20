/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 3 — Rook and Bishop Movement
// 56 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 3 of 24
//
// REBUILD v5 — final approved approach:
//
// ANIMATION RULE (hard): demoSequence returns piece to startFen between
// frames. For circuit demos this caused "illegal jump" appearance.
// FIX: one step per circuit leg — each step's boardState = piece at
// START of that leg. One demoSequence frame per step = one clean move.
//
// TOGETHER PHASE RULE: NO demoSequence in tg1/tg2/tg3.
// Pure static boards + static highlights only. No animation = no
// mixed-up path confusion. Child sees piece clearly, highlights match.
//
// PRACTICE RULE: No pre-highlighted target squares. Student drags
// freely. Component validates on drop. No answer giveaways.
//
// ALL SOLO BOARDS: No Kings, no other pieces. Only the piece being
// taught. skipValidation handles rendering.
//
// All FENs verified with chess.js.
// ─────────────────────────────────────────────────────────────────

export const LESSON_3 = {
  id: 'chess-lesson-3',
  title: 'Rook and Bishop Movement',
  subtitle: 'Lesson 3 of 24 · Beginner Module',
  totalMinutes: 56,

  phases: [

    // ═══════════════════════════════════════════════════════════
    // PHASE 1 — WARM-UP (6 min)
    // wa1: ALL 4 Rooks + ALL 4 Bishops on board from first word
    // wa2: test Lesson 2 — Rook letter, board shows Rooks
    // wa3: test Lesson 2 — Bishop letter, board shows Bishops
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
          voice: `Welcome back, {name}! Look at the board right now — today's two stars are already on it! The Rooks sit in the corners: a1, h1, a8, and h8. The Bishops are right beside them: c1, f1, c8, and f8. Today you discover exactly HOW they move. Let us warm up your memory first — from both Lesson 1 and Lesson 2!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's warm up!",
        },
        {
          id: 'wa2',
          type: 'recap-quiz',
          boardState: 'r6r/8/8/8/8/8/8/R6R w - - 0 1',
          highlights: ['a1','h1','a8','h8'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From Lesson 2 — look at the Rooks in the corners. What letter does the Rook use in chess notation?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'What letter does the Rook use?',
          recapOptions: ['R', 'K', 'N'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! R for Rook. K is King, N is Knight. You remember your letters, {name}!`,
          recapWrongVoice: `It is R for Rook! K is King, N is Knight, R is Rook.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'wa3',
          type: 'recap-quiz',
          boardState: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
          highlights: ['c1','f1','c8','f8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Good! Now look at the Bishops. What letter does the Bishop use?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'What letter does the Bishop use?',
          recapOptions: ['B', 'R', 'Q'],
          recapCorrect: 0,
          recapCorrectVoice: `B for Bishop! Today you see exactly how the Bishop moves — in a completely unique way.`,
          recapWrongVoice: `B for Bishop! Not R — that is the Rook. Today we learn the Bishop's movement.`,
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
    // One step per circuit leg — no jumps, clean continuous movement
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
          voice: `Here are all FOUR Rooks on their real starting squares — a1 and h1 for White, a8 and h8 for Black. R for Rook! The Rook looks like a castle tower with a flat, blocky top. It moves in STRAIGHT LINES only — up, down, left, or right — never diagonally. Watch the White Rook travel the full edge of the board, one move at a time!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Watch the White Rook — move 1!',
        },
        {
          id: 'rt1a',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/8/8/7R w - - 0 1', path: ['b1','c1','d1','e1','f1','g1','h1'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Move 1 — the White Rook slides RIGHT along rank 1 from a1 all the way to h1! Straight line along the rank. Seven squares in one move!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Move 2!',
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
          voice: `Move 2 — from h1 the Rook goes straight UP the h-file all the way to h8! Seven more squares upward!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Move 3!',
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
          voice: `Move 3 — from h8 the Rook slides LEFT along rank 8 all the way to a8! Straight line along the top of the board!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Move 4!',
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
          voice: `Move 4 — from a8 the Rook drops straight DOWN the a-file back to a1! The White Rook has toured the entire edge of the board in four moves — right, up, left, down. STRAIGHT LINES in all four directions. That is the Rook's power!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now watch the Black Rook!',
        },
        {
          id: 'rt2a',
          type: 'observe',
          boardState: '7r/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: 'r7/8/8/8/8/8/8/8 w - - 0 1', path: ['g8','f8','e8','d8','c8','b8','a8'], delay: 3000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Now the Black Rook! From h8, it slides LEFT along rank 8 to a8. Same straight-line movement!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next!',
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
          voice: `From a8 straight DOWN to a1. The colour of the piece does not change the movement!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next!',
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
          voice: `From a1 right along rank 1 to h1. Straight!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Last move!',
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
          voice: `And from h1 straight UP to h8! The Black Rook has toured the same full circuit. White or Black — the Rook's movement is identical. Straight lines, as far as the board allows!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now see its full reach!',
        },
        {
          id: 'rt3',
          type: 'observe',
          boardState: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['e5','e6','e7','e8'], delay: 2000 },
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['e3','e2','e1'],      delay: 2000 },
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['f4','g4','h4'],      delay: 2000 },
            { fen: '8/8/8/8/4R3/8/8/8 w - - 0 1', path: ['d4','c4','b4','a4'], delay: 2000 },
          ],
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `From the centre square e4, the Rook reaches UP the e-file, DOWN the e-file, RIGHT along rank 4, and LEFT along rank 4. All FOURTEEN yellow squares — the Rook's full reach. Fourteen squares every time, no matter where it stands!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 3 — ROOK: PRACTICE (12 min)
    // No pre-highlighted targets — student drags freely
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
          voice: `Now the Rook is on h4 — at the edge. Does it lose power? Drag it to every square!`,
          task: 'Drag the Rook on h4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['h1','h2','h3','h5','h6','h7','h8','a4','b4','c4','d4','e4','f4','g4'],
          successVoice: `Still fourteen! The edge does not reduce the Rook. Now the corner...`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'rp3',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/8/8/R7 w - - 0 1',
          highlights: [],
          voice: `The Rook is on a1 — its real starting square! Drag it to every square it can reach!`,
          task: 'Drag the Rook on a1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','c1','d1','e1','f1','g1','h1'],
          successVoice: `Fourteen once more! Corner, edge, or centre — always fourteen. You have mastered the Rook, {name}!`,
          continueLabel: 'Now meet the Bishop!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — BISHOP: HOW IT MOVES (10 min)
    // One step per circuit leg — no jumps, clean continuous movement
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
          voice: `Here are all FOUR Bishops on their real starting squares — c1 and f1 for White, c8 and f8 for Black. B for Bishop! The Bishop moves only DIAGONALLY — in four diagonal directions, as far as the board allows. Never in a straight line. Watch the White Bishop on c1 make its full diagonal tour, one move at a time!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Watch the White Bishop — move 1!',
        },
        {
          id: 'bt1a',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          demoSequence: [
            { fen: '8/8/8/8/8/B7/8/8 w - - 0 1', path: ['b2','a3'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Move 1 — the White Bishop on c1 slides diagonally up-left to a3. Two squares, diagonal only!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Move 2!',
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
          voice: `Move 2 — from a3, the Bishop slides diagonally up-right all the way to f8! Five squares — b4, c5, d6, e7, f8. Pure diagonal!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Move 3!',
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
          voice: `Move 3 — from f8, the Bishop slides diagonally down-right to h6. Two squares!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Move 4!',
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
          voice: `Move 4 — from h6, the Bishop slides diagonally down-left all the way back to c1! The complete tour: c1 to a3, to f8, to h6, and back to c1. Every single move was diagonal. That is the Bishop's way!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now watch the Black Bishop!',
        },
        {
          id: 'bt2a',
          type: 'observe',
          boardState: '5b2/8/8/8/8/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '8/8/7b/8/8/8/8/8 w - - 0 1', path: ['g7','h6'], delay: 2400 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Now the Black Bishop on f8 — it slides diagonally to h6. Same diagonal movement!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next!',
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
          voice: `From h6, all the way down the diagonal to c1! Notice the squares visited: h6, g5, f4, e3, d2, c1. What colour are they all?`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next!',
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
          voice: `From c1, diagonally up-left to a3. All light squares!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Last move!',
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
          voice: `And from a3 all the way back to f8! The Black Bishop visited f8, h6, c1, a3 — they are ALL light squares! This is the Bishop's great secret — it is locked to ONE colour forever. The White c1 Bishop stays on DARK squares. The Black f8 Bishop stays on LIGHT squares. The colour NEVER changes!`,
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
          voice: `Look — every square the White c1 Bishop can EVER visit, highlighted in yellow. They are ALL dark squares! The c1 Bishop lives on dark squares forever. The f1 Bishop lives on light squares forever. A Bishop that starts on a dark square visits ONLY dark squares for its entire life. This colour-lock NEVER changes!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's test this!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 5 — BISHOP: PRACTICE (13 min)
    // No pre-highlighted target squares — student discovers freely
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
          voice: `The Bishop is on c1 — a dark square. Drag it to every square it can reach. Diagonals only — discover them yourself!`,
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
          successVoice: `Thirteen from the centre — almost double the corner! And all dark squares again. Now try a light-squared Bishop...`,
          continueLabel: 'Try a light-squared Bishop!',
        },
        {
          id: 'bp3',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/8/8/3B4 w - - 0 1',
          highlights: [],
          voice: `This Bishop is on d1 — a LIGHT square! Drag it to every square it can reach.`,
          task: 'Drag the Bishop on d1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a4','b3','c2','e2','f3','g4','h5'],
          successVoice: `All LIGHT squares! Dark Bishop stays dark, light Bishop stays light — forever, {name}!`,
          continueLabel: 'Quick colour check!',
        },
        {
          id: 'bp4',
          type: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `One final check — this Bishop is on c1, a dark square. Could it ever reach e4, a light square?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Can a dark-squared Bishop ever reach a light square like e4?',
          recapOptions: ['Never — colour-locked forever', 'Yes, after many moves', 'Only by capturing a piece'],
          recapCorrect: 0,
          recapCorrectVoice: `Never! The Bishop's colour is locked for life. One of chess's permanent rules!`,
          recapWrongVoice: `NEVER. The Bishop that starts on a dark square can only ever visit dark squares. Permanent, for the whole game.`,
          continueLabel: 'Now see them together!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 6 — TOGETHER (8 min)
    // SIMPLE SEPARATE APPROACH — Rook and Bishop on DIFFERENT squares.
    // No combined highlighting. No piece swapping. No complexity.
    // tg1: Rook on e4 — 14 straight squares glowing
    // tg2: Bishop on e5 — 13 diagonal squares glowing
    // tg3: Summary on Bishop board — no highlight changes
    // ═══════════════════════════════════════════════════════════
    {
      id: 'together',
      title: 'Rook and Bishop — What They Each Control',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'tg1',
          type: 'observe',
          boardState: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `{name}, here is the Rook on e4. Count the yellow squares — one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, FOURTEEN! All straight lines — up the e-file, down the e-file, left along rank 4, right along rank 4. FOURTEEN squares. That is the Rook's reach from the centre of the board. Every single one is a straight line. Now let us look at the Bishop!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now the Bishop!',
        },
        {
          id: 'tg2',
          type: 'observe',
          boardState: '8/8/8/4B3/8/8/8/8 w - - 0 1',
          highlights: ['a1','b2','b8','c3','c7','d4','d6','f4','f6','g3','g7','h2','h8'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Here is the Bishop on e5. Count the yellow squares — one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, THIRTEEN! All diagonals — four diagonal directions spreading outward. THIRTEEN squares. Every single one is a diagonal. Look how different the pattern is from the Rook's straight lines! The Rook owns the plus shape. The Bishop owns the X shape. They are completely different!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'What do they mean together?',
        },
        {
          id: 'tg3',
          type: 'observe',
          boardState: '8/8/8/4B3/8/8/8/8 w - - 0 1',
          highlights: ['a1','b2','b8','c3','c7','d4','d6','f4','f6','g3','g7','h2','h8'],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `So what does this mean together, {name}? The Rook controls STRAIGHT lines — up, down, left, right — fourteen squares. The Bishop controls DIAGONAL lines — four diagonal directions — thirteen squares. Between them, they cover EVERY type of line that exists on a chessboard. Straight AND diagonal — the Rook and Bishop complement each other perfectly. And very soon, you will meet ONE single piece that combines BOTH powers at once. But that is next lesson!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One more thing before we finish...',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 7 — WRAP-UP (4 min)
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
          voice: `Next time, {name}, we meet THESE two — look at them on the board right now! The Queen on d1 and d8, the King on e1 and e8. The Queen moves like the Rook AND Bishop combined — straight lines AND diagonals — making her the most powerful piece on the board! Everything you learned today will make the Queen feel very familiar. See you next session!`,
          task: null,
          taskType: 'complete',
          continueLabel: 'Finish lesson!',
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// LESSON 3 BONUS — triggered when student finishes main content
// with more than 5 minutes remaining on the timer.
// Structure: trivia questions (Rook + Bishop knowledge) → speed round
// → trivia → speed round, looping until ≤5 min remain.
// Speed rounds use targetCount so squares are generated randomly —
// different every time, keeping repeat bonus sessions fresh.
// ─────────────────────────────────────────────────────────────────
export const LESSON_3_BONUS = {
  title: 'Bonus Round — Rook and Bishop Mastery!',
  phases: [
    {
      id: 'bonus1',
      title: 'Rook and Bishop Trivia',
      durationMins: 8,
      steps: [
        {
          id: 'b1',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Incredible, {name} — you finished the lesson so quickly! That means you get the BONUS ROUND! Let us see how much you really know. First question — how many squares does a Rook control from the centre of the board?`,
          recapQuestion: 'How many squares does a Rook control from the centre?',
          recapOptions: ['Fourteen', 'Eight', 'Twenty-seven'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes — FOURTEEN! Straight lines in four directions. The Rook is a long-range powerhouse!`,
          recapWrongVoice: `FOURTEEN squares! The Rook slides up, down, left, and right from the centre — seven squares each way.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'b2',
          taskType: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `This Bishop is on c1 — a dark square. Can it ever move to a light square?`,
          recapQuestion: 'Can a dark-squared Bishop ever reach a light square?',
          recapOptions: ['Never — colour-locked forever', 'Yes, if it moves enough times', 'Only by capturing'],
          recapCorrect: 0,
          recapCorrectVoice: `NEVER! The Bishop's colour-lock is permanent. c1 is dark — that Bishop stays on dark squares for the whole game!`,
          recapWrongVoice: `Never! A Bishop on a dark square visits ONLY dark squares for its entire life. The colour never changes.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'b3',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `The Rook and Bishop together from the same square cover how many squares?`,
          recapQuestion: 'Together from the same square, how many squares do a Rook and Bishop cover?',
          recapOptions: ['Twenty-seven', 'Fourteen', 'Thirteen'],
          recapCorrect: 0,
          recapCorrectVoice: `TWENTY-SEVEN! The Rook's fourteen straight squares plus the Bishop's thirteen diagonal squares — no overlap!`,
          recapWrongVoice: `Twenty-seven! The Rook covers fourteen straight squares and the Bishop covers thirteen diagonal squares — together, twenty-seven!`,
          continueLabel: 'Next question!',
        },
        {
          id: 'b4',
          taskType: 'recap-quiz',
          boardState: '8/8/8/8/7R/8/8/8 w - - 0 1',
          highlights: ['h4'],
          voice: `The Rook is on h4 — the edge of the board. Does it still control fourteen squares?`,
          recapQuestion: 'Does a Rook on the edge of the board still control fourteen squares?',
          recapOptions: ['Yes — always fourteen on an empty board', 'No — fewer on the edge', 'It depends'],
          recapCorrect: 0,
          recapCorrectVoice: `Always fourteen! Corner, edge, or centre — the Rook's reach never changes on an empty board. Remarkable!`,
          recapWrongVoice: `Yes — always fourteen! The Rook loses directions on the edge, but gains more squares per direction. It always totals fourteen.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'b5',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `What letter does the Rook use in chess notation?`,
          recapQuestion: 'What letter does the Rook use in chess notation?',
          recapOptions: ['R', 'K', 'Rk'],
          recapCorrect: 0,
          recapCorrectVoice: `R for Rook! And remember — K is the King, not the Rook.`,
          recapWrongVoice: `R for Rook! K belongs to the King. Always R for Rook.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'b6',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `The Bishop moves only diagonally. How many diagonal directions can it go?`,
          recapQuestion: 'How many diagonal directions can a Bishop move?',
          recapOptions: ['Four', 'Two', 'Eight'],
          recapCorrect: 0,
          recapCorrectVoice: `Four diagonal directions — up-left, up-right, down-left, down-right! From the centre it spreads like an X shape.`,
          recapWrongVoice: `Four diagonal directions! Up-left, up-right, down-left, and down-right — spreading out in an X shape.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'b7',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `True or false — the Rook can move diagonally.`,
          recapQuestion: 'Can the Rook move diagonally?',
          recapOptions: ['No — straight lines only', 'Yes — in all directions', 'Only one diagonal step'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct — the Rook ONLY moves in straight lines. Diagonals belong to the Bishop and Queen!`,
          recapWrongVoice: `No — the Rook only moves in straight lines. Up, down, left, right. No diagonals!`,
          continueLabel: 'Last trivia question!',
        },
        {
          id: 'b8',
          taskType: 'recap-quiz',
          boardState: '2b2b2/8/8/8/8/8/8/2B2B2 w - - 0 1',
          highlights: ['c1','f1','c8','f8'],
          voice: `Look at the four Bishops. The c1 Bishop is on a dark square. What colour is f1?`,
          recapQuestion: 'The Bishop on f1 — what colour square is it on?',
          recapOptions: ['Light', 'Dark', 'It depends on the move'],
          recapCorrect: 0,
          recapCorrectVoice: `Light! f1 is a light square — so the f1 Bishop spends its whole life on light squares. c1 Bishop stays dark, f1 Bishop stays light. Perfect!`,
          recapWrongVoice: `f1 is a LIGHT square! So the f1 Bishop can only ever visit light squares. The c1 Bishop visits only dark squares. Two different worlds!`,
          continueLabel: 'Now — Speed Challenge!',
        },
      ],
    },
    {
      id: 'bonus2',
      title: 'Speed Square Challenge — Round 1',
      durationMins: 6,
      steps: [
        {
          id: 'bs1',
          taskType: 'speed-intro',
          boardState: 'empty',
          voice: `Now the SPEED SQUARE CHALLENGE, {name}! I will call squares and you click them as fast as you can. The clock is running. Ready? GO!`,
          continueLabel: 'Start speed challenge!',
        },
        {
          id: 'bs2',
          taskType: 'speed-round',
          boardState: 'empty',
          voice: `Speed challenge — find every square I call!`,
          timeLimitSecs: 90,
          targetCount: 20,
          successVoice: `Incredible speed! You found {score} squares! You know this board inside out, {name}!`,
          completeVoice: `Time is up! You found {score} squares. Excellent work, {name}!`,
        },
      ],
    },
    {
      id: 'bonus3',
      title: 'More Trivia — Lessons 1, 2 and 3',
      durationMins: 8,
      steps: [
        {
          id: 'b9',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `More questions! This time mixing all three lessons. Which square is in the bottom-left corner of the board?`,
          recapQuestion: 'Which square is in the bottom-left corner?',
          recapOptions: ['a1', 'a8', 'h1'],
          recapCorrect: 0,
          recapCorrectVoice: `a1! The bottom-left corner — always dark, always a1. Perfect recall, {name}!`,
          recapWrongVoice: `a1 is the bottom-left corner — always dark. Files go a to h left to right, ranks go 1 to 8 bottom to top.`,
          continueLabel: 'Next!',
        },
        {
          id: 'b10',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Which piece has NO letter in chess notation?`,
          recapQuestion: 'Which piece has no letter in chess notation?',
          recapOptions: ['The Pawn', 'The Knight', 'The Rook'],
          recapCorrect: 0,
          recapCorrectVoice: `The PAWN! No letter means Pawn. Every other piece has its own letter — K, Q, R, B, N — but the Pawn has none.`,
          recapWrongVoice: `The PAWN has no letter! If you see a move with no capital letter at the front, it is always a Pawn.`,
          continueLabel: 'Next!',
        },
        {
          id: 'b11',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `How many squares are on a chess board in total?`,
          recapQuestion: 'How many squares are on a chess board?',
          recapOptions: ['64', '32', '48'],
          recapCorrect: 0,
          recapCorrectVoice: `64! Eight files times eight ranks equals sixty-four squares. You know your chess board!`,
          recapWrongVoice: `Sixty-four squares — eight files times eight ranks. Always 64!`,
          continueLabel: 'Next!',
        },
        {
          id: 'b12',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `What is the name for the horizontal rows on a chess board?`,
          recapQuestion: 'What are the horizontal rows called?',
          recapOptions: ['Ranks', 'Files', 'Diagonals'],
          recapCorrect: 0,
          recapCorrectVoice: `RANKS! Numbered 1 to 8. Files are the vertical columns — a to h. Ranks are horizontal, files are vertical!`,
          recapWrongVoice: `RANKS! The horizontal rows are ranks, numbered 1 to 8. The vertical columns are files, named a to h.`,
          continueLabel: 'Next!',
        },
        {
          id: 'b13',
          taskType: 'recap-quiz',
          boardState: 'r6r/8/8/8/8/8/8/R6R w - - 0 1',
          highlights: ['a1','h1','a8','h8'],
          voice: `Look at the board. Where do the White Rooks start in a real chess game?`,
          recapQuestion: 'Where do the White Rooks start?',
          recapOptions: ['a1 and h1', 'a8 and h8', 'd1 and e1'],
          recapCorrect: 0,
          recapCorrectVoice: `a1 and h1! The White Rooks start in the two bottom corners. Black Rooks start in a8 and h8 — the top corners!`,
          recapWrongVoice: `White Rooks start on a1 and h1 — the two bottom corners of the board.`,
          continueLabel: 'Next!',
        },
        {
          id: 'b14',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `What does the move "Re4" mean in chess notation?`,
          recapQuestion: 'What does "Re4" mean?',
          recapOptions: ['The Rook moved to e4', 'The King moved to e4', 'A Pawn moved to e4'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! R means Rook, e4 is the destination square. The Rook moved to e4. You can read chess notation!`,
          recapWrongVoice: `R is for Rook — so Re4 means the Rook moved to square e4. Not the King (K) or a Pawn (no letter).`,
          continueLabel: 'Last question!',
        },
        {
          id: 'b15',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Which piece combines the Rook and Bishop movement — straight lines AND diagonals?`,
          recapQuestion: 'Which piece moves like both a Rook and a Bishop?',
          recapOptions: ['The Queen', 'The King', 'The Knight'],
          recapCorrect: 0,
          recapCorrectVoice: `The QUEEN! She combines all the power of the Rook and Bishop — straight lines AND diagonals. She is the most powerful piece on the board. You will learn all about her in Lesson 4!`,
          recapWrongVoice: `The QUEEN! She moves like the Rook AND Bishop combined — straight lines and diagonals. You will meet her properly in Lesson 4!`,
          continueLabel: 'One more speed round!',
        },
      ],
    },
    {
      id: 'bonus4',
      title: 'Speed Square Challenge — Round 2',
      durationMins: 6,
      steps: [
        {
          id: 'bs3',
          taskType: 'speed-intro',
          boardState: 'empty',
          voice: `ROUND 2 of the Speed Challenge! New squares, same clock. Can you beat your last score? Ready? GO!`,
          continueLabel: 'Start round 2!',
        },
        {
          id: 'bs4',
          taskType: 'speed-round',
          boardState: 'empty',
          voice: `Round 2 — find every square I call!`,
          timeLimitSecs: 90,
          targetCount: 20,
          successVoice: `AMAZING! You are getting faster every round, {name}! The chess board is becoming your home!`,
          completeVoice: `Round 2 complete! {score} squares found. You are unstoppable, {name}!`,
        },
      ],
    },
    {
      id: 'bonus5',
      title: 'Bonus Complete',
      durationMins: 1,
      steps: [
        {
          id: 'bend',
          taskType: 'complete',
          boardState: 'empty',
          voice: `{name}, you have been absolutely OUTSTANDING today! You finished the full lesson, answered every quiz question, AND smashed two speed rounds. You know the Rook, the Bishop, their letters, their movements, and their starting squares. Lesson 3 is completely yours. See you in Lesson 4!`,
          continueLabel: 'Finish Lesson 3!',
        },
      ],
    },
  ],
};
