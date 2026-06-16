/* eslint-disable */
// ─────────────────────────────────────────────────────────────────
// CHESS LESSON 2 — The Chess Pieces: Names and Letters
// 55 minutes · Tutor: Ms. Momo | Beginner Module · Lesson 2 of 24
// Builds on Lesson 1 (board, files, ranks, squares, piece shapes)
//
// CONCEPT (from Super Curriculum): Each chess piece has a unique
// letter used in chess notation. Knowing piece letters unlocks the
// ability to read and discuss moves in Lessons 3 onward.
// OBJECTIVE: Student knows every piece's name, letter, starting
// square(s), and can read a basic move like "Rook to e4 = Re4".
//
// CURRICULUM DECISION: Full algebraic notation (captures "x",
// check "+", reading game scores, writing exercises, notation
// puzzle) moved to Lesson 24 — after students have seen all pieces
// move and experienced captures/checks in Lessons 7-10.
// Only the MINIMUM notation (piece letter + square) stays here,
// because Lessons 3-5 refer to pieces by letter ("R for Rook").
// ─────────────────────────────────────────────────────────────────

export const LESSON_2 = {
  id: 'chess-lesson-2',
  title: 'The Chess Pieces — Names and Letters',
  subtitle: 'Lesson 2 of 24 · Beginner Module',
  totalMinutes: 55,

  phases: [

    // ═══════════════════════════════════════════════════════════
    // PHASE 1 — WARM-UP (5 minutes) — square recall from Lesson 1
    // ═══════════════════════════════════════════════════════════
    {
      id: 'warmup',
      title: 'Warm-up — Square Recall',
      type: 'warmup',
      durationMins: 5,
      steps: [
        {
          id: 'wa1',
          type: 'observe',
          boardState: 'empty',
          highlights: [],
          voice: `Welcome back, {name}! Last time you met the whole chess army — King, Queen, Rook, Bishop, Knight, and Pawn. Today we learn each piece's special LETTER, so that when we talk about chess moves, you know exactly which piece we mean. But first — let us warm up your memory with the squares you learned. I am going to CALL OUT square names and you must find them on the board. NO glowing hints this time! Say each name out loud first, then click. Ready?`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's warm up!",
        },
        {
          id: 'wa2',
          type: 'independent-squares',
          boardState: 'empty',
          highlights: [],
          voice: `Find this square: e4!`,
          task: 'Click the squares Ms. Momo calls out.',
          taskType: 'independent-squares',
          targetSquares: ['e4', 'a1', 'h8', 'd5', 'b3', 'g6'],
          voiceCorrect: [
            'e4 — the most famous square in chess!',
            'a1 — the dark corner, well done!',
            'h8 — the light corner, excellent!',
            'd5 — right in the centre!',
            'b3 — great recall, {name}!',
            'g6 — you remembered everything!',
          ],
          voiceWrong: `Not quite — remember, file letter first, then rank number. Find {sq}!`,
          successVoice: `{score} out of 6 — your board memory is sharp, {name}! Now let us learn each piece's letter!`,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 2 — PIECE LETTERS: INTRO (5 minutes)
    // ═══════════════════════════════════════════════════════════
    {
      id: 'letterintro',
      title: 'Why Pieces Have Letters',
      type: 'teach',
      durationMins: 5,
      steps: [
        {
          id: 'li1',
          type: 'observe',
          boardState: 'start',
          highlights: [],
          voice: `{name}, imagine you want to tell a friend which piece you just moved, without showing them the board. You need a SHORT code — a single letter for each piece. Chess players all over the world use the SAME letters, so a game written down in Nigeria can be read by a player in Japan or Brazil! The code is simple. Each of the six piece types has one letter — except the Pawn, which has NO letter at all. Let me show you each one!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Show me the letters!',
        },
        {
          id: 'li2',
          type: 'observe',
          boardState: 'start',
          highlights: [],
          voice: `Here are all six letters to remember: K for King. Q for Queen. R for Rook. B for Bishop. N for Knight — NOT K, because King already took K! And Pawns have NO letter. So if you see a capital letter before a square name, it tells you which piece moved. If there is NO letter, it is always a Pawn. Say them with me — K, Q, R, B, N — and Pawns have none!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's meet each piece!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 3 — EACH PIECE IN DETAIL (15 minutes)
    // One step per piece — isolated FEN so ONLY that piece shows
    // ═══════════════════════════════════════════════════════════
    {
      id: 'pieceletters',
      title: 'Each Piece and Its Letter',
      type: 'teach',
      durationMins: 15,
      steps: [
        {
          id: 'pl1',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
          highlights: ['e1', 'e8'],
          voice: `First — the KING. Look at e1 for White and e8 for Black — only the Kings on the board, so you can focus on them clearly. The King's letter is K. Simple! Whenever you see a capital K in a chess move, the King moved. The King is the most important piece — if your King is trapped, the game is over. His letter K is easy to remember — K for King!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next — the Queen',
        },
        {
          id: 'pl2',
          type: 'observe',
          boardState: '3qk3/8/8/8/8/8/8/3QK3 w - - 0 1',
          highlights: ['d1', 'd8'],
          voice: `Next — the QUEEN. Her letter is Q. See her on d1 for White and d8 for Black — right next to her King. Here is a memory trick: the Queen always starts on her OWN colour. White Queen on d1 — is d1 light or dark? Think back to Lesson 1! It is LIGHT — and the White Queen wears light! Q for Queen — the most powerful piece on the board.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next — the Rook',
        },
        {
          id: 'pl3',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/8/R3K2R w - - 0 1',
          highlights: ['a1', 'h1'],
          voice: `Now the ROOKS — the castle towers! Their letter is R. White's Rooks start in the corners, a1 and h1. They are symmetric — one on each side of the King. R for Rook — easy to remember because Rook starts with R! They will move in straight lines, but we will learn that properly in our very next lesson.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next — the Bishop',
        },
        {
          id: 'pl4',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1',
          highlights: ['c1', 'f1'],
          voice: `The BISHOPS — on c1 and f1 for White. Their letter is B. Notice something already: one Bishop is on c1, a dark square, and the other is on f1, a light square. They will STAY on those colours for the whole game! That is the Bishop's big secret, which we also explore in Lesson 3. B for Bishop — both words start with B!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next — the Knight',
        },
        {
          id: 'pl5',
          type: 'observe',
          boardState: '4k3/8/8/8/8/8/8/1N2K1N1 w - - 0 1',
          highlights: ['b1', 'g1'],
          voice: `The KNIGHTS — on b1 and g1. Here is the tricky one: the Knight's letter is N — NOT K! Why? Because the King ALREADY took K. So we use N — think of "k-NIGHT" and write the N you hear in the middle. The Knight is the only piece that can JUMP over other pieces — it moves in an L-shape. We learn that jump properly in Lesson 5. N for kNight!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Last — the Pawn',
        },
        {
          id: 'pl6',
          type: 'observe',
          boardState: '4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1',
          highlights: [],
          voice: `And finally — the eight PAWNS! They stand in a row across rank 2 for White and rank 7 for Black. Pawns have NO letter at all — they are the only piece without one. So in chess notation, if you see a move like "e4" with NO capital letter at the start, it ALWAYS means a Pawn moved. No letter equals Pawn — remember that! Pawns may look small but they can become very powerful. We'll see why in Lesson 5!`,
          task: null,
          taskType: 'observe',
          continueLabel: "Let's test your memory!",
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 4 — PIECE LETTER QUIZ (8 minutes)
    // ═══════════════════════════════════════════════════════════
    {
      id: 'letterquiz',
      title: 'Piece Letter Quiz',
      type: 'practice',
      durationMins: 8,
      steps: [
        {
          id: 'lq1',
          type: 'piece-spot-quiz',
          boardState: 'start',
          highlights: [],
          voice: `Time to test your memory, {name}! I'll highlight a piece on the board — you tell me which piece it is just from its shape. No letters yet — just recognise the piece by what it looks like!`,
          task: 'Which piece is on the highlighted square?',
          taskType: 'piece-spot-quiz',
          quizItems: [
            { square: 'e1', pieceName: 'King',   options: ['King', 'Queen', 'Bishop'] },
            { square: 'd1', pieceName: 'Queen',  options: ['King', 'Queen', 'Rook'] },
            { square: 'h1', pieceName: 'Rook',   options: ['Rook', 'Knight', 'Bishop'] },
            { square: 'c1', pieceName: 'Bishop', options: ['Bishop', 'Rook', 'Queen'] },
            { square: 'g1', pieceName: 'Knight', options: ['Bishop', 'Knight', 'King'] },
            { square: 'e2', pieceName: 'Pawn',   options: ['Pawn', 'Bishop', 'Rook'] },
          ],
          successVoice: `You know every piece by sight, {name}! Now let us check you know their letters too!`,
        },
        {
          id: 'lq2',
          type: 'piece-letter-quiz',
          boardState: 'start',
          highlights: [],
          voice: `Now the letters! I'll highlight a piece — you tell me its letter. Remember: K, Q, R, B, N — and Pawns have no letter at all!`,
          task: 'What letter does the highlighted piece use?',
          taskType: 'piece-letter-quiz',
          quizItems: [
            { square: 'g1', correctLetter: 'N', options: ['K', 'N', 'Kn'] },
            { square: 'd1', correctLetter: 'Q', options: ['Q', 'K', 'P'] },
            { square: 'a1', correctLetter: 'R', options: ['B', 'R', 'N'] },
            { square: 'f1', correctLetter: 'B', options: ['B', 'R', 'Q'] },
            { square: 'e1', correctLetter: 'K', options: ['Q', 'N', 'K'] },
            { square: 'e2', correctLetter: '(no letter)', options: ['P', '(no letter)', 'Pw'] },
          ],
          successVoice: `Outstanding, {name}! K for King, Q for Queen, R for Rook, B for Bishop, N for Knight, and no letter for Pawn. You have mastered the chess alphabet!`,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 5 — READING A MOVE (10 minutes)
    // Minimum notation: piece letter + square = one move.
    // No captures, no check — those come in Lesson 24.
    // ═══════════════════════════════════════════════════════════
    {
      id: 'readmove',
      title: 'Reading a Chess Move',
      type: 'teach',
      durationMins: 10,
      steps: [
        {
          id: 'rm1',
          type: 'observe',
          boardState: 'start',
          highlights: [],
          voice: `{name}, now that you know every piece's letter, let's learn how to READ a chess move! A chess move is written as two things stuck together: the PIECE LETTER, then the SQUARE it moved to. That is all! "Re4" means the Rook moved to e4. "Nf3" means the Knight moved to f3. "Qd5" means the Queen moved to d5. If there is no letter at the front, a Pawn moved. So "e4" means a Pawn moved to e4!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Let me see examples!',
        },
        {
          id: 'rm2',
          type: 'notation-demo',
          boardState: 'start',
          highlights: [],
          voice: `Watch this first move — "e4". No letter means a Pawn. The Pawn moves from e2 to e4 — two squares forward from its starting rank!`,
          task: null,
          taskType: 'notation-demo',
          demoFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          continueLabel: 'Next move',
        },
        {
          id: 'rm3',
          type: 'notation-demo',
          boardState: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          highlights: [],
          voice: `Now "Nf3" — N means Knight. The White Knight jumps from g1 to f3 in its L-shape. Can you see it land on f3?`,
          task: null,
          taskType: 'notation-demo',
          demoFen: 'rnbqkbnr/pppppppp/8/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          continueLabel: 'Next move',
        },
        {
          id: 'rm4',
          type: 'notation-demo',
          boardState: 'rnbqkbnr/pppppppp/8/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          highlights: [],
          voice: `And "Bc4" — B means Bishop. The White Bishop slides from f1 diagonally to c4. Bishop on c4, aiming at the centre! Three moves from the opening, all written in just six characters: e4, Nf3, Bc4.`,
          task: null,
          taskType: 'notation-demo',
          demoFen: 'rnbqkbnr/pppppppp/8/8/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 2 3',
          continueLabel: 'Now try reading moves!',
        },
        {
          id: 'rm5',
          type: 'observe',
          boardState: 'empty',
          highlights: [],
          voice: `{name}, let us do a quick reading exercise. I will say a move and you tell me — which piece moved, and to which square? Try these: "Rd1" — which piece? The Rook! To which square? d1! "Qe5" — which piece? The Queen! To which square? e5! "Nb3" — which piece? The Knight! To which square? b3! And "d4" with no letter — which piece? The Pawn! To d4! You are reading chess notation already!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One final challenge!',
        },
        {
          id: 'rm6',
          type: 'recap-quiz',
          boardState: 'empty',
          highlights: [],
          voice: `Quick quiz — what does the move "Nc6" tell you?`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'What does the chess move "Nc6" mean?',
          recapOptions: [
            'A Knight moved to the square c6',
            'A pawn moved to c6',
            'The King moved to c6',
          ],
          recapCorrect: 0,
          recapCorrectVoice: `Yes! N means Knight, and c6 is the destination square. A Knight moved to c6. You can read chess notation, {name}!`,
          recapWrongVoice: `Remember — N is the letter for Knight. So "Nc6" means a Knight moved to the square c6. Never a Pawn — Pawns have no letter!`,
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 6 — STARTING POSITION REVISION (7 minutes)
    // Know where every piece starts — sets up Lesson 6 (board setup)
    // ═══════════════════════════════════════════════════════════
    {
      id: 'startpos',
      title: 'Where Every Piece Starts',
      type: 'teach',
      durationMins: 7,
      steps: [
        {
          id: 'sp1',
          type: 'observe',
          boardState: 'start',
          highlights: ['a1','h1','a8','h8'],
          voice: `Let us look at the starting position one more time, {name}. We now know EVERY piece by name, shape, AND letter. Let us go piece by piece from the corners. Rooks — R — in all four corners: a1, h1, a8, h8.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next',
        },
        {
          id: 'sp2',
          type: 'observe',
          boardState: 'start',
          highlights: ['b1','g1','b8','g8'],
          voice: `Knights — N — on b1, g1, b8, g8. Right next to the Rooks. The horse-heads, the L-shape jumpers.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next',
        },
        {
          id: 'sp3',
          type: 'observe',
          boardState: 'start',
          highlights: ['c1','f1','c8','f8'],
          voice: `Bishops — B — on c1, f1, c8, f8. Right next to the Knights. One on a dark square, one on a light square — they will stay on those colours forever.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next',
        },
        {
          id: 'sp4',
          type: 'observe',
          boardState: 'start',
          highlights: ['d1','d8'],
          voice: `The Queens — Q — on d1 and d8. Queen on her own colour. White Queen on light d1, Black Queen on dark d8.`,
          task: null,
          taskType: 'observe',
          continueLabel: 'Next',
        },
        {
          id: 'sp5',
          type: 'observe',
          boardState: 'start',
          highlights: ['e1','e8'],
          voice: `Kings — K — on e1 and e8. Right next to their Queens. And the eight Pawns — no letter — fill rank 2 for White and rank 7 for Black. Now you know the name, the letter, AND the starting square of every single piece on the chess board!`,
          task: null,
          taskType: 'observe',
          continueLabel: 'One more thing before we finish...',
        },
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // PHASE 7 — WRAP-UP (5 minutes)
    // ═══════════════════════════════════════════════════════════
    {
      id: 'wrapup',
      title: 'Lesson Complete!',
      type: 'wrapup',
      durationMins: 5,
      steps: [
        {
          id: 'wu1',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          voice: `{name}, you have done something real today! You now know every chess piece by shape, by name, by letter, and by starting square. K for King, Q for Queen, R for Rook, B for Bishop, N for Knight, and Pawns have no letter. You can read a simple chess move — piece letter plus square equals a move. And you know where every single piece begins on the board. That is the foundation of everything we will build in the coming lessons!`,
          task: null,
          taskType: 'recap-quiz',
          continueLabel: 'One more thing before we finish...',
          recapQuestion: 'Which piece has NO letter in chess notation?',
          recapOptions: ['The Pawn', 'The Knight', 'The Bishop'],
          recapCorrect: 0,
          recapCorrectVoice: `Exactly right! The Pawn has no letter — so any move without a capital letter at the front is ALWAYS a Pawn. You have learned this well, {name}!`,
          recapWrongVoice: `It is the PAWN that has no letter! K for King, Q for Queen, R for Rook, B for Bishop, N for Knight — and Pawns have none. Any move without a letter is a Pawn move.`,
        },
        {
          id: 'wu2',
          type: 'wrapup',
          boardState: 'empty',
          highlights: [],
          voice: `Next time, {name}, we learn HOW the Rook and Bishop actually MOVE around the board! The Rook travels in straight lines — up, down, left, right. The Bishop glides diagonally, and has a colour secret you will find amazing. Everything you learned today — especially R for Rook and B for Bishop — will come straight to life in Lesson 3. See you next session!`,
          task: null,
          taskType: 'complete',
          continueLabel: 'Finish lesson!',
        },
      ],
    },

  ],
};
