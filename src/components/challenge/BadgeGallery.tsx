import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { BadgeCard } from './BadgeCard';
import { EmptyState } from './EmptyState';
import { BadgeWithStatus, ChallengeBadgeResponse, EmotionType, ChallengeCategory, EMOTION_LABELS, EMOTION_COLORS } from './types';
import { mockAllBadgeDefinitions } from './mockData';
import { Award, Filter, ArrowUpDown, Lock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { toast } from 'sonner@2.0.3';

type SortOrder = 'group' | 'latest';
type FilterType = 'all' | 'unlocked' | 'locked' | EmotionType | ChallengeCategory;

interface BadgeGalleryProps {
  onFetchBadges?: () => Promise<ChallengeBadgeResponse[]>;
}

interface BadgeGroup {
  title: string;
  badges: BadgeWithStatus[];
  type?: EmotionType | ChallengeCategory;
}

export function BadgeGallery({ onFetchBadges }: BadgeGalleryProps) {
  const [allBadges, setAllBadges] = useState<BadgeWithStatus[]>([]);
  const [badgeGroups, setBadgeGroups] = useState<BadgeGroup[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('group');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    loadBadges();
  }, []);

  // 정렬/필터 적용
  useEffect(() => {
    applyFiltersAndSort();
  }, [allBadges, sortOrder, filter]);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      let unlocked: ChallengeBadgeResponse[] = [];

      // 1) 부모에서 onFetchBadges가 내려오면 그것을 우선 사용
      if (onFetchBadges) {
        unlocked = await onFetchBadges();
      } else {
        // 2) 기본 API 사용
        const res = await api.get("/api/challenge/badges");
        unlocked = res.data || [];
      }

      // 3) unlocked를 map 형태로 정리 (badgeId 기준)
      const unlockedMap = new Map(unlocked.map(b => [b.badgeId, b]));

      // 4) 전체 배지 정의(mockAllBadgeDefinitions) + unlocked 병합
      const badgesWithStatus: BadgeWithStatus[] = mockAllBadgeDefinitions.map(def => {
        const info = unlockedMap.get(def.id);
        return {
          ...def,
          isUnlocked: !!info,
          awardedAt: info?.awardedAt,
          badgeId: info?.badgeId,
        };
      });

      setAllBadges(badgesWithStatus);
    } catch (error) {
      console.error("배지 로드 실패:", error);
      toast.error("배지를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...allBadges];

    // 필터 적용
    if (filter === 'unlocked') {
      result = result.filter(badge => badge.isUnlocked);
    } else if (filter === 'locked') {
      result = result.filter(badge => !badge.isUnlocked);
    } else if (filter !== 'all') {
      result = result.filter(
        badge =>
          badge.emotionType === filter || badge.category === filter
      );
    }

    if (sortOrder === 'group') {
      // 그룹별로 정리
      const groups: BadgeGroup[] = [];
      
      // 공통 배지 (첫 4개)
      const commonBadges = result.filter(b => !b.emotionType && !b.category);
      if (commonBadges.length > 0) {
        groups.push({
          title: '공통 배지',
          badges: commonBadges,
        });
      }
      
      // 감정별 배지
      const emotions: EmotionType[] = ['JOY', 'SADNESS', 'ANGER', 'APATHY', 'SENSITIVE'];
      emotions.forEach(emotion => {
        const emotionBadges = result.filter(b => b.emotionType === emotion);
        if (emotionBadges.length > 0) {
          groups.push({
            title: `${EMOTION_LABELS[emotion]} 배지`,
            badges: emotionBadges,
            type: emotion,
          });
        }
      });
      
      // 카테고리별 배지
      const categories: ChallengeCategory[] = ['운동', '루틴', '도전', '음악', '휴식', '창작'];
      categories.forEach(category => {
        const categoryBadges = result.filter(b => b.category === category);
        if (categoryBadges.length > 0) {
          groups.push({
            title: `${category} 배지`,
            badges: categoryBadges,
            type: category,
          });
        }
      });
      
      setBadgeGroups(groups);
    } else {
      // 최신순 정렬 (획득한 것 우선)
      result.sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        
        if (a.isUnlocked && b.isUnlocked && a.awardedAt && b.awardedAt) {
          return new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime();
        }
        
        return a.id - b.id;
      });
      
      setBadgeGroups([{ title: '모든 배지', badges: result }]);
    }
  };

  const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'group', label: '그룹별' },
    { value: 'latest', label: '최신순' },
  ];

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'unlocked', label: '획득' },
    { value: 'locked', label: '미획득' },
    { value: 'JOY', label: EMOTION_LABELS.JOY },
    { value: 'SADNESS', label: EMOTION_LABELS.SADNESS },
    { value: 'ANGER', label: EMOTION_LABELS.ANGER },
    { value: 'APATHY', label: EMOTION_LABELS.APATHY },
    { value: 'SENSITIVE', label: EMOTION_LABELS.SENSITIVE },
    { value: '운동', label: '운동' },
    { value: '루틴', label: '루틴' },
    { value: '도전', label: '도전' },
    { value: '음악', label: '음악' },
    { value: '휴식', label: '휴식' },
    { value: '창작', label: '창작' },
    { value: '명상', label: '명상' },
    { value: '사회', label: '사회' },
    { value: '놀이', label: '놀이' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* 툴바: 정렬 & 필터 - 전체 너비 고정 */}
      <div className="sticky top-0 left-0 right-0 z-40 bg-background border-b border-border -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 py-3 mb-6">
        <div className="space-y-3">
          {/* 정렬 */}
          <div className="filter-scroll-area flex items-center gap-2 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ArrowUpDown size={16} className="md:hidden text-primary" />
              <ArrowUpDown size={18} className="hidden md:block text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">정렬</span>
            </div>
            {sortOptions.map(option => (
              <button
                key={option.value}
                className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm border flex-shrink-0"
                style={{
                  backgroundColor: sortOrder === option.value ? '#7B8B4F' : 'transparent',
                  color: sortOrder === option.value ? '#FFFFFF' : undefined,
                  borderColor: sortOrder === option.value ? '#7B8B4F' : '#E5E5E5',
                }}
                onClick={() => setSortOrder(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 필터 */}
          <div className="filter-scroll-area flex items-center gap-2 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Filter size={16} className="md:hidden text-primary" />
              <Filter size={18} className="hidden md:block text-primary" />
              <span className="text-xs md:text-sm text-muted-foreground">필터</span>
            </div>
            {filterOptions.map(option => (
              <button
                key={option.value}
                className="px-2.5 py-1.5 md:px-4 md:py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm border flex-shrink-0"
                style={{
                  backgroundColor: filter === option.value ? '#5D3F35' : 'transparent',
                  color: filter === option.value ? '#FFFFFF' : undefined,
                  borderColor: filter === option.value ? '#5D3F35' : '#E5E5E5',
                }}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 배지 그룹별 표시 */}
      {badgeGroups.length === 0 ? (
        <div className="rounded-2xl shadow-sm bg-card">
          <EmptyState
            title="해당하는 배지가 없어요"
            description="다른 필터를 선택해보세요"
            icon={
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-muted">
                <Award size={40} className="text-primary" />
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-8 relative z-0">
          {badgeGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4 relative z-0">
              {/* 그룹 헤더 */}
              <div className="flex items-center gap-3">
                <h2 className="text-foreground">{group.title}</h2>
                {group.type && (
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: group.badges[0]?.emotionType
                        ? EMOTION_COLORS[group.badges[0].emotionType].bg
                        : '#F5F1E8',
                      color: group.badges[0]?.emotionType
                        ? EMOTION_COLORS[group.badges[0].emotionType].text
                        : '#5D3F35',
                      border: group.badges[0]?.emotionType
                        ? `1px solid ${EMOTION_COLORS[group.badges[0].emotionType].border}`
                        : 'none',
                    }}
                  >
                    {group.badges.filter(b => b.isUnlocked).length} / {group.badges.length}
                  </span>
                )}
              </div>

              {/* 배지 그리드 (항상 4열, 반응형) */}
              <div className="grid grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                {group.badges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    onClick={() => setSelectedBadge(badge)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 배지 상세 시트 */}
      <Sheet open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl px-4 md:px-8 bg-background">
          {selectedBadge && (
            <>
              <SheetHeader className="pt-6 pb-4">
                <SheetTitle className="text-center text-2xl text-foreground">
                  {selectedBadge.name}
                </SheetTitle>
                <SheetDescription className="text-center text-muted-foreground">
                  {selectedBadge.isUnlocked ? '획득한 배지입니다' : '아직 획득하지 못한 배지입니다'}
                </SheetDescription>
              </SheetHeader>
              
              <div className="pb-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {/* 배지 아이콘 카드 */}
                <div className="rounded-2xl p-6 shadow-lg bg-card">
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center shadow-md relative"
                      style={{
                        backgroundColor: selectedBadge.emotionType
                          ? EMOTION_COLORS[selectedBadge.emotionType].bg
                          : '#F5F1E8',
                        border: `4px solid ${selectedBadge.emotionType ? EMOTION_COLORS[selectedBadge.emotionType].border : '#E5E5E5'}`,
                        opacity: selectedBadge.isUnlocked ? 1 : 0.4,
                      }}
                    >
                      <Award
                        size={64}
                        style={{
                          color: selectedBadge.emotionType
                            ? EMOTION_COLORS[selectedBadge.emotionType].text
                            : '#7B8B4F',
                        }}
                      />
                      {!selectedBadge.isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(255, 215, 0, 0.5)' }}
                          >
                            <Lock size={32} style={{ color: '#4A3228', opacity: 0.6 }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 획득 상태 표시 */}
                  {!selectedBadge.isUnlocked ? (
                    <div className="rounded-lg p-3 flex items-center justify-center gap-2 bg-yellow-50 dark:bg-yellow-950/20">
                      <Lock size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        아직 획득하지 못한 배지입니다
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-lg p-3 flex items-center justify-center gap-2 bg-primary">
                      <Award size={16} className="text-white" />
                      <span className="text-sm text-white">
                        획득한 배지입니다
                      </span>
                    </div>
                  )}
                </div>

                {/* 배지 설명 카드 */}
                <div className="rounded-2xl p-5 shadow-md bg-card">
                  <h3 className="mb-3 text-primary">
                    배지 설명
                  </h3>
                  <p className="leading-relaxed text-foreground opacity-90">
                    {selectedBadge.description}
                  </p>
                </div>

                {/* 획득 조건 카드 */}
                <div className="rounded-2xl p-5 shadow-md bg-card">
                  <h3 className="mb-3 text-primary">
                    획득 조건
                  </h3>
                  <p className="leading-relaxed text-foreground opacity-90">
                    {selectedBadge.emotionType && selectedBadge.category && 
                      `${EMOTION_LABELS[selectedBadge.emotionType]} 감정의 ${selectedBadge.category} 챌린지 ${selectedBadge.conditionCount}회 완료`}
                    {selectedBadge.emotionType && !selectedBadge.category && 
                      `${EMOTION_LABELS[selectedBadge.emotionType]} 챌린지 ${selectedBadge.conditionCount}회 완료`}
                    {!selectedBadge.emotionType && selectedBadge.category && 
                      `${selectedBadge.category} 카테고리 챌린지 ${selectedBadge.conditionCount}회 완료`}
                    {!selectedBadge.emotionType && !selectedBadge.category && 
                      `챌린지 ${selectedBadge.conditionCount}회 완료`}
                  </p>
                </div>

                {/* 배지 정보 카드 */}
                <div className="rounded-2xl p-5 shadow-md bg-card">
                  <h3 className="mb-3 text-primary">
                    {selectedBadge.isUnlocked ? '획득 정보' : '배지 정보'}
                  </h3>
                  <div className="space-y-3">
                    {selectedBadge.emotionType && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">감정</span>
                        <span
                          className="px-3 py-1.5 rounded-full text-sm"
                          style={{
                            backgroundColor: EMOTION_COLORS[selectedBadge.emotionType].bg,
                            color: EMOTION_COLORS[selectedBadge.emotionType].text,
                            border: `1px solid ${EMOTION_COLORS[selectedBadge.emotionType].border}`,
                          }}
                        >
                          {EMOTION_LABELS[selectedBadge.emotionType]}
                        </span>
                      </div>
                    )}
                    {selectedBadge.category && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">카테고리</span>
                        <span className="px-3 py-1.5 rounded-full text-sm bg-accent text-white">
                          {selectedBadge.category}
                        </span>
                      </div>
                    )}
                    {selectedBadge.isUnlocked && selectedBadge.awardedAt && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">획득일</span>
                        <span className="text-foreground">
                          {new Date(selectedBadge.awardedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
