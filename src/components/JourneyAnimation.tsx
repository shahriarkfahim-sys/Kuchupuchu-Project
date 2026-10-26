import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Language } from '../types';

interface JourneyAnimationProps {
  currentLang?: Language;
  className?: string;
}

type ParentFigureProps = {
  x: number;
  y: number;
  role: 'mother' | 'father';
  outfit?: 'kurti' | 'shirt' | 'panjabi';
  hijab?: boolean;
  pregnant?: boolean;
  reach?: boolean;
  reachInward?: boolean;
  lean?: boolean;
  color?: string;
};

const ParentFigure: React.FC<ParentFigureProps> = ({
  x,
  y,
  role,
  outfit = role === 'mother' ? 'kurti' : 'shirt',
  hijab = false,
  pregnant = false,
  reach = false,
  reachInward = false,
  lean = false,
  color,
}) => {
  const isMother = role === 'mother';
  const outfitColor = color ?? (isMother ? '#E87955' : '#2C7867');

  return (
    <g transform={`translate(${x} ${y})${lean ? ' rotate(-7 20 54)' : ''}`}>
      <ellipse cx="20" cy="122" rx="19" ry="3.5" fill="#735B4C" opacity=".13" />
      <path d="M11 83 9 116M28 83l5 33" stroke="#704D3B" strokeWidth="5" strokeLinecap="round" />
      <path d="M4 117h11m16 0h11" stroke="#F7F0E7" strokeWidth="5" strokeLinecap="round" />
      {outfit === 'shirt' ? (
        <path d="M9 36q11-8 22 0l7 42q-18 9-36 0z" fill={outfitColor} />
      ) : pregnant ? (
        <path d="M8 34q12-9 25 0l4 18q12 7 12 20-9 16-37 10L5 58z" fill={outfitColor} />
      ) : (
        <path d="M8 34q12-9 25 0l8 48q-21 8-42 0z" fill={outfitColor} />
      )}
      {outfit === 'panjabi' && (
        <path d="M20 34v41m-3-34h6" stroke="#EBC46E" strokeWidth="2" />
      )}
      {isMother && outfit === 'kurti' && (
        <>
          <path d="M8 39q10 10 25 4M7 45q13 13 28 7" fill="none" stroke="#F7D79A" strokeWidth="1.5" opacity=".8" />
          <path d="M8 38q-7 17 2 37l8-4-2-30m11-3q10 16 9 36l-8-1-4-29" fill={hijab ? '#287463' : '#F1C47A'} />
        </>
      )}
      {hijab && (
        <path d="M7 23q-2-21 14-22 17 1 17 22l-5 24-12-10L9 48 5 34z" fill="#28695E" stroke="#1F5E54" strokeWidth="1" />
      )}
      <path
        d={reachInward
          ? 'M10 42Q3 51 20 62M31 42Q38 51 21 62'
          : reach
            ? 'M10 42Q-1 47-9 38M31 42Q43 49 50 58'
            : 'M10 42Q3 54 1 65M31 42Q39 53 42 65'}
        fill="none"
        stroke="#9B6048"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 20 43; 2 20 43; 0 20 43"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </path>
      {pregnant && (
        <path d="M31 57q10 0 14 9" fill="none" stroke="#9B6048" strokeWidth="4" strokeLinecap="round" />
      )}
      <circle cx="21" cy="19" r="14" fill="#A96349" />
      <path d="M7 18Q7 3 21 4q14 0 14 14-6-8-14-8-8 0-14 8" fill="#201915" />
      {hijab && <path d="M8 15Q9 2 21 2t13 13q-5-6-13-6t-13 6" fill="#28695E" />}
      {!isMother && (
        <path d="M11 24q3 7 10 7t10-7q-2 12-10 12t-10-12" fill="#35231C" />
      )}
      <circle cx="16" cy="19" r="1.2" fill="#281A15" />
      <circle cx="26" cy="19" r="1.2" fill="#281A15" />
      <path d="M17 25q4 3 8 0" fill="none" stroke="#6E3529" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="24" r="2.4" fill="#DE8873" opacity=".7" />
      <circle cx="30" cy="24" r="2.4" fill="#DE8873" opacity=".7" />
    </g>
  );
};

type BabyFigureProps = {
  x: number;
  y: number;
  pose: 'swaddle' | 'tummy' | 'sit' | 'stand' | 'run';
  outfit?: string;
};

