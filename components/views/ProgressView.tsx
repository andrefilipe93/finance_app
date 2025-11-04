import React from 'react';
import { useAppContext } from '../../context/AppContext';

const LEVEL_TITLES = [
  'Iniciante Financeiro', 'Aprendiz das Contas', 'Guardião do Orçamento',
  'Jovem Poupador', 'Mestre das Finanças', 'Sábio dos Investimentos',
  'Lorde da Poupança', 'Barão das Faturas', 'Duque do Dinheiro', 'Rei Financeiro'
];

const ProgressView: React.FC = () => {
  const { playerProfile, xpForNextLevel, allAchievements } = useAppContext();

  const progressPercentage = (playerProfile.xp / xpForNextLevel) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(playerProfile.level - 1, LEVEL_TITLES.length - 1)];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">O Meu Progresso</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
        <p className="font-semibold text-blue-500">{levelTitle}</p>
        <h2 className="text-4xl font-bold my-2">Nível {playerProfile.level}</h2>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 my-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {playerProfile.xp.toFixed(0)} / {xpForNextLevel} XP para o próximo nível
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Conquistas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements.map(achievement => {
            const isUnlocked = playerProfile.unlockedAchievements.includes(achievement.id);
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg flex items-start gap-4 border ${isUnlocked ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 opacity-70'}`}
              >
                <div className={`text-4xl ${!isUnlocked && 'grayscale'}`}>{achievement.icon}</div>
                <div>
                  <h3 className={`font-bold ${isUnlocked ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  {isUnlocked && (
                     <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">+{achievement.xp} XP</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
