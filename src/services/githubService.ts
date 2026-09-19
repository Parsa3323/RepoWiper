export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  visibility: string;
  owner: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
}

export interface User {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

interface SessionResponse { authenticated: boolean; user: User | null }

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...options,
    headers: { Accept: 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const getSession = (): Promise<SessionResponse> => request('/api/auth/session');
export const logout = (): Promise<void> => request('/api/auth/logout', { method: 'POST' });
export const fetchUserRepositories = (): Promise<{ repositories: Repository[]; user: User }> => request('/api/github/repositories');
export const deleteRepository = (owner: string, repo: string): Promise<void> =>
  request(`/api/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { method: 'DELETE' });

export const updateRepository = (owner: string, repo: string, changes: { name: string; visibility: 'public' | 'private' }): Promise<Repository> =>
  request(`/api/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
