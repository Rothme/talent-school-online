import React, { useState } from 'react';
import './MsMomoBar.css';

export default function MsMomoBar({
  instruction,
  onHear,
  onHint,
  extraSlot,
  color = '#1d9e75',
  nameColor = '#5dcaa5',
}) {
  const [speaking, setSpeaking] = useState(false);

  function handleHear() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(instruction);
      utt.rate = 0.92;
      utt.pitch = 1.1;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
    if (onHear) onHear();
  }

  return (
    <div className="momo-bar">
      <div className="momo-avatar" style={{ background: color }} aria-hidden="true">
        <span className="momo-icon">🎓</span>
      </div>
      <div className="momo-bubble">
        <div className="momo-name" style={{ color: nameColor }}>
          Ms. Momo · AI Tutor
          {speaking && <span className="momo-speaking-dot" aria-label="Speaking" />}
        </div>
        <div className="momo-text">{instruction}</div>
      </div>
      <div className="momo-actions">
        <button
          className={`momo-btn ${speaking ? 'momo-btn-active' : ''}`}
          onClick={handleHear}
          aria-label="Hear instruction"
        >
          🔊 Hear
        </button>
        {onHint && (
          <button className="momo-btn" onClick={onHint} aria-label="Get a hint">
            💡 Hint
          </button>
        )}
        {extraSlot}
      </div>
    </div>
  );
}
