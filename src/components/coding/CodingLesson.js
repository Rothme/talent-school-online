import React, { useState, useRef } from 'react';
import TopNav from '../layout/TopNav';
import MsMomoBar from '../shared/MsMomoBar';
import { CODING_LESSONS } from '../../data/curriculum';
import './CodingLesson.css';

export default function CodingLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {
  const lesson = CODING_LESSONS[lessonIndex] || CODING_LESSONS[0];
  const [code, setCode] = useState(lesson.starterCode);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  async function runCode() {
    setRunning(true);
    setOutput('');
    setError('');
    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [{ name: 'main.py', content: code }],
          stdin: '',
        }),
      });
      const data = await res.json();
      const out = data.run?.stdout || '';
      const err = data.run?.stderr || '';
      if (err) {
        setError(err);
      } else {
        setOutput(out);
        if (out.trim().includes(lesson.expectedOutput?.trim() || '')) {
          setSuccess(true);
          setTimeout(() => onComplete && onComplete(), 2500);
        }
      }
    } catch (e) {
      setError('Could not connect to code runner. Check your internet connection.');
    }
    setRunning(false);
  }

  function handleTab(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = textareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => { el.selectionStart = el.selectionEnd = start + 4; }, 0);
    }
  }

  const lines = code.split('\n');

  return (
    <div className="coding-lesson">
      <TopNav childName={childName} streak={7} xp={30} backTo="/child/dashboard" />

      <div className="lesson-title-bar">
        <div>
          <h1 className="lesson-main-title">{lesson.title}</h1>
          <p className="lesson-subtitle">{lesson.subtitle} &nbsp;·&nbsp; Python</p>
        </div>
        <div className="step-badge-purple">Step {lesson.step} of {lesson.totalSteps}</div>
      </div>

      <div className="lesson-prog-bar">
        <div className="lesson-prog-fill"
          style={{ width: `${(lesson.step / lesson.totalSteps) * 100}%` }} />
      </div>

      <div className="concept-bar">
        <span className="concept-icon">💡</span>
        <span className="concept-text">{lesson.concept}</span>
      </div>

      <div className="coding-main">
        <div className="editor-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <span className="panel-dot pd-red" />
              <span className="panel-dot pd-amber" />
              <span className="panel-dot pd-green" />
              <span className="panel-title">main.py — your code</span>
            </div>
            <button
              className={`run-btn ${running ? 'run-btn-running' : ''}`}
              onClick={runCode}
              disabled={running}
            >
              {running ? '⏳ Running...' : '▶ Run Code'}
            </button>
          </div>
          <div className="editor-wrap">
            <div className="line-numbers">
              {lines.map((_, i) => (
                <div key={i} className="line-num">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="code-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleTab}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="Code editor"
            />
          </div>
        </div>

        <div className="output-panel">
          <div className="panel-header">
            <div className="panel-header-left">
              <span className="panel-title">
                {success ? '✅ Output — it works!' : error ? '❌ Error' : '▶ Output'}
              </span>
            </div>
            {output && (
              <button className="clear-btn" onClick={() => setOutput('')}>Clear</button>
            )}
          </div>
          <div className="output-body">
            {!output && !error && !running && (
              <div className="output-empty">
                <div className="output-empty-icon">▶</div>
                <div className="output-empty-text">Press Run Code to see your program come alive</div>
              </div>
            )}
            {running && (
              <div className="output-running">
                <div className="running-dots">
                  <span /><span /><span />
                </div>
                <div>Running your code...</div>
              </div>
            )}
            {error && (
              <div className="output-error">
                <div className="error-label">Python says:</div>
                <pre className="error-text">{error}</pre>
                <div className="error-hint">Don't worry — errors help us learn! Read the message carefully and ask Ms. Momo for help.</div>
              </div>
            )}
            {output && !error && (
              <div className={`output-result ${success ? 'output-success' : ''}`}>
                <pre className="output-text">{output}</pre>
                {success && (
                  <div className="success-banner">
                    🎉 Amazing work {childName}! Your program works perfectly!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="target-output-bar">
            <span className="target-label">Expected output:</span>
            <code className="target-code">{lesson.expectedOutput}</code>
          </div>
        </div>
      </div>

      {showHint && (
        <div className="hint-bar">
          💡 {lesson.hint}
        </div>
      )}

      <MsMomoBar
        instruction={lesson.tutorInstruction}
        onHint={() => setShowHint(h => !h)}
        color="#6c63ff"
        nameColor="#a78bfa"
        extraSlot={
          <button className="momo-btn" onClick={() => setCode(lesson.starterCode)}>
            🔄 Reset
          </button>
        }
      />
    </div>
  );
}
