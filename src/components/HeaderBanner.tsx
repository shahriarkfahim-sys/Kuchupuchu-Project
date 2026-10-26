import React, { useState } from 'react';
import { Heart, Sparkles, Smile, PenTool, CheckCircle2, CloudSun, Users, Copy, Check, Crown } from 'lucide-react';
import { ChildProfile, Language, MoodConfig, UserSubscription } from '../types';
import { moodOptions } from '../data/mockData';
import { translations, formatLocalizedNumber } from '../i18n/translations';

interface HeaderBannerProps {
  currentLang: Language;
  activeChild: ChildProfile;
  completedActivitiesCount: number;
  totalActivitiesCount: number;
  achievedMilestonesCount: number;
  totalMilestonesCount: number;
  onNavigateToTracker: () => void;
  onNavigateToPlay: () => void;
  onNavigateToDiary: () => void;
  onSelectMood: (mood: 'happy' | 'fussy' | 'sleepy' | 'active') => void;
  onOpenWeatherModal: () => void;
  onOpenPartnerModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  subscription?: UserSubscription;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  currentLang,
  activeChild,
  completedActivitiesCount,
  totalActivitiesCount,
  achievedMilestonesCount,
  totalMilestonesCount,
  onNavigateToTracker,
  onNavigateToPlay,
  onNavigateToDiary,
  onSelectMood,
  onOpenWeatherModal,
  onOpenPartnerModal,
  onOpenSubscriptionModal,
  subscription,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const t = translations[currentLang];
  
  // Greeting by hour
  const hour = new Date().getHours();
  let greeting = t.dashboardGreeting;
  if (hour >= 12 && hour < 17) greeting = currentLang === 'bn' ? 'শুভ দুপুর' : 'Good afternoon';
  if (hour >= 17) greeting = currentLang === 'bn' ? 'শুভ সন্ধ্যা' : 'Good evening';

  const motherName = currentLang === 'bn' ? activeChild.motherNameBn : activeChild.motherNameEn;
  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;
  const currentMood = activeChild.todayMood || 'happy';

  const activityPercent = Math.round((completedActivitiesCount / Math.max(1, totalActivitiesCount)) * 100);
  const milestonePercent = Math.round((achievedMilestonesCount / Math.max(1, totalMilestonesCount)) * 100);

