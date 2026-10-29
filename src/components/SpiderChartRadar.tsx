import React, { useEffect, useMemo, useState } from 'react';
import { Award, ChevronLeft, Gamepad2, Minus, Plus, RotateCcw, Save } from 'lucide-react';
import './BuddhiBuddy.css';
import { ChildProfile, ECD6Domain, Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';
import {
  calculateECDResult,
  calculateAgeFromBirthDate,
  childAssessmentMonths,
  childChecklistMonth,
  childChecklistRangeLabel,
  childMilestoneEndDate,
  ECDAnswers,
  ECDPhase,
  ECDQuestion,
  getECDQuestions,
  pregnancyMonthFromWeeks,
} from '../utils/ecdAssessment';

interface SpiderChartRadarProps {
  currentLang: Language;
  activeChild: ChildProfile;
  onSaveAssessment?: (month: number, overallScore: number) => void;
  onNavigateToPlay?: (domain: ECD6Domain, skill: string) => void;
}

const childMonths = [...childAssessmentMonths];
const buddyImages: Record<string, string> = {
  kantha: '/assets/characters/live/5_kuchu_kantha_baby_live.svg',
  boy: '/assets/characters/live/1_baby_boy_live.svg',
  girl: '/assets/characters/live/2_baby_girl_live.svg',
  tiger: '/assets/characters/live/3_tiger_cub_live.svg',
  doel: '/assets/characters/live/4_doel_bird_live.svg',
};

const playDomainByAssessmentDomain: Record<string, ECD6Domain> = {
  'মূল শারীরিক চলন': 'gross_motor',
  'সূক্ষ্ম হাতের কাজ': 'fine_motor',
  'বুদ্ধি ও সমস্যা সমাধান': 'cognitive',
  'ভাষা ও যোগাযোগ': 'communication',
  'সামাজিক ও আবেগীয়': 'social_emotional',
  'নিজের যত্ন ও অভ্যাস': 'self_help',
};

const playDomainLabelBn: Partial<Record<ECD6Domain, string>> = {
  gross_motor: 'শারীরিক চলনের দক্ষতা',
  fine_motor: 'হাতের সূক্ষ্ম কাজের দক্ষতা',
  cognitive: 'চিন্তা ও সমস্যা সমাধানের দক্ষতা',
  communication: 'ভাষা ও যোগাযোগের দক্ষতা',
  social_emotional: 'সামাজিক ও আবেগীয় দক্ষতা',
  self_help: 'নিজের যত্নের অভ্যাস',
};

function joinSkillsBn(skills: string[]) {
  if (skills.length < 2) return skills[0] ?? '';
  if (skills.length === 2) return `${skills[0]} ও ${skills[1]}`;
  return `${skills.slice(0, -1).join('، ')} ও ${skills[skills.length - 1]}`;
}

interface ChildChecklistProgress {
  startMonth: number;
  completedMonths: number[];
}

const checklistProgressKey = (childId: string) => `kuchu_ecd_progress_${childId}`;
const checklistAnswersKey = (childId: string, phase: ECDPhase, month: number) => `kuchu_ecd_${childId}_${phase}_${month}`;
const checklistSavedKey = (childId: string, phase: ECDPhase, month: number) => `${checklistAnswersKey(childId, phase, month)}_saved`;

function readChecklistAnswers(childId: string, phase: ECDPhase, month: number): ECDAnswers {
  try {
    const saved = localStorage.getItem(checklistAnswersKey(childId, phase, month));
    return saved ? JSON.parse(saved) as ECDAnswers : {};
  } catch {
    return {};
  }
}

function readChecklistDeferred(childId: string, phase: ECDPhase, month: number): boolean {
  try {
    return localStorage.getItem(`${checklistAnswersKey(childId, phase, month)}_deferred`) === 'true';
  } catch {
    return false;
  }
}

function readChecklistSaved(childId: string, phase: ECDPhase, month: number, completed = false): boolean {
  try {
    const saved = localStorage.getItem(checklistSavedKey(childId, phase, month));
    return saved === null ? completed : saved === 'true';
  } catch {
    return completed;
  }
}

function readChildChecklistProgress(childId: string, defaultMonth: number): ChildChecklistProgress {
  try {
    const saved = localStorage.getItem(checklistProgressKey(childId));
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<ChildChecklistProgress>;
      if (childAssessmentMonths.some((month) => month === parsed.startMonth) && Array.isArray(parsed.completedMonths)) {
        return {
          startMonth: parsed.startMonth as number,
          completedMonths: parsed.completedMonths.filter((month): month is number => typeof month === 'number' && childAssessmentMonths.some((validMonth) => validMonth === month)),
        };
      }
    }

    const answeredMonths = childAssessmentMonths.filter((month) => Object.keys(readChecklistAnswers(childId, 'child', month)).length > 0);
    const startMonth = answeredMonths[0] ?? defaultMonth;
    const completedMonths = childAssessmentMonths.filter((month) => {
      const questions = getECDQuestions('child', month);
      const answers = readChecklistAnswers(childId, 'child', month);
      return questions.length > 0 && questions.every((question) => answers[question.id] !== undefined);
    });
    const progress = { startMonth, completedMonths };
    localStorage.setItem(checklistProgressKey(childId), JSON.stringify(progress));
    return progress;
  } catch {
    return { startMonth: defaultMonth, completedMonths: [] };
  }
}

