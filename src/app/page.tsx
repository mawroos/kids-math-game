'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useTimer } from '@/hooks/useTimer';
import { Play, RotateCcw, Zap, Target } from 'lucide-react';
import useSound from 'use-sound';
import dynamic from 'next/dynamic';
import { Question } from '@/utils/mathEngine';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// ── Monster variants ──────────────────────────────────────────────────────────

const MONSTERS = [
  // 0 Orange Blobster
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg0" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <path d="M 50 150 C 20 150, 10 80, 50 40 C 90 0, 150 20, 160 80 C 170 140, 100 190, 50 150" fill="url(#mg0)" />
      <circle cx="70" cy="70" r="20" fill="white" />
      <circle cx="70" cy="70" r="9" fill="#1e1b4b" />
      <circle cx="74" cy="66" r="4" fill="white" />
      <circle cx="120" cy="80" r="15" fill="white" />
      <circle cx="120" cy="80" r="7" fill="#1e1b4b" />
      <circle cx="124" cy="76" r="3" fill="white" />
      <path d="M 60 120 Q 90 145 130 112" stroke="#7c2d12" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 70 125 L 80 138 L 90 127 L 100 138 L 110 127" fill="white" />
    </svg>
  ),
  // 1 Blue Alien
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg1" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="115" rx="70" ry="65" fill="url(#mg1)" />
      {/* antenna */}
      <line x1="100" y1="50" x2="85" y2="15" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="85" cy="12" r="7" fill="#facc15" />
      <line x1="100" y1="50" x2="118" y2="18" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="118" cy="15" r="5" fill="#f472b6" />
      {/* eyes */}
      <ellipse cx="78" cy="100" rx="18" ry="22" fill="white" />
      <ellipse cx="122" cy="100" rx="18" ry="22" fill="white" />
      <circle cx="82" cy="100" r="10" fill="#312e81" />
      <circle cx="126" cy="100" r="10" fill="#312e81" />
      <circle cx="86" cy="95" r="4" fill="white" />
      <circle cx="130" cy="95" r="4" fill="white" />
      {/* mouth */}
      <path d="M 72 140 Q 100 155 128 140" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 82 142 L 88 150 L 100 143 L 112 150 L 118 142" fill="white" />
    </svg>
  ),
  // 2 Green Goblin
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg2" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
      </defs>
      {/* spiky body */}
      <path d="M100,30 L115,55 L145,45 L130,70 L165,75 L140,95 L160,120 L130,118 L125,155 L100,140 L75,155 L70,118 L40,120 L60,95 L35,75 L70,70 L55,45 L85,55 Z" fill="url(#mg2)" />
      {/* eyes */}
      <circle cx="80" cy="90" r="16" fill="#fef08a" />
      <circle cx="120" cy="90" r="16" fill="#fef08a" />
      <circle cx="83" cy="90" r="8" fill="#14532d" />
      <circle cx="123" cy="90" r="8" fill="#14532d" />
      <circle cx="87" cy="86" r="3" fill="white" />
      <circle cx="127" cy="86" r="3" fill="white" />
      {/* angry brows */}
      <line x1="66" y1="74" x2="90" y2="80" stroke="#14532d" strokeWidth="6" strokeLinecap="round" />
      <line x1="134" y1="74" x2="110" y2="80" stroke="#14532d" strokeWidth="6" strokeLinecap="round" />
      {/* jagged mouth */}
      <path d="M 68 118 L 78 108 L 88 118 L 100 105 L 112 118 L 122 108 L 132 118" stroke="#14532d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 68 118 L 78 108 L 88 118 L 100 105 L 112 118 L 122 108 L 132 118" fill="#14532d" opacity="0.3" />
    </svg>
  ),
  // 3 Purple Cyclops
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg3" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7e22ce" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="100" rx="75" ry="80" fill="url(#mg3)" />
      {/* single big eye */}
      <ellipse cx="100" cy="88" rx="32" ry="28" fill="white" />
      <circle cx="104" cy="88" r="18" fill="#4c1d95" />
      <circle cx="104" cy="88" r="10" fill="#7c3aed" />
      <circle cx="112" cy="80" r="5" fill="white" />
      {/* tentacles */}
      <path d="M 40 140 Q 30 170 50 175" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 65 155 Q 58 180 78 182" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 135 155 Q 142 180 122 182" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 160 140 Q 170 170 150 175" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* mouth */}
      <path d="M 68 128 Q 100 148 132 128" stroke="#6b21a8" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 80 131 L 88 141 L 100 132 L 112 141 L 120 131" fill="white" />
    </svg>
  ),
  // 4 Red Dragon
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg4" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
      </defs>
      {/* wings */}
      <path d="M 55 90 L 10 50 L 30 100 L 55 110 Z" fill="#ef4444" opacity="0.8" />
      <path d="M 145 90 L 190 50 L 170 100 L 145 110 Z" fill="#ef4444" opacity="0.8" />
      {/* body */}
      <ellipse cx="100" cy="115" rx="68" ry="65" fill="url(#mg4)" />
      {/* horns */}
      <polygon points="75,50 65,12 85,48" fill="#dc2626" />
      <polygon points="125,50 135,12 115,48" fill="#dc2626" />
      {/* eyes */}
      <ellipse cx="80" cy="95" rx="16" ry="14" fill="#fef08a" />
      <ellipse cx="120" cy="95" rx="16" ry="14" fill="#fef08a" />
      <ellipse cx="82" cy="95" rx="8" ry="10" fill="#1c1917" />
      <ellipse cx="122" cy="95" rx="8" ry="10" fill="#1c1917" />
      <circle cx="86" cy="90" r="3" fill="white" />
      <circle cx="126" cy="90" r="3" fill="white" />
      {/* fire breath */}
      <path d="M 80 148 Q 90 165 78 175 Q 95 162 100 178 Q 105 162 122 175 Q 110 165 120 148" fill="#fbbf24" opacity="0.9" />
      <path d="M 85 148 Q 95 160 84 168 Q 98 158 100 170 Q 102 158 116 168 Q 105 160 115 148" fill="#f97316" opacity="0.8" />
    </svg>
  ),
];

