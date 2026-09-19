import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import AuthScreen from './components/auth/AuthScreen';
import RepositoryManager from './components/repositories/RepositoryManager';
import { Toaster } from './components/ui/Toaster';
import { getSession, logout, User } from './services/githubService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession().then((session) => setUser(session.user)).catch(() => setUser(null)).finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    setUser(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#1a1a1a]">
        {isLoading ? <div className="flex min-h-screen items-center justify-center text-gray-400">Loading...</div> : user ? <RepositoryManager user={user} onLogout={handleLogout} /> : <AuthScreen />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default App;
