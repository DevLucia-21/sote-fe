import React, { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { EmotionChip } from './EmotionChip';
import { ChallengeCategory, EmotionType } from './types';
import { motion, AnimatePresence } from 'motion/react';

interface ChallengeCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  emotionType?: EmotionType;
  category?: ChallengeCategory;
  onComplete: () => Promise<void>;
  onViewReward?: () => void;
}

export function ChallengeCompleteDialog({
  open,
  onOpenChange,
  content,
  emotionType,
  category,
  onComplete,
  onViewReward,
}: ChallengeCompleteDialogProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
      setShowSuccess(true);
    } catch (error) {
      console.error('챌린지 완료 실패:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden" aria-describedby="challenge-complete-description">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="mb-4" style={{ color: '#4A3228' }}>
                챌린지 완료할까요?
              </h2>
              
              <div
                id="challenge-complete-description"
                className="p-4 rounded-xl mb-6"
                style={{ backgroundColor: '#F5F1E8' }}
              >
                <p className="mb-3 leading-relaxed" style={{ color: '#4A3228' }}>
                  {content}
                </p>
                <div className="flex gap-2">
                  {emotionType && <EmotionChip emotion={emotionType} />}
                  {category && (
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: '#5D3F35',
                        color: '#FFFFFF',
                        opacity: 0.8,
                      }}
                    >
                      {category}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={isCompleting}
                  style={{
                    borderColor: '#E5E5E5',
                    color: '#4A3228',
                  }}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={isCompleting}
                  style={{
                    backgroundColor: '#5D3F35',
                    color: '#FFFFFF',
                  }}
                >
                  {isCompleting ? '완료 중...' : '완료하기'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 text-center"
            >
              {/* 파티클 애니메이션 */}
              <div className="relative mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#7B8B4F' }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      d="M40 14L18 36L8 26"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                
                {/* 풍선 파티클 */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, y: 0, x: 0 }}
                    animate={{
                      opacity: 0,
                      y: -80,
                      x: Math.cos((i * Math.PI * 2) / 6) * 60,
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#7B8B4F', '#5D3F35', '#E67E22'][i % 3],
                    }}
                  />
                ))}
              </div>

              <h2 className="mb-2" style={{ color: '#4A3228' }}>
                완료했어요!
              </h2>
              <p id="challenge-complete-description" className="mb-6" style={{ color: '#4A3228', opacity: 0.7 }}>
                오늘의 LP 보상을 확인해 보세요
              </p>

              <div className="flex flex-col gap-2">
                {onViewReward && (
                  <Button
                    className="w-full"
                    onClick={onViewReward}
                    style={{
                      backgroundColor: '#7B8B4F',
                      color: '#FFFFFF',
                    }}
                  >
                    LP 보상 확인
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClose}
                  style={{
                    borderColor: '#E5E5E5',
                    color: '#4A3228',
                  }}
                >
                  닫기
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
