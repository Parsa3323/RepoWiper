import React, { useState } from 'react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import AuthScreen from './components/auth/AuthScreen';
import RepositoryManager from './components/repositories/RepositoryManager';
import { Toaster } from './components/ui/Toaster';

const App: React.FC = () => {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('github_token') || '';
  });

  const handleTokenSubmit = (newToken: string) => {
    localStorage.setItem('github_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setToken('');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#1a1a1a]">
        {token ? (
          <RepositoryManager token={token} onLogout={handleLogout} />
        ) : (
          <AuthScreen onTokenSubmit={handleTokenSubmit} />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default App;