const CLIENTS = {
  calendar: {
    clientId: '454027589008-aev25c6snf2p5eajtonrutbhg6umhmmp.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    secretName: 'CALENDAR_CLIENT_SECRET',
  },
};

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (
    req.headers['x-requested-with'] !== 'XmlHttpRequest' ||
    !origin ||
    !host ||
    origin !== 'https://' + host
  ) {
    return res.status(403).json({ ok: false, error: 'request_origin_rejected' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = null;
    }
  }

  const service = String(body?.service || '');
  const code = typeof body?.code === 'string' ? body.code : '';
  const config = CLIENTS[service];
  if (!config || !code || code.length > 4096) {
    return res.status(400).json({ ok: false, error: 'invalid_request' });
  }

  const clientSecret = process.env[config.secretName];
  if (!clientSecret) {
    return res.status(503).json({ ok: false, error: 'preview_secret_not_configured' });
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: clientSecret,
      redirect_uri: origin,
      grant_type: 'authorization_code',
    });
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      cache: 'no-store',
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(400).json({
        ok: false,
        error: tokenData.error || 'oauth_exchange_failed',
      });
    }

    return res.status(200).json({
      ok: true,
      tokenReceived: true,
      expiresIn: Number(tokenData.expires_in) || null,
      scope: tokenData.scope || config.scope,
    });
  } catch (_) {
    return res.status(502).json({ ok: false, error: 'oauth_exchange_unreachable' });
  }
};
