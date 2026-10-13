import { Repository, User } from './githubService';

export const previewUser: User = {
  login: 'preview-user',
  id: 0,
  avatar_url: '',
  html_url: 'https://github.com',
};

export const previewRepositories: Repository[] = [
  ['RepoWiper', 'A simple tool for managing GitHub repositories.', 'public'],
  ['Portfolio', 'Personal portfolio website.', 'public'],
  ['ProjectArchive', 'Archived project experiments and prototypes.', 'private'],
  ['QuickDrop', 'A small file-sharing experiment.', 'private'],
  ['DesignSystem', 'Reusable interface components.', 'public'],
].map(([name, description, visibility], index) => {
  const date = new Date(Date.UTC(2026, 8 - index, 19 - index));
  const isPrivate = visibility === 'private';
  return {
    id: index + 1,
    name,
    full_name: `${previewUser.login}/${name}`,
    description,
    html_url: 'https://github.com',
    visibility,
    owner: { login: previewUser.login, avatar_url: '' },
    created_at: date.toISOString(),
    updated_at: date.toISOString(),
    pushed_at: date.toISOString(),
    private: isPrivate,
  };
});
