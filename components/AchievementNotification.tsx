import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { TrophyIcon } from './icons';

const AchievementNotification: React.FC = () => {
    const { achievementNotification, clearAchievementNotification } = useAppContext();

    useEffect(() => {
        if (achievementNotification) {
            const timer = setTimeout(() => {
                clearAchievementNotification();
            }, 5000); // Notification stays for 5 seconds

            return () => clearTimeout(timer);
        }
    }, [achievementNotification, clearAchievementNotification]);

    if (!achievementNotification) {
        return null;
    }

    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-sm animate-slide-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-green-300 dark:border-green-700">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-green-500 pt-1">
                        <TrophyIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-100">Conquista Desbloqueada!</p>
                        <p className="text-lg font-semibold mt-1">{achievementNotification.icon} {achievementNotification.name}</p>
                        <p className="text-sm font-bold text-green-500 mt-2">+{achievementNotification.xp} XP</p>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={clearAchievementNotification} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
                    </div>
                </div>
            </div>
             <style>{`
              @keyframes slide-in {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
              }
              .animate-slide-in {
                  animation: slide-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
              }
         `}</style>
        </div>
    );
};

export default AchievementNotification;
