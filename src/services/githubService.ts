export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  visibility: string;
  owner: {
    login: string;
    avatar_url: string;
  };
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

export const fetchUserRepositories = async (token: string): Promise<[Repository[], User]> => {
  try {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`);
    }

    const userData: User = await userResponse.json();

    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!reposResponse.ok) {
      throw new Error(`Failed to fetch repositories: ${reposResponse.status} ${reposResponse.statusText}`);
    }

    const reposData: Repository[] = await reposResponse.json();

    return [reposData, userData];
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
};

export const deleteRepository = async (
  token: string,
  owner: string,
  repo: string
): Promise<void> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to delete repository: ${response.status} ${response.statusText}${
          errorData.message ? ` - ${errorData.message}` : ''
        }`
      );
    }
  } catch (error) {
    console.error(`Error deleting repository ${owner}/${repo}:`, error);
    throw error;
  }
};