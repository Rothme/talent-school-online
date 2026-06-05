// ─────────────────────────────────────────────
// EXPANDED CHESS CURRICULUM
// Each lesson: Instruction → Guided Exercises → Challenge
// Designed to fill a full 50-minute session
// ─────────────────────────────────────────────

export const CHESS_LESSONS_EXPANDED = [

  // ══════════════════════════════════════════
  // LEVEL 1 — THE PIECES (Lessons 1–10)
  // ══════════════════════════════════════════

  {
    id: 'chess-1', level: 1, levelName: 'The Pieces',
    title: 'Meet the King', subtitle: 'Beginner · Lesson 1',
    stage: 'The most important piece on the board',
    step: 1, totalSteps: 30,
    duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins',
        title: 'Who is the King?',
        content: 'The King is the tallest piece on the board and has a cross on top. He is the most important piece — if your King is captured, the game is over and you lose. I have placed the King on my board at e1 — that is column e, row 1. Look carefully and find that same square on your board.',
        boardSetup: 'king-only',
        targetPiece: 'K', targetSquare: [7, 4],
      },
      {
        part: 'exercises', duration: '25 mins',
        title: 'Practise with the King',
        exercises: [
          { id: 'ex1', instruction: 'Place the White King on e1 — column e, row 1.', type: 'placement', piece: 'K', square: [7,4], tip: 'Count along the bottom row: a b c d e — that is column e. Row 1 is the bottom row.' },
          { id: 'ex2', instruction: 'Now place the King on d1.', type: 'placement', piece: 'K', square: [7,3], tip: 'Column d is one square to the left of e.' },
          { id: 'ex3', instruction: 'Place the Black King on e8 — the black King starts here.', type: 'placement', piece: 'k', square: [0,4], tip: 'Row 8 is the top row. Column e is in the middle.' },
          { id: 'ex4', instruction: 'Both Kings are on the board. Can you spot the White King? Click on it.', type: 'identify', piece: 'K', tip: 'The White King is the lighter coloured piece with a cross on top.' },
          { id: 'ex5', instruction: 'The board is upside down! Find and click the King.', type: 'identify', rotated: true, piece: 'K', tip: 'The King looks the same from any angle — look for the cross on top.' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins',
        title: 'King placement challenge',
        description: 'Ms. Momo will call out a square. Place the King on that square as fast as you can. Five rounds — how quickly can you do it?',
        type: 'timed-placement',
        squares: ['e1','d1','f1','e8','d8'],
        timeLimit: 10,
        tip: 'Remember: letters go across (a to h), numbers go up (1 to 8). Find the column first, then count the row.',
      },
    ],
    tutorInstruction: "Welcome to chess! I am Ms. Momo and I will teach you everything. Today we meet the King — the most important piece. Look at my board on the right — I have placed the King on e1. Column e, Row 1. Find that same square on your board and place your King there!",
    rightPanelNote: "Ms. Momo places the King on e1 — now you try",
    tip: "The King is the most important piece in chess. If your King is captured, the game is over. Always protect your King!",
    targetPiece: 'K', targetSquare: [7,4],
  },

  {
    id: 'chess-2', level: 1, levelName: 'The Pieces',
    title: 'Meet the Queen', subtitle: 'Beginner · Lesson 2',
    stage: 'The most powerful piece on the board',
    step: 2, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Who is the Queen?',
        content: 'The Queen is the most powerful piece in chess. She has a crown on top and stands next to the King. The White Queen always starts on d1 — a light square. Remember this rule: the Queen loves her own colour. White Queen on light, Black Queen on dark.',
        boardSetup: 'queen-only', targetPiece: 'Q', targetSquare: [7,3],
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Practise with the Queen',
        exercises: [
          { id: 'ex1', instruction: 'Place the White Queen on d1.', type: 'placement', piece: 'Q', square: [7,3], tip: 'Column d, Row 1 — one square to the left of the King at e1.' },
          { id: 'ex2', instruction: 'Now place the Black Queen on d8.', type: 'placement', piece: 'q', square: [0,3], tip: 'Column d, Row 8 — at the top of the board on a dark square.' },
          { id: 'ex3', instruction: 'Both the King and Queen are on the board. Click on the Queen.', type: 'identify', piece: 'Q', tip: 'The Queen has a crown on top. The King has a cross. Both are tall pieces.' },
          { id: 'ex4', instruction: 'Is this Queen on the right colour? Look carefully at the square colour.', type: 'verify-colour', tip: 'White Queen must stand on a LIGHT square. If she is on a dark square, something is wrong!' },
          { id: 'ex5', instruction: 'Set up both the King and Queen in their correct starting positions.', type: 'multi-placement', pieces: [{piece:'Q',square:[7,3]},{piece:'K',square:[7,4]}], tip: 'King on e1, Queen on d1. Remember: Queen on her own colour!' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'King and Queen memory challenge',
        description: 'Ms. Momo will show you a position for 3 seconds, then hide it. Recreate the position from memory!',
        type: 'memory-placement', timeLimit: 3,
        tip: 'Look carefully at where each piece is before it disappears. Remember the column letter and row number.',
      },
    ],
    tutorInstruction: "Now meet the Queen — the most powerful piece on the board! She can move in any direction. The White Queen starts on d1. Remember: the Queen always starts on her own colour. White Queen on a light square!",
    rightPanelNote: "Ms. Momo places the Queen on d1 — now you try",
    tip: "The Queen starts on d1. White Queen on light, Black Queen on dark. An easy way to remember: the Queen is proud and always stands on her own colour!",
    targetPiece: 'Q', targetSquare: [7,3],
  },

  {
    id: 'chess-3', level: 1, levelName: 'The Pieces',
    title: 'The Rook', subtitle: 'Beginner · Lesson 3',
    stage: 'The castle tower that dominates open files',
    step: 3, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Who is the Rook?',
        content: 'The Rook looks like a castle tower — flat on top with battlements. Rooks start in the four corners of the board: a1, h1 for White and a8, h8 for Black. The Rook moves in straight lines — forward, backward, left, or right — as many squares as it wants. It is very powerful on open files.',
        targetPiece: 'R', targetSquare: [7,0],
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Practise with the Rook',
        exercises: [
          { id: 'ex1', instruction: 'Place the White Rooks on a1 and h1 — the two corners.', type: 'multi-placement', pieces: [{piece:'R',square:[7,0]},{piece:'R',square:[7,7]}], tip: 'a1 is the bottom-left corner. h1 is the bottom-right corner.' },
          { id: 'ex2', instruction: 'Click on the Rook in this position.', type: 'identify', piece: 'R', tip: 'The Rook looks like a castle tower — flat on top, wider at the base.' },
          { id: 'ex3', instruction: 'The Rook is on a1. Which squares can it reach? Click all the squares it can move to.', type: 'show-moves', piece: 'R', from: [7,0], tip: 'The Rook moves in straight lines — along the whole row and the whole column.' },
          { id: 'ex4', instruction: 'Set up all four Rooks in their correct starting positions.', type: 'multi-placement', pieces: [{piece:'R',square:[7,0]},{piece:'R',square:[7,7]},{piece:'r',square:[0,0]},{piece:'r',square:[0,7]}], tip: 'White Rooks in bottom corners, Black Rooks in top corners.' },
          { id: 'ex5', instruction: 'There is a pawn blocking the Rook. Can the Rook jump over it?', type: 'move-test', answer: false, tip: 'The Rook CANNOT jump over pieces. It must have a clear path to move.' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Rook movement challenge',
        description: 'Move the Rook from its starting square to the target square in the fewest number of moves. Three puzzles of increasing difficulty.',
        type: 'path-challenge', pieces: ['R'],
        tip: 'The Rook needs open lines. Plan your path before you move.',
      },
    ],
    tutorInstruction: "Meet the Rook — it looks like a castle tower! Rooks go in the four corners of the board at the start. The Rook moves in straight lines — forward, backward, left, and right. It cannot jump over other pieces. Place the White Rooks on a1 and h1!",
    rightPanelNote: "Ms. Momo shows the Rooks in their corner starting squares",
    tip: "Rooks are most powerful on open files — columns with no pawns blocking them. Two Rooks working together are called a battery and are very strong!",
    targetPiece: 'R', targetSquare: [7,0],
  },

  {
    id: 'chess-4', level: 1, levelName: 'The Pieces',
    title: 'The Bishop', subtitle: 'Beginner · Lesson 4',
    stage: 'The diagonal glider that never changes colour',
    step: 4, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Who is the Bishop?',
        content: 'The Bishop has a pointed hat and moves diagonally. Here is the most important fact about the Bishop: it ALWAYS stays on the same colour. A Bishop that starts on a light square will NEVER reach a dark square. Each player has two Bishops — one on light squares and one on dark squares. Together they cover the whole board.',
        targetPiece: 'B', targetSquare: [7,2],
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Practise with the Bishop',
        exercises: [
          { id: 'ex1', instruction: 'Place the White Bishops on c1 and f1.', type: 'multi-placement', pieces: [{piece:'B',square:[7,2]},{piece:'B',square:[7,5]}], tip: 'c1 is a light square, f1 is a dark square. One Bishop on each colour.' },
          { id: 'ex2', instruction: 'The Bishop is on c1. Show all the squares it can reach.', type: 'show-moves', piece: 'B', from: [7,2], tip: 'The Bishop moves diagonally in all four directions — as many squares as it likes.' },
          { id: 'ex3', instruction: 'This Bishop is on a light square. Will it EVER be able to reach this dark square?', type: 'verify-colour', answer: false, tip: 'Bishops can NEVER change colour. A light-square Bishop can never reach a dark square.' },
          { id: 'ex4', instruction: 'Which piece is the Bishop? Click on it.', type: 'identify', piece: 'B', tip: 'The Bishop has a pointed top like a church spire. It is taller than a Pawn but shorter than the King.' },
          { id: 'ex5', instruction: 'Set up both White Bishops in their correct starting positions.', type: 'multi-placement', pieces: [{piece:'B',square:[7,2]},{piece:'B',square:[7,5]}], tip: 'Bishops sit between the Knights and the Queen/King — positions c1 and f1 for White.' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Bishop colour challenge',
        description: 'For each position shown, answer correctly: Is this Bishop on a light square or dark square? Can it reach the target square? 8 quick questions.',
        type: 'colour-quiz',
        tip: 'Count the diagonal squares. Remember: Bishops change colour every single diagonal step.',
      },
    ],
    tutorInstruction: "Meet the Bishop — it has a pointed hat and moves diagonally. The most important thing about the Bishop: it ALWAYS stays on the same colour! One Bishop stays on light squares forever, the other stays on dark squares forever. Place the White Bishops on c1 and f1!",
    rightPanelNote: "Ms. Momo shows both Bishops on their starting squares",
    tip: "Each Bishop stays on its colour forever. A light-square Bishop can never reach a dark square. This is why having both Bishops is so valuable — together they cover every square!",
    targetPiece: 'B', targetSquare: [7,2],
  },

  {
    id: 'chess-5', level: 1, levelName: 'The Pieces',
    title: 'The Knight', subtitle: 'Beginner · Lesson 5',
    stage: 'The only piece that can jump over others',
    step: 5, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Who is the Knight?',
        content: 'The Knight looks like a horse and is the most unique piece in chess. It moves in an L-shape: TWO squares in one direction and then ONE square sideways. It is the ONLY piece that can jump over other pieces — it does not need a clear path. From the centre of the board the Knight can reach eight different squares.',
        targetPiece: 'N', targetSquare: [7,1],
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Practise with the Knight',
        exercises: [
          { id: 'ex1', instruction: 'Place the White Knights on b1 and g1.', type: 'multi-placement', pieces: [{piece:'N',square:[7,1]},{piece:'N',square:[7,6]}], tip: 'Knights stand between the Rooks and Bishops — positions b1 and g1 for White.' },
          { id: 'ex2', instruction: 'The Knight is on b1. Click all the squares it can jump to.', type: 'show-moves', piece: 'N', from: [7,1], tip: 'Two squares up then one sideways, OR one square up then two sideways. Try all four directions!' },
          { id: 'ex3', instruction: 'There are pieces all around the Knight. Can it still move?', type: 'move-test', answer: true, tip: 'YES! The Knight JUMPS over pieces. Surrounding pieces cannot trap a Knight.' },
          { id: 'ex4', instruction: 'Move the Knight from e4 to f6 — show the L-shape path.', type: 'move-demo', from: [4,4], to: [2,5], tip: 'Two squares forward (e4 to e6), then one square right (e6 to f6). That is the L-shape.' },
          { id: 'ex5', instruction: 'The Knight needs to capture the enemy piece. Click the Knight then click where it should move.', type: 'capture-challenge', tip: 'Remember the L-shape. Two then one, or one then two. Check all eight possible squares.' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Knight jump challenge',
        description: 'Move the Knight from one side of the board to the other in the minimum number of moves. Two puzzles — can you find the shortest path?',
        type: 'path-challenge', pieces: ['N'],
        tip: 'Knights look far away from targets on the board but can reach them in fewer moves than you expect. Think ahead!',
      },
    ],
    tutorInstruction: "The Knight is the most exciting piece! It looks like a horse and moves in an L-shape — two squares in one direction then one square sideways. The Knight is the ONLY piece that can jump over other pieces! Place the White Knights on b1 and g1!",
    rightPanelNote: "Ms. Momo shows the Knight's eight possible moves from the centre",
    tip: "Remember the Knight's move: two then one, or one then two — then turn the corner. The Knight always lands on the opposite colour from where it started!",
    targetPiece: 'N', targetSquare: [7,1],
  },

  {
    id: 'chess-6', level: 1, levelName: 'The Pieces',
    title: 'The Pawn', subtitle: 'Beginner · Lesson 6',
    stage: 'Eight soldiers that can become Queens',
    step: 6, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Who are the Pawns?',
        content: 'Pawns are the smallest pieces but they have amazing potential. Each side has eight Pawns. They move FORWARD only — one square at a time. On their very first move each Pawn can choose to move TWO squares forward. Pawns capture DIAGONALLY — forward only. The most exciting rule: if a Pawn reaches the other end of the board it can become a QUEEN!',
        targetPiece: 'P', targetSquare: [6,0],
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Practise with Pawns',
        exercises: [
          { id: 'ex1', instruction: 'Place all 8 White Pawns on row 2 — from a2 to h2.', type: 'pawn-placement', tip: 'Row 2 is the second row from the bottom. One Pawn on every square in that row.' },
          { id: 'ex2', instruction: 'This Pawn is on e2. Can it move two squares to e4?', type: 'move-test', answer: true, piece: 'P', from: [6,4], tip: 'YES! On its very first move a Pawn can choose to move one OR two squares forward.' },
          { id: 'ex3', instruction: 'This Pawn is on e4 — not its starting square. Can it move two squares?', type: 'move-test', answer: false, piece: 'P', from: [4,4], tip: 'NO! After a Pawn has moved once it can only move one square at a time.' },
          { id: 'ex4', instruction: 'The Pawn on d4 wants to capture. Which squares can it capture on?', type: 'show-captures', piece: 'P', from: [4,3], tip: 'Pawns capture diagonally forward — one square to the left or right, but always moving forward.' },
          { id: 'ex5', instruction: 'The White Pawn has reached row 8! What piece does it become?', type: 'promotion-quiz', answer: 'Queen', tip: 'A Pawn that reaches the other end of the board is PROMOTED. It almost always becomes a Queen — the most powerful piece!' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Pawn march challenge',
        description: 'Get your Pawn safely from its starting position to the other end of the board to become a Queen. Enemy pawns will try to block you. Three levels of difficulty.',
        type: 'pawn-march',
        tip: 'Push your Pawn forward confidently. Watch out for enemy Pawns that can capture diagonally. Get to the other end to win!',
      },
    ],
    tutorInstruction: "Now meet the Pawns — your army of eight soldiers! They go on row 2, one on every square from a2 to h2. Pawns move forward only, but they capture diagonally. Most exciting rule: if a Pawn reaches the other end of the board it becomes a Queen! Place all 8 Pawns on row 2!",
    rightPanelNote: "Ms. Momo fills row 2 with White Pawns",
    tip: "Pawns can only move forward and capture forward-diagonally. They can never move backward. A promoted Pawn becomes a Queen in most cases — that is called queening a pawn!",
    targetPiece: 'P', targetSquare: null,
  },

  {
    id: 'chess-7', level: 1, levelName: 'The Pieces',
    title: 'Setting up the full board', subtitle: 'Beginner · Lesson 7',
    stage: 'All 32 pieces in their correct positions',
    step: 7, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'The starting position',
        content: 'Now we put everything together! The back row from left to right is: Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook. Row 2 is all Pawns. The same on the other side for Black. One key rule: make sure the board is the right way around — there should be a LIGHT square in the bottom-right corner.',
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Set up the board',
        exercises: [
          { id: 'ex1', instruction: 'Set up the complete White back row — all pieces in the correct order.', type: 'full-row', row: 7, tip: 'R-N-B-Q-K-B-N-R from left to right. Queen on her own colour!' },
          { id: 'ex2', instruction: 'Now place all 8 White Pawns on row 2.', type: 'pawn-row', row: 6, tip: 'One Pawn on every single square in row 2, from a2 to h2.' },
          { id: 'ex3', instruction: 'Set up the complete Black back row — mirror of White.', type: 'full-row', row: 0, color: 'black', tip: 'Same order as White: R-N-B-Q-K-B-N-R. Black Queen goes on d8 — a dark square.' },
          { id: 'ex4', instruction: 'Place all 8 Black Pawns on row 7.', type: 'pawn-row', row: 1, color: 'black', tip: 'Row 7 for Black Pawns — one step in front of their back row pieces.' },
          { id: 'ex5', instruction: 'Set up the FULL starting position — all 32 pieces correctly placed.', type: 'full-setup', tip: 'Take your time. Check each piece. Remember the light square in the bottom-right corner!' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Speed setup challenge',
        description: 'Set up the complete starting position as fast as you can. Ms. Momo will time you. Three attempts — beat your personal best!',
        type: 'timed-setup',
        tip: 'Work systematically. Start with the Rooks in the corners, then Knights next to them, then Bishops, then Queen and King, then fill in all the Pawns.',
      },
    ],
    tutorInstruction: "Today we set up the entire board! Remember the back row: Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook. Pawns on row 2. And always check: light square in the bottom-right corner! Let us set up all 32 pieces together.",
    rightPanelNote: "Ms. Momo shows the complete starting position",
    tip: "Back row memory trick: Rooks in corners, Knights ride next to them, Bishops guard the middle, then Queen on her colour and King beside her. Pawns fill row 2!",
    targetPiece: null, targetSquare: null,
  },

  {
    id: 'chess-8', level: 1, levelName: 'The Pieces',
    title: 'How pieces move — Part 1', subtitle: 'Beginner · Lesson 8',
    stage: 'King, Queen and Rook movement in detail',
    step: 8, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Moving around the board',
        content: 'Now all the pieces are on the board, let us learn exactly how they move. The King moves one square in any direction — 8 possible squares from the middle. The Queen moves any number of squares in any direction — she is the most powerful. The Rook moves any number of squares in a straight line — along rows and columns.',
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Move the pieces',
        exercises: [
          { id: 'ex1', instruction: 'The King is on e4. Click all the squares it can move to.', type: 'show-moves', piece: 'K', from: [4,4], tip: 'The King moves one square in any of 8 directions. From the middle it has 8 possible squares.' },
          { id: 'ex2', instruction: 'The Queen is on d4. How many squares can she reach? Click them all.', type: 'show-moves', piece: 'Q', from: [4,3], tip: 'The Queen combines Rook and Bishop movement. From the centre she can reach 27 squares!' },
          { id: 'ex3', instruction: 'The Rook is on a4. Click all the squares it can reach.', type: 'show-moves', piece: 'R', from: [4,0], tip: 'The Rook moves along its whole row AND its whole column. Lots of squares!' },
          { id: 'ex4', instruction: 'Move the Rook from a1 to a8 — but there is a pawn on a4. Can it reach a8?', type: 'blocked-move', answer: false, tip: 'The Rook cannot jump over pieces. The Pawn on a4 blocks it from reaching a8.' },
          { id: 'ex5', instruction: 'The Queen wants to go from d1 to h5. Is there a clear path?', type: 'path-check', tip: 'The Queen can move diagonally! Check if there are any pieces blocking the diagonal from d1 to h5.' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Piece movement quiz',
        description: 'Eight quick-fire questions. For each position shown, click the correct destination square for the piece. Score 6 or more to pass!',
        type: 'movement-quiz',
        tip: 'Think before you click. Remember each piece\'s movement rules. Take your time — accuracy matters more than speed here.',
      },
    ],
    tutorInstruction: "Let us learn how pieces move! Click on any piece and I will show you the squares it can reach highlighted in green. Try the Queen first — she is the most powerful! Then try the Rook and the King.",
    rightPanelNote: "Ms. Momo demonstrates each piece's movement range",
    tip: "The Queen is the most powerful because she combines the Rook (straight lines) and the Bishop (diagonals). From the centre she can reach 27 different squares!",
    targetPiece: null, targetSquare: null,
  },

  {
    id: 'chess-9', level: 1, levelName: 'The Pieces',
    title: 'How pieces move — Part 2', subtitle: 'Beginner · Lesson 9',
    stage: 'Bishop, Knight and Pawn movement in detail',
    step: 9, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'The remaining pieces',
        content: 'Three more pieces to master. The Bishop moves diagonally — any number of squares, but always staying on the same colour. The Knight moves in an L-shape and jumps over pieces. The Pawn moves forward one square (or two on its first move) but captures diagonally. These three pieces have very special movement rules.',
      },
      {
        part: 'exercises', duration: '25 mins', title: 'Move the pieces',
        exercises: [
          { id: 'ex1', instruction: 'The Bishop is on c1. Show all the squares it can reach.', type: 'show-moves', piece: 'B', from: [7,2], tip: 'The Bishop moves diagonally in all four directions. It can travel far but always stays on the same colour.' },
          { id: 'ex2', instruction: 'The Knight is on g1. Show all the squares it can reach.', type: 'show-moves', piece: 'N', from: [7,6], tip: 'The Knight jumps in an L-shape — two then one, or one then two. From g1 it has two possible squares.' },
          { id: 'ex3', instruction: 'The Knight is surrounded by its own pieces. Can it still move?', type: 'move-test', answer: true, piece: 'N', tip: 'Yes! The Knight JUMPS. It can always move unless all landing squares are occupied by friendly pieces.' },
          { id: 'ex4', instruction: 'The Pawn is on e2 — its starting square. Show all the squares it can move to.', type: 'show-moves', piece: 'P', from: [6,4], tip: 'From its starting square a Pawn can move one OR two squares forward. That gives it two move options.' },
          { id: 'ex5', instruction: 'The Pawn is on e5 with an enemy piece on d6. Can the Pawn capture it?', type: 'capture-test', answer: true, tip: 'Yes! Pawns capture diagonally forward. d6 is one square diagonally forward from e5.' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'Movement master challenge',
        description: 'Ten positions. For each one: name the piece, then show all its possible moves. Get 8 out of 10 to earn the Piece Knowledge badge!',
        type: 'master-challenge',
        tip: 'You know all the pieces now. Trust what you have learned. Take your time on each position.',
      },
    ],
    tutorInstruction: "We have three more pieces to master — the Bishop, Knight, and Pawn. Each one has special movement rules. Click on each piece and I will show you exactly where it can go. Pay attention to the Knight — it is the trickiest!",
    rightPanelNote: "Ms. Momo demonstrates Bishop, Knight and Pawn movement",
    tip: "Every piece has its own personality in chess. The Bishop is a long-range diagonal shooter. The Knight is the sneaky jumper. The Pawn is the patient soldier waiting to become a Queen.",
    targetPiece: null, targetSquare: null,
  },

  {
    id: 'chess-10', level: 1, levelName: 'The Pieces',
    title: 'Your very first game', subtitle: 'Beginner · Lesson 10',
    stage: 'Apply everything you have learned in a real game',
    step: 10, totalSteps: 30, duration: '50 minutes',
    parts: [
      {
        part: 'instruction', duration: '10 mins', title: 'Ready to play!',
        content: 'You have learned all six pieces, how they move, and how to set up the board. Now we play a real game! I will play as Black and go easy on you. Remember the three golden rules: One — control the centre squares (e4, d4, e5, d5). Two — develop your pieces early, bring them out. Three — keep your King safe by castling.',
      },
      {
        part: 'exercises', duration: '25 mins', title: 'First game practice',
        exercises: [
          { id: 'ex1', instruction: 'Let us start! Move your pawn to e4 — the best first move in chess.', type: 'guided-move', from: [6,4], to: [4,4], tip: 'Moving the e-pawn two squares to e4 opens lines for both the Queen and the Bishop. It also fights for the centre.' },
          { id: 'ex2', instruction: 'Good! Now bring out a Knight. Move the Knight from g1 to f3.', type: 'guided-move', from: [7,6], to: [5,5], tip: 'Developing pieces means bringing them out from the back row to active squares. The Knight on f3 controls the centre and is well placed.' },
          { id: 'ex3', instruction: 'Develop your Bishop. Move it from f1 to c4.', type: 'guided-move', from: [7,5], to: [4,2], tip: 'The Bishop on c4 points toward the centre and threatens the weak f7 square near the Black King.' },
          { id: 'ex4', instruction: 'Castle your King to safety! Move the King from e1 toward the Rook at h1.', type: 'guided-move', from: [7,4], to: [7,6], tip: 'Castling moves the King two squares toward the Rook, then the Rook jumps to the other side of the King. Your King is now safe!' },
          { id: 'ex5', instruction: 'Now play freely! Continue the game against Ms. Momo using everything you know.', type: 'free-play', tip: 'Look for pieces to develop, control the centre, and watch out for threats. Enjoy your first real game!' },
        ],
      },
      {
        part: 'challenge', duration: '15 mins', title: 'First complete game',
        description: 'Play a complete game against Ms. Momo from start to finish. She will play gently to give you a chance. Whatever happens, you will learn something important.',
        type: 'full-game', difficulty: 'easiest',
        tip: 'The goal of your first game is not to win — it is to practise. Move pieces out early, control the centre, and protect your King. Every game teaches you something new.',
      },
    ],
    tutorInstruction: "You have learned everything about the pieces! Now we play a real game. I will go easy on you. Remember the three golden rules: control the centre, develop your pieces, and keep your King safe. Let us begin! Move your pawn to e4.",
    rightPanelNote: "Ms. Momo plays Black — you play White",
    tip: "The three golden opening rules: 1. Control the centre squares. 2. Develop your pieces — bring them out! 3. Castle your King to safety. Follow these rules and you will always start well.",
    targetPiece: null, targetSquare: null,
  },
];

export default CHESS_LESSONS_EXPANDED;
