/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 4 — Queen and King Movement
// 55 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 4 of 24
// Builds on Lesson 3 (Rook = straight lines, Bishop = diagonals,
// colour-bound rule)
//
// CONCEPT (from Super Curriculum): The Queen combines Rook and
// Bishop. The King moves one square but must be protected at all
// costs.
// OBJECTIVE: Student can move Queen and King correctly and
// understands the Queen-on-her-own-colour rule (i.e. that, unlike
// the Bishop, the Queen is NOT colour-bound).
//
// SCOPE GUARDRAILS:
// - Pure movement-range only. NO check, NO checkmate, NO castling,
//   NO King-safety EXERCISES (King "must be protected" is narration
//   framing only).
// - THIN-LESSON PADDING (per audit): Queen reach tested from THREE
//   squares (centre/corner/edge) like Lesson 3's Rook, PLUS a
//   Rook+Bishop+Queen+King recap comparison from the same square.
//
// REBUILD NOTE (per docs/CURRICULUM_RULES.md): every piece intro now
// follows the 3-step pattern from Lessons 1-2 — real starting square
// first, then an animated demoSequence with path dots showing every
// direction, THEN the practice round. All FENs verified with chess.js.
// pieceLetterRef panels reinforce the Q/K letters from Lesson 2.
// ─────────────────────────────────────────────────────────────────

