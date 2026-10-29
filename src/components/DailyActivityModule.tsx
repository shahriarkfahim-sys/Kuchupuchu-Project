import React, { useEffect, useState, useMemo } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Check,
  Clock, 
  BookOpen, 
  RotateCcw, 
  Pause, 
  ChevronRight, 
  X,
  Baby,
  Sparkles,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { Activity, ChildProfile, ECD6Domain, Language } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';
import { domainMeta, getMonthMilestones } from '../data/ecdDataset';
import { calculateECDResult, childAssessmentMonths, ECDAnswers, getECDQuestions, questionBank } from '../utils/ecdAssessment';

interface DailyActivityModuleProps {
  currentLang: Language;
  activeChild: ChildProfile;
  activities?: Activity[];
  onToggleComplete?: (id: string) => void;
  focus?: { domain: ECD6Domain; skill: string; ageMonth: number } | null;
}

// Keep all play cards on one calm, consistent palette.
const cardThemes = [
  {
    cardBg: 'bg-white',
    cardBorder: 'border-[#EED9C7]',
    borderHover: 'hover:border-[#FFB07C]',
    tagBg: 'bg-[#F4F1EC]',
    tagText: 'text-[#5C6479]',
    accentText: 'text-[#C85D26]',
    doneBg: 'bg-[#FF8552]',
    guideBtn: 'text-[#C85D26] hover:text-[#9A3412] bg-[#FFF0E2]',
    doneBtnUnchecked: 'bg-white border-[#EED9C7] text-[#5C6479] hover:bg-[#F8F7F5]',
  },
];

// Helper to strip all English brackets from text (e.g., "(Peek-a-boo)" or "(Runs Well)")
function stripBrackets(str: string): string {
  if (!str) return '';
  return str.replace(/\s*\([A-Za-z0-9\s/,-]+\)/g, '').trim();
}

function normalizeBanglaMatch(value: string) {
  return value.normalize('NFC').toLowerCase().replace(/ড়/g, 'ড়').replace(/ঢ়/g, 'ঢ়').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
}

function editDistanceAtMostOne(left: string, right: string) {
  const a = Array.from(left);
  const b = Array.from(right);
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}

function countSkillWordMatches(skill: string, searchableText: string) {
  const skillWords = normalizeBanglaMatch(skill).split(/\s+/).filter((word) => Array.from(word).length > 2);
  const activityWords = normalizeBanglaMatch(searchableText).split(/\s+/);
  return skillWords.reduce((score, word) => score + (activityWords.some((candidate) => candidate.includes(word) || word.includes(candidate) || editDistanceAtMostOne(word, candidate)) ? 1 : 0), 0);
}

const assessmentDomainToPlay: Record<string, ECD6Domain> = {
  'মূল শারীরিক চলন': 'gross_motor',
  'সূক্ষ্ম হাতের কাজ': 'fine_motor',
  'বুদ্ধি ও সমস্যা সমাধান': 'cognitive',
  'ভাষা ও যোগাযোগ': 'communication',
  'সামাজিক ও আবেগীয়': 'social_emotional',
  'নিজের যত্ন ও অভ্যাস': 'self_help',
};

const playDomains: ECD6Domain[] = ['gross_motor', 'fine_motor', 'cognitive', 'communication', 'social_emotional', 'self_help'];

function activityCompletionKey(childId: string, ageMonth: number) {
  return `kuchu_play_done_${childId}_${ageMonth}`;
}

function readCompletedActivities(childId: string, ageMonth: number): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(activityCompletionKey(childId, ageMonth));
    return saved ? JSON.parse(saved) as Record<string, boolean> : {};
  } catch {
    return {};
  }
}

