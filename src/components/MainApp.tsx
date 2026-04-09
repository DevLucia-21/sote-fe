import React, { useState, useEffect } from 'react';
import { CalendarView } from './CalendarView';
import { StatisticsView } from './StatisticsView';
import { DiaryEntry } from './DiaryEntry';
import { MusicLP } from './MusicLP';
import { ChallengeView } from './ChallengeView';
import { SettingsView } from './SettingsView';
import { EasyModeApp } from './EasyModeApp';
import { Calendar, BarChart3, PenTool, Music, Trophy } from 'lucide-react';

interface MainAppProps {
  onLogout?: () => void;
}

export function MainApp({ onLogout }: MainAppProps) {
  const [currentTab, setCurrentTab] = useState<'calendar' | 'statistics' | 'diary' | 'music' | 'challenge' | 'settings'>('calendar');
  const [theme, setTheme] = useState<'light' | 'dark' | 'easy'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'easy' || saved === 'light') ? saved : 'light';
  });

  // theme 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'easy' || saved === 'light') {
        setTheme(saved);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 주기적으로 확인 (같은 탭에서의 변경 감지)
    const interval = setInterval(() => {
      const saved = localStorage.getItem('theme');
      if (saved !== theme && (saved === 'dark' || saved === 'easy' || saved === 'light')) {
        setTheme(saved);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  // Easy Mode일 때는 EasyModeApp 렌더링
  if (theme === 'easy') {
    return <EasyModeApp onLogout={onLogout} />;
  }

  const tabs = [
    { id: 'calendar', label: '캘린더', icon: Calendar, component: CalendarView },
    { id: 'statistics', label: '통계', icon: BarChart3, component: StatisticsView },
    { id: 'diary', label: '작성', icon: PenTool, component: DiaryEntry },
    { id: 'music', label: '음악 LP', icon: Music, component: MusicLP },
    { id: 'challenge', label: '챌린지', icon: Trophy, component: ChallengeView },
  ];

  const renderContent = () => {
    if (currentTab === 'settings') {
      return <SettingsView onBack={() => setCurrentTab('calendar')} onLogout={onLogout} />;
    }

    if (currentTab === 'calendar') {
      return <CalendarView onNavigateToSettings={() => setCurrentTab('settings')} />;
    }

    if (currentTab === 'diary') {
      return (
        <DiaryEntry
          onNavigateToChallenge={() => setCurrentTab('challenge')}
          onNavigateToCalendar={() => setCurrentTab('calendar')}
        />
      );
    }

    const CurrentComponent = tabs.find(tab => tab.id === currentTab)?.component || CalendarView;
    return <CurrentComponent />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 메인 컨텐츠 */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* 하단 탭 네비게이션 - 설정 제외 */}
      {currentTab !== 'settings' && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-foreground' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
