import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ChevronRight, Sun, Moon, Glasses, Bell, Activity, Eye, EyeOff, Watch } from 'lucide-react';
import { toast } from 'sonner';
import { HealthDataView } from '../HealthDataView';
import { WatchPairingView } from '../settings/WatchPairingView';
import { characterInfo, type CharacterType } from '../common/characterImages';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type ViewType = 'main' | 'profile' | 'health' | 'watch-pairing';
type Character = CharacterType;

type NotificationKey =
  | 'diary'
  | 'challenge'
  | 'emotionDone'
  | 'musicRecommend'
  | 'weeklyStats'
  | 'reminderCustom';

type NotificationType =
  | 'DIARY'
  | 'CHALLENGE'
  | 'EMOTION_DONE'
  | 'MUSIC_RECOMMEND'
  | 'WEEKLY_STATS'
  | 'REMINDER_CUSTOM';

type NotificationState = Record<NotificationKey, boolean>;

const NOTIFICATION_TYPE_BY_KEY: Record<NotificationKey, NotificationType> = {
  diary: 'DIARY',
  challenge: 'CHALLENGE',
  emotionDone: 'EMOTION_DONE',
  musicRecommend: 'MUSIC_RECOMMEND',
  weeklyStats: 'WEEKLY_STATS',
  reminderCustom: 'REMINDER_CUSTOM',
};

const NOTIFICATION_KEYS = Object.keys(NOTIFICATION_TYPE_BY_KEY) as NotificationKey[];

const DEFAULT_NOTIFICATIONS: NotificationState = {
  diary: true,
  challenge: true,
  emotionDone: false,
  musicRecommend: false,
  weeklyStats: false,
  reminderCustom: false,
};

const toEnabledNotifications = (notificationState: NotificationState): NotificationType[] =>
  NOTIFICATION_KEYS
    .filter(key => notificationState[key])
    .map(key => NOTIFICATION_TYPE_BY_KEY[key]);

const fromEnabledNotifications = (enabledNotifications: unknown): NotificationState => {
  const enabledSet = new Set(
    Array.isArray(enabledNotifications) ? enabledNotifications : []
  );

  return NOTIFICATION_KEYS.reduce<NotificationState>((nextState, key) => {
    nextState[key] = enabledSet.has(NOTIFICATION_TYPE_BY_KEY[key]);
    return nextState;
  }, { ...DEFAULT_NOTIFICATIONS });
};

