/* eslint-disable */
// ─────────────────────────────────────────────────────
// Voice — browser speechSynthesis ONLY
// ElevenLabs removed entirely until curriculum approved
// and paid plan activated. No async, no cache, no routing.
// ─────────────────────────────────────────────────────

let currentUtterance = null;
let selectedVoice = null;

// Pick the best available English voice once on load
function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  selectedVoice = voices.find(v =>
    v.lang.startsWith('en') && /samantha|victoria|karen|zira|google us english/i.test(v.name)
  ) || voices.find(v => v.lang.startsWith('en-'))
    || voices.find(v => v.lang.startsWith('en'))
    || voices[0]
    || null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

export function stopSpeech() {
  try { window.speechSynthesis?.cancel(); } catch(e) {}
  currentUtterance = null;
}

export function pendingAudioClear() {
  // No pending queue in direct mode — just cancel current speech
  stopSpeech();
}

export function unlockAudio() {
  // No-op in direct mode — gesture handled by caller
}

// Main speak function — called directly within click handlers
// No async, no ElevenLabs, no stopSpeech() before speak()
export function speakElevenLabs(text, {
  onStart, onEnd, onError, onBlocked, onBoundary
} = {}) {
  if (!text?.trim()) { onEnd?.(); return; }

  const synth = window.speechSynthesis;
  if (!synth) { onEnd?.(); return; }

  const u = new SpeechSynthesisUtterance(text);
  u.rate  = 0.92;
  u.pitch = 1.05;
  u.volume = 1;
  if (selectedVoice) u.voice = selectedVoice;

  currentUtterance = u;
  let started = false;

  u.onstart = () => { started = true; onStart?.(); };
  u.onend   = () => { currentUtterance = null; onEnd?.(); };
  u.onerror = (e) => {
    currentUtterance = null;
    if (e?.error !== 'interrupted' && e?.error !== 'canceled') onEnd?.();
  };

  if (onBoundary) {
    u.onboundary = (e) => {
      if (e.name === 'word') {
        const word = text.slice(e.charIndex, e.charIndex + (e.charLength || 1)).trim();
        onBoundary(word, e.charIndex);
      }
    };
  }

  // Cancel any stuck utterance before queuing the new one — required for Chrome
  synth.cancel();
  synth.speak(u);

  setTimeout(() => {
    if (!started && !synth.speaking && !synth.pending) {
      onBlocked?.();
    }
  }, 500);
}

export function parseHighlights(text) {
  const mentions = [];
  let m;
  const sqRe = /\b([a-h])([1-8])\b/gi;
  while ((m = sqRe.exec(text)) !== null)
    mentions.push({ type: 'square', value: m[1].toLowerCase() + m[2], start: m.index });
  const fileRe = /\bfile\s+([a-h])\b|\b([a-h])\s+file\b/gi;
  while ((m = fileRe.exec(text)) !== null)
    mentions.push({ type: 'file', value: (m[1] || m[2]).toLowerCase(), start: m.index });
  const rankRe = /\brank\s+([1-8])\b|\b([1-8])(?:st|nd|rd|th)?\s+rank\b/gi;
  while ((m = rankRe.exec(text)) !== null)
    mentions.push({ type: 'rank', value: m[1] || m[2], start: m.index });
  ['king','queen','rook','bishop','knight','pawn'].forEach(p => {
    const pRe = new RegExp(`\\b${p}s?\\b`, 'gi');
    while ((m = pRe.exec(text)) !== null)
      mentions.push({ type: 'piece', value: p, start: m.index });
  });
  return mentions.sort((a, b) => a.start - b.start);
}
