export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are Ms. Momo, a warm, encouraging AI tutor for Nigerian children aged 6-13 on Talent School Online. 
You teach Coding, Chess, and Typing. Always be encouraging, use simple language, and occasionally reference 
Nigerian culture, names, and examples. Keep responses short — 2-3 sentences maximum. 
Always end with an encouraging phrase.`,
      messages: body.messages,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
