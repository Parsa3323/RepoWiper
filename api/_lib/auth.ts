import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ApiRequest, ApiResponse } from '../types.js';

export interface GithubUser { login: string; id: number; avatar_url: string; html_url: string }
interface Session { accessToken: string; user: GithubUser }

const cookieName = 'repo_wiper_session';
const stateCookieName = 'repo_wiper_oauth_state';

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error('SESSION_SECRET is not configured');
  return createHash('sha256').update(value).digest();
};

const encode = (value: Buffer) => value.toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url');

export const encryptSession = (session: Session) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', secret(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()]);
  return `${encode(iv)}.${encode(cipher.getAuthTag())}.${encode(encrypted)}`;
};

export const decryptSession = (value?: string): Session | null => {
  if (!value) return null;
  try {
    const [iv, tag, encrypted] = value.split('.').map(decode);
    const decipher = createDecipheriv('aes-256-gcm', secret(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')) as Session;
  } catch { return null; }
};

export const parseCookies = (header?: string) => Object.fromEntries((header ?? '').split(';').filter(Boolean).map((part) => {
  const index = part.indexOf('=');
  return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
}));

const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
export const sessionCookie = (value: string, maxAge = 604800) => `${cookieName}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secure}`;
export const clearSessionCookie = () => sessionCookie('', 0);
export const stateCookie = (value: string) => `${stateCookieName}=${value}; Max-Age=600; Path=/; HttpOnly; SameSite=Lax${secure}`;
export const clearStateCookie = () => `${stateCookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`;
export const getSession = (req: ApiRequest) => decryptSession(parseCookies(req.headers.cookie)[cookieName]);

export const createState = () => randomBytes(32).toString('hex');
export const statesMatch = (expected: string | undefined, actual: string | undefined) => {
  if (!expected || !actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
};
export const signState = (state: string) => createHmac('sha256', secret()).update(state).digest('hex');
export const verifyState = (state: string, signature: string) => statesMatch(signState(state), signature);

export const githubRequest = async (path: string, accessToken: string, init?: RequestInit) => fetch(`https://api.github.com${path}`, {
  ...init,
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${accessToken}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'RepoWiper',
    ...init?.headers,
  },
});

export const requireSession = (req: ApiRequest, res: ApiResponse) => {
  const session = getSession(req);
  if (!session) { res.status(401).json({ error: 'Authentication required' }); return null; }
  return session;
};
