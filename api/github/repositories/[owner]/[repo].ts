import { githubRequest, requireSession } from '../../../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../../../types.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const session = requireSession(req, res);
  if (!session) return;
  const owner = Array.isArray(req.query.owner) ? req.query.owner[0] : req.query.owner;
  const repo = Array.isArray(req.query.repo) ? req.query.repo[0] : req.query.repo;
  if (!owner || !repo) return res.status(400).json({ error: 'Repository owner and name are required' });
  const response = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, session.accessToken, { method: 'DELETE' });
  if (!response.ok) return res.status(response.status).json({ error: 'GitHub could not delete this repository' });
  return res.status(204).end();
}
