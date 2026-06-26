import { useState, useCallback } from 'react';
import { generateQuestions, Question } from '../utils/mathEngine';

export type GameState = 'start' | 'countdown' | 'playing' | 'wave_complete' | 'score';
export type PowerUpType = 'FREEZE_TIME' | 'DOUBLE_POINTS' | 'SKIP';

export interface PowerUp {
  type: PowerUpType;
  used: boolean;
}

const WAVE_SIZE = 15;
export const TOTAL_QUESTIONS = 45;

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

const INITIAL_POWERUPS: PowerUp[] = [
  { type: 'FREEZE_TIME', used: false },
  { type: 'DOUBLE_POINTS', used: false },
  { type: 'SKIP', used: false },
];

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastScoreGained, setLastScoreGained] = useState(0);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [powerUps, setPowerUps] = useState<PowerUp[]>(INITIAL_POWERUPS);
  const [doublePointsActive, setDoublePointsActive] = useState(false);
  const [currentWave, setCurrentWave] = useState(1);
  const [waveJustCompleted, setWaveJustCompleted] = useState(0);

  const startGame = useCallback(() => {
    setQuestions(generateQuestions(TOTAL_QUESTIONS));
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setLastScoreGained(0);
    setAchievement(null);
    setPowerUps(INITIAL_POWERUPS.map((p) => ({ ...p })));
    setDoublePointsActive(false);
    setCurrentWave(1);
    setWaveJustCompleted(0);
    setGameState('countdown');
  }, []);

  const resumeFromWave = useCallback(() => {
    setGameState('playing');
  }, []);

  const advanceQuestion = useCallback(
    (nextIndex: number) => {
      if (nextIndex >= TOTAL_QUESTIONS) {
        setGameState('score');
      } else if (nextIndex > 0 && nextIndex % WAVE_SIZE === 0) {
        const waveNum = nextIndex / WAVE_SIZE;
        setWaveJustCompleted(waveNum);
        setCurrentWave(waveNum + 1);
        setCurrentQuestionIndex(nextIndex);
        setGameState('wave_complete');
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    },
    []
  );

  const handleAnswer = useCallback(
    (isCorrect: boolean, timeTaken: number) => {
      const isLucky = questions[currentQuestionIndex]?.isLucky ?? false;

      if (isCorrect) {
        setStreak((prev) => {
          const newStreak = prev + 1;
          const multiplier = getMultiplier(prev);
          const speedBonus = timeTaken <= 2 ? 50 : timeTaken <= 5 ? 25 : 0;
          let earned = Math.floor((100 + speedBonus) * multiplier);
          if (isLucky) earned = Math.floor(earned * 2);
          if (doublePointsActive) earned = Math.floor(earned * 2);
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

      if (doublePointsActive) setDoublePointsActive(false);

      advanceQuestion(currentQuestionIndex + 1);
    },
    [currentQuestionIndex, questions, doublePointsActive, advanceQuestion]
  );

  const handleTimeout = useCallback(() => {
    handleAnswer(false, 15);
  }, [handleAnswer]);

  const handleSkip = useCallback(() => {
    if (doublePointsActive) setDoublePointsActive(false);
    advanceQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, doublePointsActive, advanceQuestion]);

  const usePowerUp = useCallback((type: PowerUpType) => {
    setPowerUps((prev) => prev.map((p) => (p.type === type ? { ...p, used: true } : p)));
    if (type === 'DOUBLE_POINTS') setDoublePointsActive(true);
  }, []);

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
    resumeFromWave,
    handleAnswer,
    handleTimeout,
    handleSkip,
    powerUps,
    usePowerUp,
    doublePointsActive,
    currentWave,
    waveJustCompleted,
    totalQuestions: TOTAL_QUESTIONS,
  };
}