export const DailyActivityModule: React.FC<DailyActivityModuleProps> = ({
  currentLang,
  activeChild,
  onToggleComplete,
  focus,
}) => {
  const t = translations[currentLang];
  const [selectedAgeMonth, setSelectedAgeMonth] = useState<number>(focus?.ageMonth ?? (activeChild.ageMonths || 9));
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>(() => readCompletedActivities(activeChild.id, focus?.ageMonth ?? (activeChild.ageMonths || 9)));
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<ECD6Domain | null>(focus?.domain ?? null);
  const [activeModalActivity, setActiveModalActivity] = useState<any | null>(null);

  // Interactive Timer state inside activity modal
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setSelectedAgeMonth(focus?.ageMonth ?? (activeChild.ageMonths || 9));
    setShowAllActivities(false);
    setSelectedDomain(focus?.domain ?? null);
  }, [activeChild.id, activeChild.ageMonths, focus?.ageMonth, focus?.domain, focus?.skill]);

  useEffect(() => {
    setCompletedIds(readCompletedActivities(activeChild.id, selectedAgeMonth));
  }, [activeChild.id, selectedAgeMonth]);

  // Dynamically generate age-customized activities using the master ECD dataset
  const dynamicActivities = useMemo(() => {
    const monthData = getMonthMilestones(selectedAgeMonth);
    return monthData.milestones.map((ms, idx) => {
      // Clean domain name
      let domainNameBn = 'বুদ্ধি ও অন্বেষণ';
      if (ms.domain === 'gross_motor') domainNameBn = 'শারীরিক চলন';
      if (ms.domain === 'fine_motor') domainNameBn = 'হাতের সূক্ষ্ম কাজ';
      if (ms.domain === 'communication') domainNameBn = 'কথা ও ভাষা';
      if (ms.domain === 'social_emotional') domainNameBn = 'মেলামেশা ও আবেগ';
      if (ms.domain === 'self_help') domainNameBn = 'নিজের যত্ন';

      const durationMinutes = idx % 2 === 0 ? 5 : 10;
      
      // Strip any English in brackets from the milestone title
      const cleanMilestoneTitle = stripBrackets(ms.titleBn)
        .replace(/-এর\s*মজার\s*খেলা/g, '')
        .trim();

      // Simple main play title without brackets or bulky fluff
      const simpleTitleBn = `${cleanMilestoneTitle} খেলা`;

      // Clean instructions
      const cleanIntervention = stripBrackets(ms.homePlayInterventionBn || ms.questionBn || '');

      return {
        id: `custom_act_${selectedAgeMonth}_${ms.id}`,
        domain: ms.domain,
        titleBn: simpleTitleBn,
        titleEn: `Play: ${cleanMilestoneTitle}`,
        domainBn: domainNameBn,
        durationMinutes,
        objectiveBn: cleanIntervention,
        objectiveEn: cleanIntervention,
        milestoneMappedBn: cleanMilestoneTitle,
        materialsBn: ['ঘরের সাধারণ তোয়ালে বা রুমাল', 'প্লাস্টিকের নিরাপদ বাটি বা কাপ'],
        materialsEn: ['Soft cloth/napkin', 'Safe cups or bowls'],
        stepsBn: [
          'শান্ত ও নিরাপদ জায়গায় সন্তানকে নিয়ে হাসিমুখে বসুন।',
          cleanIntervention,
          'সন্তান চেষ্টা করলে হাততালি দিয়ে সাবাশ বলুন এবং জড়িয়ে ধরুন।',
        ],
        stepsEn: [
          'Sit comfortably with your child in a safe, soft area.',
          cleanIntervention,
          'Praise attempts with gentle smiles, claps, and warm hugs.',
        ],
      };
    });
  }, [selectedAgeMonth]);

  const assessmentRecommendations = useMemo(() => {
    let assessedMonth: number | null = null;
    let savedAnswers: ECDAnswers = {};
    for (const month of [...childAssessmentMonths].reverse().filter((candidate) => candidate <= selectedAgeMonth)) {
      try {
        const serialized = localStorage.getItem(`kuchu_ecd_${activeChild.id}_child_${month}`);
        const parsed = serialized ? JSON.parse(serialized) as ECDAnswers : {};
        if (Object.keys(parsed).length) {
          assessedMonth = month;
          savedAnswers = parsed;
          break;
        }
      } catch {
        // Try the preceding milestone if this saved record is malformed.
      }
    }
    if (assessedMonth === null) return { hasAssessment: false, activities: [] as typeof dynamicActivities };

    // Use the same answered question IDs saved for the selected assessment report,
    // including earlier skills that were brought forward for another check.
    const questions = questionBank.filter((question) => question.phase === 'child' && savedAnswers[question.id] !== undefined);
    const result = calculateECDResult(questions, savedAnswers, 'child');
    const followUps = result.domains.flatMap((domain) => domain.followUpSkills.map((skill) => ({ domain: domain.key as ECD6Domain, skill })));
    if (!followUps.length) return { hasAssessment: true, activities: [] as typeof dynamicActivities };

    const rankedActivities = dynamicActivities
      .map((activity) => {
        const searchableText = `${activity.milestoneMappedBn} ${activity.objectiveBn}`.normalize('NFC');
        const matchScore = followUps.reduce((score, followUp) => {
          if (activity.domain !== followUp.domain) return score;
          return score + countSkillWordMatches(followUp.skill, searchableText);
        }, 0);
        return { activity, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    const relevantActivities = rankedActivities.filter(({ matchScore }) => matchScore > 0).map(({ activity }) => activity);
    if (relevantActivities.length) return { hasAssessment: true, activities: relevantActivities };
    const recommendedDomains = new Set(followUps.map(({ domain }) => domain));
    return { hasAssessment: true, activities: dynamicActivities.filter((activity) => recommendedDomains.has(activity.domain)) };
  }, [activeChild.id, dynamicActivities, selectedAgeMonth]);

  const assessmentCompletedActivityIds = useMemo(() => {
    const latestAnswers: Record<string, { answer: number; month: number }> = {};
    for (const month of childAssessmentMonths.filter((candidate) => candidate <= selectedAgeMonth)) {
      try {
        const serialized = localStorage.getItem(`kuchu_ecd_${activeChild.id}_child_${month}`);
        if (!serialized) continue;
        const answers = JSON.parse(serialized) as ECDAnswers;
        Object.entries(answers).forEach(([questionId, answer]) => {
          latestAnswers[questionId] = { answer, month };
        });
      } catch {
        // Keep valid answers from other milestones.
      }
    }

    const assessedQuestions = questionBank.filter((question) => question.phase === 'child' && question.month <= selectedAgeMonth);
    const completed = new Set<string>();
    dynamicActivities.forEach((activity) => {
      const candidates = assessedQuestions
        .filter((question) => assessmentDomainToPlay[question.domainSource] === activity.domain)
        .map((question) => {
          const answered = latestAnswers[question.id];
          return {
            question,
            answered,
            score: countSkillWordMatches(question.coreSkillBn, activity.milestoneMappedBn),
          };
        })
        .filter(({ answered, score }) => answered !== undefined && score > 0)
        .sort((a, b) => (b.score - a.score) || (b.answered!.month - a.answered!.month));
      const best = candidates[0];
      if (best?.answered && best.question.options[best.answered.answer]?.weight === 2) {
        completed.add(activity.id);
      }
    });
    return completed;
  }, [activeChild.id, dynamicActivities, selectedAgeMonth]);

  const focusedActivities = useMemo(() => {
    if (!focus) return assessmentRecommendations.activities;
    const ranked = dynamicActivities
      .filter((activity) => activity.domain === focus.domain)
      .map((activity) => ({ activity, score: countSkillWordMatches(focus.skill, `${activity.milestoneMappedBn} ${activity.objectiveBn}`) }))
      .sort((a, b) => b.score - a.score);
    const matching = ranked.filter(({ score }) => score > 0);
    return (matching.length ? matching : ranked).map(({ activity }) => activity);
  }, [assessmentRecommendations.activities, dynamicActivities, focus]);

  const hasPersonalizedSuggestions = Boolean(focus) || assessmentRecommendations.hasAssessment;
  const domainActivities = selectedDomain ? dynamicActivities.filter((activity) => activity.domain === selectedDomain) : [];
  const recommendedDomainActivities = selectedDomain
    ? [...new Map([
        ...focusedActivities.filter((activity) => activity.domain === selectedDomain),
        ...domainActivities.filter((activity) => assessmentCompletedActivityIds.has(activity.id) || completedIds[activity.id]),
      ].map((activity) => [activity.id, activity])).values()]
    : [];
  const displayedActivities = selectedDomain
    ? showAllActivities || !hasPersonalizedSuggestions ? domainActivities : recommendedDomainActivities
    : [];
  const domainProgress = playDomains.map((domain) => {
    const activities = dynamicActivities.filter((activity) => activity.domain === domain);
    const completed = activities.filter((activity) => assessmentCompletedActivityIds.has(activity.id) || completedIds[activity.id]).length;
    return { domain, activities, completed, total: activities.length, percentage: activities.length ? Math.round((completed / activities.length) * 100) : 0 };
  });

  const toggleComplete = (id: string) => {
    if (assessmentCompletedActivityIds.has(id)) return;
    setCompletedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(activityCompletionKey(activeChild.id, selectedAgeMonth), JSON.stringify(next));
      } catch {
        // Preserve the in-session completion state if storage is unavailable.
      }
      return next;
    });
    if (onToggleComplete) onToggleComplete(id);
  };

  const openActivityModal = (act: any) => {
    setActiveModalActivity(act);
    setTimerSecondsLeft(act.durationMinutes * 60);
    setTimerRunning(false);
  };

  const closeActivityModal = () => {
    setActiveModalActivity(null);
    setTimerRunning(false);
  };

  const handleStartTimer = () => {
    if (timerSecondsLeft === 0 && activeModalActivity) {
      setTimerSecondsLeft(activeModalActivity.durationMinutes * 60);
    }
    setTimerRunning(true);
  };

  const handlePauseTimer = () => setTimerRunning(false);

  const handleResetTimer = () => {
    setTimerRunning(false);
    if (activeModalActivity) {
      setTimerSecondsLeft(activeModalActivity.durationMinutes * 60);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return formatLocalizedNumber(formatted, currentLang);
  };

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;

  return (
    <section id="daily-play" className="space-y-6">

      {focus && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#CDE5D1] bg-[#F2FAF3] p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#4E7657]">{currentLang === 'bn' ? 'চলুন, এই দক্ষতার খেলা শুরু করি' : 'Let’s play to build this skill'}</p>
            <p className="mt-1 text-sm font-extrabold text-[#2D4935]">{focus.skill}</p>
            <p className="mt-1 text-xs text-[#66816D]">{currentLang === 'bn' ? `${formatLocalizedNumber(selectedAgeMonth, currentLang)} মাস বয়সের উপযোগী` : `Age-appropriate for ${selectedAgeMonth} months`}</p>
          </div>
        </div>
      )}
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F3E7DC] pb-4">
        <div>
          <div className="text-xs font-bold text-[#C85D26] tracking-wider uppercase flex items-center gap-1.5">
            <Baby className="w-4 h-4" />
            <span>{currentLang === 'bn' ? `${childName}-এর বয়সের উপযোগী খেলা` : `Age-Tailored Play for ${childName}`}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2D3142] tracking-tight mt-1">
            {t.dailyPlayTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6479] mt-0.5 max-w-2xl">
            {currentLang === 'bn' 
              ? 'প্রতিটি খেলার বিস্তারিত নিয়ম জানতে "বিস্তারিত গাইড"-এ চাপুন।' 
              : 'Tap "Play Guide" on any game to see complete instructions and timer.'}
          </p>
        </div>

        {/* Age Checkpoint Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[...new Set([...(focus ? [focus.ageMonth] : []), 2, 4, 6, 9, 12, 18, 24])].sort((a, b) => a - b).map((m) => {
            const isSelected = selectedAgeMonth === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setSelectedAgeMonth(m);
                  setShowAllActivities(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#FF8552] text-white border-[#FF8552] shadow-xs'
                    : 'bg-white text-[#64748B] border-[#EED9C7] hover:border-[#FFB07C]'
                }`}
              >
                {formatLocalizedNumber(m, currentLang)} {t.monthUnit}{focus?.ageMonth === m ? (currentLang === 'bn' ? ' · বর্তমান' : ' · current') : ''}
              </button>
            );
          })}
        </div>
      </div>

      {!selectedDomain && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domainProgress.map(({ domain, activities, completed, total, percentage }) => (
            <button
              key={domain}
              type="button"
              onClick={() => {
                setSelectedDomain(domain);
                setShowAllActivities(false);
              }}
              className="group flex min-h-40 items-center justify-between gap-5 rounded-3xl border-2 border-[#EED9C7] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#C85D26] hover:bg-[#C85D26] hover:shadow-md active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30 sm:min-h-48 sm:p-7"
            >
              <span className="min-w-0">
                <span className="block text-lg font-bold leading-snug text-[#2D3142] transition-colors group-hover:text-white sm:text-xl">{currentLang === 'bn' ? domainMeta[domain].labelBn : domainMeta[domain].labelEn}</span>
                <span className="mt-2 block text-sm text-[#667085] transition-colors group-hover:text-white/90">
                  {formatLocalizedNumber(completed, currentLang)} / {formatLocalizedNumber(total, currentLang)} {currentLang === 'bn' ? 'টি খেলা সম্পন্ন' : 'activities complete'}
                </span>
                <span className="mt-2 block text-xs font-semibold text-[#C85D26] transition-colors group-hover:text-white">{currentLang === 'bn' ? 'খেলা দেখতে চাপুন' : 'Open activities'}</span>
              </span>
              <span
                className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24"
                style={{ background: `conic-gradient(#2F6B47 ${percentage * 3.6}deg, #E8E2DA 0deg)` }}
                aria-label={`${percentage}%`}
              >
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/40 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex h-[66px] w-[66px] items-center justify-center rounded-full bg-white text-base font-extrabold text-[#2F6B47] transition-colors group-hover:bg-[#A9471C] group-hover:text-white sm:h-[78px] sm:w-[78px] sm:text-lg">
                  {formatLocalizedNumber(percentage, currentLang)}%
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedDomain && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EED9C7] bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSelectedDomain(null)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#5C6479] hover:bg-[#F8F7F5]">
              <ArrowLeft className="h-4 w-4" /> {currentLang === 'bn' ? 'সব ক্ষেত্র' : 'All areas'}
            </button>
            <span className="font-bold text-[#2D3142]">{currentLang === 'bn' ? domainMeta[selectedDomain].labelBn : domainMeta[selectedDomain].labelEn}</span>
            <span className="text-xs text-[#667085]">{formatLocalizedNumber(domainProgress.find((item) => item.domain === selectedDomain)?.completed ?? 0, currentLang)} / {formatLocalizedNumber(domainActivities.length, currentLang)} {currentLang === 'bn' ? 'সম্পন্ন' : 'complete'}</span>
          </div>
          {hasPersonalizedSuggestions && (
            <button
              type="button"
              aria-expanded={showAllActivities}
              onClick={() => setShowAllActivities((showAll) => !showAll)}
              className="rounded-lg border border-[#EED9C7] bg-[#FFFAF5] px-3 py-2 text-xs font-bold text-[#5C6479] hover:bg-[#FFF0E2]"
            >
              {showAllActivities
                ? (currentLang === 'bn' ? 'শুধু পরামর্শের খেলাগুলো দেখুন' : 'Show recommended games only')
                : (currentLang === 'bn' ? 'এই ক্ষেত্রের বাকি খেলাগুলো দেখুন' : 'Show all games in this area')}
            </button>
          )}
        </div>
      )}

      {selectedDomain && hasPersonalizedSuggestions && (
        <div className="flex flex-col gap-2 rounded-xl border border-[#EED9C7] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#667085]">
            {focus
              ? (currentLang === 'bn' ? `“${focus.skill}” চর্চার সঙ্গে মেলে এমন ${formatLocalizedNumber(recommendedDomainActivities.length, currentLang)}টি খেলা` : `${recommendedDomainActivities.length} play ideas matched to “${focus.skill}”`)
              : recommendedDomainActivities.length
                ? (currentLang === 'bn' ? `অগ্রগতি মূল্যায়নে চর্চার জন্য বাছাই করা ${formatLocalizedNumber(recommendedDomainActivities.length, currentLang)}টি খেলা` : `${recommendedDomainActivities.length} activities selected from the assessment`)
                : (currentLang === 'bn' ? 'এই বয়সে আলাদা করে চর্চার খেলা পাওয়া যায়নি।' : 'No extra practice games were identified for this age.')}
          </p>
        </div>
      )}

      {/* Activities Grid - Compact, neat rectangular boxes with opposite contrast colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedActivities.map((activity, idx) => {
          const isDone = Boolean(completedIds[activity.id] || assessmentCompletedActivityIds.has(activity.id));
          const theme = cardThemes[idx % cardThemes.length];

          return (
            <div
              key={activity.id}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm ${
                isDone
                  ? 'border-[#1F5A3B] bg-[#1F5A3B] text-white ring-2 ring-[#1F5A3B]/15'
                  : `${theme.cardBg} ${theme.cardBorder} ${theme.borderHover}`
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Bar: Inverted Contrast Domain Badge + Duration */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${isDone ? 'bg-white/15 text-white' : `${theme.tagBg} ${theme.tagText}`} shadow-2xs`}>
                    {activity.domainBn}
                  </span>
                  
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${isDone ? 'text-white/85' : 'text-[#5C6479]'}`}>
                    <Clock className={`w-3 h-3 ${isDone ? 'text-white' : 'text-[#FF8552]'}`} />
                    {formatLocalizedNumber(activity.durationMinutes, currentLang)} {t.minutes}
                  </span>
                </div>

                {/* Clean, Simple Main Title (English brackets stripped) */}
                <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isDone ? 'text-white' : 'text-[#2D3142]'}`}>
                  {activity.titleBn}
                </h3>
              </div>

              {/* Bottom Card Actions: 'বিস্তারিত গাইড' & Complete Checkbox */}
              <div className={`mt-4 pt-2.5 border-t flex items-center justify-between gap-2 ${isDone ? 'border-white/20' : 'border-[#000000]/8'}`}>
                <button
                  type="button"
                  onClick={() => openActivityModal(activity)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${isDone ? 'bg-white/15 text-white hover:bg-white/25' : theme.guideBtn}`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{currentLang === 'bn' ? 'বিস্তারিত গাইড' : 'Play Guide'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleComplete(activity.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isDone
                      ? 'h-8 w-8 justify-center rounded-full bg-white text-[#1F5A3B]'
                      : theme.doneBtnUnchecked
                  }`}
                  aria-label={isDone ? (currentLang === 'bn' ? 'খেলা সম্পন্ন' : 'Game complete') : t.markDone}
                >
                  {isDone ? <Check className="h-5 w-5" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#8C93A4]" />}
                  {!isDone && <span>{t.markDone}</span>}
                </button>
              </div>

            </div>
          );
        })}
      </div>
      {selectedDomain && hasPersonalizedSuggestions && !showAllActivities && displayedActivities.length === 0 && (
        <p className="rounded-2xl border border-[#E8EEEB] bg-white p-5 text-sm text-[#697582]">
          {currentLang === 'bn' ? 'এই বয়সে assessment অনুযায়ী আলাদা করে চর্চার খেলা পাওয়া যায়নি। চাইলে বাকি বয়সোপযোগী খেলাগুলো দেখুন।' : 'No additional practice games were matched to this assessment at this age. You can browse all age-appropriate games.'}
        </p>
      )}

      {/* Activity Details & Interactive Play Guide Modal ("কীভাবে খেলবেন" and complete instructions) */}
      {activeModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3142]/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#EED9C7] shadow-2xl p-6 sm:p-8 my-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#F3E7DC] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#C85D26]">
                  <span className="bg-[#FFF0E2] px-2 py-0.5 rounded-md font-bold">{activeModalActivity.domainBn}</span>
                  <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
                  <span className="text-[#5C6479]">
                    {formatLocalizedNumber(activeModalActivity.durationMinutes, currentLang)} {t.minutes}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#2D3142] mt-1.5">
                  {activeModalActivity.titleBn}
                </h3>
              </div>
              <button
                onClick={closeActivityModal}
                className="p-1.5 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294] transition-colors"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Play Timer Widget */}
            <div className="bg-[#FFFAF5] rounded-2xl p-4 border border-[#F0D5C1] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EED9C7] flex items-center justify-center text-[#C85D26] shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7C8294]">{t.playTimer}</div>
                  <div className="text-xl font-bold text-[#2D3142] tabular-nums font-mono">
                    {formatTime(timerSecondsLeft)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!timerRunning ? (
                  <button
                    onClick={handleStartTimer}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF8552] text-white rounded-xl text-xs font-bold hover:bg-[#E67332] shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{timerSecondsLeft === activeModalActivity.durationMinutes * 60 ? t.playTimer : 'চালান'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFF0E2] text-[#C85D26] rounded-xl text-xs font-bold hover:bg-[#FFE4D3] transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>বিরতি</span>
                  </button>
                )}
                <button
                  onClick={handleResetTimer}
                  className="p-2 bg-white border border-[#EED9C7] text-[#64748B] hover:text-[#2D3142] rounded-xl text-xs transition-colors"
                  title={t.resetTimer}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* How to Play Section - "কীভাবে খেলবেন" Full Detailed Guide */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#2D3142] uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#FF8552]" />
                <span>{currentLang === 'bn' ? 'কীভাবে খেলবেন (ধাপে ধাপে):' : 'Step-by-step Play Guide:'}</span>
              </div>
              <ol className="space-y-2.5">
                {activeModalActivity.stepsBn.map((step: string, sIdx: number) => (
                  <li key={sIdx} className="flex items-start gap-2.5 text-xs text-[#4B5563] bg-[#FAF4ED] p-2.5 rounded-xl border border-[#F0D5C1]">
                    <span className="w-5 h-5 rounded-full bg-[#FF8552] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums shadow-2xs">
                      {formatLocalizedNumber(sIdx + 1, currentLang)}
                    </span>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Things Needed */}
            <div className="bg-[#FAF4ED] p-3.5 rounded-xl border border-[#F0D5C1] space-y-1.5">
              <div className="text-xs font-bold text-[#8C6D53] uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF8552]" />
                <span>{t.thingsNeeded}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#5C6479]">
                {activeModalActivity.materialsBn.map((mat: string, mIdx: number) => (
                  <li key={mIdx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8552]" />
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pediatrician Tip */}
            <div className="bg-[#EAF4EC] p-3 rounded-xl border border-[#CDE5D1] text-xs text-[#2F6B47] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2F6B47]" />
              <p>
                {currentLang === 'bn'
                  ? 'খেলার সময় কোনো জোর করবেন না। সন্তান ক্লান্ত বা অস্বস্তি বোধ করলে বিরতি দিন এবং হাসিমুখে আদর করুন।'
                  : 'Never force activities. Follow baby’s cues and pause if they are tired.'}
              </p>
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-3 border-t border-[#F3E7DC] flex items-center justify-between gap-4">
              <button
                onClick={closeActivityModal}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#2D3142] transition-colors"
              >
                {t.close}
              </button>

              <button
                onClick={() => {
                  toggleComplete(activeModalActivity.id);
                  closeActivityModal();
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                  completedIds[activeModalActivity.id]
                    ? 'bg-[#EAF4EC] text-[#2F6B47] hover:bg-[#D6EBD9]'
                    : 'bg-[#FF8552] text-white hover:bg-[#E67332]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{completedIds[activeModalActivity.id] ? t.playDoneCheer : t.markDone}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
