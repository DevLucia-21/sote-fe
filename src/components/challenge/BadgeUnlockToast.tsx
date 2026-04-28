import { useEffect } from 'react';
import { Award, X } from 'lucide-react';
import { ChallengeBadgeResponse } from './types';
import { badgeImages } from '../../utils/badgeImages';

interface BadgeUnlockToastProps {
  badges: ChallengeBadgeResponse[];
  onClose: () => void;
  onOpenBadges?: () => void;
}

export function BadgeUnlockToast({ badges, onClose, onOpenBadges }: BadgeUnlockToastProps) {
  useEffect(() => {
    if (badges.length === 0) return;

    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [badges.length, onClose]);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-20 z-50 w-[calc(100vw-2rem)] max-w-sm space-y-2">
      {badges.map((badge) => {
        const image = badgeImages[badge.name] ?? badgeImages.default;

        return (
          <button
            type="button"
            key={badge.badgeId ?? badge.badgeDefinitionId ?? badge.name}
            onClick={onOpenBadges}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left shadow-lg transition-colors hover:bg-muted"
          >
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {image ? (
                <img src={image} alt={badge.name} className="h-9 w-9 object-contain" />
              ) : (
                <Award className="h-6 w-6 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">새 배지를 획득했어요!</p>
              <p className="truncate text-sm text-muted-foreground">{badge.name}</p>
            </div>

            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose();
                }
              }}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              aria-label="배지 알림 닫기"
            >
              <X className="h-4 w-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
