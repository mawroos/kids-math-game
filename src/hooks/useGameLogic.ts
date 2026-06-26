import { useState, useCallback } from 'react';
import { generateQuestions, Question } from '../utils/mathEngine';

export type GameState = 'start' | 'playing' | 'score';

function getMultiplier(streak: number): number {
  if (streak >= 8) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function getAchievement(newStreak: number): string | null {
  if (newStreak === 3) return 'TRIPLE KILL! 🔥';
  if (newStreak === 5) return 'ON FIRE! 🔥🔥';
  if (newStreak === 8) return 'UNSTOPPABLE! ⚡';
  if (newStreak === 10) return 'LEGENDARY! 👑';
  if (newStreak > 10 && newStreak % 5 === 0) return 'GODLIKE! 💎';
  return null;
}

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastScoreGained, setLastScoreGained] = useState(0);
  const [achievement, setAchievement] = useState<string | null>(null);

  const startGame = useCallback(() => {
    setQuestions(generateQuestions(30));
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setLastScoreGained(0);
    setAchievement(null);
    setGameState('playing');
  }, []);

  const handleAnswer = useCallback(
    (isCorrect: boolean, timeTaken: number) => {
      if (isCorrect) {
        setStreak((prev) => {
          const newStreak = prev + 1;
          const multiplier = getMultiplier(prev);
          const speedBonus = timeTaken <= 2 ? 50 : timeTaken <= 5 ? 25 : 0;
          const earned = Math.floor((100 + speedBonus) * multiplier);
          setScore((s) => s + earned);
          setLastScoreGained(earned);
          const ach = getAchievement(newStreak);
          if (ach) setAchievement(ach);
          return newStreak;
        });
      } else {
        setStreak(0);
        setLastScoreGained(0);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setGameState('score');
      }
    },
    [currentQuestionIndex, questions.length]
  );

  const handleTimeout = useCallback(() => {
    handleAnswer(false, 15);
  }, [handleAnswer]);

  const clearAchievement = useCallback(() => setAchievement(null), []);

  return {
    gameState,
    setGameState,
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    score,
    streak,
    lastScoreGained,
    achievement,
    clearAchievement,
    startGame,
    handleAnswer,
    handleTimeout,
  };
}
