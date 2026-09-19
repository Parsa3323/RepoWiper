import React from 'react';
import { Github } from 'lucide-react';
import { Button } from '../ui/Button';

const AuthScreen: React.FC = () => (
  <main className="flex min-h-screen items-center px-6 py-12 sm:px-10">
    <div className="auth-layout mx-auto w-full max-w-6xl">
      <section className="max-w-xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Repository management</p>
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">GitHub Repository Wiper</h1>
        <p className="mt-5 text-lg leading-8 text-gray-400">Safely manage and permanently delete GitHub repositories from one place.</p>
        <p className="mt-4 text-sm text-gray-500">Repository deletion cannot be undone.</p>
      </section>

      <section className="auth-card w-full max-w-md rounded-lg bg-[#242424] p-8 shadow-lg">
      <Button
        type="button"
        onClick={() => { window.location.href = '/api/auth/login'; }}
        variant="secondary"
        className="w-full"
        leftIcon={<Github className="h-4 w-4" />}
      >
        Connect to GitHub
      </Button>

      <p className="mt-4 text-center text-xs text-gray-500">You will be asked to authorize access on GitHub.</p>
      </section>
    </div>
  </main>
);

export default AuthScreen;
