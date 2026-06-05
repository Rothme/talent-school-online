/* eslint-disable */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SubjectPage.css';

const SUBJECTS = {
  chess: {
    id: 'chess',
    name: 'Chess',
    tutor: 'Ms. Momo',
    color: '#1d9e75',
    pale: '#e1f5ee',
    emoji: '♟️',
    tagline: 'The game that teaches children how to think.',
    pillars: ['Strategic Thinking', 'Dedicated Tutor', 'Completion Certificate', 'Self-Paced Learning', 'Weekly Challenges'],
    about: [
      'Chess is one of the oldest and most studied tools for developing the young mind. Unlike video games or passive screen time, chess demands active thinking — every move requires the child to analyse the current situation, anticipate consequences, and plan ahead. These are precisely the cognitive skills that transfer directly into academic performance.',
      'The Talent School Online Chess programme takes a child from absolute beginner — not knowing the name of a single piece — to a confident, strategic player who understands tactics, openings, and endgames. Every lesson is structured in three parts: Ms. Momo explains the concept, the child practises through interactive exercises, and a challenge tests what was just learned.',
      'Research consistently shows that children who study chess perform better in mathematics, reading comprehension, and problem-solving. Chess teaches children to stay calm under pressure, to learn from their mistakes, and to respect the thinking of their opponent. These are life skills that last far beyond the chessboard.',
      'Ms. Momo guides every chess lesson with a warm, encouraging voice. She explains each concept clearly, celebrates every breakthrough, and challenges the child to think deeper with every session. No lesson is ever skipped — each one builds on the last, ensuring no gaps in the child\'s understanding.',
    ],
    levels: [
      {
        name: 'Level 1 — The Pieces',
        lessons: [
          { title: 'Meet the King', detail: 'The most important piece. Identification, placement on e1 and e8, and a timed placement challenge across 5 squares.' },
          { title: 'Meet the Queen', detail: 'The most powerful piece. Starting square, the Queen-on-her-own-colour rule, and a memory placement challenge.' },
          { title: 'The Rook', detail: 'Castle tower movement. Straight-line rules, corner starting squares, and a Rook movement path challenge.' },
          { title: 'The Bishop', detail: 'Diagonal movement only. Colour permanence explained, both Bishops covering all squares, and a colour quiz.' },
          { title: 'The Knight', detail: 'The L-shaped jump. The only piece that can jump over others. Eight-square movement challenge.' },
          { title: 'The Pawn', detail: 'Eight soldiers with special rules. First-move two-square option, diagonal capture, promotion to Queen.' },
          { title: 'Setting up the full board', detail: 'All 32 pieces in starting position. The light-square bottom-right rule. Timed speed setup challenge.' },
          { title: 'How pieces move — Part 1', detail: 'King, Queen and Rook movement in depth. Blocked paths, range, and a movement quiz.' },
          { title: 'How pieces move — Part 2', detail: 'Bishop, Knight and Pawn movement. Special rules reviewed. Master challenge for the Piece Knowledge badge.' },
          { title: 'Your very first game', detail: 'Three golden rules: control the centre, develop pieces, castle early. Guided first game against Ms. Momo.' },
        ],
      },
      {
        name: 'Level 2 — Tactics',
        lessons: [
          { title: 'Check', detail: 'Attacking the King directly. Three ways to escape check: move, block, or capture.' },
          { title: 'Checkmate', detail: 'The winning move. Scholar\'s Mate in four moves — how to use it and how to stop it.' },
          { title: 'The Fork', detail: 'One piece attacks two simultaneously. Knight forks demonstrated with win-material-for-free puzzles.' },
          { title: 'The Pin', detail: 'Immobilising pieces. Absolute pin against the King vs relative pin against the Queen.' },
          { title: 'The Skewer', detail: 'The reverse pin. Attack the valuable piece first, capture what hides behind it.' },
          { title: 'Discovered Attack', detail: 'Move one piece to reveal an attack by the piece behind it. Double-threat creation.' },
          { title: 'Opening Principles', detail: 'Three golden rules in depth. Centre control, piece development, King safety. Italian Opening demonstrated.' },
          { title: 'Castling', detail: 'The King and Rook special move. Kingside and queenside castling rules and restrictions.' },
          { title: 'Pawn Structure', detail: 'Doubled, isolated and passed pawns. Why pawn decisions are permanent.' },
          { title: 'Piece Coordination', detail: 'Pieces working as a team. Batteries, coordination patterns and attacking together.' },
        ],
      },
      {
        name: 'Level 3 — Strategy and Mastery',
        lessons: [
          { title: 'Back Rank Mate', detail: 'King trapped by own pawns. Recognition, execution and prevention.' },
          { title: 'The Sicilian Defence', detail: 'The most popular opening in chess. Black fights for the centre with c5.' },
          { title: 'King and Pawn Endgame', detail: 'The King becomes an active fighter. Opposition concept and winning technique.' },
          { title: 'Rook Endgames', detail: 'The most common endgame. Lucena and Philidor positions. Rook on the seventh rank.' },
          { title: 'Calculation and Planning', detail: 'Seeing moves ahead. Progressively deeper puzzles. Think before you move.' },
          { title: 'Defensive Techniques', detail: 'Escaping bad positions. Trading attackers, creating counterplay, building a fortress.' },
          { title: 'Nigerian Chess Champions', detail: 'Study games by Nigerian champions. Chess is growing in Nigeria — the next champion could be you.' },
          { title: 'Building an Attack', detail: 'Systematic attacking build-up. Targets, piece coordination, multiple threats, decisive blow.' },
          { title: 'Tournament Preparation', detail: 'Time management, avoiding blunders, staying calm. Mental skills for competitive play.' },
          { title: 'Your Best Game', detail: 'Final lesson. Play against Ms. Momo at medium strength with everything you have learned.' },
        ],
      },
    ],
  },

  coding: {
    id: 'coding',
    name: 'Coding',
    tutor: 'Mr. Patrick',
    color: '#6c63ff',
    pale: '#eeedfe',
    emoji: '💻',
    tagline: 'Every great builder started by writing their first line of code.',
    pillars: ['Real Projects', 'Dedicated Tutor', 'Shareable Portfolio', 'Self-Paced Learning', 'Weekly Challenges'],
    about: [
      'Coding is the literacy of the 21st century. A child who understands how to write code understands how the digital world around them actually works — and more importantly, understands that they can build it, change it, and improve it. This is a fundamentally different relationship with technology than passive consumption.',
      'The Talent School Online Coding programme takes a complete beginner from their very first print("Hello, Nigeria!") all the way through Python fundamentals, real project builds, web development with HTML and CSS, and interactive JavaScript applications. By the end of the programme every student has a portfolio of working projects with live shareable links.',
      'Mr. Patrick guides every coding lesson with energy, encouragement and practical clarity. He explains every concept in plain language, celebrates every working program, and challenges the child to build something slightly harder each week. When a child\'s code has a bug, Mr. Patrick explains exactly what went wrong and why — turning every error into a learning moment.',
      'Nigerian children are already proving themselves as world-class engineers, developers and technology entrepreneurs. The tools they need to compete globally are not expensive or exclusive — they are a laptop, an internet connection, and a structured programme that teaches them properly from the beginning. That is exactly what this programme provides.',
    ],
    levels: [
      {
        name: 'Level 1 — Python Foundations',
        lessons: [
          { title: 'Your first program', detail: 'print() function. Hello Nigeria. Running the first program and seeing output on screen.' },
          { title: 'Variables — storing information', detail: 'Named boxes for text and numbers. String vs integer variables. Multiple print statements.' },
          { title: 'Getting input from the user', detail: 'input() function. Interactive programs. Storing user responses in variables.' },
          { title: 'Numbers and maths', detail: 'Addition, subtraction, multiplication, division operators. Calculator programs.' },
          { title: 'If statements — making decisions', detail: 'Decision making. Conditions, comparison operators, colons and indentation.' },
          { title: 'If and else', detail: 'Two-outcome decisions. True path and false path. Complete decision coverage.' },
          { title: 'elif — multiple choices', detail: 'Grade calculator with multiple bands. if/elif/elif/else chains. Order matters.' },
          { title: 'While loops — repeat actions', detail: 'Repeat while condition is true. Counter variable. Preventing infinite loops.' },
          { title: 'For loops — counting made easy', detail: 'Counting sequences automatically with range(). Cleaner counting than while loops.' },
          { title: 'Project: Guessing Game', detail: 'First complete shareable project. Random numbers, input conversion, full game logic.' },
        ],
      },
      {
        name: 'Level 2 — Building Things',
        lessons: [
          { title: 'Functions', detail: 'Reusable blocks of code. def keyword, calling functions, organising programs.' },
          { title: 'Function parameters', detail: 'Passing information into functions. Arguments, parameters and flexible reusable code.' },
          { title: 'Return values', detail: 'Functions that give back results. return keyword. Using results in further calculations.' },
          { title: 'Lists', detail: 'Storing multiple items. Indexing from zero. Appending, removing, accessing items.' },
          { title: 'List operations', detail: 'len(), append(), remove(), sort(). Looping through lists with for.' },
          { title: 'Strings in depth', detail: 'upper(), lower(), len(), split(). String indexing and concatenation.' },
          { title: 'Dictionaries', detail: 'Key-value pairs. Adding, accessing and updating data. Real-world data modelling.' },
          { title: 'Nested data structures', detail: 'Lists of dictionaries. Dictionaries of lists. Complex data organisation.' },
          { title: 'Error handling', detail: 'try/except blocks. Graceful error messages. Making programs robust.' },
          { title: 'Project: Quiz Game', detail: 'Shareable project. Score tracking, question bank, multiple choice, final results display.' },
        ],
      },
      {
        name: 'Level 3 — Real Projects',
        lessons: [
          { title: 'Importing modules', detail: 'import statement. random, math, datetime. Using Python\'s built-in libraries.' },
          { title: 'String formatting', detail: 'f-strings for precise output. Professional program presentation.' },
          { title: 'Simple algorithms', detail: 'Sorting and searching in code. Bubble sort concept. Linear search.' },
          { title: 'Problem decomposition', detail: 'Breaking big problems into small ones. Planning before coding. Pseudocode.' },
          { title: 'Debugging skills', detail: 'Reading error messages. Print debugging. Systematic problem solving.' },
          { title: 'Project: Rock Paper Scissors', detail: 'Shareable project. Full game with score tracking, input validation, play-again loop.' },
          { title: 'Project: Text Adventure Game', detail: 'Shareable project. Story-driven game with choices, inventory, multiple endings.' },
          { title: 'Project: Score Tracker App', detail: 'Shareable project. Class scores, averages, highest/lowest, formatted report.' },
          { title: 'Project: Simple Chatbot', detail: 'Shareable project. Pattern matching, responses, Nigerian cultural knowledge base.' },
          { title: 'Python portfolio review', detail: 'Consolidation of all Python skills. Every completed project reviewed and published.' },
        ],
      },
      {
        name: 'Level 4 — Web Development',
        lessons: [
          { title: 'HTML structure', detail: 'html, head, body tags. Headings, paragraphs, links, images. Web page anatomy.' },
          { title: 'HTML forms and layout', detail: 'Forms, inputs, buttons. Tables, divs. Building a complete structured web page.' },
          { title: 'CSS — styling web pages', detail: 'Colours, fonts, spacing, backgrounds. Classes and IDs. Making pages beautiful.' },
          { title: 'Project: Personal profile page', detail: 'Shareable project. Complete personal web page with bio, photo placeholder and interests.' },
          { title: 'JavaScript basics', detail: 'Variables, functions and events in JS. onclick handlers. Alert and prompt.' },
          { title: 'DOM manipulation', detail: 'document.getElementById(). Changing page content live. Interactive elements.' },
          { title: 'Project: Interactive quiz website', detail: 'Shareable project. HTML/CSS/JS quiz with score tracking, feedback and timer.' },
          { title: 'Final capstone project', detail: 'Shareable project. Complete interactive website designed and built entirely by the student.' },
        ],
      },
    ],
  },

  typing: {
    id: 'typing',
    name: 'Typing',
    tutor: 'Ms. Lola',
    color: '#ba7517',
    pale: '#faeeda',
    emoji: '⌨️',
    tagline: 'In a world that runs on keyboards, fast fingers open every door.',
    pillars: ['Touch Typing', 'Dedicated Tutor', 'Typing Certificate', 'Self-Paced Learning', 'Personal Best Challenges'],
    about: [
      'Typing is one of the most underrated skills a young person can develop. In every professional environment — medicine, law, engineering, business, journalism, government — the ability to type quickly and accurately saves hours every single week. A person who types at 65 words per minute produces in one hour what a 30 WPM typist produces in two. Over a career, that difference is enormous.',
      'The Talent School Online Typing programme teaches proper touch typing from the very beginning — fingers on the home row, eyes on the screen, returning to the home position after every keystroke. Children who learn this way build genuine muscle memory, not the two-finger hunting style that becomes a habit and is very difficult to unlearn.',
      'Ms. Lola guides every typing lesson with a steady, rhythmic voice that naturally models the pacing a good typist develops. She introduces keys one by one, drills combinations, and builds up to full-length passages. Every passage is drawn from Nigerian history and culture — children type the stories of Queen Amina of Zaria, the Benin bronzes, the fishermen of Lagos, and the scholars of Timbuktu.',
      'By the end of the programme, students who have completed all 40 lessons will qualify to attempt the Talent School Online Typing Certificate — requiring 60 words per minute at 97% accuracy or above. This is a genuine credential that can be displayed on any portfolio, school application or CV.',
    ],
    levels: [
      {
        name: 'Level 1 — Home Row Mastery',
        lessons: [
          { title: 'Meet the home row', detail: 'Finger placement on A S D F G H J K L. The foundation of all touch typing. Individual keys and short combinations.' },
          { title: 'Home row words', detail: 'Real words using only home row keys. Rhythm building. Eyes on screen, not hands.' },
          { title: 'Home row sentences', detail: 'Full sentences using home row. Focus on returning fingers to home position after every keystroke.' },
          { title: 'Top row — left hand', detail: 'Q W E R T introduced. Reach up from home, press, return immediately.' },
          { title: 'Top row — right hand', detail: 'Y U I O P introduced. Right hand stretch from home row.' },
          { title: 'Full top row together', detail: 'Both hands working the complete top row. Common words and sentences.' },
          { title: 'Bottom row — left hand', detail: 'Z X C V B introduced. Reach down from home row and return.' },
          { title: 'Bottom row — right hand', detail: 'N M introduced. Right-side bottom row combined with all previous letters.' },
          { title: 'Full alphabet typing', detail: 'All letters together. Famous pangrams and Nigerian vocabulary. The quick brown fox and beyond.' },
          { title: 'Capital letters and Shift', detail: 'Shift key technique. Nigerian names and cities as practice material.' },
        ],
      },
      {
        name: 'Level 2 — Full Board',
        lessons: [
          { title: 'Numbers — top row', detail: 'Keys 1–0 introduced with Nigerian statistics, historical dates and population figures.' },
          { title: 'Punctuation — full stop and comma', detail: 'Most common punctuation. Nigerian city lists and story sentences.' },
          { title: 'Question marks and apostrophes', detail: 'Shift combinations. Conversational Nigerian English exercises.' },
          { title: 'Nigerian names and words', detail: 'Yoruba, Igbo, Hausa names. Jollof rice, suya, egusi, pounded yam vocabulary.' },
          { title: 'Speed building — short bursts', detail: 'High-frequency English words drilled for speed. Common word patterns.' },
          { title: 'The brave tortoise — full story', detail: 'Complete Nigerian folktale typed as continuous passages.' },
          { title: 'Ile-Ife — the ancient city', detail: 'Story of the Yoruba founding myth typed as a full continuous passage.' },
          { title: 'Email and message format', detail: 'Professional email format. Nigerian names, addresses, formal language.' },
          { title: 'Code typing — Python basics', detail: 'Typing code: brackets, quotes, colons, indentation. Preparation for coding lessons.' },
          { title: 'Speed target — 25 WPM', detail: 'First speed milestone. Timed paragraphs targeting 25 words per minute, 92% accuracy.' },
          { title: 'Amina of Zaria — her story', detail: 'Full story of Queen Amina typed as a continuous extended passage.' },
          { title: 'Paragraph typing', detail: 'Extended multi-sentence paragraphs on chess, African scholarship and the digital economy.' },
          { title: 'Sango and the thunder', detail: 'Complete Sango mythology story typed as a flowing continuous passage.' },
          { title: 'Speed target — 35 WPM', detail: 'Second speed milestone. Professional vocabulary paragraphs at 35 WPM, 93% accuracy.' },
          { title: 'Level 2 mastery test', detail: 'Four long paragraphs of increasing complexity. Nigeria, computing, chess, future of education.' },
        ],
      },
      {
        name: 'Level 3 — Speed Master',
        lessons: [
          { title: 'Speed target — 45 WPM', detail: 'Level 3 opens with a speed challenge. Muscle memory and automatic finger movement.' },
          { title: 'The Benin bronzes — full story', detail: '12-exercise passage covering the complete story of the Benin bronzes.' },
          { title: 'Speed target — 55 WPM', detail: 'Professional threshold. Fast typing with sustained accuracy.' },
          { title: 'A girl who counted stars', detail: 'Complete story of Aondover from Benue State. 13 exercises. Longest single passage.' },
          { title: 'Accuracy challenge — zero errors', detail: 'Speed paused. Every exercise typed with zero errors. Quality before quantity.' },
          { title: 'Speed target — 60 WPM', detail: 'Elite territory. One word per second. Extended sentences with complex vocabulary.' },
          { title: 'The Niger Delta — full passage', detail: '12-exercise passage on Niger Delta history, people, ecology and resilience.' },
          { title: 'Professional documents', detail: 'Complete job application letter typed in full. Real-world professional document format.' },
          { title: 'Speed target — 65 WPM', detail: 'Certificate qualifying speed. Push everything. Motivational and historical passages.' },
          { title: 'African scholars — full passage', detail: '13-exercise passage on African intellectual tradition from Timbuktu to Wole Soyinka.' },
          { title: 'Personal best challenge', detail: 'Type each passage as fast as possible with 95% accuracy. Score saved to student profile.' },
          { title: 'Blind typing test', detail: 'Keyboard diagram hidden. All typing from finger memory. True touch typing mastery.' },
          { title: 'Speed competition mode', detail: '2-minute maximum word count challenge. Competition format at maximum speed.' },
          { title: 'Certificate qualifying test — Part 1', detail: 'Three long academic paragraphs. Must achieve 60 WPM / 97% accuracy to qualify.' },
          { title: 'Certificate qualifying test — Part 2', detail: 'Final certification. Women of Nigeria passage and reflective conclusion. Certificate awarded.' },
        ],
      },
    ],
  },
};