  const handleCopyPartnerCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeChild.partnerCode) {
      navigator.clipboard?.writeText(activeChild.partnerCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* Top Split: Parent Greeting & Quantitative Progress */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8C6D53]">
            <Heart className="w-3.5 h-3.5 text-[#FF8552] fill-[#FF8552]" />
            <span>{greeting}, {motherName} আপু!</span>
            <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
            <span className="text-[#2D3142]">{t.todayStatus}</span>

            {/* Weather advisory badge */}
            <button
              onClick={onOpenWeatherModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF0E2] text-[#C85D26] hover:bg-[#FFE4D3] transition-colors border border-[#F0D5C1] text-xs font-bold"
              title={currentLang === 'bn' ? 'আজকের আবহাওয়া ও যত্ন দেখতে ক্লিক করুন' : 'View daily weather advisory'}
            >
              <CloudSun className="w-3.5 h-3.5 text-[#FF8552]" />
              <span>{currentLang === 'bn' ? 'ঢাকা ২৯°C · আবহাওয়া ও যত্ন' : 'Dhaka 29°C · Weather Care'}</span>
            </button>

            {/* Subscription / Trial status badge */}
            {onOpenSubscriptionModal && (
              <button
                onClick={onOpenSubscriptionModal}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shadow-2xs ml-auto sm:ml-0 cursor-pointer ${
                  subscription?.status === 'active'
                    ? 'bg-[#EAF4EC] text-[#2F6B47] border-[#C5E5CE] hover:bg-[#DCEDE0]'
                    : 'bg-[#FFF0F6] text-[#E2136E] border-[#F8BBD0] hover:bg-[#FCE4EC]'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>
                  {subscription?.status === 'active'
                    ? (currentLang === 'bn' ? 'প্রিমিয়াম সক্রিয় (bKash)' : 'Premium Active (bKash)')
                    : (currentLang === 'bn' ? '৩০ দিন ফ্রি ট্রায়াল (আপগ্রেড)' : '30 Days Free (Upgrade)')}
                </span>
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D3142]">
            {currentLang === 'bn' ? (
              <>
                <span className="text-[#C85D26]">{childName}</span> আজ কেমন আছে?
              </>
            ) : (
              <>
                How is <span className="text-[#C85D26]">{childName}</span> feeling today?
              </>
            )}
          </h1>

          {/* Age and Growth Highlights + Partner Code */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs sm:text-sm text-[#5C6479]">
            <span className="font-bold text-[#2D3142]">
              {t.ageLabel}: {formatLocalizedNumber(activeChild.ageMonths, currentLang)} {t.months} {formatLocalizedNumber(activeChild.ageDays, currentLang)} {t.days}
            </span>
            <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
            <span className="text-[#2F6B47] font-semibold">
              {currentLang === 'bn' ? 'ওজন: ' : 'Weight: '}
              {formatLocalizedNumber(activeChild.currentWeightKg, currentLang)} কেজি
            </span>
            <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
            <span className="text-[#C85D26] font-semibold">
              {currentLang === 'bn' ? 'উচ্চতা: ' : 'Height: '}
              {formatLocalizedNumber(activeChild.currentHeightCm, currentLang)} সেমি
            </span>

            {/* Partner Code Badge */}
            {activeChild.partnerCode && (
              <button
                onClick={handleCopyPartnerCode}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EAF4EC] text-[#2F6B47] text-xs font-bold border border-[#CDE5D1] hover:bg-[#DDF0E0] transition-colors"
                title="Click to copy partner link code"
              >
                <Users className="w-3 h-3 text-[#2F6B47]" />
                <span>
                  {currentLang === 'bn' ? `পার্টনার কোড: ${activeChild.partnerCode}` : `Partner Code: ${activeChild.partnerCode}`}
                </span>
                {copiedCode ? <Check className="w-3 h-3 text-[#2F6B47]" /> : <Copy className="w-3 h-3 text-[#2F6B47] opacity-60" />}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Progress Meters with Elegant Circular Pie Charts */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-72 shrink-0">
          
          {/* Daily Play Target */}
          <div 
            onClick={onNavigateToPlay}
            className="cursor-pointer bg-[#FFFAF5] hover:bg-[#FFF5EB] transition-colors rounded-2xl p-3 sm:p-3.5 border border-[#F0D5C1] flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#7C8294] font-medium">{t.todayActivitiesSummary}</div>
              <div className="text-sm sm:text-base font-bold text-[#2D3142] tabular-nums mt-0.5 truncate">
                {formatLocalizedNumber(completedActivitiesCount, currentLang)} / {formatLocalizedNumber(totalActivitiesCount, currentLang)} {t.doneCount}
              </div>
            </div>
            
            {/* Circular Pie Chart */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-[#F0D5C1]"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-[#FF8552] transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - activityPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#C85D26] tabular-nums">
                {formatLocalizedNumber(activityPercent, currentLang)}%
              </div>
            </div>
          </div>

          {/* Milestone Target */}
          <div 
            onClick={onNavigateToTracker}
            className="cursor-pointer bg-[#EAF4EC]/70 hover:bg-[#E2F0E5] transition-colors rounded-2xl p-3 sm:p-3.5 border border-[#CDE5D1] flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#2F6B47] font-medium truncate">
                {currentLang === 'bn' 
                  ? `${formatLocalizedNumber(activeChild.ageMonths, currentLang)} মাসের মূল দক্ষতা` 
                  : `${activeChild.ageMonths}-Month Milestones`}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#1E432D] tabular-nums mt-0.5 truncate">
                {formatLocalizedNumber(achievedMilestonesCount, currentLang)} / {formatLocalizedNumber(totalMilestonesCount, currentLang)} {t.milestoneCount}
              </div>
            </div>
            
            {/* Circular Pie Chart */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-[#C7DFCC]"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-[#2F6B47] transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - milestonePercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#1E432D] tabular-nums">
                {formatLocalizedNumber(milestonePercent, currentLang)}%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Bar: Interactive Mood Selector & Direct Input Trigger */}
      <div className="pt-4 border-t border-[#F3E7DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Mood Selector Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-[#8C6D53] shrink-0">
            {t.moodQuestion}
          </span>
          {moodOptions.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMood(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 border ${
                currentMood === m.id
                  ? 'bg-[#FFF0E2] border-[#FF8552] text-[#C85D26] font-bold shadow-xs'
                  : 'bg-[#FFFAF5] border-[#EED9C7] text-[#5C6479] hover:border-[#FFB07C]'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{currentLang === 'bn' ? m.labelBn : m.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Quick Log Input CTA */}
        <button
          onClick={onNavigateToDiary}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF4ED] hover:bg-[#F3E7DC] text-[#8C6D53] border border-[#EED9C7] font-semibold rounded-xl text-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <PenTool className="w-3.5 h-3.5 text-[#FF8552]" />
          <span>{t.quickLogCta}</span>
        </button>

      </div>

    </div>
  );
};
