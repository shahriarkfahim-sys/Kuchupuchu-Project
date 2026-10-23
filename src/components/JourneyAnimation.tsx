import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Language } from '../types';

interface JourneyAnimationProps {
  currentLang?: Language;
  className?: string;
}

export const JourneyAnimation: React.FC<JourneyAnimationProps> = ({
  currentLang = 'bn',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 100%
  const [activeStage, setActiveStage] = useState<number>(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Total journey loop duration: 8.5 seconds (within user's 7-10s requirement)
  const TOTAL_DURATION_MS = 8500;

  // 4 Core Stages requested by user (Clean descriptive titles without numbers):
  // - হাসপাতালে জন্ম (Hospital birth)
  // - ডায়াপার পরে বসতে শেখা (Baby in diaper learning to sit up with mother)
  // - হাঁটতে শেখা (Baby learning to walk)
  // - মা-বাবাকে মিষ্টি আলিঙ্গন (Child hugging parents)
  const stages = [
    {
      id: 1,
      range: [0, 25],
      titleBn: 'হাসপাতালে জন্ম',
      titleEn: 'Hospital Birth',
      cx: 130,
    },
    {
      id: 2,
      range: [25, 50],
      titleBn: 'ডায়াপার পরে বসতে শেখা',
      titleEn: 'Sitting in Diaper',
      cx: 375,
    },
    {
      id: 3,
      range: [50, 75],
      titleBn: 'হাঁটতে শেখা',
      titleEn: 'First Steps',
      cx: 620,
    },
    {
      id: 4,
      range: [75, 100],
      titleBn: 'মা-বাবাকে মিষ্টি আলিঙ্গন',
      titleEn: 'Family Hug',
      cx: 865,
    },
  ];

  // Animation ticker loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        setProgress((prev) => {
          const next = prev + (delta / TOTAL_DURATION_MS) * 100;
          return next >= 100 ? 0 : next;
        });
      }
      lastTimeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Sync active stage based on progress
  useEffect(() => {
    if (progress < 25) {
      setActiveStage(1);
    } else if (progress < 50) {
      setActiveStage(2);
    } else if (progress < 75) {
      setActiveStage(3);
    } else {
      setActiveStage(4);
    }
  }, [progress]);

  const handleStageClick = (stageId: number) => {
    const stage = stages.find((s) => s.id === stageId);
    if (stage) {
      setProgress(stage.range[0] + 2);
      setActiveStage(stageId);
    }
  };

  const handleReset = () => {
    setProgress(0);
    setActiveStage(1);
    setIsPlaying(true);
  };

  // Traveling sparkle marker position (from x = 80 to x = 920)
  const markerX = 80 + (progress / 100) * 840;

  // Proximity-based dynamic scale:
  // As the moving beacon approaches stage cx, that stage's characters scale up (to ~1.15x),
  // and smoothly return to normal size (1.0x) as the beacon travels away.
  const getStageScale = (cx: number) => {
    const dist = Math.abs(markerX - cx);
    const range = 110;
    if (dist >= range) return 1;
    const factor = Math.cos((dist / range) * (Math.PI / 2));
    return Number((1 + factor * 0.15).toFixed(3));
  };

  const s1Scale = getStageScale(130);
  const s2Scale = getStageScale(375);
  const s3Scale = getStageScale(620);
  const s4Scale = getStageScale(865);

  return (
    <div
      className={`w-full bg-[#FFF9F3] rounded-3xl border border-[#F4E2D2] p-4 sm:p-5 shadow-xs relative overflow-hidden ${className}`}
    >
      {/* Background Subtle Warmth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFF6EC] via-[#FFFAF5] to-[#FFF3E8] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-[#FFE5CF]/40 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-radial from-[#FFEBD8]/50 to-transparent rounded-full -ml-16 -mb-16 pointer-events-none" />

      {/* Floating Minimal Playback Controls in Top-Right Corner */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/85 backdrop-blur-xs px-2 py-1 rounded-xl border border-[#F0D5C1] shadow-2xs">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1 rounded-lg hover:bg-[#FFF0E2] text-[#4F566B] hover:text-[#E66020] transition-colors cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
        <button
          onClick={handleReset}
          className="p-1 rounded-lg hover:bg-[#FFF0E2] text-[#4F566B] hover:text-[#E66020] transition-colors cursor-pointer"
          title="Replay from start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Story Canvas (Vector SVG ViewBox: 0 0 1000 270) */}
      {/* 4 Strictly Grounded Milestones from Left to Right on Baseline y = 220: */}
      {/* Stage 1 (x ~ 130): Hospital Birth (Mother, Father, Newborn in Cradle) */}
      {/* Stage 2 (x ~ 375): Baby in Diaper Learning to Sit Up with Mother Beside Him */}
      {/* Stage 3 (x ~ 620): Baby Learning to Walk (First Steps with Mother) */}
      {/* Stage 4 (x ~ 865): Grown Child Hugging Mom & Dad Together */}
      <div className="relative z-10 w-full my-1 flex items-center justify-center">
        <svg
          viewBox="0 0 1000 248"
          className="w-full h-auto select-none max-h-[290px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF1E2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFE8D2" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="cradleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E1F5FE" />
            </linearGradient>
            <linearGradient id="matGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E1" />
              <stop offset="100%" stopColor="#FFE082" />
            </linearGradient>
          </defs>

          {/* Gentle Floor Ground Baseline (y = 220) */}
          <path
            d="M 0 220 Q 250 216, 500 219 T 1000 218 L 1000 248 L 0 248 Z"
            fill="url(#groundGrad)"
          />

          {/* Subtle connecting dotted journey path */}
          <path
            d="M 60 220 Q 250 216, 500 219 T 940 218"
            stroke="#E8D1BE"
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity="0.65"
          />

          {/* Traveling soft beacon light across the story */}
          <g transform={`translate(${markerX}, 219)`}>
            <circle r="8" fill="#FF8552" opacity="0.25">
              <animate attributeName="r" values="7;14;7" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.05;0.35" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle r="4" fill="#FF8552" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>

          {/* ========================================================================= */}
          {/* 1. হাসপাতালে জন্ম (Hospital Birth): Mother, Father & Newborn in Cradle     */}
          {/* Center: x = 130, Ground baseline: y = 220                                */}
          {/* Dynamic proximity scale centered at (130, 220)                           */}
          {/* ========================================================================= */}
          <g
            id="scene-1-hospital-birth"
            className={`transition-opacity duration-300 cursor-pointer ${
              activeStage === 1 ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
            onClick={() => handleStageClick(1)}
          >
            {/* Visual Characters Scaled Centered at (130, 220) */}
            <g transform={`translate(130, 220) scale(${s1Scale}) translate(-130, -220)`}>
              {/* Soft Clinic Backdrop / Room Wall Accent (Left x: 42) */}
              <g transform="translate(42, 85)">
                {/* Cozy hospital window with warm sunrise */}
                <rect x="0" y="0" width="38" height="48" rx="6" fill="#F0F7FF" stroke="#D1E5FC" strokeWidth="1.2" />
                <circle cx="28" cy="18" r="9" fill="#FFE082" opacity="0.6" />
                <line x1="19" y1="0" x2="19" y2="48" stroke="#D1E5FC" strokeWidth="1.2" />
                <line x1="0" y1="24" x2="38" y2="24" stroke="#D1E5FC" strokeWidth="1.2" />
                {/* Small Red Cross Hospital Emblem on wall */}
                <rect x="48" y="10" width="16" height="16" rx="4" fill="#FFFFFF" stroke="#FFCDD2" strokeWidth="1" />
                <path d="M 56 13 L 56 23 M 51 18 L 61 18" stroke="#E53935" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Mother Resting in Hospital Bed (x: 78, y: 128) */}
              <g transform="translate(78, 128)">
                {/* Bed frame & soft pillows */}
                <path d="M 0 54 Q 28 38, 56 46 L 70 88 L -6 88 Z" fill="#E8F0FE" stroke="#C5D9F2" strokeWidth="1.2" />
                <ellipse cx="20" cy="40" rx="14" ry="9" fill="#FFFFFF" stroke="#E2ECF8" strokeWidth="1" />
                
                {/* Mother's Body in soft peach hospital gown */}
                <path d="M 16 46 C 12 58, 15 78, 24 86 C 36 86, 52 78, 48 56 Z" fill="#FF8A65" />
                {/* Mother's Face & Hair */}
                <circle cx="28" cy="28" r="11" fill="#F5CBA7" />
                <circle cx="20" cy="22" r="5" fill="#2A170F" />
                <path d="M 18 24 C 18 15, 37 15, 37 24 C 33 18, 23 18, 18 24 Z" fill="#2A170F" />
                {/* Peaceful smiling eyes & bindi */}
                <circle cx="31" cy="24" r="1.1" fill="#D32F2F" />
                <path d="M 27 28 Q 30 30, 33 28" stroke="#2B1810" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M 28 33 Q 30 35, 33 33" stroke="#2B1810" strokeWidth="1" strokeLinecap="round" fill="none" />
                
                {/* Mother's loving arm reaching gently toward cradle with animated movement */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 38 52; 3.5 38 52; 0 38 52"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                  <path d="M 38 52 Q 54 58, 62 62" stroke="#F5CBA7" strokeWidth="3.2" strokeLinecap="round" />
                  <circle cx="62" cy="62" r="2.2" fill="#F5CBA7" />
                </g>
              </g>

              {/* Delighted Father Standing Beside Bed (x: 52, y: 108) */}
              <g transform="translate(52, 108)">
                {/* Floor Shadow */}
                <ellipse cx="22" cy="110" rx="14" ry="3" fill="#E5CDBC" opacity="0.6" />
                {/* Father Body in Teal Kurta */}
                <path d="M 11 44 L 33 44 L 37 92 L 7 92 Z" fill="#2E7D73" rx="3" />
                <line x1="16" y1="92" x2="16" y2="110" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="28" y1="92" x2="28" y2="110" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                {/* Father Face */}
                <circle cx="22" cy="28" r="11" fill="#F5CBA7" />
                <path d="M 12 25 C 12 15, 32 14, 32 25 C 29 18, 17 18, 12 25 Z" fill="#24160E" />
                <path d="M 22 27 Q 25 29, 28 27" stroke="#2B1810" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M 23 33 Q 26 35, 29 33" stroke="#2B1810" strokeWidth="1" strokeLinecap="round" fill="none" />
                
                {/* Hand gently placed on bed rail with subtle reassuring sway */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 30 50; 2.5 30 50; 0 30 50"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <path d="M 30 50 Q 42 62, 45 70" stroke="#F5CBA7" strokeWidth="3" strokeLinecap="round" />
                </g>
              </g>

              {/* Newborn Baby in Hospital Bassinet / Cradle (x: 142, y: 142) */}
              <g transform="translate(142, 142)">
                <ellipse cx="24" cy="76" rx="22" ry="4" fill="#E5CDBC" opacity="0.6" />
                {/* Stand Legs */}
                <line x1="8" y1="46" x2="4" y2="75" stroke="#8C6239" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="40" y1="46" x2="44" y2="75" stroke="#8C6239" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="2" y1="75" x2="46" y2="75" stroke="#8C6239" strokeWidth="2" strokeLinecap="round" />
                
                {/* Clear Bassinet Tub */}
                <rect x="0" y="14" width="48" height="34" rx="14" fill="url(#cradleGrad)" stroke="#B3E5FC" strokeWidth="1.4" />
                {/* Baby Swaddle Blanket (Soft mint/cyan) */}
                <path d="M 4 28 Q 24 35, 44 28 L 44 44 Q 24 49, 4 44 Z" fill="#80DEEA" />
                
                {/* Newborn Cute Sleeping Face */}
                <circle cx="16" cy="24" r="8" fill="#F8D7B8" />
                {/* Traditional protective black teep on side of forehead */}
                <circle cx="12" cy="19" r="0.9" fill="#26170D" />
                {/* Tiny closed sleepy eyelashes */}
                <path d="M 14 24 Q 16 26, 18 24" stroke="#3E2723" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                {/* Tiny cute button nose & pink lips */}
                <path d="M 15 28 Q 17 29, 19 28" stroke="#E53935" strokeWidth="0.9" strokeLinecap="round" fill="none" />
                
                {/* Tiny newborn swaddled arm/fist wiggling happily */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 0,-2.5; 0,0"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <circle cx="26" cy="30" r="2.8" fill="#F8D7B8" />
                </g>

                {/* Twinkling Mobile Overhead */}
                <g transform="translate(14, -14)">
                  <path d="M 10 0 L 10 10 M 0 6 L 20 6" stroke="#FFE082" strokeWidth="1" />
                  <circle cx="0" cy="6" r="2" fill="#FFD54F" />
                  <circle cx="20" cy="6" r="2" fill="#FF80AB" />
                  <circle cx="10" cy="11" r="2" fill="#80D8FF" />
                </g>
              </g>

              {/* Floating Love Heart */}
              <g transform="translate(138, 118)">
                <path d="M 9 3.5 C 9 1, 5.5 0, 4.5 1.2 C 3.5 0, 0 1, 0 3.5 C 0 7, 4.5 9.5, 4.5 9.5 C 4.5 9.5, 9 7, 9 3.5 Z" fill="#FF5252">
                  <animate attributeName="opacity" values="0.75;1;0.75" dur="2s" repeatCount="indefinite" />
                </path>
              </g>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 2. ডায়াপার পরে বসতে শেখা: Diaper Baby Learning to Sit with Mother Beside Him */}
          {/* Center: x = 375, Ground baseline: y = 220                                */}
          {/* Dynamic proximity scale centered at (375, 220)                           */}
          {/* ========================================================================= */}
          <g
            id="scene-2-sitting-in-diaper"
            className={`transition-opacity duration-300 cursor-pointer ${
              activeStage === 2 ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
            onClick={() => handleStageClick(2)}
          >
            {/* Visual Characters Scaled Centered at (375, 220) */}
            <g transform={`translate(375, 220) scale(${(1.08 * s2Scale).toFixed(3)}) translate(-375, -220)`}>
              {/* Soft Pastel Quilted Play Mat (Accommodates both mother and diaper baby) */}
              <ellipse cx="375" cy="216" rx="82" ry="15" fill="url(#matGrad)" stroke="#FFE082" strokeWidth="1.5" />
              {/* Mat decorative stitching dots */}
              <circle cx="315" cy="216" r="1.5" fill="#FFA000" opacity="0.6" />
              <circle cx="345" cy="221" r="1.5" fill="#FFA000" opacity="0.6" />
              <circle cx="375" cy="223" r="1.5" fill="#FFA000" opacity="0.6" />
              <circle cx="405" cy="221" r="1.5" fill="#FFA000" opacity="0.6" />
              <circle cx="435" cy="216" r="1.5" fill="#FFA000" opacity="0.6" />

              {/* MOTHER SITTING BESIDE BABY ON MAT (x: 322, y: 134) */}
              <g transform="translate(322, 134)">
                {/* Mother Floor Shadow */}
                <ellipse cx="26" cy="82" rx="22" ry="4" fill="#E5CDBC" opacity="0.6" />
                {/* Saree fold sitting gracefully on mat */}
                <path d="M 6 58 C 0 70, 6 82, 26 84 C 44 84, 50 72, 44 58 Z" fill="#D84315" />
                {/* Sari Torso in warm terracotta with gold border */}
                <path d="M 12 36 C 8 46, 10 56, 14 62 C 24 64, 34 64, 40 62 C 44 56, 42 46, 38 36 Z" fill="#F4511E" />
                <path d="M 12 40 Q 24 52, 38 62" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
                
                {/* Mother Head & Bun */}
                <circle cx="26" cy="20" r="11" fill="#F5CBA7" />
                <circle cx="18" cy="14" r="5" fill="#26170D" />
                <path d="M 17 18 C 17 9, 36 9, 36 18 C 30 13, 22 13, 17 18 Z" fill="#26170D" />
                {/* Red bindi */}
                <circle cx="28" cy="17" r="1.1" fill="#D32F2F" />
                {/* Loving smiling eyes watching baby */}
                <path d="M 23 21 Q 26 23, 29 21" stroke="#23140A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M 24 26 Q 27 28, 30 26" stroke="#23140A" strokeWidth="1" strokeLinecap="round" fill="none" />

                {/* Mother's encouraging clapping hands moving rhythmically */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 26 42; 5 26 42; -2 26 42; 0 26 42"
                    dur="1.3s"
                    repeatCount="indefinite"
                  />
                  <path d="M 34 40 Q 46 44, 54 44" stroke="#F5CBA7" strokeWidth="3.4" strokeLinecap="round" />
                  <circle cx="55" cy="44" r="2.2" fill="#F5CBA7" />
                  <path d="M 28 44 Q 40 50, 50 50" stroke="#F5CBA7" strokeWidth="3.4" strokeLinecap="round" />
                  <circle cx="51" cy="50" r="2.2" fill="#F5CBA7" />
                </g>
              </g>

              {/* ADORABLE BABY SITTING UP IN DIAPER (x: 378, y: 142) */}
              <g transform="translate(378, 142)">
                {/* Floor Contact Shadow */}
                <ellipse cx="23" cy="74" rx="22" ry="4.5" fill="#E5CDBC" opacity="0.65" />

                {/* Chubby Baby Legs sitting on mat with animated kicking toes */}
                {/* Left chubby leg & tiny foot */}
                <path d="M 9 58 C 1 66, -6 72, 3 74 C 13 74, 16 66, 17 58 Z" fill="#F8D7B8" />
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 0,-1.8; 0,0"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                  <circle cx="-1" cy="72" r="1.8" fill="#F8D7B8" />
                </g>

                {/* Right chubby leg & tiny foot */}
                <path d="M 37 58 C 45 66, 52 72, 43 74 C 33 74, 30 66, 29 58 Z" fill="#F8D7B8" />
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 0,-1.8; 0,0"
                    dur="1.6s"
                    begin="0.8s"
                    repeatCount="indefinite"
                  />
                  <circle cx="47" cy="72" r="1.8" fill="#F8D7B8" />
                </g>

                {/* The White Baby DIAPER with cute cyan tape tabs */}
                <path
                  d="M 6 42 C 2 54, 4 67, 10 70 C 18 73, 28 73, 36 70 C 42 67, 44 54, 40 42 Z"
                  fill="#FFFFFF"
                  stroke="#E0E0E0"
                  strokeWidth="1.2"
                />
                {/* Diaper Cute Pastel Yellow/Cyan Tabs & Waistline */}
                <path d="M 6 44 Q 23 48, 40 44" stroke="#FFF176" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                <rect x="7" y="45" width="5.5" height="3" rx="1" fill="#4FC3F7" />
                <rect x="33.5" y="45" width="5.5" height="3" rx="1" fill="#4FC3F7" />
                {/* Diaper Leg Gathering Elastic crease */}
                <path d="M 11 63 Q 15 67, 21 68" stroke="#EEEEEE" strokeWidth="1.2" fill="none" />
                <path d="M 35 63 Q 31 67, 25 68" stroke="#EEEEEE" strokeWidth="1.2" fill="none" />

                {/* Chubby Tummy */}
                <path d="M 12 28 C 9 35, 9 44, 12 46 C 18 48, 28 48, 34 46 C 37 44, 37 35, 34 28 Z" fill="#F8D7B8" />
                {/* Cute little belly button */}
                <circle cx="23" cy="38" r="0.9" fill="#E0A880" />

                {/* Baby Head & Cute Facial Expression */}
                <circle cx="23" cy="16" r="15" fill="#F8D7B8" />
                {/* Sweet baby dark hair tuft */}
                <path d="M 21 2 Q 23 -3, 27 2" stroke="#2B1810" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <circle cx="17" cy="11" r="1" fill="#2B1810" /> {/* Cute teep */}

                {/* Big, Sparkly Curious Eyes */}
                <circle cx="17" cy="15" r="2.4" fill="#1A1008" />
                <circle cx="29" cy="15" r="2.4" fill="#1A1008" />
                <circle cx="18" cy="14" r="0.8" fill="#FFFFFF" />
                <circle cx="30" cy="14" r="0.8" fill="#FFFFFF" />
                {/* Rosy Cheeks */}
                <ellipse cx="14" cy="19" rx="3" ry="1.8" fill="#FF8A80" opacity="0.65" />
                <ellipse cx="32" cy="19" rx="3" ry="1.8" fill="#FF8A80" opacity="0.65" />
                {/* Happy Open Smile showing first milestone joy */}
                <path d="M 19 20 Q 23 25, 27 20" fill="#E53935" stroke="#C62828" strokeWidth="0.6" />

                {/* Balancing chubby arms waving with animated joyful movement */}
                {/* Left arm waving */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 11 31; -10 11 31; 4 11 31; 0 11 31"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <path d="M 11 31 Q 2 38, 0 45" stroke="#F8D7B8" strokeWidth="4.2" strokeLinecap="round" />
                  <circle cx="0" cy="46" r="2.8" fill="#F8D7B8" />
                </g>

                {/* Right arm waving */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 35 31; 10 35 31; -4 35 31; 0 35 31"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <path d="M 35 31 Q 44 38, 46 45" stroke="#F8D7B8" strokeWidth="4.2" strokeLinecap="round" />
                  <circle cx="46" cy="46" r="2.8" fill="#F8D7B8" />
                </g>
              </g>

              {/* Cute Colorful Rattle Toy nearby */}
              <g transform="translate(436, 204)">
                <circle cx="6" cy="6" r="6" fill="#FF7043" />
                <path d="M 0 6 Q 6 12, 12 6" fill="#FFD54F" />
                <path d="M 12 6 L 19 12" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Milestone Star & Heart */}
              <g transform="translate(426, 145)">
                <polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5" fill="#FFA000">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite" />
                </polygon>
              </g>
              <g transform="translate(365, 132)">
                <path d="M 8 3 C 8 1, 5 0, 4 1.2 C 3 0, 0 1, 0 3 C 0 6, 4 8, 4 8 C 4 8, 8 6, 8 3 Z" fill="#FF8552">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                </path>
              </g>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 3. হাঁটতে শিখছে (Baby Learning to Walk - First Steps with Mother)           */}
          {/* Center: x = 620, Ground baseline: y = 220                                */}
          {/* Dynamic proximity scale centered at (620, 220)                           */}
          {/* ========================================================================= */}
          <g
            id="scene-3-learning-to-walk"
            className={`transition-opacity duration-300 cursor-pointer ${
              activeStage === 3 ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
            onClick={() => handleStageClick(3)}
          >
            {/* Visual Characters Scaled Centered at (620, 220) - Equalized scale with left characters */}
            <g transform={`translate(620, 220) scale(${(1.24 * s3Scale).toFixed(3)}) translate(-620, -220)`}>
              {/* Encouraging Mother Kneeling on Ground (Left side of baby, x: 545, y: 132) */}
              <g transform="translate(545, 132)">
                {/* Floor shadow */}
                <ellipse cx="26" cy="85" rx="22" ry="4.5" fill="#E5CDBC" opacity="0.6" />
                {/* Kneeling saree/skirt (Teal/Green) */}
                <path d="M 6 62 C 0 74, 6 86, 26 86 C 46 86, 52 74, 46 62 Z" fill="#2E6B4B" />
                {/* Mother Torso in warm coral orange top */}
                <path d="M 12 36 C 8 46, 10 56, 14 64 C 24 66, 36 66, 42 64 C 46 56, 44 46, 40 36 Z" fill="#FF7043" />
                {/* Mother Head & Hair Bun */}
                <circle cx="26" cy="20" r="11.5" fill="#F5CBA7" />
                <circle cx="26" cy="8" r="5" fill="#26170D" />
                <path d="M 16 18 C 16 9, 36 9, 36 18 C 30 13, 22 13, 16 18 Z" fill="#26170D" />
                <path d="M 22 19 Q 25 21, 28 19" stroke="#23140A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <path d="M 23 25 Q 26 27, 29 25" stroke="#23140A" strokeWidth="1" strokeLinecap="round" fill="none" />
                
                {/* Mother's encouraging outstretched hands gently moving forward */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 3,0; 0,0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <path d="M 36 42 Q 54 48, 64 50" stroke="#F5CBA7" strokeWidth="3.8" strokeLinecap="round" />
                  <circle cx="65" cy="50" r="2.5" fill="#F5CBA7" />
                </g>
              </g>

              {/* Toddler Taking First Steps (Placed securely on ground baseline, x=615, y=135) */}
              <g transform="translate(615, 135)">
                {/* Floor contact shadow under stepping feet */}
                <ellipse cx="18" cy="82" rx="16" ry="4" fill="#E5CDBC" opacity="0.6" />

                {/* Walking Feet / Tiny soft shoes with animated stepping movement */}
                {/* Left foot stepping forward */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 2,-3.5; 0,0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <path d="M 11 60 L 7 81 L 2 81" stroke="#F8D7B8" strokeWidth="4.5" strokeLinecap="round" />
                  <ellipse cx="4" cy="81" rx="4.5" ry="2.2" fill="#42A5F5" />
                </g>

                {/* Right foot stepping off (alternating phase) */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; -2,-3.5; 0,0"
                    dur="1.2s"
                    begin="0.6s"
                    repeatCount="indefinite"
                  />
                  <path d="M 23 60 L 27 79 L 32 79" stroke="#F8D7B8" strokeWidth="4.5" strokeLinecap="round" />
                  <ellipse cx="30" cy="79" rx="4.5" ry="2.2" fill="#42A5F5" />
                </g>

                {/* Toddler Romper / Outfit (Bright joyful blue) */}
                <path d="M 8 35 C 5 46, 6 56, 10 63 C 18 65, 26 65, 30 63 C 34 56, 35 46, 32 35 Z" fill="#1E88E5" />
                {/* Cute striped suspender / bib detail */}
                <line x1="13" y1="35" x2="13" y2="48" stroke="#FFE082" strokeWidth="1.8" />
                <line x1="27" y1="35" x2="27" y2="48" stroke="#FFE082" strokeWidth="1.8" />

                {/* Toddler Head & Proud Joyful Face */}
                <circle cx="20" cy="20" r="13.5" fill="#F8D7B8" />
                <path d="M 18 6 Q 20 1, 24 6" stroke="#2B1810" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Excited wide eyes */}
                <circle cx="16" cy="18" r="2.2" fill="#1A1008" />
                <circle cx="26" cy="18" r="2.2" fill="#1A1008" />
                <circle cx="17" cy="17" r="0.7" fill="#FFFFFF" />
                <circle cx="27" cy="17" r="0.7" fill="#FFFFFF" />
                {/* Rosy excitement cheeks */}
                <circle cx="13" cy="22" r="2.5" fill="#FF8A80" opacity="0.7" />
                <circle cx="29" cy="22" r="2.5" fill="#FF8A80" opacity="0.7" />
                {/* Thrilled happy smile */}
                <path d="M 17 24 Q 21 29, 25 24" fill="#E53935" stroke="#C62828" strokeWidth="0.6" />

                {/* Balancing outstretched toddler arms with animated movement */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 10 38; -4 10 38; 4 10 38; 0 10 38"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <path d="M 10 38 Q -2 44, -8 48" stroke="#F8D7B8" strokeWidth="3.8" strokeLinecap="round" />
                </g>
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 29 38; 8 29 38; -4 29 38; 0 29 38"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <path d="M 29 38 Q 40 34, 46 38" stroke="#F8D7B8" strokeWidth="3.8" strokeLinecap="round" />
                </g>
              </g>

              {/* Little stepping direction indicator arrows/dots */}
              <circle cx="666" cy="216" r="2" fill="#42A5F5" opacity="0.5" />
              <circle cx="676" cy="216" r="2" fill="#42A5F5" opacity="0.7" />

              {/* Floating Heart */}
              <g transform="translate(635, 125)">
                <path d="M 8 3 C 8 1, 5 0, 4 1.2 C 3 0, 0 1, 0 3 C 0 6, 4 8, 4 8 C 4 8, 8 6, 8 3 Z" fill="#E91E63">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                </path>
              </g>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 4. বড় হয়ে মা-বাবাকে পরম মমতায় আলিঙ্গন (Child Hugging Parents Warmly)        */}
          {/* Center: x = 865, Ground baseline: y = 220                                */}
          {/* Dynamic proximity scale centered at (865, 220)                           */}
          {/* ========================================================================= */}
          <g
            id="scene-4-family-hug"
            className={`transition-opacity duration-300 cursor-pointer ${
              activeStage === 4 ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
            onClick={() => handleStageClick(4)}
          >
            {/* Visual Characters Scaled Centered at (865, 220) - Equalized scale with left characters */}
            <g transform={`translate(865, 220) scale(${(1.30 * s4Scale).toFixed(3)}) translate(-865, -220)`}>
              {/* Ground Baseline Anchor Group at (x = 865, y = 126) */}
              <g transform="translate(865, 126)">
                {/* Golden Warmth Halo around the embracing family */}
                <circle cx="0" cy="48" r="52" fill="#FFEACC" opacity="0.5" />

                {/* Ground shadow under the three hugging family members */}
                <ellipse cx="0" cy="90" rx="46" ry="6" fill="#E5CDBC" opacity="0.7" />

                {/* Celebration Love Hearts rising above them */}
                <g transform="translate(-24, -15)">
                  <path d="M 9 3.5 C 9 1, 5.5 0, 4.5 1.2 C 3.5 0, 0 1, 0 3.5 C 0 7, 4.5 9.5, 4.5 9.5 C 4.5 9.5, 9 7, 9 3.5 Z" fill="#FF5252">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                  </path>
                </g>
                <g transform="translate(16, -18)">
                  <path d="M 12 5 C 12 1.5, 8 0, 6 1.8 C 4 0, 0 1.5, 0 5 C 0 9, 6 12, 6 12 C 6 12, 12 9, 12 5 Z" fill="#FF7043">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
                  </path>
                </g>
                <g transform="translate(-3, -30)">
                  <path d="M 15 6.5 C 15 2.5, 10 0, 7.5 2.5 C 5 0, 0 2.5, 0 6.5 C 0 11.5, 7.5 15, 7.5 15 C 7.5 15, 15 11.5, 15 6.5 Z" fill="#E91E63">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
                  </path>
                </g>

                {/* Twinkling Confetti Stars */}
                <circle cx="-38" cy="18" r="2.2" fill="#FFD54F" />
                <circle cx="36" cy="12" r="2" fill="#81D4FA" />
                <circle cx="34" cy="52" r="2.2" fill="#A5D6A7" />
                <circle cx="-36" cy="62" r="2" fill="#FFAB91" />

                {/* FATHER (Left side of the hug embrace, kneeling down lovingly) */}
                <g transform="translate(-38, 20)">
                  {/* Torso leaning forward in teal panjabi */}
                  <path d="M 6 36 C 2 50, 2 64, 8 70 C 18 71, 28 70, 30 62 C 28 50, 24 38, 18 36 Z" fill="#2E7D73" />
                  {/* Legs kneeling */}
                  <path d="M 8 68 C 4 74, 6 86, 22 88 C 30 88, 32 80, 28 70 Z" fill="#24645C" />
                  {/* Head */}
                  <circle cx="16" cy="20" r="11" fill="#F5CBA7" />
                  <path d="M 7 16 C 7 7, 26 7, 26 16 C 23 10, 13 10, 7 16 Z" fill="#24160E" />
                  {/* Closed smiling eyes in blissful hug */}
                  <path d="M 12 20 Q 16 23, 20 20" stroke="#2B1810" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 13 26 Q 16 28, 19 26" stroke="#2B1810" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                  
                  {/* Father's loving arm wrapped around child with gentle embrace animation */}
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 22 42; 2.5 22 42; 0 22 42"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <path d="M 22 42 Q 36 48, 44 54" stroke="#F5CBA7" strokeWidth="4.5" strokeLinecap="round" />
                  </g>
                </g>

                {/* MOTHER (Right side of the hug embrace, leaning down lovingly in Saree) */}
                <g transform="translate(10, 20)">
                  {/* Saree drape & Torso */}
                  <path d="M 4 38 C 2 50, 4 64, 10 70 C 20 71, 30 70, 32 62 C 30 48, 24 38, 20 38 Z" fill="#E65100" />
                  {/* Kneeling saree fold down to floor */}
                  <path d="M 8 68 C 4 76, 8 86, 24 88 C 32 88, 34 78, 30 68 Z" fill="#BF360C" />
                  <path d="M 7 46 Q 18 56, 26 72" stroke="#FFB74D" strokeWidth="2.2" fill="none" />
                  {/* Head & Bun */}
                  <circle cx="14" cy="18" r="11" fill="#F5CBA7" />
                  <circle cx="21" cy="10" r="5" fill="#26170D" />
                  <path d="M 5 15 C 5 7, 23 7, 23 15 C 19 9, 10 9, 5 15 Z" fill="#26170D" />
                  {/* Closed happy eyes in hug */}
                  <path d="M 9 19 Q 13 22, 17 19" stroke="#23140A" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M 10 25 Q 13 27, 16 25" stroke="#23140A" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                  
                  {/* Mother's loving arm wrapped around child with gentle embrace animation */}
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 6 42; -2.5 6 42; 0 6 42"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <path d="M 6 42 Q -8 48, -14 54" stroke="#F5CBA7" strokeWidth="4.5" strokeLinecap="round" />
                  </g>
                </g>

                {/* GROWING CHILD (Center, standing tall, warmly hugging mom and dad) */}
                <g transform="translate(-15, 24)">
                  {/* Child standing firmly on ground at shadow level y=88-90 with animated happy feet */}
                  <line x1="8" y1="52" x2="8" y2="65" stroke="#F8D7B8" strokeWidth="4" strokeLinecap="round" />
                  <line x1="22" y1="52" x2="22" y2="65" stroke="#F8D7B8" strokeWidth="4" strokeLinecap="round" />
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="0,0; 0,-1.2; 0,0"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <ellipse cx="8" cy="65" rx="3.5" ry="1.8" fill="#D32F2F" />
                    <ellipse cx="22" cy="65" rx="3.5" ry="1.8" fill="#D32F2F" />
                  </g>

                  {/* Yellow child dress/tunic */}
                  <path d="M 5 24 C 3 34, 3 46, 6 54 C 14 56, 22 56, 24 54 C 27 46, 27 34, 25 24 Z" fill="#FFC107" />
                  
                  {/* Child Head */}
                  <circle cx="15" cy="13" r="10" fill="#F8D7B8" />
                  <path d="M 7 9 C 7 3, 22 3, 22 9 C 18 5, 11 5, 7 9 Z" fill="#2B1810" />
                  {/* Peaceful, blissful eyes */}
                  <path d="M 10 14 Q 13 16, 16 14" stroke="#2B1810" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M 11 18 Q 15 21, 19 18" stroke="#D84315" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  {/* Joyful rosy cheeks */}
                  <circle cx="8" cy="16" r="2" fill="#FF8A80" opacity="0.75" />
                  <circle cx="22" cy="16" r="2" fill="#FF8A80" opacity="0.75" />

                  {/* Arms tightly wrapping around mom and dad with affectionate squeeze animation! */}
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 6 26; 4 6 26; 0 6 26"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <path d="M 6 26 Q -8 22, -14 26" stroke="#F8D7B8" strokeWidth="3.8" strokeLinecap="round" />
                  </g>
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="0 24 26; -4 24 26; 0 24 26"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <path d="M 24 26 Q 38 22, 44 26" stroke="#F8D7B8" strokeWidth="3.8" strokeLinecap="round" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
