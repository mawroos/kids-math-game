'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import { Play, RotateCcw, Zap, Target, Star } from 'lucide-react';
import useSound from 'use-sound';

export default function Home() {
  const {
    gameState,
    score,
    streak,
    currentQuestionIndex,
    currentQuestion,
    startGame,
    handleAnswer,
    handleTimeout,
  } = useGameLogic();

  return (
    <main className="min-h-screen bg-slate-950 text-white font-comic overflow-hidden touch-none select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black -z-10" />

      <AnimatePresence mode="wait">
        {gameState === 'start' && <StartScreen key="start" onStart={startGame} />}
        {gameState === 'playing' && (
          <GameScreen
            key="game"
            currentQuestion={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={40}
            score={score}
            streak={streak}
            onAnswer={handleAnswer}
            onTimeout={handleTimeout}
          />
        )}
        {gameState === 'score' && (
          <ScoreScreen key="score" score={score} onRestart={startGame} />
        )}
      </AnimatePresence>
    </main>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  const [playStart] = useSound('/sounds/start.wav', { volume: 0.5 });

  const handleStart = () => {
    playStart();
    onStart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      className="h-screen flex flex-col items-center justify-center p-6 space-y-12 relative"
    >
      <motion.img
        src="/images/monster.svg"
        alt="Monster"
        className="w-48 h-48 absolute top-10 left-10 opacity-50 hidden md:block"
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />

      <motion.img
        src="/images/monster.svg"
        alt="Monster"
        className="w-32 h-32 absolute bottom-20 right-10 opacity-50 hidden md:block"
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />

      <div className="text-center space-y-4">
        <motion.h1
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-orange-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
        >
          GALACTIC
          <br />
          BRAIN BRAWLER
        </motion.h1>
        <p className="text-xl md:text-2xl text-indigo-300 font-bold tracking-wider">
          DEFEND THE GALAXY WITH MATH!
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="relative group overflow-hidden rounded-full bg-gradient-to-r from-green-400 to-emerald-600 px-12 py-6 text-3xl font-black text-white shadow-[0_0_40px_rgba(52,211,153,0.6)] z-10"
      >
        <span className="relative z-10 flex items-center gap-4">
          <Play fill="currentColor" size={32} />
          START BATTLE
        </span>
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-600 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </motion.div>
  );
}

function GameScreen({
  currentQuestion,
  currentIndex,
  totalQuestions,
  score,
  streak,
  onAnswer,
  onTimeout,
}: {
  currentQuestion: any;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  onAnswer: (isCorrect: boolean, timeTaken: number) => void;
  onTimeout: () => void;
}) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [monsterAction, setMonsterAction] = useState<'idle' | 'hit' | 'dodge'>('idle');

  const [playCorrect] = useSound('/sounds/correct.wav', { volume: 0.5 });
  const [playWrong] = useSound('/sounds/wrong.wav', { volume: 0.5 });
  const [playTick] = useSound('/sounds/tick.wav', { volume: 0.2 });
  const [playClick] = useSound('/sounds/click.wav', { volume: 0.2 });

  // Timer setup (5 seconds)
  const { timeLeft, start, stop, isActive } = useTimer(5, () => {
    setFeedback('wrong');
    setMonsterAction('dodge');
    playWrong();
    setInput(currentQuestion.answer.toString()); // Reveal correct answer on timeout
    setTimeout(() => {
      setFeedback(null);
      setMonsterAction('idle');
      setInput('');
      onTimeout();
    }, 1500); // Give 1.5 seconds to see the answer
  });

  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0 && isActive) {
      playTick();
    }
  }, [timeLeft, isActive, playTick]);


  useEffect(() => {
    start();
    setInput('');
    setFeedback(null);
    return () => stop();
  }, [currentQuestion, start, stop]);

  const handleKeyPress = (num: string) => {
    if (feedback) return; // Prevent input while showing feedback
    playClick();
    if (input.length < 3) {
      const newInput = input + num;
      setInput(newInput);

      // Auto submit if length matches answer length
      const answerStr = currentQuestion.answer.toString();
      if (newInput.length === answerStr.length) {
        checkAnswer(newInput);
      }
    }
  };

  const handleClear = () => {
    playClick();
    if (!feedback) setInput('');
  };

  const checkAnswer = (val: string) => {
    stop();
    const isCorrect = parseInt(val) === currentQuestion.answer;
    const timeTaken = 5 - timeLeft;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      playCorrect();
      setMonsterAction('hit');
    } else {
      playWrong();
      setMonsterAction('dodge');
    }

    setTimeout(() => {
      onAnswer(isCorrect, timeTaken);
      setFeedback(null);
      setMonsterAction('idle');
    }, 1000);
  };

  const isWarning = timeLeft <= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`h-screen flex flex-col ${feedback === 'wrong' ? 'animate-shake' : ''}`}
    >
      {/* Top Bar: Stats */}
      <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-md border-b border-indigo-900">
        <div className="flex items-center gap-2 text-pink-400 font-bold text-xl">
          <Target /> {currentIndex + 1} / {totalQuestions}
        </div>
        <div className="flex items-center gap-4">
          {streak > 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-orange-400 font-black text-xl animate-pulse"
            >
              <Zap fill="currentColor" /> {streak} COMBO!
            </motion.div>
          )}
          <div className="text-2xl font-black text-white bg-indigo-900/50 px-4 py-1 rounded-full border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            {score}
          </div>
        </div>
      </div>

      {/* Battle Zone (Top Half) */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        {/* Progress Bar */}
        <div className="absolute top-0 w-full h-4 bg-gray-800">
          <motion.div
            className={`h-full ${isWarning ? 'bg-red-500' : 'bg-green-400'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 5) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentQuestion.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] z-10"
            >
              {currentQuestion.numA} <span className="text-pink-500">×</span> {currentQuestion.numB}
            </motion.div>
          </AnimatePresence>

          {/* Monster Avatar */}
          <motion.div
            animate={
              monsterAction === 'idle' ? { y: [0, -10, 0] } :
              monsterAction === 'hit' ? { scale: [1, 0.8, 0], rotate: [0, 180], opacity: [1, 0] } :
              { x: [0, 50, -50, 0], y: [0, -20, 0] } // dodge
            }
            transition={monsterAction === 'idle' ? { repeat: Infinity, duration: 2 } : { duration: 0.5 }}
            className="w-32 h-32 md:w-48 md:h-48"
          >
            <img src="/images/monster.svg" alt="Enemy Monster" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
          </motion.div>
        </div>

        {/* Input Display */}
        <div className="mt-8 h-24 flex items-center justify-center">
          <span className={`text-6xl md:text-8xl font-black ${
            feedback === 'correct' ? 'text-green-400' :
            feedback === 'wrong' ? 'text-red-500' : 'text-indigo-200'
          }`}>
            {input || '?'}
          </span>
        </div>

        {/* Feedback Animations */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1.5, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 text-5xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(0,0,0,1)] rotate-12 z-20"
            >
              BOOM!
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1.5, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 text-5xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(0,0,0,1)] -rotate-12 z-20"
            >
              {timeLeft === 0 ? 'TOO SLOW!' : 'NOPE!'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Numpad Zone (Bottom Half) */}
      <div className="bg-slate-900 p-4 md:p-8 rounded-t-3xl border-t-4 border-indigo-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9, y: 4 }}
              onClick={() => handleKeyPress(num.toString())}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-4xl md:text-5xl font-black py-6 md:py-8 rounded-2xl shadow-[0_8px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] transition-all"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.9, y: 4 }}
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-400 text-white text-2xl md:text-3xl font-black py-6 md:py-8 rounded-2xl shadow-[0_8px_0_rgb(185,28,28)] active:shadow-[0_0px_0_rgb(185,28,28)] transition-all"
          >
            CLEAR
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9, y: 4 }}
            onClick={() => handleKeyPress('0')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-4xl md:text-5xl font-black py-6 md:py-8 rounded-2xl shadow-[0_8px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] transition-all"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9, y: 4 }}
            onClick={() => input && checkAnswer(input)}
            className="bg-green-500 hover:bg-green-400 text-white text-2xl md:text-3xl font-black py-6 md:py-8 rounded-2xl shadow-[0_8px_0_rgb(21,128,61)] active:shadow-[0_0px_0_rgb(21,128,61)] transition-all"
          >
            GO!
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  const [playEnd] = useSound('/sounds/end.wav', { volume: 0.5 });
  const [playClick] = useSound('/sounds/click.wav', { volume: 0.2 });

  useEffect(() => {
    playEnd();
  }, [playEnd]);

  const handleRestart = () => {
    playClick();
    onRestart();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex flex-col items-center justify-center p-6 space-y-12 bg-black/80 backdrop-blur-sm z-50 absolute inset-0"
    >
      <motion.img
        src="/images/monster.svg"
        alt="Monster"
        className="w-64 h-64 absolute opacity-20"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      <div className="text-center space-y-6">
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [-5, 5, 0] }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
        >
          MISSION COMPLETE!
        </motion.h2>

        <div className="bg-indigo-900/50 p-8 rounded-3xl border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.4)] relative">
          <Star className="absolute -top-6 -left-6 text-yellow-400 w-12 h-12 animate-pulse" fill="currentColor" />
          <Star className="absolute -bottom-6 -right-6 text-yellow-400 w-12 h-12 animate-pulse" fill="currentColor" />

          <p className="text-2xl text-indigo-200 mb-2 font-bold">FINAL SCORE</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-6xl md:text-8xl font-black text-white"
          >
            {score}
          </motion.p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRestart}
        className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 px-10 py-5 rounded-full text-2xl font-black shadow-[0_0_30px_rgba(236,72,153,0.5)] z-10"
      >
        <RotateCcw strokeWidth={3} />
        PLAY AGAIN
      </motion.button>
    </motion.div>
  );
}
