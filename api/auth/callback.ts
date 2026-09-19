import { clearStateCookie, encryptSession, sessionCookie, verifyState } from '../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../types.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const { code, state, error } = req.query;
  if (error) return res.redirect('/?auth_error=cancelled');
  const [oauthState, signature] = typeof state === 'string' ? state.split('.') : [];
  if (!oauthState || !signature || !verifyState(oauthState, signature)) return res.status(400).send('Invalid OAuth state');
  if (!oauthState) return res.status(400).send('Invalid OAuth state');
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_REDIRECT_URI ?? `${process.env.APP_URL}/api/auth/callback`;
  if (!clientId || !clientSecret || typeof code !== 'string') return res.status(500).send('GitHub OAuth is not configured');
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }) });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) return res.status(502).send('GitHub authorization failed');
  const userResponse = await fetch('https://api.github.com/user', { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${tokenData.access_token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'RepoWiper' } });
  if (!userResponse.ok) return res.status(502).send('GitHub user lookup failed');
  const user = await userResponse.json();
  res.setHeader('Set-Cookie', [sessionCookie(encryptSession({ accessToken: tokenData.access_token, user })), clearStateCookie()]);
  return res.redirect('/');
}
