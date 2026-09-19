import { githubRequest, requireSession } from '../../../_lib/auth';
import { ApiRequest, ApiResponse } from '../../../types';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  const session = requireSession(req, res);
  if (!session) return;
  const { owner, repo } = req.query;
  const response = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, session.accessToken, { method: 'DELETE' });
  if (!response.ok) return res.status(response.status).json({ error: 'GitHub could not delete this repository' });
  return res.status(204).end();
}
