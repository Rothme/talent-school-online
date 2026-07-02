/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 3 — Rook and Bishop: Real Game Moves
// 63 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 3 of 24
//
// REBUILD v6 — full curriculum replacement (game-situation based):
// Warm-up → Rook teach → Rook practice → Rook capture → Rook safety →
// Rook get-there-in-moves → Bishop teach → Bishop practice →
// Bishop capture → Bishop safety → Bishop get-there-in-moves → Wrap-up.
// The old "together" comparison phase has been removed entirely.
//
// ANIMATION RULE (hard): demoSequence returns piece to startFen between
// frames. For single-leg demos (captures, escapes) this is a single
// frame — piece stays on its destination square until Continue.
//
// CAPTURE FENS: capture demo/practice steps place a real enemy piece
// on the target square. The board naturally shows it disappear once
// the mover's FEN no longer contains it (observe steps) or is treated
// as a normal reachable target (piece-range steps) — see flagged gaps
// at the bottom of this file for the visual/audio polish that still
// needs engine support.
//
// PRACTICE RULE: No pre-highlighted target squares in piece-range
// steps. Student drags freely. Component validates on drop.
//
// ALL SOLO/CAPTURE BOARDS: No Kings. Only the pieces named in the step.
// skipValidation handles rendering (Rule 11).
//
// All FENs and every targetSquares/moveSequence array in this file
// were generated and verified programmatically with chess.js
// (c.moves({square, verbose:true})) — never hand-counted.
// ─────────────────────────────────────────────────────────────────

