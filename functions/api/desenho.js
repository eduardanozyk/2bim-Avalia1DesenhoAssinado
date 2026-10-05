import { gerarDesenho } from '../../lib/desenho.js';

export async function onRequest(context) {
  const { request, env } = context;

  // 1. Ordem do contrato: Método (405)
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' }
    });
  }

  // 2. Ordem do contrato: Corpo (400)
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response('Corpo ausente ou JSON inválido', { status: 400 });
  }

  if (
    !body ||
    typeof body.numero !== 'number' ||
    !Number.isInteger(body.numero) ||
    body.numero < 1 ||
    body.numero > 100
  ) {
    return new Response('Número inválido ou fora do intervalo de 1 a 100', { status: 400 });
  }

  const { numero } = body;

  // 3. Ordem do contrato: Token (401)
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Token ausente ou malformatado', { status: 401 });
  }

  const idToken = authHeader.split(' ')[1];
  const clientId = env.GOOGLE_CLIENT_ID;

  try {
    const resToken = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (resToken.status !== 200) {
      return new Response('Token inválido ou expirado', { status: 401 });
    }

    const tokenData = await resToken.json();

    if (tokenData.aud !== clientId || tokenData.email_verified !== 'true') {
      return new Response('Audience inválido ou e-mail não verificado', { status: 401 });
    }

    const email = tokenData.email;

    // Gera o SVG com a função pura de lib/desenho.js
    const svg = gerarDesenho(numero, email);

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8'
      }
    });
  } catch (err) {
    return new Response('Erro na verificação do token', { status: 401 });
  }
}