const BabyFigure: React.FC<BabyFigureProps> = ({ x, y, pose, outfit = '#F1C34E' }) => {
  if (pose === 'swaddle') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M-28 28q28-23 56 0v28q-28 22-56 0z" fill="#F8F2E7" stroke="#E6D7C1" strokeWidth="2" />
        <path d="M-25 40q25-12 50 0v16q-25 13-50 0z" fill="#3F8475" />
        <circle cx="-5" cy="31" r="11" fill="#B87658" />
        <path d="M-16 29q2-12 13-12 11 0 14 12-9-6-27 0" fill="#211A17" />
        <path d="M-10 34q4 3 8 0" fill="none" stroke="#633D31" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-16" cy="35" r="2.5" fill="#E39A7E" />
        <circle cx="5" cy="35" r="2.5" fill="#E39A7E" />
        <path d="M-20 45q20 9 40 0" fill="none" stroke="#E5C26F" strokeWidth="2" strokeDasharray="2 4" />
      </g>
    );
  }

  const isTummy = pose === 'tummy';
  const isSitting = pose === 'sit';
  const isStanding = pose === 'stand' || pose === 'run';

  return (
    <g transform={`translate(${x} ${y})`}>
      {isTummy ? (
        <>
          <ellipse cx="0" cy="54" rx="35" ry="9" fill="#E6C891" />
          <path d="M-22 39q20-15 39 0l19 10q-3 10-17 7L0 48l-17 9q-12 0-13-9z" fill={outfit} />
          <path d="M-17 45-35 55m42-10 19 10" stroke="#B87658" strokeWidth="5" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="0 -17 45;-8 -17 45;0 -17 45" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M-17 29q0-19 17-19t17 19q-1 18-17 18t-17-18" fill="#B87658">
            <animateTransform attributeName="transform" type="rotate" values="0 0 44;-8 0 44;0 0 44" dur="2.4s" repeatCount="indefinite" />
          </path>
          <path d="M-17 25q0-17 17-17t17 17q-8-7-17-7t-17 7" fill="#211A17" />
          <circle cx="-6" cy="29" r="1.5" fill="#281A15" />
          <circle cx="6" cy="29" r="1.5" fill="#281A15" />
          <path d="M-4 35q4 3 8 0" fill="none" stroke="#633D31" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="-11" cy="34" r="2.4" fill="#E39A7E" />
          <circle cx="11" cy="34" r="2.4" fill="#E39A7E" />
        </>
      ) : (
        <>
          {isSitting ? (
            <>
              <path d="M-12 53q-23 8-27 20 3 7 20 3l18-12m9-11q23 8 27 20-3 7-20 3L-3 64" fill="none" stroke="#B87658" strokeWidth="8" strokeLinecap="round" />
              <path d="M-17 44q17-9 34 0l6 27q-18 9-39 0z" fill={outfit} />
              <path d="M-13 65q13 5 26 0" fill="none" stroke="#F8F2E7" strokeWidth="3" />
            </>
          ) : (
            <>
              {isStanding && (
                <path d={pose === 'run' ? 'M-9 62-20 82m28-20 15 14' : 'M-9 61-13 86m22-25 6 25'} stroke="#B87658" strokeWidth="7" strokeLinecap="round">
                  {pose === 'run' && (
                    <animateTransform attributeName="transform" type="translate" values="0 0;2 -2;0 0" dur="1s" repeatCount="indefinite" />
                  )}
                </path>
              )}
              {!isStanding && <path d="M-14 55q-18 12-22 22m48-22q18 12 22 22" stroke="#B87658" strokeWidth="7" strokeLinecap="round" />}
              <path d="M-17 43q17-9 34 0l5 24q-22 10-44 0z" fill={outfit} />
              {isSitting && <path d="M-16 64q-10 13-1 18h17l4-12m10-6q10 13 1 18H-2" fill="#B87658" />}
            </>
          )}
          <circle cx="0" cy="25" r="19" fill="#B87658">
            {isTummy && <animateTransform attributeName="transform" type="rotate" values="0 0 44;-8 0 44;0 0 44" dur="2.4s" repeatCount="indefinite" />}
          </circle>
          <path d="M-19 23q1-20 19-20 18 0 19 20-8-9-19-9t-19 9" fill="#211A17" />
          <circle cx="-7" cy="25" r="1.7" fill="#281A15" />
          <circle cx="7" cy="25" r="1.7" fill="#281A15" />
          <path d="M-5 33q5 4 10 0" fill="none" stroke="#633D31" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="-12" cy="31" r="3" fill="#E39A7E" />
          <circle cx="12" cy="31" r="3" fill="#E39A7E" />
        </>
      )}
    </g>
  );
};

