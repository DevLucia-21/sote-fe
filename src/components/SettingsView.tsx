import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  ArrowLeft,
  ChevronRight,
  Tag,
  Bell,
  Palette,
  Activity,
  Pencil,
  Plus,
  X,
  Lock,
  Shield,
  KeyRound,
  User,
  UserX,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Glasses,
  Watch
} from 'lucide-react';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { HealthDataView } from './HealthDataView';
import { WatchPairingView } from './settings/WatchPairingView';
import { mockKeywords } from './diary/mockData';
import { characterInfo as importedCharacterInfo, type CharacterType } from './common/characterImages';

type ViewType = 
  | 'main' 
  | 'profile' 
  | 'keywords'
  | 'health'
  | 'watch-pairing'
  | 'account-recovery'
  | 'find-email'
  | 'reset-temp';

interface SettingsViewProps {
  onBack?: () => void;
  onLogout?: () => void;
}

// Mock 데이터
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

const mockSecurityQuestions = [
  { id: 1, questionText: '가장 좋아하는 음식은?' },
  { id: 2, questionText: '첫 반려동물의 이름은?' },
  { id: 3, questionText: '태어난 도시는?' },
  { id: 4, questionText: '어릴 적 별명은?' },
  { id: 5, questionText: '가장 좋아하는 영화는?' },
];

const characterInfo = importedCharacterInfo;
type Character = CharacterType;

