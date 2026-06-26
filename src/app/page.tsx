'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic, PowerUp, PowerUpType } from '@/hooks/useGameLogic';
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
      <line x1="100" y1="50" x2="85" y2="15" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="85" cy="12" r="7" fill="#facc15" />
      <line x1="100" y1="50" x2="118" y2="18" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
      <circle cx="118" cy="15" r="5" fill="#f472b6" />
      <ellipse cx="78" cy="100" rx="18" ry="22" fill="white" />
      <ellipse cx="122" cy="100" rx="18" ry="22" fill="white" />
      <circle cx="82" cy="100" r="10" fill="#312e81" />
      <circle cx="126" cy="100" r="10" fill="#312e81" />
      <circle cx="86" cy="95" r="4" fill="white" />
      <circle cx="130" cy="95" r="4" fill="white" />
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
      <path d="M100,30 L115,55 L145,45 L130,70 L165,75 L140,95 L160,120 L130,118 L125,155 L100,140 L75,155 L70,118 L40,120 L60,95 L35,75 L70,70 L55,45 L85,55 Z" fill="url(#mg2)" />
      <circle cx="80" cy="90" r="16" fill="#fef08a" />
      <circle cx="120" cy="90" r="16" fill="#fef08a" />
      <circle cx="83" cy="90" r="8" fill="#14532d" />
      <circle cx="123" cy="90" r="8" fill="#14532d" />
      <circle cx="87" cy="86" r="3" fill="white" />
      <circle cx="127" cy="86" r="3" fill="white" />
      <line x1="66" y1="74" x2="90" y2="80" stroke="#14532d" strokeWidth="6" strokeLinecap="round" />
      <line x1="134" y1="74" x2="110" y2="80" stroke="#14532d" strokeWidth="6" strokeLinecap="round" />
      <path d="M 68 118 L 78 108 L 88 118 L 100 105 L 112 118 L 122 108 L 132 118" stroke="#14532d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
      <ellipse cx="100" cy="88" rx="32" ry="28" fill="white" />
      <circle cx="104" cy="88" r="18" fill="#4c1d95" />
      <circle cx="104" cy="88" r="10" fill="#7c3aed" />
      <circle cx="112" cy="80" r="5" fill="white" />
      <path d="M 40 140 Q 30 170 50 175" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 65 155 Q 58 180 78 182" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 135 155 Q 142 180 122 182" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M 160 140 Q 170 170 150 175" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" fill="none" />
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
      <path d="M 55 90 L 10 50 L 30 100 L 55 110 Z" fill="#ef4444" opacity="0.8" />
      <path d="M 145 90 L 190 50 L 170 100 L 145 110 Z" fill="#ef4444" opacity="0.8" />
      <ellipse cx="100" cy="115" rx="68" ry="65" fill="url(#mg4)" />
      <polygon points="75,50 65,12 85,48" fill="#dc2626" />
      <polygon points="125,50 135,12 115,48" fill="#dc2626" />
      <ellipse cx="80" cy="95" rx="16" ry="14" fill="#fef08a" />
      <ellipse cx="120" cy="95" rx="16" ry="14" fill="#fef08a" />
      <ellipse cx="82" cy="95" rx="8" ry="10" fill="#1c1917" />
      <ellipse cx="122" cy="95" rx="8" ry="10" fill="#1c1917" />
      <circle cx="86" cy="90" r="3" fill="white" />
      <circle cx="126" cy="90" r="3" fill="white" />
      <path d="M 80 148 Q 90 165 78 175 Q 95 162 100 178 Q 105 162 122 175 Q 110 165 120 148" fill="#fbbf24" opacity="0.9" />
      <path d="M 85 148 Q 95 160 84 168 Q 98 158 100 170 Q 102 158 116 168 Q 105 160 115 148" fill="#f97316" opacity="0.8" />
    </svg>
  ),
  // 5 Pink Jellyfish
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg5" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
      </defs>
      <path d="M 30 105 Q 30 30 100 20 Q 170 30 170 105 Z" fill="url(#mg5)" opacity="0.95" />
      <path d="M 52 105 Q 52 55 100 46 Q 148 55 148 105 Z" fill="#fce7f3" opacity="0.35" />
      <circle cx="74" cy="74" r="15" fill="white" />
      <circle cx="126" cy="74" r="15" fill="white" />
      <circle cx="78" cy="74" r="8" fill="#9d174d" />
      <circle cx="130" cy="74" r="8" fill="#9d174d" />
      <circle cx="82" cy="70" r="3" fill="white" />
      <circle cx="134" cy="70" r="3" fill="white" />
      <path d="M 72 104 Q 100 122 128 104" stroke="#9d174d" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 55 105 Q 45 130 55 158 Q 44 146 40 168" stroke="#f472b6" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 77 108 Q 67 136 74 162 Q 62 150 59 176" stroke="#ec4899" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 100 110 Q 100 140 105 164 Q 94 152 98 180" stroke="#f472b6" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 123 108 Q 133 136 126 162 Q 138 150 141 176" stroke="#ec4899" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 145 105 Q 155 130 145 158 Q 156 146 160 168" stroke="#f472b6" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  ),
  // 6 Gold Robot
  () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="mg6" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <rect x="93" y="10" width="14" height="28" rx="7" fill="#f59e0b" />
      <circle cx="100" cy="8" r="9" fill="#ef4444" />
      <rect x="52" y="38" width="96" height="72" rx="14" fill="url(#mg6)" />
      <rect x="63" y="50" width="74" height="46" rx="10" fill="#1e1b4b" />
      <rect x="70" y="58" width="24" height="18" rx="5" fill="#22d3ee" />
      <rect x="106" y="58" width="24" height="18" rx="5" fill="#22d3ee" />
      <circle cx="82" cy="67" r="6" fill="#0891b2" />
      <circle cx="118" cy="67" r="6" fill="#0891b2" />
      <rect x="70" y="80" width="60" height="10" rx="4" fill="#a3e635" />
      <rect x="74" y="83" width="8" height="4" rx="2" fill="#166534" />
      <rect x="86" y="83" width="8" height="4" rx="2" fill="#166534" />
      <rect x="98" y="83" width="8" height="4" rx="2" fill="#166534" />
      <rect x="110" y="83" width="8" height="4" rx="2" fill="#166534" />
      <circle cx="48" cy="74" r="11" fill="#d97706" />
      <circle cx="48" cy="74" r="6" fill="#92400e" />
      <circle cx="152" cy="74" r="11" fill="#d97706" />
      <circle cx="152" cy="74" r="6" fill="#92400e" />
      <rect x="58" y="113" width="84" height="60" rx="12" fill="#f59e0b" />
      <rect x="70" y="123" width="60" height="38" rx="8" fill="#92400e" />
      <circle cx="88" cy="140" r="8" fill="#ef4444" />
      <circle cx="112" cy="140" r="8" fill="#22c55e" />
      <circle cx="100" cy="153" r="6" fill="#3b82f6" />
      <rect x="28" y="113" width="28" height="52" rx="14" fill="#f59e0b" />
      <circle cx="42" cy="170" r="14" fill="#d97706" />
      <rect x="144" y="113" width="28" height="52" rx="14" fill="#f59e0b" />
      <circle cx="158" cy="170" r="14" fill="#d97706" />
      <rect x="68" y="177" width="24" height="14" rx="7" fill="#d97706" />
      <rect x="108" y="177" width="24" height="14" rx="7" fill="#d97706" />
    </svg>
  ),
];

