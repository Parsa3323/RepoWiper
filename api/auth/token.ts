import { githubRequest, encryptSession, sessionCookie } from '../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../types.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = typeof req.body === 'object' && req.body !== null && 'token' in req.body
    ? (req.body as { token?: unknown }).token
    : undefined;

  if (typeof token !== 'string' || !token.trim()) return res.status(400).json({ error: 'A GitHub personal access token is required' });

  const userResponse = await githubRequest('/user', token.trim());
  if (!userResponse.ok) return res.status(401).json({ error: 'The GitHub token is invalid or does not have access' });

  const user = await userResponse.json();
  res.setHeader('Set-Cookie', sessionCookie(encryptSession({ accessToken: token.trim(), user })));
  return res.status(200).json({ authenticated: true, user });
}
