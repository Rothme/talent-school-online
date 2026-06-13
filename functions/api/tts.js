export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS preflight
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
      return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not set in Cloudflare environment variables' }), {
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
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.80,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err, status: response.status }), {
        status: response.status,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const audio = await response.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
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

// GET request returns diagnostic info
export async function onRequestGet(context) {
  const { env } = context;
  const hasKey = !!env.ELEVENLABS_API_KEY;
  return new Response(JSON.stringify({
    status: 'TTS Worker is live',
    elevenlabs_key_set: hasKey,
    voice_id: 'me1JPr2K6H7KZB9nz2Wk',
    message: hasKey ? 'Ready to generate speech' : 'ERROR: Set ELEVENLABS_API_KEY in Cloudflare Pages environment variables'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
