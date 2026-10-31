import React from 'react';
import {
  Activity,
  ArrowUpRight,
  Baby,
  BookHeart,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Droplets,
  Gamepad2,
  Heart,
  HeartHandshake,
  House,
  Moon,
  PenLine,
  ShoppingBag,
  Sparkles,
  Syringe,
  Utensils,
  Users,
  Weight,
  Ruler,
} from 'lucide-react';
import { Activity as PlayActivity, ChildProfile, GrowthLogEntry, Language, RoutineLogEntry, UserSubscription } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';
import './ParentDashboard.css';

const journeyItems = [
  { id: 'daily-routine', icon: Activity, bn: 'ট্র্যাকার', en: 'Tracker', noteBn: 'ঘুম, খাবার ও যত্নের হিসাব রাখুন', noteEn: 'Track sleep, feeds, and care' },
  { id: 'ogrogoti-graph', icon: ChartNoAxesColumnIncreasing, bn: 'অগ্রগতি', en: 'Progress', noteBn: 'মাইলস্টোন ও অগ্রগতি দেখুন', noteEn: 'See milestones and progress' },
  { id: 'daily-play', icon: Gamepad2, bn: 'খেলা', en: 'Play', noteBn: 'বয়স অনুযায়ী খেলার আইডিয়া', noteEn: 'Age-based play ideas' },
  { id: 'baby-diary', icon: BookHeart, bn: 'ডায়েরি', en: 'Diary', noteBn: 'বিশেষ মুহূর্তগুলো লিখে রাখুন', noteEn: 'Save the little moments' },
  { id: 'care-connect', icon: HeartHandshake, bn: 'সহায়তা', en: 'Support', noteBn: 'বিশেষজ্ঞ ও সেবা খুঁজুন', noteEn: 'Find services and support' },
  { id: 'forum', icon: Users, bn: 'ফোরাম', en: 'Forum', noteBn: 'অভিজ্ঞতা ভাগ করুন', noteEn: 'Share and learn together' },
  { id: 'ponno', icon: ShoppingBag, bn: 'পণ্য', en: 'Products', noteBn: 'পরিবারের জন্য কেনাকাটা', noteEn: 'Shop for your family' },
];