export default function SubjectPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const data = SUBJECTS[subject];
  const [openLevel, setOpenLevel] = useState(0);
  const [openLesson, setOpenLesson] = useState(null);

  if (!data) {
    navigate('/');
    return null;
  }

  return (
    <div className="sp-page">

      <nav className="sp-nav">
        <div className="sp-nav-logo" onClick={() => navigate('/')}>
          <span className="sp-nav-dot" />Talent School Online
        </div>
        <div className="sp-nav-links">
          <span className="sp-nav-link" onClick={() => navigate('/')}>Home</span>
          <span className="sp-nav-link" onClick={() => navigate('/subject/chess')}>Chess</span>
          <span className="sp-nav-link" onClick={() => navigate('/subject/coding')}>Coding</span>
          <span className="sp-nav-link" onClick={() => navigate('/subject/typing')}>Typing</span>
          <button className="sp-nav-cta" onClick={() => navigate('/register')}>
            Enrol free today
          </button>
        </div>
      </nav>

      <div className="sp-hero" style={{ background: data.color }}>
        <div className="sp-hero-emoji">{data.emoji}</div>
        <h1 className="sp-hero-title">{data.name}</h1>
        <p className="sp-hero-tagline">{data.tagline}</p>
        <div className="sp-hero-tutor">
          Taught by <strong>{data.tutor}</strong> · Ages 6–13
        </div>
      </div>

      <div className="sp-pillars">
        {data.pillars.map((p, i) => (
          <div key={i} className="sp-pillar" style={{ color: data.color }}>
            <span className="sp-pillar-check" style={{ background: data.pale, color: data.color }}>✓</span>
            {p}
          </div>
        ))}
      </div>

      <div className="sp-body">

        <div className="sp-about">
          <h2 className="sp-about-title">About the Programme</h2>
          {data.about.map((para, i) => (
            <p key={i} className="sp-about-para">{para}</p>
          ))}
          <button className="sp-enrol-btn" style={{ background: data.color }}
            onClick={() => navigate('/register')}>
            Enrol your child free today →
          </button>
        </div>

        <div className="sp-syllabus">
          <h2 className="sp-syllabus-title">Syllabus</h2>
          {data.levels.map((level, li) => (
            <div key={li} className="sp-level">
              <button
                className={`sp-level-header ${openLevel === li ? 'sp-level-open' : ''}`}
                style={openLevel === li ? { background: data.color, color: '#fff', borderColor: data.color } : {}}
                onClick={() => setOpenLevel(openLevel === li ? null : li)}
              >
                <span>{level.name}</span>
                <span className="sp-level-chevron">{openLevel === li ? '▲' : '▼'}</span>
              </button>

              {openLevel === li && (
                <div className="sp-lessons">
                  {level.lessons.map((lesson, lj) => (
                    <div key={lj} className="sp-lesson">
                      <button
                        className={`sp-lesson-header ${openLesson === `${li}-${lj}` ? 'sp-lesson-open' : ''}`}
                        style={openLesson === `${li}-${lj}` ? { color: data.color } : {}}
                        onClick={() => setOpenLesson(openLesson === `${li}-${lj}` ? null : `${li}-${lj}`)}
                      >
                        <span className="sp-lesson-num" style={{ background: data.pale, color: data.color }}>
                          {lj + 1}
                        </span>
                        <span className="sp-lesson-title">{lesson.title}</span>
                        <span className="sp-lesson-chevron">{openLesson === `${li}-${lj}` ? '▲' : '▼'}</span>
                      </button>
                      {openLesson === `${li}-${lj}` && (
                        <div className="sp-lesson-detail" style={{ borderLeftColor: data.color }}>
                          {lesson.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="sp-cta" style={{ background: data.color }}>
        <h2 className="sp-cta-title">Ready to start {data.name}?</h2>
        <p className="sp-cta-sub">
          First week completely free. {data.tutor} is ready to teach your child.
          Every child starts from the beginning and progresses at their own pace.
        </p>
        <button className="sp-cta-btn" onClick={() => navigate('/register')}>
          Enrol free — first week on us →
        </button>
        <p className="sp-cta-small">No commitment. Cancel anytime. ₦3,500/month after free week.</p>
      </div>

      <footer className="sp-footer">
        <div className="sp-footer-logo" onClick={() => navigate('/')}>
          <span className="sp-nav-dot" />Talent School Online
        </div>
        <div className="sp-footer-links">
          <span onClick={() => navigate('/subject/chess')}>Chess</span>
          <span onClick={() => navigate('/subject/coding')}>Coding</span>
          <span onClick={() => navigate('/subject/typing')}>Typing</span>
          <span onClick={() => navigate('/login')}>Parent login</span>
          <span onClick={() => navigate('/child/login')}>Student login</span>
        </div>
        <div className="sp-footer-tag">Where African children learn tomorrow's skills today.</div>
      </footer>

    </div>
  );
}
