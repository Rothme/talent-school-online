export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400, headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not set' }), {
        status: 500, headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const vid = voiceId || 'me1JPr2K6H7KZB9nz2Wk';
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${vid}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      // Surface the EXACT ElevenLabs error so we can debug from browser console
      return new Response(JSON.stringify({
        error: 'ElevenLabs API error',
        elevenlabs_status: response.status,
        elevenlabs_body: errBody,
        voice_id_used: vid,
      }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const audio = await response.arrayBuffer();

    if (audio.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'ElevenLabs returned empty audio' }), {
        status: 502, headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    return new Response(audio, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audio.byteLength),
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Worker exception', message: err.message, stack: err.stack }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  const hasKey = !!env.ELEVENLABS_API_KEY;
  return new Response(JSON.stringify({
    status: 'TTS Worker is live',
    elevenlabs_key_set: hasKey,
    key_prefix: hasKey ? env.ELEVENLABS_API_KEY.slice(0,6) + '...' : null,
    voice_id: 'me1JPr2K6H7KZB9nz2Wk',
    model: 'eleven_multilingual_v2',
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