// ── Helper components ─────────────────────────────────────────────────────────

function ParticleBurst({ active }: { active: boolean }) {
  const emojis = ['⭐', '💥', '✨', '🌟', '💫', '🎉'];
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 120 + Math.random() * 60;
        return (
          <motion.div
            key={i}
            className="absolute text-2xl md:text-3xl"
            style={{ left: '50%', top: '40%' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: 0,
              scale: [0, 1.5, 0.8],
            }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            {emojis[i % emojis.length]}
          </motion.div>
        );
      })}
    </div>
  );
}

function FloatingScore({ score }: { score: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/3 -translate-x-1/2 pointer-events-none z-40 text-4xl md:text-5xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
      initial={{ y: 0, opacity: 1, scale: 0.8 }}
      animate={{ y: -120, opacity: 0, scale: 1.4 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    >
      +{score}
    </motion.div>
  );
}

function AchievementBanner({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="absolute top-1/4 left-0 right-0 flex justify-center z-50 pointer-events-none"
      initial={{ scale: 0, rotate: -12, y: -60 }}
      animate={{ scale: [1.4, 1.1], rotate: [6, 0], y: 0 }}
      exit={{ scale: 0, opacity: 0, y: -80 }}
      transition={{ type: 'spring', bounce: 0.55 }}
    >
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 px-8 py-3 rounded-full border-4 border-white shadow-[0_0_50px_rgba(251,191,36,0.9)]">
        <span className="text-2xl md:text-4xl font-black text-white drop-shadow-lg tracking-wide">
          {text}
        </span>
      </div>
    </motion.div>
  );
}

function MultiplierBadge({ multiplier }: { multiplier: number }) {
  if (multiplier <= 1) return null;
  const colors =
    multiplier >= 3
      ? 'from-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
      : multiplier >= 2
      ? 'from-purple-400 to-pink-500 shadow-[0_0_20px_rgba(192,132,252,0.7)]'
      : 'from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.7)]';

  return (
    <motion.div
      key={multiplier}
      initial={{ scale: 0 }}
      animate={{ scale: [1.3, 1] }}
      className={`bg-gradient-to-r ${colors} px-3 py-1 rounded-full text-white font-black text-lg border-2 border-white`}
    >
      {multiplier}x
    </motion.div>
  );
}

function StarRating({ score }: { score: number }) {
  const maxScore = 40 * 150 * 3; // max with 3x multiplier
  const pct = score / maxScore;
  const stars = pct >= 0.8 ? 5 : pct >= 0.6 ? 4 : pct >= 0.4 ? 3 : pct >= 0.2 ? 2 : 1;
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5 + i * 0.12, type: 'spring', bounce: 0.6 }}
          className={`text-4xl md:text-5xl ${i < stars ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]' : 'opacity-25'}`}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}