export function SettingsView({ onBack, onLogout }: SettingsViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('main');

  // Main Settings State
  const [dailyQuestion, setDailyQuestion] = useState(() => {
    const saved = localStorage.getItem('dailyQuestionEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [notifications, setNotifications] = useState({
    diary: true,
    challenge: true,
    emotionDone: false
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'easy'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'easy' || saved === 'light') ? saved : 'light';
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
    window.addEventListener('watchConnectionChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchConnectionChanged', handleStorageChange);
    };
  }, []);

  // Profile State - localStorage에서 불러오기
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

  // profileData 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);
  
  // Password change state
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Keywords State - localStorage에서 불러오거나 mockKeywords 사용
  const [keywords, setKeywords] = useState<{ id: number; content: string }[]>(() => {
    const saved = localStorage.getItem('userKeywords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockKeywords;
      }
    }
    return mockKeywords;
  });
  const [newKeyword, setNewKeyword] = useState('');

  // keywords 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('userKeywords', JSON.stringify(keywords));
  }, [keywords]);

  // Account Recovery State
  const [findEmailData, setFindEmailData] = useState({
    nickname: '',
    birthDate: '',
    securityQuestionId: '',
    securityAnswer: ''
  });
  const [resetTempData, setResetTempData] = useState({
    email: '',
    securityQuestionId: '',
    securityAnswer: ''
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'easy');
    
    // Add appropriate theme class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'easy') {
      root.classList.add('easy');
      // For easy theme, increase font size
      root.style.setProperty('--font-size', '18px');
    } else {
      // Reset font size for light theme
      root.style.setProperty('--font-size', '16px');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handlers
  const toggleAllNotifications = () => {
    const allOn = notifications.diary && notifications.challenge && notifications.emotionDone;
    const newValue = !allOn;
    setNotifications({
      diary: newValue,
      challenge: newValue,
      emotionDone: newValue
    });
    toast.success(newValue ? '모든 알림이 켜졌습니다' : '모든 알림이 꺼졌습니다');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('허용되지 않는 이미지 유형입니다. (jpeg/png만 허용)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 용량이 5MB를 초과했습니다.');
      return;
    }

    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ 
        ...prev, 
        profileImageUrl: reader.result as string,
        hasProfileImage: true 
      }));
    };
    reader.readAsDataURL(file);
    toast.success('이미지가 업로드되었습니다.');
  };

  const handleImageDelete = () => {
    setProfileImageFile(null);
    setProfileData(prev => ({ ...prev, profileImageUrl: '', hasProfileImage: false }));
    toast.success('이미지가 삭제되었습니다.');
  };

  const handleSaveProfile = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('프로필이 저장되었습니다.');
      setCurrentView('main');
    } catch (error) {
      toast.error('프로필 저장에 실패했습니다.');
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error('필수 입력 항목입니다.');
      return;
    }

    if (newKeyword.length > 50) {
      toast.error('키워드는 50자 이하로 입력해주세요.');
      return;
    }

    if (keywords.some(k => k.content === newKeyword.trim())) {
      toast.error('이미 등록된 키워드입니다.');
      return;
    }

    const newId = Math.max(...keywords.map(k => k.id), 0) + 1;
    setKeywords([...keywords, { id: newId, content: newKeyword.trim() }]);
    setNewKeyword('');
    toast.success('키워드가 추가되었습니다.');
  };

  const handleDeleteKeyword = async (id: number) => {
    setKeywords(keywords.filter(k => k.id !== id));
    toast.success('키워드가 삭제되었습니다.');
  };

  const handleFindEmail = async () => {
    if (!findEmailData.nickname || !findEmailData.birthDate || !findEmailData.securityQuestionId || !findEmailData.securityAnswer) {
      toast.error('필수 입력 항목입니다.');
      return;
    }
    toast.success('등록된 이메일: s***n@sote.app');
  };

  const handleResetTemp = async () => {
    if (!resetTempData.email || !resetTempData.securityQuestionId || !resetTempData.securityAnswer) {
      toast.error('필수 입력 항목입니다.');
      return;
    }
    toast.success('등록된 이메일로 임시 비밀번호를 보냈어요.');
    setCurrentView('account-recovery');
  };

  const handleDeleteAccount = async () => {
    toast.success('회원 탈퇴가 완료되었습니다.');
    if (onLogout) onLogout();
  };

  const toggleGenre = (genreId: number) => {
    setProfileData(prev => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...prev.genreIds, genreId]
    }));
  };

  const getSelectedGenreNames = () => {
    return profileData.genreIds.map(id => mockGenres.find(g => g.id === id)?.name || '').filter(Boolean).join(', ');
  };

  // Health Data View
  if (currentView === 'health') {
    return <HealthDataView onBack={() => setCurrentView('main')} />;
  }

  // Watch Pairing View
  if (currentView === 'watch-pairing') {
    return <WatchPairingView onBack={() => setCurrentView('main')} />;
  }

  // Profile View
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen p-4 space-y-4 bg-background">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="-ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>내 프로필</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-3">
                {profileData.profileImageUrl ? (
                  <AvatarImage src={profileData.profileImageUrl} />
                ) : (
                  <AvatarFallback className="bg-background text-foreground">
                    {profileData.nickname.slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary text-foreground"
                >
                  이미지 변경
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImageDelete}
                  className="border-border text-accent"
                >
                  이미지 삭제
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">jpeg/png, 5MB 이하</p>
            </div>

            <Separator style={{ backgroundColor: '#E6E0D6' }} />

            {/* Email (읽기 전용) */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>이메일</p>
              <Input
                value={profileData.email}
                disabled
                className="bg-gray-50 border"
                style={{ borderColor: '#E6E0D6' }}
              />
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
            </div>

            <Separator style={{ backgroundColor: '#E6E0D6' }} />

            {/* Password Change */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: '#4A3228' }}>비밀번호 변경</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPasswordFields(!showPasswordFields);
                    if (showPasswordFields) {
                      setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }
                  }}
                  style={{ color: '#7B8B4F' }}
                >
                  {showPasswordFields ? '취소' : '변경하기'}
                </Button>
              </div>
              
              {showPasswordFields && (
                <div className="space-y-3 mt-3">
                  <div>
                    <Label className="text-xs text-gray-600">현재 비밀번호</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showCurrentPwd ? 'text' : 'password'}
                        value={passwordChangeData.currentPassword}
                        onChange={(e) => setPasswordChangeData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="border pr-10"
                        style={{ borderColor: '#E6E0D6' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showCurrentPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">새 비밀번호</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showNewPwd ? 'text' : 'password'}
                        value={passwordChangeData.newPassword}
                        onChange={(e) => setPasswordChangeData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="border pr-10"
                        style={{ borderColor: '#E6E0D6' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">8자 이상, 특수문자 1개 이상 포함</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">새 비밀번호 확인</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={passwordChangeData.confirmPassword}
                        onChange={(e) => setPasswordChangeData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="border pr-10"
                        style={{ borderColor: '#E6E0D6' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      const { currentPassword, newPassword, confirmPassword } = passwordChangeData;
                      
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        toast.error('모든 필드를 입력해주세요.');
                        return;
                      }
                      
                      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
                      if (newPassword.length < 8 || !hasSpecial) {
                        toast.error('새 비밀번호는 8자 이상, 특수문자 1개 이상 포함해야 합니다.');
                        return;
                      }
                      
                      if (newPassword !== confirmPassword) {
                        toast.error('새 비밀번호가 일치하지 않습니다.');
                        return;
                      }
                      
                      toast.success('비밀번호가 변경되었습니다.');
                      setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswordFields(false);
                    }}
                    size="sm"
                    className="w-full text-white"
                    style={{ backgroundColor: '#7B8B4F' }}
                  >
                    비밀번호 변경
                  </Button>
                </div>
              )}
            </div>

            <Separator style={{ backgroundColor: '#E6E0D6' }} />

            {/* Nickname */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>닉네임</p>
              <Input
                value={profileData.nickname}
                onChange={(e) => {
                  const value = e.target.value;
                  const filtered = value.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/g, '');
                  setProfileData(prev => ({ ...prev, nickname: filtered.slice(0, 10) }));
                }}
                maxLength={10}
                className="border"
                style={{ borderColor: '#E6E0D6' }}
              />
              <p className="text-xs text-gray-500 mt-1">10자 이하, 특수문자 금지</p>
            </div>

            {/* Birth Date */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>생년월일</p>
              <Input
                type="date"
                value={profileData.birthDate}
                disabled
                className="border bg-gray-50"
                style={{ borderColor: '#E6E0D6', color: '#999' }}
              />
              <p className="text-xs text-gray-500 mt-1">생년월일은 변경할 수 없습니다</p>
            </div>

            {/* Character */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>캐릭터 (악기)</p>
              <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <div className="flex gap-3 pb-6">
                  {(Object.keys(characterInfo) as Character[]).map((char) => (
                    <button
                      key={char}
                      onClick={() => setProfileData(prev => ({ ...prev, character: char }))}
                      className={`flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all w-24 ${
                        profileData.character === char
                          ? 'border-[#7B8B4F] bg-[#F5F1E8]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {characterInfo[char].image ? (
                        <img 
                          src={characterInfo[char].image!} 
                          alt={characterInfo[char].name}
                          className="w-16 h-16 mb-2 object-contain"
                        />
                      ) : (
                        <span className="text-3xl mb-2">{characterInfo[char].icon}</span>
                      )}
                      <span className="text-xs text-gray-600 text-center leading-tight">{characterInfo[char].name}</span>
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Genres */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>선호하는 음악 장르</p>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {mockGenres.slice(0, 4).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant={profileData.genreIds.includes(genre.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={
                        profileData.genreIds.includes(genre.id)
                          ? { backgroundColor: '#7B8B4F', color: 'white' }
                          : { borderColor: '#E6E0D6' }
                      }
                      onClick={() => toggleGenre(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockGenres.slice(4).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant={profileData.genreIds.includes(genre.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={
                        profileData.genreIds.includes(genre.id)
                          ? { backgroundColor: '#7B8B4F', color: 'white' }
                          : { borderColor: '#E6E0D6' }
                      }
                      onClick={() => toggleGenre(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
              {profileData.genreIds.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">{profileData.genreIds.length}개 선택됨</p>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              className="w-full text-white"
              style={{ backgroundColor: '#7B8B4F' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E7C46'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7B8B4F'}
            >
              저장하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Keywords View
  if (currentView === 'keywords') {
    return (
      <div className="min-h-screen p-4 space-y-4 bg-background">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => setCurrentView('main')} className="-ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              나의 키워드
            </CardTitle>
            <CardDescription>감정을 표현하는 나만의 키워드를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 키워드 추가 */}
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value.slice(0, 50))}
                placeholder="새 키워드 추가 (최대 50자)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                className="border-border bg-background text-foreground"
              />
              <Button 
                onClick={handleAddKeyword}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                추가
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{newKeyword.length}/50</p>

            <Separator className="bg-border" />

            {/* 키워드 목록 */}
            <div className="space-y-2">
              <h4 className="text-sm text-foreground">
                내 키워드 ({keywords.length}개)
              </h4>
              {keywords.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  등록된 키워드가 없습니다.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge 
                      key={keyword.id} 
                      variant="outline" 
                      className="flex items-center gap-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800 transition-colors border-border text-foreground"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                    >
                      <span>{keyword.content}</span>
                      <X className="w-3 h-3 text-muted-foreground hover:text-red-500 dark:hover:text-red-400" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find Email View
  if (currentView === 'find-email') {
    return (
      <div className="min-h-screen p-4 space-y-4 bg-background">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => setCurrentView('profile')} className="-ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>아이디 찾기</CardTitle>
            <CardDescription>회원가입 시 입력한 정보를 입력해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>닉네임</p>
              <Input
                value={findEmailData.nickname}
                onChange={(e) => setFindEmailData(prev => ({ ...prev, nickname: e.target.value }))}
                placeholder="닉네임 입력"
                className="border"
                style={{ borderColor: '#E6E0D6' }}
              />
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>생년월일</p>
              <Input
                type="date"
                value={findEmailData.birthDate}
                onChange={(e) => setFindEmailData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="border"
                style={{ borderColor: '#E6E0D6' }}
              />
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 질문</p>
              <Select
                value={findEmailData.securityQuestionId}
                onValueChange={(value) => setFindEmailData(prev => ({ ...prev, securityQuestionId: value }))}
              >
                <SelectTrigger className="border" style={{ borderColor: '#E6E0D6' }}>
                  <SelectValue placeholder="보안 질문을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {mockSecurityQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.questionText}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 답변</p>
              <Input
                value={findEmailData.securityAnswer}
                onChange={(e) => setFindEmailData(prev => ({ ...prev, securityAnswer: e.target.value }))}
                placeholder="보안 답변을 입력하세요"
                className="border"
                style={{ borderColor: '#E6E0D6' }}
              />
            </div>

            <Button
              onClick={handleFindEmail}
              className="w-full text-white"
              style={{ backgroundColor: '#7B8B4F' }}
            >
              아이디 찾기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset Password View
  if (currentView === 'reset-temp') {
    return (
      <div className="min-h-screen p-4 space-y-4 bg-background">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => setCurrentView('profile')} className="-ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>비밀번호 찾기</CardTitle>
            <CardDescription>임시 비밀번호를 이메일로 받으실 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>이메일</p>
              <Input
                type="email"
                value={resetTempData.email}
                onChange={(e) => setResetTempData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일을 입력하세요"
                className="border"
                style={{ borderColor: '#E6E0D6' }}
              />
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 질문</p>
              <Select
                value={resetTempData.securityQuestionId}
                onValueChange={(value) => setResetTempData(prev => ({ ...prev, securityQuestionId: value }))}
              >
                <SelectTrigger className="border" style={{ borderColor: '#E6E0D6' }}>
                  <SelectValue placeholder="보안 질문을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {mockSecurityQuestions.map((q) => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.questionText}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 답변</p>
              <Input
                value={resetTempData.securityAnswer}
                onChange={(e) => setResetTempData(prev => ({ ...prev, securityAnswer: e.target.value }))}
                placeholder="보안 답변을 입력하세요"
                className="border"
                style={{ borderColor: '#E6E0D6' }}
              />
            </div>

            <Button
              onClick={handleResetTemp}
              className="w-full text-white"
              style={{ backgroundColor: '#7B8B4F' }}
            >
              임시 비밀번호 전송
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Settings View
  return (
    <div className="min-h-screen p-4 space-y-4 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="-ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
        </div>
        <h1 className="text-xl text-foreground">설정</h1>
        <Button 
          variant="ghost" 
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            toast.success('로그아웃 되었습니다.');
            setTimeout(() => {
              if (onLogout) {
                onLogout();
              } else {
                window.location.reload();
              }
            }, 500);
          }}
          style={{ color: '#C44545' }}
        >
          로그아웃
        </Button>
      </div>

      {/* Section A: Profile Card */}
      <Card 
        className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors relative"
        onClick={() => setCurrentView('profile')}
      >
        <CardContent className="!p-5">
          <button
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentView('profile');
            }}
          >
            <Pencil className="w-4 h-4 text-primary" />
          </button>
          
          <div className="flex flex-col items-center text-center mb-2">
            <Avatar className="w-24 h-24 mb-3">
              {profileData.profileImageUrl ? (
                <AvatarImage src={profileData.profileImageUrl} />
              ) : (
                <AvatarFallback className="bg-background text-foreground">
                  {profileData.nickname.slice(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <h3 className="font-medium text-lg text-foreground">{profileData.nickname}</h3>
          </div>

          <div className="flex items-center justify-between min-h-[48px] gap-2">
            <div className="flex-1 space-y-0.5">
              <p className="text-[13px] leading-[18px] text-gray-600">이메일: {profileData.email}</p>
              <p className="text-[13px] leading-[18px] text-gray-600">음악 취향: {getSelectedGenreNames()}</p>
            </div>
            {characterInfo[profileData.character].image ? (
              <img 
                src={characterInfo[profileData.character].image!} 
                alt={characterInfo[profileData.character].name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <span className="text-3xl">{characterInfo[profileData.character].icon}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section B: Daily Question */}
      <Card className="bg-card border-border">
        <CardContent className="!p-5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-base leading-5" style={{ color: '#4A3228' }}>하루 질문 받기</p>
              <p className="text-[13px] leading-[18px] text-gray-500 mt-0.5">일기 작성 시 매일 질문이 제공돼요.</p>
            </div>
            <Switch
              checked={dailyQuestion}
              onCheckedChange={(checked) => {
                setDailyQuestion(checked);
                localStorage.setItem('dailyQuestionEnabled', checked.toString());
                toast.success(checked ? '하루 질문이 활성화되었습니다' : '하루 질문이 비활성화되었습니다');
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section C: Keywords & Health Data */}
      <Card className="bg-card border-border">
        <CardContent className="!p-0 space-y-0">
          <button
            onClick={() => setCurrentView('keywords')}
            className="w-full flex items-center py-5 px-5 gap-2 hover:bg-gray-50 transition-colors"
          >
            <Tag className="w-5 h-5 flex-shrink-0" style={{ color: '#7B8B4F' }} />
            <div className="flex-1 text-left">
              <p className="text-base leading-5" style={{ color: '#4A3228' }}>나의 키워드</p>
              <p className="text-[13px] leading-[18px] text-gray-500 mt-0.5">감정 키워드 관리</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
          </button>
          
          <Separator style={{ backgroundColor: '#E6E0D6' }} />

          <button
            onClick={() => setCurrentView('watch-pairing')}
            className="w-full flex items-center py-5 px-5 gap-2 hover:bg-gray-50 transition-colors"
          >
            <Watch className="w-5 h-5 flex-shrink-0" style={{ color: '#7B8B4F' }} />
            <div className="flex-1 text-left">
              <p className="text-base leading-5" style={{ color: '#4A3228' }}>워치 연동하기</p>
              <p className="text-[13px] leading-[18px] text-gray-500 mt-0.5">갤럭시 워치 연결 및 관리</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
          </button>
          
          {isWatchConnected && (
            <>
              <Separator style={{ backgroundColor: '#E6E0D6' }} />

              <button
                onClick={() => setCurrentView('health')}
                className="w-full flex items-center py-5 px-5 gap-2 hover:bg-gray-50 transition-colors"
              >
                <Activity className="w-5 h-5 flex-shrink-0" style={{ color: '#7B8B4F' }} />
                <div className="flex-1 text-left">
                  <p className="text-base leading-5" style={{ color: '#4A3228' }}>건강 데이터</p>
                  <p className="text-[13px] leading-[18px] text-gray-500 mt-0.5">연동 및 권한 관리</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />
              </button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section D: Notifications */}
      <Card className="bg-card border-border">
        <CardContent className="!p-0 space-y-0">
          <div className="flex items-center py-5 px-5 gap-2">
            <h3 className="flex-1 text-base leading-5 font-semibold" style={{ color: '#4A3228' }}>알림</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAllNotifications}
              className="h-auto p-1 text-xs flex-shrink-0"
              style={{ color: '#7B8B4F' }}
            >
              {notifications.diary && notifications.challenge && notifications.emotionDone ? '전체 끄기' : '전체 켜기'}
            </Button>
          </div>

          <Separator style={{ backgroundColor: '#E6E0D6' }} />

          <div className="flex items-center py-5 px-5 gap-2">
            <div className="flex-1">
              <p className="text-base leading-5" style={{ color: '#4A3228' }}>오늘의 일기 작성 알림</p>
            </div>
            <Switch
              checked={notifications.diary}
              onCheckedChange={(checked) => {
                setNotifications(prev => ({ ...prev, diary: checked }));
                toast.success('저장됨');
              }}
            />
          </div>

          <Separator style={{ backgroundColor: '#E6E0D6' }} />

          <div className="flex items-center py-5 px-5 gap-2">
            <div className="flex-1">
              <p className="text-base leading-5" style={{ color: '#4A3228' }}>오늘의 챌린지 수행 알림</p>
            </div>
            <Switch
              checked={notifications.challenge}
              onCheckedChange={(checked) => {
                setNotifications(prev => ({ ...prev, challenge: checked }));
                toast.success('저장됨');
              }}
            />
          </div>

          <Separator style={{ backgroundColor: '#E6E0D6' }} />

          <div className="flex items-center py-5 px-5 gap-2">
            <div className="flex-1">
              <p className="text-base leading-5" style={{ color: '#4A3228' }}>감정 분석 완료 알림</p>
            </div>
            <Switch
              checked={notifications.emotionDone}
              onCheckedChange={(checked) => {
                setNotifications(prev => ({ ...prev, emotionDone: checked }));
                toast.success('저장됨');
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section E: Theme */}
      <Card className="bg-card border-border">
        <CardContent className="!p-5 space-y-3">
          <div className="flex items-center">
            <h3 className="text-base leading-5 font-semibold" style={{ color: '#4A3228' }}>테마</h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTheme('light');
                toast.success('라이트 모드가 적용되었습니다');
              }}
              className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                theme === 'light'
                  ? 'border-[#7B8B4F] bg-[#7B8B4F] text-white'
                  : 'border-[#7B3E2E] text-[#7B3E2E] bg-white'
              }`}
            >
              <Sun className="w-4 h-4" />
              <p className="text-sm">라이트</p>
            </button>
            <button
              onClick={() => {
                setTheme('dark');
                toast.success('다크 모드가 적용되었습니다');
              }}
              className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'border-[#7B8B4F] bg-[#7B8B4F] text-white'
                  : 'border-[#7B3E2E] text-[#7B3E2E] bg-white'
              }`}
            >
              <Moon className="w-4 h-4" />
              <p className="text-sm">다크</p>
            </button>
            <button
              onClick={() => {
                setTheme('easy');
                toast.success('이지 모드가 적용되었습니다');
              }}
              className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                theme === 'easy'
                  ? 'border-[#7B8B4F] bg-[#7B8B4F] text-white'
                  : 'border-[#7B3E2E] text-[#7B3E2E] bg-white'
              }`}
            >
              <Glasses className="w-4 h-4" />
              <p className="text-sm">이지</p>
            </button>
          </div>

          {/* Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-20 rounded-lg border-2" style={{
              borderColor: '#E6E0D6',
              backgroundColor: theme === 'light' ? '#FFFFFF' : theme === 'dark' ? '#2A2A2A' : '#FFFEF5'
            }}>
              <div className="p-2">
                {theme === 'easy' ? (
                  <>
                    <div className="w-full h-3 rounded mb-2" style={{ backgroundColor: '#7B8B4F', opacity: 0.6 }} />
                    <div className="w-3/4 h-3 rounded" style={{ backgroundColor: '#4A3228', opacity: 0.4 }} />
                  </>
                ) : (
                  <>
                    <div className="w-full h-2 rounded mb-1" style={{ backgroundColor: '#7B8B4F', opacity: 0.5 }} />
                    <div className="w-3/4 h-2 rounded" style={{ backgroundColor: '#4A3228', opacity: 0.3 }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer: Account Deletion */}
      <div className="flex justify-end pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-sm"
              style={{ color: '#8C8C8C' }}
            >
              회원 탈퇴
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                style={{ backgroundColor: '#7B3E2E' }}
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