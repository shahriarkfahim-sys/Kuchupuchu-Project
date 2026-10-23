import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Users, 
  LogIn, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Heart,
  Baby
} from 'lucide-react';
import { Language, ChildProfile } from '../types';
import { translations } from '../i18n/translations';

interface AuthGateModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  targetTab?: string;
  onSuccessLogin: (profile?: Partial<ChildProfile>) => void;
  onLinkPartnerCode: (code: string) => boolean;
  onOpenOnboarding: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  targetTab,
  onSuccessLogin,
  onLinkPartnerCode,
  onOpenOnboarding,
}) => {
  const t = translations[currentLang];
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [partnerCodeError, setPartnerCodeError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'parent_code' | 'login'>('parent_code');
  const [phoneInput, setPhoneInput] = useState('');

  if (!isOpen) return null;

  // Friendly name for the target tab
  const getTabLabel = (tab?: string) => {
    switch (tab) {
      case 'ogrogoti-graph':
        return currentLang === 'bn' ? 'অগ্রগতি ও গ্রাফ' : 'Growth & Graph';
      case 'daily-play':
        return currentLang === 'bn' ? 'আজকের খেলা' : 'Daily Play';
      case 'daily-routine':
        return currentLang === 'bn' ? 'রুটিন ও যত্ন' : 'Routine & Care';
      case 'baby-diary':
        return currentLang === 'bn' ? 'সন্তানের ডায়েরি' : "Baby's Diary";
      default:
        return currentLang === 'bn' ? 'এই পাতা' : 'This page';
    }
  };

  const handlePartnerCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerCodeError(null);
    const clean = partnerCodeInput.trim().toUpperCase();
    if (!clean) return;

    const success = onLinkPartnerCode(clean);
    if (success) {
      onSuccessLogin();
      onClose();
    } else {
      setPartnerCodeError(
        currentLang === 'bn'
          ? 'দুঃখিত, পেরেন্ট কোডটি সঠিক নয়। অনুগ্রহ করে মিলিয়ে নিন (যেমন: KUCHU-8821)।'
          : 'Invalid partner code. Please verify (e.g. KUCHU-8821).'
      );
    }
  };

  const handlePhoneLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccessLogin();
    onClose();
  };

  const handleFastDemoLogin = () => {
    onSuccessLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D3142]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#EED9C7] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFF0E2] via-[#FFFAF5] to-[#FFEBE4] p-5 sm:p-6 border-b border-[#F0D5C1] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/80 hover:bg-white text-[#7C8294] hover:text-[#2D3142] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26] uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5 text-[#FF8552]" />
            <span>{currentLang === 'bn' ? 'সুরক্ষিত পাতা' : 'Protected Page'}</span>
          </div>

          <h3 className="text-xl font-bold text-[#2D3142]">
            {currentLang === 'bn' ? 'সাইন ইন অথবা পেরেন্ট কোড প্রয়োজন' : 'Sign In or Enter Parent Code'}
          </h3>
          <p className="text-xs text-[#5C6479] mt-1.5 leading-relaxed">
            {currentLang === 'bn' ? (
              <>
                <strong className="text-[#C85D26] font-semibold">"{getTabLabel(targetTab)}"</strong> দেখতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন অথবা জীবনসঙ্গীর পেরেন্ট কোড দিয়ে প্রবেশ করুন।
              </>
            ) : (
              <>
                To access <strong className="text-[#C85D26] font-semibold">"{getTabLabel(targetTab)}"</strong>, please sign in or enter a family parent code.
              </>
            )}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Option Selector: Parent Code vs Phone Login */}
          <div className="flex items-center p-1 bg-[#FFFAF5] border border-[#EED9C7] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveSubTab('parent_code')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'parent_code'
                  ? 'bg-white text-[#2D3142] shadow-xs'
                  : 'text-[#64748B] hover:text-[#2D3142]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#2F6B47]" />
              <span>{currentLang === 'bn' ? 'পেরেন্ট কোড' : 'Parent Code'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'login'
                  ? 'bg-white text-[#2D3142] shadow-xs'
                  : 'text-[#64748B] hover:text-[#2D3142]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF8552]" />
              <span>{currentLang === 'bn' ? 'সাইন ইন / লগইন' : 'Sign In'}</span>
            </button>
          </div>

          {/* TAB 1: ENTER PARENT CODE */}
          {activeSubTab === 'parent_code' && (
            <form onSubmit={handlePartnerCodeSubmit} className="space-y-4 animate-in fade-in duration-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'জীবনসঙ্গী বা পরিবারের পেরেন্ট কোড দিন:' : 'Enter family parent code:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={partnerCodeInput}
                    onChange={(e) => {
                      setPartnerCodeInput(e.target.value.toUpperCase());
                      setPartnerCodeError(null);
                    }}
                    placeholder="KUCHU-XXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EED9C7] focus:border-[#2F6B47] focus:outline-none font-mono text-base font-bold tracking-widest text-[#2D3142] uppercase text-center"
                  />
                </div>
                <p className="text-[11px] text-[#7C8294]">
                  {currentLang === 'bn' 
                    ? 'টিপস: সন্তানের অন্য অভিভাবক অ্যাপের প্রোফাইল থেকে এই কোডটি (যেমন: KUCHU-8821) শেয়ার করতে পারেন।' 
                    : 'Tip: The other parent can share this code (e.g. KUCHU-8821) from their profile.'}
                </p>
              </div>

              {partnerCodeError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  ✕ {partnerCodeError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2F6B47] hover:bg-[#255437] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{currentLang === 'bn' ? 'কোড দিয়ে সরাসরি প্রবেশ করুন' : 'Enter with Parent Code'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 2: PHONE / SIGN IN */}
          {activeSubTab === 'login' && (
            <form onSubmit={handlePhoneLoginSubmit} className="space-y-4 animate-in fade-in duration-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'আপনার মোবাইল নম্বর:' : 'Mobile Number:'}
                </label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] focus:border-[#FF8552] focus:outline-none text-xs text-[#2D3142]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{currentLang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleFastDemoLogin}
                className="w-full py-2 bg-[#FAF4ED] hover:bg-[#F3E7DC] text-[#8C6D53] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF8552]" />
                <span>{currentLang === 'bn' ? 'দ্রুত ডেমো লগইন (১-ক্লিকে প্রবেশ)' : '1-Click Fast Login'}</span>
              </button>
            </form>
          )}

          {/* Bottom Highlight: 2 Months Free Trial Sign Up */}
          <div className="pt-3 border-t border-[#F3E7DC]">
            <div className="bg-[#FFF8F3] p-3.5 rounded-2xl border border-[#FFD9B3] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#2D3142] block">
                  {currentLang === 'bn' ? 'নতুন ব্যবহারকারী? প্রথম ২ মাস সম্পূর্ণ ফ্রি!' : 'New user? First 2 months 100% Free!'}
                </span>
                <span className="text-[11px] text-[#7C8294] block mt-0.5">
                  {currentLang === 'bn' ? 'কোনো অগ্রিম পেমেন্ট ছাড়াই সাথে সাথে শুরু করুন' : 'Get started instantly without upfront payment'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="shrink-0 px-3 py-1.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {currentLang === 'bn' ? 'ফ্রি শুরু করুন' : 'Start Free'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
