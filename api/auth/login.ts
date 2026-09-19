import { createState, signState, stateCookie } from '../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../types.js';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'GITHUB_CLIENT_ID is not configured' });
  const state = createState();
  const redirectUri = process.env.GITHUB_REDIRECT_URI ?? `${process.env.APP_URL}/api/auth/callback`;
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope: 'read:user repo delete_repo', state: `${state}.${signState(state)}` });
  res.setHeader('Set-Cookie', stateCookie(state));
  return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