export function EasySettingsView({ onLogout }) {
  const [currentView, setCurrentView] = useState<ViewType>('main');

  // ✔ SettingsView와 동일한 데이터 구조
  const [profileData, setProfileData] = useState({
    email: '',
    nickname: '',
    birthDate: '',
    character: 'PIANO' as Character,
    hasProfileImage: false,
    profileImageUrl: '',
    genreIds: [] as number[]
  });

  // ✔ 알림 설정 (UI에는 2개만 표시하지만 내부 구조는 SettingsView 기반)
  const [notifications, setNotifications] = useState<NotificationState>(DEFAULT_NOTIFICATIONS);

  // ✔ 테마 (SettingsView API 구조 그대로)
  const [theme, setTheme] = useState<'light' | 'dark' | 'easy'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'easy' || saved === 'light')
      ? saved
      : 'light';
  });

  // ✔ 장르 목록 (실제 API 사용)
  const [genres, setGenres] = useState([]);

  // ✔ 프로필 이미지 파일 업로드용 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // ----- 워치 연동 상태 -----
  const [isWatchConnected, setIsWatchConnected] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('watchConnected') === 'true';
  });

  // ----- 패스워드 변경 state -----
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // --------------------------------------------------------
  // ⭐ 초기 로딩: SettingsView 구조 그대로 가져옴
  // --------------------------------------------------------
  useEffect(() => {
    let initialized = false;

    const loadAll = async () => {
      if (!initialized) {
        initialized = true;

        const profileRes = await api.get('/api/users/profile');
        const p = profileRes.data;

        setProfileData(prev => ({
          ...prev,
          email: p.email,
          nickname: p.nickname,
          birthDate: p.birthDate,
          character: p.character,
          hasProfileImage: p.hasProfileImage,
          profileImageUrl: p.profileImageUrl ? p.profileImageUrl : prev.profileImageUrl,
          genreIds: p.musicPreferenceIds || [],
        }));

        // 🔥 최초 진입시에만 실행
        if (p.hasProfileImage) {
          await fetchProfileImage();
        }

        try {
          const genreRes = await api.get('/api/genres');
          setGenres(genreRes.data);
        } catch (err) {
          console.error("장르 목록 불러오기 오류:", err);
        }
      }
    };

    loadAll();
  }, []);

  useEffect(() => {
    const loadSharedSettings = async () => {
      try {
        const [notifRes, themeRes] = await Promise.all([
          api.get('/api/settings/notifications'),
          api.get('/api/settings/theme'),
        ]);

        setNotifications(fromEnabledNotifications(notifRes.data.enabledNotifications));

        const savedTheme = localStorage.getItem('theme');
        const hasLocalTheme = savedTheme === 'dark' || savedTheme === 'easy' || savedTheme === 'light';
        if (!hasLocalTheme && typeof themeRes.data?.darkMode === 'boolean') {
          setTheme(themeRes.data.darkMode ? 'dark' : 'light');
        }
      } catch (err) {
        console.error('이지모드 알림/테마 설정 로딩 실패:', err);
      }
    };

    loadSharedSettings();
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('dark', 'easy');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'easy') {
      root.classList.add('easy');
      root.style.setProperty('--font-size', '18px');
    } else {
      root.style.setProperty('--font-size', '16px');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  // --------------------------------------------------------
  // ⭐ 프로필 이미지 불러오기 (SettingsView 그대로)
  // --------------------------------------------------------
  const fetchProfileImage = async () => {
    try {
      const res = await api.get("/api/users/profile/image", {
        responseType: "arraybuffer",
      });

      const base64 = btoa(
        new Uint8Array(res.data).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        )
      );

      const contentType = res.headers["content-type"];
      const finalUrl = `data:${contentType};base64,${base64}`;

      setProfileData(prev => ({
        ...prev,
        profileImageUrl: finalUrl,
        hasProfileImage: true,
      }));
    } catch (err) {
      console.error("프로필 이미지 조회 실패:", err);
    }
  };

  // --------------------------------------------------------
  // ⭐ 프로필 이미지 업로드 (SettingsView 방식 그대로)
  // --------------------------------------------------------
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 로컬 즉시 표시
    const localUrl = URL.createObjectURL(file);
    setProfileData(prev => ({
      ...prev,
      hasProfileImage: true,
      profileImageUrl: localUrl,
    }));

    try {
      const fd = new FormData();
      fd.append("image", file);

      // 2) 서버 업로드
      const res = await api.post("/api/users/profile/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 🚨 res.data = 문자열 하나임.
      const finalUrl = res.data;

      // 3) 서버 실제 URL로 덮어쓰기
      setProfileData(prev => ({
        ...prev,
        hasProfileImage: true,
        profileImageUrl: finalUrl,
      }));

      toast.success("프로필 사진이 변경되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("이미지 업로드 중 오류 발생");
    }
  };

  // --------------------------------------------------------
  // ⭐ 프로필 저장 (SettingsView 패턴 동일)
  // --------------------------------------------------------
  const handleSaveProfile = async () => {
    try {
      // 1) 프로필 정보 저장
      const req = {
        nickname: profileData.nickname,
        character: profileData.character,
        genreIds: profileData.genreIds,
      };

      await api.put("/api/users/profile", req);

      toast.success("프로필이 저장되었습니다.");
      setCurrentView("main");
    } catch (err) {
      console.error(err);
      toast.error("프로필 저장 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------------------------------
  // ⭐ 비밀번호 변경 (SettingsView 동일)
  // --------------------------------------------------------
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await api.put("/api/users/password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("비밀번호가 변경되었습니다.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error("현재 비밀번호가 틀립니다.");
    }
  };

  // --------------------------------------------------------
  // ⭐ 알림 설정 저장 (SettingsView API 완전 동일)
  // --------------------------------------------------------
  const updateNotification = async (key: "diary" | "challenge", checked: boolean) => {
    const previousState = notifications;
    try {
      // 먼저 상태 미리 반영
      const newState = {
        ...notifications,
        [key]: checked,
      };
      setNotifications(newState);

      // 정확한 enabledNotifications 구성
      const enabledList = [];
      if (newState.diary) enabledList.push("DIARY");
      if (newState.challenge) enabledList.push("CHALLENGE");

      // 서버 저장
      await api.put("/api/settings/notifications", {
        enabledNotifications: toEnabledNotifications(newState),
      });

      toast.success("알림 설정이 변경되었습니다.");
    } catch (err) {
      console.error("알림 설정 실패:", err);
      toast.error("알림 설정 중 오류 발생");
    }
  };

  // --------------------------------------------------------
  // ⭐ 테마 저장 (SettingsView와 동일)
  // --------------------------------------------------------
  const saveEasyNotificationSettings = async (
    nextNotifications: NotificationState,
    previousNotifications: NotificationState,
    successMessage = "알림 설정이 변경되었습니다."
  ) => {
    setNotifications(nextNotifications);

    try {
      await api.put("/api/settings/notifications", {
        enabledNotifications: toEnabledNotifications(nextNotifications),
      });

      toast.success(successMessage);
    } catch (err) {
      console.error("알림 설정 실패:", err);
      setNotifications(previousNotifications);
      toast.error("알림 설정 중 오류가 발생했습니다.");
    }
  };

  const updateEasyNotification = (key: NotificationKey, checked: boolean) => {
    const nextState = {
      ...notifications,
      [key]: checked,
    };

    void saveEasyNotificationSettings(nextState, notifications);
  };

  const updateEasyDiaryAnalysisNotification = (checked: boolean) => {
    const nextState = {
      ...notifications,
      emotionDone: checked,
      musicRecommend: checked,
    };

    void saveEasyNotificationSettings(nextState, notifications);
  };

  const updateTheme = async (mode: "light" | "dark" | "easy") => {
    try {
      // 1) React state 업데이트
      setTheme(mode);

      // 2) 서버 반영
      await api.patch("/api/settings/theme", { themeMode: mode });

      // 3) localStorage 저장
      localStorage.setItem("theme", mode);

      // 4) HTML 클래스 정리
      const root = document.documentElement;

      root.classList.remove("light", "dark", "easy");

      root.classList.add(mode);

      toast.success("화면 모드가 변경되었습니다.");
    } catch (err) {
      console.error("테마 변경 실패:", err);
      toast.error("화면 모드 변경 중 오류 발생");
    }
  };

  // --------------------------------------------------------
  // ⭐ 장르 선택 토글 (SettingsView 구조 그대로)
  // --------------------------------------------------------
  const toggleGenre = (id: number) => {
    setProfileData(prev => {
      const exists = prev.genreIds.includes(id);
      return {
        ...prev,
        genreIds: exists
          ? prev.genreIds.filter(g => g !== id)
          : [...prev.genreIds, id],
      };
    });
  };

    // --------------------------------------------------------
  // ⭐ 건강 데이터 화면
  // --------------------------------------------------------
  if (currentView === "health") {
    return <HealthDataView onBack={() => setCurrentView("main")} />;
  }

  // --------------------------------------------------------
  // ⭐ 프로필 편집 화면
  // --------------------------------------------------------
  if (currentView === "profile") {
    return (
      <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
        <Button
          onClick={() => setCurrentView("main")}
          className="text-xl py-6 px-8"
          style={{ backgroundColor: "#7B8B4F", color: "white" }}
        >
          ← 뒤로 가기
        </Button>

        <h1 className="text-4xl" style={{ color: "#4A3228" }}>
          프로필 편집
        </h1>

        <Card className="p-8 space-y-6" style={{ backgroundColor: "white", borderColor: "#E5E5E5" }}>
          {/* 프로필 사진 */}
          <div className="text-center">
            <p className="text-2xl mb-4" style={{ color: "#4A3228" }}>
              프로필 사진
            </p>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 border-4" style={{ borderColor: "#7B8B4F" }}>
                <AvatarImage src={profileData.profileImageUrl || undefined} />
                <AvatarFallback
                  className="text-3xl"
                  style={{ backgroundColor: "#7B8B4F", color: "white" }}
                >
                  {profileData.nickname?.charAt(0) || "U"}
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
                style={{ backgroundColor: "#7B8B4F", color: "white" }}
              >
                사진 변경하기
              </Button>
            </div>
          </div>

          {/* 이메일 (읽기 전용) */}
          <div>
            <p className="text-2xl mb-3" style={{ color: "#4A3228" }}>
              이메일
            </p>
            <Input
              value={profileData.email || ''}
              disabled
              className="text-xl p-6 bg-gray-100"
              style={{ borderColor: "#E5E5E5", color: "#999" }}
            />
            <p className="text-lg text-gray-500 mt-2">이메일은 변경할 수 없습니다</p>
          </div>

          {/* 비밀번호 변경 */}
          <div>
            <div className="flex items-center gap-4 mb-3">
              <p className="text-lg flex-1" style={{ color: "#4A3228" }}>
                비밀번호 변경
              </p>
              <Button
                onClick={() => {
                  setShowPasswordFields(!showPasswordFields);
                  if (showPasswordFields) {
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }
                }}
                className="text-lg py-2 px-4"
                style={{ backgroundColor: "#7B8B4F", color: "white" }}
              >
                {showPasswordFields ? "취소" : "변경하기"}
              </Button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 mt-4 p-4 rounded-xl" style={{ backgroundColor: "#F5F1E8" }}>
                {/* 현재 비밀번호 */}
                <div>
                  <p className="text-base mb-2" style={{ color: "#4A3228" }}>
                    현재 비밀번호
                  </p>
                  <div className="relative">
                    <Input
                      type={showCurrentPwd ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="text-lg p-4 pr-14"
                      style={{ borderColor: "#E5E5E5" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPwd ? (
                        <EyeOff className="w-6 h-6" style={{ color: "#4A3228" }} />
                      ) : (
                        <Eye className="w-6 h-6" style={{ color: "#4A3228" }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 새 비밀번호 */}
                <div>
                  <p className="text-base mb-2" style={{ color: "#4A3228" }}>
                    새 비밀번호
                  </p>
                  <div className="relative">
                    <Input
                      type={showNewPwd ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="text-lg p-4 pr-14"
                      style={{ borderColor: "#E5E5E5" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPwd ? (
                        <EyeOff className="w-6 h-6" style={{ color: "#4A3228" }} />
                      ) : (
                        <Eye className="w-6 h-6" style={{ color: "#4A3228" }} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">8자 이상, 특수문자 1개 이상 포함</p>
                </div>

                {/* 새 비밀번호 확인 */}
                <div>
                  <p className="text-base mb-2" style={{ color: "#4A3228" }}>
                    새 비밀번호 확인
                  </p>
                  <div className="relative">
                    <Input
                      type={showConfirmPwd ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="text-lg p-4 pr-14"
                      style={{ borderColor: "#E5E5E5" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPwd ? (
                        <EyeOff className="w-6 h-6" style={{ color: "#4A3228" }} />
                      ) : (
                        <Eye className="w-6 h-6" style={{ color: "#4A3228" }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <Button
                  onClick={handlePasswordChange}
                  className="w-full text-lg py-4"
                  style={{ backgroundColor: "#7B8B4F", color: "white" }}
                >
                  비밀번호 변경
                </Button>
              </div>
            )}
          </div>

          {/* 생년월일 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: "#4A3228" }}>
              생년월일
            </p>
            <Input
              type="date"
              value={profileData.birthDate || ''}
              disabled
              className="text-xl p-6 bg-gray-100"
              style={{ borderColor: "#E5E5E5", color: "#999" }}
            />
            <p className="text-base text-gray-500 mt-2">생년월일은 변경할 수 없습니다</p>
          </div>

          {/* 닉네임 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: "#4A3228" }}>
              이름
            </p>
            <Input
              value={profileData.nickname || ''}
              onChange={(e) => 
                setProfileData({ ...profileData, nickname: e.target.value })
              }
              className="text-xl p-6"
              style={{ borderColor: "#E5E5E5" }}
            />
          </div>

          {/* 악기 선택 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: "#4A3228" }}>
              좋아하는 악기
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(characterInfo).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setProfileData({ ...profileData, character: key as Character })}
                  className="p-6 rounded-xl transition-all text-xl flex flex-col items-center"
                  style={{
                    backgroundColor:
                      profileData.character === key ? "#7B8B4F" : "#F5F1E8",
                    color: profileData.character === key ? "white" : "#4A3228",
                    border: `2px solid ${
                      profileData.character === key ? "#7B8B4F" : "#E5E5E5"
                    }`,
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

          {/* 장르 선택 */}
          <div>
            <p className="text-2xl mb-3" style={{ color: "#4A3228" }}>
              선호하는 음악 장르
            </p>
            <div className="grid grid-cols-2 gap=3">
              {genres.map((genre: any) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className="p-5 rounded-xl transition-all text-xl"
                  style={{
                    backgroundColor: profileData.genreIds.includes(genre.id)
                      ? "#7B8B4F"
                      : "#F5F1E8",
                    color: profileData.genreIds.includes(genre.id)
                      ? "white"
                      : "#4A3228",
                    border: `2px solid ${
                      profileData.genreIds.includes(genre.id)
                        ? "#7B8B4F"
                        : "#E5E5E5"
                    }`,
                  }}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={handleSaveProfile}
            className="w-full text-2xl py-8"
            style={{ backgroundColor: "#7B8B4F", color: "white" }}
          >
            저장하기
          </Button>
        </Card>
      </div>
    );
  }

  // --------------------------------------------------------
  // ⭐ 워치 연동 화면
  // --------------------------------------------------------
  if (currentView === "watch-pairing") {
    return <WatchPairingView onBack={() => setCurrentView("main")} />;
  }

  // --------------------------------------------------------
  // ⭐ 메인 설정 화면
  // --------------------------------------------------------
  return (
    <div className="p-6 space-y-6 min-h-screen bg-background text-foreground">
      <h1 className="text-4xl" style={{ color: "#4A3228" }}>
        설정
      </h1>

      {/* 프로필 카드 */}
      <Card className="p-6 bg-card border border-border">
        <button
          onClick={() => setCurrentView("profile")}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2" style={{ borderColor: "#7B8B4F" }}>
              <AvatarImage src={profileData.profileImageUrl} />
              <AvatarFallback className="text-2xl" style={{ backgroundColor: "#7B8B4F", color: "white" }}>
                {profileData.nickname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-2xl mb-1" style={{ color: "#4A3228" }}>
                {profileData.nickname}
              </p>
              <p className="text-lg" style={{ color: "#4A3228", opacity: 0.6 }}>
                {profileData.email}
              </p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8" style={{ color: "#4A3228" }} />
        </button>
      </Card>

      {/* 화면 모드 */}
      <Card className="p-6 bg-card border border-border">
        <p className="text-2xl mb-4" style={{ color: "#4A3228" }}>
          화면 모드
        </p>
        <div className="space-y-3">
          {/* 라이트 */}
          <button
            onClick={() => {
              setTheme("light");
              toast.success("라이트 모드가 적용되었습니다");
            }}
            className="w-full flex items-center justify-between p-5 rounded-xl"
            style={{
              backgroundColor: theme === "light" ? "#7B8B4F20" : "transparent",
              border: `2px solid ${theme === "light" ? "#7B8B4F" : "#E5E5E5"}`,
            }}
          >
            <div className="flex items-center gap-4">
              <Sun className="w-8 h-8" style={{ color: "#4A3228" }} />
              <span className="text-xl" style={{ color: "#4A3228" }}>
                밝은 모드
              </span>
            </div>
            {theme === "light" && (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#7B8B4F" }} />
            )}
          </button>

          {/* 다크 */}
          <button
            onClick={() => {
              setTheme("dark");
              toast.success("다크 모드가 적용되었습니다");
            }}
            className="w-full flex items-center justify-between p-5 rounded-xl"
            style={{
              backgroundColor: theme === "dark" ? "#7B8B4F20" : "transparent",
              border: `2px solid ${theme === "dark" ? "#7B8B4F" : "#E5E5E5"}`,
            }}
          >
            <div className="flex items-center gap-4">
              <Moon className="w-8 h-8" style={{ color: "#4A3228" }} />
              <span className="text-xl" style={{ color: "#4A3228" }}>
                어두운 모드
              </span>
            </div>
            {theme === "dark" && (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#7B8B4F" }} />
            )}
          </button>

          {/* 이지 */}
          <button
            onClick={() => {
              setTheme("easy");
              toast.success("이지 모드가 적용되었습니다");
            }}
            className="w-full flex items-center justify-between p-5 rounded-xl"
            style={{
              backgroundColor: theme === "easy" ? "#F5F1E8" : "white",
              border: `2px solid ${theme === "easy" ? "#7B8B4F" : "#E5E5E5"}`,
            }}
          >
            <div className="flex items-center gap-4">
              <Glasses className="w-8 h-8" style={{ color: "#4A3228" }} />
              <span className="text-xl" style={{ color: "#4A3228" }}>
                쉬운 사용 모드 (현재)
              </span>
            </div>

            {theme === "easy" && (
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#7B8B4F" }} />
            )}
          </button>
        </div>
      </Card>

      {/* 알림 설정 */}
      <Card className="p-6 bg-card border border-border">
        <p className="text-2xl mb-4" style={{ color: "#4A3228" }}>
          알림 설정
        </p>

        <div className="space-y-4">
          {/* 일기알림 */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "#F5F1E8" }}>
            <div className="flex items-center gap-3">
              <Bell className="w-7 h-7" style={{ color: "#4A3228" }} />
              <span className="text-xl" style={{ color: "#4A3228" }}>일기 작성 알림</span>
            </div>

            <Switch
              checked={notifications.diary}
              onCheckedChange={(checked) => updateEasyNotification("diary", checked)}
              className="scale-150"
            />
          </div>

          {/* 감정 분석 알림 */}
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "#F5F1E8" }}>
            <div className="flex items-center gap-3">
              <Bell className="w-7 h-7" style={{ color: "#4A3228" }} />
              <span className="text-xl" style={{ color: "#4A3228" }}>감정 분석 완료 알림</span>
            </div>

            <Switch
              checked={notifications.emotionDone || notifications.musicRecommend}
              onCheckedChange={updateEasyDiaryAnalysisNotification}
              className="scale-150"
            />
          </div>
        </div>
      </Card>

      {/* 워치 연동 */}
      <Card className="p-6 bg-card border border-border">
        <button
          onClick={() => setCurrentView("watch-pairing")}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Watch className="w-8 h-8" style={{ color: "#7B8B4F" }} />
            <span className="text-xl" style={{ color: "#4A3228" }}>워치 연동</span>
          </div>
          <ChevronRight className="w-8 h-8" style={{ color: "#4A3228" }} />
        </button>
      </Card>

      {/* 건강 데이터 */}
      {isWatchConnected && (
        <Card className="p-6 bg-card border border-border">
          <button
            onClick={() => setCurrentView("health")}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8" style={{ color: "#7B8B4F" }} />
              <span className="text-xl" style={{ color: "#4A3228" }}>건강 데이터 연동</span>
            </div>
            <ChevronRight className="w-8 h-8" style={{ color: "#4A3228" }} />
          </button>
        </Card>
      )}

      {/* 로그아웃 */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full text-2xl py-8"
            style={{ backgroundColor: "#5D3F35", color: "white" }}
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
            <AlertDialogAction onClick={onLogout} className="text-xl py-6">
              로그아웃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 회원 탈퇴 */}
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-xl text-red-600 underline">회원탈퇴</button>
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
                  toast.success("회원 탈퇴가 완료되었습니다.");
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
