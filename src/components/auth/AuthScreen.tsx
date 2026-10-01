import React, { FormEvent, useState } from 'react';
import { Github, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { loginWithToken } from '../../services/githubService';
import { toast } from '../ui/useToast';
import { InteractiveGridPattern } from '../ui/InteractiveGridPattern';
import { Highlighter } from '../ui/Highlighter';

const AuthScreen: React.FC = () => {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTokenLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await loginWithToken(token);
      window.location.reload();
    } catch (error) {
      toast({ title: 'Could not sign in', description: error instanceof Error ? error.message : 'Check your token and try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-black px-6 py-12 sm:px-10">
      <InteractiveGridPattern className="[mask-image:radial-gradient(600px_500px_at_center,white,transparent)] inset-x-0 inset-y-[-50%] h-[200%] skew-y-12" />
      <div className="auth-layout relative z-10 mx-auto w-full max-w-6xl">
        <section className="max-w-xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Repository management</p>
          <h1 className="text-5xl font-bold leading-tight text-white sm:text-7xl">By Rabity</h1>
          <p className="mt-5 text-lg leading-8 text-gray-400">Safely manage and permanently delete GitHub repositories from one place.</p>
          <p className="mt-4 text-sm text-gray-500"><Highlighter action="underline" color="#ffffff">Repository deletion cannot be undone.</Highlighter>{' '}</p>
        </section>

        <section className="auth-card w-full max-w-md rounded-lg bg-[#111111] p-8 shadow-lg">
          <Button
            type="button"
            onClick={() => { window.location.href = '/api/auth/login'; }}
            variant="secondary"
            className="w-full border-white bg-white text-black"
            leftIcon={<Github className="h-4 w-4" />}
          >
            Login with GitHub
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-600">
            <span className="h-px flex-1 bg-[#3a3a3a]" />
            <span>or</span>
            <span className="h-px flex-1 bg-[#3a3a3a]" />
          </div>

          <form onSubmit={handleTokenLogin} className="space-y-3">
            <div className="group relative flex w-fit items-center gap-1">
              <label htmlFor="github-token" className="text-sm font-medium text-gray-300">Personal access token</label>
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-gray-500" aria-label="How to get a personal access token">
                <HelpCircle className="h-3.5 w-3.5" />
              </span>
              <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-64 rounded-md border border-[#3a3a3a] bg-[#1a1a1a] p-3 text-xs leading-5 text-gray-400 shadow-lg group-hover:block">
                In GitHub, open Settings, Developer settings, Personal access tokens, then create a fine-grained token. You can also use Login with GitHub above.
              </span>
            </div>
            <input
              id="github-token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="github_pat_..."
              autoComplete="off"
              required
              className="h-10 w-full rounded-md border border-[#3a3a3a] bg-[#1a1a1a] px-3 text-sm text-gray-200 outline-none transition focus:border-gray-500"
            />
            <Button type="submit" variant="secondary" className="w-full" isLoading={isSubmitting}>
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">Your token is used only to sign in and is kept in an encrypted session.</p>
        </section>
      </div>
    </main>
  );
};

export default AuthScreen;
