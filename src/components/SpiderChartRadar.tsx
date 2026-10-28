import React, { useEffect, useMemo, useState } from 'react';
import { Award, ChevronLeft, RotateCcw } from 'lucide-react';
import './BuddhiBuddy.css';
import { ChildProfile, Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';
import {
  calculateECDResult,
  childChecklistMonth,
  ECDAnswers,
  ECDPhase,
  getECDQuestions,
  pregnancyMonthFromWeeks,
} from '../utils/ecdAssessment';

interface SpiderChartRadarProps {
  currentLang: Language;
  activeChild: ChildProfile;
  onSaveAssessment?: (month: number, overallScore: number) => void;
}

const childMonths = [2, 4, 6, 9, 12, 15, 18, 24];
const buddyImages: Record<string, string> = {
  kantha: '/assets/characters/live/5_kuchu_kantha_baby_live.svg',
  boy: '/assets/characters/live/1_baby_boy_live.svg',
  girl: '/assets/characters/live/2_baby_girl_live.svg',
  tiger: '/assets/characters/live/3_tiger_cub_live.svg',
  doel: '/assets/characters/live/4_doel_bird_live.svg',
};

export const SpiderChartRadar: React.FC<SpiderChartRadarProps> = ({
  currentLang,
  activeChild,
  onSaveAssessment,
}) => {
  const phase: ECDPhase = activeChild.isPregnant ? 'pregnancy' : 'child';
  const defaultMonth = activeChild.isPregnant
    ? activeChild.gestationalMonth ?? pregnancyMonthFromWeeks(activeChild.gestationalAgeWeeks ?? 0)
    : childChecklistMonth(activeChild.ageMonths);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [buddyMood, setBuddyMood] = useState<'idle' | 'happy' | 'sad' | 'tense'>('idle');
  const [isAnswering, setIsAnswering] = useState(false);
  const storageKey = `kuchu_ecd_${activeChild.id}_${phase}_${selectedMonth}`;
  const [answers, setAnswers] = useState<ECDAnswers>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) as ECDAnswers : {};
    } catch {
      return {};
    }
  });

  const questions = useMemo(() => getECDQuestions(phase, selectedMonth), [phase, selectedMonth]);
  const currentQuestion = questions[questionIndex];
  const result = calculateECDResult(questions, answers, phase);
  const reportMonth = selectedMonth;
  const buddyId = activeChild.mascotId && buddyImages[activeChild.mascotId] ? activeChild.mascotId : 'kantha';
  const buddyName = activeChild.mascotNameBn || 'কুচু';

  useEffect(() => {
    setSelectedMonth(defaultMonth);
    setQuestionIndex(0);
    setShowReport(false);
    setBuddyMood('idle');
    try {
      const saved = localStorage.getItem(`kuchu_ecd_${activeChild.id}_${phase}_${defaultMonth}`);
      setAnswers(saved ? JSON.parse(saved) as ECDAnswers : {});
    } catch {
      setAnswers({});
    }
  }, [activeChild.id, defaultMonth, phase]);

  const saveAnswer = (optionIndex: number) => {
    if (!currentQuestion || isAnswering) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(nextAnswers);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextAnswers));
    } catch {
      // Keep the current answers in memory when storage is unavailable.
    }

    const nextReport = calculateECDResult(questions, nextAnswers, phase);
    const weight = currentQuestion.options[optionIndex]?.weight ?? 1;
    setBuddyMood(weight === 2 ? 'happy' : weight === 0 ? 'sad' : 'tense');
    setIsAnswering(true);
    window.setTimeout(() => {
      setBuddyMood('idle');
      setIsAnswering(false);
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((index) => index + 1);
        return;
      }
      setShowReport(true);
      onSaveAssessment?.(reportMonth, nextReport.overallScore);
    }, 900);
  };

  const changeChecklist = (month: number) => {
    setSelectedMonth(month);
    setQuestionIndex(0);
    setShowReport(false);
    setBuddyMood('idle');
    try {
      const saved = localStorage.getItem(`kuchu_ecd_${activeChild.id}_${phase}_${month}`);
      setAnswers(saved ? JSON.parse(saved) as ECDAnswers : {});
    } catch {
      setAnswers({});
    }
  };

  const resetAssessment = () => {
    setQuestionIndex(0);
    setShowReport(false);
    setBuddyMood('idle');
  };

  const statusText = (status: 'on_track' | 'monitor' | 'delay_risk') => {
    if (status === 'on_track') return currentLang === 'bn' ? 'আশানুরূপ' : 'On track';
    if (status === 'monitor') return currentLang === 'bn' ? 'আরও খেয়াল রাখুন' : 'Monitor';
    return currentLang === 'bn' ? 'আরও সহায়তা প্রয়োজন' : 'Needs follow-up';
  };

  const statusColor = (status: 'on_track' | 'monitor' | 'delay_risk') =>
    status === 'on_track' ? 'text-[#2F6B47]' : status === 'monitor' ? 'text-[#9A6B00]' : 'text-[#B42318]';

  return (
    <section className="rounded-3xl border border-[#EED9C7] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#C85D26]">
            {phase === 'pregnancy'
              ? currentLang === 'bn' ? 'গর্ভকালীন অ্যাসেসমেন্ট' : 'Pregnancy assessment'
              : currentLang === 'bn' ? 'শিশুর বিকাশ অ্যাসেসমেন্ট' : 'Child development assessment'}
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#2D3142]">
            {phase === 'pregnancy'
              ? currentLang === 'bn' ? `${formatLocalizedNumber(activeChild.gestationalAgeWeeks ?? 0, currentLang)} সপ্তাহ` : `${activeChild.gestationalAgeWeeks ?? 0} weeks`
              : currentLang === 'bn' ? `${formatLocalizedNumber(activeChild.ageMonths, currentLang)} মাসের চেকলিস্ট` : `${activeChild.ageMonths}-month checklist`}
          </h2>
        </div>
        {phase === 'child' && (
          <label className="flex items-center gap-2 text-sm font-medium text-[#5C6479]">
            <span>{currentLang === 'bn' ? 'বয়সের তালিকা' : 'Age checklist'}</span>
            <select
              value={selectedMonth}
              onChange={(event) => changeChecklist(Number(event.target.value))}
              className="rounded-lg border border-[#EED9C7] bg-[#FFFAF5] px-3 py-2 text-sm outline-none focus:border-[#FF8552]"
            >
              {childMonths.map((month) => (
                <option key={month} value={month}>{formatLocalizedNumber(month, currentLang)} {currentLang === 'bn' ? 'মাস' : 'months'}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!showReport && currentQuestion && (
        <div className="mx-auto mt-7 max-w-2xl">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#7C8294]">
            <span>{formatLocalizedNumber(questionIndex + 1, currentLang)} / {formatLocalizedNumber(questions.length, currentLang)}</span>
          </div>
          <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#F1E3D3]">
            <div className="h-full rounded-full bg-[#FF8552] transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <div className="buddhi-chat-row" aria-live="polite">
            <div className={`buddhi-avatar buddhi-mood-${buddyMood}`}>
              <img src={buddyImages[buddyId]} alt="" />
              {buddyMood !== 'idle' && <span className="buddhi-mood-face">{buddyMood === 'happy' ? '😄' : buddyMood === 'sad' ? '😭' : '😟'}</span>}
            </div>
            <div className="buddhi-speech-bubble">
              <h3 className="text-lg font-bold leading-relaxed text-[#252A3A] sm:text-xl">{currentQuestion.questionBn}</h3>
              {buddyMood !== 'idle' && <p className="mt-3 text-sm font-semibold text-[#5C6479]">{buddyMood === 'happy' ? 'বাহ, দারুণ উত্তর!' : buddyMood === 'sad' ? 'কোনো সমস্যা নেই, একসাথে শিখব।' : 'হুম, এটা আরেকটু খেয়াল করি।'}</p>}
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => saveAnswer(index)}
                disabled={isAnswering}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
                  answers[currentQuestion.id] === index
                    ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26]'
                    : 'border-[#EED9C7] bg-[#FFFAF5] text-[#2D3142] hover:border-[#FFB07C]'
                }`}
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#7C8294]">{index + 1}</span>
                {option.textBn}
              </button>
            ))}
          </div>
          {questionIndex > 0 && (
            <button type="button" onClick={() => setQuestionIndex((index) => index - 1)} className="mt-4 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#667085] hover:bg-[#F8F7F5]">
              <ChevronLeft className="h-4 w-4" /> {currentLang === 'bn' ? 'আগের প্রশ্ন' : 'Previous question'}
            </button>
          )}
        </div>
      )}

      {showReport && (
        <div className="mx-auto mt-7 max-w-2xl space-y-4">
          <div className="rounded-2xl border border-[#F0D5C1] bg-[#FFFAF5] p-4 text-center">
            <Award className="mx-auto h-8 w-8 text-[#C85D26]" />
            <p className="mt-2 text-xs font-medium text-[#7C8294]">{currentLang === 'bn' ? 'সামগ্রিক স্কোর' : 'Overall score'}</p>
            <p className="text-3xl font-bold text-[#2D3142]">{formatLocalizedNumber(result.overallScore, currentLang)}%</p>
            <p className={`text-sm font-semibold ${statusColor(result.status)}`}>{statusText(result.status)}</p>
          </div>
          {result.domains.map((domain) => (
            <article key={domain.key} className="rounded-xl border border-[#EED9C7] bg-white p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-[#2D3142]">{domain.labelBn}</span>
                <span className={`font-bold ${statusColor(domain.status)}`}>{formatLocalizedNumber(domain.score, currentLang)}% · {statusText(domain.status)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1E3D3]">
                <div className={`h-full rounded-full ${domain.status === 'on_track' ? 'bg-[#4CAF50]' : domain.status === 'monitor' ? 'bg-[#FFC107]' : 'bg-[#F44336]'}`} style={{ width: `${domain.score}%` }} />
              </div>
              {domain.followUpSkills.length > 0 && <p className="mt-2 text-xs leading-relaxed text-[#667085]">{currentLang === 'bn' ? 'আরও খেয়াল রাখুন: ' : 'Keep an eye on: '}{domain.followUpSkills.slice(0, 3).join(' · ')}</p>}
            </article>
          ))}
          <button type="button" onClick={resetAssessment} className="inline-flex items-center gap-2 rounded-xl border border-[#EED9C7] px-4 py-2 text-sm font-semibold text-[#5C6479] hover:bg-[#FFFAF5]">
            <RotateCcw className="h-4 w-4" /> {currentLang === 'bn' ? 'উত্তরগুলো দেখুন' : 'Review answers'}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-[#7C8294]">
            {currentLang === 'bn' ? 'ফলাফলটি আপনার দেওয়া উত্তর ও অ্যাসেসমেন্টের স্কোরিং নিয়মের সারাংশ।' : 'This summary reflects your answers and the assessment scoring rules.'}
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-[#F3E7DC] pt-4 text-xs text-[#7C8294]">
        {currentLang === 'bn' ? 'স্কোর: প্রতিটি উত্তরে ২, ১ বা ০ পয়েন্ট।' : 'Scoring: each answer earns 2, 1, or 0 points.'}
      </div>
    </section>
  );
};
