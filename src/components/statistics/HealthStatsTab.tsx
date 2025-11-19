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

interface DailyHealthSummary {
  date: string;
  avgHeartRate: number;
  avgHrv: number;
  avgSteps: number;

  sleepMinutes: number;
  waterMl: number;
  caffeineMg: number;
}

export function HealthStatsTab() {
  console.log("[HealthStatsTab] 렌더 시작");

  // ⭐ 워치 연동 토글
  const [connected, setConnected] = useState(false);

  const [health, setHealth] = useState<DailyHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const [waterInput, setWaterInput] = useState(0);
  const [caffeineInput, setCaffeineInput] = useState(0);

  const handlePairingNavigate = () => {
    console.log("[HealthStatsTab] handlePairingNavigate 호출됨");
  };

  // ============================================
  // 📌 오늘의 건강 데이터 조회
  // ============================================
  useEffect(() => {
    console.log("[HealthStatsTab] useEffect 실행, connected =", connected);

    if (!connected) {
      setHealth(null);
      return;
    }

    const fetchToday = async () => {
      try {
        console.log("[HealthStatsTab] 건강 데이터 요청 시작");
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
        setLoading(false);
      }
    };

    fetchToday();
  }, [connected]);

  // ============================================
  // API 요청 함수들
  // ============================================
  const saveSleep = async () => {
    try {
      const res = await api.post("/api/health/daily/sleep", {
        date: health?.date ?? "",
        minutes: health?.sleepMinutes,
      });

      setHealth(res.data);
    } catch (e) {
      console.error("수면 업데이트 실패:", e);
    }
  };

  const addWater = async (amount: number) => {
    try {
      const res = await api.post("/api/health/daily/water", {
        date: health?.date ?? "",
        amountMl: amount,
      });

      setHealth(res.data);
    } catch (e) {
      console.error("물 업데이트 실패:", e);
    }
  };

  const addCaffeine = async (amount: number) => {
    try {
      const res = await api.post("/api/health/daily/caffeine", {
        date: health?.date ?? "",
        amountMg: amount,
      });

      setHealth(res.data);
    } catch (e) {
      console.error("카페인 업데이트 실패:", e);
    }
  };

  return (
    <div className="space-y-6">

      {/* ⭐ 워치 연동 토글 */}
      <Card className="bg-white/70 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6" style={{ color: "#7B8B4F" }} />
          <span className="font-semibold">워치 연동</span>
        </div>

        {/* 토글 */}
        <button
          onClick={() => setConnected(!connected)}
          className={`
            relative w-14 h-7 rounded-full transition-all duration-300
            border flex items-center
            ${connected 
              ? "bg-[#7B8B4F] border-[#7B8B4F]" 
              : "bg-[#E5E0D6] border-[#C8C3B8]"}
          `}
        >
          <span
            className="
              w-5 h-5 rounded-full bg-white shadow-md block transition-all duration-300
            "
            style={{
              transform: connected ? "translateX(28px)" : "translateX(0px)",
            }}
          />
        </button>
      </Card>

      {/* ============================== */}
      {/* ⭐ 연결 Off → 메시지 */}
      {/* ============================== */}
      {!connected && (
        <Card className="bg-white/70 p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: "#7B8B4F", opacity: 0.4 }} />
          <h3 className="text-lg mb-2" style={{ color: "#4A3228" }}>건강 데이터 연동이 꺼져 있습니다</h3>
          <p className="text-sm text-muted-foreground">
            워치 연동을 켜면 건강 데이터를 볼 수 있어요.
          </p>
        </Card>
      )}

      {/* ============================== */}
      {/* ⭐ 연결 On → 아래 전체 UI 표시 */}
      {/* ============================== */}
      {connected && (
        <>
          {/* 스트레스 */}
          <WatchStressCard onNavigateToPairing={handlePairingNavigate} />

          {loading && (
            <Card className="bg-white/70 p-8 text-center">로딩 중...</Card>
          )}

          {!loading && !health && (
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

              {/* 걸음수 */}
              <Card className="bg-white/70 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Footprints className="w-10 h-10 mr-2" style={{ color: '#7B8B4F' }} />
                    걸음 수
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-2">
                  <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
                    {Number(health.avgSteps).toLocaleString()} 걸음
                  </div>
                </CardContent>
              </Card>

              {/* 수면 */}
              <Card className="bg-white/70 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Moon className="w-8 h-8 mr-2" style={{ color: '#5B6B8F' }} />
                    수면 시간
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      className="flex-1 p-3 rounded-lg border bg-white"
                      value={health.sleepMinutes}
                      onChange={(e) =>
                        setHealth({ ...health, sleepMinutes: Number(e.target.value) })
                      }
                    />
                    <button
                      onClick={saveSleep}
                      className="px-5 py-2 rounded-lg bg-[#5B6B8F] text-white font-semibold"
                    >
                      저장
                    </button>
                  </div>
                  <div className="text-center text-lg">
                    총합: {Math.floor(health.sleepMinutes / 60)}시간 {health.sleepMinutes % 60}분
                  </div>
                </CardContent>
              </Card>

              {/* 물 */}
              <Card className="bg-white/70 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Droplets className="w-10 h-10 mr-2" style={{ color: '#4A9EC4' }} />
                    물 섭취량
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[100, 200, 300].map((v) => (
                      <button
                        key={v}
                        onClick={() => addWater(v)}
                        className="py-2 rounded-lg bg-gray-100 font-semibold"
                      >
                        +{v}ml
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      className="flex-1 p-3 border rounded"
                      value={waterInput}
                      onChange={(e) => setWaterInput(Number(e.target.value))}
                    />
                    <button
                      onClick={() => addWater(waterInput)}
                      className="px-4 bg-[#4A9EC4] rounded-lg font-semibold text-white"
                    >
                      추가
                    </button>
                  </div>
                  <div className="text-center text-lg">총합: {health.waterMl} ml</div>
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
                  <div className="grid grid-cols-3 gap-3">
                    {[50, 100, 150].map((v) => (
                      <button
                        key={v}
                        onClick={() => addCaffeine(v)}
                        className="py-2 rounded-lg bg-gray-100 font-semibold"
                      >
                        +{v}mg
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      className="flex-1 p-3 border rounded"
                      value={caffeineInput}
                      onChange={(e) => setCaffeineInput(Number(e.target.value))}
                    />
                    <button
                      onClick={() => addCaffeine(caffeineInput)}
                      className="px-4 bg-[#7B3E2E] rounded-lg font-semibold text-white"
                    >
                      추가
                    </button>
                  </div>
                  <div className="text-center text-lg">총합: {health.caffeineMg} mg</div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
