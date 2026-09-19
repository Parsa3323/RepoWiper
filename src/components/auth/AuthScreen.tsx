import React from 'react';
import { Github, ShieldCheck } from 'lucide-react';

const AuthScreen: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="w-full max-w-md rounded-lg bg-[#242424] p-8 shadow-lg">
      <div className="mb-6 flex justify-center"><div className="rounded-full bg-[#2a2a2a] p-3"><Github className="h-8 w-8 text-gray-300" /></div></div>
      <h1 className="mb-2 text-center text-2xl font-bold text-white">GitHub Repository Wiper</h1>
      <p className="mb-6 text-center text-gray-400">Manage and permanently delete repositories from your GitHub account.</p>
      <div className="mb-6 flex gap-3 rounded-md border border-gray-700 bg-[#2a2a2a] p-3 text-sm text-gray-300"><ShieldCheck className="h-5 w-5 flex-shrink-0 text-green-400" /><span>Your GitHub credential stays on the secure server and is never stored in your browser.</span></div>
      <a href="/api/auth/login" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white hover:bg-[#333333]"><Github className="h-4 w-4" />Continue with GitHub</a>
      <p className="mt-4 text-center text-xs text-gray-500">You will be asked to authorize repository access on GitHub.</p>
    </div>
  </div>
);

export default AuthScreen;
