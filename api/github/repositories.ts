import { githubRequest, requireSession } from '../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../types.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = requireSession(req, res);
  if (!session) return;
  const [userResponse, repositoriesResponse] = await Promise.all([githubRequest('/user', session.accessToken), githubRequest('/user/repos?per_page=100&sort=updated', session.accessToken)]);
  if (!userResponse.ok || !repositoriesResponse.ok) return res.status(502).json({ error: 'GitHub API request failed' });
  return res.status(200).json({ user: await userResponse.json(), repositories: await repositoriesResponse.json() });
}
