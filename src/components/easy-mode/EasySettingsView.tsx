import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ChevronRight, Pencil, Sun, Moon, Glasses, Bell, Activity, Eye, EyeOff, Watch } from 'lucide-react';
import { toast } from 'sonner';
import { HealthDataView } from '../HealthDataView';
import { WatchPairingView } from '../settings/WatchPairingView';
import { characterInfo, type CharacterType } from '../common/characterImages';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type ViewType = 'main' | 'profile' | 'health' | 'watch-pairing';

interface EasySettingsViewProps {
  onLogout?: () => void;
}

const mockGenres = [
  { id: 1, name: '발라드' },
  { id: 2, name: 'R&B' },
  { id: 3, name: '재즈' },
  { id: 4, name: '팝' },
  { id: 5, name: '록' },
  { id: 6, name: '클래식' },
  { id: 7, name: '힙합' },
  { id: 8, name: '인디' },
];

type Character = CharacterType;

export function EasySettingsView({ onLogout }: EasySettingsViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [notifications, setNotifications] = useState({
    diary: true,
    challenge: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'easy'>(() => {
    if (typeof window === 'undefined') return 'easy';
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'easy' || saved === 'light') ? saved : 'easy';
  });

  // 워치 연동 상태 확인
  const [isWatchConnected, setIsWatchConnected] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('watchConnected') === 'true';
  });

  // 워치 연동 상태 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setIsWatchConnected(localStorage.getItem('watchConnected') === 'true');
      
      // 워치가 연동되면 자동으로 건강 데이터도 연동
      if (localStorage.getItem('watchConnected') === 'true') {
        localStorage.setItem('healthDataConnected', 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // custom event도 listen (같은 탭에서의 변경 감지)
    window.addEventListener('watchConnectionChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchConnectionChanged', handleStorageChange);
    };
  }, []);

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('profileData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          email: 'soyeon@sote.app',
          nickname: '소연',
          character: 'PIANO' as Character,
          birthDate: '2003-08-15',
          hasProfileImage: false,
          profileImageUrl: '',
          genreIds: [1, 3, 5] as number[]
        };
      }
    }
    return {
      email: 'soyeon@sote.app',
      nickname: '소연',
      character: 'PIANO' as Character,
      birthDate: '2003-08-15',
      hasProfileImage: false,
      profileImageUrl: '',
      genreIds: [1, 3, 5] as number[]
    };
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 비밀번호 변 관련 state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    // 커스텀 이벤트 발생시켜 다른 컴포넌트에 테마 변경 알림
    window.dispatchEvent(new Event('themeChange'));
  }, [theme]);

  const handleSaveProfile = () => {
    toast.success('프로필이 저장되었습니다.');
    setCurrentView('main');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ 
          ...profileData, 
          hasProfileImage: true,
          profileImageUrl: reader.result as string 
        });
      };
      reader.readAsDataURL(file);
      toast.success('프로필 사진이 변경되었습니다.');
    }
  };

  const handlePasswordChange = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(passwordData.new);
    if (passwordData.new.length < 8 || !hasSpecial) {
      toast.error('새 비밀번호는 8자 이상, 특수문자 1개 이상 포함해야 합니다.');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    toast.success('비밀번호가 변경되었습니다.');
    setPasswordData({ current: '', new: '', confirm: '' });
    setShowPasswordFields(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('로그아웃되었습니다.');
    if (onLogout) onLogout();
  };

  // 건강 데이터 화면
  if (currentView === 'health') {
    return <HealthDataView onBack={() => setCurrentView('main')} />;
  }

  // 프로필 편집 화면
  if (currentView === 'profile') {
    return (
      <div className="p-6 space-y-6 min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
        <Button
          onClick={() => setCurrentView('main')}
          className="text-xl py-6 px-8"
          style={{ backgroundColor: '#7B8B4F', color: 'white' }}
        >
          ← 뒤로 가기
        </Button>

        <h1 className="text-4xl" style={{ color: '#4A3228' }}>
          프로필 편집
        </h1>

        <Card className="p-8 space-y-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
          {/* 프로필 사진 */}
          <div className="text-center">
            <p className="text-2xl mb-4" style={{ color: '#4A3228' }}>프로필 사진</p>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 border-4" style={{ borderColor: '#7B8B4F' }}>
                <AvatarImage src={profileData.profileImageUrl} />
                <AvatarFallback className="text-3xl" style={{ backgroundColor: '#7B8B4F', color: 'white' }}>
                  {profileData.nickname?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="text-xl py-4 px-8"
                style={{ backgroundColor: '#7B8B4F', color: 'white' }}
              >
                사진 변경하기
              </Button>
            </div>
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <p className="text-2xl mb-3" style={{ color: '#4A3228' }}>이메일</p>
            <Input
              value={profileData.email}
              disabled
              className="text-xl p-6 bg-gray-100"
              style={{ borderColor: '#E5E5E5', color: '#999' }}
            />
            <p className="text-lg text-gray-500 mt-2">이메일은 변경할 수 없습니다</p>
          </div>

          {/* 비밀번호 변경 */}
          <div>
            <div className="flex items-center gap-4 mb-3">
              <p className="text-lg flex-1" style={{ color: '#4A3228' }}>비밀번호 변경</p>
              <Button
                onClick={() => {
                  setShowPasswordFields(!showPasswordFields);
                  if (showPasswordFields) {
                    setPasswordData({ current: '', new: '', confirm: '' });
                  }
                }}
                className="text-lg py-2 px-4"
                style={{ backgroundColor: '#7B8B4F', color: 'white' }}
              >
                {showPasswordFields ? '취소' : '변경하기'}
              </Button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 mt-4 p-4 rounded-xl" style={{ backgroundColor: '#F5F1E8' }}>
                <div>
                  <p className="text-base mb-2" style={{ color: '#4A3228' }}>현재 비밀번호</p>
                  <div className="relative">
                    <Input
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="text-lg p-4 pr-14"
                      style={{ borderColor: '#E5E5E5' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPwd ? 
                        <EyeOff className="w-6 h-6" style={{ color: '#4A3228' }} /> : 
                        <Eye className="w-6 h-6" style={{ color: '#4A3228' }} />
                      }
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-base mb-2" style={{ color: '#4A3228' }}>새 비밀번호</p>
                  <div className="relative">
                    <Input
                      type={showNewPwd ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="text-lg p-4 pr-14"
                      style={{ borderColor: '#E5E5E5' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPwd ? 
                        <EyeOff className="w-6 h-6" style={{ color: '#4A3228' }} /> : 
                        <Eye className="w-6 h-6" style={{ color: '#4A3228' }} />
                      }
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">8자 이상, 특수문자 1개 이상 포함</p>
                </div>

                <div>
                  <p className="text-base mb-2" style={{ color: '#4A3228' }}>새 비밀번호 확인</p>
                  <div className="relative">
                    <Input
                      type={showConfirmPwd ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="text-lg p-4 pr-14"
                      style={{ borderColor: '#E5E5E5' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPwd ? 
                        <EyeOff className="w-6 h-6" style={{ color: '#4A3228' }} /> : 
                        <Eye className="w-6 h-6" style={{ color: '#4A3228' }} />
                      }
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  className="w-full text-lg py-4"
                  style={{ backgroundColor: '#7B8B4F', color: 'white' }}
                >
                  비밀번호 변경
                </Button>
              </div>
            )}
          </div>

          {/* 생년월일 (읽기 전용) */}
          <div>
            <p className="text-2xl mb-3" style={{ color: '#4A3228' }}>생년월일</p>
            <Input
              type="date"
              value={profileData.birthDate}
              disabled
              className="text-xl p-6 bg-gray-100"
              style={{ borderColor: '#E5E5E5', color: '#999' }}
            />
            <p className="text-base text-gray-500 mt-2">생년월일은 변경할 수 없습니다</p>
          </div>

          {/* 닉네임 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: '#4A3228' }}>이름</p>
            <Input
              value={profileData.nickname}
              onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
              className="text-xl p-6"
              style={{ borderColor: '#E5E5E5' }}
            />
          </div>

          {/* 선호 악기 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: '#4A3228' }}>좋아하는 악기</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(characterInfo).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setProfileData({ ...profileData, character: key as Character })}
                  className="p-6 rounded-xl transition-all text-xl flex flex-col items-center"
                  style={{
                    backgroundColor: profileData.character === key ? '#7B8B4F' : '#F5F1E8',
                    color: profileData.character === key ? 'white' : '#4A3228',
                    border: `2px solid ${profileData.character === key ? '#7B8B4F' : '#E5E5E5'}`,
                  }}
                >
                  <ImageWithFallback 
                    src={info.image} 
                    alt={info.name}
                    className="w-24 h-24 object-contain mb-2"
                  />
                  <div>{info.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 선호 음악 장르 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: '#4A3228' }}>선호하는 음악 장르</p>
            <div className="grid grid-cols-2 gap-3">
              {mockGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    const isSelected = profileData.genreIds.includes(genre.id);
                    if (isSelected) {
                      setProfileData({
                        ...profileData,
                        genreIds: profileData.genreIds.filter((id: number) => id !== genre.id)
                      });
                    } else {
                      setProfileData({
                        ...profileData,
                        genreIds: [...profileData.genreIds, genre.id]
                      });
                    }
                  }}
                  className="p-5 rounded-xl transition-all text-xl"
                  style={{
                    backgroundColor: profileData.genreIds.includes(genre.id) ? '#7B8B4F' : '#F5F1E8',
                    color: profileData.genreIds.includes(genre.id) ? 'white' : '#4A3228',
                    border: `2px solid ${profileData.genreIds.includes(genre.id) ? '#7B8B4F' : '#E5E5E5'}`,
                  }}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* 장 버튼 */}
          <Button
            onClick={handleSaveProfile}
            className="w-full text-2xl py-8"
            style={{ backgroundColor: '#7B8B4F', color: 'white' }}
          >
            저장하기
          </Button>
        </Card>
      </div>
    );
  }

  // 워치 연동 화면
  if (currentView === 'watch-pairing') {
    return <WatchPairingView onBack={() => setCurrentView('main')} />;
  }

  // 메인 설정 화면
  return (
    <div className="p-6 space-y-6 min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <h1 className="text-4xl" style={{ color: '#4A3228' }}>
        설정
      </h1>

      {/* 프로필 카드 */}
      <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
        <button
          onClick={() => setCurrentView('profile')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2" style={{ borderColor: '#7B8B4F' }}>
              <AvatarImage src={profileData.profileImageUrl} />
              <AvatarFallback className="text-2xl" style={{ backgroundColor: '#7B8B4F', color: 'white' }}>
                {profileData.nickname?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-2xl mb-1" style={{ color: '#4A3228' }}>
                {profileData.nickname}
              </p>
              <p className="text-lg" style={{ color: '#4A3228', opacity: 0.6 }}>
                {profileData.email}
              </p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8" style={{ color: '#4A3228' }} />
        </button>
      </Card>

      {/* 화면 모드 */}
      <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
        <p className="text-2xl mb-4" style={{ color: '#4A3228' }}>화면 모드</p>
        <div className="space-y-3">
          <button
            onClick={() => setTheme('light')}
            className="w-full flex items-center justify-between p-5 rounded-xl"
            style={{
              backgroundColor: theme === 'light' ? '#7B8B4F20' : 'transparent',
              border: `2px solid ${theme === 'light' ? '#7B8B4F' : '#E5E5E5'}`,
            }}
          >
            <div className="flex items-center gap-4">
              <Sun className="w-8 h-8" style={{ color: '#4A3228' }} />
              <span className="text-xl" style={{ color: '#4A3228' }}>밝은 모드</span>
            </div>
            {theme === 'light' && (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#7B8B4F' }} />
            )}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className="w-full flex items-center justify-between p-5 rounded-xl"
            style={{
              backgroundColor: theme === 'dark' ? '#7B8B4F20' : 'transparent',
              border: `2px solid ${theme === 'dark' ? '#7B8B4F' : '#E5E5E5'}`,
            }}
          >
            <div className="flex items-center gap-4">
              <Moon className="w-8 h-8" style={{ color: '#4A3228' }} />
              <span className="text-xl" style={{ color: '#4A3228' }}>어두운 모드</span>
            </div>
            {theme === 'dark' && (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#7B8B4F' }} />
            )}
          </button>

          <button
            onClick={() => setTheme('easy')}
            className="w-full p-5 rounded-xl flex items-center justify-between"
            style={{
              backgroundColor: theme === 'easy' ? '#F5F1E8' : 'white',
              border: `2px solid ${theme === 'easy' ? '#7B8B4F' : '#E5E5E5'}`,
            }}
          >
            <div className="flex items-center gap-4">
              <Glasses className="w-8 h-8" style={{ color: '#4A3228' }} />
              <span className="text-xl" style={{ color: '#4A3228' }}>쉬운 사용 모드 (현재)</span>
            </div>
            {theme === 'easy' && (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#7B8B4F' }} />
            )}
          </button>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
        <p className="text-2xl mb-4" style={{ color: '#4A3228' }}>알림 설정</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F1E8' }}>
            <div className="flex items-center gap-3">
              <Bell className="w-7 h-7" style={{ color: '#4A3228' }} />
              <span className="text-xl" style={{ color: '#4A3228' }}>일기 작성 알림</span>
            </div>
            <Switch
              checked={notifications.diary}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, diary: checked });
                toast.success(checked ? '알림이 켜졌습니다' : '알림이 꺼졌습니다');
              }}
              className="scale-150"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F1E8' }}>
            <div className="flex items-center gap-3">
              <Bell className="w-7 h-7" style={{ color: '#4A3228' }} />
              <span className="text-xl" style={{ color: '#4A3228' }}>감정 분석 완료 알림</span>
            </div>
            <Switch
              checked={notifications.challenge}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, challenge: checked });
                toast.success(checked ? '알림이 켜졌습니다' : '알림이 꺼졌습니다');
              }}
              className="scale-150"
            />
          </div>
        </div>
      </Card>

      {/* 워치 연동 */}
      <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
        <button
          onClick={() => setCurrentView('watch-pairing')}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Watch className="w-8 h-8" style={{ color: '#7B8B4F' }} />
            <span className="text-xl" style={{ color: '#4A3228' }}>워치 연동</span>
          </div>
          <ChevronRight className="w-8 h-8" style={{ color: '#4A3228' }} />
        </button>
      </Card>

      {/* 건강 데이터 - 워치 연동되었을 때만 표시 */}
      {isWatchConnected && (
        <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
          <button
            onClick={() => setCurrentView('health')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8" style={{ color: '#7B8B4F' }} />
              <span className="text-xl" style={{ color: '#4A3228' }}>건강 데이터 연동</span>
            </div>
            <ChevronRight className="w-8 h-8" style={{ color: '#4A3228' }} />
          </button>
        </Card>
      )}

      {/* 로그아웃 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full text-2xl py-8"
            style={{ backgroundColor: '#5D3F35', color: 'white' }}
          >
            로그아웃
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">로그아웃 하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              로그아웃 후 다시 로그인할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xl py-6">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="text-xl py-6">
              로그아웃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 회원탈퇴 */}
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-sm text-red-600 underline">
              회원탈퇴
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">정말 탈퇴하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg">
                회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xl py-6">취소</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  toast.success('회원 탈퇴가 완료되었습니다.');
                  if (onLogout) onLogout();
                }} 
                className="text-xl py-6 bg-red-600 hover:bg-red-700"
              >
                탈퇴하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}