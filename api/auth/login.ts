import { createState, signState, stateCookie } from '../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../types.js';

const allowedPermissions = new Set(['read:user', 'repo', 'delete_repo']);

export default function handler(req: ApiRequest, res: ApiResponse) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'GITHUB_CLIENT_ID is not configured' });
  const state = createState();
  const redirectUri = process.env.GITHUB_REDIRECT_URI ?? `${process.env.APP_URL}/api/auth/callback`;
  const requestedPermissions = typeof req.query.permissions === 'string' ? req.query.permissions.split(',') : [];
  const permissions = requestedPermissions.filter((permission) => allowedPermissions.has(permission));
  const scope = permissions.length > 0 ? permissions.join(' ') : 'read:user repo delete_repo';
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope, state: `${state}.${signState(state)}` });
  res.setHeader('Set-Cookie', stateCookie(state));
  return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