function firstIncompleteMilestone(progress: ChildChecklistProgress, eligibleMonth: number): number {
  const dueMonths = childAssessmentMonths.filter((month) => month >= progress.startMonth && month <= eligibleMonth);
  return dueMonths.find((month) => !progress.completedMonths.includes(month)) ?? eligibleMonth;
}

function getUnresolvedEarlierQuestions(childId: string, month: number) {
  const unresolved = new Map<string, ECDQuestion>();
  for (const earlierMonth of childMonths.filter((candidate) => candidate < month)) {
    for (const question of getECDQuestions('child', earlierMonth)) {
      let latestAnswer: number | undefined;
      for (const checkedMonth of childMonths.filter((candidate) => candidate >= earlierMonth && candidate < month)) {
        const priorAnswers = readChecklistAnswers(childId, 'child', checkedMonth);
        if (priorAnswers[question.id] !== undefined) latestAnswer = priorAnswers[question.id];
      }
      if (latestAnswer !== undefined && question.options[latestAnswer]?.weight < 2) unresolved.set(question.id, question);
    }
  }
  return Array.from(unresolved.values());
}

export const SpiderChartRadar: React.FC<SpiderChartRadarProps> = ({
  currentLang,
  activeChild,
  onSaveAssessment,
  onNavigateToPlay,
}) => {
  const phase: ECDPhase = activeChild.isPregnant ? 'pregnancy' : 'child';
  const childAgeMonths = phase === 'child'
    ? calculateAgeFromBirthDate(activeChild.birthDate).ageMonths
    : activeChild.ageMonths;
  const defaultMonth = activeChild.isPregnant
    ? activeChild.gestationalMonth ?? pregnancyMonthFromWeeks(activeChild.gestationalAgeWeeks ?? 0)
    : childChecklistMonth(childAgeMonths);
  const [progress, setProgress] = useState<ChildChecklistProgress>(() => phase === 'child'
    ? readChildChecklistProgress(activeChild.id, defaultMonth)
    : { startMonth: defaultMonth, completedMonths: [] });
  const initialMonth = phase === 'child' ? firstIncompleteMilestone(progress, defaultMonth) : defaultMonth;
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showReport, setShowReport] = useState(() => phase === 'child' && progress.completedMonths.includes(initialMonth));
  const [isReportSaved, setIsReportSaved] = useState(() => readChecklistSaved(activeChild.id, phase, initialMonth, progress.completedMonths.includes(initialMonth)));
  const [isReportExpanded, setIsReportExpanded] = useState(() => !readChecklistSaved(activeChild.id, phase, initialMonth, progress.completedMonths.includes(initialMonth)));
  const [buddyMood, setBuddyMood] = useState<'idle' | 'happy' | 'sad' | 'tense'>('idle');
  const [isAnswering, setIsAnswering] = useState(false);
  const storageKey = checklistAnswersKey(activeChild.id, phase, selectedMonth);
  const [answers, setAnswers] = useState<ECDAnswers>(() => readChecklistAnswers(activeChild.id, phase, initialMonth));
  const [wasDeferred, setWasDeferred] = useState(() => readChecklistDeferred(activeChild.id, phase, initialMonth));
  const currentMilestone = phase === 'child' ? firstIncompleteMilestone(progress, defaultMonth) : defaultMonth;
  const unresolvedQuestions = useMemo(
    () => phase === 'child' ? getUnresolvedEarlierQuestions(activeChild.id, selectedMonth) : [],
    [activeChild.id, phase, selectedMonth],
  );
  const questions = useMemo(
    () => [...unresolvedQuestions, ...getECDQuestions(phase, selectedMonth)],
    [phase, selectedMonth, unresolvedQuestions],
  );
  const currentQuestion = questions[questionIndex];
  const result = calculateECDResult(questions, answers, phase);
  const reportMonth = selectedMonth;
  const buddyId = activeChild.mascotId && buddyImages[activeChild.mascotId] ? activeChild.mascotId : 'kantha';
  const buddyName = activeChild.mascotNameBn || 'কুচু';
  const milestoneEnd = phase === 'child' ? childMilestoneEndDate(activeChild.birthDate, selectedMonth) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilMilestoneEnd = milestoneEnd
    ? Math.ceil((milestoneEnd.getTime() - today.getTime()) / 86_400_000)
    : null;
  const deferAllowed = phase === 'child'
    && selectedMonth === currentMilestone
    && daysUntilMilestoneEnd !== null
    && daysUntilMilestoneEnd > 10;
  const isFinalTenDays = phase === 'child' && daysUntilMilestoneEnd !== null && daysUntilMilestoneEnd <= 10;
  const nextEligibleMilestone = childMonths.find((month) => month > selectedMonth && month >= progress.startMonth && month <= defaultMonth);

  useEffect(() => {
    const nextProgress = readChildChecklistProgress(activeChild.id, defaultMonth);
    const nextMonth = phase === 'child' ? firstIncompleteMilestone(nextProgress, defaultMonth) : defaultMonth;
    setProgress(nextProgress);
    setSelectedMonth(nextMonth);
    setQuestionIndex(0);
    setShowReport(phase === 'child' && nextProgress.completedMonths.includes(nextMonth));
    const saved = readChecklistSaved(activeChild.id, phase, nextMonth, nextProgress.completedMonths.includes(nextMonth));
    setIsReportSaved(saved);
    setIsReportExpanded(!saved);
    setBuddyMood('idle');
    setAnswers(readChecklistAnswers(activeChild.id, phase, nextMonth));
    setWasDeferred(readChecklistDeferred(activeChild.id, phase, nextMonth));
  }, [activeChild.id, defaultMonth, phase]);

  useEffect(() => {
    const savedAnswers = readChecklistAnswers(activeChild.id, phase, selectedMonth);
    const pendingQuestions = phase === 'child'
      ? [...getUnresolvedEarlierQuestions(activeChild.id, selectedMonth), ...getECDQuestions(phase, selectedMonth)]
      : getECDQuestions(phase, selectedMonth);
    const firstUnanswered = pendingQuestions.findIndex((question) => savedAnswers[question.id] === undefined);
    setQuestionIndex(firstUnanswered < 0 ? 0 : firstUnanswered);
  }, [activeChild.id, phase, selectedMonth]);

  const saveAnswer = (optionIndex: number) => {
    if (!currentQuestion || isAnswering) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(nextAnswers);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextAnswers));
      localStorage.removeItem(`${storageKey}_deferred`);
    } catch {
      // Keep the current answers in memory when storage is unavailable.
    }
    setWasDeferred(false);

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
      if (phase === 'child') {
        const nextProgress = progress.completedMonths.includes(selectedMonth)
          ? progress
          : { ...progress, completedMonths: [...progress.completedMonths, selectedMonth].sort((a, b) => a - b) };
        setProgress(nextProgress);
        try {
          localStorage.setItem(checklistProgressKey(activeChild.id), JSON.stringify(nextProgress));
          localStorage.removeItem(`${storageKey}_deferred`);
        } catch {
          // Keep the completed milestone in memory if storage is unavailable.
        }
        setWasDeferred(false);
      }
      setShowReport(true);
      setIsReportSaved(false);
      setIsReportExpanded(true);
      onSaveAssessment?.(reportMonth, nextReport.overallScore);
    }, 900);
  };

  const changeChecklist = (month: number) => {
    if (phase === 'child' && (month < progress.startMonth || month > currentMilestone || month > defaultMonth)) return;
    setSelectedMonth(month);
    setQuestionIndex(0);
    setShowReport(phase === 'child' && progress.completedMonths.includes(month));
    const saved = readChecklistSaved(activeChild.id, phase, month, progress.completedMonths.includes(month));
    setIsReportSaved(saved);
    setIsReportExpanded(!saved);
    setBuddyMood('idle');
    setAnswers(readChecklistAnswers(activeChild.id, phase, month));
    try {
      setWasDeferred(readChecklistDeferred(activeChild.id, phase, month));
    } catch {
      setWasDeferred(false);
    }
  };

  const deferCurrentMilestone = () => {
    if (!deferAllowed) return;
    try {
      localStorage.setItem(`${storageKey}_deferred`, 'true');
    } catch {
      // The unanswered milestone remains active in memory.
    }
    setWasDeferred(true);
  };

  const resetAssessment = () => {
    try {
      localStorage.setItem(checklistSavedKey(activeChild.id, phase, selectedMonth), 'false');
    } catch {
      // Continue the review even when local storage is unavailable.
    }
    setIsReportSaved(false);
    setIsReportExpanded(true);
    setQuestionIndex(0);
    setShowReport(false);
    setBuddyMood('idle');
  };

  const saveChecklist = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
      localStorage.setItem(checklistSavedKey(activeChild.id, phase, selectedMonth), 'true');
    } catch {
      // Keep the report saved in memory for this session.
    }
    setIsReportSaved(true);
    setIsReportExpanded(false);
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
              : childChecklistRangeLabel(selectedMonth, currentLang)}
          </h2>
        </div>
        {phase === 'child' && (
          <label className="flex items-center gap-2 text-sm font-medium text-[#5C6479]">
            <span>{currentLang === 'bn' ? 'চেকলিস্টের সময়কাল' : 'Checklist period'}</span>
            <select
              value={selectedMonth}
              onChange={(event) => changeChecklist(Number(event.target.value))}
              className="rounded-lg border border-[#EED9C7] bg-[#FFFAF5] px-3 py-2 text-sm outline-none focus:border-[#FF8552]"
            >
              {childMonths.map((month) => (
                <option key={month} value={month} disabled={month < progress.startMonth || month > currentMilestone || month > defaultMonth}>
                  {childChecklistRangeLabel(month, currentLang)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {phase === 'child' && wasDeferred && !showReport && (
        <p className="mt-5 rounded-xl border border-[#F0D5C1] bg-[#FFFAF5] px-4 py-3 text-sm font-medium leading-relaxed text-[#9B542D]">
          {currentLang === 'bn' ? 'এই ধাপের উত্তরগুলো পরে দিতে চেয়েছিলেন। ধাপটি এখনও বাকি আছে—চাইলে এখনই চালিয়ে যেতে পারেন।' : 'You chose to answer this step later. It is still pending, and you can continue whenever you are ready.'}
        </p>
      )}
      {phase === 'child' && !showReport && selectedMonth === currentMilestone && isFinalTenDays && (
        <p className="mt-5 rounded-xl border border-[#F2C3BA] bg-[#FFF6F4] px-4 py-3 text-sm font-semibold leading-relaxed text-[#A63E32]">
          {daysUntilMilestoneEnd !== null && daysUntilMilestoneEnd < 0
            ? (currentLang === 'bn' ? 'এই ধাপের সময় পেরিয়ে গেছে। পরের ধাপে যাওয়ার আগে বাকি উত্তরগুলো সম্পন্ন করুন।' : 'This milestone period has ended. Complete its remaining answers before moving on.')
            : (currentLang === 'bn' ? 'এই ধাপের শেষ ১০ দিন চলছে—পরের ধাপে যাওয়ার আগে প্রশ্নগুলোর উত্তর সম্পন্ন করুন।' : 'The final 10 days of this milestone period have begun. Complete its questions before moving on.')}
        </p>
      )}

      {!showReport && currentQuestion && (
        <div className="mx-auto mt-7 max-w-2xl">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#7C8294]">
            <span>{childChecklistRangeLabel(selectedMonth, currentLang)} · {formatLocalizedNumber(questionIndex + 1, currentLang)} / {formatLocalizedNumber(questions.length, currentLang)}</span>
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            {questionIndex > 0 ? (
              <button type="button" onClick={() => setQuestionIndex((index) => index - 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#667085] hover:bg-[#F8F7F5]">
                <ChevronLeft className="h-4 w-4" /> {currentLang === 'bn' ? 'আগের প্রশ্ন' : 'Previous question'}
              </button>
            ) : <span />}
            {deferAllowed && (
              <button type="button" onClick={deferCurrentMilestone} className="rounded-lg border border-[#EED9C7] px-3 py-2 text-sm font-semibold text-[#7C6A5A] transition-colors hover:bg-[#FFFAF5]">
                {currentLang === 'bn' ? 'এখন নয়, পরে উত্তর দেব' : 'Not now, answer later'}
              </button>
            )}
          </div>
        </div>
      )}

      {showReport && (
        <div className="mx-auto mt-7 max-w-2xl space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#F0D5C1] bg-[#FFFAF5] p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 shrink-0 text-[#C85D26]" />
              <div>
                <p className="text-xs font-medium text-[#7C8294]">{currentLang === 'bn' ? 'সামগ্রিক স্কোর' : 'Overall score'}</p>
                <p className="text-2xl font-bold text-[#2D3142]">{formatLocalizedNumber(result.overallScore, currentLang)}%</p>
                <p className={`text-sm font-semibold ${statusColor(result.status)}`}>{statusText(result.status)}</p>
              </div>
            </div>
            <button
              type="button"
              aria-expanded={isReportExpanded}
              onClick={() => setIsReportExpanded((expanded) => !expanded)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#EED9C7] bg-white text-[#5C6479] transition-colors hover:bg-[#FFF4EA]"
              aria-label={isReportExpanded ? (currentLang === 'bn' ? 'বিস্তারিত গুটিয়ে রাখুন' : 'Collapse details') : (currentLang === 'bn' ? 'বিস্তারিত দেখুন' : 'Expand details')}
            >
              {isReportExpanded ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
          {!isReportExpanded && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EED9C7] bg-white px-4 py-3">
              <p className="text-sm text-[#667085]">
                {currentLang === 'bn' ? `উত্তর সংরক্ষিত · ${formatLocalizedNumber(questions.length, currentLang)}টি প্রশ্ন` : `Answers saved · ${questions.length} questions`}
              </p>
              <button type="button" onClick={resetAssessment} className="inline-flex items-center gap-2 rounded-lg border border-[#EED9C7] px-3 py-2 text-sm font-semibold text-[#5C6479] hover:bg-[#FFFAF5]">
                <RotateCcw className="h-4 w-4" /> {currentLang === 'bn' ? 'উত্তর আবার দিন' : 'Answer again'}
              </button>
            </div>
          )}
          {isReportExpanded && <>
          {result.domains.map((domain) => (
            <article key={domain.key} className="rounded-xl border border-[#EED9C7] bg-white p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-[#2D3142]">{domain.labelBn}</span>
                <span className={`font-bold ${statusColor(domain.status)}`}>{formatLocalizedNumber(domain.score, currentLang)}% · {statusText(domain.status)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1E3D3]">
                <div className={`h-full rounded-full ${domain.status === 'on_track' ? 'bg-[#4CAF50]' : domain.status === 'monitor' ? 'bg-[#FFC107]' : 'bg-[#F44336]'}`} style={{ width: `${domain.score}%` }} />
              </div>
              {domain.followUpSkills.length > 0 && (() => {
                const skills = [...new Set(domain.followUpSkills)];
                const playDomain = playDomainByAssessmentDomain[domain.key];
                return (
                  <div className="mt-3 space-y-2 rounded-xl bg-[#FFFAF5] p-3">
                    <p className="text-xs leading-relaxed text-[#667085]">
                      {currentLang === 'bn' && playDomain
                        ? `${playDomainLabelBn[playDomain]} বাড়াতে ${joinSkillsBn(skills)} চর্চা করতে পারেন। যে দক্ষতাটি নিয়ে খেলতে চান, সেটি বেছে নিন।`
                        : currentLang === 'bn'
                          ? `আরও চর্চার বিষয়: ${joinSkillsBn(skills)}।`
                          : `Practice ideas: ${skills.join(', ')}.`}
                    </p>
                    {playDomain && onNavigateToPlay && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => onNavigateToPlay(playDomain, skill)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#EAF4EC] px-2.5 py-1.5 text-[11px] font-bold text-[#2F6B47] transition-colors hover:bg-[#D6EBD9]"
                          >
                            <Gamepad2 className="h-3.5 w-3.5" />
                            {currentLang === 'bn' ? `${skill}—চলুন, খেলা শুরু করি` : `Play to practice: ${skill}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </article>
          ))}
          <details className="rounded-xl border border-[#EED9C7] bg-white p-3">
            <summary className="cursor-pointer list-inside text-sm font-semibold text-[#5C6479]">{currentLang === 'bn' ? 'প্রশ্ন ও আপনার উত্তর' : 'Questions and your answers'}</summary>
            <div className="mt-3 space-y-2">
              {questions.map((question) => {
                const answerIndex = answers[question.id];
                return (
                  <div key={question.id} className="rounded-lg bg-[#FFFAF5] px-3 py-2">
                    <p className="text-sm font-medium leading-relaxed text-[#344054]">{question.questionBn}</p>
                    <p className="mt-1 text-xs text-[#667085]">{currentLang === 'bn' ? 'আপনার উত্তর: ' : 'Your answer: '}{answerIndex === undefined ? (currentLang === 'bn' ? 'উত্তর দেওয়া হয়নি' : 'Not answered') : question.options[answerIndex]?.textBn}</p>
                  </div>
                );
              })}
            </div>
          </details>
          <div className="flex flex-wrap gap-2">
            {!isReportSaved && (
              <button type="button" onClick={saveChecklist} className="inline-flex items-center gap-2 rounded-xl bg-[#2F6B47] px-4 py-2 font-semibold text-white hover:bg-[#275A3B]">
                <Save className="h-4 w-4" /> {currentLang === 'bn' ? 'উত্তর সংরক্ষণ করুন' : 'Save answers'}
              </button>
            )}
            {isReportSaved && <span className="self-center text-sm font-semibold text-[#2F6B47]">{currentLang === 'bn' ? 'উত্তর সংরক্ষিত' : 'Answers saved'}</span>}
            <button type="button" onClick={resetAssessment} className="inline-flex items-center gap-2 rounded-xl border border-[#EED9C7] px-4 py-2 text-sm font-semibold text-[#5C6479] hover:bg-[#FFFAF5]">
              <RotateCcw className="h-4 w-4" /> {currentLang === 'bn' ? 'উত্তর আবার দিন' : 'Answer again'}
            </button>
          </div>
          {phase === 'child' && progress.completedMonths.includes(selectedMonth) && nextEligibleMilestone && (
            <button type="button" onClick={() => changeChecklist(nextEligibleMilestone)} className="ml-2 rounded-xl bg-[#E9753F] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#D86430]">
              {currentLang === 'bn' ? `পরের ধাপ: ${childChecklistRangeLabel(nextEligibleMilestone, currentLang)}` : `Next step: ${childChecklistRangeLabel(nextEligibleMilestone, currentLang)}`}
            </button>
          )}
          <p className="text-center text-[11px] leading-relaxed text-[#7C8294]">
            {currentLang === 'bn' ? 'ফলাফলটি আপনার দেওয়া উত্তর ও অ্যাসেসমেন্টের স্কোরিং নিয়মের সারাংশ।' : 'This summary reflects your answers and the assessment scoring rules.'}
          </p>
          </>}
        </div>
      )}

    </section>
  );
};
