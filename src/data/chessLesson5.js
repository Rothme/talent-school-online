/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 5 — Knight and Pawn Movement
// 55 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 5 of 24
// Builds on Lessons 3-4 (Rook, Bishop, Queen, King movement)
//
// CONCEPT (from Super Curriculum): Knights jump in L-shapes. Pawns
// move forward, capture diagonally, and can promote.
// OBJECTIVE: Student can execute Knight and Pawn moves, including
// promotion. En passant is MENTIONED ONLY (full lesson = Lesson 15).
//
// SCOPE GUARDRAILS:
// - Knight: pure movement-range (piece-range), like Rook/Bishop/
//   Queen/King in Lessons 3-4.
// - Pawn: forward movement (1 or 2 squares depending on starting
//   rank), diagonal captures, and promotion to ALL FOUR pieces
//   (Q, R, B, N) - each demonstrated, not just "always Queen".
// - En passant: ONE sentence mention only, explicitly deferred to
//   Lesson 15. NO exercise on it here.
// - NO captures-as-attacks framing (that begins Lesson 7+) - pawn
//   captures here are taught as MOVEMENT MECHANICS only.
//
// REBUILD NOTE (per docs/CURRICULUM_RULES.md): every piece intro now
// follows the 3-step pattern from Lessons 1-2 — real starting square
// first, then an animated demoSequence with path dots showing every
// direction, THEN the practice round. All FENs verified with chess.js.
// pieceLetterRef panels reinforce the N letter from Lesson 2 (and
// confirm Pawn has none).
// ─────────────────────────────────────────────────────────────────

