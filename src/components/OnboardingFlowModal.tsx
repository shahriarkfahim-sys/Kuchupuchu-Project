import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Baby, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Award,
  ChevronLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ChildProfile, Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';
import { LocalizedDateInput } from './LocalizedDateInput';
import {
  calculateAgeFromBirthDate,
  calculateECDResult,
  calculatePregnancyWeeks,
  childChecklistMonth,
  ECDAnswers,
  getECDQuestions,
} from '../utils/ecdAssessment';
import './OnboardingFlowModal.css';
import './BuddhiBuddy.css';

interface OnboardingFlowModalProps {
  currentLang: Language;
  isOpen: boolean;
  initialChildName?: string;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onComplete: (profile: ChildProfile, credentials?: { email: string; password: string }) => void;
}

const signupCharacters = [
  { id: 'kantha', nameBn: 'কুচু', src: '/assets/characters/live/5_kuchu_kantha_baby_live.svg', alt: 'কাঁথায় মোড়ানো শিশু' },
  { id: 'boy', nameBn: 'টুকু', src: '/assets/characters/live/1_baby_boy_live.svg', alt: 'শিশু ছেলে' },
  { id: 'girl', nameBn: 'মিম', src: '/assets/characters/live/2_baby_girl_live.svg', alt: 'শিশু মেয়ে' },
  { id: 'tiger', nameBn: 'বাঘু', src: '/assets/characters/live/3_tiger_cub_live.svg', alt: 'বাঘের শাবক' },
  { id: 'doel', nameBn: 'পিউ', src: '/assets/characters/live/4_doel_bird_live.svg', alt: 'দোয়েল পাখি' },
];

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({
  currentLang,
  isOpen,
  initialChildName = '',
  onClose,
  onSwitchToLogin,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'tense'>('idle');
  const [isAnswering, setIsAnswering] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const totalSteps = 10;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen || step >= 7) return;
    setActiveCharacterIndex(0);
    const timer = window.setInterval(() => {
      setActiveCharacterIndex((index) => (index + 1) % signupCharacters.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isOpen, step]);

  // Step 1: Parent Profile
  const [parentName, setParentName] = useState('');
  const [parentRole, setParentRole] = useState<'Mom' | 'Dad' | 'Grandma' | 'Grandpa' | 'Auntie' | 'Uncle' | 'Other'>('Mom');
  const [babyStatus, setBabyStatus] = useState<'here' | 'on_the_way'>('here');
  const [hasPregnancyName, setHasPregnancyName] = useState<boolean | null>(null);

  // Step 2: Baby Details
  const [babyName, setBabyName] = useState(initialChildName);
  const [birthDate, setBirthDate] = useState('');
  const [expectedDueDate, setExpectedDueDate] = useState('');
  const [gestationalMonth, setGestationalMonth] = useState(0);
  const [gender, setGender] = useState<'boy' | 'girl' | 'unknown'>('unknown');

  // The supplied ECD question bank drives the assessment and report.
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<ECDAnswers>({});
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && initialChildName.trim()) {
      setBabyName(initialChildName.trim());
    }
  }, [initialChildName, isOpen]);

  if (!isOpen) return null;

  const now = new Date();
  const todayInputValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const { ageMonths, ageDays } = calculateAgeFromBirthDate(birthDate, now);
  const pregnancyWeeks = calculatePregnancyWeeks(expectedDueDate, now);
  const assessmentPhase = babyStatus === 'on_the_way' ? 'pregnancy' : 'child';
  const assessmentMonth = assessmentPhase === 'pregnancy'
    ? Math.max(1, gestationalMonth)
    : childChecklistMonth(ageMonths);
  const assessmentQuestions = getECDQuestions(assessmentPhase, assessmentMonth);
  const currentAssessmentQuestion = assessmentQuestions[assessmentIndex];
  const assessmentResult = calculateECDResult(assessmentQuestions, assessmentAnswers, assessmentPhase);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const selectBabyStatus = (status: 'here' | 'on_the_way') => {
    setBabyStatus(status);
    setAssessmentIndex(0);
    setAssessmentAnswers({});
    setHasPregnancyName(null);
    setGestationalMonth(0);
    if (status === 'on_the_way') setGender('unknown');
  };

  const handleBack = () => {
    if (step === 9 && assessmentIndex > 0) {
      setAssessmentIndex((index) => index - 1);
      return;
    }
    if (step > 0) setStep(step - 1);
  };

  const handleAssessmentAnswer = (optionIndex: number) => {
    if (!currentAssessmentQuestion || isAnswering) return;
    setAssessmentAnswers((answers) => ({ ...answers, [currentAssessmentQuestion.id]: optionIndex }));
    setIsAnswering(true);
    const weight = currentAssessmentQuestion.options[optionIndex]?.weight ?? 1;
    setMascotMood(weight === 2 ? 'happy' : weight === 0 ? 'sad' : 'tense');
    window.setTimeout(() => {
      setMascotMood('idle');
      setIsAnswering(false);
      if (assessmentIndex < assessmentQuestions.length - 1) setAssessmentIndex((index) => index + 1);
      else setStep(10);
    }, 900);
  };

  const handleEmailSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Keep the password in memory until the final step; it is sent to Supabase Auth once and then cleared.
    setStep(1);
  };

  const handleProviderSignup = () => {
    window.alert(
      currentLang === 'bn'
        ? 'এই সাইন-ইন পদ্ধতি শীঘ্রই আসছে। অনুগ্রহ করে ইমেইল দিয়ে এগিয়ে যান।'
        : 'This sign-in method is coming soon. Please continue with email.'
    );
  };

  const handleFinishOnboarding = () => {
    const isPregnant = babyStatus === 'on_the_way';
    const finalBirthDate = isPregnant ? expectedDueDate : birthDate;
    const finalAssessment = assessmentResult.answeredQuestions > 0 ? assessmentResult : undefined;
    const followUpHighlights = finalAssessment?.domains
      .filter((domain) => domain.followUpSkills.length > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((domain) => `${domain.labelBn}: ${domain.followUpSkills.slice(0, 2).join('、')}`) ?? [];
    const childId = `child_${Date.now()}`;
    const finalChild: ChildProfile = {
      id: childId,
      nameBn: babyName.trim() || 'সন্তান',
      nameEn: babyName.trim() || 'My Child',
      nicknameBn: 'বাবু',
      nicknameEn: 'Babu',
      gender,
      birthDate: finalBirthDate,
      ageMonths: isPregnant ? 0 : ageMonths,
      ageDays: isPregnant ? 0 : ageDays,
      isPregnant,
      expectedDueDate: isPregnant ? expectedDueDate : undefined,
      gestationalAgeWeeks: isPregnant ? pregnancyWeeks : undefined,
      gestationalMonth: isPregnant ? gestationalMonth : undefined,
      avatarSeed: signupCharacters[activeCharacterIndex].id,
      mascotId: signupCharacters[activeCharacterIndex].id,
      mascotNameBn: signupCharacters[activeCharacterIndex].nameBn,
      currentLeap: isPregnant ? 0 : ageMonths <= 6 ? 4 : ageMonths <= 9 ? 5 : 6,
      motherNameBn: parentRole === 'Dad' ? 'আম্মু' : (parentName || 'তানিয়া'),
      motherNameEn: parentRole === 'Dad' ? 'Mother' : (parentName || 'Tania Sultana'),
      fatherNameBn: parentRole === 'Dad' ? (parentName || 'আব্বু') : 'আব্বু',
      fatherNameEn: parentRole === 'Dad' ? (parentName || 'Father') : 'Father',
      partnerCode: `KUCHU-${Math.floor(1000 + Math.random() * 9000)}`,
      linkedPartners: [
        parentName ? `${parentName} (${parentRole})` : (parentRole === 'Mom' ? 'মা' : 'বাবা'),
      ],
      currentWeightKg: isPregnant ? 0 : ageMonths <= 6 ? 7.2 : ageMonths <= 9 ? 8.9 : 10.5,
      currentHeightCm: isPregnant ? 0 : ageMonths <= 6 ? 66.0 : ageMonths <= 9 ? 71.5 : 76.0,
      todayMood: 'happy',
      assessmentScore: finalAssessment?.overallScore,
      assessmentHighlights: followUpHighlights,
      assessmentDomainScores: finalAssessment?.domains.map(({ key, labelBn, score, status, earnedPoints, totalPoints }) => ({
        domain: key,
        labelBn,
        score,
        status,
        earnedPoints,
        totalPoints,
      })),
    };

    if (finalAssessment) {
      try {
        localStorage.setItem(`kuchu_ecd_${childId}_${assessmentPhase}_${assessmentMonth}`, JSON.stringify(assessmentAnswers));
      } catch {
        // The completed assessment remains attached to the profile if storage is unavailable.
      }
    }

    onComplete(finalChild, email && password ? { email, password } : undefined);
    setPassword('');
  };

  return (
    <div className="signup-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#2D3142]/65 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={currentLang === 'bn' ? 'কুচুপুচুতে যোগ দিন' : 'Join Kuchupuchu'}
        ref={dialogRef}
        className={`signup-shell relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200${step === 9 ? ' signup-assessment-shell' : ''}`}
      >
        <aside className={`signup-welcome-panel relative flex min-h-0 flex-col overflow-hidden p-5 text-[#2D3142] sm:p-7${step === 9 ? ' signup-assessment-aside' : ''}`}>
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8552] text-white shadow-sm">
              <Baby className="h-5 w-5" />
            </div>
            <div className="text-base font-bold leading-tight">{currentLang === 'bn' ? 'কুচুপুচু' : 'Kuchupuchu'}</div>
          </div>

          <div className="signup-mascot-scene relative mx-auto flex w-full max-w-md flex-1 items-center justify-center">
            <div className="signup-mascot">
              <img
                key={signupCharacters[activeCharacterIndex].src}
                className="signup-mascot-character"
                src={signupCharacters[activeCharacterIndex].src}
                alt={signupCharacters[activeCharacterIndex].alt}
                decoding="async"
              />
            </div>
          </div>
        </aside>

        <div className={`signup-form-panel relative flex min-h-0 flex-col overflow-y-auto bg-white p-4 sm:p-6 lg:p-8${step === 0 ? ' justify-center' : ''}`}>

        {/* Top Progress & Back/Close */}
          <div className={`flex items-center justify-between ${step === 0 ? 'border-0 pb-0' : 'border-b border-[#F3E7DC] pb-4'}`}>
          <div className="flex items-center gap-2">
            {step === 0 ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                  className="text-xs font-semibold text-[#C85D26] hover:text-[#A94B20] sm:text-sm"
              >
                {currentLang === 'bn' ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন' : 'Already have an account? Sign in'}
              </button>
            ) : step < totalSteps && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isAnswering}
                aria-label={currentLang === 'bn' ? 'পেছনে যান' : 'Go back'}
                className="p-1 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {step > 6 && step !== 9 && <div className="text-xs font-bold text-[#C85D26]">
              {step === 7
                ? currentLang === 'bn' ? 'বুদ্ধি বন্ধু বেছে নিন' : 'Choose a learning buddy'
                : step === 8
                ? currentLang === 'bn' ? 'প্রোফাইল তৈরি সম্পন্ন' : 'Profile ready'
                : step === totalSteps
                  ? currentLang === 'bn' ? 'মূল্যায়ন রিপোর্ট' : 'Assessment report'
                  : step === 9
                    ? currentLang === 'bn'
                      ? `প্রশ্ন ${formatLocalizedNumber(assessmentIndex + 1, currentLang)} / ${formatLocalizedNumber(assessmentQuestions.length, currentLang)}`
                      : `Question ${assessmentIndex + 1} of ${assessmentQuestions.length}`
                    : currentLang === 'bn' ? 'বয়সভিত্তিক অ্যাসেসমেন্ট' : 'Age-based assessment'}
            </div>}
          </div>

          {/* Progress Pill Bar */}
          {step > 0 && step < totalSteps && step !== 7 && step !== 8 && (
            <div className="w-32 h-1.5 bg-[#F1E3D3] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF8552] transition-all duration-300"
                style={{ width: `${step === 9 ? ((assessmentIndex + 1) / assessmentQuestions.length) * 100 : Math.min(step / 6, 1) * 100}%` }}
              />
            </div>
          )}

          <button
            onClick={onClose}
            aria-label={currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            className="p-2 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 0 && (
          <section className="signup-account-step mx-auto w-full max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="mb-4 text-left text-xl font-bold tracking-tight text-[#171717] sm:text-2xl">
              {currentLang === 'bn' ? 'স্বাগতম, কুচুপুচুতে' : 'Welcome, Kuchupuchu'}
            </h2>

            <div className="flex flex-col gap-2.5">
              {([
                {
                  name: 'Google' as const,
                  label: currentLang === 'bn' ? 'Google দিয়ে চালিয়ে যান' : 'Continue with Google',
                  mark: (
                    <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
                      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                      <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z" />
                      <path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
                    </svg>
                  ),
                },
                { name: 'Facebook' as const, label: currentLang === 'bn' ? 'Facebook দিয়ে চালিয়ে যান' : 'Continue with Facebook', mark: <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2" /><path fill="#fff" d="M13.6 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.4V13h2.8v8h3.4Z" /></svg> },
                {
                  name: 'Apple' as const,
                  label: currentLang === 'bn' ? 'Apple দিয়ে চালিয়ে যান' : 'Continue with Apple',
                  mark: (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-[#050505]" aria-hidden="true">
                      <path d="M16.4 12.8c0-2.2 1.8-3.3 1.9-3.4a4.2 4.2 0 0 0-3.3-1.8c-1.4-.2-2.7.8-3.4.8s-1.8-.8-3-.8a4.5 4.5 0 0 0-3.8 2.3c-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.9-.7s1.8.7 3 .7c1.2 0 2-.9 2.7-2.1a9.3 9.3 0 0 0 1.2-2.5 3.9 3.9 0 0 1-2-3.7ZM14.2 6.1a4.2 4.2 0 0 0 1-3 4.3 4.3 0 0 0-2.8 1.4 4 4 0 0 0-1 2.9 3.7 3.7 0 0 0 2.8-1.3Z" />
                    </svg>
                  ),
                },
                {
                  name: 'X' as const,
                  label: currentLang === 'bn' ? 'X দিয়ে চালিয়ে যান' : 'Continue with X',
                  mark: <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-[#050505]" aria-hidden="true"><path d="M18.9 1.2h3.7l-8.1 9.2L24 22.9h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.3 6.9 6-6.9Zm-1.3 19.5h2L6.9 3.2H4.8l12.8 17.5Z" /></svg>,
                },
              ]).map((provider) => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={handleProviderSignup}
                  className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E7E7E7] bg-white px-3.5 py-2.5 text-sm font-medium text-[#242424] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9753F]/40"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">{provider.mark}</span>
                  <span>{provider.label}</span>
                </button>
              ))}
            </div>

            <div className="my-4 flex items-center gap-3 text-xs font-medium text-[#595959]">
              <span className="h-px flex-1 bg-[#EEE9E5]" />
              <span>{currentLang === 'bn' ? 'অথবা' : 'or'}</span>
              <span className="h-px flex-1 bg-[#EEE9E5]" />
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-2.5">
              <label className="block">
                <span className="relative block">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={currentLang === 'bn' ? 'ইমেইল' : 'Email'}
                    className="w-full rounded-xl border border-transparent bg-[#F0F0F0] px-4 py-3 text-sm text-[#2D3142] outline-none transition placeholder:text-[#858585] focus:border-[#E9753F] focus:bg-white focus:ring-4 focus:ring-[#E9753F]/10"
                  />
                </span>
              </label>

              <label className="block">
                <span className="relative block">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={currentLang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                    className="w-full rounded-xl border border-transparent bg-[#F0F0F0] px-4 py-3 pr-11 text-sm text-[#2D3142] outline-none transition placeholder:text-[#858585] focus:border-[#E9753F] focus:bg-white focus:ring-4 focus:ring-[#E9753F]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? (currentLang === 'bn' ? 'পাসওয়ার্ড লুকান' : 'Hide password') : (currentLang === 'bn' ? 'পাসওয়ার্ড দেখান' : 'Show password')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8C8D95] hover:bg-[#F7F1EC]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E9753F] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#D86430] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E9753F]/25"
              >
                {currentLang === 'bn' ? 'ইমেইল দিয়ে এগিয়ে যান' : 'Continue with email'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

          </section>
        )}

        {step === 1 && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="parent-name">
              {currentLang === 'bn' ? 'আপনার নাম' : 'Your name'}
            </label>
            <input
              id="parent-name"
              type="text"
              autoFocus
              value={parentName}
              onChange={(event) => setParentName(event.target.value)}
              placeholder={currentLang === 'bn' ? 'নাম লিখুন (যেমন: তানিয়া)' : 'Enter your name'}
              className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#FFB07C]"
            />
            <button onClick={handleNext} className="w-full rounded-xl bg-[#FF8552] py-3 text-sm font-semibold text-white hover:bg-[#E67332]">
              {currentLang === 'bn' ? 'পরবর্তী' : 'Continue'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#2D3142]">
              {currentLang === 'bn' ? 'সন্তানের সাথে আপনার সম্পর্ক কী?' : 'How are you related to the child?'}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { id: 'Mom', labelBn: 'মা', labelEn: 'Mom', icon: '🤱' },
                { id: 'Dad', labelBn: 'বাবা', labelEn: 'Dad', icon: '👨🏻', moustache: true },
                { id: 'Grandma', labelBn: 'নানি/দাদি', labelEn: 'Grandma', icon: '👵🏻' },
                { id: 'Grandpa', labelBn: 'নানা/দাদা', labelEn: 'Grandpa', icon: '👴🏻' },
                { id: 'Auntie', labelBn: 'খালা/ফুফু', labelEn: 'Auntie', icon: '👩🏻‍🦰' },
                { id: 'Uncle', labelBn: 'মামা/চাচা', labelEn: 'Uncle', icon: '👨🏻‍🦱' },
                { id: 'Other', labelBn: 'অন্যান্য', labelEn: 'Other', icon: '🧑🏻' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setParentRole(role.id as typeof parentRole);
                    setStep(3);
                  }}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#F3E7DC] bg-[#FFFAF5] px-2 py-2 text-sm text-[#5C6479] transition hover:border-[#FFB07C]"
                >
                  <span className="relative inline-flex text-xl" aria-hidden="true">
                    {role.icon}
                    {role.moustache && <span className="signup-role-moustache">〰</span>}
                  </span>
                  <span>{currentLang === 'bn' ? role.labelBn : role.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#2D3142]">
              {currentLang === 'bn' ? 'আপনার সন্তান কি জন্মগ্রহণ করেছে?' : 'Has your baby been born?'}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => { selectBabyStatus('here'); setStep(4); }}
                className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border border-[#F3E7DC] bg-[#FFFAF5] p-4 text-sm font-medium text-[#5C6479] transition hover:border-[#FFB07C]"
              >
                <span className="text-3xl" aria-hidden="true">👶🏻</span>
                <span>{currentLang === 'bn' ? 'হ্যাঁ, জন্মেছে' : 'Yes, born'}</span>
              </button>
              <button
                type="button"
                onClick={() => { selectBabyStatus('on_the_way'); setStep(4); }}
                className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border border-[#F3E7DC] bg-[#FFFAF5] p-4 text-sm font-medium text-[#5C6479] transition hover:border-[#FFB07C]"
              >
                <span className="text-3xl" aria-hidden="true">🤰🏻</span>
                <span>{currentLang === 'bn' ? 'না, গর্ভে আছে' : 'Not yet, on the way'}</span>
              </button>
            </div>
          </div>
        )}

        {step === 4 && babyStatus === 'on_the_way' && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#2D3142]">{currentLang === 'bn' ? 'সন্তানের নাম রাখা হয়েছে?' : 'Have you chosen a name for your baby?'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setHasPregnancyName(true); setStep(5); }} className="min-h-16 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm font-semibold text-[#5C6479] hover:border-[#FFB07C]">{currentLang === 'bn' ? 'হ্যাঁ, নাম রেখেছি' : 'Yes, named'}</button>
              <button type="button" onClick={() => { setHasPregnancyName(false); setBabyName(''); setStep(5); }} className="min-h-16 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm font-semibold text-[#5C6479] hover:border-[#FFB07C]">{currentLang === 'bn' ? 'এখনও রাখিনি' : 'Not yet'}</button>
            </div>
          </div>
        )}

        {step === 4 && babyStatus === 'here' && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="baby-name">
              {currentLang === 'bn' ? 'আপনার সন্তানের নাম কী?' : "What is your baby's name?"}
            </label>
            <input
              id="baby-name"
              type="text"
              autoFocus
              required
              value={babyName}
              onChange={(event) => setBabyName(event.target.value)}
              placeholder={currentLang === 'bn' ? 'যেমন: আয়ান বা মিষ্টি' : 'e.g. Ayaan or Mishti'}
              className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#FFB07C]"
            />
            <button onClick={() => setStep(5)} disabled={!babyName.trim()} className="w-full rounded-xl bg-[#FF8552] py-3 text-sm font-semibold text-white hover:bg-[#E67332] disabled:opacity-50">
              {currentLang === 'bn' ? 'পরবর্তী' : 'Continue'}
            </button>
          </div>
        )}

        {step === 5 && babyStatus === 'on_the_way' && hasPregnancyName && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="baby-name">{currentLang === 'bn' ? 'আপনার সন্তানের নাম কী?' : "What is your baby's name?"}</label>
            <input id="baby-name" type="text" autoFocus required value={babyName} onChange={(event) => setBabyName(event.target.value)} placeholder={currentLang === 'bn' ? 'নাম লিখুন' : 'Enter the chosen name'} className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#FFB07C]" />
            <button onClick={() => setStep(6)} disabled={!babyName.trim()} className="w-full rounded-xl bg-[#FF8552] py-3 text-sm font-semibold text-white hover:bg-[#E67332] disabled:opacity-50">{currentLang === 'bn' ? 'পরবর্তী' : 'Continue'}</button>
          </div>
        )}

        {step === 5 && (babyStatus === 'here' || (babyStatus === 'on_the_way' && hasPregnancyName === false)) && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="baby-birth-date">
              {babyStatus === 'here'
                ? currentLang === 'bn' ? 'আপনার সন্তানের জন্মতারিখ কী?' : "What is your baby's date of birth?"
                : currentLang === 'bn' ? 'সম্ভাব্য প্রসবের তারিখ কী?' : 'What is the expected due date?'}
            </label>
            <LocalizedDateInput
              id="baby-birth-date"
              currentLang={currentLang}
              required
              max={babyStatus === 'here' ? todayInputValue : undefined}
              min={babyStatus === 'on_the_way' ? todayInputValue : undefined}
              value={babyStatus === 'here' ? birthDate : expectedDueDate}
              onChange={(event) => babyStatus === 'here' ? setBirthDate(event.target.value) : setExpectedDueDate(event.target.value)}
              className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#FFB07C]"
            />
            {babyStatus === 'on_the_way' && (
              <>
                <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="gestational-month">{currentLang === 'bn' ? 'এখন গর্ভের কত মাস চলছে?' : 'Which month of pregnancy are you in?'}</label>
                <select id="gestational-month" value={gestationalMonth} onChange={(event) => setGestationalMonth(Number(event.target.value))} className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:outline-none focus:border-[#FFB07C]">
                  <option value={0} disabled>{currentLang === 'bn' ? 'মাস নির্বাচন করুন' : 'Select month'}</option>
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{formatLocalizedNumber(month, currentLang)}{currentLang === 'bn' ? ' মাস' : ` month${month === 1 ? '' : 's'}`}</option>)}
                </select>
              </>
            )}
            {babyStatus === 'here' && birthDate && (
              <p className="text-xs font-medium text-[#667085]">
                {currentLang === 'bn'
                  ? `বর্তমান বয়স: ${formatLocalizedNumber(ageMonths, currentLang)} মাস ${formatLocalizedNumber(ageDays, currentLang)} দিন`
                  : `Current age: ${ageMonths} months ${ageDays} days`}
              </p>
            )}
            {babyStatus === 'on_the_way' && expectedDueDate && (
              <p className="text-xs font-medium text-[#667085]">
                {currentLang === 'bn'
                  ? `গর্ভকাল: ${formatLocalizedNumber(gestationalMonth, currentLang)} মাস · তারিখ অনুযায়ী আনুমানিক ${formatLocalizedNumber(pregnancyWeeks, currentLang)} সপ্তাহ`
                  : `${gestationalMonth} months pregnant · approximately ${pregnancyWeeks} weeks by due date`}
              </p>
            )}
            <button onClick={() => setStep(babyStatus === 'here' ? 6 : 7)} disabled={babyStatus === 'here' ? !birthDate : !expectedDueDate || gestationalMonth === 0} className="w-full rounded-xl bg-[#FF8552] py-3 text-sm font-semibold text-white hover:bg-[#E67332] disabled:opacity-50">
              {currentLang === 'bn' ? 'পরবর্তী' : 'Continue'}
            </button>
          </div>
        )}

        {step === 6 && babyStatus === 'on_the_way' && hasPregnancyName && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="pregnancy-due-date">{currentLang === 'bn' ? 'সম্ভাব্য প্রসবের তারিখ কী?' : 'What is the expected due date?'}</label>
            <LocalizedDateInput id="pregnancy-due-date" currentLang={currentLang} required min={todayInputValue} value={expectedDueDate} onChange={(event) => setExpectedDueDate(event.target.value)} className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:bg-white focus:outline-none focus:border-[#FFB07C]" />
            <label className="block text-sm font-semibold text-[#2D3142]" htmlFor="gestational-month">{currentLang === 'bn' ? 'এখন গর্ভের কত মাস চলছে?' : 'Which month of pregnancy are you in?'}</label>
            <select id="gestational-month" value={gestationalMonth} onChange={(event) => setGestationalMonth(Number(event.target.value))} className="w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-4 py-3 text-sm focus:outline-none focus:border-[#FFB07C]">
              <option value={0} disabled>{currentLang === 'bn' ? 'মাস নির্বাচন করুন' : 'Select month'}</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{formatLocalizedNumber(month, currentLang)}{currentLang === 'bn' ? ' মাস' : ` month${month === 1 ? '' : 's'}`}</option>)}
            </select>
            {expectedDueDate && <p className="text-xs font-medium text-[#667085]">{currentLang === 'bn' ? `সম্ভাব্য তারিখ অনুযায়ী আনুমানিক ${formatLocalizedNumber(pregnancyWeeks, currentLang)} সপ্তাহ` : `Estimated ${pregnancyWeeks} weeks based on the due date`}</p>}
            <button onClick={() => setStep(7)} disabled={!expectedDueDate || gestationalMonth === 0} className="w-full rounded-xl bg-[#FF8552] py-3 text-sm font-semibold text-white hover:bg-[#E67332] disabled:opacity-50">{currentLang === 'bn' ? 'পরবর্তী' : 'Continue'}</button>
          </div>
        )}

        {step === 6 && babyStatus === 'here' && (
          <div className="signup-profile-step space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#2D3142]">
              {currentLang === 'bn' ? `${babyName}-এর লিঙ্গ কী?` : `What is ${babyName}'s gender?`}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setGender('girl'); setStep(7); }} className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border border-[#F3E7DC] bg-[#FFFAF5] p-4 text-sm text-[#5C6479] hover:border-[#FFB07C]">
                <span className="text-3xl" aria-hidden="true">👧🏻</span>
                <span>{currentLang === 'bn' ? 'কন্যা' : 'Girl'}</span>
              </button>
              <button type="button" onClick={() => { setGender('boy'); setStep(7); }} className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border border-[#F3E7DC] bg-[#FFFAF5] p-4 text-sm text-[#5C6479] hover:border-[#FFB07C]">
                <span className="text-3xl" aria-hidden="true">👦🏻</span>
                <span>{currentLang === 'bn' ? 'পুত্র' : 'Boy'}</span>
              </button>
            </div>
          </div>
        )}

        {step === 7 && (
          <section className="signup-profile-step space-y-5 animate-in fade-in">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C85D26]">{currentLang === 'bn' ? 'বুদ্ধি বন্ধু' : 'Learning buddy'}</p>
              <h3 className="mt-1 text-xl font-bold text-[#2D3142]">{currentLang === 'bn' ? 'আপনার বুদ্ধি বন্ধু বেছে নিন' : 'Choose your learning buddy'}</h3>
              <p className="mt-1 text-sm text-[#667085]">{currentLang === 'bn' ? 'অ্যাসেসমেন্টে এই বন্ধুই প্রশ্ন করবে।' : 'Your buddy will ask the assessment questions.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {signupCharacters.map((character, index) => (
                <button key={character.id} type="button" onClick={() => { setActiveCharacterIndex(index); setMascotMood('idle'); }} className={`flex min-h-36 flex-col items-center justify-center rounded-2xl border p-3 transition ${activeCharacterIndex === index ? 'border-[#FF8552] bg-[#FFF0E2] ring-2 ring-[#FF8552]/20' : 'border-[#EED9C7] bg-[#FFFAF5] hover:border-[#FFB07C]'}`} aria-pressed={activeCharacterIndex === index}>
                  <img src={character.src} alt={character.alt} className="h-20 w-20 object-contain" />
                  <span className="mt-1 text-sm font-bold text-[#2D3142]">{character.nameBn}</span>
                  <span className="text-[11px] text-[#7C8294]">{currentLang === 'bn' ? 'বুদ্ধি বন্ধু' : 'Learning buddy'}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setMascotMood('idle'); setStep(8); }} className="w-full rounded-xl bg-[#FF8552] py-3 text-sm font-semibold text-white hover:bg-[#E67332]">{currentLang === 'bn' ? `${signupCharacters[activeCharacterIndex].nameBn}-কে বেছে নিন` : `Choose ${signupCharacters[activeCharacterIndex].nameBn}`}</button>
          </section>
        )}

        {step === 8 && (
          <section className="signup-congrats mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-2 py-8 text-center" aria-live="polite">
            <div className="signup-congrats-badge relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF4EC] text-[#2F6B47]">
              <CheckCircle2 className="h-11 w-11" strokeWidth={1.8} />
              <Sparkles className="signup-congrats-sparkle h-6 w-6 text-[#E99B4B]" />
            </div>
            <p className="mb-2 text-sm font-semibold text-[#C85D26]">
              {currentLang === 'bn' ? 'অভিনন্দন!' : 'Congratulations!'}
            </p>
            <h3 className="text-2xl font-bold leading-snug text-[#2D3142]">
              {currentLang === 'bn'
                ? `${babyName.trim() ? `${babyName}-এর` : 'আপনার সন্তানের'} প্রোফাইল খোলা সম্পন্ন হয়েছে`
                : `${babyName.trim() ? `${babyName}'s` : 'Your baby’s'} profile is ready`}
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#667085]">
              {currentLang === 'bn'
                ? babyStatus === 'here'
                  ? 'এখন মাত্র ২ মিনিটে আপনার সন্তানের বয়স অনুযায়ী অ্যাসেসমেন্ট করে নিন।'
                  : 'এখন মাত্র ২ মিনিটে গর্ভাবস্থার সময় অনুযায়ী অ্যাসেসমেন্ট করে নিন।'
                : babyStatus === 'here'
                  ? 'Take a quick, 2-minute assessment for your child’s age.'
                  : 'Take a quick, 2-minute assessment for this stage of pregnancy.'}
            </p>
            <button
              type="button"
              onClick={() => { setAssessmentIndex(0); setAssessmentAnswers({}); setMascotMood('idle'); setStep(9); }}
              className="mt-7 w-full max-w-sm rounded-xl bg-[#FF8552] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E67332]"
            >
              {currentLang === 'bn' ? '২ মিনিটের অ্যাসেসমেন্ট শুরু করুন' : 'Start the 2-minute assessment'}
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-[#667085] transition-colors hover:bg-[#F8F7F5] hover:text-[#2D3142]"
            >
              {currentLang === 'bn' ? 'পরে করব' : 'I’ll do this later'}
            </button>
          </section>
        )}

        {/* SOURCE-BASED PREGNANCY OR AGE-GROUP ASSESSMENT */}
        {step === 9 && currentAssessmentQuestion && (
          <div className="signup-profile-step space-y-5 animate-in fade-in">
            <div className="buddhi-chat-row" aria-live="polite">
              <div className={`buddhi-avatar buddhi-mood-${mascotMood}`}>
                <img src={signupCharacters[activeCharacterIndex].src} alt={signupCharacters[activeCharacterIndex].alt} />
                {mascotMood !== 'idle' && <span className="buddhi-mood-face" aria-label={mascotMood === 'happy' ? 'খুশি' : mascotMood === 'sad' ? 'কাঁদছে' : 'চিন্তিত'}>{mascotMood === 'happy' ? '😄' : mascotMood === 'sad' ? '😭' : '😟'}</span>}
              </div>
              <div className="buddhi-speech-bubble">
                <h3 className="text-lg font-bold leading-relaxed text-[#252A3A] sm:text-xl">{currentAssessmentQuestion.questionBn}</h3>
                {mascotMood !== 'idle' && <p className="mt-3 text-sm font-semibold text-[#5C6479]">{mascotMood === 'happy' ? 'বাহ, দারুণ উত্তর!' : mascotMood === 'sad' ? 'কোনো সমস্যা নেই, একসাথে শিখব।' : 'হুম, এটা আরেকটু খেয়াল করি।'}</p>}
              </div>
            </div>
            <div className="space-y-2.5">
              {currentAssessmentQuestion.options.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleAssessmentAnswer(index)}
                  disabled={isAnswering}
                  className={`flex min-h-12 w-full items-center rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
                    assessmentAnswers[currentAssessmentQuestion.id] === index
                      ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26]'
                      : 'border-[#EED9C7] bg-white text-[#2D3142] hover:border-[#FFB07C] hover:bg-[#FFFAF5]'
                  }`}
                >
                  <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F7F1EC] text-xs font-bold text-[#7C8294]">
                    {formatLocalizedNumber(index + 1, currentLang)}
                  </span>
                  {option.textBn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOURCE-BASED ASSESSMENT REPORT */}
        {step === 10 && (
          <div className="signup-profile-step space-y-5 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D3142]">
                {currentLang === 'bn' ? `${babyName.trim() ? `${babyName}-এর` : 'সন্তানের'} অ্যাসেসমেন্ট ফলাফল` : `${babyName.trim() ? `${babyName}'s` : 'Your baby’s'} assessment results`}
              </h3>
              <p className="text-xs text-[#5C6479]">
                {assessmentPhase === 'pregnancy'
                  ? currentLang === 'bn'
                    ? `${formatLocalizedNumber(pregnancyWeeks, currentLang)} সপ্তাহ · ${assessmentQuestions.length}টি প্রশ্ন`
                    : `${pregnancyWeeks} weeks · ${assessmentQuestions.length} questions`
                  : currentLang === 'bn'
                    ? `${formatLocalizedNumber(ageMonths, currentLang)} মাস ${formatLocalizedNumber(ageDays, currentLang)} দিন · ${assessmentQuestions.length}টি প্রশ্ন`
                    : `${ageMonths} months ${ageDays} days · ${assessmentQuestions.length} questions`}
              </p>
            </div>

            <div className="rounded-2xl border border-[#F0D5C1] bg-[#FFFAF5] p-4 text-center">
              <p className="text-xs font-medium text-[#7C8294]">{currentLang === 'bn' ? 'সামগ্রিক স্কোর' : 'Overall score'}</p>
              <div className="mt-1 text-3xl font-bold text-[#2D3142]">{formatLocalizedNumber(assessmentResult.overallScore, currentLang)}%</div>
              <p className={`mt-1 text-sm font-semibold ${assessmentResult.status === 'on_track' ? 'text-[#2F6B47]' : assessmentResult.status === 'monitor' ? 'text-[#9A6B00]' : 'text-[#B42318]'}`}>
                {assessmentResult.status === 'on_track'
                  ? currentLang === 'bn' ? 'আশানুরূপ' : 'On track'
                  : assessmentResult.status === 'monitor'
                    ? currentLang === 'bn' ? 'আরও খেয়াল রাখুন' : 'Monitor'
                    : currentLang === 'bn' ? 'আরও সহায়তা প্রয়োজন' : 'Needs follow-up'}
              </p>
            </div>

            <div className="space-y-3">
              {assessmentResult.domains.map((domain) => (
                <div key={domain.key} className="rounded-xl border border-[#EED9C7] bg-white p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-[#2D3142]">{domain.labelBn}</span>
                    <span className={`font-bold ${domain.status === 'on_track' ? 'text-[#2F6B47]' : domain.status === 'monitor' ? 'text-[#9A6B00]' : 'text-[#B42318]'}`}>
                      {formatLocalizedNumber(domain.score, currentLang)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1E3D3]">
                    <div
                      className={`h-full rounded-full ${domain.status === 'on_track' ? 'bg-[#4CAF50]' : domain.status === 'monitor' ? 'bg-[#FFC107]' : 'bg-[#F44336]'}`}
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>
                  {domain.followUpSkills.length > 0 && (
                    <p className="mt-2 text-xs leading-relaxed text-[#667085]">
                      {currentLang === 'bn' ? 'আরও খেয়াল রাখুন: ' : 'Keep an eye on: '}
                      {domain.followUpSkills.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] leading-relaxed text-[#7C8294]">
              {currentLang === 'bn'
                ? 'ফলাফলটি আপনার দেওয়া উত্তর ও অ্যাসেসমেন্টের স্কোরিং নিয়মের সারাংশ।'
                : 'This summary reflects your answers and the assessment scoring rules.'}
            </p>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-3.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{currentLang === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Go to dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