function getRank(score: number): { label: string; color: string } {
  const maxScore = 40 * 150 * 3;
  const pct = score / maxScore;
  if (pct >= 0.85) return { label: 'GALACTIC LEGEND 🌌', color: 'from-yellow-300 to-pink-400' };
  if (pct >= 0.65) return { label: 'STAR CHAMPION ⚡', color: 'from-purple-400 to-indigo-400' };
  if (pct >= 0.45) return { label: 'SPACE WARRIOR 🚀', color: 'from-cyan-400 to-blue-500' };
  if (pct >= 0.25) return { label: 'ROOKIE FIGHTER 🛡️', color: 'from-green-400 to-emerald-500' };
  return { label: 'CADET IN TRAINING 🎓', color: 'from-gray-400 to-slate-500' };
}

function BackgroundStars() {
  const stars = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    dur: Math.random() * 2 + 2,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: s.dur, delay: s.delay }}
        />
      ))}
    </div>
  );
}

// ── Main screens ──────────────────────────────────────────────────────────────

function Home() {
  const {
    gameState,
    score,
    streak,
    lastScoreGained,
    achievement,
    clearAchievement,
    currentQuestionIndex,
    currentQuestion,
    startGame,
    handleAnswer,
    handleTimeout,
  } = useGameLogic();

  return (
    <main className="min-h-dvh bg-slate-950 text-white font-comic overflow-hidden touch-none select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black -z-10" />
      <BackgroundStars />

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
            lastScoreGained={lastScoreGained}
            achievement={achievement}
            onClearAchievement={clearAchievement}
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

// ── Start Screen ──────────────────────────────────────────────────────────────

function StartScreen({ onStart }: { onStart: () => void }) {
  const [playStart] = useSound(`${BASE_PATH}/sounds/start.wav`, { volume: 0.5 });

  const handleStart = () => {
    playStart();
    onStart();
  };

  const MonsterA = MONSTERS[0];
  const MonsterB = MONSTERS[2];
  const MonsterC = MONSTERS[4];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -60 }}
      className="h-dvh flex flex-col items-center justify-center p-6 space-y-10 relative"
    >
      {/* Decorative monsters */}
      <motion.div
        className="w-36 h-36 absolute top-8 left-6 opacity-60 hidden md:block"
        animate={{ y: [0, -18, 0], rotate: [0, 6, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <MonsterA />
      </motion.div>
      <motion.div
        className="w-28 h-28 absolute bottom-16 right-8 opacity-60 hidden md:block"
        animate={{ y: [0, 18, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <MonsterB />
      </motion.div>
      <motion.div
        className="w-20 h-20 absolute top-16 right-16 opacity-40 hidden md:block"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
      >
        <MonsterC />
      </motion.div>

      {/* Title */}
      <div className="text-center space-y-3 relative z-10">
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-300 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] leading-none">
            GALACTIC
            <br />
            BRAIN BRAWLER
          </h1>
        </motion.div>
        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-lg md:text-2xl text-indigo-300 font-bold tracking-widest"
        >
          ⚔️ DEFEND THE GALAXY WITH MATH! ⚔️
        </motion.p>

        {/* feature pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['🔥 COMBO MULTIPLIERS', '⭐ SPEED BONUSES', '👑 EARN RANKS'].map((f) => (
            <span key={f} className="bg-indigo-800/70 border border-indigo-500 px-3 py-1 rounded-full text-xs md:text-sm text-indigo-200 font-bold">
              {f}
            </span>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={handleStart}
        className="relative group overflow-hidden rounded-full bg-gradient-to-r from-green-400 to-emerald-600 px-14 py-6 text-3xl font-black text-white shadow-[0_0_50px_rgba(52,211,153,0.7)] z-10"
      >
        <span className="relative z-10 flex items-center gap-4">
          <Play fill="currentColor" size={32} />
          START BATTLE!
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-300 opacity-0 group-hover:opacity-30"
          transition={{ duration: 0.2 }}
        />
      </motion.button>

      <p className="text-indigo-500 text-sm font-bold tracking-widest">40 QUESTIONS • BEAT YOUR BEST SCORE</p>
    </motion.div>
  );
}

// ── Game Screen ───────────────────────────────────────────────────────────────

function GameScreen({
  currentQuestion,
  currentIndex,
  totalQuestions,
  score,
  streak,
  lastScoreGained,
  achievement,
  onClearAchievement,
  onAnswer,
  onTimeout,
}: {
  currentQuestion: Question;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  lastScoreGained: number;
  achievement: string | null;
  onClearAchievement: () => void;
  onAnswer: (isCorrect: boolean, timeTaken: number) => void;
  onTimeout: () => void;
}) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [monsterAction, setMonsterAction] = useState<'idle' | 'hit' | 'dodge'>('idle');
  const [showParticles, setShowParticles] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const scoreKeyRef = useRef(0);

  const multiplier = streak >= 8 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
  const MonsterEl = MONSTERS[currentIndex % MONSTERS.length];

  const [playCorrect] = useSound(`${BASE_PATH}/sounds/correct.wav`, { volume: 0.5 });
  const [playWrong] = useSound(`${BASE_PATH}/sounds/wrong.wav`, { volume: 0.5 });
  const [playTick] = useSound(`${BASE_PATH}/sounds/tick.wav`, { volume: 0.2 });
  const [playClick] = useSound(`${BASE_PATH}/sounds/click.wav`, { volume: 0.2 });

  const { timeLeft, start, stop, isActive } = useTimer(15, () => {
    setFeedback('wrong');
    setMonsterAction('dodge');
    playWrong();
    setInput(currentQuestion.answer.toString());
    setTimeout(() => {
      setFeedback(null);
      setMonsterAction('idle');
      setInput('');
      onTimeout();
    }, 1500);
  });

  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0 && isActive) playTick();
  }, [timeLeft, isActive, playTick]);

  useEffect(() => {
    start();
    setInput('');
    setFeedback(null);
    setShowParticles(false);
    return () => stop();
  }, [currentQuestion, start, stop]);

  if (!currentQuestion) return null;

  const handleKeyPress = (num: string) => {
    if (feedback) return;
    playClick();
    if (input.length < 3) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === currentQuestion.answer.toString().length) {
        checkAnswer(newInput);
      }
    }
  };

  const handleClear = () => {
    playClick();
    if (!feedback) setInput('');
  };

  const checkAnswer = (val: string) => {
    if (feedback) return;
    stop();
    const isCorrect = parseInt(val) === currentQuestion.answer;
    const timeTaken = 15 - timeLeft;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      playCorrect();
      setMonsterAction('hit');
      setShowParticles(true);
      scoreKeyRef.current += 1;
      setShowScore(true);
      setTimeout(() => setShowScore(false), 1200);
    } else {
      playWrong();
      setMonsterAction('dodge');
    }

    setTimeout(() => {
      onAnswer(isCorrect, timeTaken);
      setFeedback(null);
      setMonsterAction('idle');
      setShowParticles(false);
    }, 1000);
  };

  const isWarning = timeLeft <= 5;
  const timerPct = (timeLeft / 15) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`h-dvh flex flex-col ${feedback === 'wrong' ? 'animate-shake' : ''}`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/50 backdrop-blur-md border-b border-indigo-900">
        <div className="flex items-center gap-2 text-pink-400 font-bold text-lg">
          <Target size={20} /> {currentIndex + 1} / {totalQuestions}
        </div>
        <div className="flex items-center gap-3">
          {streak > 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-orange-400 font-black text-lg animate-pulse-fast"
            >
              <Zap fill="currentColor" size={18} /> {streak} COMBO!
            </motion.div>
          )}
          <MultiplierBadge multiplier={multiplier} />
          <div className="text-xl font-black text-white bg-indigo-900/60 px-4 py-1 rounded-full border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            {score}
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-3 bg-gray-800 relative">
        <motion.div
          className={`h-full transition-colors ${isWarning ? 'bg-red-500' : timeLeft <= 8 ? 'bg-yellow-400' : 'bg-green-400'}`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
        {isWarning && (
          <motion.div
            className="absolute inset-0 bg-red-500 opacity-30"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        )}
      </div>

      {/* Battle Zone */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4">
        {/* Achievement banner */}
        <AnimatePresence>
          {achievement && (
            <AchievementBanner key={achievement} text={achievement} onDone={onClearAchievement} />
          )}
        </AnimatePresence>

        {/* Floating score */}
        <AnimatePresence>
          {showScore && lastScoreGained > 0 && (
            <FloatingScore key={scoreKeyRef.current} score={lastScoreGained} />
          )}
        </AnimatePresence>

        {/* Particle burst */}
        <ParticleBurst active={showParticles} />

        {/* Question + Monster */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentQuestion.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="text-6xl md:text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
            >
              {currentQuestion.numA} <span className="text-pink-500">×</span> {currentQuestion.numB}
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={
              monsterAction === 'idle'
                ? { y: [0, -12, 0] }
                : monsterAction === 'hit'
                ? { scale: [1, 1.2, 0], rotate: [0, 20, 180], opacity: [1, 1, 0] }
                : { x: [0, 55, -55, 25, -25, 0], y: [0, -15, 0] }
            }
            transition={monsterAction === 'idle' ? { repeat: Infinity, duration: 2 } : { duration: 0.5 }}
            className="w-28 h-28 md:w-44 md:h-44 drop-shadow-[0_0_20px_rgba(255,80,80,0.5)]"
          >
            <MonsterEl />
          </motion.div>
        </div>

        {/* Answer display */}
        <div className="mt-6 h-20 flex items-center justify-center">
          <motion.span
            key={input}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-5xl md:text-7xl font-black ${
              feedback === 'correct'
                ? 'text-green-400'
                : feedback === 'wrong'
                ? 'text-red-500'
                : 'text-indigo-200'
            }`}
          >
            {input || '?'}
          </motion.span>
        </div>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [2, 1.2], opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 text-5xl md:text-6xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.9)] rotate-12 z-20"
            >
              BOOM! 💥
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [2, 1.2], opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 text-5xl md:text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] -rotate-12 z-20"
            >
              {timeLeft === 0 ? '⏰ TOO SLOW!' : '❌ NOPE!'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak fire indicator */}
        {streak >= 5 && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl font-black text-orange-400"
          >
            {streak >= 8 ? '🔥🔥🔥 ON ABSOLUTE FIRE! 🔥🔥🔥' : '🔥🔥 BLAZING HOT! 🔥🔥'}
          </motion.div>
        )}
      </div>

      {/* Numpad */}
      <div className="bg-slate-900 p-3 md:p-6 rounded-t-3xl border-t-4 border-indigo-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.88, y: 5 }}
              onClick={() => handleKeyPress(num.toString())}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-3xl md:text-5xl font-black py-5 md:py-7 rounded-2xl shadow-[0_7px_0_rgb(55,48,163)] active:shadow-none transition-shadow"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.88, y: 5 }}
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-400 text-white text-xl md:text-3xl font-black py-5 md:py-7 rounded-2xl shadow-[0_7px_0_rgb(153,27,27)] active:shadow-none transition-shadow"
          >
            ✕ CLR
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88, y: 5 }}
            onClick={() => handleKeyPress('0')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-3xl md:text-5xl font-black py-5 md:py-7 rounded-2xl shadow-[0_7px_0_rgb(55,48,163)] active:shadow-none transition-shadow"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88, y: 5 }}
            onClick={() => input && checkAnswer(input)}
            className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xl md:text-3xl font-black py-5 md:py-7 rounded-2xl shadow-[0_7px_0_rgb(21,128,61)] active:shadow-none transition-shadow"
          >
            ✓ GO!
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Score Screen ──────────────────────────────────────────────────────────────

function ScoreScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  const [playEnd] = useSound(`${BASE_PATH}/sounds/end.wav`, { volume: 0.5 });
  const [playClick] = useSound(`${BASE_PATH}/sounds/click.wav`, { volume: 0.2 });
  const [displayScore, setDisplayScore] = useState(0);
  const rank = getRank(score);

  useEffect(() => {
    playEnd();
    let cur = 0;
    const step = Math.ceil(score / 60);
    const t = setInterval(() => {
      cur = Math.min(cur + step, score);
      setDisplayScore(cur);
      if (cur >= score) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [playEnd, score]);

  const handleRestart = () => {
    playClick();
    onRestart();
  };

  const MonsterD = MONSTERS[3];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-dvh flex flex-col items-center justify-center p-6 space-y-8 bg-black/85 backdrop-blur-sm z-50 absolute inset-0 overflow-hidden"
    >
      {/* Spinning background monster */}
      <div className="absolute w-72 h-72 opacity-10 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}>
          <MonsterD />
        </motion.div>
      </div>

      {/* Confetti effect */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          style={{ left: `${Math.random() * 100}%`, top: '-5%' }}
          animate={{ y: '110vh', rotate: Math.random() * 720 - 360, opacity: [1, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, ease: 'linear' }}
        >
          {['⭐', '🎉', '💫', '✨', '🌟', '🎊'][i % 6]}
        </motion.div>
      ))}

      <div className="text-center space-y-6 relative z-10 w-full max-w-md">
        <motion.h2
          initial={{ scale: 0, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
        >
          MISSION COMPLETE!
        </motion.h2>

        {/* Rank */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={`text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${rank.color}`}
        >
          {rank.label}
        </motion.div>

        {/* Stars */}
        <StarRating score={score} />

        {/* Score card */}
        <div className="bg-indigo-900/60 p-6 rounded-3xl border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
          <p className="text-lg text-indigo-300 mb-1 font-bold tracking-widest">FINAL SCORE</p>
          <motion.p className="text-5xl md:text-7xl font-black text-white tabular-nums">
            {displayScore.toLocaleString()}
          </motion.p>
        </div>
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={handleRestart}
        className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 px-10 py-5 rounded-full text-2xl font-black shadow-[0_0_40px_rgba(236,72,153,0.6)] z-10"
      >
        <RotateCcw strokeWidth={3} />
        PLAY AGAIN!
      </motion.button>
    </motion.div>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