// ── Hero Character ────────────────────────────────────────────────────────────

function HeroCharacter({ streak }: { streak: number }) {
  const level = streak >= 8 ? 'super' : streak >= 5 ? 'hot' : 'normal';
  const bodyColor = level === 'super' ? '#fbbf24' : level === 'hot' ? '#f97316' : '#3b82f6';
  const darkColor = level === 'super' ? '#d97706' : level === 'hot' ? '#ea580c' : '#1e40af';
  const helmetColor = level === 'super' ? '#d97706' : level === 'hot' ? '#ea580c' : '#1d4ed8';
  const visorColor = level === 'super' ? '#fef3c7' : level === 'hot' ? '#fed7aa' : '#bfdbfe';

  return (
    <motion.div
      animate={
        level === 'super'
          ? { scale: [1, 1.1, 1] }
          : level === 'hot'
          ? { y: [0, -5, 0] }
          : { y: [0, -4, 0] }
      }
      transition={{ repeat: Infinity, duration: level === 'super' ? 0.7 : 2 }}
      style={{
        filter:
          level === 'super'
            ? 'drop-shadow(0 0 16px rgba(251,191,36,0.95))'
            : level === 'hot'
            ? 'drop-shadow(0 0 10px rgba(249,115,22,0.8))'
            : 'drop-shadow(0 0 6px rgba(59,130,246,0.5))',
      }}
      className="w-14 h-18 md:w-20 md:h-28"
    >
      <svg viewBox="0 0 100 140" className="w-full h-full">
        {/* Arms */}
        <ellipse cx="17" cy="80" rx="9" ry="22" fill={bodyColor} transform="rotate(-15 17 80)" />
        <ellipse cx="83" cy="80" rx="9" ry="22" fill={bodyColor} transform="rotate(15 83 80)" />
        {/* Body */}
        <ellipse cx="50" cy="92" rx="28" ry="30" fill={bodyColor} />
        {/* Helmet */}
        <circle cx="50" cy="40" r="28" fill={helmetColor} />
        {/* Visor */}
        <ellipse cx="50" cy="38" rx="17" ry="15" fill={visorColor} opacity="0.9" />
        {/* Eyes */}
        <circle cx="42" cy="34" r="5" fill={darkColor} />
        <circle cx="58" cy="34" r="5" fill={darkColor} />
        <circle cx="43" cy="32" r="2" fill="white" />
        <circle cx="59" cy="32" r="2" fill="white" />
        {/* Star emblem */}
        <text x="50" y="104" textAnchor="middle" fontSize="14" fill={visorColor}>★</text>
        {/* Legs */}
        <rect x="36" y="120" width="12" height="16" rx="6" fill={darkColor} />
        <rect x="52" y="120" width="12" height="16" rx="6" fill={darkColor} />
        {/* Powered effects */}
        {level === 'hot' && (
          <>
            <path d="M 36 122 Q 28 133 36 140" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.85" />
            <path d="M 64 122 Q 72 133 64 140" stroke="#fbbf24" strokeWidth="3" fill="none" opacity="0.85" />
          </>
        )}
        {level === 'super' && (
          <>
            <path d="M 28 82 L 18 96 L 26 91 L 16 110" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 72 82 L 82 96 L 74 91 L 84 110" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 36 122 Q 28 134 40 140 Q 33 130 36 122 Z" fill="#f59e0b" opacity="0.9" />
            <path d="M 64 122 Q 72 134 60 140 Q 67 130 64 122 Z" fill="#f59e0b" opacity="0.9" />
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ── Power-up Bar ──────────────────────────────────────────────────────────────

const POWERUP_CONFIG = {
  FREEZE_TIME: { label: 'FREEZE', icon: '❄️', activeIcon: '❄️', glow: 'rgba(6,182,212,0.7)' },
  DOUBLE_POINTS: { label: '2× PTS', icon: '⚡', activeIcon: '⚡', glow: 'rgba(251,191,36,0.7)' },
  SKIP: { label: 'SKIP', icon: '➡️', activeIcon: '➡️', glow: 'rgba(168,85,247,0.7)' },
};

function PowerUpBar({
  powerUps,
  onUsePowerUp,
  doublePointsActive,
}: {
  powerUps: PowerUp[];
  onUsePowerUp: (type: PowerUpType) => void;
  doublePointsActive: boolean;
}) {
  return (
    <div className="flex justify-center gap-2 px-3 pb-1">
      {powerUps.map((pu) => {
        const cfg = POWERUP_CONFIG[pu.type];
        const isDoubleActive = pu.type === 'DOUBLE_POINTS' && doublePointsActive;
        return (
          <motion.button
            key={pu.type}
            whileTap={!pu.used ? { scale: 0.88, y: 3 } : {}}
            onClick={() => !pu.used && onUsePowerUp(pu.type)}
            disabled={pu.used}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl font-black text-xs border-2 transition-all text-white ${
              pu.used
                ? 'bg-gray-700/40 border-gray-600/40 opacity-30 cursor-not-allowed line-through'
                : isDoubleActive
                ? 'bg-yellow-500 border-yellow-300 animate-pulse cursor-pointer'
                : 'bg-indigo-800/80 border-indigo-500 cursor-pointer hover:bg-indigo-700'
            }`}
            style={
              !pu.used && !isDoubleActive
                ? { boxShadow: `0 0 10px ${cfg.glow}` }
                : isDoubleActive
                ? { boxShadow: '0 0 20px rgba(251,191,36,0.9)' }
                : {}
            }
          >
            <span className="text-base leading-none">{cfg.icon}</span>
            <span className="hidden md:inline tracking-wide">{cfg.label}</span>
            {isDoubleActive && <span className="text-[10px] text-yellow-200">ACTIVE</span>}
          </motion.button>
        );
      })}
      <div className="flex items-center px-2 text-indigo-500 text-xs font-bold">POWER-UPS</div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function ParticleBurst({ active }: { active: boolean }) {
  const emojis = ['⭐', '💥', '✨', '🌟', '💫', '🎉'];
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 100 + Math.random() * 60;
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

function FloatingScore({ score, isLucky, isDouble }: { score: number; isLucky: boolean; isDouble: boolean }) {
  const color = isLucky && isDouble ? '#f472b6' : isLucky ? '#facc15' : isDouble ? '#fb923c' : '#fde68a';
  return (
    <motion.div
      className="absolute left-1/2 top-1/3 -translate-x-1/2 pointer-events-none z-40 text-4xl md:text-5xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
      style={{ color }}
      initial={{ y: 0, opacity: 1, scale: 0.8 }}
      animate={{ y: -120, opacity: 0, scale: 1.4 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    >
      +{score}{isLucky ? ' ⭐' : ''}{isDouble ? ' ⚡' : ''}
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

const MAX_SCORE = 45 * 450;

function StarRating({ score }: { score: number }) {
  const pct = score / MAX_SCORE;
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
  const pct = score / MAX_SCORE;
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

// ── Countdown Screen ──────────────────────────────────────────────────────────

function CountdownScreen({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState<number | 'GO!'>(3);

  useEffect(() => {
    if (count === 'GO!') {
      const t = setTimeout(onDone, 650);
      return () => clearTimeout(t);
    }
    const next = typeof count === 'number' ? (count === 1 ? 'GO!' : (count as number) - 1) : 'GO!';
    const t = setTimeout(() => setCount(next), 900);
    return () => clearTimeout(t);
  }, [count, onDone]);

  const isGo = count === 'GO!';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-dvh flex flex-col items-center justify-center relative"
    >
      <BackgroundStars />
      <AnimatePresence mode="wait">
        <motion.div
          key={String(count)}
          initial={{ scale: 0.2, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 2.5, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
          className={`font-black leading-none select-none ${
            isGo ? 'text-8xl md:text-[160px]' : 'text-[120px] md:text-[200px]'
          }`}
          style={{
            background: isGo
              ? 'linear-gradient(135deg, #4ade80, #22d3ee)'
              : 'linear-gradient(135deg, #fbbf24, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(251,191,36,0.6))',
          }}
        >
          {count}
        </motion.div>
      </AnimatePresence>
      {!isGo && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
          className="text-indigo-400 font-black text-xl md:text-2xl mt-6 tracking-widest"
        >
          GET READY...
        </motion.p>
      )}
    </motion.div>
  );
}

// ── Wave Complete Screen ──────────────────────────────────────────────────────

const WAVE_COMPLETE_MSGS = [
  '', // 0 unused
  '🚀 WAVE 1 BLASTED! 🚀',
  '💥 WAVE 2 OBLITERATED! 💥',
];
const WAVE_NEXT_MSGS = [
  '',
  '⚡ WAVE 2 INCOMING! GET READY!',
  '👑 FINAL WAVE! GO ALL OUT! 👑',
];
const WAVE_EMOJIS = ['⭐', '🎉', '💫', '✨', '🌟', '🎊', '🔥', '💪'];

function WaveCompleteScreen({
  waveCompleted,
  score,
  onResume,
}: {
  waveCompleted: number;
  score: number;
  onResume: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onResume, 2800);
    return () => clearTimeout(t);
  }, [onResume]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-dvh flex flex-col items-center justify-center relative overflow-hidden"
    >
      <BackgroundStars />
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          style={{ left: `${(i * 5.5) % 100}%`, top: '-5%' }}
          animate={{ y: '110vh', rotate: Math.random() * 720 - 360, opacity: [1, 1, 0] }}
          transition={{ duration: 2.2 + (i % 4) * 0.4, delay: (i % 6) * 0.15, ease: 'linear' }}
        >
          {WAVE_EMOJIS[i % WAVE_EMOJIS.length]}
        </motion.div>
      ))}

      <div className="text-center space-y-5 relative z-10 px-6">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.55, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {WAVE_COMPLETE_MSGS[waveCompleted] ?? '🎉 WAVE COMPLETE! 🎉'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-xl md:text-2xl font-black text-indigo-300"
        >
          Score: <span className="text-white">{score.toLocaleString()}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}
          className="text-lg md:text-xl font-black text-white bg-indigo-900/70 px-6 py-3 rounded-2xl border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
        >
          {WAVE_NEXT_MSGS[waveCompleted] ?? '🚀 NEXT WAVE!'}
        </motion.div>

        <div className="flex gap-4 justify-center pt-2">
          {[1, 2, 3].map((w) => (
            <motion.div
              key={w}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.85 + w * 0.1, type: 'spring', bounce: 0.6 }}
              className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-black text-sm ${
                w <= waveCompleted
                  ? 'bg-green-400 border-green-300 text-green-900 shadow-[0_0_14px_rgba(74,222,128,0.8)]'
                  : 'bg-gray-700/60 border-gray-600 text-gray-500'
              }`}
            >
              {w <= waveCompleted ? '✓' : w}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main screens ──────────────────────────────────────────────────────────────

const CORRECT_MSGS = ['BOOM! 💥', 'PERFECT! 🎯', 'AMAZING! ⭐', 'POW! 💪', 'CRUSHED! 🔥', 'WOW! 🌟', 'BLASTED! 🚀', 'NAILED IT! 🎯'];
const WRONG_MSGS = ['❌ NOPE!', '🚫 MISS!', '💀 WRONG!', '🙅 NOPE!', '😬 NOT QUITE!'];

function Home() {
  const {
    gameState,
    setGameState,
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
    handleSkip,
    powerUps,
    usePowerUp,
    doublePointsActive,
    waveJustCompleted,
    totalQuestions,
    resumeFromWave,
    questions,
  } = useGameLogic();

  const [freezeTimerFn, setFreezeTimerFn] = useState<(() => void) | null>(null);

  const handlePowerUp = useCallback(
    (type: PowerUpType) => {
      usePowerUp(type);
      if (type === 'FREEZE_TIME' && freezeTimerFn) {
        freezeTimerFn();
      } else if (type === 'SKIP') {
        handleSkip();
      }
    },
    [usePowerUp, freezeTimerFn, handleSkip]
  );

  const registerFreezeTimer = useCallback((fn: () => void) => {
    setFreezeTimerFn(() => fn);
  }, []);

  return (
    <main className="min-h-dvh bg-slate-950 text-white font-comic overflow-hidden touch-none select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black -z-10" />
      <BackgroundStars />

      <AnimatePresence mode="wait">
        {gameState === 'start' && <StartScreen key="start" onStart={startGame} />}
        {gameState === 'countdown' && (
          <CountdownScreen key="countdown" onDone={() => setGameState('playing')} />
        )}
        {gameState === 'playing' && (
          <GameScreen
            key="game"
            currentQuestion={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            score={score}
            streak={streak}
            lastScoreGained={lastScoreGained}
            achievement={achievement}
            onClearAchievement={clearAchievement}
            onAnswer={handleAnswer}
            onTimeout={handleTimeout}
            powerUps={powerUps}
            onUsePowerUp={handlePowerUp}
            doublePointsActive={doublePointsActive}
            onRegisterFreezeTimer={registerFreezeTimer}
            isLuckyQuestion={currentQuestion?.isLucky ?? false}
          />
        )}
        {gameState === 'wave_complete' && (
          <WaveCompleteScreen
            key={`wave-${waveJustCompleted}`}
            waveCompleted={waveJustCompleted}
            score={score}
            onResume={resumeFromWave}
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
  const MonsterB = MONSTERS[5];
  const MonsterC = MONSTERS[4];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -60 }}
      className="h-dvh flex flex-col items-center justify-center p-6 space-y-10 relative"
    >
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

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {['🔥 COMBO MULTIPLIERS', '⭐ LUCKY QUESTIONS', '❄️ POWER-UPS', '🌊 3 WAVES'].map((f) => (
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

      <p className="text-indigo-500 text-sm font-bold tracking-widest">45 QUESTIONS • 3 WAVES • BEAT YOUR BEST!</p>
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
  powerUps,
  onUsePowerUp,
  doublePointsActive,
  onRegisterFreezeTimer,
  isLuckyQuestion,
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
  powerUps: PowerUp[];
  onUsePowerUp: (type: PowerUpType) => void;
  doublePointsActive: boolean;
  onRegisterFreezeTimer: (fn: () => void) => void;
  isLuckyQuestion: boolean;
}) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [monsterAction, setMonsterAction] = useState<'idle' | 'hit' | 'dodge'>('idle');
  const [showParticles, setShowParticles] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const scoreKeyRef = useRef(0);
  const lastIsLuckyRef = useRef(false);
  const lastIsDoubleRef = useRef(false);

  const multiplier = streak >= 8 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1;
  const MonsterEl = MONSTERS[currentIndex % MONSTERS.length];

  const [playCorrect] = useSound(`${BASE_PATH}/sounds/correct.wav`, { volume: 0.5 });
  const [playWrong] = useSound(`${BASE_PATH}/sounds/wrong.wav`, { volume: 0.5 });
  const [playTick] = useSound(`${BASE_PATH}/sounds/tick.wav`, { volume: 0.2 });
  const [playClick] = useSound(`${BASE_PATH}/sounds/click.wav`, { volume: 0.2 });

  const { timeLeft, start, stop, isActive, resetTimer } = useTimer(15, () => {
    setFeedbackMsg(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]);
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
    onRegisterFreezeTimer(resetTimer);
  }, [onRegisterFreezeTimer, resetTimer]);

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
      setFeedbackMsg(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]);
      playCorrect();
      setMonsterAction('hit');
      setShowParticles(true);
      scoreKeyRef.current += 1;
      lastIsLuckyRef.current = isLuckyQuestion;
      lastIsDoubleRef.current = doublePointsActive;
      setShowScore(true);
      setTimeout(() => setShowScore(false), 1200);
    } else {
      setFeedbackMsg(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]);
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
  const waveNum = Math.floor(currentIndex / 15) + 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`h-dvh flex flex-col ${feedback === 'wrong' ? 'animate-shake' : ''}`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/50 backdrop-blur-md border-b border-indigo-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-pink-400 font-bold text-base">
            <Target size={16} /> {currentIndex + 1}/{totalQuestions}
          </div>
          <div className="text-indigo-400 font-bold text-xs bg-indigo-900/50 px-2 py-0.5 rounded-full border border-indigo-700">
            W{waveNum}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-orange-400 font-black text-base animate-pulse-fast"
            >
              <Zap fill="currentColor" size={16} /> {streak}×
            </motion.div>
          )}
          <MultiplierBadge multiplier={multiplier} />
          <div className="text-xl font-black text-white bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
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
      <div className="flex-1 flex flex-col items-center justify-center relative p-3 overflow-hidden">
        <AnimatePresence>
          {achievement && (
            <AchievementBanner key={achievement} text={achievement} onDone={onClearAchievement} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showScore && lastScoreGained > 0 && (
            <FloatingScore
              key={scoreKeyRef.current}
              score={lastScoreGained}
              isLucky={lastIsLuckyRef.current}
              isDouble={lastIsDoubleRef.current}
            />
          )}
        </AnimatePresence>

        <ParticleBurst active={showParticles} />

        {/* Lucky / Double Points banners */}
        <div className="flex gap-2 mb-2 min-h-[28px]">
          <AnimatePresence>
            {isLuckyQuestion && !feedback && (
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-yellow-300 shadow-[0_0_14px_rgba(251,191,36,0.8)] animate-pulse"
              >
                ⭐ LUCKY! 2× POINTS ⭐
              </motion.div>
            )}
            {doublePointsActive && !feedback && (
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.8)] animate-pulse"
              >
                ⚡ DOUBLE POINTS ACTIVE! ⚡
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hero + Question + Monster */}
        <div className="flex flex-row items-center justify-center gap-3 md:gap-8 w-full">
          <HeroCharacter streak={streak} />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentQuestion.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className={`text-5xl md:text-8xl font-black drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] ${
                isLuckyQuestion
                  ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-amber-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                  : 'text-white'
              }`}
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
            className="w-24 h-24 md:w-40 md:h-40 drop-shadow-[0_0_20px_rgba(255,80,80,0.5)]"
          >
            <MonsterEl />
          </motion.div>
        </div>

        {/* Answer display */}
        <div className="mt-4 h-16 flex items-center justify-center">
          <motion.span
            key={input}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`text-5xl md:text-6xl font-black ${
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
              className="absolute top-1/2 text-4xl md:text-5xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.9)] rotate-12 z-20"
            >
              {feedbackMsg}
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [2, 1.2], opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 text-4xl md:text-5xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)] -rotate-12 z-20"
            >
              {timeLeft === 0 ? '⏰ TOO SLOW!' : feedbackMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak fire indicator */}
        {streak >= 5 && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl font-black text-orange-400"
          >
            {streak >= 8 ? '🔥🔥🔥 ON ABSOLUTE FIRE! 🔥🔥🔥' : '🔥🔥 BLAZING HOT! 🔥🔥'}
          </motion.div>
        )}
      </div>

      {/* Power-up bar */}
      <div className="bg-slate-900/80 border-t border-indigo-900/50">
        <PowerUpBar
          powerUps={powerUps}
          onUsePowerUp={onUsePowerUp}
          doublePointsActive={doublePointsActive}
        />
      </div>

      {/* Numpad */}
      <div className="bg-slate-900 p-3 md:p-5 rounded-t-3xl border-t-4 border-indigo-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.88, y: 5 }}
              onClick={() => handleKeyPress(num.toString())}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-3xl md:text-4xl font-black py-4 md:py-6 rounded-2xl shadow-[0_6px_0_rgb(55,48,163)] active:shadow-none transition-shadow"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.88, y: 5 }}
            onClick={handleClear}
            className="bg-red-500 hover:bg-red-400 text-white text-lg md:text-2xl font-black py-4 md:py-6 rounded-2xl shadow-[0_6px_0_rgb(153,27,27)] active:shadow-none transition-shadow"
          >
            ✕ CLR
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88, y: 5 }}
            onClick={() => handleKeyPress('0')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-3xl md:text-4xl font-black py-4 md:py-6 rounded-2xl shadow-[0_6px_0_rgb(55,48,163)] active:shadow-none transition-shadow"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88, y: 5 }}
            onClick={() => input && checkAnswer(input)}
            className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-lg md:text-2xl font-black py-4 md:py-6 rounded-2xl shadow-[0_6px_0_rgb(21,128,61)] active:shadow-none transition-shadow"
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
      <div className="absolute w-72 h-72 opacity-10 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}>
          <MonsterD />
        </motion.div>
      </div>

      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          style={{ left: `${(i * 5) % 100}%`, top: '-5%' }}
          animate={{ y: '110vh', rotate: Math.random() * 720 - 360, opacity: [1, 1, 0] }}
          transition={{ duration: 3 + (i % 3), delay: (i % 8) * 0.25, ease: 'linear' }}
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

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className={`text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${rank.color}`}
        >
          {rank.label}
        </motion.div>

        <StarRating score={score} />

        <div className="bg-indigo-900/60 p-6 rounded-3xl border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
          <p className="text-lg text-indigo-300 mb-1 font-bold tracking-widest">FINAL SCORE</p>
          <motion.p className="text-5xl md:text-7xl font-black text-white tabular-nums">
            {displayScore.toLocaleString()}
          </motion.p>
        </div>

        {/* Wave trophies */}
        <div className="flex justify-center gap-4">
          {[1, 2, 3].map((w) => (
            <motion.div
              key={w}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8 + w * 0.15, type: 'spring', bounce: 0.6 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-3xl">🏆</span>
              <span className="text-xs font-black text-indigo-400">W{w}</span>
            </motion.div>
          ))}
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