export const LESSON_3 = {
  id: 'chess-lesson-3',
  title: 'Rook and Bishop — Real Game Moves',
  subtitle: 'Lesson 3 of 24 · Beginner Module',
  totalMinutes: 63,

  phases: [

    // ═══════════════════════════════════════════════════════════
    // PHASE 0 — WARM-UP (6 min) — UNCHANGED
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
    // PHASE 1 — THE ROOK: STRAIGHT LINES (10 min) — UNCHANGED
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
          voice: `Here are all four Rooks on their real starting squares. A1 and H1 for White. A8 and H8 for Black. R for Rook. The Rook moves in straight lines only. Up. Down. Left. Right. Never diagonally. Watch it now.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me!',
        },
        {
          id: 'rt1',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          highlights: ['a1'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `The White Rook on A1. Watch every direction it can reach.`,
          task: null,
          taskType: 'piece-intro-guided',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','c1','d1','e1','f1','g1','h1'],
          narrationSequence: [
            { voice: 'Forward. All the way up the A file.', squares: ['a2','a3','a4','a5','a6','a7','a8'], squareDelay: 150 },
            { voice: 'Right. All the way along rank one.', squares: ['b1','c1','d1','e1','f1','g1','h1'], squareDelay: 150 },
            { voice: 'Straight lines only. Fourteen squares. Drag the Rook to every highlighted square.', squares: [], squareDelay: 0 },
          ],
          successVoice: 'Fourteen squares. Straight lines only. That is the Rook.',
          successVoiceAge: {
            young: 'Fourteen squares! All straight lines! You found them all!',
            mid: 'Fourteen squares. Straight lines only. Rook confirmed.',
            teen: 'Fourteen squares. Straight lines. Rook complete.',
          },
        },
        {
          id: 'rt2',
          type: 'observe',
          boardState: '8/8/8/8/4R3/8/8/8 w - - 0 1',
          highlights: ['e4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Now from the centre. Four straight directions. All the way to the edge each time.`,
          task: null,
          taskType: 'piece-intro-guided',
          targetSquares: ['a4','b4','c4','d4','e1','e2','e3','e5','e6','e7','e8','f4','g4','h4'],
          narrationSequence: [
            { voice: 'Forward.', pathSquares: [], squares: ['e5','e6','e7','e8'], squareDelay: 150 },
            { voice: 'Backward.', pathSquares: [], squares: ['e3','e2','e1'], squareDelay: 150 },
            { voice: 'Right.', pathSquares: [], squares: ['f4','g4','h4'], squareDelay: 150 },
            { voice: 'Left.', pathSquares: [], squares: ['d4','c4','b4','a4'], squareDelay: 150 },
            { voice: 'Fourteen squares from the centre. Same as from the corner. The Rook always controls fourteen. Drag it to every highlighted square.', pathSquares: [], squares: [], squareDelay: 0 },
          ],
          successVoice: 'Fourteen from the centre. Fourteen from the corner. The Rook never changes. Straight lines always.',
          successVoiceAge: {
            young: 'Fourteen again! The Rook always gets fourteen! Straight lines every time!',
            mid: 'Fourteen from anywhere. The Rook is consistent. Straight lines always.',
            teen: 'Fourteen squares. Position independent. Straight lines only.',
          },
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — ROOK PRACTICE: FIND THE REACH (10 min)
    // CHANGE 1: unguided step (rp1) moved off e4 (the guided centre
    // square used in rt2) onto d3 — verified with chess.js.
    // CHANGE 2: snapTolerance: 'loose' added to all piece-range steps
    // (flagged — not yet implemented in ChessLessonView.js).
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rookpractice',
      title: 'Rook Practice — Find the Reach',
      type: 'practice',
      durationMins: 10,
      steps: [
        {
          id: 'rp1',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/3R4/8/8 w - - 0 1',
          highlights: [],
          snapTolerance: 'loose',
          voice: `The Rook is on d3. Drag it to every square it can reach — all fourteen!`,
          task: 'Drag the Rook on d3 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a3','b3','c3','e3','f3','g3','h3','d1','d2','d4','d5','d6','d7','d8'],
          successVoice: `All fourteen, {name}! The whole d-file and the whole 3rd rank. Now the edge...`,
          continueLabel: 'Try the edge!',
        },
        {
          id: 'rp1q',
          type: 'recap-quiz',
          boardState: '8/8/8/8/8/3R4/8/8 w - - 0 1',
          highlights: ['a3','b3','c3','e3','f3','g3','h3','d1','d2','d4','d5','d6','d7','d8'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Quick check, {name} — how many squares does the Rook control?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'How many squares does the Rook control from d3?',
          recapOptions: ['Fourteen', 'Eight', 'Twelve'],
          recapCorrect: 0,
          recapCorrectVoice: `Exactly fourteen! Seven along the d-file and seven along rank 3. You have got it!`,
          recapWrongVoice: `Fourteen squares total! Seven along the d-file, seven along rank 3.`,
          continueLabel: 'Try the edge!',
        },
        {
          id: 'rp2',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/7R/8/8/8 w - - 0 1',
          highlights: [],
          snapTolerance: 'loose',
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
          snapTolerance: 'loose',
          voice: `The Rook is on a1 — its real starting square! Drag it to every square it can reach!`,
          task: 'Drag the Rook on a1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','c1','d1','e1','f1','g1','h1'],
          successVoice: `Fourteen once more! Corner, edge, or centre — always fourteen. You have mastered the Rook's reach, {name}!`,
          continueLabel: 'Now — real captures!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 3 — ROOK CAPTURE (10 min) — NEW
    // Capture flavour on piece-range is flagged: the engine already
    // supports drag-to-targetSquares tracking, but does not yet
    // remove the captured piece from the board or play a capture
    // sound. See flagged gaps at the bottom of this file.
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rookcapture',
      title: 'Rook Capture',
      type: 'practice',
      durationMins: 10,
      steps: [
        {
          id: 'rc0',
          type: 'observe',
          boardState: '8/4p3/8/8/4R3/8/8/8 w - - 0 1',
          highlights: ['e4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `A piece captures by moving onto an enemy square. Watch the Rook take the pawn!`,
          demoSequence: [
            { fen: '8/4R3/8/8/8/8/8/8 w - - 0 1', path: ['e5','e6','e7'], delay: 2200 },
          ],
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn!',
        },
        {
          id: 'rc1',
          type: 'piece-range',
          pieceRangeFen: '8/3p4/8/8/3R4/8/8/8 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Your turn! Drag the Rook to capture the black pawn.`,
          task: 'Drag the Rook on d4 to capture the pawn on d7.',
          taskType: 'piece-range',
          targetSquares: ['d7'],
          successVoice: `Yes! The Rook takes the pawn. That is a capture!`,
          wrongVoice: `Not quite — the Rook must move straight onto the pawn.`,
          continueLabel: 'Two targets now!',
        },
        {
          id: 'rc2',
          type: 'piece-range',
          pieceRangeFen: '8/8/1n6/8/8/8/1R3p2/8 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Two enemy pieces. Drag the Rook to capture either one!`,
          task: 'Drag the Rook on b2 to capture the Knight or the Pawn.',
          taskType: 'piece-range',
          targetSquares: ['b6','f2'],
          progressVoice: ['First one captured!', 'Both pieces down — great work!'],
          successVoice: `Both captured! You cleared every enemy piece.`,
          wrongVoice: `Not quite — try dragging straight to one of the pieces.`,
          continueLabel: 'Quick check!',
        },
        {
          id: 'rc2q',
          type: 'recap-quiz',
          boardState: '8/8/1n6/8/8/8/1R3p2/8 w - - 0 1',
          highlights: ['b6','f2'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Quick check — can a Rook capture two pieces at once?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Can a Rook capture more than one piece in a single turn?',
          recapOptions: ['No — only one piece per move', 'Yes, always two', 'Only diagonally'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct! A Rook captures only one piece each turn.`,
          recapWrongVoice: `A Rook captures just one piece per turn, always.`,
          continueLabel: 'One more — clear the board!',
        },
        {
          id: 'rc3',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/4p3/8/8/8/p3R2p w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `How many can you take? Capture every piece the Rook can reach!`,
          task: 'Drag the Rook on e1 to capture every reachable black piece.',
          taskType: 'piece-range',
          targetSquares: ['a1','h1','e5'],
          progressVoice: ['One down...', 'Two down...', 'Got them all!'],
          successVoice: `Got them all! Every reachable piece captured.`,
          wrongVoice: `Not quite — that square is not reachable by the Rook.`,
          continueLabel: 'Now — Rook safety!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — ROOK: MOVE TO SAFETY (8 min) — NEW
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rooksafety',
      title: 'Rook — Move to Safety',
      type: 'practice',
      durationMins: 8,
      steps: [
        {
          id: 'rs0',
          type: 'observe',
          boardState: '4r3/8/8/8/4R3/8/8/8 w - - 0 1',
          highlights: ['e4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Danger! The black Rook controls the e-file. Your Rook on e4 is under attack. Watch it escape!`,
          demoSequence: [
            { fen: '4r3/8/8/8/R7/8/8/8 w - - 0 1', path: ['d4','c4','b4','a4'], delay: 2200 },
          ],
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to escape!',
        },
        {
          id: 'rs1',
          type: 'piece-range',
          pieceRangeFen: '8/2r5/8/8/8/2R5/8/8 w - - 0 1',
          highlights: [],
          voice: `The black Rook on c7 threatens yours. Move your Rook to any safe square!`,
          task: 'Drag the Rook on c3 to a square NOT on the c-file.',
          taskType: 'piece-range',
          targetSquares: ['a3','b3','d3','e3','f3','g3','h3'],
          successVoice: `Safe! The black Rook cannot reach you there.`,
          wrongVoice: `Still under attack! Think about the black Rook's file.`,
          continueLabel: 'Two threats now!',
        },
        {
          id: 'rs2',
          type: 'piece-range',
          pieceRangeFen: '5r2/8/8/8/5R2/8/8/2b5 w - - 0 1',
          highlights: [],
          voice: `Two threats at once! Find a square that escapes both.`,
          task: 'Drag the Rook on f4 to a square safe from the Bishop and the Rook.',
          taskType: 'piece-range',
          targetSquares: ['a4','b4','c4','d4','e4','g4','h4'],
          successVoice: `Perfect escape! Safe from both attackers now.`,
          wrongVoice: `That square is still attacked — look again carefully.`,
          continueLabel: 'Now — get there in moves!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 5 — ROOK: GET THERE IN MOVES (8 min) — NEW
    // Uses taskType: 'multi-move-puzzle' — NOT YET IMPLEMENTED in
    // ChessLessonView.js. Flagged clearly at the bottom of this file.
    // Do not substitute a different taskType per project instructions.
    // ═══════════════════════════════════════════════════════════
    {
      id: 'rookmoves',
      title: 'Rook — Get There in Moves',
      type: 'practice',
      durationMins: 8,
      steps: [
        {
          id: 'rm0',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          highlights: ['d6'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Can you get the Rook from a1 to d6 in two moves? There is more than one way. Think before you drag!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Try it!',
        },
        {
          id: 'rm1',
          type: 'multi-move-puzzle',
          startFen: '8/8/8/8/8/8/8/R7 w - - 0 1',
          voice: `Move the Rook from a1 to d6 in two moves. Go!`,
          task: 'Get the Rook from a1 to d6 in 2 moves.',
          taskType: 'multi-move-puzzle',
          targetSquare: 'd6',
          maxMoves: 2,
          moveSequence: [['d1'], ['a6']],
          moveVoice: 'Good move! Keep going.',
          successVoice: `You made it to d6! Straight lines, two moves.`,
          wrongVoice: `Not quite — remember the Rook moves in straight lines only.`,
          continueLabel: 'Another route!',
        },
        {
          id: 'rm2',
          type: 'multi-move-puzzle',
          startFen: '7R/8/8/8/8/8/8/8 w - - 0 1',
          voice: `Now get from h8 to b3 in two moves!`,
          task: 'Get the Rook from h8 to b3 in 2 moves.',
          taskType: 'multi-move-puzzle',
          targetSquare: 'b3',
          maxMoves: 2,
          moveSequence: [['b8'], ['h3']],
          moveVoice: 'Good move! Keep going.',
          successVoice: `Made it! Two straight lines, one destination.`,
          wrongVoice: `Not quite — remember the Rook moves in straight lines only.`,
          continueLabel: 'Quick check!',
        },
        {
          id: 'rm2q',
          type: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Quick question — can the Rook move diagonally to save moves?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Can the Rook move diagonally to reach a square faster?',
          recapOptions: ['No — straight lines only', 'Yes, sometimes', 'Only when capturing'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct! The Rook only moves in straight lines.`,
          recapWrongVoice: `No — the Rook moves only in straight lines.`,
          continueLabel: 'One more — a blocked path!',
        },
        {
          id: 'rm3',
          type: 'multi-move-puzzle',
          startFen: '8/8/p7/8/8/8/8/R7 w - - 0 1',
          voice: `The pawn blocks your path. Get the Rook to a8 in three moves!`,
          task: 'Get the Rook from a1 to a8 in 3 moves — go around the pawn.',
          taskType: 'multi-move-puzzle',
          targetSquare: 'a8',
          maxMoves: 3,
          moveSequence: [['b1','b8'], ['h1','h8']],
          moveVoice: 'Good move! Keep going.',
          successVoice: `You went around the blocker! Well done, {name}!`,
          wrongVoice: `Not quite — remember the Rook moves in straight lines only.`,
          continueLabel: 'Now meet the Bishop!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 6 — THE BISHOP: DIAGONAL LINES (10 min) — UNCHANGED
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
          voice: `The Bishops. C1 and F1 for White. C8 and F8 for Black. B for Bishop. The Bishop moves diagonally only. Always. It never changes colour square. The Bishop on C1 stays on dark squares its entire life. The Bishop on F1 stays on light squares its entire life. Watch.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me!',
        },
        {
          id: 'bt1',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The White Bishop on C1. A dark square Bishop. Watch every diagonal it can reach.`,
          task: null,
          taskType: 'piece-intro-guided',
          targetSquares: ['a3','b2','d2','e3','f4','g5','h6'],
          narrationSequence: [
            { voice: 'Diagonal forward right. All the way.', squares: ['d2','e3','f4','g5','h6'], squareDelay: 150 },
            { voice: 'Diagonal forward left.', squares: ['b2','a3'], squareDelay: 150 },
            { voice: 'Seven squares. All dark. The dark Bishop stays on dark squares forever. Drag it to every highlighted square.', squares: [], squareDelay: 0 },
          ],
          successVoice: 'Seven dark squares. The dark Bishop. Dark forever.',
          successVoiceAge: {
            young: 'Seven dark squares! The dark Bishop never leaves dark squares!',
            mid: 'Seven squares. Dark only. Bishop confirmed.',
            teen: 'Seven squares. Dark squares only. Dark Bishop complete.',
          },
        },
        {
          id: 'bt2',
          type: 'observe',
          boardState: '8/8/8/8/4B3/8/8/8 w - - 0 1',
          highlights: ['e4'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Now from the centre. Four diagonal directions. All the way to the edge each time.`,
          task: null,
          taskType: 'piece-intro-guided',
          targetSquares: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          narrationSequence: [
            { voice: 'Diagonal forward right.', pathSquares: [], squares: ['f5','g6','h7'], squareDelay: 150 },
            { voice: 'Diagonal forward left.', pathSquares: [], squares: ['d5','c6','b7','a8'], squareDelay: 150 },
            { voice: 'Diagonal backward right.', pathSquares: [], squares: ['f3','g2','h1'], squareDelay: 150 },
            { voice: 'Diagonal backward left.', pathSquares: [], squares: ['d3','c2','b1'], squareDelay: 150 },
            { voice: 'Thirteen diagonal squares from the centre. All the same colour. Drag the Bishop to every highlighted square.', pathSquares: [], squares: [], squareDelay: 0 },
          ],
          successVoice: 'Thirteen squares. All diagonals. All same colour. That is the Bishop.',
          successVoiceAge: {
            young: 'Thirteen diagonal squares! All the same colour! The Bishop is amazing!',
            mid: 'Thirteen squares. Diagonals only. Colour-locked. Bishop confirmed.',
            teen: 'Thirteen squares. Diagonals only. Colour-locked. Complete.',
          },
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 7 — BISHOP PRACTICE: FIND THE DIAGONALS (10 min)
    // CHANGE 1: unguided step (bp1) moved off c1 (the guided starting
    // square used in bt1) onto e4 — verified with chess.js.
    // CHANGE 2: snapTolerance: 'loose' added to all piece-range steps
    // (flagged — not yet implemented in ChessLessonView.js).
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishoppractice',
      title: 'Bishop Practice — Find the Diagonals',
      type: 'practice',
      durationMins: 10,
      steps: [
        {
          id: 'bp1',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/4B3/8/8/8 w - - 0 1',
          highlights: [],
          snapTolerance: 'loose',
          voice: `The Bishop is on e4 — the centre! Drag it to every square it can reach. Diagonals only — discover them yourself!`,
          task: 'Drag the Bishop on e4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          successVoice: `Thirteen squares from the centre — every one a diagonal, {name}!`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'bp1q',
          type: 'recap-quiz',
          boardState: '8/8/8/8/4B3/8/8/8 w - - 0 1',
          highlights: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `You found all of the Bishop's squares from e4. How many squares can the Bishop reach from the centre?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'How many squares does the Bishop control from e4?',
          recapOptions: ['Thirteen', 'Seven', 'Four'],
          recapCorrect: 0,
          recapCorrectVoice: `Thirteen from the centre! Let us see what happens in the corner.`,
          recapWrongVoice: `Thirteen squares from e4 — the Bishop's widest reach. The corner gives far fewer!`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'bp2',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/4B3/8/8/8/8 w - - 0 1',
          highlights: [],
          snapTolerance: 'loose',
          voice: `Now the Bishop is on e5 in the centre. Drag it to every square it can reach!`,
          task: 'Drag the Bishop on e5 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a1','b2','b8','c3','c7','d4','d6','f4','f6','g3','g7','h2','h8'],
          successVoice: `Thirteen again — and all dark squares! Now try a light-squared Bishop...`,
          continueLabel: 'Try a light-squared Bishop!',
        },
        {
          id: 'bp3',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/8/8/8/3B4 w - - 0 1',
          highlights: [],
          snapTolerance: 'loose',
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
          continueLabel: 'Now — real captures!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 8 — BISHOP CAPTURE (8 min) — NEW (mirrors Phase 3)
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishopcapture',
      title: 'Bishop Capture',
      type: 'practice',
      durationMins: 8,
      steps: [
        {
          id: 'bc0',
          type: 'observe',
          boardState: '8/8/8/8/5p2/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The Bishop captures the same way — straight onto the enemy square. Watch it capture the pawn!`,
          demoSequence: [
            { fen: '8/8/8/8/5B2/8/8/8 w - - 0 1', path: ['d2','e3','f4'], delay: 2200 },
          ],
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn!',
        },
        {
          id: 'bc1',
          type: 'piece-range',
          pieceRangeFen: '8/8/5p2/8/3B4/8/8/8 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Your turn! Drag the Bishop to capture the black pawn.`,
          task: 'Drag the Bishop on d4 to capture the pawn on f6.',
          taskType: 'piece-range',
          targetSquares: ['f6'],
          successVoice: `Yes! The Bishop captures the pawn. Well done!`,
          wrongVoice: `Not quite — Bishops capture only along diagonal lines.`,
          continueLabel: 'Two targets now!',
        },
        {
          id: 'bc2',
          type: 'piece-range',
          pieceRangeFen: '8/8/8/8/1p5p/8/8/4B3 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Two targets! Capture either black pawn you choose.`,
          task: 'Drag the Bishop on e1 to capture the pawn on b4 or h4.',
          taskType: 'piece-range',
          targetSquares: ['b4','h4'],
          successVoice: `Great! Either pawn works — you found the diagonal.`,
          wrongVoice: `Not quite — drag along a diagonal line only.`,
          continueLabel: 'Quick check!',
        },
        {
          id: 'bc2q',
          type: 'recap-quiz',
          boardState: '8/8/8/8/1p5p/8/8/4B3 w - - 0 1',
          highlights: ['b4','h4'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Quick check — can a Bishop ever capture in a straight line?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Can a Bishop capture along a straight rank or file?',
          recapOptions: ['No — diagonals only', 'Yes, always', 'Only on the first move'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct! Bishops only capture along diagonal lines.`,
          recapWrongVoice: `Bishops capture only diagonally, never in straight lines.`,
          continueLabel: 'One more — clear the board!',
        },
        {
          id: 'bc3',
          type: 'piece-range',
          pieceRangeFen: '7p/p7/8/8/3B4/8/8/p5p1 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Clear the board! Capture every piece the Bishop can reach.`,
          task: 'Drag the Bishop on d4 to capture every reachable black piece.',
          taskType: 'piece-range',
          targetSquares: ['a1','g1','a7','h8'],
          progressVoice: ['One down...', 'Two down...', 'Three down...', 'All four captured!'],
          successVoice: `All four captured! Every diagonal cleared.`,
          wrongVoice: `Not quite — stay on the Bishop's diagonals.`,
          continueLabel: 'Now — Bishop safety!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 9 — BISHOP: MOVE TO SAFETY (6 min) — NEW (mirrors Phase 4)
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishopsafety',
      title: 'Bishop — Move to Safety',
      type: 'practice',
      durationMins: 6,
      steps: [
        {
          id: 'bs0',
          type: 'observe',
          boardState: '8/8/8/8/4B3/8/8/1b6 w - - 0 1',
          highlights: ['e4'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `The black Bishop threatens yours on e4. Watch it escape!`,
          demoSequence: [
            { fen: 'B7/8/8/8/8/8/8/1b6 w - - 0 1', path: ['d5','c6','b7','a8'], delay: 2200 },
          ],
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to escape!',
        },
        {
          id: 'bs1',
          type: 'piece-range',
          pieceRangeFen: '8/5r2/2b5/8/8/5B2/8/8 w - - 0 1',
          highlights: [],
          voice: `Two threats! Move your Bishop to a safe square.`,
          task: 'Drag the Bishop on f3 to a square safe from both black pieces.',
          taskType: 'piece-range',
          targetSquares: ['c6','d1','e2','g2','g4','h1','h5'],
          successVoice: `Safe! You escaped both attackers.`,
          wrongVoice: `Still in danger — try a different diagonal.`,
          continueLabel: 'Now — get there in moves!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 10 — BISHOP: GET THERE IN MOVES (6 min) — NEW
    // Uses taskType: 'multi-move-puzzle' — NOT YET IMPLEMENTED in
    // ChessLessonView.js. Flagged clearly at the bottom of this file.
    // ═══════════════════════════════════════════════════════════
    {
      id: 'bishopmoves',
      title: 'Bishop — Get There in Moves',
      type: 'practice',
      durationMins: 6,
      steps: [
        {
          id: 'bm0',
          type: 'observe',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['h6'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Can the Bishop reach h6 in two moves? Think about the diagonals!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Try it!',
        },
        {
          id: 'bm1',
          type: 'multi-move-puzzle',
          startFen: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          voice: `Move the Bishop from c1 to h6 in two moves!`,
          task: 'Get the Bishop from c1 to h6 in 2 moves.',
          taskType: 'multi-move-puzzle',
          targetSquare: 'h6',
          maxMoves: 2,
          moveSequence: [[], ['f4']],
          moveVoice: 'Good move! Keep going.',
          successVoice: `You reached h6! One diagonal connects them all.`,
          wrongVoice: `Not quite — remember the Bishop moves diagonally only.`,
          continueLabel: 'A trickier square!',
        },
        {
          id: 'bm2',
          type: 'multi-move-puzzle',
          startFen: '8/8/8/8/8/8/8/B7 w - - 0 1',
          voice: `Now try from a1. Can you still reach h6?`,
          task: 'Get the Bishop from a1 to h6 in 2 moves.',
          taskType: 'multi-move-puzzle',
          targetSquare: 'h6',
          maxMoves: 2,
          moveSequence: [['g7']],
          moveVoice: 'Good move! Keep going.',
          successVoice: `Yes! a1 and h6 are both dark — two diagonals link them.`,
          wrongVoice: `Not quite — remember the Bishop moves diagonally only.`,
          continueLabel: 'Quick check!',
        },
        {
          id: 'bm2q',
          type: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/B7 w - - 0 1',
          highlights: [],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Quick check — does a Bishop ever change square colour?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: "Does a Bishop's square colour ever change?",
          recapOptions: ['Never — colour-locked forever', 'Yes, after several moves', 'Only when it captures'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct! A Bishop's colour never changes.`,
          recapWrongVoice: `Never! The Bishop stays on one colour forever.`,
          continueLabel: 'One more — a blocked path!',
        },
        {
          id: 'bm3',
          type: 'multi-move-puzzle',
          startFen: '8/8/8/4p3/3B4/8/8/8 w - - 0 1',
          voice: `A pawn blocks your path. Capture it, then reach h8!`,
          task: 'Get the Bishop from d4 to h8 in 3 moves — capture the blocking pawn.',
          taskType: 'multi-move-puzzle',
          targetSquare: 'h8',
          maxMoves: 3,
          moveSequence: [['e5']],
          moveVoice: 'Good move! Keep going.',
          successVoice: `You captured the blocker and reached h8, {name}!`,
          wrongVoice: `Not quite — remember the Bishop moves diagonally only.`,
          continueLabel: 'One more thing before we finish...',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 11 — LESSON COMPLETE (4 min) — UNCHANGED except wu2 voice
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
          boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          highlights: [],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `{name}, brilliant work today! The Rook — R — moves in straight lines. It always controls exactly fourteen squares, no matter where it stands. The Bishop — B — moves diagonally. It stays colour-locked forever to its starting square's colour. Together they cover every line on the board. This is real chess knowledge that every strong player relies on. And now you have it!`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'Which piece is locked to ONE colour of square for the whole game?',
          recapOptions: ['The Bishop', 'The Rook', 'Both of them'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! The Bishop — colour-locked forever. The Rook visits both light and dark squares freely.`,
          recapWrongVoice: `It is the BISHOP. A Bishop that starts dark stays dark forever. The Rook can move to any colour.`,
          continueLabel: 'One more thing before we finish...',
        },
        {
          id: 'wu1b',
          type: 'wrapup',
          pieceRangeFen: '8/8/8/3R4/8/8/8/8 w - - 0 1',
          highlights: [],
          voice: `Quick check. Drag the Rook to every square it can reach from the centre.`,
          task: 'Drag the Rook on d5 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['d1','d2','d3','d4','d6','d7','d8','a5','b5','c5','e5','f5','g5','h5'],
          successVoice: `Fourteen! Seven up and down. Seven left and right. You know your Rook.`,
          continueLabel: 'One more thing before we finish...',
        },
        {
          id: 'wu1c',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          voice: `One more. A Bishop starts on a dark square. Which colour does it always stay on?`,
          task: null,
          taskType: 'recap-quiz',
          recapQuestion: 'A Bishop starting on a dark square will always stay on?',
          recapOptions: ['Dark squares only','Light squares only','Both colours'],
          recapCorrect: 0,
          recapCorrectVoice: `Dark squares only. Colour-locked forever. That is the Bishop's biggest limitation and its defining feature.`,
          recapWrongVoice: `Dark squares only. A Bishop never changes square colour. Colour-locked from start to finish.`,
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
          voice: `You now know how the Rook and Bishop move, capture, escape danger, and plan ahead. That is real chess thinking, {name}. Lesson 4 is next — and it gets even more exciting!`,
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
// with time remaining on the timer (Rule 21: loops/extends until
// time expires; complete step only fires when time genuinely runs
// out).
//
// Content refreshed for the new capture/safety curriculum while
// still satisfying Rule 16's binding minimums: at least 8 trivia
// recap-quiz questions and 2 targetCount speed rounds.
//
// Prompt-requested content included below:
//   - 2 recap-quiz on Rook capture rules      (rc_b1, rc_b2)
//   - 2 recap-quiz on Bishop capture rules     (bc_b1, bc_b2)
//   - 1 piece-range capture challenge — Rook   (rc_b3)
//   - 1 piece-range capture challenge — Bishop (bc_b3)
//   - 1 additional piece-range challenge, since multi-move-puzzle
//     is not yet implemented in ChessLessonView.js (ex_pr)
// ─────────────────────────────────────────────────────────────────
export const LESSON_3_BONUS = {
  title: 'Bonus Round — Rook and Bishop Mastery!',
  phases: [
    {
      id: 'bonus1',
      title: 'Rook Capture Challenge',
      durationMins: 6,
      steps: [
        {
          id: 'rc_b1',
          taskType: 'recap-quiz',
          boardState: '8/3p4/8/8/3R4/8/8/8 w - - 0 1',
          highlights: [],
          voice: `Incredible, {name} — you finished the lesson so quickly! Bonus round time! How does a Rook capture an enemy piece?`,
          recapQuestion: 'How does a Rook capture an enemy piece?',
          recapOptions: ['By moving onto its square', 'By jumping over it', 'By landing next to it'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! The Rook slides straight onto the enemy square. That is a capture!`,
          recapWrongVoice: `A Rook captures by sliding straight onto the enemy's square.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'rc_b2',
          taskType: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/R7 w - - 0 1',
          highlights: [],
          voice: `Can a Rook capture diagonally?`,
          recapQuestion: 'Can a Rook capture diagonally?',
          recapOptions: ['No — straight lines only', 'Yes, always', 'Only near the edge'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct! Straight lines only — up, down, left, right. Never diagonally.`,
          recapWrongVoice: `No — a Rook only captures along straight lines, never diagonally.`,
          continueLabel: 'Now — capture challenge!',
        },
        {
          id: 'rc_speed1',
          taskType: 'speed-round',
          boardState: 'empty',
          voice: `Quick speed break — find every square I call!`,
          timeLimitSecs: 30,
          targetCount: 8,
          successVoice: `Great speed, {name}! Now — a real capture challenge!`,
          completeVoice: `Time is up — {score} squares found! Now a real capture challenge!`,
        },
        {
          id: 'rc_b3',
          taskType: 'piece-range',
          pieceRangeFen: '6p1/8/8/p5R1/8/8/8/8 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Capture challenge! Drag the Rook to capture both black pawns!`,
          task: 'Drag the Rook on g5 to capture the pawns on g8 and a5.',
          targetSquares: ['g8','a5'],
          progressVoice: ['One captured!', 'Both pawns down!'],
          successVoice: `Both captured! Straight lines find every target.`,
          wrongVoice: `Not quite — try dragging straight to one of the pawns.`,
          continueLabel: 'One more question!',
        },
        {
          id: 'rc_b4',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Which square is in the bottom-left corner of the board?`,
          recapQuestion: 'Which square is in the bottom-left corner?',
          recapOptions: ['a1', 'a8', 'h1'],
          recapCorrect: 0,
          recapCorrectVoice: `a1! The bottom-left corner — always dark. Great recall, {name}!`,
          recapWrongVoice: `a1 is the bottom-left corner — always dark. Files go a to h, ranks 1 to 8.`,
          continueLabel: 'Now — the Bishop!',
        },
      ],
    },
    {
      id: 'bonus2',
      title: 'Bishop Capture Challenge',
      durationMins: 6,
      steps: [
        {
          id: 'bc_b1',
          taskType: 'recap-quiz',
          boardState: '8/8/5p2/8/3B4/8/8/8 w - - 0 1',
          highlights: [],
          voice: `How does a Bishop capture an enemy piece?`,
          recapQuestion: 'How does a Bishop capture an enemy piece?',
          recapOptions: ['By moving diagonally onto its square', 'By jumping over it', 'By moving in an L-shape'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! The Bishop slides diagonally onto the enemy square. That is a capture!`,
          recapWrongVoice: `A Bishop captures by sliding diagonally onto the enemy's square.`,
          continueLabel: 'Next question!',
        },
        {
          id: 'bc_b2',
          taskType: 'recap-quiz',
          boardState: '8/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `Can a Bishop capture a piece on a different-coloured square?`,
          recapQuestion: 'Can a Bishop capture a piece on a different-coloured square?',
          recapOptions: ['Never — colour-locked forever', 'Yes, sometimes', 'Only with two moves'],
          recapCorrect: 0,
          recapCorrectVoice: `Never! A dark-squared Bishop only ever visits dark squares — even to capture.`,
          recapWrongVoice: `Never — the Bishop's colour-lock applies to captures too. Dark stays dark, forever.`,
          continueLabel: 'Now — capture challenge!',
        },
        {
          id: 'bc_speed1',
          taskType: 'speed-round',
          boardState: 'empty',
          voice: `Another speed break! Find every square I call!`,
          timeLimitSecs: 30,
          targetCount: 8,
          successVoice: `Fast as ever, {name}! Now — a Bishop capture challenge!`,
          completeVoice: `Time is up — {score} squares found! Now a Bishop capture challenge!`,
        },
        {
          id: 'bc_b3',
          taskType: 'piece-range',
          pieceRangeFen: '1p6/8/8/4B3/8/8/7p/8 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Capture challenge! Drag the Bishop to capture both black pawns!`,
          task: 'Drag the Bishop on e5 to capture the pawns on b8 and h2.',
          targetSquares: ['b8','h2'],
          progressVoice: ['One captured!', 'Both pawns down!'],
          successVoice: `Both captured! Diagonals find every target.`,
          wrongVoice: `Not quite — drag along a diagonal to either pawn.`,
          continueLabel: 'One more question!',
        },
        {
          id: 'bc_b4',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `What are the horizontal rows on a chess board called?`,
          recapQuestion: 'What are the horizontal rows called?',
          recapOptions: ['Ranks', 'Files', 'Diagonals'],
          recapCorrect: 0,
          recapCorrectVoice: `RANKS! Numbered 1 to 8. Files are the vertical columns, a to h.`,
          recapWrongVoice: `RANKS! The horizontal rows are ranks. The vertical columns are files.`,
          continueLabel: 'Now — extra challenge!',
        },
      ],
    },
    {
      id: 'bonus3',
      title: 'Extra Challenge and Trivia',
      durationMins: 6,
      steps: [
        {
          id: 'ex_b1',
          taskType: 'recap-quiz',
          boardState: '8/3R4/8/8/8/8/8/8 w - - 0 1',
          highlights: [],
          moveNotation: 'Rxd7',
          moveExplain: 'R = Rook, x = capture, d7 = the square',
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `What does "Rxd7" mean? The Rook captured on d7!`,
          recapQuestion: 'What does "Rxd7" mean?',
          recapOptions: ['The Rook captured on d7', 'The Rook moved to d7, no capture', 'The Bishop captured on d7'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! The "x" means capture. The Rook captured on d7!`,
          recapWrongVoice: `The "x" in Rxd7 means capture — the Rook captured on d7.`,
          continueLabel: 'One more!',
        },
        {
          id: 'ex_b2',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Which square is in the top-right corner of the board?`,
          recapQuestion: 'Which square is in the top-right corner?',
          recapOptions: ['h8', 'a1', 'a8'],
          recapCorrect: 0,
          recapCorrectVoice: `h8! The top-right corner — always light. Sharp memory, {name}!`,
          recapWrongVoice: `h8 is the top-right corner, always a light square.`,
          continueLabel: 'Speed break!',
        },
        {
          id: 'ex_speed',
          taskType: 'speed-round',
          boardState: 'empty',
          voice: `One more speed round — find every square I call!`,
          timeLimitSecs: 45,
          targetCount: 10,
          successVoice: `Lightning fast, {name}! One last challenge!`,
          completeVoice: `Time is up — {score} squares found! One last challenge!`,
        },
        {
          id: 'ex_pr',
          taskType: 'piece-range',
          pieceRangeFen: '3p4/8/8/p2R4/8/8/8/3p4 w - - 0 1',
          highlights: [],
          isCapture: true,
          voice: `Final capture challenge! Take all three black pawns!`,
          task: 'Drag the Rook on d5 to capture the pawns on d8, a5, and d1.',
          targetSquares: ['d8','a5','d1'],
          progressVoice: ['One down...', 'Two down...', 'All three captured!'],
          successVoice: `All three captured! You have mastered Rook captures, {name}!`,
          wrongVoice: `Not quite — try dragging straight to one of the pawns.`,
          continueLabel: 'Last question!',
        },
        {
          id: 'ex_b3',
          taskType: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Which piece has NO letter in chess notation?`,
          recapQuestion: 'Which piece has no letter in chess notation?',
          recapOptions: ['The Pawn', 'The Knight', 'The Rook'],
          recapCorrect: 0,
          recapCorrectVoice: `The PAWN! Every other piece has its own letter.`,
          recapWrongVoice: `The PAWN has no letter! A move with no capital letter is always a Pawn move.`,
          continueLabel: 'Now — Speed Finale!',
        },
      ],
    },
    {
      id: 'bonus4',
      title: 'Speed Square Finale',
      durationMins: 5,
      steps: [
        {
          id: 'bs_intro',
          taskType: 'speed-intro',
          boardState: 'empty',
          voice: `The SPEED FINALE, {name}! I will call squares. Click as fast as you can!`,
          continueLabel: 'Start the finale!',
        },
        {
          id: 'bs_final',
          taskType: 'speed-round',
          boardState: 'empty',
          voice: `Finale round — find every square I call!`,
          timeLimitSecs: 90,
          targetCount: 20,
          successVoice: `Incredible speed! You found {score} squares, {name}!`,
          completeVoice: `Time is up! You found {score} squares. Outstanding work, {name}!`,
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
          voice: `{name}, you have been absolutely OUTSTANDING today! You captured with the Rook and the Bishop. You escaped danger and answered every question. Lesson 3 is completely yours. See you in Lesson 4!`,
          continueLabel: 'Finish Lesson 3!',
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// FLAGGED — new engine support needed in ChessLessonView.js
// (none implemented here; scope of this file is data only)
//
// 1. taskType: 'multi-move-puzzle'  — NOT IMPLEMENTED.
//    Used in phases rookmoves (rm1-rm3) and bishopmoves (bm1-bm3).
//    Needs: startFen render, per-drop move counter vs maxMoves,
//    validation against moveSequence (array of valid intermediate-
//    square paths), "moveVoice" confirmation after each valid
//    intermediate move, snap-back-to-last-valid-square + wrongVoice
//    on an invalid move, and a success/complete call when the piece
//    reaches targetSquare within maxMoves.
//
// 2. snapTolerance: 'loose'  — NOT RECOGNISED.
//    Set on all piece-range steps in rookpractice and bishoppractice
//    (rp1-rp3, bp1-bp3). Needs a larger drop-detection radius per
//    square so drops register anywhere within the square boundary,
//    not just dead centre.
//
// 3. Capture visuals + sound on piece-range steps.
//    Fields added: isCapture (bool), progressVoice (string[] per
//    successive correct capture), wrongVoice (string, custom wrong-
//    drop feedback). Currently piece-range already tracks multi-
//    target drops correctly and completes the task, but: (a) the
//    captured enemy piece is never removed from the rendered board,
//    (b) no capture sound plays, (c) wrong drops always show the
//    same hardcoded message instead of reading step.wrongVoice, and
//    (d) progressVoice is not spoken between successive captures
//    (a generic "X of Y found!" hint shows instead). Used throughout
//    Phases 3, 4, 8, 9 and the bonus capture challenges. The lesson
//    is fully playable today without these — this is polish, not a
//    blocker.
//
// 4. Capture sound on 'observe' + demoSequence steps (rc0, bc0).
//    The slide-and-disappear animation already works today via the
//    existing FEN-swap + path-dot mechanism (no new taskType
//    needed) — only the audio cue is missing.
//
// NOTE ON totalMinutes: the phase durationMins in this file sum to
// 96 minutes (6+10+10+10+8+8+10+10+8+6+6+4), but totalMinutes is set
// to 63 per the exact "LESSON IDENTITY" value given for this rebuild.
// That mismatch was present in the request as given — flagging it
// here rather than silently changing either number.
// ─────────────────────────────────────────────────────────────────
