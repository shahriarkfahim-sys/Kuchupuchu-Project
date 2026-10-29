import React, { ReactNode } from 'react';
import {
  Activity,
  Baby,
  BookHeart,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Gamepad2,
  HeartHandshake,
  House,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { ChildProfile, Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';
import mascotFamily from '../assets/images/mascot_family.svg';
import './ParentDashboard.css';

const journeyItems = [
  { id: 'daily-routine', icon: Activity, bn: 'ট্র্যাকার', en: 'Tracker', noteBn: 'ঘুম, খাবার ও যত্নের হিসাব রাখুন', noteEn: 'Track sleep, feeds, and care' },
  { id: 'ogrogoti-graph', icon: ChartNoAxesColumnIncreasing, bn: 'বিকাশের অগ্রগতি', en: 'Growth & milestones', noteBn: 'মাইলস্টোন ও অগ্রগতি দেখুন', noteEn: 'See milestones and progress' },
  { id: 'daily-play', icon: Gamepad2, bn: 'একসঙ্গে খেলার সময়', en: 'Play together', noteBn: 'বয়স অনুযায়ী খেলার আইডিয়া', noteEn: 'Age-based play ideas' },
  { id: 'baby-diary', icon: BookHeart, bn: 'স্মৃতি ও ডায়েরি', en: 'Memories & diary', noteBn: 'বিশেষ মুহূর্তগুলো লিখে রাখুন', noteEn: 'Save the little moments' },
  { id: 'care-connect', icon: HeartHandshake, bn: 'প্রয়োজনীয় সহায়তা', en: 'Care & support', noteBn: 'বিশেষজ্ঞ ও সেবা খুঁজুন', noteEn: 'Find services and support' },
  { id: 'forum', icon: Users, bn: 'অভিভাবকদের সঙ্গে', en: 'Parent community', noteBn: 'অভিজ্ঞতা ভাগ করুন', noteEn: 'Share and learn together' },
  { id: 'ponno', icon: ShoppingBag, bn: 'দরকারি পণ্য', en: 'Helpful products', noteBn: 'পরিবারের জন্য কেনাকাটা', noteEn: 'Shop for your family' },
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
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${activeTab === 'dashboard' ? 'bg-[#FFF2E9] text-[#A84D26]' : 'text-[#46534D] hover:bg-[#FAF7F3]'}`}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#D66A37] shadow-sm"><House className="h-5 w-5" /></span>
          <span>
            <span className="block text-sm font-extrabold">{isBangla ? 'আমার ড্যাশবোর্ড' : 'My dashboard'}</span>
            <span className="mt-0.5 block text-xs text-[#89928D]">{isBangla ? 'আপনার আজকের পথচলা' : 'Your day at a glance'}</span>
          </span>
        </button>

        <div className="mt-5 flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm font-extrabold text-[#25313D]">{isBangla ? 'মায়ের পথচলা' : 'Motherhood journey'}</h2>
          <span className="rounded-full bg-[#F4F7F4] px-2 py-1 text-[10px] font-bold text-[#78837D]">{isBangla ? 'ধাপে ধাপে' : 'STEP BY STEP'}</span>
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

        <div className="mt-4 hidden items-center gap-2 rounded-2xl bg-[#F7FAF7] p-3 text-xs leading-relaxed text-[#708078] lg:flex">
          <HeartHandshake className="h-4 w-4 shrink-0 text-[#6C9A78]" />
          <span>{isBangla ? 'প্রতিটি ছোট পদক্ষেপই বড় হয়ে ওঠার অংশ।' : 'Every small step is part of growing up.'}</span>
        </div>
      </div>
    </aside>
  );
};

interface ParentDashboardProps {
  currentLang: Language;
  activeChild: ChildProfile;
  activitiesCount: number;
  completedActivitiesCount: number;
  milestonesCount: number;
  achievedMilestonesCount: number;
  onNavigate: (tab: string) => void;
  children?: ReactNode;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentLang,
  activeChild,
  activitiesCount,
  completedActivitiesCount,
  milestonesCount,
  achievedMilestonesCount,
  onNavigate,
  children,
}) => {
  const isBangla = currentLang === 'bn';
  const motherName = isBangla ? activeChild.motherNameBn : activeChild.motherNameEn;
  const childName = isBangla ? activeChild.nameBn : activeChild.nameEn;
  const age = `${formatLocalizedNumber(activeChild.ageMonths, currentLang)} ${isBangla ? 'মাস' : 'months'} ${formatLocalizedNumber(activeChild.ageDays, currentLang)} ${isBangla ? 'দিন' : 'days'}`;
  const steps = [
    { id: 'ogrogoti-graph', icon: ChartNoAxesColumnIncreasing, title: isBangla ? 'বিকাশের অগ্রগতি' : 'Growth & milestones', text: isBangla ? 'মাইলস্টোনগুলো দেখুন, সন্তানের নতুন অগ্রগতি বুঝুন।' : 'Explore milestones and see how your child is growing.' },
    { id: 'daily-play', icon: Gamepad2, title: isBangla ? 'আজকের খেলার আইডিয়া' : 'Play together today', text: isBangla ? 'বয়স অনুযায়ী সহজ খেলা বেছে নিন।' : 'Choose a simple activity for your child’s age.' },
    { id: 'daily-routine', icon: Activity, title: isBangla ? 'ট্র্যাকার' : 'Tracker', text: isBangla ? 'ঘুম, খাওয়া ও যত্নের হিসাব লিখে রাখুন।' : 'Keep track of sleep, feeding, and care.' },
  ];

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl border border-[#F1DFD2] bg-gradient-to-br from-[#FFF9F3] via-white to-[#F5FAF7] p-5 shadow-[0_12px_36px_rgba(73,58,47,0.06)] sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D66A37]">{isBangla ? 'কুচুপুচুতে স্বাগতম' : 'Welcome to Kuchupuchu'}</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#25313D] sm:text-3xl">
            {isBangla ? `স্বাগতম, ${motherName || 'আম্মু'}!` : `Welcome, ${motherName || 'Mama'}!`}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#697582] sm:text-base">
            {isBangla ? `${childName}-র বেড়ে ওঠার প্রতিটি ছোট্ট ধাপে আমরা আছি পাশে।` : `We’re here for every little step in ${childName}’s journey.`}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-2 text-xs font-bold text-[#53615A] shadow-sm">
            <Baby className="h-4 w-4 text-[#D66A37]" />
            <span>{childName}</span><span aria-hidden="true" className="text-[#C3CBC6]">·</span><span>{age}</span>
          </div>
        </div>
        <img src={mascotFamily} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-7 -right-10 hidden w-[340px] opacity-90 2xl:block" />
      </section>

      {children}

      <section aria-label={isBangla ? 'আজকের সারাংশ' : 'Today at a glance'} className="grid gap-3 sm:grid-cols-3">
        {[
          { label: isBangla ? 'আজকের খেলা' : 'Today’s play', value: `${formatLocalizedNumber(completedActivitiesCount, currentLang)} / ${formatLocalizedNumber(activitiesCount, currentLang)}`, hint: isBangla ? 'খেলা সম্পন্ন' : 'activities completed', icon: Gamepad2, tab: 'daily-play' },
          { label: isBangla ? 'বিকাশের মাইলস্টোন' : 'Growth milestones', value: `${formatLocalizedNumber(achievedMilestonesCount, currentLang)} / ${formatLocalizedNumber(milestonesCount, currentLang)}`, hint: isBangla ? 'মাইলস্টোন অর্জিত' : 'milestones reached', icon: CheckCircle2, tab: 'ogrogoti-graph' },
          { label: isBangla ? 'পরের ছোট্ট ধাপ' : 'Your next small step', value: isBangla ? 'একসঙ্গে খেলুন' : 'Play together', hint: isBangla ? 'আজকের আইডিয়া দেখুন' : 'See today’s idea', icon: ChevronRight, tab: 'daily-play' },
        ].map(({ label, value, hint, icon: Icon, tab }) => (
          <button key={label} type="button" onClick={() => onNavigate(tab)} className="rounded-2xl border border-[#E8EEEB] bg-white p-4 text-left shadow-[0_6px_18px_rgba(33,55,43,0.04)] transition hover:-translate-y-0.5 hover:border-[#F1CDB9] hover:shadow-md sm:p-5">
            <span className="flex items-center justify-between gap-2 text-xs font-semibold text-[#78837D]"><span>{label}</span><Icon className="h-4 w-4 text-[#D66A37]" /></span>
            <span className="mt-3 block text-xl font-black text-[#25313D]">{value}</span>
            <span className="mt-1 block text-xs text-[#89928D]">{hint}</span>
          </button>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#25313D] sm:text-xl">{isBangla ? 'আজকের পথচলা' : 'Your journey today'}</h2>
            <p className="mt-1 text-xs text-[#78837D] sm:text-sm">{isBangla ? 'আপনার সুবিধামতো একটি ধাপ বেছে নিন।' : 'Choose a step that works for you today.'}</p>
          </div>
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-[#6B8B73] sm:flex"><HeartHandshake className="h-4 w-4" />{isBangla ? 'আপনি একা নন' : 'You’re not alone'}</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {steps.map(({ id, icon: Icon, title, text }, index) => (
            <button key={id} type="button" onClick={() => onNavigate(id)} className="group rounded-2xl border border-[#E8EEEB] bg-white p-4 text-left shadow-[0_6px_18px_rgba(33,55,43,0.04)] transition hover:-translate-y-0.5 hover:border-[#F1CDB9] hover:shadow-md sm:p-5">
              <span className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF2E9] text-[#D66A37]"><Icon className="h-5 w-5" /></span>
                <span className="text-xs font-extrabold text-[#B0B9B3]">{formatLocalizedNumber(index + 1, currentLang)}</span>
              </span>
              <span className="mt-4 block text-sm font-extrabold text-[#35423B]">{title}</span>
              <span className="mt-1.5 block min-h-10 text-xs leading-relaxed text-[#78837D]">{text}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#C85D26]">{isBangla ? 'দেখুন' : 'Explore'}<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E8EEEB] bg-[#F7FAF8] p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#6B8B73] shadow-sm"><CircleHelp className="h-5 w-5" /></span>
          <div>
            <h2 className="text-sm font-extrabold text-[#35423B]">{isBangla ? 'কোনো প্রশ্ন আছে?' : 'Have a question?'}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#78837D]">{isBangla ? 'অভিভাবক কমিউনিটিতে কথা বলুন অথবা সহায়তা খুঁজুন।' : 'Talk with other parents or find care and support.'}</p>
          </div>
        </div>
        <button type="button" onClick={() => onNavigate('forum')} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#4E6D56] shadow-sm transition hover:bg-[#EDF5EF]">{isBangla ? 'কমিউনিটিতে যান' : 'Visit the community'}</button>
      </section>
    </div>
  );
};
