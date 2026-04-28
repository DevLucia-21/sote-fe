import React, { useState, useEffect } from 'react';
import { EasyCalendarView } from './easy-mode/EasyCalendarView';
import { EasyDiaryEntry } from './easy-mode/EasyDiaryEntry';
import { EasySettingsView } from './easy-mode/EasySettingsView';
import { Calendar, PenTool, Settings } from 'lucide-react';

interface EasyModeAppProps {
  onLogout?: () => void;
}

export function EasyModeApp({ onLogout }: EasyModeAppProps) {
  const [currentTab, setCurrentTab] = useState<'calendar' | 'diary' | 'settings'>('calendar');
  const [theme, setTheme] = useState<'light' | 'dark' | 'easy'>('easy');

  // 초기 테마 로드
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = (savedTheme === 'dark' || savedTheme === 'easy' || savedTheme === 'light') ? savedTheme : 'easy';
    setTheme(initialTheme);
  }, []);

  // 테마 변경 감지
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'easy' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    };

    // storage 이벤트 리스너 (다른 탭에서 변경 감지)
    window.addEventListener('storage', handleThemeChange);
    
    // 커스텀 이벤트 리스너 (같은 탭에서 변경 감지)
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const isDark = theme === 'dark';

  const tabs = [
    { id: 'calendar', label: '캘린더', icon: Calendar },
    { id: 'diary', label: '작성', icon: PenTool },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'calendar':
        return <EasyCalendarView />;
      case 'diary':
        return <EasyDiaryEntry />;
      case 'settings':
        return <EasySettingsView onLogout={onLogout} />;
      default:
        return <EasyCalendarView />;
    }
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-300" 
      style={{ backgroundColor: isDark ? '#1a1a1a' : '#F5F1E8' }}
    >
      {/* 메인 컨텐츠 */}
      <div className="pb-24">
        {renderContent()}
      </div>

      {/* 하단 탭 네비게이션 - 큰 버튼 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-colors duration-300"
        style={{ 
          backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
          borderColor: isDark ? '#3a3a3a' : '#E5E5E5',
        }}
      >
        <div className="flex justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className="flex flex-col items-center py-3 px-6 rounded-lg transition-colors min-w-[100px]"
                style={{
                  backgroundColor: isActive ? '#7B8B4F' : 'transparent',
                  color: isActive ? 'white' : (isDark ? '#e8e8e8' : '#4A3228'),
                }}
              >
                <Icon className="w-8 h-8 mb-2" />
                <span className="text-base font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
