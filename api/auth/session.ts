import { getSession } from '../_lib/auth';
import { ApiRequest, ApiResponse } from '../types';

export default function handler(req: ApiRequest, res: ApiResponse) {
  const session = getSession(req);
  return res.status(200).json({ authenticated: Boolean(session), user: session?.user ?? null });
}
