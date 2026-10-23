/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Baby, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  Smile,
  Users,
  CloudSun
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { HeaderBanner } from './components/HeaderBanner';
import { WormGraphView } from './components/WormGraphView';
import { DailyActivityModule } from './components/DailyActivityModule';
import { BabyRoutineTracker } from './components/BabyRoutineTracker';
import { BabyDiaryInput } from './components/BabyDiaryInput';
import { CareConnectSection } from './components/CareConnectSection';
import { ChildProfileModal } from './components/ChildProfileModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingFlowModal } from './components/OnboardingFlowModal';
import { WeatherModal } from './components/WeatherModal';
import { PartnerCodeModal } from './components/PartnerCodeModal';
import { CommunitySection } from './components/CommunitySection';
import { SpiderChartRadar } from './components/SpiderChartRadar';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AuthGateModal } from './components/AuthGateModal';
import { AuthGateCard } from './components/AuthGateCard';
import { PonnoPage } from './components/PonnoPage';
import { SonaiAssistant } from './components/SonaiAssistant';

import { 
  initialProfiles, 
  initialActivities, 
  initialMilestones, 
  verifiedClinics, 
  wormGraphData as defaultWormGraphData, 
  initialGrowthLogs,
  initialRoutineLogs,
  initialCommunityPosts,
  weatherAdvisoryData,
  moodOptions
} from './data/mockData';
import { translations, formatLocalizedNumber } from './i18n/translations';
import { ChildProfile, GrowthLogEntry, Language, RoutineLogEntry, CommunityPost, WormGraphPoint, DomainScore, UserSubscription } from './types';

