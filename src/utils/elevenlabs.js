/* eslint-disable */
// ─────────────────────────────────────────────────────
// Voice narration: browser-native speechSynthesis is the
// PRIMARY voice (always available, no quota/rate limits).
// ElevenLabs (via Cloudflare Pages Function) is an OPTIONAL
// upgrade — attempted first for nicer quality, but on ANY
// failure (429 rate limit, quota exceeded, network error,
// etc.) we fall back to browser TTS INSTANTLY and silently.
// Audio cached in memory to avoid duplicate API calls.
// ─────────────────────────────────────────────────────

const audioCache = new Map();
let currentAudio = null;
let userHasInteracted = false;
let pendingText = null;
let pendingCallbacks = null;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - default premade voice, free-tier compatible

// Toggle: set to false to skip ElevenLabs entirely and go
// straight to browser TTS (useful while testing curriculum
// content before the ElevenLabs plan is upgraded).
const ELEVENLABS_ENABLED = false;

// speechSynthesis voice list often loads asynchronously - prime it
// early so the first narration doesn't pick a default voice.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

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

  // ── Browser TTS is primary while ElevenLabs is disabled ──
  if (!ELEVENLABS_ENABLED) {
    speakBrowserPrimary(text, { onStart, onEnd, onBlocked });
    return;
  }

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
        console.warn('ElevenLabs TTS unavailable (falling back to browser voice):', res.status, errText.slice(0,200));
        throw new Error(`TTS ${res.status}`);
      }

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
    audio.onerror = () => {
      currentAudio = null;
      speakBrowserPrimary(text, { onStart, onEnd, onBlocked });
    };

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(e => {
        console.warn('ElevenLabs audio play blocked:', e.message);
        currentAudio = null;
        speakBrowserPrimary(text, { onStart, onEnd, onBlocked });
      });
    }

  } catch (err) {
    // Any ElevenLabs failure (429 quota, network, etc.) -> browser TTS
    speakBrowserPrimary(text, { onStart, onEnd, onBlocked });
  }
}

// Browser-native speechSynthesis as the primary/fallback voice.
// speechSynthesis is also subject to autoplay-gesture restrictions
// in some browsers, so if speaking fails immediately we queue for
// the tap-to-start overlay just like the ElevenLabs path used to.
function speakBrowserPrimary(text, { onStart, onEnd, onBlocked } = {}) {
  try {
    if (!window.speechSynthesis) {
      // No TTS available at all in this browser - skip narration
      // gracefully rather than blocking lesson progression forever.
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
    const voices = window.speechSynthesis.getVoices() || [];
    const v = voices.find(v =>
      v.lang.startsWith('en') && /female|zira|samantha|victoria|karen|google us english/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (v) u.voice = v;

    let started = false;
    u.onstart = () => { started = true; onStart?.(); };
    u.onend   = () => onEnd?.();
    u.onerror = () => onEnd?.();

    window.speechSynthesis.speak(u);

    // Some browsers silently drop speak() calls outside a user
    // gesture without firing onerror. Detect this and surface the
    // tap-to-start overlay so the user can unlock it with one tap.
    setTimeout(() => {
      if (!started && window.speechSynthesis.paused === false && !window.speechSynthesis.speaking) {
        pendingText = text;
        pendingCallbacks = { onStart, onEnd, onBlocked };
        onBlocked?.();
      }
    }, 250);
  } catch (e) {
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
