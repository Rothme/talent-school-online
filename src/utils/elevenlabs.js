/* eslint-disable */
// ─────────────────────────────────────────────────────
// ElevenLabs TTS via Cloudflare Pages Function
// Key is stored in Cloudflare env, never in browser
// Audio cached in memory to avoid duplicate API calls
// Falls back to browser speech synthesis if Worker fails
// ─────────────────────────────────────────────────────

const audioCache = new Map();
let currentAudio = null;
let userHasInteracted = false;
let pendingText = null;
let pendingCallbacks = null;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default premade voice, free-tier compatible

// Call this on any user click to unlock audio
export function unlockAudio() {
  userHasInteracted = true;
  // Play any speech that was queued before interaction
  if (pendingText) {
    const t = pendingText, cb = pendingCallbacks;
    pendingText = null; pendingCallbacks = null;
    speakElevenLabs(t, cb || {});
  }
}

// Use window.location.origin so it works on any deployment URL
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

export async function speakElevenLabs(text, { onStart, onEnd, onError, onBlocked } = {}) {
  if (!text?.trim()) return;
  stopSpeech();

  // Use full text as cache key — truncated prefixes caused collisions
  // between different steps that happen to start with the same words
  // (e.g. "Watch this move..." appears in multiple lessons/steps).
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

      if (!res.ok) {
        const errText = await res.text().catch(()=>'');
        console.error('🔴 ElevenLabs TTS FAILED:', res.status, errText);
        throw new Error(`TTS ${res.status}: ${errText.slice(0,300)}`);
      }
      console.log('✅ ElevenLabs TTS success, content-type:', res.headers.get('content-type'));

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('audio')) {
        throw new Error(`Expected audio, got ${contentType}`);
      }

      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      audioCache.set(cacheKey, blobUrl);
    }

    const audio = new Audio(blobUrl);
    currentAudio = audio;
    audio.onplay  = () => onStart?.();
    audio.onended = () => { currentAudio = null; onEnd?.(); };
    audio.onerror = (e) => {
      console.warn('Audio playback error, using browser TTS');
      currentAudio = null;
      browserSpeak(text, { onStart, onEnd });
    };

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(e => {
        console.warn('Audio play blocked (no user gesture yet):', e.message);
        currentAudio = null;
        if (!userHasInteracted) {
          // Queue for replay the instant the user interacts
          pendingText = text;
          pendingCallbacks = { onStart, onEnd, onError, onBlocked };
          onBlocked?.();
        } else {
          // User has interacted before but this play was still blocked —
          // browser TTS as a last resort.
          browserSpeak(text, { onStart, onEnd });
        }
      });
    }

  } catch (err) {
    console.warn('ElevenLabs TTS error, falling back to browser:', err.message);
    if (!userHasInteracted) {
      pendingText = text;
      pendingCallbacks = { onStart, onEnd, onError, onBlocked };
      onBlocked?.();
    } else {
      browserSpeak(text, { onStart, onEnd });
    }
    onError?.(err);
  }
}

function browserSpeak(text, { onStart, onEnd } = {}) {
  try {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88; u.pitch = 1.1; u.volume = 1;
    const voices = window.speechSynthesis?.getVoices() || [];
    const v = voices.find(v =>
      v.lang.startsWith('en') && /female|zira|samantha|victoria|karen/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (v) u.voice = v;
    u.onstart = () => onStart?.();
    u.onend   = () => onEnd?.();
    window.speechSynthesis?.speak(u);
  } catch(e) {
    onEnd?.();
  }
}

// Parse text for chess-specific mentions to trigger neon highlights
export function parseHighlights(text) {
  const mentions = [];
  let m;

  // Square mentions: e4, d5, a1, h8
  const sqRe = /\b([a-h])([1-8])\b/gi;
  while ((m = sqRe.exec(text)) !== null)
    mentions.push({ type:'square', value: m[1].toLowerCase()+m[2], start:m.index });

  // File mentions: "file e" or "the e file"
  const fileRe = /\bfile\s+([a-h])\b|\b([a-h])\s+file\b/gi;
  while ((m = fileRe.exec(text)) !== null)
    mentions.push({ type:'file', value:(m[1]||m[2]).toLowerCase(), start:m.index });

  // Rank mentions: "rank 4" or "the 4th rank"
  const rankRe = /\brank\s+([1-8])\b|\b([1-8])(?:st|nd|rd|th)?\s+rank\b/gi;
  while ((m = rankRe.exec(text)) !== null)
    mentions.push({ type:'rank', value:m[1]||m[2], start:m.index });

  // Piece names
  ['king','queen','rook','bishop','knight','pawn'].forEach(p => {
    const pRe = new RegExp(`\\b${p}s?\\b`, 'gi');
    while ((m = pRe.exec(text)) !== null)
      mentions.push({ type:'piece', value:p, start:m.index });
  });

  return mentions.sort((a, b) => a.start - b.start);
}
