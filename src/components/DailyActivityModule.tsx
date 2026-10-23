import React, { useState, useMemo } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  RotateCcw, 
  Pause, 
  ChevronRight, 
  X,
  Baby,
  Sparkles,
  Info
} from 'lucide-react';
import { Activity, ChildProfile, Language } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';
import { getMonthMilestones } from '../data/ecdDataset';

interface DailyActivityModuleProps {
  currentLang: Language;
  activeChild: ChildProfile;
  activities?: Activity[];
  onToggleComplete?: (id: string) => void;
}

// 6 Distinctive Opposite-Contrast Color Palettes for Cards
const cardThemes = [
  {
    cardBg: 'bg-[#FFF9F5]',
    cardBorder: 'border-[#F8D2BD]',
    borderHover: 'hover:border-[#FF8552]',
    tagBg: 'bg-[#2D3142]',
    tagText: 'text-[#FFF0E2]',
    accentText: 'text-[#C85D26]',
    doneBg: 'bg-[#FF8552]',
    guideBtn: 'text-[#C85D26] hover:text-[#9A3412] bg-[#FFEBDD]',
    doneBtnUnchecked: 'bg-white border-[#F8D2BD] text-[#2D3142] hover:bg-[#FFEBDD]',
  },
  {
    cardBg: 'bg-[#F2FBF5]',
    cardBorder: 'border-[#BEE6CB]',
    borderHover: 'hover:border-[#2F6B47]',
    tagBg: 'bg-[#194D33]',
    tagText: 'text-[#DCFCE7]',
    accentText: 'text-[#1E432D]',
    doneBg: 'bg-[#2F6B47]',
    guideBtn: 'text-[#1E432D] hover:text-[#0F291B] bg-[#DCF5E3]',
    doneBtnUnchecked: 'bg-white border-[#BEE6CB] text-[#1E432D] hover:bg-[#DCF5E3]',
  },
  {
    cardBg: 'bg-[#F7F6FF]',
    cardBorder: 'border-[#D9D3F8]',
    borderHover: 'hover:border-[#6366F1]',
    tagBg: 'bg-[#312E81]',
    tagText: 'text-[#EEF2FF]',
    accentText: 'text-[#4338CA]',
    doneBg: 'bg-[#4F46E5]',
    guideBtn: 'text-[#4338CA] hover:text-[#312E81] bg-[#EDE9FE]',
    doneBtnUnchecked: 'bg-white border-[#D9D3F8] text-[#312E81] hover:bg-[#EDE9FE]',
  },
  {
    cardBg: 'bg-[#FFFDF0]',
    cardBorder: 'border-[#F6E6A8]',
    borderHover: 'hover:border-[#D97706]',
    tagBg: 'bg-[#78350F]',
    tagText: 'text-[#FEF3C7]',
    accentText: 'text-[#92400E]',
    doneBg: 'bg-[#D97706]',
    guideBtn: 'text-[#92400E] hover:text-[#78350F] bg-[#FEF3C7]',
    doneBtnUnchecked: 'bg-white border-[#F6E6A8] text-[#78350F] hover:bg-[#FEF3C7]',
  },
  {
    cardBg: 'bg-[#F0FDFB]',
    cardBorder: 'border-[#B4EBE2]',
    borderHover: 'hover:border-[#0D9488]',
    tagBg: 'bg-[#134E4A]',
    tagText: 'text-[#CCFBF1]',
    accentText: 'text-[#115E59]',
    doneBg: 'bg-[#0D9488]',
    guideBtn: 'text-[#115E59] hover:text-[#134E4A] bg-[#CCFBF1]',
    doneBtnUnchecked: 'bg-white border-[#B4EBE2] text-[#134E4A] hover:bg-[#CCFBF1]',
  },
  {
    cardBg: 'bg-[#FFF5F7]',
    cardBorder: 'border-[#F8CAD3]',
    borderHover: 'hover:border-[#E11D48]',
    tagBg: 'bg-[#881337]',
    tagText: 'text-[#FFE4E6]',
    accentText: 'text-[#9F1239]',
    doneBg: 'bg-[#E11D48]',
    guideBtn: 'text-[#9F1239] hover:text-[#881337] bg-[#FFE4E6]',
    doneBtnUnchecked: 'bg-white border-[#F8CAD3] text-[#881337] hover:bg-[#FFE4E6]',
  },
];

// Helper to strip all English brackets from text (e.g., "(Peek-a-boo)" or "(Runs Well)")
function stripBrackets(str: string): string {
  if (!str) return '';
  return str.replace(/\s*\([A-Za-z0-9\s/,-]+\)/g, '').trim();
}

export const DailyActivityModule: React.FC<DailyActivityModuleProps> = ({
  currentLang,
  activeChild,
  onToggleComplete,
}) => {
  const t = translations[currentLang];
  const [selectedAgeMonth, setSelectedAgeMonth] = useState<number>(activeChild.ageMonths || 9);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [activeModalActivity, setActiveModalActivity] = useState<any | null>(null);

  // Interactive Timer state inside activity modal
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

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

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
          {[2, 4, 6, 9, 12, 18, 24].map((m) => {
            const isSelected = selectedAgeMonth === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedAgeMonth(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#FF8552] text-white border-[#FF8552] shadow-xs'
                    : 'bg-white text-[#64748B] border-[#EED9C7] hover:border-[#FFB07C]'
                }`}
              >
                {formatLocalizedNumber(m, currentLang)} {t.monthUnit}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities Grid - Compact, neat rectangular boxes with opposite contrast colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {dynamicActivities.map((activity, idx) => {
          const isDone = Boolean(completedIds[activity.id]);
          const theme = cardThemes[idx % cardThemes.length];

          return (
            <div
              key={activity.id}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm ${theme.cardBg} ${theme.cardBorder} ${theme.borderHover} ${
                isDone ? 'ring-2 ring-[#2F6B47]/20 opacity-90' : ''
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Bar: Inverted Contrast Domain Badge + Duration */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${theme.tagBg} ${theme.tagText} shadow-2xs`}>
                    {activity.domainBn}
                  </span>
                  
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5C6479]">
                    <Clock className="w-3 h-3 text-[#FF8552]" />
                    {formatLocalizedNumber(activity.durationMinutes, currentLang)} {t.minutes}
                  </span>
                </div>

                {/* Clean, Simple Main Title (English brackets stripped) */}
                <h3 className="text-sm font-bold text-[#2D3142] leading-snug line-clamp-2">
                  {activity.titleBn}
                </h3>
              </div>

              {/* Bottom Card Actions: 'বিস্তারিত গাইড' & Complete Checkbox */}
              <div className="mt-4 pt-2.5 border-t border-[#000000]/8 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openActivityModal(activity)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${theme.guideBtn}`}
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
                      ? 'bg-[#EAF4EC] text-[#2F6B47] border border-[#CDE5D1]'
                      : theme.doneBtnUnchecked
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-[#2F6B47]' : 'text-[#8C93A4]'}`} />
                  <span>{isDone ? t.playDoneCheer : t.markDone}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

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
