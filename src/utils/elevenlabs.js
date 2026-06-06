/* eslint-disable */
// ─────────────────────────────────────────────────────
// ElevenLabs TTS utility
// Routes through Cloudflare Worker to protect API key
// Caches audio blobs in memory to avoid duplicate calls
// Falls back to browser speech if Worker unavailable
// ─────────────────────────────────────────────────────

const cache = new Map();
const VOICE_ID = 'me1JPr2K6H7KZB9nz2Wk';
const TTS_ENDPOINT = '/api/tts';

let currentAudio = null;

export function stopSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  try { window.speechSynthesis.cancel(); } catch(e) {}
}

export async function speakElevenLabs(text, { onStart, onEnd, onError } = {}) {
  if (!text) return;
  stopSpeech();

  const key = text.trim().slice(0, 120);

  try {
    let audioUrl;

    if (cache.has(key)) {
      audioUrl = cache.get(key);
    } else {
      const res = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: VOICE_ID }),
      });

      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      const blob = await res.blob();
      audioUrl = URL.createObjectURL(blob);
      cache.set(key, audioUrl);
    }

    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.onplay  = () => onStart?.();
    audio.onended = () => { currentAudio = null; onEnd?.(); };
    audio.onerror = () => { fallbackSpeak(text, { onStart, onEnd }); };
    await audio.play();

  } catch (err) {
    console.warn('ElevenLabs TTS failed, falling back to browser speech:', err.message);
    fallbackSpeak(text, { onStart, onEnd });
    onError?.(err);
  }
}

function fallbackSpeak(text, { onStart, onEnd } = {}) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88; u.pitch = 1.1; u.volume = 1;
    const voices = window.speechSynthesis.getVoices() || [];
    const v = voices.find(v =>
      v.lang.startsWith('en') && /female|zira|samantha|victoria|karen/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (v) u.voice = v;
    u.onstart = () => onStart?.();
    u.onend   = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } catch(e) {}
}

// Parse voice text for square/file/rank/piece mentions
// Returns array of { type, value, startChar, endChar }
export function parseHighlights(text) {
  const mentions = [];
  const files = ['a','b','c','d','e','f','g','h'];
  const ranks  = ['1','2','3','4','5','6','7','8'];
  const pieces = ['king','queen','rook','bishop','knight','pawn'];

  // Square mentions e.g. e4, d5, a1 (letter followed by digit)
  const sqRe = /\b([a-h])([1-8])\b/gi;
  let m;
  while ((m = sqRe.exec(text)) !== null) {
    mentions.push({ type:'square', value: m[1].toLowerCase()+m[2], start:m.index });
  }

  // File mentions e.g. "file e" or "the e file"
  const fileRe = /\bfile\s+([a-h])\b|\b([a-h])\s+file\b/gi;
  while ((m = fileRe.exec(text)) !== null) {
    const f = (m[1]||m[2]).toLowerCase();
    mentions.push({ type:'file', value:f, start:m.index });
  }

  // Rank mentions e.g. "rank 4" or "the 4th rank"
  const rankRe = /\brank\s+([1-8])\b|\b([1-8])(?:st|nd|rd|th)?\s+rank\b/gi;
  while ((m = rankRe.exec(text)) !== null) {
    const r = m[1]||m[2];
    mentions.push({ type:'rank', value:r, start:m.index });
  }

  // Piece mentions
  pieces.forEach(p => {
    const pRe = new RegExp(`\\b${p}\\b`, 'gi');
    while ((m = pRe.exec(text)) !== null) {
      mentions.push({ type:'piece', value:p.toLowerCase(), start:m.index });
    }
  });

  return mentions.sort((a,b) => a.start - b.start);
}
