import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { MainApp } from './components/MainApp';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'main'>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🚀 App 시작됨');
    // 스플래시 화면을 2초 후에 숨김
    const timer = setTimeout(() => {
      // Check if user is already logged in
      const accessToken = localStorage.getItem('accessToken');
      console.log('🔑 accessToken:', accessToken);
      if (accessToken) {
        setIsAuthenticated(true);
        setCurrentScreen('main');
        console.log('✅ 메인 화면으로 이동');
      } else {
        setCurrentScreen('auth');
        console.log('✅ 로그인 화면으로 이동');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  console.log('📺 현재 화면:', currentScreen);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('main');
    console.log('✅ 로그인 완료');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('auth');
    console.log('👋 로그아웃 완료');
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