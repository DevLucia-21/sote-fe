import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { WatchStressCard } from './WatchStressCard';
import { 
  Activity, 
  Heart, 
  Footprints, 
  Moon, 
  Droplets, 
  Coffee
} from 'lucide-react';
import api from '../../services/api';

interface HealthStatsTabProps {
  isConnected?: boolean;
  onNavigateToPairing?: () => void;
}

interface DailyHealthSummary {
  date: string;
  avgHeartRate: number;
  avgHrv: number;
  avgSteps: number;

  sleepMinutes: number;
  waterMl: number;
  caffeineMg: number;
}

export function HealthStatsTab({ isConnected = true, onNavigateToPairing }: HealthStatsTabProps) {
  console.log("[HealthStatsTab] 렌더 시작, isConnected =", isConnected);
  
  const [health, setHealth] = useState<DailyHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [waterInput, setWaterInput] = useState(0);
  const [caffeineInput, setCaffeineInput] = useState(0);

  const handlePairingNavigate = () => {
    console.log("[HealthStatsTab] handlePairingNavigate 호출됨");
    if (onNavigateToPairing) {
      console.log("[HealthStatsTab] 부모의 onNavigateToPairing 실행");
      onNavigateToPairing();
    } else {
      console.warn("[HealthStatsTab] 부모 onNavigateToPairing이 없음!");
    }
  };

  // ============================================
  // 📌 오늘의 건강 데이터 조회
  // ============================================
  useEffect(() => {
    console.log("[HealthStatsTab] useEffect 실행, isConnected =", isConnected);

    if (!isConnected) {
      console.log("[HealthStatsTab] 연결 안됨 → 데이터 fetch 중단");
      return;
    }

    const fetchToday = async () => {
      try {
        console.log("[HealthStatsTab] 오늘의 건강 데이터 요청 시작");
        setLoading(true);

        const res = await api.get("/api/health/daily/today");
        console.log("[HealthStatsTab] 서버 응답:", res.data);

        const server = res.data;

        setHealth({
          date: server.date,
          avgHeartRate: server.avgHeartRate ?? 0,
          avgHrv: server.avgHrv ?? 0,
          avgSteps: server.avgSteps ?? 0,
          sleepMinutes: server.sleepMinutes ?? 0,
          waterMl: server.waterMl ?? 0,
          caffeineMg: server.caffeineMg ?? 0,
        });
      } catch (e) {
        console.error("[HealthStatsTab] 건강 데이터 조회 실패", e);
      } finally {
        console.log("[HealthStatsTab] 로딩 종료");
        setLoading(false);
      }
    };

    fetchToday();
  }, [isConnected]);

  // ============================================
  // 🌙 수면 시간 저장
  // ============================================
  const saveSleep = async () => {
    try {
      const res = await api.post("/api/health/daily/sleep", {
        date: health.date ?? "",  
        minutes: health.sleepMinutes,
      });

      setHealth(res.data);
    } catch (e) {
      console.error("수면 업데이트 실패:", e);
    }
  };

  // ============================================
  // 💧 수분 섭취량 추가 (증가량만)
  // ============================================
  const addWater = async (amount: number) => {
    try {
      const res = await api.post("/api/health/daily/water", {
        date: health.date ?? "",
        amountMl: amount, // 추가량만!
      });

      setHealth(res.data);
    } catch (e) {
      console.error("물 업데이트 실패:", e);
    }
  };

  // ============================================
  // ☕ 카페인 섭취 추가 (증가량만)
  // ============================================
  const addCaffeine = async (amount: number) => {
    try {
      const res = await api.post("/api/health/daily/caffeine", {
        date: health.date ?? "",
        amountMg: amount, // 증가량만!
      });

      setHealth(res.data);
    } catch (e) {
      console.error("카페인 업데이트 실패:", e);
    }
  };

  // ============================================
  // 🎉 렌더링
  // ============================================
  return (
    <div className="space-y-4">
      {/* 스트레스 데이터 */}
      <WatchStressCard onNavigateToPairing={handlePairingNavigate} />

      {/* 연결 안됨 UI */}
      {!isConnected && (
        <Card className="bg-white/70 backdrop-blur-sm border-border p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: "#7B8B4F", opacity: 0.4 }} />
          <h3 className="text-lg mb-2" style={{ color: "#4A3228" }}>건강 데이터 연동이 필요합니다</h3>
          <p className="text-sm text-muted-foreground">
            설정에서 건강 데이터를 연동하면<br />
            워치·모바일의 건강 통계가 표시됩니다.
          </p>
        </Card>
      )}

      {/* 로딩 표시 */}
      {isConnected && loading && (
        <Card className="bg-white/70 p-8 text-center">로딩 중...</Card>
      )}

      {/* 데이터 없음 */}
      {isConnected && !loading && !health && (
        <Card className="bg-white/70 p-8 text-center">데이터 없음</Card>
      )}

      {health && (
        <>
          {/* 심박수 */}
          <Card className="bg-white/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Heart className="w-10 h-10 mr-2" style={{ color: '#C44545' }} />
                평균 심박수
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-2">
              <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
                {Number(health.avgHeartRate)} <span className="text-xl text-muted-foreground">bpm</span>
              </div>
            </CardContent>
          </Card>

          {/* 걸음 수 */}
          <Card className="bg-white/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Footprints className="w-10 h-10 mr-2" style={{ color: '#7B8B4F' }} />
                걸음 수
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-2">
              <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
                {Number(health.avgSteps).toLocaleString()} <span className="text-xl text-muted-foreground">걸음</span>
              </div>
            </CardContent>
          </Card>

          {/* 수면 시간 */}
          <Card className="bg-white/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Moon className="w-8 h-8 mr-2" style={{ color: '#5B6B8F' }} />
                수면 시간
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* 입력 + 추가 버튼 */}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  className="flex-1 p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6B8F]/40"
                  value={health.sleepMinutes}
                  onChange={(e) =>
                    setHealth({
                      ...health,
                      sleepMinutes: Number(e.target.value)
                    })
                  }
                  placeholder="수면 시간 (분)"
                />

                <button
                  onClick={saveSleep}
                  className="px-5 py-2 rounded-lg bg-[#5B6B8F] font-semibold active:scale-95 transition"
                >
                  저장
                </button>
              </div>

              {/* 읽기 쉬운 표기 */}
              <div className="text-center text-[#4A3228] text-lg">
                오늘 총합:{' '}
                <span className="font-semibold">
                  {Math.floor(health.sleepMinutes / 60)}시간 {health.sleepMinutes % 60}분
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 수분 섭취 */}
          <Card className="bg-white/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Droplets className="w-10 h-10 mr-2" style={{ color: '#4A9EC4' }} />
                물 섭취량
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* 빠른 추가 버튼들 */}
              <div className="grid grid-cols-3 gap-3">
                {[100, 200, 300].map((v) => (
                  <button
                    key={v}
                    onClick={() => addWater(v)}  // ⚡ 즉시 증가량 API 호출
                    className="py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold active:scale-95 transition"
                  >
                    +{v}ml
                  </button>
                ))}
              </div>

              {/* 사용자 입력 */}
              <div className="flex gap-3">
                <input
                  type="number"
                  className="flex-1 p-3 border rounded bg-white"
                  value={waterInput}
                  onChange={(e) => setWaterInput(Number(e.target.value))}
                  placeholder="직접 입력 (ml)"
                />
                <button
                  onClick={() => addWater(waterInput)} // ⚡ 사용자 입력량만큼 추가
                  className="px-4 bg-[#4A9EC4] rounded-lg font-semibold active:scale-95 transition"
                >
                  추가
                </button>
              </div>

              {/* 총합 표시 */}
              <div className="text-center text-lg">
                오늘 총합: {health.waterMl} ml
              </div>
            </CardContent>
          </Card>

          {/* 카페인 */}
          <Card className="bg-white/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Coffee className="w-10 h-10 mr-2" style={{ color: '#7B3E2E' }} />
                카페인 섭취량
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* 빠른 추가 버튼들 */}
              <div className="grid grid-cols-3 gap-3">
                {[50, 100, 150].map((v) => (
                  <button
                    key={v}
                    onClick={() => addCaffeine(v)}  // ⚡ 즉시 증가량 추가
                    className="py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold active:scale-95 transition"
                  >
                    +{v}mg
                  </button>
                ))}
              </div>

              {/* 사용자 입력 */}
              <div className="flex gap-3">
                <input
                  type="number"
                  className="flex-1 p-3 border rounded bg-white"
                  value={caffeineInput}
                  onChange={(e) => setCaffeineInput(Number(e.target.value))}
                  placeholder="직접 입력 (mg)"
                />
                <button
                  onClick={() => addCaffeine(caffeineInput)} // ⚡ 적용
                  className="px-4 bg-[#7B3E2E] rounded-lg font-semibold active:scale-95 transition"
                >
                  추가
                </button>
              </div>

              {/* 총합 표시 */}
              <div className="text-center text-lg">
                오늘 총합: {health.caffeineMg} mg
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