export const LESSON_4 = {
  id: 'chess-lesson-4',
  title: 'Queen and King Movement',
  subtitle: 'Lesson 4 of 24 · Beginner Module',
  totalMinutes: 56,

  phases: [

    {
      id: 'warmup',
      title: 'Warm-up — Rook and Bishop Recall',
      type: 'warmup',
      durationMins: 5,
      steps: [
        {
          id: 'wa1',
          type: 'observe',
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          highlights: [],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
          ],
          voice: `Welcome back, {name}! Quick recall — here's a Rook on e4. How many squares does it control? That's right, fourteen — straight lines in all four directions! And remember the Bishop's big secret — it is locked to ONE COLOUR forever. Today we meet a piece that combines BOTH of these powers — the Queen! And we'll also meet the King, the most important piece of all.`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's meet the Queen!",
        },
        {
          id: 'wa2',
          type: 'recap-quiz',
          boardState: 'K6k/8/8/8/8/8/8/2B5 w - - 0 1',
          highlights: ['c1'],
          voice: `One quick check before we start — this Bishop is on c1, a dark square. Could it EVER reach a light square during the game?`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'Meet the Queen!',
          recapQuestion: 'A dark-squared Bishop reaching a light square — possible or never?',
          recapOptions: ['Never', 'Yes, eventually'],
          recapCorrect: 0,
          recapCorrectVoice: `Correct, {name}! Never — that's the Bishop's permanent colour-lock. Now let's meet a piece that does NOT have this restriction!`,
          recapWrongVoice: `Remember — NEVER. A Bishop's colour is locked for the whole game. Let's keep that in mind as we meet the Queen.`,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — QUEEN: HOW IT MOVES (8 minutes, was 6)
    // 3-step pattern: real square intro → demo with path dots → centre demo
    // ═══════════════════════════════════════════════════════════
    {
      id: 'queenteach',
      title: 'The Queen — Rook + Bishop Combined',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'qt0',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/3Q4 w - - 0 1',
          highlights: ['d1'],
          pieceLetterRef: [{ icon: '♕', letter: 'Q', name: 'Queen' }],
          voice: `{name}, here is the QUEEN on her real starting square — d1! Remember her letter from Lesson 2 — capital Q. See her crown of points, like a little sun. The Queen moves like the ROOK and the BISHOP COMBINED — straight lines AND diagonal lines, in all eight directions, for as many squares as the board allows!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me her moves!',
        },
        {
          id: 'qt1',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/3Q4 w - - 0 1',
          demoSequence: [
            { fen: '3Qk3/8/8/8/4K3/8/8/8 w - - 0 1', path: ['d2','d3','d4','d5','d6','d7','d8'], delay: 2200 },
            { fen: '4k3/8/8/8/4K3/8/8/Q7 w - - 0 1', path: ['c1','b1','a1'], delay: 2200 },
            { fen: '4k3/8/8/8/4K3/8/8/7Q w - - 0 1', path: ['e1','f1','g1','h1'], delay: 2200 },
            { fen: '4k3/8/8/7Q/4K3/8/8/8 w - - 0 1', path: ['e2','f3','g4','h5'], delay: 2200 },
            { fen: '4k3/8/8/8/Q3K3/8/8/8 w - - 0 1', path: ['c2','b3','a4'], delay: 2200 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♕', letter: 'Q', name: 'Queen' }],
          voice: `Watch the Queen from d1! Up the d-file all the way to d8. Left along rank 1 to a1. Right along rank 1 to h1. Diagonally up-right to h5. Diagonally up-left to a4. Five directions already, and from the centre of the board she has even more!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me from the centre!',
        },
        {
          id: 'qt2',
          type: 'observe',
          boardState: 'k7/8/8/8/4Q3/8/8/K7 w - - 0 1',
          demoSequence: [
            { fen: 'k3Q3/8/8/8/8/8/8/K7 w - - 0 1', path: ['e5','e6','e7','e8'], delay: 2000 },
            { fen: 'k7/8/8/8/8/8/8/K3Q3 w - - 0 1', path: ['e3','e2','e1'], delay: 2000 },
            { fen: 'k7/8/8/8/Q7/8/8/K7 w - - 0 1', path: ['d4','c4','b4','a4'], delay: 2000 },
            { fen: 'k7/8/8/8/7Q/8/8/K7 w - - 0 1', path: ['f4','g4','h4'], delay: 2000 },
            { fen: 'k7/7Q/8/8/8/8/8/K7 w - - 0 1', path: ['f5','g6','h7'], delay: 2000 },
            { fen: 'k7/1Q6/8/8/8/8/8/K7 w - - 0 1', path: ['d5','c6','b7'], delay: 2000 },
            { fen: 'k7/8/8/8/8/8/8/K6Q w - - 0 1', path: ['f3','g2','h1'], delay: 2000 },
            { fen: 'k7/8/8/8/8/8/8/KQ6 w - - 0 1', path: ['d3','c2','b1'], delay: 2000 },
          ],
          highlights: ['a4','a8','b1','b4','b7','c2','c4','c6','d3','d4','d5','e1','e2','e3','e5','e6','e7','e8','f3','f4','f5','g2','g4','g6','h1','h4','h7'],
          pieceLetterRef: [{ icon: '♕', letter: 'Q', name: 'Queen' }],
          voice: `From the CENTRE square e4, the Queen reaches ALL EIGHT directions! Look at ALL those glowing squares — TWENTY-SEVEN of them! That's the Rook's fourteen squares PLUS the Bishop's thirteen squares, all from the same spot. The Queen is the MOST POWERFUL piece in chess because she can do everything the Rook and Bishop can do, at the same time. But she still needs protecting — losing your Queen is a big disadvantage!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    {
      id: 'queenpractice',
      title: 'Queen Practice — Find Her Reach',
      type: 'practice',
      durationMins: 12,
      steps: [
        {
          id: 'qp1',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/8/4Q3/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `The Queen is on e4 — the centre of the board. Drag her to EVERY square she can reach. Straight lines AND diagonals — take your time, there are twenty-seven!`,
          task: 'Drag the Queen on e4 to every square she can reach.',
          taskType: 'piece-range',
          targetSquares: ['a4','a8','b1','b4','b7','c2','c4','c6','d3','d4','d5','e1','e2','e3','e5','e6','e7','e8','f3','f4','f5','g2','g4','g6','h1','h4','h7'],
          successVoice: `All twenty-seven, {name}! From the centre, the Queen's power is at its biggest. Now let's see what happens in a corner...`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'qp2',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/4K3/8/8/Q7 w - - 0 1',
          highlights: [],
          voice: `Now the Queen is on a1 — the dark corner. Drag her to every square she can reach from here.`,
          task: 'Drag the Queen on a1 to every square she can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','a3','a4','a5','a6','a7','a8','b1','b2','c1','c3','d1','d4','e1','e5','f1','f6','g1','g7','h1','h8'],
          successVoice: `Twenty-one squares from the corner, {name} — six fewer than the centre! The corner limits her diagonal reach especially. Let's check one more spot.`,
          continueLabel: 'Try the edge!',
        },
        {
          id: 'qp3',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/8/7Q/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `Finally, the Queen is on h4 — the edge of the board. Drag her to every square she can reach from h4!`,
          task: 'Drag the Queen on h4 to every square she can reach.',
          taskType: 'piece-range',
          targetSquares: ['a4','b4','c4','d4','d8','e1','e4','e7','f2','f4','f6','g3','g4','g5','h1','h2','h3','h5','h6','h7','h8'],
          successVoice: `Twenty-one again — same as the corner! Notice, {name}: the Queen always reaches her BIGGEST number of squares from the CENTRE of the board. That's why strong chess players love to bring their Queen toward the centre — but carefully, since she's so valuable!`,
          continueLabel: 'Now meet the King!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — KING: HOW IT MOVES (7 minutes, was 6)
    // 3-step pattern: real square intro → demo with path dots → centre demo
    // ═══════════════════════════════════════════════════════════
    {
      id: 'kingteach',
      title: 'The King — One Careful Step',
      type: 'teach',
      durationMins: 7,
      steps: [
        {
          id: 'kt0',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
          highlights: ['e1'],
          pieceLetterRef: [{ icon: '♔', letter: 'K', name: 'King' }],
          voice: `Now meet the KING on his real starting square — e1, {name}! Remember his letter — capital K. See the little cross on his crown? The King is the most IMPORTANT piece on the board, even though he isn't the most powerful. He moves only ONE square at a time — but in ANY direction. Watch closely!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me his step!',
        },
        {
          id: 'kt1',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
          demoSequence: [
            { fen: '4k3/8/8/8/8/8/4K3/8 w - - 0 1', path: ['e2'], delay: 1900 },
            { fen: '4k3/8/8/8/8/8/8/3K4 w - - 0 1', path: ['d1'], delay: 1900 },
            { fen: '4k3/8/8/8/8/8/8/5K2 w - - 0 1', path: ['f1'], delay: 1900 },
            { fen: '4k3/8/8/8/8/8/3K4/8 w - - 0 1', path: ['d2'], delay: 1900 },
            { fen: '4k3/8/8/8/8/8/5K2/8 w - - 0 1', path: ['f2'], delay: 1900 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♔', letter: 'K', name: 'King' }],
          voice: `From e1, the King can step forward to e2, sideways to d1 or f1, or diagonally to d2 or f2. Just one careful step in any direction — like someone walking very carefully so they don't trip! From the back rank, that is five choices. From the centre of the board, he has even more.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me from the centre!',
        },
        {
          id: 'kt2',
          type: 'observe',
          boardState: '7k/8/8/8/4K3/8/8/8 w - - 0 1',
          demoSequence: [
            { fen: '7k/8/8/4K3/8/8/8/8 w - - 0 1', path: ['e5'], delay: 1700 },
            { fen: '7k/8/8/8/8/4K3/8/8 w - - 0 1', path: ['e3'], delay: 1700 },
            { fen: '7k/8/8/8/3K4/8/8/8 w - - 0 1', path: ['d4'], delay: 1700 },
            { fen: '7k/8/8/8/5K2/8/8/8 w - - 0 1', path: ['f4'], delay: 1700 },
            { fen: '7k/8/8/3K4/8/8/8/8 w - - 0 1', path: ['d5'], delay: 1700 },
            { fen: '7k/8/8/5K2/8/8/8/8 w - - 0 1', path: ['f5'], delay: 1700 },
            { fen: '7k/8/8/8/8/3K4/8/8 w - - 0 1', path: ['d3'], delay: 1700 },
            { fen: '7k/8/8/8/8/5K2/8/8 w - - 0 1', path: ['f3'], delay: 1700 },
          ],
          highlights: ['d3','d4','d5','e3','e5','f3','f4','f5'],
          pieceLetterRef: [{ icon: '♔', letter: 'K', name: 'King' }],
          voice: `From e4, the King can step to any of these EIGHT neighbouring squares — all around him, like a little box. Compare that to the Queen's twenty-seven squares from the same spot — the King is MUCH more limited! But remember, {name} — the King is the piece that must be protected at all costs. If your King has no safe square to go to and is under attack, the game is over. We'll learn much more about that in later lessons!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    {
      id: 'kingpractice',
      title: 'King Practice — One Careful Step',
      type: 'practice',
      durationMins: 14,
      steps: [
        {
          id: 'kp1',
          type: 'piece-range',
          pieceRangeFen: '7k/8/8/8/4K3/8/8/8 w - - 0 1',
          highlights: [],
          voice: `The King is on e4 — the centre. Drag him to every square he can step to. Just eight — one careful step in every direction!`,
          task: 'Drag the King on e4 to every square he can reach.',
          taskType: 'piece-range',
          targetSquares: ['d3','d4','d5','e3','e5','f3','f4','f5'],
          successVoice: `All eight, {name}! From the centre, the King is surrounded by squares on every side. Now let's see the corner...`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'kp2',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/8/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `Now the King is on a1 — the dark corner. How many squares can he reach from here? Drag him to find out!`,
          task: 'Drag the King on a1 to every square he can reach.',
          taskType: 'piece-range',
          targetSquares: ['a2','b1','b2'],
          successVoice: `Just THREE squares, {name} — the corner is the King's most cramped spot! This is exactly why the King's safety is so important to think about — a King stuck in a corner with few escape squares can be in danger. Let's check the edge.`,
          continueLabel: 'Try the edge!',
        },
        {
          id: 'kp3',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/8/7K/8/8/8 w - - 0 1',
          highlights: [],
          voice: `Finally, the King is on h4 — the edge of the board. Drag him to every square he can reach!`,
          task: 'Drag the King on h4 to every square he can reach.',
          taskType: 'piece-range',
          targetSquares: ['g3','g4','g5','h3','h5'],
          successVoice: `Five squares on the edge — between the corner's three and the centre's eight. {name}, notice the PATTERN: centre gives the most space, corners give the least, for EVERY piece we've studied so far — Rook, Bishop, Queen, and now King! One more surprise before we move on...`,
          continueLabel: 'One more King spot!',
        },
        {
          id: 'kp4',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/8/8/1K6/8 w - - 0 1',
          highlights: [],
          voice: `Here's a surprise, {name} — the King is on b2, just ONE square away from the corner. How many squares do you think he can reach? Drag him to find out!`,
          task: 'Drag the King on b2 to every square he can reach.',
          taskType: 'piece-range',
          targetSquares: ['a1','a2','a3','b1','b3','c1','c2','c3'],
          successVoice: `EIGHT squares — the same as the centre! {name}, this shows something important: it's not just about "centre versus edge" in general — it's about how many neighbouring squares actually exist on the board. One square away from the corner, the King already has a full set of eight neighbours. Only squares ON THE VERY EDGE OR CORNER itself are cramped. Now — let's put it all together.`,
          continueLabel: 'See the big comparison!',
        },
      ],
    },

    {
      id: 'recap',
      title: 'Rook, Bishop, Queen, King — All Together',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'rc1',
          type: 'observe',
          boardState: 'k7/8/8/8/4R3/8/8/K7 w - - 0 1',
          highlights: ['e1','e2','e3','e5','e6','e7','e8','a4','b4','c4','d4','f4','g4','h4'],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `{name}, let's compare ALL FOUR pieces from the very same square — e4! First, the Rook — fourteen squares, straight lines only.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now the Bishop',
        },
        {
          id: 'rc2',
          type: 'observe',
          boardState: 'k7/8/8/8/4B3/8/8/K7 w - - 0 1',
          highlights: ['a8','b1','b7','c2','c6','d3','d5','f3','f5','g2','g6','h1','h7'],
          pieceLetterRef: [{ icon: '♗', letter: 'B', name: 'Bishop' }],
          voice: `Next, the Bishop — thirteen squares, diagonals only, and ALL the same colour as e4.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now the Queen',
        },
        {
          id: 'rc3',
          type: 'observe',
          boardState: 'k7/8/8/8/4Q3/8/8/K7 w - - 0 1',
          highlights: ['a4','a8','b1','b4','b7','c2','c4','c6','d3','d4','d5','e1','e2','e3','e5','e6','e7','e8','f3','f4','f5','g2','g4','g6','h1','h4','h7'],
          pieceLetterRef: [{ icon: '♕', letter: 'Q', name: 'Queen' }],
          voice: `Now the Queen — TWENTY-SEVEN squares, the Rook's fourteen PLUS the Bishop's thirteen, all combined!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now the King',
        },
        {
          id: 'rc4',
          type: 'observe',
          boardState: '7k/8/8/8/4K3/8/8/8 w - - 0 1',
          highlights: ['d3','d4','d5','e3','e5','f3','f4','f5'],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
            { icon: '♕', letter: 'Q', name: 'Queen' },
            { icon: '♔', letter: 'K', name: 'King' },
          ],
          voice: `And finally, the King — just EIGHT squares, one careful step in any direction. {name}, look at the difference: King eight, Bishop thirteen, Rook fourteen, Queen twenty-seven. The King is by far the SHORTEST-RANGE piece — which is exactly why he needs the OTHER pieces to protect him!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Quick recap quiz!',
        },
        {
          id: 'rc5',
          type: 'recap-quiz',
          boardState: 'k7/8/8/8/4Q3/8/8/K7 w - - 0 1',
          highlights: ['e4'],
          voice: `Last question, {name}! The Queen is on e4 — a LIGHT square. If she moves straight up to e5 — a DARK square — is that allowed?`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'Can the Queen move from a light square to a dark square?',
          recapOptions: ['Yes — the Queen is NOT locked to one colour', 'No — just like the Bishop, she is locked to one colour'],
          recapCorrect: 0,
          recapCorrectVoice: `YES! Exactly right, {name}! Unlike the Bishop, the Queen can visit BOTH light and dark squares — because she can move in straight lines too, not just diagonals. This is a really important difference to remember!`,
          recapWrongVoice: `Actually, YES she can! Unlike the Bishop, the Queen is NOT locked to one colour — because she can also move in straight lines (like the Rook), which DO change the square's colour. Only the Bishop has the colour-lock.`,
        },
      ],
    },

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
            { icon: '♕', letter: 'Q', name: 'Queen' },
            { icon: '♔', letter: 'K', name: 'King' },
          ],
          voice: `{name}, fantastic work! Today you learned the Queen — the most powerful piece, moving like the Rook and Bishop combined for up to twenty-seven squares. And you learned the King — moving just one square in any direction, but the piece that matters most of all, since the whole game depends on keeping him safe. You also discovered that, unlike the Bishop, the Queen is NOT locked to one colour. That's four pieces down — Rook, Bishop, Queen, King — and only Knight and Pawn left!`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'From which type of square does the Queen reach the MOST squares?',
          recapOptions: ['The centre of the board', 'A corner', 'It is always the same everywhere'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! The centre — twenty-seven squares, compared to twenty-one from a corner or edge. Centre squares are powerful for every piece!`,
          recapWrongVoice: `Remember — the CENTRE gives the Queen her biggest reach, twenty-seven squares, compared to twenty-one from a corner or edge.`,
        },
        {
          id: 'wu2',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          voice: `Next time, {name}, we meet the last two pieces — the Knight, who jumps in a special L-shape and can leap over other pieces, and the Pawn, the smallest piece that can transform into a Queen! You'll also discover a special move only the Pawn can do. See you next session!`,
          task: null,
          taskType: 'complete',
          continueLabel: 'Finish lesson!',
        },
      ],
    },

  ],
};
