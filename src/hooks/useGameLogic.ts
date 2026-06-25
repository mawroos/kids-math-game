import { useState, useCallback } from 'react';
import { generateQuestions, Question } from '../utils/mathEngine';

export type GameState = 'start' | 'playing' | 'score';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const startGame = useCallback(() => {
    setQuestions(generateQuestions(40));
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
  }, []);

  const handleAnswer = useCallback(
    (isCorrect: boolean, timeTaken: number) => {
      if (isCorrect) {
        // Base score + speed bonus
        const speedBonus = timeTaken <= 2 ? 50 : 0;
        setScore((prev) => prev + 100 + speedBonus);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
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
    handleAnswer(false, 5); // Timeout means wrong answer, took 5 seconds
  }, [handleAnswer]);

  return {
    gameState,
    setGameState,
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    score,
    streak,
    startGame,
    handleAnswer,
    handleTimeout,
  };
}
