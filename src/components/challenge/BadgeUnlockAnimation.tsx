import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BadgeWithStatus, EMOTION_COLORS } from './types';
import { Award, Sparkles, X } from 'lucide-react';

interface BadgeUnlockAnimationProps {
  badge: BadgeWithStatus | null;
  onClose: () => void;
}

export function BadgeUnlockAnimation({ badge, onClose }: BadgeUnlockAnimationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (badge) {
      // 약간의 딜레이 후 콘텐츠 표시
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [badge]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-sm w-full rounded-3xl p-8 shadow-2xl"
            style={{ backgroundColor: '#FFFFFF' }}
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-gray-100"
              onClick={onClose}
              style={{ color: '#4A3228' }}
            >
              <X size={20} />
            </button>

            {/* 반짝이는 효과 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: '#7B8B4F' }}
                  />
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {showContent && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* 타이틀 */}
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.4 }}
                    >
                      <h2 style={{ color: '#7B8B4F' }}>🎉 배지 획득!</h2>
                    </motion.div>
                    <p style={{ color: '#4A3228', opacity: 0.7 }}>
                      새로운 배지를 획득했어요
                    </p>
                  </div>

                  {/* 배지 아이콘 */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.5, damping: 15 }}
                    >
                      <motion.div
                        className="w-32 h-32 rounded-full flex items-center justify-center relative"
                        style={{
                          backgroundColor: badge.emotionType
                            ? EMOTION_COLORS[badge.emotionType].bg
                            : '#F5F1E8',
                        }}
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(123, 139, 79, 0)',
                            '0 0 0 20px rgba(123, 139, 79, 0)',
                            '0 0 0 0 rgba(123, 139, 79, 0)',
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 0.5,
                        }}
                      >
                        <Award
                          size={64}
                          style={{
                            color: badge.emotionType
                              ? EMOTION_COLORS[badge.emotionType].text
                              : '#7B8B4F',
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* 배지 정보 */}
                  <motion.div
                    className="text-center space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 style={{ color: '#4A3228' }}>
                      {badge.name}
                    </h3>
                    <p style={{ color: '#4A3228', opacity: 0.7 }}>
                      {badge.description}
                    </p>

                    {/* 조건 */}
                    <div
                      className="inline-block px-4 py-2 rounded-full"
                      style={{ backgroundColor: '#F5F1E8' }}
                    >
                      <span style={{ color: '#4A3228', opacity: 0.8 }}>
                        챌린지 {badge.conditionCount}회 완료
                      </span>
                    </div>
                  </motion.div>

                  {/* 확인 버튼 */}
                  <motion.button
                    className="w-full py-4 rounded-full transition-all active:scale-95"
                    style={{
                      backgroundColor: '#7B8B4F',
                      color: '#FFFFFF',
                    }}
                    onClick={onClose}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    확인
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