export const LESSON_5 = {
  id: 'chess-lesson-5',
  title: 'Knight and Pawn Movement',
  subtitle: 'Lesson 5 of 24 · Beginner Module',
  totalMinutes: 56,

  phases: [

    {
      id: 'warmup',
      title: 'Warm-up — The Four Pieces So Far',
      type: 'warmup',
      durationMins: 5,
      steps: [
        {
          id: 'wa1',
          type: 'observe',
          boardState: 'k7/8/8/8/4Q3/8/8/K7 w - - 0 1',
          highlights: ['a4','a8','b1','b4','b7','c2','c4','c6','d3','d4','d5','e1','e2','e3','e5','e6','e7','e8','f3','f4','f5','g2','g4','g6','h1','h4','h7'],
          pieceLetterRef: [
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
            { icon: '♕', letter: 'Q', name: 'Queen' },
            { icon: '♔', letter: 'K', name: 'King' },
          ],
          voice: `Welcome back, {name}! Quick recall — the Queen, on e4, reaches twenty-seven squares — straight lines AND diagonals. You've now learned how Rook, Bishop, Queen, and King all move. Today, the final two pieces — the KNIGHT, who jumps in a surprising L-shape, and the PAWN, the smallest piece with some of the most special rules in chess!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's meet the Knight!",
        },
        {
          id: 'wa2',
          type: 'recap-quiz',
          boardState: '7k/8/8/8/4K3/8/8/8 w - - 0 1',
          highlights: ['d3','d4','d5','e3','e5','f3','f4','f5'],
          voice: `Quick check — the King is on e4. How many squares can he reach?`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'Meet the Knight!',
          recapQuestion: 'How many squares can the King reach from the centre?',
          recapOptions: ['Eight', 'Fourteen', 'Twenty-seven'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! Eight — one careful step in every direction. Now, the Knight!`,
          recapWrongVoice: `Remember — the King only moves ONE square, so from the centre he reaches eight neighbouring squares. Now, the Knight!`,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — KNIGHT: HOW IT MOVES (8 minutes, was 7)
    // 3-step pattern: real square intro (both b1 and g1) → demo
    // with path dots → centre demo
    // ═══════════════════════════════════════════════════════════
    {
      id: 'knightteach',
      title: 'The Knight — The L-Shape Jump',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'nt0',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/1N4N1 w - - 0 1',
          highlights: ['b1', 'g1'],
          pieceLetterRef: [{ icon: '♘', letter: 'N', name: 'Knight' }],
          voice: `{name}, here are both Knights on their real starting squares — b1 and g1! Remember the Knight's letter from Lesson 2 — capital N, NOT K, because King already took K. See its horse-head shape — easiest piece to recognise! The Knight is the ONLY piece in chess that can JUMP OVER other pieces, like a horse leaping a fence.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me its jumps!',
        },
        {
          id: 'nt1',
          type: 'observe',
          boardState: '4k3/8/8/8/4K3/8/8/1N6 w - - 0 1',
          demoSequence: [
            { fen: '4k3/8/8/8/4K3/N7/8/8 w - - 0 1', path: ['a3'], delay: 2000 },
            { fen: '4k3/8/8/8/4K3/2N5/8/8 w - - 0 1', path: ['c3'], delay: 2000 },
            { fen: '4k3/8/8/8/4K3/8/3N4/8 w - - 0 1', path: ['d2'], delay: 2000 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♘', letter: 'N', name: 'Knight' }],
          voice: `Watch the Knight jump from b1 — to a3, to c3, to d2. Three different L-shapes, all from the same starting square! Two squares in one direction, then one square sideways — always an L. From the centre of the board, the Knight has even MORE jumps available.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me from the centre!',
        },
        {
          id: 'nt2',
          type: 'observe',
          boardState: '4k3/8/8/8/3N4/8/8/K7 w - - 0 1',
          demoSequence: [
            { fen: '4k3/8/8/8/8/1N6/8/K7 w - - 0 1', path: ['b3'], delay: 1700 },
            { fen: '4k3/8/8/1N6/8/8/8/K7 w - - 0 1', path: ['b5'], delay: 1700 },
            { fen: '4k3/8/8/8/8/8/2N5/K7 w - - 0 1', path: ['c2'], delay: 1700 },
            { fen: '4k3/8/2N5/8/8/8/8/K7 w - - 0 1', path: ['c6'], delay: 1700 },
            { fen: '4k3/8/8/8/8/8/4N3/K7 w - - 0 1', path: ['e2'], delay: 1700 },
            { fen: '4k3/8/4N3/8/8/8/8/K7 w - - 0 1', path: ['e6'], delay: 1700 },
            { fen: '4k3/8/8/8/8/5N2/8/K7 w - - 0 1', path: ['f3'], delay: 1700 },
            { fen: '4k3/8/8/5N2/8/8/8/K7 w - - 0 1', path: ['f5'], delay: 1700 },
          ],
          highlights: ['b3','b5','c2','c6','e2','e6','f3','f5'],
          pieceLetterRef: [{ icon: '♘', letter: 'N', name: 'Knight' }],
          voice: `From d4, the Knight can jump to any of these EIGHT squares — all shaped like an L! Two-up-one-side, two-down-one-side, two-left-one-up, and so on, in all four pairs of directions. Notice something interesting — the Knight is the ONLY piece that changes square COLOUR every single time it moves. d4 is dark, and every one of these eight squares is light!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    {
      id: 'knightpractice',
      title: 'Knight Practice — Find the L-Shapes',
      type: 'practice',
      durationMins: 13,
      steps: [
        {
          id: 'np1',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/3N4/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `The Knight is on d4 — the centre. Drag it to every square it can jump to. Remember — L-shapes only, eight of them!`,
          task: 'Drag the Knight on d4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['b3','b5','c2','c6','e2','e6','f3','f5'],
          successVoice: `All eight, {name}! Maximum Knight power from the centre. Now from its starting square...`,
          continueLabel: 'Try the starting square!',
        },
        {
          id: 'np2',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
          highlights: [],
          voice: `Now the Knight is on b1 — its starting square. Drag it to every square it can jump to from here.`,
          task: 'Drag the Knight on b1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['a3','c3','d2'],
          successVoice: `Just THREE, {name} — from b1 the Knight is quite limited. Let's try the OTHER starting Knight square...`,
          continueLabel: 'Try the other Knight!',
        },
        {
          id: 'np3',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/8/8/8/4K1N1 w - - 0 1',
          highlights: [],
          voice: `This Knight starts on g1 — the other side of the board. Drag it to every square it can jump to!`,
          task: 'Drag the Knight on g1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['e2','f3','h3'],
          successVoice: `Three again, {name} — symmetric to b1! One more — the trickiest spot of all for a Knight...`,
          continueLabel: 'Try the corner!',
        },
        {
          id: 'np4',
          type: 'piece-range',
          pieceRangeFen: '4k3/8/8/8/4K3/8/8/N7 w - - 0 1',
          highlights: [],
          voice: `The Knight is on a1 — the corner! This is its WORST possible square. Drag it to every square it can reach.`,
          task: 'Drag the Knight on a1 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['b3','c2'],
          successVoice: `Just TWO squares, {name} — the Knight's smallest reach anywhere on the board! Pattern check: Knight goes from two (corner) to three (starting squares) to eight (centre). Centre is always best — for every piece we've studied. Now — let's meet the Pawn!`,
          continueLabel: 'Meet the Pawn!',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — PAWN: HOW IT MOVES (8 minutes, was 7)
    // 3-step pattern: real square intro → demo with path dots →
    // diagonal capture demo
    // ═══════════════════════════════════════════════════════════
    {
      id: 'pawnteach',
      title: 'The Pawn — Forward March, Diagonal Capture',
      type: 'teach',
      durationMins: 8,
      steps: [
        {
          id: 'pt0',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/4P3/K7 w - - 0 1',
          highlights: ['e2'],
          pieceLetterRef: [{ icon: '♙', letter: '—', name: 'Pawn (no letter)' }],
          voice: `Here is a PAWN, {name} — on its real starting square, e2! The Pawn is the smallest piece, with a round head and no special shape. Remember from Lesson 2 — the Pawn has NO letter at all in chess notation. The Pawn moves FORWARD ONLY — it can never move backward or sideways.`,
          task: null,
          taskType: 'observe',
          continueLabel: "Show its first-move choice!",
        },
        {
          id: 'pt1',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/4P3/K7 w - - 0 1',
          demoSequence: [
            { fen: '4k3/8/8/8/8/4P3/8/K7 w - - 0 1', path: ['e3'], delay: 2200 },
            { fen: '4k3/8/8/8/4P3/8/8/K7 w - - 0 1', path: ['e3','e4'], delay: 2200 },
          ],
          highlights: [],
          pieceLetterRef: [{ icon: '♙', letter: '—', name: 'Pawn (no letter)' }],
          voice: `On its VERY FIRST MOVE, a Pawn that is still on its starting rank can move EITHER one square OR two squares forward — its choice! Watch — e2 to e3 is one choice. e2 to e4 is the other choice. Two squares forward, only on the very first move!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'After the first move...',
        },
        {
          id: 'pt2',
          type: 'observe',
          boardState: 'k7/8/8/8/4P3/8/8/K7 w - - 0 1',
          demoSequence: [
            { fen: 'k7/8/8/4P3/8/8/8/K7 w - - 0 1', path: ['e5'], delay: 2200 },
          ],
          highlights: ['e5'],
          pieceLetterRef: [{ icon: '♙', letter: '—', name: 'Pawn (no letter)' }],
          voice: `Now the Pawn is on e4 — it already used its special first move. From here, it can ONLY move ONE square forward, to e5. {name}, remember this rule: the two-square move is ONLY available on a Pawn's very FIRST move, from its starting rank. Every move after that is just one square.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Now — diagonal captures!',
        },
        {
          id: 'pt3',
          type: 'observe',
          boardState: 'k7/8/8/3p1p2/4P3/8/8/K7 w - - 0 1',
          highlights: ['e5', 'd5', 'f5'],
          pieceLetterRef: [{ icon: '♙', letter: '—', name: 'Pawn (no letter)' }],
          voice: `Here's the Pawn's other special rule, {name}. The White Pawn on e4 normally moves straight to e5. But look — there are enemy Pawns on d5 and f5! A Pawn captures DIAGONALLY — one square diagonally forward, only when there's an enemy piece there. So this Pawn could move to e5 (straight, no capture), OR capture on d5, OR capture on f5 — diagonal captures only!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Your turn to try!',
        },
      ],
    },

    {
      id: 'pawnpractice',
      title: 'Pawn Practice — Forward and Diagonal',
      type: 'practice',
      durationMins: 13,
      steps: [
        {
          id: 'pp1',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/8/8/8/4P3/K7 w - - 0 1',
          highlights: [],
          voice: `This Pawn is on e2 — its STARTING square, with no enemy pieces nearby. Drag it to every square it can move to.`,
          task: 'Drag the Pawn on e2 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['e3','e4'],
          successVoice: `Two squares, {name} — the special first-move choice! Now let's see a Pawn that already moved.`,
          continueLabel: 'Try an advanced Pawn!',
        },
        {
          id: 'pp2',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/8/4P3/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `This Pawn is on e4 — it has ALREADY moved once before. Drag it to every square it can move to now.`,
          task: 'Drag the Pawn on e4 to every square it can reach.',
          taskType: 'piece-range',
          targetSquares: ['e5'],
          successVoice: `Just ONE square, {name} — exactly as we learned. The two-square option only existed on the very first move. Now — let's add some enemy pieces!`,
          continueLabel: 'Try a capture!',
        },
        {
          id: 'pp3',
          type: 'piece-range',
          pieceRangeFen: 'k7/8/8/3p1p2/4P3/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `This Pawn is on e4, with enemy Pawns on d5 and f5. Drag it to every square White's Pawn can move to — straight AND diagonal captures!`,
          task: 'Drag the Pawn on e4 to every square it can reach (including captures).',
          taskType: 'piece-range',
          targetSquares: ['e5','d5','f5'],
          successVoice: `All three, {name}! One straight move to e5, plus two diagonal captures on d5 and f5. You've mastered how the Pawn moves AND captures!`,
          continueLabel: "Now — the Pawn's big secret!",
        },
      ],
    },

    {
      id: 'promotion',
      title: 'Promotion — The Pawn Transforms!',
      type: 'teach',
      durationMins: 6,
      steps: [
        {
          id: 'pr1',
          type: 'observe',
          boardState: '7k/1P6/8/8/8/8/8/K7 w - - 0 1',
          highlights: ['b8'],
          voice: `{name}, here is the Pawn's BIGGEST secret. This White Pawn is on b7 — just ONE square away from the very last rank, rank 8! When a Pawn reaches the FAR end of the board, something amazing happens — it PROMOTES! It transforms into ANY piece the player chooses — except a King or another Pawn.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me the choices!',
        },
        {
          id: 'pr2',
          type: 'observe',
          boardState: '6Qk/8/8/8/8/8/8/K7 w - - 0 1',
          highlights: [],
          pieceLetterRef: [{ icon: '♕', letter: 'Q', name: 'Queen' }],
          voice: `Choice one: PROMOTE TO QUEEN! This is by far the most common choice — the Pawn becomes the most powerful piece on the board. Twenty-seven squares of reach, just like that!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'What about a Rook?',
        },
        {
          id: 'pr3',
          type: 'observe',
          boardState: '6Rk/8/8/8/8/8/8/K7 w - - 0 1',
          highlights: [],
          pieceLetterRef: [{ icon: '♖', letter: 'R', name: 'Rook' }],
          voice: `Choice two: promote to ROOK — fourteen squares of straight-line power. Less common than the Queen, but still very strong.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'A Bishop or Knight?',
        },
        {
          id: 'pr4',
          type: 'observe',
          boardState: '6Bk/8/8/8/8/8/8/K7 w - - 0 1',
          highlights: [],
          pieceLetterRef: [
            { icon: '♗', letter: 'B', name: 'Bishop' },
            { icon: '♘', letter: 'N', name: 'Knight' },
          ],
          voice: `Choice three: promote to BISHOP — diagonal power, locked to one colour. And choice four — promote to KNIGHT, for that special L-shaped jump. {name}, here's a fun fact: most of the time, players choose the Queen because she's the strongest. But sometimes — very rarely — choosing a KNIGHT instead can be the cleverer choice, because of a tricky rule you'll learn properly very soon. For now, just remember: FOUR choices — Queen, Rook, Bishop, or Knight — but NEVER a King, and NEVER another Pawn!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One special move...',
        },
        {
          id: 'pr5',
          type: 'observe',
          boardState: 'k7/8/8/8/8/8/4P3/K7 w - - 0 1',
          highlights: [],
          voice: `One last thing before we finish, {name}. There is ONE more special Pawn move in chess — it's called EN PASSANT, which means "in passing" in French. It's a special capture that doesn't work like the normal diagonal capture we learned today. It's rare, and a little tricky — so we'll learn it properly, with its own full lesson, very soon. For now, just remember the name: en passant!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Quick recap quiz!',
        },
        {
          id: 'pr6',
          type: 'recap-quiz',
          boardState: '6Qk/8/8/8/8/8/8/K7 w - - 0 1',
          highlights: [],
          voice: `Quick check, {name} — when a Pawn reaches the last rank, which piece can it NOT become?`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'A promoting Pawn can become Queen, Rook, Bishop, or Knight. What can it NOT become?',
          recapOptions: ['A King or another Pawn', 'A Queen', 'A Rook'],
          recapCorrect: 0,
          recapCorrectVoice: `Exactly right, {name}! A Pawn can promote to Queen, Rook, Bishop, or Knight — but NEVER a King, and NEVER another Pawn.`,
          recapWrongVoice: `Remember — a Pawn CAN become Queen, Rook, Bishop, or Knight. The only things it can NEVER become are a King or another Pawn.`,
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
            { icon: '♔', letter: 'K', name: 'King' },
            { icon: '♕', letter: 'Q', name: 'Queen' },
            { icon: '♖', letter: 'R', name: 'Rook' },
            { icon: '♗', letter: 'B', name: 'Bishop' },
            { icon: '♘', letter: 'N', name: 'Knight' },
            { icon: '♙', letter: '—', name: 'Pawn (no letter)' },
          ],
          voice: `{name}, incredible work! Today you learned the Knight — the only piece that jumps over others, moving in an L-shape and changing square colour every move. And you learned the Pawn — moving forward only, with a two-square first move, diagonal captures, and the amazing power of PROMOTION, transforming into a Queen, Rook, Bishop, or Knight when it reaches the far rank. You now know how ALL SIX chess pieces move — King, Queen, Rook, Bishop, Knight, and Pawn. That is a HUGE achievement!`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'How many squares can a Pawn move on its VERY FIRST move (from its starting rank, no enemies nearby)?',
          recapOptions: ['One or two — its choice', 'Always two', 'Always one'],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! One OR two, the Pawn's choice — but only on its first move from the starting rank. After that, always just one square.`,
          recapWrongVoice: `Remember — on its FIRST move from the starting rank, a Pawn can choose ONE or TWO squares. After that first move, it's always just one square.`,
        },
        {
          id: 'wu2',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          voice: `Next time, {name}, we put it all together — setting up the ENTIRE chess board from memory, with all sixteen pieces on each side, in under sixty seconds! You already know every piece's shape and movement — now it's time to know exactly where each one belongs. See you next session!`,
          task: null,
          taskType: 'complete',
          continueLabel: 'Finish lesson!',
        },
      ],
    },

  ],
};
