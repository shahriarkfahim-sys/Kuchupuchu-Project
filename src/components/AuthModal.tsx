import React, { useState } from 'react';
import { X, Baby, Heart, Sparkles, Check, Phone, User, Calendar } from 'lucide-react';
import { ChildProfile, Language } from '../types';
import { translations } from '../i18n/translations';
import { calculateAgeFromBirthDate } from '../utils/ecdAssessment';
import { LocalizedDateInput } from './LocalizedDateInput';
import { signInWithEmail, signUpWithEmail } from '../lib/db';
import { supabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSuccess: (profile?: Partial<ChildProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  mode,
  onSuccess,
}) => {
  const t = translations[currentLang];
  const [activeMode, setActiveMode] = useState<'login' | 'register'>(mode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!supabaseConfigured) {
      setError(currentLang === 'bn' ? 'সার্ভার সংযোগ সেট করা হয়নি।' : 'Server connection is not configured.');
      return;
    }
    setBusy(true);
    try {
      if (activeMode === 'register') {
        const result = await signUpWithEmail(email.trim(), password, parentName.trim() || undefined);
        if (!result.session) {
          setError(currentLang === 'bn' ? 'ইমেইল নিশ্চিত করে তারপর লগইন করুন।' : 'Please confirm your email, then log in.');
          return;
        }
        const { ageMonths, ageDays } = calculateAgeFromBirthDate(birthDate);
        onSuccess({
          nameBn: childName,
          nameEn: childName,
          birthDate,
          motherNameBn: parentName || 'আম্মু',
          motherNameEn: parentName || 'Mother',
          ageMonths,
          ageDays,
        });
      } else {
        await signInWithEmail(email.trim(), password);
        onSuccess();
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        /invalid login/i.test(msg)
          ? currentLang === 'bn' ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' : 'Incorrect email or password.'
          : msg || (currentLang === 'bn' ? 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' : 'Something went wrong. Please try again.')
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3142]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#EED9C7] shadow-2xl p-6 sm:p-8 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#F3E7DC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFB07C] text-white flex items-center justify-center shadow-xs">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2D3142]">
                {activeMode === 'login' ? t.loginTitle : t.registerTitle}
              </h3>
              <p className="text-xs text-[#7C8294]">
                {t.appTagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[#FFFAF5] border border-[#EED9C7] rounded-xl">
          <button
            type="button"
            onClick={() => setActiveMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'login'
                ? 'bg-white text-[#2D3142] shadow-xs'
                : 'text-[#64748B] hover:text-[#2D3142]'
            }`}
          >
            {t.loginBtn}
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'register'
                ? 'bg-white text-[#2D3142] shadow-xs'
                : 'text-[#64748B] hover:text-[#2D3142]'
            }`}
          >
            {t.registerBtn}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {activeMode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {t.childNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'যেমন: আয়ান বা মিষ্টি' : 'e.g. Ayaan or Mishti'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {t.birthdateLabel}
                </label>
                <LocalizedDateInput
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  currentLang={currentLang}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {t.parentNameLabel}
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'যেমন: তানিয়া সুলতানা' : 'e.g. Tania Sultana'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block font-semibold text-[#2D3142] mb-1">
              {currentLang === 'bn' ? 'ইমেইল' : 'Email'}
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block font-semibold text-[#2D3142] mb-1">
              {currentLang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
            />
          </div>

          {error && <p role="alert" className="text-[#B42318] font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 disabled:opacity-60 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-xl shadow-xs transition-colors"
          >
            {activeMode === 'login' ? t.submitLogin : t.submitRegister}
          </button>
        </form>

        {/* Demo Fast Login (only when Supabase is not configured) */}
        {!supabaseConfigured && <div className="pt-2 border-t border-[#F3E7DC] space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3 bg-[#EAF4EC] hover:bg-[#D6EBD9] text-[#2F6B47] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.demoLoginBtn}</span>
          </button>
        </div>}

      </div>
    </div>
  );
};
