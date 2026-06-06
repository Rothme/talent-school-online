/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CODING_LESSONS, CODING_LESSONS_EXTENDED } from '../../data/curriculum';
import './CodingLesson.css';

const ALL_CODING = [...CODING_LESSONS, ...CODING_LESSONS_EXTENDED];

// ── Language detection ─────────────────────────────────────────
function getLang(lesson) {
  return lesson?.language || 'python';
}

// ── Auto-voice ─────────────────────────────────────────────────
function speak(text) {
  if (!text) return;
  window.speechSynthesis?.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92; u.pitch = 1.05; u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const pref = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|victoria|karen/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en'))
    || voices[0];
  if (pref) u.voice = pref;
  window.speechSynthesis.speak(u);
}

// ── Piston code runner ─────────────────────────────────────────
async function runPython(code, stdin = '') {
  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: 'python', version: '3.10.0',
      files: [{ name: 'main.py', content: code }],
      stdin,
    }),
  });
  const data = await res.json();
  return { stdout: data.run?.stdout || '', stderr: data.run?.stderr || '' };
}

// ── HTML/CSS/JS iframe renderer ────────────────────────────────
function buildHtmlDoc(code) {
  // If code contains <html, render as-is. Otherwise wrap it.
  if (code.toLowerCase().includes('<html')) return code;
  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<style>body{font-family:Arial,sans-serif;padding:16px;margin:0;}</style>
</head><body>${code}</body></html>`;
}

// ─────────────────────────────────────────────────────────────
// TUTOR BAR — Mr. Patrick
// ─────────────────────────────────────────────────────────────
function TutorBar({ text, isVoiceOn, onToggleVoice }) {
  return (
    <div className="cl-tutor-bar">
      <div className="cl-tutor-avatar">👨🏾‍💻</div>
      <div className="cl-tutor-bubble">
        <div className="cl-tutor-name">Mr. Patrick</div>
        <p className="cl-tutor-text">{text || 'Ready when you are!'}</p>
      </div>
      <button
        className={`cl-voice-btn ${isVoiceOn ? 'cl-voice-on' : ''}`}
        onClick={onToggleVoice}
        title={isVoiceOn ? 'Mute voice' : 'Enable voice'}
      >
        {isVoiceOn ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PYTHON EDITOR PANEL
// ─────────────────────────────────────────────────────────────
function PythonEditor({ code, onChange, onRun, running, readOnly = false }) {
  const ref = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = ref.current;
      const s = el.selectionStart, en = el.selectionEnd;
      const next = code.substring(0, s) + '    ' + code.substring(en);
      onChange(next);
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + 4; }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onRun?.(); }
  }

  return (
    <div className="cl-editor-wrap">
      <div className="cl-editor-topbar">
        <span className="cl-lang-badge">🐍 Python</span>
        <span className="cl-editor-hint">Ctrl+Enter to run</span>
      </div>
      <textarea
        ref={ref}
        className="cl-code-area"
        value={code}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        readOnly={readOnly}
      />
      {onRun && (
        <div className="cl-editor-footer">
          <button className="cl-run-btn" onClick={onRun} disabled={running}>
            {running ? '⏳ Running...' : '▶ Run Code'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HTML/CSS/JS EDITOR PANEL
// ─────────────────────────────────────────────────────────────
function WebEditor({ code, onChange, onRun }) {
  const ref = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = ref.current;
      const s = el.selectionStart, en = el.selectionEnd;
      const next = code.substring(0, s) + '    ' + code.substring(en);
      onChange(next);
      setTimeout(() => { el.selectionStart = el.selectionEnd = s + 4; }, 0);
    }
  }

  // Detect language from content
  const hasJS = code.includes('<script') || code.includes('function ') || code.includes('const ') || code.includes('let ');
  const hasCSS = code.includes('<style') || code.includes('{') && code.includes(':');
  const langLabel = hasJS ? '🌐 HTML / CSS / JS' : hasCSS ? '🌐 HTML / CSS' : '🌐 HTML';

  return (
    <div className="cl-editor-wrap">
      <div className="cl-editor-topbar">
        <span className="cl-lang-badge cl-lang-web">{langLabel}</span>
        <span className="cl-editor-hint">Click Preview to see your page</span>
      </div>
      <textarea
        ref={ref}
        className="cl-code-area cl-code-web"
        value={code}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      <div className="cl-editor-footer">
        <button className="cl-run-btn cl-run-web" onClick={onRun}>
          👁 Preview Page
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BLOCKLY EDITOR PANEL (Level A1 — visual blocks)
// ─────────────────────────────────────────────────────────────
function BlocklyEditor({ task, onTaskComplete }) {
  // Simplified visual block representation
  // In production, replace the inner content with actual Blockly.js workspace
  const [placed, setPlaced] = useState([]);
  const blocks = [
    { id: 'start',   label: 'When 🚩 clicked',       color: '#ffab19' },
    { id: 'say',     label: 'Say "Hello World!"',     color: '#9966ff' },
    { id: 'move',    label: 'Move 10 steps',          color: '#4C97FF' },
    { id: 'repeat',  label: 'Repeat 10 times',        color: '#FFAB19' },
    { id: 'if',      label: 'If touching edge?',      color: '#FFAB19' },
    { id: 'bounce',  label: 'If on edge, bounce',     color: '#4C97FF' },
    { id: 'wait',    label: 'Wait 0.5 seconds',       color: '#9966ff' },
    { id: 'colour',  label: 'Change colour effect',   color: '#59C059' },
  ];

  function addBlock(block) {
    setPlaced(p => [...p, { ...block, uid: Date.now() + Math.random() }]);
  }
  function removeBlock(uid) {
    setPlaced(p => p.filter(b => b.uid !== uid));
  }

  const hasStart  = placed.some(b => b.id === 'start');
  const hasAction = placed.some(b => ['say','move','repeat','bounce'].includes(b.id));
  const canRun = hasStart && hasAction;

  return (
    <div className="cl-blockly-wrap">
      <div className="cl-blockly-topbar">
        <span className="cl-lang-badge cl-lang-blocks">🧩 Block Coding</span>
        <span className="cl-editor-hint">Drag blocks to build your program</span>
      </div>
      <div className="cl-blockly-main">
        {/* Block palette */}
        <div className="cl-block-palette">
          <div className="cl-palette-title">Blocks</div>
          {blocks.map(b => (
            <div key={b.id} className="cl-palette-block" style={{ background: b.color }}
              onClick={() => addBlock(b)}>
              {b.label}
            </div>
          ))}
        </div>
        {/* Script area */}
        <div className="cl-script-area">
          <div className="cl-script-title">My Program</div>
          {placed.length === 0 && (
            <div className="cl-script-empty">Click blocks on the left to add them here</div>
          )}
          {placed.map(b => (
            <div key={b.uid} className="cl-placed-block" style={{ background: b.color }}>
              <span>{b.label}</span>
              <button className="cl-block-remove" onClick={() => removeBlock(b.uid)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      <div className="cl-editor-footer">
        <button
          className={`cl-run-btn ${!canRun ? 'cl-run-disabled' : ''}`}
          onClick={() => canRun && onTaskComplete?.({ placed })}
          disabled={!canRun}
        >
          {canRun ? '▶ Run Program' : 'Add a start block first'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OUTPUT PANEL
// ─────────────────────────────────────────────────────────────
function OutputPanel({ type, output, error, success, htmlDoc, running, lesson }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (type === 'web' && htmlDoc && iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) { doc.open(); doc.write(htmlDoc); doc.close(); }
    }
  }, [htmlDoc, type]);

  return (
    <div className="cl-output-panel">
      <div className="cl-output-topbar">
        <span className="cl-output-title">
          {type === 'web' ? '👁 Preview' : '📤 Output'}
        </span>
        {success && <span className="cl-output-success-badge">✅ Complete!</span>}
      </div>

      {type === 'web' ? (
        <iframe
          ref={iframeRef}
          className="cl-web-preview"
          title="Web Preview"
          sandbox="allow-scripts"
        />
      ) : (
        <div className="cl-output-body">
          {running && (
            <div className="cl-output-running">
              <div className="cl-spinner" />
              <span>Running your code...</span>
            </div>
          )}
          {!running && !output && !error && !success && (
            <div className="cl-output-empty">
              <div className="cl-output-idle">▶ Run your code to see the output here</div>
              {lesson?.tutorInstruction && (
                <div className="cl-output-tip">
                  <strong>💡 Tip:</strong> {lesson.tutorInstruction}
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="cl-output-error">
              <div className="cl-error-label">⚠️ Error</div>
              <pre className="cl-error-text">{error}</pre>
              <div className="cl-error-help">
                Read the error message carefully — Python always tells you which line has the problem.
              </div>
            </div>
          )}
          {output && !error && (
            <div className={`cl-output-result ${success ? 'cl-output-win' : ''}`}>
              {success && <div className="cl-win-banner">🎉 Excellent work!</div>}
              <pre className="cl-output-text">{output}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LESSON PROGRESS BAR
// ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total, color = '#6c63ff' }) {
  const pct = total > 0 ? Math.round((step / total) * 100) : 0;
  return (
    <div className="cl-progress-wrap">
      <div className="cl-progress-track">
        <div className="cl-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="cl-progress-label">Lesson {step} of {total}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LESSON COMPLETE SCREEN
// ─────────────────────────────────────────────────────────────
function LessonComplete({ lesson, childName, onContinue }) {
  useEffect(() => {
    speak(`Amazing work ${childName}! You completed ${lesson.title}. You are becoming a real programmer!`);
  }, []);

  return (
    <div className="cl-complete-screen">
      <div className="cl-complete-card">
        <div className="cl-complete-icon">🏆</div>
        <h2 className="cl-complete-title">Lesson Complete!</h2>
        <p className="cl-complete-subtitle">{lesson.title}</p>
        <p className="cl-complete-msg">
          Well done {childName}! You wrote real code and made it run.
          Every professional programmer started exactly where you are right now.
        </p>
        {lesson.concept && (
          <div className="cl-complete-concept">
            <strong>What you learned:</strong> {lesson.concept}
          </div>
        )}
        <button className="cl-complete-btn" onClick={onContinue}>
          Continue to next lesson →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN CodingLesson COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CodingLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {
  const lesson = ALL_CODING[lessonIndex] || ALL_CODING[0];
  const lang   = getLang(lesson);
  const isWeb   = lang === 'html';
  const isBlock = lang === 'blocks';

  // ── State ──────────────────────────────────────────────────
  const [code,      setCode]      = useState(lesson.starterCode || '');
  const [output,    setOutput]    = useState('');
  const [error,     setError]     = useState('');
  const [running,   setRunning]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [htmlDoc,   setHtmlDoc]   = useState('');
  const [showHint,  setShowHint]  = useState(false);
  const [voiceOn,   setVoiceOn]   = useState(true);
  const [attempts,  setAttempts]  = useState(0);
  const [done,      setDone]      = useState(false);
  const hasSpokeRef = useRef(false);

  // Reset when lesson changes
  useEffect(() => {
    setCode(lesson.starterCode || '');
    setOutput(''); setError(''); setRunning(false);
    setSuccess(false); setHtmlDoc(''); setShowHint(false);
    setAttempts(0); setDone(false); hasSpokeRef.current = false;
  }, [lessonIndex]);

  // Auto-play voice on load
  useEffect(() => {
    if (voiceOn && !hasSpokeRef.current && lesson.tutorInstruction) {
      hasSpokeRef.current = true;
      const timer = setTimeout(() => speak(lesson.tutorInstruction), 600);
      return () => clearTimeout(timer);
    }
  }, [lessonIndex, voiceOn]);

  // ── Run Python code ────────────────────────────────────────
  async function handleRunPython() {
    if (running) return;
    setRunning(true); setOutput(''); setError(''); setSuccess(false);
    setAttempts(a => a + 1);
    try {
      const { stdout, stderr } = await runPython(code);
      if (stderr) {
        setError(stderr);
        if (voiceOn) speak('There is an error in your code. Read the message carefully — it tells you exactly which line has the problem.');
      } else {
        setOutput(stdout);
        const expected = lesson.expectedOutput?.trim() || '';
        const isCorrect = expected
          ? stdout.trim().includes(expected) || stdout.trim().startsWith(expected.split('\n')[0])
          : stdout.trim().length > 0;

        if (isCorrect) {
          setSuccess(true);
          if (voiceOn) speak(`Excellent work ${childName}! Your code ran perfectly!`);
          setTimeout(() => setDone(true), 2000);
        } else {
          if (voiceOn && attempts >= 1) speak('Good try! Check the output — does it match what was expected? Look at the hint if you need help.');
        }
      }
    } catch {
      setError('Could not connect to the code runner. Please check your internet connection and try again.');
    }
    setRunning(false);
  }

  // ── Render web preview ─────────────────────────────────────
  function handlePreviewWeb() {
    setHtmlDoc(buildHtmlDoc(code));
    // Check for minimum expected content
    const hasContent = code.trim().length > 50;
    if (hasContent) {
      setSuccess(true);
      if (voiceOn) speak(`Great work ${childName}! Your webpage is live in the preview panel. Look at what you built!`);
      setTimeout(() => setDone(true), 3000);
    }
  }

  // ── Block program complete ─────────────────────────────────
  function handleBlockComplete({ placed }) {
    setSuccess(true);
    setOutput(`Program built with ${placed.length} blocks!\nBlocks used: ${placed.map(b => b.label).join(', ')}`);
    if (voiceOn) speak(`Well done ${childName}! You built a program with ${placed.length} blocks. That is real coding!`);
    setTimeout(() => setDone(true), 2500);
  }

  // ── Tutor voice message ────────────────────────────────────
  const tutorText = lesson.tutorInstruction || `Write your ${isWeb ? 'HTML' : isBlock ? 'block program' : 'Python code'} in the editor, then run it to see the output.`;

  // ── Level colour ───────────────────────────────────────────
  const levelColors = { 1: '#1d9e75', 2: '#6c63ff', 3: '#ba7517', 4: '#0e8c72', 5: '#d4580a', 6: '#1565c0' };
  const levelColor  = levelColors[lesson.level] || '#6c63ff';

  // ── Show complete screen ───────────────────────────────────
  if (done) {
    return <LessonComplete lesson={lesson} childName={childName} onContinue={() => onComplete?.()} />;
  }

  return (
    <div className="cl-root">

      {/* ── Top bar ── */}
      <div className="cl-topbar" style={{ borderBottom: `2px solid ${levelColor}` }}>
        <div className="cl-topbar-left">
          <div className="cl-lesson-title">{lesson.title}</div>
          <div className="cl-lesson-meta">
            {lesson.subtitle} · <span style={{ color: levelColor, fontWeight: 800 }}>{lesson.levelName}</span>
          </div>
        </div>
        <ProgressBar step={lesson.step || lessonIndex + 1} total={lesson.totalSteps || ALL_CODING.length} color={levelColor} />
      </div>

      {/* ── Three-panel body ── */}
      <div className="cl-panels">

        {/* LEFT — Tutor's board */}
        <div className="cl-panel cl-panel-tutor">
          <div className="cl-panel-header" style={{ background: levelColor }}>
            <span>👨🏾‍💻 Mr. Patrick's Board</span>
          </div>
          <div className="cl-panel-body">
            <PythonEditor
              code={lesson.targetCode || lesson.starterCode || '# Mr. Patrick will show code here'}
              onChange={() => {}}
              readOnly={true}
            />
          </div>
        </div>

        {/* CENTRE — Student's editor */}
        <div className="cl-panel cl-panel-student">
          <div className="cl-panel-header" style={{ background: '#1a1a2e' }}>
            <span>✏️ Your Editor — {childName}</span>
          </div>
          <div className="cl-panel-body">
            {isBlock ? (
              <BlocklyEditor
                task={lesson.studentTask}
                onTaskComplete={handleBlockComplete}
              />
            ) : isWeb ? (
              <WebEditor
                code={code}
                onChange={setCode}
                onRun={handlePreviewWeb}
              />
            ) : (
              <PythonEditor
                code={code}
                onChange={setCode}
                onRun={handleRunPython}
                running={running}
              />
            )}
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="cl-panel cl-panel-output">
          <div className="cl-panel-header" style={{ background: '#0d0d2b' }}>
            <span>{isWeb ? '👁 Preview' : '📤 Output'}</span>
          </div>
          <div className="cl-panel-body cl-panel-body-output">
            <OutputPanel
              type={isWeb ? 'web' : 'python'}
              output={output}
              error={error}
              success={success}
              htmlDoc={htmlDoc}
              running={running}
              lesson={lesson}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom tutor bar ── */}
      <div className="cl-bottom">
        <TutorBar
          text={tutorText}
          isVoiceOn={voiceOn}
          onToggleVoice={() => {
            setVoiceOn(v => !v);
            if (!voiceOn && lesson.tutorInstruction) speak(lesson.tutorInstruction);
            else window.speechSynthesis?.cancel();
          }}
        />
        <div className="cl-actions">
          {showHint && lesson.hint && (
            <div className="cl-hint-box">
              <span className="cl-hint-icon">💡</span>
              <span>{lesson.hint}</span>
            </div>
          )}
          <div className="cl-action-btns">
            {lesson.hint && (
              <button className="cl-hint-btn" onClick={() => {
                setShowHint(s => !s);
                if (!showHint && voiceOn && lesson.hint) speak(lesson.hint);
              }}>
                {showHint ? 'Hide hint' : '💡 Show hint'}
              </button>
            )}
            {!isBlock && (
              <button className="cl-reset-btn" onClick={() => {
                setCode(lesson.starterCode || '');
                setOutput(''); setError(''); setSuccess(false);
              }}>
                ↺ Reset
              </button>
            )}
            {success && (
              <button
                className="cl-next-btn"
                style={{ background: levelColor }}
                onClick={() => setDone(true)}
              >
                Next lesson →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
