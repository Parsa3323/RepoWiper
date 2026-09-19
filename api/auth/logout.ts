import { clearSessionCookie } from '../_lib/auth.js';
import { ApiRequest, ApiResponse } from '../types.js';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.setHeader('Set-Cookie', clearSessionCookie());
  return res.status(204).end();
}
