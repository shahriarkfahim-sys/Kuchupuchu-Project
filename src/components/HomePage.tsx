import React from 'react';
import { 
  Baby, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  Calendar,
  MessageSquare,
  Activity,
  Gamepad2,
  PenTool
} from 'lucide-react';
import { CommunityPost, Language } from '../types';
import { translations } from '../i18n/translations';
import { JourneyAnimation } from './JourneyAnimation';
import { MilestoneRoadmap24 } from './MilestoneRoadmap24';

interface HomePageProps {
  currentLang: Language;
  onGoToDashboard: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onGoToTracker: () => void;
  onGoToPlay: () => void;
  onGoToDiary: () => void;
  onGoToForum?: () => void;
  isLoggedIn?: boolean;
  communityPosts?: CommunityPost[];
}

export const HomePage: React.FC<HomePageProps> = ({
  currentLang,
  onGoToDashboard,
  onOpenAuth,
  onGoToTracker,
  onGoToPlay,
  onGoToDiary,
  onGoToForum,
  isLoggedIn = false,
  communityPosts = [],
}) => {
  const t = translations[currentLang];

  // Pick first featured post for the single-question lead card
  const featuredPost: CommunityPost = communityPosts[0] || {
    id: 'feat_1',
    authorName: 'সাদিয়া রহমান',
    authorRole: 'মা',
    childAgeBn: 'সন্তান: ৯ মাস',
    childAgeEn: 'Baby: 9m',
    timeAgoBn: 'আজকের আলোচনা',
    timeAgoEn: 'Today',
    titleBn: '৯ মাসে সন্তান এখনো একা একা বসতে পারছে না, একটু হেলে পড়ে - কী করব?',
    titleEn: 'Child sitting balance at 9 months',
    bodyBn: 'আমাদের ৯ মাসের ছেলে সোফা ধরে দাঁড়ায় ঠিকই কিন্তু মেঝেতে বসলে ২-৩ মিনিট পর পড়ে যায়। এটা কি স্বাভাবিক নাকি চিকিৎসকের কাছে যাওয়া উচিত?',
    bodyEn: 'Our 9 month boy can pull to stand but tilts after sitting 2-3 minutes. Is this normal?',
    upvotes: 42,
    category: 'milestones',
    replies: [
      {
        id: 'r_1',
        authorName: 'ডা. ফারহানা',
        authorRole: 'শিশু বিশেষজ্ঞ',
        bodyBn: '৯ মাসে একটু সাপোর্ট প্রয়োজন হতে পারে। নরম কুশন দিয়ে বসানোর চর্চা করুন।',
        bodyEn: 'Mild cushion support is very normal at 9 months.',
        timeAgoBn: '২ ঘণ্টা আগে',
      }
    ],
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. Hero Section: Top Wide Rounded Banner with Animated Cartoon + Centered Headline Below */}
      <section className="space-y-8">
        
        {/* Upper Wide Rounded Banner with 7-10s Animated Storytelling Journey (Hospital to Birth, Milestones & Family Hug) */}
        <div className="w-full">
          <JourneyAnimation currentLang={currentLang} className="w-full" />
        </div>

        {/* Centered Headline & Information Staff Under the Cartoon Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2D3142] leading-[1.2] text-balance">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-[#5C6479] leading-relaxed max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>

          {/* Centered CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToTracker}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{t.heroCtaTracker}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-[#FAF4ED] text-[#2D3142] border border-[#EED9C7] font-semibold rounded-2xl text-sm transition-colors shadow-xs"
            >
              {t.heroCtaRegister}
            </button>
          </div>

          <div className="pt-1">
            <button 
              onClick={() => onOpenAuth('login')} 
              className="text-xs text-[#7C8294] hover:text-[#C85D26] underline font-medium"
            >
              {t.heroLoginPrompt}
            </button>
          </div>
        </div>

      </section>

      {/* 2. "কুচুপুচু কেন?" (Why Kuchupuchu Section) - Original signature warm orange with clean high-contrast styling */}
      <section className="bg-gradient-to-br from-[#FF8552] to-[#F27038] text-white rounded-3xl p-8 sm:p-12 shadow-lg space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white bg-white/20 px-3.5 py-1 rounded-full inline-block border border-white/30">
            {currentLang === 'bn' ? 'কুচুপুচু কেন?' : 'Why Kuchupuchu?'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
            {currentLang === 'bn' ? 'শিশুর অগ্রগতি বোঝা এখন হাতের মুঠোয়' : 'Understanding Child Growth Made Loving & Clear'}
          </h2>
          <p className="text-xs sm:text-sm text-white font-medium leading-relaxed opacity-95">
            {currentLang === 'bn'
              ? 'ডাক্তারি জটিল পরিভাষা ভুলে সন্তানকে আনন্দের সাথে গড়ে তুলুন বিজ্ঞানসম্মত উপায়ে।'
              : 'Empowering parents with gentle, evidence-based tools and joyful daily play.'}
          </p>
        </div>

        {/* 4 Crisp Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1 */}
          <div 
            onClick={onGoToTracker}
            className="cursor-pointer group bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 rounded-2xl p-5 transition-all flex flex-col justify-between backdrop-blur-xs shadow-xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#FF8552] flex items-center justify-center font-bold shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.homeFeature1Title}
              </h3>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t.homeFeature1Desc}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-white group-hover:underline">
              <span>{currentLang === 'bn' ? 'রোডম্যাপ দেখুন' : 'View Roadmap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={onGoToTracker}
            className="cursor-pointer group bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 rounded-2xl p-5 transition-all flex flex-col justify-between backdrop-blur-xs shadow-xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#FF8552] flex items-center justify-center font-bold shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.homeFeature2Title}
              </h3>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t.homeFeature2Desc}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-white group-hover:underline">
              <span>{currentLang === 'bn' ? 'স্পাইডার রাডার' : 'Spider Radar'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={onGoToPlay}
            className="cursor-pointer group bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 rounded-2xl p-5 transition-all flex flex-col justify-between backdrop-blur-xs shadow-xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#FF8552] flex items-center justify-center font-bold shadow-sm">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.homeFeature3Title}
              </h3>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t.homeFeature3Desc}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-white group-hover:underline">
              <span>{currentLang === 'bn' ? 'আজকের খেলা' : 'Daily Play'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={onGoToDiary}
            className="cursor-pointer group bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/50 rounded-2xl p-5 transition-all flex flex-col justify-between backdrop-blur-xs shadow-xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#FF8552] flex items-center justify-center font-bold shadow-sm">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {t.homeFeature4Title}
              </h3>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                {t.homeFeature4Desc}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-bold text-white group-hover:underline">
              <span>{currentLang === 'bn' ? 'ডায়েরিতে যোগ করুন' : 'Open Diary'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Interactive 24-Month Roadmap Visualizer */}
      <MilestoneRoadmap24 
        currentLang={currentLang} 
        onExploreFullMilestones={onGoToTracker}
      />

      {/* 4. Single-Question Community Lead Section (Reversed Color Contrast: Dark warm rich theme with high contrast text) */}
      <section className="bg-[#241A15] text-white rounded-3xl border border-[#3E2E25] p-6 sm:p-10 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3E2E25] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {currentLang === 'bn' ? 'অভিভাবকদের জিজ্ঞাসা ও সমাধান' : 'Community Parenting Queries'}
            </h2>
          </div>

          <button
            onClick={onGoToForum || onGoToDashboard}
            className="px-5 py-2.5 bg-[#FF8552] hover:bg-[#FF773D] text-[#3B1E14] font-extrabold rounded-2xl text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 self-start md:self-auto"
          >
            <span>{currentLang === 'bn' ? 'ফোরামে যুক্ত হন' : 'Join Forum'}</span>
            <ArrowRight className="w-4 h-4 text-[#3B1E14]" />
          </button>
        </div>

        {/* The Single Featured Question Card - Inverted contrast */}
        <div 
          onClick={onGoToForum || onGoToDashboard}
          className="cursor-pointer group bg-[#2F231D] hover:bg-[#382B24] rounded-2xl p-6 border border-[#48362B] hover:border-[#FF8552] transition-all space-y-3"
        >
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-[#FFB07C] bg-[#432A1C] px-2.5 py-0.5 rounded-lg border border-[#633F2B]">
              {featuredPost.category === 'milestones' ? (currentLang === 'bn' ? 'মাইলস্টোন ও শারীরিক অগ্রগতি' : 'Milestones') : featuredPost.category}
            </span>
            <span className="text-[#B6B0AA] font-medium">
              {featuredPost.authorName} ({featuredPost.authorRole}) · {currentLang === 'bn' ? featuredPost.timeAgoBn : featuredPost.timeAgoEn}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFA07A] transition-colors leading-snug">
            {currentLang === 'bn' ? featuredPost.titleBn : featuredPost.titleEn}
          </h3>

          <p className="text-xs sm:text-sm text-[#D3CBC4] leading-relaxed line-clamp-2 font-normal">
            {currentLang === 'bn' ? featuredPost.bodyBn : featuredPost.bodyEn}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B6B0AA]">
            <div className="flex items-center gap-4">
              <span>★ {featuredPost.upvotes} জন অভিভাবক একমত</span>
              <span>💬 {featuredPost.replies?.length || 0} টি উত্তর ও পরামর্শ</span>
            </div>

            <div className="text-[#FF8552] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
              <span>{currentLang === 'bn' ? 'উত্তর দেখুন ও ফোরামে লিখুন' : 'Read Answers in Forum'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
