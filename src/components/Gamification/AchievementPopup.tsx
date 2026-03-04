'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/GameContext';

export default function AchievementPopup() {
  const { notifications, dismissNotification } = useGame();

  // Auto-dismiss after 4s
  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[notifications.length - 1];
    const timer = setTimeout(() => {
      dismissNotification(latest.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notifications, dismissNotification]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.slice(-3).map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`rounded-xl shadow-lg p-4 cursor-pointer border ${
              notif.type === 'achievement'
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                : notif.type === 'level_up'
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  : 'bg-white border-gray-200'
            }`}
            onClick={() => dismissNotification(notif.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{notif.icon}</span>
              <div>
                <div className="font-semibold text-sm text-gray-800">{notif.title}</div>
                <div className="text-xs text-gray-500">{notif.message}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
