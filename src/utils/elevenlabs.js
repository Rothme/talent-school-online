/* eslint-disable */
// ─────────────────────────────────────────────────────
// Voice: browser-native speechSynthesis primary.
// ElevenLabs optional upgrade (disabled until plan upgrade).
// Key fix: warm-up utterance on voices-loaded so first
// real speak() call works immediately within a click.
// ─────────────────────────────────────────────────────

const audioCache = new Map();
let currentAudio = null;
let pendingText = null;
let pendingCallbacks = null;
let voicesReady = false;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const ELEVENLABS_ENABLED = false;

// Warm up speechSynthesis as soon as voices are available.
// This primes the system so the first real speak() call
// works synchronously within a user-click gesture.
function primeVoices() {
  if (!window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0 && !voicesReady) {
    voicesReady = true;
    // Speak a silent utterance to unlock the audio context
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.rate = 10; // as fast as possible
    u.onend = () => { voicesReady = true; };
    // Don't call speak() here — that itself requires a gesture.
    // Just mark voices as ready so they're available when needed.
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  primeVoices();
  window.speechSynthesis.onvoiceschanged = primeVoices;
}

export function unlockAudio() {
  // Called within a user gesture — use this to replay any queued speech
  if (pendingText) {
    const t = pendingText, cb = pendingCallbacks;
    pendingText = null; pendingCallbacks = null;
    speakElevenLabs(t, cb || {});
  }
}

// Clear pending audio without replaying it — use before speaking new content
export function pendingAudioClear() {
  pendingText = null;
  pendingCallbacks = null;
}

function getTTSUrl() {
  return `${window.location.origin}/api/tts`;
}

export function stopSpeech() {
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0; } catch(e) {}
    currentAudio = null;
  }
  try { window.speechSynthesis?.cancel(); } catch(e) {}
}

export async function speakElevenLabs(text, { onStart, onEnd, onError, onBlocked, onBoundary } = {}) {
  if (!text?.trim()) { onEnd?.(); return; }
  stopSpeech();

  if (!ELEVENLABS_ENABLED) {
    speakBrowserPrimary(text, { onStart, onEnd, onBlocked, onBoundary });
    return;
  }

  const cacheKey = text.trim();
  try {
    let blobUrl;
    if (audioCache.has(cacheKey)) {
      blobUrl = audioCache.get(cacheKey);
    } else {
      const res = await fetch(getTTSUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voiceId: VOICE_ID }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      audioCache.set(cacheKey, blobUrl);
    }
    const audio = new Audio(blobUrl);
    currentAudio = audio;
    audio.onplay  = () => onStart?.();
    audio.onended = () => { currentAudio = null; onEnd?.(); };
    audio.onerror = () => { currentAudio = null; speakBrowserPrimary(text, { onStart, onEnd, onBlocked, onBoundary }); };
    const p = audio.play();
    if (p) p.catch(() => { currentAudio = null; speakBrowserPrimary(text, { onStart, onEnd, onBlocked, onBoundary }); });
  } catch (err) {
    speakBrowserPrimary(text, { onStart, onEnd, onBlocked, onBoundary });
  }
}

function speakBrowserPrimary(text, { onStart, onEnd, onBlocked, onBoundary } = {}) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) { onEnd?.(); return; }

    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.05; u.volume = 1;

    const voices = synth.getVoices() || [];
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && /samantha|victoria|karen|zira|google us english/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith('en-')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) u.voice = preferred;

    let started = false;
    u.onstart = () => { started = true; onStart?.(); };
    u.onend   = () => onEnd?.();
    u.onerror = (e) => {
      // 'interrupted' is normal when stopSpeech() is called — not an error
      if (e?.error !== 'interrupted') onEnd?.();
    };

    if (onBoundary) {
      u.onboundary = (e) => {
        if (e.name === 'word') {
          const word = text.slice(e.charIndex, e.charIndex + (e.charLength || 1)).trim();
          onBoundary(word, e.charIndex);
        }
      };
    }

    synth.speak(u);

    // Detect silent block: browser accepted speak() but never fired onstart
    // (happens on some Chrome versions when audio context is suspended)
    setTimeout(() => {
      if (!started && !synth.speaking && !synth.pending) {
        // Queue for replay when next user gesture fires
        pendingText = text;
        pendingCallbacks = { onStart, onEnd, onBlocked, onBoundary };
        onBlocked?.();
      }
    }, 400);

  } catch (e) {
    onEnd?.();
  }
}

export function parseHighlights(text) {
  const mentions = [];
  let m;
  const sqRe = /\b([a-h])([1-8])\b/gi;
  while ((m = sqRe.exec(text)) !== null)
    mentions.push({ type:'square', value: m[1].toLowerCase()+m[2], start:m.index });
  const fileRe = /\bfile\s+([a-h])\b|\b([a-h])\s+file\b/gi;
  while ((m = fileRe.exec(text)) !== null)
    mentions.push({ type:'file', value:(m[1]||m[2]).toLowerCase(), start:m.index });
  const rankRe = /\brank\s+([1-8])\b|\b([1-8])(?:st|nd|rd|th)?\s+rank\b/gi;
  while ((m = rankRe.exec(text)) !== null)
    mentions.push({ type:'rank', value:m[1]||m[2], start:m.index });
  ['king','queen','rook','bishop','knight','pawn'].forEach(p => {
    const pRe = new RegExp(`\\b${p}s?\\b`, 'gi');
    while ((m = pRe.exec(text)) !== null)
      mentions.push({ type:'piece', value:p, start:m.index });
  });
  return mentions.sort((a,b) => a.start - b.start);
}
