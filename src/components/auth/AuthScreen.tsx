import React, { useState } from 'react';

type Permission = 'read:user' | 'repo' | 'delete_repo';

const permissionOptions: Array<{ value: Permission; label: string; description: string }> = [
  { value: 'read:user', label: 'Profile information', description: 'Read your GitHub username.' },
  { value: 'repo', label: 'Repository access', description: 'List public and private repositories.' },
  { value: 'delete_repo', label: 'Delete repositories', description: 'Permanently delete selected repositories.' },
];

const AuthScreen: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>(permissionOptions.map((option) => option.value));

  const togglePermission = (permission: Permission) => {
    setPermissions((current) => current.includes(permission)
      ? current.filter((value) => value !== permission)
      : [...current, permission]);
  };

  const loginUrl = `/api/auth/login?permissions=${encodeURIComponent(permissions.join(','))}`;

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1fr_390px] lg:px-10">
      <section className="max-w-2xl">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-primary">Repository management</p>
        <h1 className="max-w-xl text-5xl font-semibold leading-tight text-white sm:text-6xl">Clean up your GitHub repositories.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">Review your repositories in one place and remove the ones you no longer need. You choose exactly which permissions to request before connecting.</p>
        <p className="mt-5 text-sm text-gray-500">Repository deletion is permanent. Only continue if you understand the consequences.</p>
      </section>

      <section className="rounded-2xl border border-gray-800 bg-[#242424] p-6 shadow-xl sm:p-8">
        <h2 className="text-xl font-semibold text-white">Connect GitHub</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">Choose what this session should be allowed to do.</p>

        <div className="mt-6 space-y-3">
          {permissionOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer gap-3 rounded-lg border border-gray-700 bg-[#2a2a2a] p-3 hover:border-gray-500">
              <input
                type="checkbox"
                checked={permissions.includes(option.value)}
                onChange={() => togglePermission(option.value)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-transparent text-primary"
              />
              <span>
                <span className="block text-sm font-medium text-gray-200">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">{option.description}</span>
              </span>
            </label>
          ))}
        </div>

        <a
          href={loginUrl}
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/80"
        >
          Continue with GitHub
        </a>
        <p className="mt-4 text-center text-xs text-gray-500">You will be asked to authorize these permissions on GitHub.</p>
        <p className="mt-3 text-center text-xs text-gray-600">Your GitHub credentials stay on the secure server.</p>
      </section>
    </main>
  );
};

export default AuthScreen;
