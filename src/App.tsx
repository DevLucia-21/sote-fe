import React, { useEffect, useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { MainApp } from './components/MainApp';
import { refreshAuthAPI } from './services/api';
import { AuthStorage } from './utils/auth';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'main'>('splash');
  const [, setIsAuthenticated] = useState(false);

  const clearAuthData = () => {
    AuthStorage.clearTokens();
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('user_id');
    localStorage.removeItem('profileData');
  };

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const refreshToken = AuthStorage.getRefreshToken();

      if (!refreshToken) {
        if (!isMounted) return;
        clearAuthData();
        setIsAuthenticated(false);
        setCurrentScreen('auth');
        return;
      }

      try {
        const tokens = await refreshAuthAPI(refreshToken);
        AuthStorage.setTokens(tokens.accessToken, tokens.refreshToken);

        if (!isMounted) return;
        setIsAuthenticated(true);
        setCurrentScreen('main');
      } catch (error) {
        if (!isMounted) return;
        clearAuthData();
        setIsAuthenticated(false);
        setCurrentScreen('auth');
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthData();
      setIsAuthenticated(false);
      setCurrentScreen('auth');
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('main');
  };

  const handleLogout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setCurrentScreen('auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'auth' && (
        <AuthScreen onLogin={handleLogin} onBackToAuth={() => setCurrentScreen('auth')} />
      )}
      {currentScreen === 'main' && <MainApp onLogout={handleLogout} />}
    </div>
  );
}
