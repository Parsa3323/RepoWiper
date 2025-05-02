import React, { useState } from 'react';
import { Github, KeyRound, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthScreenProps {
  onTokenSubmit: (token: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token or insufficient permissions');
      }

      onTokenSubmit(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4">
      <div className="w-full max-w-md bg-[#242424] rounded-lg shadow-lg p-8 transform transition-all">
        <div className="flex justify-center mb-6">
          <div className="bg-[#2a2a2a] p-3 rounded-full">
            <Github className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-white">GitHub Repository Remover</h1>
        <p className="text-gray-400 text-center mb-6">
          Safely delete multiple GitHub repositories at once
        </p>
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-md p-3 mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="token" className="block text-sm font-medium mb-1 text-gray-300">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm border-gray-600 bg-[#2a2a2a] text-white placeholder-gray-400"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Need a token? Create one with 'delete_repo' scope at{' '}
              <a 
                href="https://github.com/settings/tokens/new" 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-300 hover:underline"
              >
                GitHub Settings
              </a>
            </p>
          </div>
          
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-[#2a2a2a] hover:bg-[#333333] text-white"
            leftIcon={<Github className="h-4 w-4" />}
          >
            Connect to GitHub
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;