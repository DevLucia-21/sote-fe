import React, { useState } from 'react';
import { CalendarDays, BarChart3, PenTool, Disc3, Trophy, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { CalendarView } from './CalendarView';
import { StatisticsView } from './StatisticsView';
import { DiaryManager } from './diary';
import { MusicLP } from './MusicLP';
import { ChallengeView } from './ChallengeView';
import { SettingsView } from './SettingsView';

interface MainScreenProps {
  user: any;
}

export function MainScreen({ user }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState('calendar');

  const tabs = [
    { id: 'calendar', label: '캘린더', icon: CalendarDays, component: CalendarView },
    { id: 'statistics', label: '통계', icon: BarChart3, component: StatisticsView },
    { id: 'write', label: '작성', icon: PenTool, component: DiaryManager },
    { id: 'music', label: '음악 LP', icon: Disc3, component: MusicLP },
    { id: 'challenge', label: '챌린지', icon: Trophy, component: ChallengeView },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || CalendarView;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #F5F1E8, #E5E5E5)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7B8B4F' }}>
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#4A3228' }}>
              S:ote
            </h1>
          </div>
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <ActiveComponent user={user} />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 z-50">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                  isActive 
                    ? '' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={isActive ? { color: '#7B8B4F' } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-5 h-5`} style={isActive ? { color: '#7B8B4F' } : {}} />
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`} style={isActive ? { color: '#7B8B4F' } : {}}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#7B8B4F' }}
                    layoutId="activeIndicator"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Settings Modal */}
      {activeTab === 'settings' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <SettingsView user={user} onClose={() => setActiveTab('calendar')} />
          </div>
        </div>
      )}
    </div>
  );
}