import React, { useCallback, useEffect, useState } from 'react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import AuthScreen from './components/auth/AuthScreen';
import RepositoryManager from './components/repositories/RepositoryManager';
import { Toaster } from './components/ui/Toaster';
import { getSession, logout, User } from './services/githubService';
import { toast } from './components/ui/useToast';
import { Spinner } from '@nextui-org/react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    await logout().catch(() => undefined);
    setUser(null);
  }, []);

  useEffect(() => {
    getSession().then((session) => setUser(session.user)).catch(() => setUser(null)).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      void handleLogout();
      toast({ title: 'Session expired', description: 'Please sign in with GitHub again.', variant: 'destructive' });
    };
    window.addEventListener('github:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('github:unauthorized', handleUnauthorized);
  }, [handleLogout]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#1a1a1a]">
        {isLoading ? (
          <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-gray-400">
            <Spinner color="default" size="lg" />
            <span>Loading...</span>
          </div>
        ) : user ? <RepositoryManager user={user} onLogout={handleLogout} /> : <AuthScreen />}
        <Toaster />
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111] p-6 text-center text-gray-300 sm:hidden">
          <p className="max-w-xs text-sm">This app is not yet available on mobile devices.</p>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