export default function App() {
  // Default language is Bangla (বাংলা - Default)
  const [currentLang, setCurrentLang] = useState<Language>('bn');
  
  // Navigation tabs: 'home' | 'ogrogoti-graph' | 'daily-play' | 'daily-routine' | 'baby-diary' | 'forum' | 'care-connect'
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // User Login State (Real toggle for login/logout, synced with localStorage; defaults to logged out guest)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kuchupuchu_is_logged_in');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Data states
  const [allChildren, setAllChildren] = useState<ChildProfile[]>(initialProfiles);
  const [activeChild, setActiveChild] = useState<ChildProfile>(initialProfiles[0]);
  const [activities, setActivities] = useState(initialActivities);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [growthLogs, setGrowthLogs] = useState<GrowthLogEntry[]>(initialGrowthLogs);
  const [routineLogs, setRoutineLogs] = useState<RoutineLogEntry[]>(initialRoutineLogs);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [wormData, setWormData] = useState<WormGraphPoint[]>(defaultWormGraphData);
  
  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [hasAutoOpenedWeather, setHasAutoOpenedWeather] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [authGateModalOpen, setAuthGateModalOpen] = useState(false);
  const [authGateTargetTab, setAuthGateTargetTab] = useState<string>('ogrogoti-graph');

  // User Subscription State: First 2 months free trial, then 149/mo or 499/yr via bKash
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem('kuchupuchu_subscription');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default: 2 months free trial (15 days used, 45 days remaining)
    const start = new Date();
    start.setDate(start.getDate() - 15);
    const end = new Date(start);
    end.setDate(end.getDate() + 60);
    return {
      status: 'trial',
      plan: 'monthly',
      trialStartDate: start.toISOString(),
      trialEndDate: end.toISOString(),
      paidAmount: 0,
    };
  });

  const handleSaveSubscription = (newSub: UserSubscription) => {
    setSubscription(newSub);
    try {
      localStorage.setItem('kuchupuchu_subscription', JSON.stringify(newSub));
    } catch (e) {
      console.error(e);
    }
  };

  const t = translations[currentLang];

  const protectedTabs = ['ogrogoti-graph', 'daily-play', 'daily-routine', 'baby-diary'];

  // Tab switch with Auth Gate interception
  const handleSelectTab = (tab: string) => {
    if (!isLoggedIn && protectedTabs.includes(tab)) {
      setAuthGateTargetTab(tab);
      setAuthGateModalOpen(true);
      return;
    }
    setActiveTab(tab);
    if (tab === 'ogrogoti-graph' && !hasAutoOpenedWeather) {
      setWeatherModalOpen(true);
      setHasAutoOpenedWeather(true);
    }
  };

  // Activity toggle
  const handleToggleActivityComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, completed: !act.completed } : act))
    );
  };

  // Milestone toggle
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((ms) => (ms.id === id ? { ...ms, isAchieved: !ms.isAchieved } : ms))
    );
  };

  // Direct Parent Input: Add Growth Log
  const handleAddGrowthLog = (newLog: GrowthLogEntry) => {
    setGrowthLogs((prev) => [newLog, ...prev]);
    setActiveChild((prev) => ({
      ...prev,
      currentWeightKg: newLog.weightKg,
      currentHeightCm: newLog.heightCm,
      todayMood: newLog.mood,
    }));
  };

  // Add routine log (feed, sleep, potty)
  const handleAddRoutineLog = (entry: RoutineLogEntry) => {
    setRoutineLogs((prev) => [entry, ...prev]);
  };

  // Community post creation & upvote
  const handleAddCommunityPost = (post: CommunityPost) => {
    setCommunityPosts((prev) => [post, ...prev]);
  };

  const handleToggleCommunityUpvote = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const willUpvote = !p.isUpvoted;
        return {
          ...p,
          isUpvoted: willUpvote,
          upvotes: willUpvote ? p.upvotes + 1 : Math.max(0, p.upvotes - 1),
        };
      })
    );
  };

  // Mood selector
  const handleSelectMood = (mood: 'happy' | 'fussy' | 'sleepy' | 'active') => {
    setActiveChild((prev) => ({ ...prev, todayMood: mood }));
  };

  // Child update from profile modal
  const handleUpdateChild = (updated: Partial<ChildProfile>) => {
    setActiveChild((prev) => {
      const merged = { ...prev, ...updated };
      setAllChildren((all) => all.map((c) => (c.id === merged.id ? merged : c)));
      return merged;
    });
  };

  // Link partner code
  const handleLinkPartnerCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode.startsWith('KUCHU-')) return false;

    setActiveChild((prev) => {
      const existing = prev.linkedPartners || [];
      const newPartner = currentLang === 'bn' ? 'জীবনসঙ্গী (পার্টনার)' : 'Co-Parent (Partner)';
      if (!existing.includes(newPartner)) {
        return { ...prev, linkedPartners: [...existing, newPartner] };
      }
      return prev;
    });
    return true;
  };

  // Onboarding questionnaire completion
  const handleOnboardingComplete = (profile: ChildProfile) => {
    try {
      localStorage.setItem('kuchupuchu_is_logged_in', 'true');
    } catch (e) {
      console.error(e);
    }
    setAllChildren((prev) => [profile, ...prev]);
    setActiveChild(profile);
    setIsLoggedIn(true);
    setOnboardingModalOpen(false);
    setActiveTab('ogrogoti-graph');
    setWeatherModalOpen(true);
    setHasAutoOpenedWeather(true);
  };

  // Auth Success
  const handleAuthSuccess = (newChild?: Partial<ChildProfile>) => {
    try {
      localStorage.setItem('kuchupuchu_is_logged_in', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(true);
    setAuthGateModalOpen(false);
    setAuthModalOpen(false);
    if (newChild && newChild.nameBn) {
      const createdChild: ChildProfile = {
        id: `child_${Date.now()}`,
        nameBn: newChild.nameBn,
        nameEn: newChild.nameEn || newChild.nameBn,
        nicknameBn: newChild.nicknameBn || 'বাবু',
        nicknameEn: newChild.nicknameEn || 'Baby',
        gender: 'boy',
        birthDate: newChild.birthDate || '2026-01-10',
        ageMonths: newChild.ageMonths || 9,
        ageDays: newChild.ageDays || 12,
        avatarSeed: newChild.nameBn,
        currentLeap: 5,
        motherNameBn: newChild.motherNameBn || 'আম্মু',
        motherNameEn: newChild.motherNameEn || 'Mother',
        partnerCode: `KUCHU-${Math.floor(1000 + Math.random() * 9000)}`,
        linkedPartners: [newChild.motherNameBn ? `${newChild.motherNameBn} (আম্মু)` : 'মা'],
        currentWeightKg: 8.9,
        currentHeightCm: 71.5,
        todayMood: 'happy',
      };
      setAllChildren((prev) => [createdChild, ...prev]);
      setActiveChild(createdChild);
    }
    if (authGateTargetTab && protectedTabs.includes(authGateTargetTab)) {
      setActiveTab(authGateTargetTab);
    } else {
      setActiveTab('ogrogoti-graph');
    }
  };

  // Comprehensive Logout Handler: Log out means log out!
  // Completely resets user session, clears localStorage, returns cleanly to home page and scrolls to top
  const handleLogout = () => {
    try {
      localStorage.setItem('kuchupuchu_is_logged_in', 'false');
      localStorage.removeItem('kuchupuchu_active_child');
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic sync: when assessment is saved, update Worm Graph trajectory
  const handleSaveAssessment = (month: number, overallScore: number, domainScores: DomainScore[]) => {
    setWormData((prev) =>
      prev.map((point) => {
        if (point.month === month) {
          return {
            ...point,
            babyScore: overallScore,
          };
        }
        return point;
      })
    );
  };

  const completedActivitiesCount = activities.filter((a) => a.completed).length;
  const achievedMilestonesCount = milestones.filter((m) => m.isAchieved).length;

  return (
    <div className="min-h-screen bg-[#FFFAF5] text-[#2D3142] flex flex-col selection:bg-[#FFB07C]/30 selection:text-[#2D3142]">
      
      {/* 1. Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeChild={activeChild}
        allChildren={allChildren}
        onSelectChild={setActiveChild}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={(mode) => {
          if (mode === 'register') {
            setOnboardingModalOpen(true);
          } else {
            setAuthMode(mode);
            setAuthModalOpen(true);
          }
        }}
        onOpenPartnerModal={() => setPartnerModalOpen(true)}
        onOpenOnboarding={() => setOnboardingModalOpen(true)}
        onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
        subscription={subscription}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">
        
        {/* VIEW 1: HOME PAGE (LANDING) */}
        {activeTab === 'home' && (
          <HomePage
            currentLang={currentLang}
            onGoToDashboard={() => handleSelectTab('ogrogoti-graph')}
            onOpenAuth={(mode) => {
              if (mode === 'register') {
                setOnboardingModalOpen(true);
              } else {
                setAuthMode(mode);
                setAuthModalOpen(true);
              }
            }}
            onGoToTracker={() => handleSelectTab('ogrogoti-graph')}
            onGoToPlay={() => handleSelectTab('daily-play')}
            onGoToDiary={() => handleSelectTab('baby-diary')}
            onGoToForum={() => handleSelectTab('forum')}
            isLoggedIn={isLoggedIn}
            communityPosts={communityPosts}
          />
        )}

        {activeTab === 'ponno' && <PonnoPage currentLang={currentLang} />}

        {/* VIEW 2: 'অগ্রগতি ও গ্রাফ' (Contains HeaderBanner + SpiderChartRadar + WormGraphView) */}
        {activeTab === 'ogrogoti-graph' && (
          !isLoggedIn ? (
            <AuthGateCard
              currentLang={currentLang}
              tabTitle={currentLang === 'bn' ? 'সন্তানের বিকাশ পর্যবেক্ষণ ও অগ্রগতি গ্রাফ' : "Baby's Growth Radar & Trajectory Graph"}
              tabDescription={currentLang === 'bn' ? '৬টি মূল ডোমেইনে স্পাইডার চার্ট ও মাসভিত্তিক বিকাশ দেখতে লগইন করুন অথবা পেরেন্ট কোড দিন।' : 'Sign in or enter a family parent code to view the 6-domain spider chart and developmental comparison curve.'}
              onOpenLogin={() => {
                setAuthGateTargetTab('ogrogoti-graph');
                setAuthGateModalOpen(true);
              }}
              onOpenParentCode={() => {
                setAuthGateTargetTab('ogrogoti-graph');
                setAuthGateModalOpen(true);
              }}
              onOpenRegister={() => setOnboardingModalOpen(true)}
            />
          ) : (
            <div className="space-y-10 animate-in fade-in duration-200">
              {/* Header Banner matching image_52b4bcd9 */}
              <HeaderBanner
                currentLang={currentLang}
                activeChild={activeChild}
                completedActivitiesCount={completedActivitiesCount}
                totalActivitiesCount={activities.length}
                achievedMilestonesCount={achievedMilestonesCount}
                totalMilestonesCount={milestones.length}
                onNavigateToTracker={() => handleSelectTab('ogrogoti-graph')}
                onNavigateToPlay={() => handleSelectTab('daily-play')}
                onNavigateToDiary={() => handleSelectTab('baby-diary')}
                onSelectMood={handleSelectMood}
                onOpenWeatherModal={() => setWeatherModalOpen(true)}
                onOpenPartnerModal={() => setPartnerModalOpen(true)}
                onOpenSubscriptionModal={() => setSubscriptionModalOpen(true)}
                subscription={subscription}
              />

              {/* 6 Core ECD Domains Spider Radar Assessment */}
              <SpiderChartRadar
                currentLang={currentLang}
                activeChild={activeChild}
                onNavigateToCare={() => handleSelectTab('care-connect')}
                onSaveAssessment={handleSaveAssessment}
              />

              {/* Worm Graph View with Child's Trajectory (no future line) */}
              <WormGraphView
                currentLang={currentLang}
                activeChild={activeChild}
                wormData={wormData}
                milestones={milestones}
                onToggleMilestone={handleToggleMilestone}
                onNavigateToCare={() => handleSelectTab('care-connect')}
              />
            </div>
          )
        )}

        {/* VIEW 3: DAILY PLAY MODULE */}
        {activeTab === 'daily-play' && (
          !isLoggedIn ? (
            <AuthGateCard
              currentLang={currentLang}
              tabTitle={currentLang === 'bn' ? 'আজকের ঘরোয়া খেলা ও বিকাশ কার্যক্রম' : "Today's Home Play Activities"}
              tabDescription={currentLang === 'bn' ? 'ঘরে থাকা জিনিসেই খরচশূন্য সহজ খেলার গাইড দেখতে লগইন করুন অথবা পেরেন্ট কোড দিন।' : 'Sign in or enter parent code to access zero-cost everyday play activities tailored to your baby.'}
              onOpenLogin={() => {
                setAuthGateTargetTab('daily-play');
                setAuthGateModalOpen(true);
              }}
              onOpenParentCode={() => {
                setAuthGateTargetTab('daily-play');
                setAuthGateModalOpen(true);
              }}
              onOpenRegister={() => setOnboardingModalOpen(true)}
            />
          ) : (
            <div className="animate-in fade-in duration-200">
              <DailyActivityModule
                currentLang={currentLang}
                activeChild={activeChild}
                activities={activities}
                onToggleComplete={handleToggleActivityComplete}
              />
            </div>
          )
        )}

        {/* VIEW 4: DAILY ROUTINE TRACKER (Feeding, Sleep, Potty + Analysis) */}
        {activeTab === 'daily-routine' && (
          !isLoggedIn ? (
            <AuthGateCard
              currentLang={currentLang}
              tabTitle={currentLang === 'bn' ? 'দৈনন্দিন রুটিন ও যত্ন ট্র্যাকার' : 'Daily Routine & Care Tracker'}
              tabDescription={currentLang === 'bn' ? 'দুধ খাওয়ানো, ঘুম ও পটি ট্র্যাকিং রেকর্ড দেখতে লগইন করুন অথবা পেরেন্ট কোড দিন।' : 'Sign in or enter parent code to track feeds, naps, and diaper routines.'}
              onOpenLogin={() => {
                setAuthGateTargetTab('daily-routine');
                setAuthGateModalOpen(true);
              }}
              onOpenParentCode={() => {
                setAuthGateTargetTab('daily-routine');
                setAuthGateModalOpen(true);
              }}
              onOpenRegister={() => setOnboardingModalOpen(true)}
            />
          ) : (
            <div className="animate-in fade-in duration-200">
              <BabyRoutineTracker
                currentLang={currentLang}
                activeChild={activeChild}
                routineLogs={routineLogs}
                onAddRoutineLog={handleAddRoutineLog}
              />
            </div>
          )
        )}

        {/* VIEW 5: PARENT DIRECT INPUT & BABY DIARY */}
        {activeTab === 'baby-diary' && (
          !isLoggedIn ? (
            <AuthGateCard
              currentLang={currentLang}
              tabTitle={currentLang === 'bn' ? 'সন্তানের স্মৃতিবহুল ডায়েরি ও মাইলস্টোন' : "Baby's Cherished Growth Diary"}
              tabDescription={currentLang === 'bn' ? 'সন্তানের প্রথম হাসিমুখ, প্রথম দাঁত ও ওজন-উচ্চতার স্মৃতিগুলো দেখতে লগইন করুন অথবা পেরেন্ট কোড দিন।' : 'Sign in or enter parent code to view milestone memories and growth entries.'}
              onOpenLogin={() => {
                setAuthGateTargetTab('baby-diary');
                setAuthGateModalOpen(true);
              }}
              onOpenParentCode={() => {
                setAuthGateTargetTab('baby-diary');
                setAuthGateModalOpen(true);
              }}
              onOpenRegister={() => setOnboardingModalOpen(true)}
            />
          ) : (
            <div className="animate-in fade-in duration-200">
              <BabyDiaryInput
                currentLang={currentLang}
                activeChild={activeChild}
                growthLogs={growthLogs}
                onAddGrowthLog={handleAddGrowthLog}
              />
            </div>
          )
        )}

        {/* VIEW 6: PARENT COMMUNITY FORUM */}
        {activeTab === 'forum' && (
          <div className="animate-in fade-in duration-200 space-y-6">
            <CommunitySection
              currentLang={currentLang}
              isLoggedIn={isLoggedIn}
              onRequireLogin={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
              posts={communityPosts}
              onAddPost={handleAddCommunityPost}
              onToggleUpvote={handleToggleCommunityUpvote}
            />
          </div>
        )}

        {/* VIEW 7: SUPPORT & CARE */}
        {activeTab === 'care-connect' && (
          <div className="animate-in fade-in duration-200">
            <CareConnectSection
              currentLang={currentLang}
              clinics={verifiedClinics}
              onOpenScreeningModal={() => {
                handleSelectTab('ogrogoti-graph');
              }}
            />
          </div>
        )}

      </main>

      {/* Weather Advisory Modal */}
      <WeatherModal
        currentLang={currentLang}
        isOpen={weatherModalOpen}
        onClose={() => setWeatherModalOpen(false)}
        activeChild={activeChild}
        weatherData={weatherAdvisoryData}
      />

      {/* Partner Code Share & Link Modal */}
      <PartnerCodeModal
        currentLang={currentLang}
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        activeChild={activeChild}
        onLinkPartnerCode={handleLinkPartnerCode}
      />

      {/* Comprehensive 8-Step Onboarding & Milestone Assessment Modal */}
      <OnboardingFlowModal
        currentLang={currentLang}
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Login Auth Modal */}
      <AuthModal
        currentLang={currentLang}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Child Profile & Birthdate Customization Modal */}
      <ChildProfileModal
        currentLang={currentLang}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        activeChild={activeChild}
        onUpdateChild={handleUpdateChild}
      />

      {/* Subscription & bKash Payment Modal */}
      <SubscriptionModal
        currentLang={currentLang}
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        subscription={subscription}
        onSaveSubscription={handleSaveSubscription}
      />

      {/* Auth Gate Modal (For protected tabs: ogrogoti-graph, daily-play, daily-routine, baby-diary) */}
      <AuthGateModal
        currentLang={currentLang}
        isOpen={authGateModalOpen}
        onClose={() => setAuthGateModalOpen(false)}
        targetTab={authGateTargetTab}
        onSuccessLogin={handleAuthSuccess}
        onLinkPartnerCode={handleLinkPartnerCode}
        onOpenOnboarding={() => setOnboardingModalOpen(true)}
      />

      {/* Warm Footer */}
      <footer className="mt-16 bg-white border-t border-[#EED9C7] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF8552] text-white flex items-center justify-center">
                  <Baby className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'কুচুপুচু' : 'Kuchupuchu'}
                </span>
              </div>
              <p className="text-xs text-[#5C6479] max-w-xl">
                {t.appTagline}. {currentLang === 'bn' ? 'অভিভাবকদের জন্য সহজ ভাষায় তৈরি, কোনো কঠিন বা বইয়ের ভাষা নয়।' : 'Designed for parents with warmth, affection, and simple guidance.'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-[#4B5563]">
              <span className="flex items-center gap-1.5 text-[#2F6B47]">
                <ShieldCheck className="w-4 h-4" />
                <span>{currentLang === 'bn' ? 'অভিভাবকদের নির্ভরযোগ্য গাইড' : 'Verified Guidance'}</span>
              </span>
              <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
              <span className="text-[#C85D26] font-semibold">
                {currentLang === 'bn' ? 'জরুরি শিশু হেল্পলাইন: ১৬২৬৩ / ১০৯৮' : 'Child Helpline: 16263 / 1098'}
              </span>
            </div>

          </div>

          <div className="pt-6 border-t border-[#F3E7DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7C8294]">
            <p>
              © {new Date().getFullYear()} Kuchupuchu (কুচুপুচু). {currentLang === 'bn' ? 'ভালোবাসায় তৈরি।' : 'Made with love for parents.'}
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentLang(currentLang === 'bn' ? 'en' : 'bn')}
                className="hover:text-[#2D3142] transition-colors underline"
              >
                {t.switchLanguage} ({currentLang === 'bn' ? 'English' : 'বাংলা'})
              </button>
            </div>
          </div>
        </div>
      </footer>

      <SonaiAssistant
        currentLang={currentLang}
        isLoggedIn={isLoggedIn}
        activeChild={activeChild}
        growthLogs={growthLogs}
        milestones={milestones}
        routineLogs={routineLogs}
        activities={activities}
      />

    </div>
  );
}
