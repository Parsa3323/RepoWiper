import { githubRequest, requireSession } from '../../../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../../../types.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'DELETE' && req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
  const session = requireSession(req, res);
  if (!session) return;
  const owner = Array.isArray(req.query.owner) ? req.query.owner[0] : req.query.owner;
  const repo = Array.isArray(req.query.repo) ? req.query.repo[0] : req.query.repo;
  if (!owner || !repo) return res.status(400).json({ error: 'Repository owner and name are required' });
  if (req.method === 'PATCH') {
    const body = req.body as { name?: unknown; visibility?: unknown } | undefined;
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const visibility = body?.visibility;
    if (!name || (visibility !== 'public' && visibility !== 'private')) return res.status(400).json({ error: 'A valid repository name and visibility are required' });
    const response = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, session.accessToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, visibility }),
    });
    if (!response.ok) return res.status(response.status).json({ error: 'GitHub could not update this repository' });
    return res.status(200).json(await response.json());
  }
  const response = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, session.accessToken, { method: 'DELETE' });
  if (!response.ok) return res.status(response.status).json({ error: 'GitHub could not delete this repository' });
  return res.status(204).end();
}
