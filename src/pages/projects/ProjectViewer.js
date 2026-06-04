import React, { useState } from 'react';
import './ProjectViewer.css';

const DEMO_PROJECTS = {
  'chidera-guessing-game': {
    childName: 'Chidera',
    childAge: 10,
    avatar: '👧',
    title: 'Number Guessing Game',
    subject: 'Coding',
    language: 'Python',
    completedDate: 'June 2026',
    code: `import random

secret = random.randint(1, 10)
guess = int(input("Guess a number between 1 and 10: "))

if guess == secret:
    print("Amazing! You got it!")
elif guess < secret:
    print("Too low! The answer was", secret)
else:
    print("Too high! The answer was", secret)`,
    description: 'Chidera built this game completely from scratch using Python. The program picks a random secret number, asks the player to guess, and tells them if they are too high or too low.',
    stats: { wpm: 42, streak: 7, lessonsComplete: 3 },
  },
};

export default function ProjectViewer({ projectId = 'chidera-guessing-game' }) {
  const project = DEMO_PROJECTS[projectId] || DEMO_PROJECTS['chidera-guessing-game'];
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runDemo() {
    setRunning(true);
    setOutput('');
    await new Promise(r => setTimeout(r, 800));
    setOutput('Guess a number between 1 and 10: \n> 5\nToo low! The answer was 8');
    setRunning(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="project-viewer">
      <header className="pv-header">
        <div className="pv-logo">
          <span className="pv-dot" />
          Talent School Online
        </div>
        <div className="pv-header-right">
          <span className="pv-badge">Student Project</span>
        </div>
      </header>

      <div className="pv-body">
        <div className="pv-hero">
          <div className="pv-child-info">
            <div className="pv-avatar">{project.avatar}</div>
            <div>
              <h1 className="pv-project-title">{project.title}</h1>
              <p className="pv-child-meta">
                Built by <strong>{project.childName}</strong>, age {project.childAge} &nbsp;·&nbsp;
                {project.subject} · {project.language} &nbsp;·&nbsp; {project.completedDate}
              </p>
            </div>
          </div>

          <div className="pv-share-row">
            <button className="pv-share-btn pv-wa" onClick={() => window.open(`https://wa.me/?text=Look what ${project.childName} built! ${window.location.href}`)}>
              📱 Share on WhatsApp
            </button>
            <button className="pv-share-btn" onClick={copyLink}>
              {copied ? '✅ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        </div>

        <div className="pv-desc">{project.description}</div>

        <div className="pv-stats">
          <div className="pv-stat">
            <div className="pv-stat-val">🔥 {project.stats.streak}</div>
            <div className="pv-stat-lbl">Day streak when built</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-val">⌨️ {project.stats.wpm} WPM</div>
            <div className="pv-stat-lbl">Typing speed</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-val">📚 {project.stats.lessonsComplete}</div>
            <div className="pv-stat-lbl">Lessons completed</div>
          </div>
        </div>

        <div className="pv-code-section">
          <div className="pv-code-header">
            <div className="pv-dots">
              <span className="pv-mac-dot" style={{background:'#ff5f57'}} />
              <span className="pv-mac-dot" style={{background:'#ffbd2e'}} />
              <span className="pv-mac-dot" style={{background:'#28ca41'}} />
            </div>
            <span className="pv-filename">main.py — {project.childName}'s code</span>
            <button className="pv-run-btn" onClick={runDemo} disabled={running}>
              {running ? '⏳ Running...' : '▶ Run demo'}
            </button>
          </div>
          <div className="pv-code-body">
            <pre className="pv-code">{project.code}</pre>
          </div>
          {output && (
            <div className="pv-output">
              <div className="pv-output-label">Output</div>
              <pre className="pv-output-text">{output}</pre>
            </div>
          )}
        </div>

        <div className="pv-cta">
          <div className="pv-cta-text">
            <h2>Your child can build this too</h2>
            <p>Talent School Online teaches Nigerian children aged 6–13 Coding, Chess and Typing — guided by Ms. Momo, their AI tutor.</p>
          </div>
          <button className="pv-cta-btn" onClick={() => window.open('https://talent-school-online.pages.dev/register')}>
            Start free today →
          </button>
        </div>
      </div>
    </div>
  );
}
