import React, { useState } from 'react';
import { Baby, ChevronDown, Check, Calendar, LogIn, LogOut, Users, Sparkles, Crown, Lock } from 'lucide-react';
import { ChildProfile, Language, UserSubscription } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  activeChild: ChildProfile;
  allChildren: ChildProfile[];
  onSelectChild: (child: ChildProfile) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenPartnerModal?: () => void;
  onOpenOnboarding?: () => void;
  onOpenSubscriptionModal?: () => void;
  subscription?: UserSubscription;
  isLoggedIn?: boolean;
  isLandingPage?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeChild,
  allChildren,
  onSelectChild,
  activeTab,
  onSelectTab,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenPartnerModal,
  onOpenOnboarding,
  onOpenSubscriptionModal,
  subscription,
  isLoggedIn = false,
  isLandingPage = false,
  onLogout,
}) => {
  const [childMenuOpen, setChildMenuOpen] = useState(false);
  const t = translations[currentLang];

  const protectedTabs = ['ogrogoti-graph', 'daily-play', 'daily-routine', 'baby-diary'];

  // Specific tabs ordered per exact user specification
  const navLinks = [
    { id: 'home', label: t.navHome },
    { id: 'ogrogoti-graph', label: t.navGrowthTracker }, // 'অগ্রগতি ও গ্রাফ'
    { id: 'daily-play', label: t.navDailyPlay },         // 'আজকের খেলা'
    { id: 'daily-routine', label: t.navDailyRoutine },   // 'রুটিন ও যত্ন'
    { id: 'baby-diary', label: t.navBabyDiary },         // 'সন্তানের ডায়েরি'
    { id: 'forum', label: t.navForum },                 // 'ফোরাম'
    { id: 'care-connect', label: t.navCareConnect },     // 'সাহায্য'
    { id: 'ponno', label: currentLang === 'bn' ? 'পণ্য' : 'Ponno' },
  ];

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${
      isLandingPage
        ? 'border-[#E8EEEB] bg-white/95'
        : 'border-[#EED9C7] bg-[#FFFAF5]/95'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between gap-3 md:gap-6 ${isLandingPage ? 'h-16 sm:h-[72px]' : 'h-18'}`}>
          
          {/* Zone 1: Brand Wordmark "কুচুপুচু (Kuchupuchu)" */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab(isLoggedIn ? 'dashboard' : 'home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#FF8552] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                <Baby className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#2D3142] whitespace-nowrap">
                  {currentLang === 'bn' ? 'কুচুপুচু' : 'Kuchupuchu'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (No 'dashboard' tab, simplified and clean) */}
          {!isLandingPage && !isLoggedIn && <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#4B5563]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`py-2 text-xs xl:text-sm transition-all whitespace-nowrap shrink-0 relative flex items-center gap-1.5 ${
                  activeTab === link.id
                    ? 'text-[#2D3142] font-bold'
                    : 'text-[#64748B] hover:text-[#2D3142]'
                }`}
              >
                <span>{link.label}</span>
                {!isLoggedIn && protectedTabs.includes(link.id) && (
                  <Lock className="w-3 h-3 text-[#A0AEC0]" />
                )}
                {activeTab === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF8552] rounded-full" />
                )}
              </button>
            ))}
          </nav>}

          {/* Zone 3: Child Switcher, Partner Code, Auth (Login / Logout) & Language */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Child Profile Selector (ONLY visible when user is logged in) */}
            {!isLandingPage && isLoggedIn && activeChild ? (
              <div className="relative">
                <button
                  onClick={() => setChildMenuOpen(!childMenuOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-[#EED9C7] hover:border-[#FFB07C] text-xs font-medium text-[#2D3142] shadow-xs transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center font-bold text-xs">
                    {currentLang === 'bn' ? activeChild.nameBn[0] : activeChild.nameEn[0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-semibold text-xs text-[#2D3142] leading-tight truncate max-w-[90px]">
                      {currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn}
                    </div>
                    <div className="text-[10px] text-[#7C8294] leading-tight">
                      {formatLocalizedNumber(activeChild.ageMonths, currentLang)} {t.months}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7C8294]" />
                </button>

                {/* Child Switcher Dropdown */}
                {childMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EED9C7] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-[#F3E7DC] text-xs font-semibold text-[#7C8294] flex items-center justify-between">
                      <span>{currentLang === 'bn' ? 'সন্তান নির্বাচন' : 'Select Child Profile'}</span>
                      {activeChild.partnerCode && (
                        <span className="text-[10px] text-[#2F6B47] bg-[#EAF4EC] px-1.5 py-0.5 rounded font-mono font-bold">
                          {activeChild.partnerCode}
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      {allChildren.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onSelectChild(child);
                            setChildMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                            activeChild.id === child.id
                              ? 'bg-[#FFFAF5] text-[#2D3142] font-semibold'
                              : 'hover:bg-[#FAF4ED] text-[#4B5563]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 text-left">
                            <div className="w-7 h-7 rounded-full bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center font-bold text-xs">
                              {currentLang === 'bn' ? child.nameBn[0] : child.nameEn[0]}
                            </div>
                            <div>
                              <div className="text-[#2D3142]">
                                {currentLang === 'bn' ? child.nameBn : child.nameEn}
                              </div>
                              <div className="text-[11px] text-[#7C8294]">
                                {formatLocalizedNumber(child.ageMonths, currentLang)} {t.months} {formatLocalizedNumber(child.ageDays, currentLang)} {t.days}
                              </div>
                            </div>
                          </div>
                          {activeChild.id === child.id && (
                            <Check className="w-4 h-4 text-[#FF8552]" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#F3E7DC] space-y-1">
                      <button
                        onClick={() => {
                          setChildMenuOpen(false);
                          if (onOpenOnboarding) {
                            onOpenOnboarding();
                          } else {
                            onOpenAuthModal('register');
                          }
                        }}
                        className="w-full flex items-center gap-1.5 py-1.5 px-3 text-xs text-[#C85D26] font-bold rounded-xl hover:bg-[#FFF0E2] transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#FF8552]" />
                        <span>{currentLang === 'bn' ? '+ নতুন সন্তান (অ্যাসেসমেন্ট)' : '+ Add Child (Assessment)'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setChildMenuOpen(false);
                          if (onOpenPartnerModal) onOpenPartnerModal();
                        }}
                        className="w-full flex items-center gap-1.5 py-1.5 px-3 text-xs text-[#2F6B47] font-semibold rounded-xl hover:bg-[#EAF4EC] transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-[#2F6B47]" />
                        <span>{currentLang === 'bn' ? 'পার্টনার কোড দিয়ে শেয়ার' : 'Share with Partner Code'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setChildMenuOpen(false);
                          onOpenProfileModal();
                        }}
                        className="w-full flex items-center gap-1.5 py-1.5 px-3 text-xs text-[#2D3142] font-medium rounded-xl hover:bg-[#FAF4ED] transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#FF8552]" />
                        <span>{t.editBirthdate}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Login / Logout Toggle */}
            {isLandingPage ? (
              <div className="flex items-center gap-3 sm:gap-5">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-1 py-2 text-xs font-semibold text-[#35423B] transition-colors hover:text-[#D66A37] sm:text-sm"
                >
                  {currentLang === 'bn' ? 'লগইন' : 'Log in'}
                </button>
                <button
                  onClick={() => {
                    if (onOpenOnboarding) {
                      onOpenOnboarding();
                    } else {
                      onOpenAuthModal('register');
                    }
                  }}
                  className="rounded-full bg-[#E9753F] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#D86430] sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  {currentLang === 'bn' ? 'সাইন আপ' : 'Sign up'}
                </button>
              </div>
            ) : isLoggedIn ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EED9C7] hover:border-red-300 hover:text-red-600 text-[#5C6479] shadow-xs transition-colors"
                title={currentLang === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট করুন' : 'Log out of account'}
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>{t.logoutBtn}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-[#EED9C7] hover:border-[#FF8552] text-[#2D3142] shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#FF8552]" />
                  <span>{t.loginBtn}</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenOnboarding) {
                      onOpenOnboarding();
                    } else {
                      onOpenAuthModal('register');
                    }
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#FF8552] hover:bg-[#E67332] text-white shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{currentLang === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                </button>
              </div>
            )}

            {/* Subscription & bKash Plan Button */}
            {!isLandingPage && onOpenSubscriptionModal && (
              <button
                onClick={onOpenSubscriptionModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#F0D5C1] bg-[#FFF8F3] hover:bg-[#FFEEDB] text-xs font-bold text-[#C85D26] shadow-2xs transition-colors cursor-pointer"
                title={currentLang === 'bn' ? 'সাবস্ক্রিপশন ও বিকাশ পেমেন্ট' : 'Subscription & bKash'}
              >
                <Crown className="w-3.5 h-3.5 text-[#FF8552]" />
                <span className="hidden sm:inline">
                  {subscription?.status === 'active'
                    ? (currentLang === 'bn' ? 'প্রিমিয়াম' : 'Premium')
                    : (currentLang === 'bn' ? '৩০ দিন ফ্রি' : '30 Days Free')}
                </span>
                <span className="sm:hidden">{currentLang === 'bn' ? 'প্ল্যান' : 'Plan'}</span>
              </button>
            )}

            {/* Language Toggle Switch (বাং | EN) */}
            {!isLandingPage && <div className="flex items-center p-1 bg-white border border-[#EED9C7] rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  currentLang === 'bn'
                    ? 'bg-[#FF8552] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#2D3142]'
                }`}
                aria-pressed={currentLang === 'bn'}
              >
                বাং
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  currentLang === 'en'
                    ? 'bg-[#FF8552] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#2D3142]'
                }`}
                aria-pressed={currentLang === 'en'}
              >
                EN
              </button>
            </div>}

          </div>

        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        {!isLandingPage && !isLoggedIn && <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#F3E7DC] no-scrollbar">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeTab === link.id
                  ? 'bg-[#FF8552] text-white font-bold shadow-xs'
                  : 'bg-white text-[#64748B] border border-[#EED9C7] hover:bg-[#FAF4ED]'
              }`}
            >
              <span>{link.label}</span>
              {!isLoggedIn && protectedTabs.includes(link.id) && (
                <Lock className="w-2.5 h-2.5 opacity-60" />
              )}
            </button>
          ))}
        </div>}

      </div>
    </header>
  );
};
