import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Music, ArrowLeft, Check, Eye, EyeOff, CalendarIcon, ChevronDown } from 'lucide-react';
import type { CaptionProps } from 'react-day-picker';
import { useNavigation } from 'react-day-picker';
import { characterInfo, type CharacterType } from './common/characterImages';
import { toast } from "sonner";

interface AuthScreenProps {
  onLogin: () => void;
  onBackToAuth: () => void;
}

interface Genre {
  id: number;
  name: string;
}

interface SecurityQuestion {
  id: number;
  questionText: string;
}

type Character = CharacterType;

// Custom Caption component for Calendar with working dropdowns
function CustomCaption(props: CaptionProps) {
  const { goToMonth } = useNavigation();
  const { displayMonth } = props;
  
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();
  
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  
  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), currentMonth);
    goToMonth(newDate);
    setYearOpen(false);
  };
  
  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentYear, parseInt(month));
    goToMonth(newDate);
    setMonthOpen(false);
  };
  
  return (
    <div className="flex justify-center items-center gap-1 mb-1 px-4 py-1">
      <Select value={currentYear.toString()} onValueChange={handleYearChange} open={yearOpen} onOpenChange={setYearOpen}>
        <SelectTrigger 
          className="w-[80px] h-8 border-gray-200 [&>svg]:hidden" 
          style={{ color: '#4A3228', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center justify-between w-full">
            <span>{currentYear}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {years.reverse().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={currentMonth.toString()} onValueChange={handleMonthChange} open={monthOpen} onOpenChange={setMonthOpen}>
        <SelectTrigger 
          className="w-[65px] h-8 border-gray-200 [&>svg]:hidden" 
          style={{ color: '#4A3228', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center justify-between w-full">
            <span>{String(currentMonth + 1).padStart(2, '0')}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month.toString()}>
              {String(month + 1).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AuthScreen({ onLogin, onBackToAuth }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'initial' | 'login' | 'signup' | 'findEmail' | 'findPassword' | 'complete' | 'emailResult' | 'passwordReset'>('initial');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    birthDate: '',
    character: '' as Character | '',
    securityQuestionId: '',
    securityAnswer: '',
    findSecurityQuestionId: '',
    findSecurityAnswer: ''
  });

  // Find result state
  const [foundEmail, setFoundEmail] = useState('');

  // Birth date picker
  const [birthDateObj, setBirthDateObj] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Multi-select genres
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  
  // API data
  const [genres, setGenres] = useState<Genre[]>([]);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([]);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // 보안 질문, 음악 장르 불러오기
  useEffect(() => {
    if (authMode === 'signup' || authMode === 'findEmail' || authMode === 'findPassword') {
      
      const fetchInitialData = async () => {
        try {
          // 1. 장르 불러오기
          const genreRes = await api.get("/api/genres");
          setGenres(genreRes.data);

          // 2. 보안 질문 불러오기
          const questionRes = await api.get("/api/security-questions");
          setSecurityQuestions(questionRes.data);

        } catch (err) {
          console.error("초기 데이터 불러오기 실패:", err);
          toast.error("정보를 불러오는 중 문제가 발생했습니다.");
        }
      };

      fetchInitialData();
    }
  }, [authMode]);

  // Update birthDate when calendar date changes
  useEffect(() => {
    if (birthDateObj) {
      const year = birthDateObj.getFullYear();
      const month = String(birthDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(birthDateObj.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setFormData(prev => ({ ...prev, birthDate: formattedDate }));
      if (errors.birthDate) {
        setErrors(prev => ({ ...prev, birthDate: '' }));
      }
      setIsCalendarOpen(false);
    }
  }, [birthDateObj]);

  // Format birth date input
  const handleBirthDateInput = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as YYYY-MM-DD
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 4);
      if (numbers.length > 4) {
        formatted += '-' + numbers.slice(4, 6);
      }
      if (numbers.length > 6) {
        formatted += '-' + numbers.slice(6, 8);
      }
    }
    
    handleInputChange('birthDate', formatted);
    
    // Try to parse the date for calendar sync
    if (formatted.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(formatted);
      if (!isNaN(date.getTime())) {
        setBirthDateObj(date);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: '필수 입력 항목입니다.' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다.' }));
      return false;
    }
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: '필수 입력 항목입니다.' }));
      return false;
    }
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    const isLongEnough = password.length >= 8;
    
    if (!hasSpecial || !isLongEnough) {
      setErrors(prev => ({ ...prev, password: '8자 이상, 특수문자 1개 이상 포함' }));
      return false;
    }
    return true;
  };

  const validateSignup = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = '필수 입력 항목입니다.';
    if (!formData.password) newErrors.password = '필수 입력 항목입니다.';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = '필수 입력 항목입니다.';
    if (!formData.nickname) newErrors.nickname = '필수 입력 항목입니다.';
    if (!formData.birthDate) newErrors.birthDate = '필수 입력 항목입니다.';
    if (!formData.character) newErrors.character = '캐릭터를 선택해주세요.';
    if (selectedGenres.length === 0) newErrors.genres = '최소 1개 이상 선택해주세요.';
    if (!formData.securityQuestionId) newErrors.securityQuestionId = '보안 질문을 선택해주세요.';
    if (!formData.securityAnswer) newErrors.securityAnswer = '필수 입력 항목입니다.';
    
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    
    if (formData.nickname.length > 50) {
      newErrors.nickname = '최대 50자까지 입력 가능합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateEmail(formData.email)) return;
    if (!validatePassword(formData.password)) return;
    if (!validateSignup()) return;
    
    setIsLoading(true);
    
    try {
      await api.post("/api/auth/signup", {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        birthDate: formData.birthDate,
        questionId: Number(formData.securityQuestionId),
        securityAnswer: formData.securityAnswer,
        character: formData.character,
        musicPreferences: selectedGenres,
      });

      setAuthMode('complete');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: "회원가입 중 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateEmail(formData.email)) return;
    if (!formData.password) {
      setErrors({ password: '필수 입력 항목입니다.' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await api.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('expiresIn', res.data.expiresIn);
      localStorage.setItem("user_id", res.data.userId);
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ password: "이메일 또는 비밀번호가 올바르지 않습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindEmail = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nickname) newErrors.nickname = '닉네임을 입력해주세요.';
    if (!formData.birthDate) newErrors.birthDate = '생년월일을 입력해주세요.';
    if (!formData.findSecurityQuestionId)
      newErrors.findSecurityQuestionId = '보안 질문을 선택해주세요.';
    if (!formData.findSecurityAnswer)
      newErrors.findSecurityAnswer = '보안 답변을 입력해주세요.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
    nickname: formData.nickname?.trim(),
    birthDate: formData.birthDate?.trim(),
    questionId: Number(formData.findSecurityQuestionId),
    securityAnswer: formData.findSecurityAnswer?.trim(),
  };
  console.log("📤[FindEmail] Sending payload to server:", payload);
  
    setIsLoading(true);

    try {
      const res = await api.post('/api/users/find-email', {
        nickname: formData.nickname.trim(),
        birthDate: formData.birthDate.trim(),
        questionId: Number(formData.findSecurityQuestionId),
        securityAnswer: formData.findSecurityAnswer.trim(),
      });

      setFoundEmail(res.data.email);
      setAuthMode('emailResult');

    } catch (error) {
      console.error('Find email error:', error);

      setErrors({
        findSecurityAnswer: '입력하신 정보가 일치하지 않습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindPassword = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(formData.email)) {
      return;
    }
    
    if (!formData.findSecurityQuestionId) {
      newErrors.findSecurityQuestionId = '보안 질문을 선택해주세요.';
    }
    if (!formData.findSecurityAnswer) {
      newErrors.findSecurityAnswer = '보안 답변을 입력해주세요.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.post("/api/users/find-pwd", {
        email: formData.email,
        questionId: Number(formData.findSecurityQuestionId),
        securityAnswer: formData.findSecurityAnswer,
      });

      await api.post("/api/users/password-reset-temp", {
        email: formData.email,
        questionId: Number(formData.findSecurityQuestionId),
        securityAnswer: formData.findSecurityAnswer,
      });
      
      setAuthMode('passwordReset');
    } catch (error) {
      console.error('Find password error:', error);
      setErrors({ findSecurityAnswer: '보안 질문 답변이 일치하지 않습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authMode === 'initial') {
    return (
      <div className="min-h-screen flex flex-col items-center px-8 pt-32 bg-background">
        <div className="flex items-center mb-8">
          <Music className="w-8 h-8 mr-2" style={{ color: '#4A3228' }} />
          <h1 className="text-3xl font-light" style={{ color: '#4A3228' }}>
            S<span className="text-primary">:</span>ote
          </h1>
        </div>
        
        <p className="text-sm text-muted-foreground mb-8">하루의 감정을, 한 줄의 멜로디로</p>

        <div className="w-full max-w-sm space-y-3">
          <Button 
            onClick={() => setAuthMode('login')}
            className="w-full h-12 hover:opacity-90"
            style={{ backgroundColor: '#4A3228', color: 'white' }}
          >
            로그인
          </Button>
          <Button 
            onClick={() => setAuthMode('signup')}
            variant="outline"
            className="w-full h-12 text-foreground transition-colors"
            style={{ borderColor: '#4A3228' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7B8B4F';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#7B8B4F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '';
              e.currentTarget.style.borderColor = '#4A3228';
            }}
          >
            회원가입
          </Button>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-gray-500 text-sm">Fluxion</p>
        </div>
      </div>
    );
  }

  if (authMode === 'login') {
    return (
      <div className="min-h-screen flex flex-col items-center px-8 pt-4 bg-background">
        <div className="w-full max-w-sm mb-8">
          <Button variant="ghost" onClick={() => setAuthMode('initial')} className="mb-6 -ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
          
          <div className="mb-6 pl-4">
            <h1 className="text-3xl font-light mb-2" style={{ color: '#4A3228' }}>
              S<span className="text-primary">:</span>ote
            </h1>
            <p className="text-sm text-muted-foreground">하루의 감정을, 한 줄의 멜로디로</p>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="이메일 입력"
                    className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  {!errors.email && <p className="text-xs text-gray-500 mt-1">30자 이하 입력 가능</p>}
                </div>

                <div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="비밀번호 입력"
                      className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                  style={{ backgroundColor: '#4A3228', color: 'white' }}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>

                <div className="flex justify-center items-center gap-1 text-sm">
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('findEmail')} 
                    className="hover:underline text-center leading-tight whitespace-nowrap"
                    style={{ color: '#4A3228' }}
                  >
                    이메일 찾기
                  </button>
                  <span style={{ color: '#4A3228' }}>|</span>
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('findPassword')} 
                    className="hover:underline text-center leading-tight whitespace-nowrap"
                    style={{ color: '#4A3228' }}
                  >
                    비밀번호 찾기
                  </button>
                  <span style={{ color: '#4A3228' }}>|</span>
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('signup')} 
                    className="hover:underline text-center leading-tight whitespace-nowrap"
                    style={{ color: '#4A3228' }}
                  >
                    회원가입
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-gray-500 text-sm">Fluxion</p>
        </div>
      </div>
    );
  }

  if (authMode === 'signup') {
    return (
      <div className="min-h-screen p-4 bg-background">
        <div className="max-w-md mx-auto py-4">
          <Button variant="ghost" onClick={() => setAuthMode('initial')} className="mb-6 -ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>

          <h2 className="text-2xl font-medium mb-6 text-center text-foreground">
            회원가입
          </h2>

          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-6">
              {/* Email */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>이메일</p>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="이메일 입력"
                  className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                {!errors.email && <p className="text-xs text-gray-500 mt-1">30자 이하 입력 가능</p>}
              </div>

              {/* Password */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>비밀번호</p>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="비밀번호 입력"
                    className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                {!errors.password && <p className="text-xs text-gray-500 mt-1">8자 이상, 특수문자 1개 이상 포함</p>}
              </div>

              {/* Password Confirm */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>비밀번호 확인</p>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={formData.passwordConfirm}
                    onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                    placeholder="비밀번호 확인"
                    className={`border ${errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>}
              </div>

              {/* Nickname */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>닉네임</p>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="닉네임 입력"
                  maxLength={50}
                  className={`border ${errors.nickname ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nickname && <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>}
                {!errors.nickname && (
                  <p className="text-xs text-gray-500 mt-1">10자 이하, 비속어 금지 ({formData.nickname.length}/50)</p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>생년월일</p>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => handleBirthDateInput(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className={`border pr-10 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={birthDateObj}
                        onSelect={setBirthDateObj}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        defaultMonth={birthDateObj || new Date(2000, 0)}
                        locale={{
                          localize: {
                            day: (n: number) => ['일', '월', '화', '수', '목', '금', '토'][n],
                          },
                          formatLong: {},
                          code: 'ko',
                          options: {},
                        } as any}
                        formatters={{
                          formatWeekdayName: (date: Date) => {
                            const days = ['일', '월', '화', '수', '목', '금', '토'];
                            return days[date.getDay()];
                          }
                        }}
                        components={{
                          Caption: CustomCaption
                        }}
                        classNames={{
                          months: "flex flex-col",
                          month: "flex flex-col gap-1",
                          table: "w-full border-collapse",
                          head_row: "grid grid-cols-7 gap-1",
                          head_cell: "w-8 h-8 flex items-center justify-center text-xs font-normal text-[#7B3E2E]",
                          row: "grid grid-cols-7 gap-1 mt-0.5",
                          cell: "w-8 h-8 p-0 relative flex items-center justify-center",
                          day: "w-8 h-8 p-0 font-normal text-xs flex items-center justify-center rounded-md hover:bg-gray-100",
                          day_selected: "bg-[#7B8B4F] text-white hover:bg-[#7B8B4F]",
                          day_today: "bg-[#F5F1E8] font-semibold",
                          day_outside: "text-gray-400",
                          day_disabled: "text-gray-300 opacity-50",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.birthDate && <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>}
                {!errors.birthDate && <p className="text-xs text-gray-500 mt-1">직접 입력하거나 캘린더에서 선택하세요</p>}
              </div>

              {/* Character Selection */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-sm" style={{ color: '#4A3228' }}>악기 선택</p>
                  <p className="text-xs text-gray-500">메인 캐릭터, 악보 재생이 가능합니다.</p>
                </div>
                <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                  <div className="flex gap-2 pb-4">
                    {(Object.keys(characterInfo) as Character[]).map((char) => (
                      <button
                        key={char}
                        onClick={() => handleInputChange('character', char)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all w-20 ${
                          formData.character === char
                            ? 'border-[#7B8B4F] bg-[#F5F1E8]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {characterInfo[char].image ? (
                          <img 
                            src={characterInfo[char].image!} 
                            alt={characterInfo[char].name}
                            className="w-12 h-12 mb-1 object-contain"
                          />
                        ) : (
                          <span className="text-2xl mb-1">{characterInfo[char].icon}</span>
                        )}
                        <span className="text-[10px] text-gray-600 text-center leading-tight">{characterInfo[char].name}</span>
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                {errors.character && <p className="text-xs text-red-500 mt-1">{errors.character}</p>}
              </div>

              {/* Music Preferences */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>선호하는 음악 장르</p>
                <div className="space-y-2 mt-2">
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(0, 4).map((genre) => (
                      <Badge
                        key={genre.id}
                        variant={selectedGenres.includes(genre.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        style={
                          selectedGenres.includes(genre.id)
                            ? { backgroundColor: '#7B8B4F', color: 'white' }
                            : {}
                        }
                        onClick={() => toggleGenre(genre.id)}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres.slice(4).map((genre) => (
                      <Badge
                        key={genre.id}
                        variant={selectedGenres.includes(genre.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        style={
                          selectedGenres.includes(genre.id)
                            ? { backgroundColor: '#7B8B4F', color: 'white' }
                            : {}
                        }
                        onClick={() => toggleGenre(genre.id)}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedGenres.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedGenres.length}개 선택됨
                  </p>
                )}
                {errors.genres && <p className="text-xs text-red-500 mt-1">{errors.genres}</p>}
              </div>

              {/* Security Question */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 질문</p>
                <Select 
                  value={formData.securityQuestionId} 
                  onValueChange={(value) => handleInputChange('securityQuestionId', value)}
                >
                  <SelectTrigger className={`border ${errors.securityQuestionId ? 'border-red-500' : 'border-gray-300'}`}>
                    <SelectValue placeholder="보안 질문을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {securityQuestions.map((q) => (
                      <SelectItem key={q.id} value={q.id.toString()}>
                        {q.questionText}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.securityQuestionId && <p className="text-xs text-red-500 mt-1">{errors.securityQuestionId}</p>}
              </div>

              {/* Security Answer */}
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 답변</p>
                <Input
                  id="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                  placeholder="보안 답변을 입력하세요"
                  className={`border ${errors.securityAnswer ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.securityAnswer && <p className="text-xs text-red-500 mt-1">{errors.securityAnswer}</p>}
              </div>

              <Button 
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full h-12"
                style={{ backgroundColor: '#4A3228', color: 'white' }}
              >
                {isLoading ? '가입 중...' : '가입하기'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (authMode === 'complete') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-32" style={{ backgroundColor: '#F5F1E8' }}>
        <Card className="w-full max-w-sm text-center bg-white">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#4A3228' }}>
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl mb-6" style={{ color: '#4A3228' }}>가입 완료</h3>
            <Button 
              onClick={() => setAuthMode('login')} 
              className="w-full h-12" 
              style={{ backgroundColor: '#4A3228', color: 'white' }}
            >
              로그인하러 가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 이메일 찾기
  if (authMode === 'findEmail') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-4 bg-background">
        <div className="w-full max-w-sm">
          <Button variant="ghost" onClick={() => setAuthMode('login')} className="mb-6 -ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-center text-foreground">이메일 찾기</CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-2">
                회원가입 시 등록한 보안 질문으로 이메일을 찾을 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleFindEmail(); }} className="space-y-4">
                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>닉네임</p>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className={`border ${errors.nickname ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nickname && <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>}
                </div>

                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>생년월일</p>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => handleBirthDateInput(e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className={`border pr-10 ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                    />

                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={birthDateObj}
                          onSelect={setBirthDateObj}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          defaultMonth={birthDateObj || new Date(2000, 0)}
                          components={{
                            Caption: CustomCaption
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {errors.birthDate && <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>}
                </div>
                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 질문</p>
                  <Select 
                    value={formData.findSecurityQuestionId} 
                    onValueChange={(value) => handleInputChange('findSecurityQuestionId', value)}
                  >
                    <SelectTrigger className={`border ${errors.findSecurityQuestionId ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="보안 질문을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {securityQuestions.map((q) => (
                        <SelectItem key={q.id} value={q.id.toString()}>
                          {q.questionText}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.findSecurityQuestionId && <p className="text-xs text-red-500 mt-1">{errors.findSecurityQuestionId}</p>}
                </div>

                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 답변</p>
                  <Input
                    id="findSecurityAnswer"
                    value={formData.findSecurityAnswer}
                    onChange={(e) => handleInputChange('findSecurityAnswer', e.target.value)}
                    placeholder="보안 답변을 입력하세요"
                    className={`border ${errors.findSecurityAnswer ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.findSecurityAnswer && <p className="text-xs text-red-500 mt-1">{errors.findSecurityAnswer}</p>}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                  style={{ backgroundColor: '#7B8B4F', color: 'white' }}
                >
                  {isLoading ? '확인 중...' : '이메일 찾기'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 이메일 찾기 결과
  if (authMode === 'emailResult') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-32 bg-background">
        <Card className="w-full max-w-sm text-center bg-card border-border">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#7B8B4F' }}>
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl mb-4 text-foreground">이메일을 찾았습니다</h3>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">가입하신 이메일</p>
              <p className="text-lg font-medium text-foreground">{foundEmail}</p>
            </div>
            <Button 
              onClick={() => {
                setAuthMode('login');
                setFormData(prev => ({ ...prev, email: foundEmail }));
              }} 
              className="w-full h-12" 
              style={{ backgroundColor: '#4A3228', color: 'white' }}
            >
              로그인하러 가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 비밀번호 찾기
  if (authMode === 'findPassword') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-4 bg-background">
        <div className="w-full max-w-sm">
          <Button variant="ghost" onClick={() => setAuthMode('login')} className="mb-6 -ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-center text-foreground">비밀번호 찾기</CardTitle>
              <p className="text-sm text-center text-muted-foreground mt-2">
                이메일과 보안 질문으로 비밀번호를 재설정할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleFindPassword(); }} className="space-y-4">
                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>이메일</p>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="이메일을 입력하세요"
                    className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 질문</p>
                  <Select 
                    value={formData.findSecurityQuestionId} 
                    onValueChange={(value) => handleInputChange('findSecurityQuestionId', value)}
                  >
                    <SelectTrigger className={`border ${errors.findSecurityQuestionId ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="보안 질문을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {securityQuestions.map((q) => (
                        <SelectItem key={q.id} value={q.id.toString()}>
                          {q.questionText}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.findSecurityQuestionId && <p className="text-xs text-red-500 mt-1">{errors.findSecurityQuestionId}</p>}
                </div>

                <div>
                  <p className="text-sm mb-2" style={{ color: '#4A3228' }}>보안 답변</p>
                  <Input
                    id="findSecurityAnswer"
                    value={formData.findSecurityAnswer}
                    onChange={(e) => handleInputChange('findSecurityAnswer', e.target.value)}
                    placeholder="보안 답변을 입력하세요"
                    className={`border ${errors.findSecurityAnswer ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.findSecurityAnswer && <p className="text-xs text-red-500 mt-1">{errors.findSecurityAnswer}</p>}
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                  style={{ backgroundColor: '#7B8B4F', color: 'white' }}
                >
                  {isLoading ? '확인 중...' : '비밀번호 재설정'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 비밀번호 재설정 완료
  if (authMode === 'passwordReset') {
    return (
      <div className="min-h-screen flex flex-col items-center p-4 pt-32 bg-background">
        <Card className="w-full max-w-sm text-center bg-card border-border">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#7B8B4F' }}>
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl mb-4 text-foreground">임시 비밀번호 전송 완료</h3>
            <p className="text-sm text-muted-foreground mb-6">
              등록하신 이메일 <span className="font-medium text-foreground">{formData.email}</span>로<br />
              임시 비밀번호가 전송되었습니다.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              이메일을 확인하신 후 로그인해주세요.<br />
              로그인 후 설정에서 비밀번호를 변경하실 수 있습니다.
            </p>
            <Button 
              onClick={() => setAuthMode('login')} 
              className="w-full h-12" 
              style={{ backgroundColor: '#4A3228', color: 'white' }}
            >
              로그인하러 가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}