interface ParentDashboardSidebarProps {
  currentLang: Language;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const ParentDashboardSidebar: React.FC<ParentDashboardSidebarProps> = ({ currentLang, activeTab, onSelectTab }) => {
  const isBangla = currentLang === 'bn';

  return (
    <aside className="w-full shrink-0 py-5 lg:w-[288px] lg:py-8">
      <div className="rounded-3xl border border-[#F0E3D9] bg-white p-4 shadow-[0_8px_24px_rgba(73,58,47,0.05)] lg:sticky lg:top-28 lg:p-5">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left shadow-sm transition-colors ${activeTab === 'dashboard' ? 'border-[#D66A37] bg-[#FFF2E9] text-[#A84D26]' : 'border-[#E8E2DA] bg-white text-[#46534D] hover:bg-[#FAF7F3]'}`}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#D66A37] shadow-sm"><House className="h-5 w-5" /></span>
          <span>
            <span className="block text-sm font-extrabold">{isBangla ? 'আমার ড্যাশবোর্ড' : 'My dashboard'}</span>
            <span className="mt-0.5 block text-xs text-[#89928D]">{isBangla ? 'আপনার আজকের পথচলা' : 'Your day at a glance'}</span>
          </span>
        </button>

        <div className="mt-5 flex items-center justify-between gap-2 px-1">
        </div>

        <nav aria-label={isBangla ? 'মাতৃত্বের যাত্রার ধাপ' : 'Motherhood journey steps'} className="journey-sidebar-nav relative mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
          {journeyItems.map(({ id, icon: Icon, bn, en, noteBn, noteEn }, index) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                aria-current={selected ? 'page' : undefined}
                className={`journey-sidebar-step relative flex min-w-[210px] items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors lg:min-w-0 ${selected ? 'bg-[#FFF2E9] text-[#A84D26]' : 'text-[#59665F] hover:bg-[#FAF7F3]'}`}
              >
                <span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-extrabold ${selected ? 'border-[#E9753F] bg-[#E9753F] text-white' : 'border-[#E8DCD1] bg-white text-[#87918A]'}`}>
                  {selected ? <Icon className="h-4 w-4" /> : formatLocalizedNumber(index + 1, currentLang)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">{isBangla ? bn : en}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#89928D]">{isBangla ? noteBn : noteEn}</span>
                </span>
                <ChevronRight className={`h-4 w-4 shrink-0 ${selected ? 'text-[#D66A37]' : 'text-[#B6BEB9]'}`} />
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

interface ParentDashboardProps {
  currentLang: Language;
  activeChild: ChildProfile;
  activities: PlayActivity[];
  activitiesCount: number;
  completedActivitiesCount: number;
  milestonesCount: number;
  achievedMilestonesCount: number;
  routineLogs: RoutineLogEntry[];
  growthLogs: GrowthLogEntry[];
  onNavigate: (tab: string) => void;
  onSelectMood: (mood: 'happy' | 'fussy' | 'sleepy' | 'active') => void;
  onOpenWeatherModal: () => void;
  onOpenPartnerModal: () => void;
  onOpenSubscriptionModal: () => void;
  subscription: UserSubscription;
}

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLogMinutes = (log: RoutineLogEntry) => {
  if (log.durationMinutes) return log.durationMinutes;
  if (/দেড় ঘণ্টা/.test(log.titleBn)) return 90;
  const title = log.titleBn.replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
  const hours = title.match(/(\d+(?:\.\d+)?)\s*ঘণ্টা/);
  const minutes = title.match(/(\d+)\s*মিনিট/);
  return Math.round((Number(hours?.[1] || 0) * 60) + Number(minutes?.[1] || 0));
};

const getTimeValue = (time: string) => {
  const normalized = time.replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
  const match = normalized.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  let hour = Number(match[1]);
  if (/দুপুর|বিকাল|সন্ধ্যা|রাত/.test(time) && hour < 12) hour += 12;
  return (hour * 60) + Number(match[2]);
};

const formatSleep = (minutes: number, currentLang: Language) => {
  const isBangla = currentLang === 'bn';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours && !remainingMinutes) return isBangla ? 'এখনো লগ নেই' : 'No sleep logged';
  return [
    hours ? `${formatLocalizedNumber(hours, currentLang)} ${isBangla ? 'ঘণ্টা' : 'hr'}` : '',
    remainingMinutes ? `${formatLocalizedNumber(remainingMinutes, currentLang)} ${isBangla ? 'মিনিট' : 'min'}` : '',
  ].filter(Boolean).join(' ');
};

const moodOptions = [
  { id: 'happy' as const, emoji: '😊', bn: 'খুশি', en: 'Happy' },
  { id: 'active' as const, emoji: '🤸', bn: 'চনমনে', en: 'Active' },
  { id: 'sleepy' as const, emoji: '😴', bn: 'ঘুমঘুম', en: 'Sleepy' },
  { id: 'fussy' as const, emoji: '🥺', bn: 'অস্থির', en: 'Fussy' },
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentLang,
  activeChild,
  activities,
  activitiesCount,
  completedActivitiesCount,
  milestonesCount,
  achievedMilestonesCount,
  routineLogs,
  growthLogs,
  onNavigate,
  onSelectMood,
  onOpenWeatherModal,
  onOpenPartnerModal,
  onOpenSubscriptionModal,
  subscription,
}) => {
  const isBangla = currentLang === 'bn';
  const motherName = isBangla ? activeChild.motherNameBn : activeChild.motherNameEn;
  const childName = isBangla ? activeChild.nameBn : activeChild.nameEn;
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const todayLogs = routineLogs.filter((log) => !log.date || log.date === todayKey);
  const feedLogs = todayLogs.filter((log) => log.type === 'feed');
  const sleepLogs = todayLogs.filter((log) => log.type === 'sleep');
  const diaperLogs = todayLogs.filter((log) => log.type === 'diaper');
  const sleepMinutes = sleepLogs.reduce((total, log) => total + getLogMinutes(log), 0);
  const latestActivities = routineLogs
    .map((log, index) => ({ log, index }))
    .sort((a, b) => {
      const dateOrder = (b.log.date || todayKey).localeCompare(a.log.date || todayKey);
      return dateOrder || getTimeValue(b.log.time) - getTimeValue(a.log.time) || a.index - b.index;
    })
    .slice(0, 5)
    .map(({ log }) => log);
  const latestGrowthLogs = [...growthLogs].sort((a, b) => b.date.localeCompare(a.date));
  const latestGrowth = latestGrowthLogs[0];
  const upcomingActivity = activities.find((activity) => !activity.completed);
  const dateLabel = today.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const ageLabel = activeChild.isPregnant
    ? activeChild.gestationalAgeWeeks == null
      ? (isBangla ? 'গর্ভকাল যোগ করুন' : 'Add pregnancy week')
      : `${formatLocalizedNumber(activeChild.gestationalAgeWeeks, currentLang)} ${isBangla ? 'সপ্তাহের গর্ভকাল' : 'weeks pregnant'}`
    : `${formatLocalizedNumber(activeChild.ageMonths, currentLang)} ${isBangla ? 'মাস' : 'months'} ${formatLocalizedNumber(activeChild.ageDays, currentLang)} ${isBangla ? 'দিন' : 'days'}`;
  const recentGrowthPoints = [...latestGrowthLogs].slice(0, 5).reverse();
  const weightRange = recentGrowthPoints.length > 1
    ? Math.max(...recentGrowthPoints.map((entry) => entry.weightKg)) - Math.min(...recentGrowthPoints.map((entry) => entry.weightKg))
    : 0;
  const growthPolyline = recentGrowthPoints.map((entry, index) => {
    const x = recentGrowthPoints.length === 1 ? 50 : (index / (recentGrowthPoints.length - 1)) * 100;
    const y = weightRange === 0 ? 50 : 84 - ((entry.weightKg - Math.min(...recentGrowthPoints.map((item) => item.weightKg))) / weightRange) * 68;
    return `${x},${y}`;
  }).join(' ');
  const routineLabels: Record<RoutineLogEntry['type'], { bn: string; en: string }> = {
    feed: { bn: 'খাওয়ানো', en: 'Feeding' },
    sleep: { bn: 'ঘুম', en: 'Sleep' },
    diaper: { bn: 'ডায়পার', en: 'Diaper' },
    potty: { bn: 'পটি', en: 'Potty' },
  };
  const routineIcons = {
    feed: Utensils,
    sleep: Moon,
    diaper: Droplets,
    potty: Baby,
  };
  const summaryCards = [
    { label: isBangla ? 'খাওয়ানো' : 'Feeding', value: formatLocalizedNumber(feedLogs.length, currentLang), suffix: isBangla ? 'বার' : 'logs', icon: Utensils, color: 'orange', detail: isBangla ? 'আজকের খাবারের এন্ট্রি' : 'Today’s feeding logs' },
    { label: isBangla ? 'ঘুম' : 'Sleep', value: formatLocalizedNumber(sleepLogs.length, currentLang), suffix: isBangla ? 'বার' : 'sessions', icon: Moon, color: 'violet', detail: formatSleep(sleepMinutes, currentLang) },
    { label: isBangla ? 'ডায়পার' : 'Diaper', value: formatLocalizedNumber(diaperLogs.length, currentLang), suffix: isBangla ? 'বার' : 'changes', icon: Droplets, color: 'blue', detail: isBangla ? 'আজকের পরিবর্তন' : 'Today’s changes' },
    { label: isBangla ? 'খেলা' : 'Play', value: `${formatLocalizedNumber(completedActivitiesCount, currentLang)}/${formatLocalizedNumber(activitiesCount, currentLang)}`, suffix: isBangla ? 'সম্পন্ন' : 'done', icon: Gamepad2, color: 'green', detail: isBangla ? 'আজকের খেলার লক্ষ্য' : 'Today’s play goal' },
  ];

  return (
    <div className="animate-in fade-in duration-300 space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[#F2E6DC] bg-white p-5 shadow-[0_12px_36px_rgba(73,58,47,0.05)] sm:p-7">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#FFAB76] to-[#E86D36]" />
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#D66A37]">{dateLabel}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#25313D] sm:text-3xl">
              {isBangla ? `শুভেচ্ছা, ${motherName || 'আম্মু'}!` : `Hello, ${motherName || 'Mama'}!`}
            </h1>
            <p className="mt-1 text-sm text-[#697582]">
              {activeChild.isPregnant
                ? (isBangla ? `আপনার মাতৃত্বের যাত্রার ${ageLabel}।` : `You’re ${ageLabel} into your journey.`)
                : (isBangla ? `${childName}-র আজকের ছোট্ট অগ্রগতি কেমন?` : `Here’s how ${childName} is doing today.`)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF5EE] px-3 py-1.5 text-xs font-bold text-[#A84D26]">
                <Baby className="h-4 w-4" />{activeChild.isPregnant ? ageLabel : `${childName} · ${ageLabel}`}
              </span>
              <button type="button" onClick={onOpenWeatherModal} className="inline-flex items-center gap-1.5 rounded-full border border-[#EAEFEB] bg-white px-3 py-1.5 text-xs font-semibold text-[#64716A] transition hover:border-[#E6B99E]">
                <CloudSun className="h-4 w-4 text-[#D66A37]" />{isBangla ? 'আজকের আবহাওয়া' : 'Today’s weather'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <button type="button" onClick={onOpenPartnerModal} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E3DD] px-3 py-2.5 text-xs font-bold text-[#56625B] transition hover:bg-[#FAF7F3]">
              <Users className="h-4 w-4 text-[#718A76]" />{isBangla ? 'পার্টনার যুক্ত করুন' : 'Add partner'}
            </button>
            <button type="button" onClick={onOpenSubscriptionModal} className="inline-flex items-center gap-2 rounded-xl bg-[#FFF2E9] px-3 py-2.5 text-xs font-bold text-[#A84D26] transition hover:bg-[#FFE8D9]">
              <Sparkles className="h-4 w-4" />{subscription.status === 'active' ? (isBangla ? 'সদস্যতা' : 'Subscription') : (isBangla ? 'সদস্যতা দেখুন' : 'Explore plans')}
            </button>
          </div>
        </div>
      </section>

      {!activeChild.isPregnant && (
        <section className="rounded-[24px] border border-[#F0E7DF] bg-white p-4 shadow-[0_8px_24px_rgba(73,58,47,0.035)] sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#35423B]">{isBangla ? 'দ্রুত যত্নের কাজ' : 'Quick care actions'}</h2>
              <p className="mt-1 text-xs text-[#89928D]">{isBangla ? 'একটি ট্যাপেই দৈনন্দিন তথ্য যোগ করুন' : 'Log a care moment in one tap'}</p>
            </div>
            <button type="button" onClick={() => onNavigate('baby-diary')} className="inline-flex items-center gap-1 text-xs font-bold text-[#C85D26]">
              {isBangla ? 'ডায়েরিতে লিখুন' : 'Write a diary note'}<ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { label: isBangla ? 'খাওয়ানো যোগ করুন' : 'Log a feed', icon: Utensils, tone: 'bg-[#FFF2E9] text-[#C85D26]' },
              { label: isBangla ? 'ঘুম যোগ করুন' : 'Log sleep', icon: Moon, tone: 'bg-[#F2EEFF] text-[#7459B5]' },
              { label: isBangla ? 'ডায়পার বদল' : 'Log diaper', icon: Droplets, tone: 'bg-[#EDF5FF] text-[#4279B8]' },
              { label: isBangla ? 'খেলার সময়' : 'Play together', icon: Gamepad2, tone: 'bg-[#EEF7F0] text-[#4E8A60]', tab: 'daily-play' },
            ].map(({ label, icon: Icon, tone, tab }) => (
              <button key={label} type="button" onClick={() => onNavigate(tab || 'daily-routine')} className="group flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#F0EAE4] bg-white px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#E9B99E] hover:shadow-sm">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <span className="text-xs font-bold leading-snug text-[#46534D]">{label}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#B5BDB8] transition group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </section>
      )}

      {activeChild.isPregnant && (
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: isBangla ? 'গর্ভকাল' : 'Pregnancy', value: ageLabel, icon: CalendarDays, tab: 'daily-routine' },
            { label: isBangla ? 'বিকাশের মাইলস্টোন' : 'Milestones', value: `${formatLocalizedNumber(achievedMilestonesCount, currentLang)} / ${formatLocalizedNumber(milestonesCount, currentLang)}`, icon: CheckCircle2, tab: 'ogrogoti-graph' },
            { label: isBangla ? 'আজকের নোট' : 'Today’s note', value: isBangla ? 'ডায়েরিতে লিখুন' : 'Add a diary note', icon: PenLine, tab: 'baby-diary' },
          ].map(({ label, value, icon: Icon, tab }) => (
            <button key={label} type="button" onClick={() => onNavigate(tab)} className="flex items-center gap-3 rounded-2xl border border-[#F0E7DF] bg-white p-4 text-left shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF2E9] text-[#D66A37]"><Icon className="h-5 w-5" /></span>
              <span><span className="block text-xs font-semibold text-[#78837D]">{label}</span><span className="mt-1 block text-base font-extrabold text-[#35423B]">{value}</span></span>
            </button>
          ))}
        </section>
      )}

      {!activeChild.isPregnant && (
        <section aria-labelledby="dashboard-summary-heading" className="space-y-3">
          <div>
            <h2 id="dashboard-summary-heading" className="text-sm font-extrabold text-[#35423B]">{isBangla ? 'আজকের সারাংশ' : 'Today’s summary'}</h2>
            <p className="mt-1 text-xs text-[#89928D]">{isBangla ? 'এক নজরে আজকের যত্ন ও খেলার হিসাব' : 'A quick look at today’s care and play'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {summaryCards.map(({ label, value, suffix, icon: Icon, color, detail }) => (
              <button key={label} type="button" onClick={() => onNavigate(label === (isBangla ? 'খেলা' : 'Play') ? 'daily-play' : 'daily-routine')} className="rounded-2xl border border-[#EEE8E2] bg-white p-4 text-left shadow-[0_6px_20px_rgba(73,58,47,0.035)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <span className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#78837D]">{label}</span>
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${color === 'orange' ? 'bg-[#FFF2E9] text-[#D66A37]' : color === 'violet' ? 'bg-[#F2EEFF] text-[#7459B5]' : color === 'blue' ? 'bg-[#EDF5FF] text-[#4279B8]' : 'bg-[#EEF7F0] text-[#4E8A60]'}`}><Icon className="h-4 w-4" /></span>
                </span>
                <span className="mt-3 flex items-baseline gap-1.5"><span className="text-2xl font-black tracking-tight text-[#25313D]">{value}</span><span className="text-xs font-semibold text-[#89928D]">{suffix}</span></span>
                <span className="mt-1 block truncate text-xs text-[#89928D]">{detail}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
        <section className="overflow-hidden rounded-[24px] border border-[#EEE8E2] bg-white shadow-[0_8px_24px_rgba(73,58,47,0.035)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#F2EEEA] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-extrabold text-[#35423B]">{isBangla ? 'সাম্প্রতিক কার্যক্রম' : 'Recent activity'}</h2>
              <p className="mt-1 text-xs text-[#89928D]">{isBangla ? 'আপনার সন্তানের যত্নের সর্বশেষ নথি' : 'The latest moments you’ve logged'}</p>
            </div>
            <button type="button" onClick={() => onNavigate('daily-routine')} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#C85D26]">
              {isBangla ? 'সব দেখুন' : 'View all'}<ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {latestActivities.length ? (
            <div className="divide-y divide-[#F5F1ED]">
              {latestActivities.map((log) => {
                const Icon = routineIcons[log.type];
                const date = log.date ? new Date(`${log.date}T00:00:00`) : today;
                const timeLabel = `${date.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' })} · ${log.time}`;
                return (
                  <button key={log.id} type="button" onClick={() => onNavigate('daily-routine')} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#FFFCF9] sm:px-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFF5EE] text-[#D66A37]"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-[#3F4B44]">{isBangla ? log.titleBn : log.titleEn}</span>
                      <span className="mt-1 block truncate text-[11px] text-[#89928D]">{routineLabels[log.type][isBangla ? 'bn' : 'en']} · {timeLabel}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#B5BDB8]" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-9 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[#FFF5EE] text-[#D66A37]"><Heart className="h-5 w-5" /></span>
              <p className="mt-3 text-sm font-bold text-[#46534D]">{isBangla ? 'আজকের যত্নের মুহূর্তগুলো এখানে দেখাবে' : 'Your care moments will appear here'}</p>
              <p className="mt-1 text-xs text-[#89928D]">{isBangla ? 'ট্র্যাকার থেকে প্রথম এন্ট্রিটি যোগ করুন।' : 'Add your first entry from the tracker.'}</p>
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-[#F0E4D9] bg-[#FFFBF7] p-4 shadow-[0_8px_24px_rgba(73,58,47,0.03)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#35423B]">{isBangla ? 'এরপর কী?' : 'Coming up next'}</h2>
                <p className="mt-1 text-xs text-[#89928D]">{isBangla ? 'আজকের জন্য ছোট্ট কিছু পরামর্শ' : 'A few helpful next steps'}</p>
              </div>
              <CalendarDays className="h-5 w-5 text-[#D66A37]" />
            </div>
            <div className="mt-4 space-y-2.5">
              {!activeChild.isPregnant && (
                <button type="button" onClick={() => onNavigate('daily-play')} className="flex w-full items-start gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-sm transition hover:border-[#F1CDB9]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EEF7F0] text-[#4E8A60]"><Gamepad2 className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold text-[#89928D]">{isBangla ? 'আজকের খেলা' : 'Today’s play'}</span>
                    <span className="mt-1 block truncate text-xs font-extrabold text-[#46534D]">{upcomingActivity ? (isBangla ? upcomingActivity.titleBn : upcomingActivity.titleEn) : (isBangla ? 'আজকের সব খেলা সম্পন্ন!' : 'All activities completed!')}</span>
                  </span>
                  {upcomingActivity ? <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#A5AEA8]" /> : <CheckCircle2 className="mt-2 h-4 w-4 shrink-0 text-[#4E8A60]" />}
                </button>
              )}
              <button type="button" onClick={() => onNavigate('daily-routine')} className="flex w-full items-start gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-sm transition hover:border-[#F1CDB9]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFF2E9] text-[#D66A37]"><Syringe className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-[#89928D]">{isBangla ? 'টিকার যাত্রা' : 'Vaccination journey'}</span>
                  <span className="mt-1 block text-xs font-extrabold text-[#46534D]">{isBangla ? 'পরবর্তী টিকার সময়সূচি দেখে নিন' : 'Check the upcoming vaccine schedule'}</span>
                </span>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#A5AEA8]" />
              </button>
              <button type="button" onClick={() => onNavigate('ogrogoti-graph')} className="flex w-full items-start gap-3 rounded-2xl border border-white bg-white p-3 text-left shadow-sm transition hover:border-[#F1CDB9]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EDF5FF] text-[#4279B8]"><ChartNoAxesColumnIncreasing className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-[#89928D]">{isBangla ? 'বিকাশের অগ্রগতি' : 'Growth & milestones'}</span>
                  <span className="mt-1 block text-xs font-extrabold text-[#46534D]">{formatLocalizedNumber(achievedMilestonesCount, currentLang)} / {formatLocalizedNumber(milestonesCount, currentLang)} {isBangla ? 'টি মাইলস্টোন সম্পন্ন' : 'milestones reached'}</span>
                </span>
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#A5AEA8]" />
              </button>
            </div>
          </section>

          {!activeChild.isPregnant && (
            <section className="overflow-hidden rounded-[24px] border border-[#EEE8E2] bg-white p-4 shadow-[0_8px_24px_rgba(73,58,47,0.035)] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-[#35423B]">{isBangla ? 'বেড়ে ওঠার ঝলক' : 'Growth snapshot'}</h2>
                  <p className="mt-1 text-xs text-[#89928D]">{latestGrowth ? (isBangla ? `সর্বশেষ আপডেট · ${new Date(`${latestGrowth.date}T00:00:00`).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}` : `Last updated · ${new Date(`${latestGrowth.date}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`) : (isBangla ? 'নিয়মিত মাপ লিখে রাখুন' : 'Track measurements over time')}</p>
                </div>
                <button type="button" onClick={() => onNavigate('ogrogoti-graph')} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF2E9] text-[#C85D26]" aria-label={isBangla ? 'বিকাশের অগ্রগতি দেখুন' : 'View growth'}>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-[#FFFAF6] px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#89928D]"><Weight className="h-3.5 w-3.5 text-[#D66A37]" />{isBangla ? 'ওজন' : 'Weight'}</span>
                  <span className="mt-1 block text-lg font-black text-[#35423B]">{formatLocalizedNumber(latestGrowth?.weightKg ?? activeChild.currentWeightKg, currentLang)} <span className="text-xs font-semibold text-[#78837D]">কেজি</span></span>
                </div>
                <div className="rounded-2xl bg-[#F6F9FC] px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#89928D]"><Ruler className="h-3.5 w-3.5 text-[#4279B8]" />{isBangla ? 'উচ্চতা' : 'Height'}</span>
                  <span className="mt-1 block text-lg font-black text-[#35423B]">{formatLocalizedNumber(latestGrowth?.heightCm ?? activeChild.currentHeightCm, currentLang)} <span className="text-xs font-semibold text-[#78837D]">সেমি</span></span>
                </div>
              </div>
              {recentGrowthPoints.length > 0 ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-16 w-full overflow-visible" role="img" aria-label={isBangla ? 'ওজনের অগ্রগতির রেখাচিত্র' : 'Weight trend'}>
                  <path d="M0 84 H100" stroke="#EEE8E2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  <polyline points={growthPolyline} fill="none" stroke="#E9753F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              ) : (
                <button type="button" onClick={() => onNavigate('ogrogoti-graph')} className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-[#E9D8C9] py-3 text-xs font-bold text-[#A9633D]">
                  {isBangla ? 'প্রথম মাপটি যোগ করুন' : 'Add the first measurement'}<ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </section>
          )}
        </div>
      </div>

      <section className="rounded-[24px] border border-[#EEE8E2] bg-white p-4 shadow-[0_8px_24px_rgba(73,58,47,0.035)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#35423B]">{activeChild.isPregnant ? (isBangla ? 'আজ আপনার কেমন লাগছে?' : 'How are you feeling today?') : (isBangla ? `${childName}-র আজকের মুড` : `${childName}’s mood today`)}</h2>
            <p className="mt-1 text-xs text-[#89928D]">{isBangla ? 'একটি বেছে নিলে দিনটির নোটে যোগ হবে' : 'Choose one to add it to today’s notes'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((mood) => (
              <button key={mood.id} type="button" aria-pressed={activeChild.todayMood === mood.id} onClick={() => onSelectMood(mood.id)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${activeChild.todayMood === mood.id ? 'border-[#E9753F] bg-[#FFF2E9] text-[#A84D26]' : 'border-[#EAEFEB] bg-white text-[#64716A] hover:border-[#E6B99E]'}`}>
                <span>{mood.emoji}</span>{isBangla ? mood.bn : mood.en}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