export const JourneyAnimation: React.FC<JourneyAnimationProps> = ({
  currentLang = 'bn',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastProgressUpdateRef = useRef(0);
  const pendingProgressDeltaRef = useRef(0);
  const isBangla = currentLang === 'bn';
  const totalDuration = 18000;
  const sceneCenters = [120, 360, 600, 840, 1080, 1320];
  const milestones = isBangla
    ? [
        { age: 'গর্ভকাল', title: 'প্রথম হার্টবিট' },
        { age: '০–১ মাস', title: 'প্রথম আদর' },
        { age: '৩ মাস', title: 'মাথা তোলা, প্রথম হাসি' },
        { age: '৬ মাস', title: 'বসা, নতুন স্বাদ' },
        { age: '১২ মাস', title: 'প্রথম পা' },
        { age: '১৮–২৪ মাস', title: 'কথা, দৌড়, আলিঙ্গন' },
      ]
    : [
        { age: 'Pregnancy', title: 'First heartbeat' },
        { age: '0–1 month', title: 'First cuddle' },
        { age: '3 months', title: 'Head up, first smile' },
        { age: '6 months', title: 'Sitting, new tastes' },
        { age: '12 months', title: 'First steps' },
        { age: '18–24 months', title: 'Words, running, hugs' },
      ];

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      lastProgressUpdateRef.current = 0;
      pendingProgressDeltaRef.current = 0;
      return;
    }

    const tick = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = Math.min(time - lastTimeRef.current, 100);
        pendingProgressDeltaRef.current += delta;
        if (time - lastProgressUpdateRef.current >= 33) {
          lastProgressUpdateRef.current = time;
          const progressDelta = pendingProgressDeltaRef.current;
          pendingProgressDeltaRef.current = 0;
          setProgress((value) => (value + (progressDelta / totalDuration) * 100) % 100);
        }
      }
      lastTimeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      svgRef.current?.unpauseAnimations();
    } else {
      svgRef.current?.pauseAnimations();
    }
  }, [isPlaying]);

  const activeStage = Math.min(5, Math.floor((progress / 100) * milestones.length));
  const threadX = 42 + (progress / 100) * 1356;

  const selectStage = (index: number) => {
    setProgress((index / milestones.length) * 100 + 0.5);
    setIsPlaying(true);
  };

  const handleStageKeyDown = (event: React.KeyboardEvent<SVGGElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectStage(index);
    }
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-[#F0E2CF] bg-[#FFF9F1] p-2.5 shadow-sm sm:p-4 ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_20%,rgba(255,235,201,.55),transparent_35%),radial-gradient(ellipse_at_80%_70%,rgba(231,239,220,.6),transparent_38%)]" />

      <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-[#EEE3D3] bg-white/90 p-1 shadow-sm sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
          className="rounded-full p-2 text-[#536158] transition-colors hover:bg-[#F7F2E9]"
          aria-label={isPlaying ? (isBangla ? 'অ্যানিমেশন থামান' : 'Pause animation') : (isBangla ? 'অ্যানিমেশন চালান' : 'Play animation')}
          title={isPlaying ? (isBangla ? 'থামান' : 'Pause') : (isBangla ? 'চালান' : 'Play')}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setProgress(0);
            setIsPlaying(true);
          }}
          className="rounded-full p-2 text-[#536158] transition-colors hover:bg-[#F7F2E9]"
          aria-label={isBangla ? 'আবার শুরু করুন' : 'Replay animation'}
          title={isBangla ? 'আবার শুরু করুন' : 'Replay'}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 w-full overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 1440 390"
          className="block h-auto min-w-[760px] w-full select-none"
          aria-label={isBangla ? 'গর্ভকাল থেকে ২৪ মাস পর্যন্ত সন্তানের বেড়ে ওঠার ছয়টি ধাপ' : 'Six steps of a child’s journey from pregnancy through 24 months'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="kantha-thread" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B98A34" />
              <stop offset="50%" stopColor="#E4B94D" />
              <stop offset="100%" stopColor="#C89839" />
            </linearGradient>
            <linearGradient id="evening-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8D9B9" />
              <stop offset="100%" stopColor="#FFF1D7" />
            </linearGradient>
          </defs>

          <path d="M0 288q180-10 360 0t360 0 360 0 360 0v47H0z" fill="#F5EDDC" opacity=".8" />
          <path d="M0 288q180-10 360 0t360 0 360 0 360 0" fill="none" stroke="#D6C7A6" strokeWidth="1.5" />

          {sceneCenters.map((center, index) => (
            <g key={`alpona-${index}`} transform={`translate(${center} 282)`} opacity=".24">
              <circle r="25" fill="none" stroke="#B9A97F" strokeWidth="1" />
              <circle r="16" fill="none" stroke="#B9A97F" strokeWidth="1" strokeDasharray="2 5" />
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <ellipse key={angle} cx="0" cy="-20" rx="3" ry="7" fill="none" stroke="#B9A97F" strokeWidth="1" transform={`rotate(${angle})`} />
              ))}
            </g>
          ))}

          <g aria-hidden="true" opacity=".38" fill="#8BA598">
            {[0, 1, 2, 3, 4, 5].map((building) => (
              <g key={building} transform={`translate(${building * 39} 0)`}>
                <path d={`M${28 + (building % 2) * 8} 211h22v70H${28 + (building % 2) * 8}z`} />
                {[0, 1, 2, 3].map((window) => (
                  <rect key={window} x={33 + (building % 2) * 8} y={220 + window * 13} width="4" height="5" rx="1" fill="#F9E6BD" />
                ))}
              </g>
            ))}
          </g>

          <g transform="translate(1180 205)" opacity=".65">
            <path d="M0 35q48-28 100 0v48H0z" fill="#DCE9DC" />
            <path d="M4 48q42-12 91 0" stroke="#A3B9A8" strokeWidth="2" fill="none" />
            <path d="M19 91q25-11 51 0l-7 8H27z" fill="#916D4A" />
            <path d="M43 62V17l29 45z" fill="#F4D075" />
            <path d="M43 62H72" stroke="#8F7651" strokeWidth="2" />
          </g>

          {sceneCenters.map((center, index) => {
            const selected = activeStage === index;
            return (
              <g
                key={`scene-${index}`}
                role="button"
                tabIndex={0}
                aria-label={`${milestones[index].age}: ${milestones[index].title}`}
                aria-pressed={selected}
                onClick={() => selectStage(index)}
                onKeyDown={(event) => handleStageKeyDown(event, index)}
                className="cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B98A34]"
                opacity={selected ? 1 : 0.78}
              >
                <ellipse cx={center} cy="271" rx="89" ry="8" fill="#705C48" opacity=".08" />

                {index === 0 && (
                  <g>
                    <path d={`M${center - 99} 113h198v151h-198z`} fill="url(#evening-sky)" opacity=".72" />
                    <path d={`M${center - 99} 215h198v50h-198z`} fill="#E7D9C7" opacity=".72" />
                    <path d={`M${center - 90} 209v-53h59v53m-56-4h54`} fill="none" stroke="#8B9C8D" strokeWidth="3" />
                    <path d={`M${center - 81} 163h42m-42 13h42m-42 13h42`} stroke="#B29F7B" strokeWidth="1.4" />
                    <circle cx={center + 70} cy="135" r="17" fill="#F5C46F" opacity=".85" />
                    <path d={`M${center + 43} 227h115m-108 0v36m100-36v36`} stroke="#907E68" strokeWidth="2" />
                    <path d={`M${center + 52} 227q49 9 97 0`} stroke="#F7F0E4" strokeWidth="5" />
                    <path d={`M${center - 100} 238h200m-183 8h170`} stroke="#799486" strokeWidth="1.5" opacity=".6" />
                    <ParentFigure x={center - 68} y={133} role="mother" pregnant color="#438B78" reach />
                    <ParentFigure x={center + 11} y={143} role="father" outfit="shirt" color="#376C83" reach lean />
                    <rect x={center + 51} y="181" width="25" height="30" rx="4" fill="#FFFDF8" stroke="#D8C49A" strokeWidth="1.5" transform={`rotate(-8 ${center + 63} 196)`} />
                    <path d={`M${center + 57} 198q6-10 12 0-6 9-12 0z`} fill="#E87955" />
                    <path d={`M${center - 23} 124v-9m-5 5h10`} stroke="#F1B84A" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}

                {index === 1 && (
                  <g>
                    <rect x={center - 98} y="120" width="196" height="145" rx="18" fill="#F3F5EF" />
                    <path d={`M${center - 82} 146h53v46h-53z`} fill="#D9E8E4" stroke="#B8CFC7" strokeWidth="2" />
                    <path d={`M${center - 56} 146v46m-27-23h53`} stroke="#F8F3E8" strokeWidth="3" />
                    <path d={`M${center + 60} 135h23v37h-23z`} fill="#E6EFE6" />
                    <path d={`M${center + 66} 143h11m-11 7h11`} stroke="#A3B9A8" strokeWidth="2" />
                    <path d={`M${center - 83} 236h166v10h-166z`} fill="#D5C6AB" />
                    <path d={`M${center - 73} 246v20m146-20v20`} stroke="#A99375" strokeWidth="3" />
                    <ParentFigure x={center - 52} y={146} role="mother" outfit="kurti" color="#C9785D" />
                    <ParentFigure x={center + 37} y={136} role="father" outfit="shirt" color="#3B7B69" reach />
                    <BabyFigure x={center + 2} y={203} pose="swaddle" />
                    <path d={`M${center + 19} 211q12 7 18 17`} fill="none" stroke="#A96349" strokeWidth="4" strokeLinecap="round" />
                    <path d={`M${center + 86} 154h-12v18h12`} fill="#F8F3E8" stroke="#D5E0D9" strokeWidth="1" />
                    <path d={`M${center + 79} 159v8m-4-4h8`} stroke="#C36D54" strokeWidth="1.5" />
                  </g>
                )}

                {index === 2 && (
                  <g>
                    <path d={`M${center - 97} 234q97-18 194 0v31h-194z`} fill="#E9DFC8" />
                    <path d={`M${center - 92} 236q92-14 184 0`} stroke="#D4BA80" strokeWidth="2" strokeDasharray="3 5" />
                    <path d={`M${center - 91} 260q12-14 24 0t24 0 24 0 24 0 24 0 24 0`} fill="none" stroke="#B99755" strokeWidth="1" opacity=".6" />
                    <ParentFigure x={center - 78} y={146} role="mother" outfit="kurti" color="#D78364" reach />
                    <BabyFigure x={center + 3} y={170} pose="tummy" outfit="#E9B84B" />
                    <path d={`M${center - 7} 151q6-16 12 0`} fill="none" stroke="#F0B746" strokeWidth="2" />
                    <path d={`M${center + 52} 170q8-11 16 0-8 12-16 0z`} fill="#E87955" />
                    <path d={`M${center + 68} 184q8-10 15 0-7 10-15 0z`} fill="#4C8A70" />
                    <path d={`M${center - 89} 188v-8m-4 4h8`} stroke="#7D9D86" strokeWidth="1.5" />
                  </g>
                )}

                {index === 3 && (
                  <g>
                    <path d={`M${center - 99} 250q99-14 198 0v15h-198z`} fill="#F1E4C8" />
                    <path d={`M${center - 99} 250q99-14 198 0`} stroke="#CFB879" strokeWidth="2" strokeDasharray="3 5" />
                    <ParentFigure x={center - 86} y={146} role="mother" outfit="kurti" color="#47816E" />
                    <ParentFigure x={center + 48} y={147} role="father" outfit="shirt" color="#3D7080" />
                    <BabyFigure x={center + 4} y={176} pose="sit" outfit="#E0A94B" />
                    <path d={`M${center + 59} 231q12-19 24 0l-3 11h-18z`} fill="#F6F0E5" stroke="#D8C8A9" strokeWidth="1.5" />
                    <ellipse cx={center + 71} cy="234" rx="8" ry="5" fill="#D8A049" />
                    <circle cx={center + 67} cy="233" r="1.5" fill="#F5D98C" />
                    <circle cx={center + 73} cy="235" r="1.5" fill="#F5D98C" />
                    <path d={`M${center + 60} 224q11-9 22 0`} stroke="#3F806D" strokeWidth="2" />
                    <path d={`M${center - 75} 177q9 8 18 0`} fill="none" stroke="#EBC46E" strokeWidth="2" />
                  </g>
                )}

                {index === 4 && (
                  <g>
                    <path d={`M${center - 98} 249q98-12 196 0v16h-196z`} fill="#E9DFC8" />
                    <g transform={`translate(${center + 25} 0)`}>
                      <path d="M0 144 29 105l29 37M29 105 0 141m29-36V73" fill="none" stroke="#6A8D78" strokeWidth="1.5" />
                      <path d="M29 105 58 142l-29-9L0 141z" fill="#E7A94E" stroke="#C38643" strokeWidth="1.5" />
                      <path d="M29 146q-9 11 0 21 8-10 0-21z" fill="#3D806C" />
                    </g>
                    <ParentFigure x={center - 60} y={146} role="mother" outfit="kurti" color="#DA8263" hijab reachInward />
                    <ParentFigure x={center + 24} y={147} role="father" outfit="shirt" color="#337862" reachInward />
                    <BabyFigure x={center + 1} y={169} pose="stand" outfit="#E3B54E" />
                    <path d={`M${center - 53} 181h28`} stroke="#E8C56E" strokeWidth="1.4" />
                    <circle cx={center - 51} cy="181" r="2" fill="#E8C56E" />
                    <circle cx={center - 43} cy="181" r="2" fill="#E8C56E" />
                  </g>
                )}

                {index === 5 && (
                  <g>
                    <path d={`M${center - 99} 250q99-13 198 0v15h-198z`} fill="#E9DFC8" />
                    <ParentFigure x={center - 85} y={148} role="mother" outfit="kurti" color="#3C806D" hijab />
                    <ParentFigure x={center + 50} y={148} role="father" outfit="shirt" color="#D77E59" reach />
                    <BabyFigure x={center + 6} y={164} pose="run" outfit="#E3B54E" />
                    <path d={`M${center - 12} 186q-8-8-13 0m-5 10q-8-8-13 0`} stroke="#C79045" strokeWidth="2" strokeLinecap="round" opacity=".75" />
                    <path d={`M${center - 6} 140q0-9 9-9 8 0 8 8 0 7-9 7-8 0-8-6`} fill="#E87955">
                      <animate attributeName="opacity" values=".7;1;.7" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d={`M${center + 44} 124q0-11 11-11 10 0 10 10 0 9-11 9-10 0-10-8`} fill="#E9B84B" />
                    <path d={`M${center + 63} 139l8 8m-5-13 7-7`} stroke="#E9B84B" strokeWidth="1.5" />
                    <path d={`M${center - 16} 218l12 6m-15 0 12 6`} stroke="#B58A42" strokeWidth="1.7" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}

          <path
            d="M42 288C130 278 196 299 280 288S438 278 520 288 680 298 760 288 920 278 1000 288 1160 298 1240 288 1360 280 1398 288"
            pathLength="100"
            fill="none"
            stroke="#D8C69D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M42 288C130 278 196 299 280 288S438 278 520 288 680 298 760 288 920 278 1000 288 1160 298 1240 288 1360 280 1398 288"
            pathLength="100"
            fill="none"
            stroke="url(#kantha-thread)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${progress} 100`}
          />

          {sceneCenters.map((center, index) => (
            <g key={`stitch-${index}`} transform={`translate(${center} 288)`}>
              <path d="M-5-5 5 5M-5 5 5-5" stroke={activeStage >= index ? '#B8812F' : '#C9BA98'} strokeWidth="2" strokeLinecap="round" />
              <circle r="5" fill={activeStage === index ? '#F4DBA0' : '#F7F0E2'} stroke={activeStage >= index ? '#B8812F' : '#C9BA98'} strokeWidth="1.5" />
              <circle r="1.8" fill={activeStage >= index ? '#43806B' : '#B8A989'} />
            </g>
          ))}

          <g transform={`translate(${threadX} 288)`}>
            <circle r="10" fill="#E8BD5E" opacity=".2">
              <animate attributeName="r" values="7;12;7" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle r="4.5" fill="#C18D34" stroke="#FFF9ED" strokeWidth="2" />
          </g>

          {sceneCenters.map((center, index) => (
            <g key={`label-${index}`} textAnchor="middle" fontFamily="inherit">
              <text x={center} y="331" fill="#4D765F" fontSize="16" fontWeight="700">
                {milestones[index].age}
              </text>
              <text x={center} y="354" fill="#35453C" fontSize="14" fontWeight="600">
                {milestones[index].title}
              </text>
            </g>
          ))}

          <g transform="translate(32 374)" opacity=".7">
            <path d="M0 0h28m-19 0 5-5m2 5 5-5" fill="none" stroke="#B98A34" strokeWidth="1.5" />
            <path d="M32 0h28m-19 0 5-5m2 5 5-5" fill="none" stroke="#B98A34" strokeWidth="1.5" />
          </g>
          <text x="1408" y="379" textAnchor="end" fill="#668271" fontSize="11" fontWeight="600" fontFamily="inherit">
            {isBangla ? 'ভালোবাসায় বোনা প্রতিটি ধাপ' : 'Every step, stitched with love'}
          </text>
        </svg>
      </div>
    </div>
  );
};
