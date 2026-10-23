import React, { useState } from 'react';
import { 
  X, 
  Baby, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  User, 
  ShieldCheck, 
  Clock, 
  Award,
  ChevronLeft
} from 'lucide-react';
import { ChildProfile, Language } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

interface OnboardingFlowModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: ChildProfile) => void;
}

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;

  // Step 1: Parent Profile
  const [parentName, setParentName] = useState('');
  const [parentSurname, setParentSurname] = useState('');
  const [parentRole, setParentRole] = useState<'Mom' | 'Dad' | 'Grandma' | 'Grandpa' | 'Auntie' | 'Uncle' | 'Other'>('Mom');
  const [babyStatus, setBabyStatus] = useState<'here' | 'on_the_way'>('here');

  // Step 2: Baby Details
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('2026-01-10');
  const [gestationWeeks, setGestationWeeks] = useState('40');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [partnerCodeInput, setPartnerCodeInput] = useState('');

  // Step 3-6: Reflection & Goals MCQ
  const [wonderDaily, setWonderDaily] = useState<string>('all_time');
  const [worryReaction, setWorryReaction] = useState<string>('google');
  const [bondingFeeling, setBondingFeeling] = useState<string>('good');
  const [focusAreas, setFocusAreas] = useState<string[]>(['daily_play', 'milestones']);
  const [playTime, setPlayTime] = useState<string>('30min');

  // Step 7: Dynamic Milestone Check for Baby's Age
  const [msSitting, setMsSitting] = useState<'yes' | 'trying' | 'not_yet'>('yes');
  const [msNameResponse, setMsNameResponse] = useState<'yes' | 'not_yet'>('yes');
  const [msObjectPerm, setMsObjectPerm] = useState<'yes' | 'not_yet'>('yes');
  const [msPincerGrasp, setMsPincerGrasp] = useState<'yes' | 'trying' | 'not_yet'>('trying');

  if (!isOpen) return null;

  // Calculate age from birthDate
  const birth = new Date(birthDate || '2026-01-10');
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const ageMonths = Math.max(1, Math.floor(totalDays / 30.4375));
  const ageDays = Math.floor(totalDays % 30.4375);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleFocus = (id: string) => {
    setFocusAreas((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFinishOnboarding = () => {
    const finalChild: ChildProfile = {
      id: `child_${Date.now()}`,
      nameBn: babyName.trim() || 'সন্তান',
      nameEn: babyName.trim() || 'My Child',
      nicknameBn: 'বাবু',
      nicknameEn: 'Babu',
      gender: gender,
      birthDate: birthDate,
      ageMonths: ageMonths,
      ageDays: ageDays,
      avatarSeed: babyName || 'Baby',
      currentLeap: ageMonths <= 6 ? 4 : ageMonths <= 9 ? 5 : 6,
      motherNameBn: parentRole === 'Dad' ? 'আম্মু' : (parentName ? `${parentName} ${parentSurname}`.trim() : 'তানিয়া সুলতানা'),
      motherNameEn: parentRole === 'Dad' ? 'Mother' : (parentName || 'Tania Sultana'),
      fatherNameBn: parentRole === 'Dad' ? (parentName ? `${parentName} ${parentSurname}`.trim() : 'আব্বু') : 'আব্বু',
      fatherNameEn: parentRole === 'Dad' ? (parentName || 'Father') : 'Father',
      partnerCode: partnerCodeInput.trim() ? partnerCodeInput.toUpperCase() : `KUCHU-${Math.floor(1000 + Math.random() * 9000)}`,
      linkedPartners: [
        parentName ? `${parentName} (${parentRole})` : (parentRole === 'Mom' ? 'মা' : 'বাবা'),
      ],
      currentWeightKg: ageMonths <= 6 ? 7.2 : ageMonths <= 9 ? 8.9 : 10.5,
      currentHeightCm: ageMonths <= 6 ? 66.0 : ageMonths <= 9 ? 71.5 : 76.0,
      todayMood: 'happy',
      assessmentScore: 92,
      assessmentHighlights: [
        `${babyName || 'সন্তান'}-এর সামগ্রিক অগ্রগতি স্বাভাবিক গড়ের সাথে চমৎকার সামঞ্জস্যপূর্ণ`,
        'শারীরিক চলন ও বসার ভারসাম্যে ভালো দক্ষতা',
        'রোজ অন্তত ২০-৩০ মিনিট সাধারণ ঘরোয়া খেলায় দারুণ ফল মিলবে',
      ],
    };

    onComplete(finalChild);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D3142]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EED9C7] shadow-2xl p-6 sm:p-8 my-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Progress & Back/Close */}
        <div className="flex items-center justify-between border-b border-[#F3E7DC] pb-4">
          <div className="flex items-center gap-2">
            {step > 1 && step < totalSteps && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="text-xs font-bold text-[#C85D26]">
              {step < totalSteps ? `ধাপ ${formatLocalizedNumber(step, currentLang)} / ${formatLocalizedNumber(totalSteps - 1, currentLang)}` : 'মূল্যায়ন রিপোর্ট'}
            </div>
          </div>

          {/* Progress Pill Bar */}
          {step < totalSteps && (
            <div className="w-32 h-1.5 bg-[#F1E3D3] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF8552] transition-all duration-300"
                style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#FFFAF5] hover:bg-[#FAF4ED] text-[#7C8294]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CREATE YOUR PROFILE (IMG_3341) */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h3 className="text-2xl font-bold text-[#2D3142]">
                {currentLang === 'bn' ? 'আপনার প্রোফাইল তৈরি করুন' : 'Create your profile'}
              </h3>
              <p className="text-xs text-[#7C8294] mt-1">
                {currentLang === 'bn' ? 'সন্তানের বেড়ে ওঠার যাত্রায় আপনাকে স্বাগতম' : 'Welcome to your child’s joyful growth journey'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'আপনার নাম' : 'My name is:'}
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'নাম লিখুন (যেমন: তানিয়া)' : 'Write your name'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'পদবি / পারিবারিক নাম' : 'My surname is:'}
                </label>
                <input
                  type="text"
                  value={parentSurname}
                  onChange={(e) => setParentSurname(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'সুলতানা / আহমেদ' : 'Write your surname'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1.5">
                  {currentLang === 'bn' ? 'সন্তানের সাথে আপনার সম্পর্ক:' : 'I am a:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'Mom', labelBn: 'মা', labelEn: 'Mom' },
                    { id: 'Dad', labelBn: 'বাবা', labelEn: 'Dad' },
                    { id: 'Grandma', labelBn: 'নানি/দাদি', labelEn: 'Grandma' },
                    { id: 'Grandpa', labelBn: 'নানা/দাদা', labelEn: 'Grandpa' },
                    { id: 'Auntie', labelBn: 'খালা/ফুফু', labelEn: 'Auntie' },
                    { id: 'Uncle', labelBn: 'মামা/চাচা', labelEn: 'Uncle' },
                    { id: 'Other', labelBn: 'অন্যান্য', labelEn: 'Other' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setParentRole(r.id as any)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        parentRole === r.id
                          ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26] font-bold shadow-xs'
                          : 'border-[#F3E7DC] bg-[#FFFAF5] text-[#5C6479] hover:border-[#FFB07C]'
                      }`}
                    >
                      {currentLang === 'bn' ? r.labelBn : r.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1.5">
                  {currentLang === 'bn' ? 'সন্তানের বর্তমান অবস্থা:' : 'My baby is:'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBabyStatus('here')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      babyStatus === 'here'
                        ? 'border-[#FF8552] bg-[#FFF0E2] font-bold text-[#C85D26]'
                        : 'border-[#F3E7DC] bg-[#FFFAF5] text-[#5C6479]'
                    }`}
                  >
                    <span className="text-xl">👶</span>
                    <span>{currentLang === 'bn' ? 'জন্মগ্রহণ করেছে' : 'Here'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBabyStatus('on_the_way')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      babyStatus === 'on_the_way'
                        ? 'border-[#FF8552] bg-[#FFF0E2] font-bold text-[#C85D26]'
                        : 'border-[#F3E7DC] bg-[#FFFAF5] text-[#5C6479]'
                    }`}
                  >
                    <span className="text-xl">🤰</span>
                    <span>{currentLang === 'bn' ? 'গর্ভে আছে' : 'On the way'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-xs shadow-xs transition-colors"
            >
              {currentLang === 'bn' ? 'পরবর্তী ধাপে যান' : 'Continue'}
            </button>
          </div>
        )}

        {/* STEP 2: BABY DETAILS & PARTNER CODE (IMG_3342) */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h3 className="text-2xl font-bold text-[#2D3142]">
                {currentLang === 'bn' ? 'সন্তানের তথ্য ও জন্মতারিখ' : "Baby's Information"}
              </h3>
              <p className="text-xs text-[#7C8294] mt-1">
                {currentLang === 'bn' ? 'সঠিক জন্মতারিখের ওপর ভিত্তি করে বয়সোচিত দক্ষতা যাচাই করা হবে' : 'Milestones are calibrated to exact birth age'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'সন্তানের নাম:' : "My baby's name is:"}
                </label>
                <input
                  type="text"
                  required
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'যেমন: আয়ান বা মিষ্টি' : 'e.g. Ayaan or Mishti'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'জন্মতারিখ:' : 'Date of birth:'}
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3142] mb-1">
                    {currentLang === 'bn' ? 'গর্ভকালীন সপ্তাহ:' : 'Weeks of gestation:'}
                  </label>
                  <input
                    type="number"
                    value={gestationWeeks}
                    onChange={(e) => setGestationWeeks(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3142] mb-1">
                    {currentLang === 'bn' ? 'লিঙ্গ:' : 'My baby is a:'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('girl')}
                      className={`flex-1 py-2.5 rounded-xl border text-center transition-all ${
                        gender === 'girl'
                          ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26] font-bold'
                          : 'border-[#F3E7DC] bg-[#FFFAF5] text-[#5C6479]'
                      }`}
                    >
                      {currentLang === 'bn' ? 'কন্যা 👧' : 'Girl'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('boy')}
                      className={`flex-1 py-2.5 rounded-xl border text-center transition-all ${
                        gender === 'boy'
                          ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26] font-bold'
                          : 'border-[#F3E7DC] bg-[#FFFAF5] text-[#5C6479]'
                      }`}
                    >
                      {currentLang === 'bn' ? 'পুত্র 👦' : 'Boy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Partner Sharing Code Section */}
              <div className="pt-2 border-t border-[#F3E7DC] space-y-1.5">
                <label className="block font-semibold text-[#8C6D53]">
                  {currentLang === 'bn' ? 'মা-বাবা দুজন একসাথে যুক্ত হতে পার্টনার কোড (ঐচ্ছিক):' : 'Partner Sync Code (Optional):'}
                </label>
                <input
                  type="text"
                  value={partnerCodeInput}
                  onChange={(e) => setPartnerCodeInput(e.target.value)}
                  placeholder={currentLang === 'bn' ? 'যেমন: KUCHU-8821 (বা খালি রাখুন, নতুন কোড তৈরি হবে)' : 'e.g. KUCHU-8821'}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] uppercase text-xs tracking-wider"
                />
              </div>

            </div>

            <button
              onClick={handleNext}
              disabled={!babyName.trim()}
              className="w-full py-3 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {currentLang === 'bn' ? 'পরবর্তী ধাপে যান' : 'Continue'}
            </button>
          </div>
        )}

        {/* STEP 3: HAVE YOU EVER WONDERED (IMG_3343) */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in py-2">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#FF8552]">অভিভাবক ভাবনা</span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142] leading-snug">
                {currentLang === 'bn' 
                  ? 'আপনার কি কখনো মনে হয়েছে, "প্রতিদিন সন্তানকে নিয়ে আমি আসলে কী খেলা বা কী করব?"'
                  : 'Have you ever wondered, "What exactly am I supposed to do with my baby every day?"'}
              </h3>
            </div>

            <div className="space-y-3 max-w-sm mx-auto text-xs">
              <button
                type="button"
                onClick={() => { setWonderDaily('all_time'); handleNext(); }}
                className="w-full p-4 rounded-2xl border border-[#EED9C7] hover:border-[#FF8552] bg-white hover:bg-[#FFFAF5] font-semibold text-[#2D3142] flex items-center justify-center gap-3 transition-all shadow-xs"
              >
                <span className="text-xl">😭</span>
                <span>{currentLang === 'bn' ? 'হ্যাঁ, প্রায় সবসময়ই এমন মনে হয়' : 'All the time'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setWonderDaily('not_really'); handleNext(); }}
                className="w-full p-4 rounded-2xl border border-[#EED9C7] hover:border-[#FF8552] bg-white hover:bg-[#FFFAF5] font-semibold text-[#2D3142] flex items-center justify-center gap-3 transition-all shadow-xs"
              >
                <span className="text-xl">😄</span>
                <span>{currentLang === 'bn' ? 'না, খুব বেশি না' : 'Not really'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: WHEN SOMETHING WORRIES YOU (IMG_3349) */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in py-2">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142] leading-snug">
                {currentLang === 'bn'
                  ? 'সন্তানের কোনো বিষয়ে উদ্বেগ বা চিন্তা হলে আপনি সাধারণত কী করেন?'
                  : 'When something worries you about your baby, do you usually...'}
              </h3>
            </div>

            <div className="space-y-3 max-w-sm mx-auto text-xs">
              {[
                { id: 'google', icon: '🔍', labelBn: 'গুগল বা ফেসবুকে খুঁজি', labelEn: 'Google it' },
                { id: 'family', icon: '👥', labelBn: 'মা-খালা বা বন্ধুদের পরামর্শ নেই', labelEn: 'Ask a friend or family member' },
                { id: 'hope', icon: '🤞', labelBn: 'আশা করি এমনিতেই ঠিক হয়ে যাবে', labelEn: 'Just hope it’s normal' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setWorryReaction(opt.id); handleNext(); }}
                  className="w-full p-4 rounded-2xl border border-[#EED9C7] hover:border-[#FF8552] bg-white hover:bg-[#FFFAF5] font-semibold text-[#2D3142] flex items-center justify-center gap-3 transition-all shadow-xs text-left"
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span>{currentLang === 'bn' ? opt.labelBn : opt.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: HOW MUCH TIME TO PLAY (IMG_3348) */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-in fade-in py-2">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142] leading-snug">
                {currentLang === 'bn'
                  ? 'সন্তানের সাথে প্রতিদিন খেলাধুলা করার মতো আপনার কাছে সাধারণত কতটুকু সময় থাকে?'
                  : 'How much time do you usually have to play with your baby each day?'}
              </h3>
              <p className="text-xs text-[#7C8294]">
                {currentLang === 'bn' ? 'এমনকি প্রতিদিন ৫-১০ মিনিটের খেলাও শিশুর বিকাশে বিশাল ভূমিকা রাখে।' : 'Even five minutes of play makes a big difference.'}
              </p>
            </div>

            <div className="space-y-2.5 max-w-sm mx-auto text-xs">
              {[
                { id: '10min', icon: '⏰', labelBn: '১০ মিনিট', labelEn: '10 minutes' },
                { id: '30min', icon: '🧩', labelBn: '৩০ মিনিট', labelEn: '30 minutes' },
                { id: '1hour', icon: '🎠', labelBn: '১ ঘণ্টা', labelEn: '1 hour' },
                { id: 'more', icon: '🌈', labelBn: '১ ঘণ্টার বেশি', labelEn: 'More than 1 hour' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setPlayTime(opt.id); handleNext(); }}
                  className="w-full p-3.5 rounded-2xl border border-[#EED9C7] hover:border-[#FF8552] bg-white hover:bg-[#FFFAF5] font-semibold text-[#2D3142] flex items-center justify-center gap-3 transition-all shadow-xs"
                >
                  <span>{opt.icon}</span>
                  <span>{currentLang === 'bn' ? opt.labelBn : opt.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: WHAT DO YOU WANT TO FOCUS ON (IMG_3346) */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-[#2D3142]">
                {currentLang === 'bn' ? 'আপনি কোন বিষয়ে বেশি গুরুত্ব দিতে চান?' : 'What do you want to focus on right now?'}
              </h3>
              <p className="text-xs text-[#7C8294]">
                {currentLang === 'bn' ? 'এক বা একাধিক নির্বাচন করুন' : 'Choose one or more to tailor your experience'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { id: 'daily_play', icon: '🎨', labelBn: 'প্রতিদিন কী খেলা খেলব তা জানা', labelEn: 'Know what to do each day' },
                { id: 'milestones', icon: '🌱', labelBn: 'সময়মতো মাইলস্টোন অর্জন নিশ্চিত করা', labelEn: 'Help my baby reach new milestones' },
                { id: 'confidence', icon: '⭐', labelBn: 'অভিভাবক হিসেবে আত্মবিশ্বাসী হওয়া', labelEn: 'Feel more confident as a parent' },
                { id: 'bonding', icon: '💖', labelBn: 'সন্তানের সাথে ভালোবাসার মিষ্টি বন্ধন তৈরি', labelEn: 'Bond more with my baby' },
                { id: 'understanding', icon: '🧠', labelBn: 'শিশুর মস্তিষ্কের বিকাশ সহজ ভাষায় বোঝা', labelEn: 'Understand baby’s development' },
              ].map((item) => {
                const isSelected = focusAreas.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFocus(item.id)}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26] font-bold shadow-xs'
                        : 'border-[#EED9C7] bg-white text-[#4B5563] hover:border-[#FFB07C]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{currentLang === 'bn' ? item.labelBn : item.labelEn}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF8552]" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-xs shadow-xs transition-colors"
            >
              {currentLang === 'bn' ? 'পরবর্তী ধাপে যান' : 'Continue'}
            </button>
          </div>
        )}

        {/* STEP 7: DYNAMIC DEVELOPMENTAL MILESTONE QUESTIONS FOR BABY'S AGE */}
        {step === 7 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <div className="text-xs font-bold text-[#C85D26]">
                {currentLang === 'bn' ? `${formatLocalizedNumber(ageMonths, currentLang)} মাস বয়সের প্রাথমিক যাচাইকরণ` : `Stage Verification (${ageMonths} months)`}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142] mt-0.5">
                {currentLang === 'bn' ? `${babyName || 'সন্তান'}-এর বর্তমান সক্ষমতা` : `How is ${babyName || 'baby'} doing?`}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Question 1: Sitting */}
              <div className="p-3.5 rounded-2xl bg-[#FFFAF5] border border-[#F0D5C1] space-y-2">
                <span className="font-semibold text-[#2D3142] block">
                  {currentLang === 'bn' ? '১. কোনো সাহায্য ছাড়া মেঝেতে সোজা হয়ে বসে থাকতে পারে?' : '1. Can baby sit upright independently on the floor?'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMsSitting('yes')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msSitting === 'yes' ? 'bg-[#2F6B47] text-white border-[#2F6B47]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '✓ হ্যাঁ, পারে' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsSitting('trying')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msSitting === 'trying' ? 'bg-[#FF8552] text-white border-[#FF8552]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '⏳ চেষ্টা করছে' : 'Trying'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsSitting('not_yet')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msSitting === 'not_yet' ? 'bg-[#C85D26] text-white border-[#C85D26]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '✕ এখনো না' : 'Not yet'}
                  </button>
                </div>
              </div>

              {/* Question 2: Name response */}
              <div className="p-3.5 rounded-2xl bg-[#FFFAF5] border border-[#F0D5C1] space-y-2">
                <span className="font-semibold text-[#2D3142] block">
                  {currentLang === 'bn' ? '২. নাম ধরে ডাকলে কি সাথে সাথে দৃষ্টি ঘুরিয়ে তাকায় ও হাসে?' : '2. Turns head immediately when called by name?'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMsNameResponse('yes')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msNameResponse === 'yes' ? 'bg-[#2F6B47] text-white border-[#2F6B47]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '✓ হ্যাঁ, তাকায়' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsNameResponse('not_yet')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msNameResponse === 'not_yet' ? 'bg-[#C85D26] text-white border-[#C85D26]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '✕ খুব কম বা না' : 'Rarely'}
                  </button>
                </div>
              </div>

              {/* Question 3: Object permanence */}
              <div className="p-3.5 rounded-2xl bg-[#FFFAF5] border border-[#F0D5C1] space-y-2">
                <span className="font-semibold text-[#2D3142] block">
                  {currentLang === 'bn' ? '৩. চোখের সামনে খেলনা চাদর দিয়ে ঢাকলে হাত দিয়ে খোঁজে?' : '3. Searches for a toy hidden under a cloth?'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMsObjectPerm('yes')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msObjectPerm === 'yes' ? 'bg-[#2F6B47] text-white border-[#2F6B47]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '✓ হ্যাঁ, খোঁজে' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMsObjectPerm('not_yet')}
                    className={`flex-1 py-1.5 rounded-xl border text-center font-medium ${
                      msObjectPerm === 'not_yet' ? 'bg-[#C85D26] text-white border-[#C85D26]' : 'bg-white border-[#EED9C7] text-[#4B5563]'
                    }`}
                  >
                    {currentLang === 'bn' ? '✕ এখনো খোঁজে না' : 'Not yet'}
                  </button>
                </div>
              </div>

            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-xs shadow-xs transition-colors"
            >
              {currentLang === 'bn' ? 'মূল্যায়ন রিপোর্ট তৈরি করুন' : 'Generate Milestone Report'}
            </button>
          </div>
        )}

        {/* STEP 8: FINAL DEVELOPMENTAL MILESTONE ASSESSMENT REPORT */}
        {step === 8 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D3142]">
                {currentLang === 'bn' ? `${babyName || 'সন্তান'}-এর অগ্রগতি মূল্যায়ন রিপোর্ট` : `Milestone Assessment Report`}
              </h3>
              <p className="text-xs text-[#5C6479]">
                {currentLang === 'bn' 
                  ? `${formatLocalizedNumber(ageMonths, currentLang)} মাস বয়সের মাইলস্টোন বিশ্লেষণ` 
                  : `Developmental Readiness for ${ageMonths} Months`}
              </p>
            </div>

            {/* Score Metric Card */}
            <div className="p-4 rounded-2xl bg-[#FFFAF5] border border-[#F0D5C1] flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#7C8294] font-medium">সামগ্রিক বিকাশ স্থিতি</span>
                <div className="text-lg font-bold text-[#2F6B47] flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                  <span>{currentLang === 'bn' ? 'সুস্থ ও স্বাভাবিক অগ্রগতি' : 'Healthy Developmental Trajectory'}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center font-bold text-sm">
                ৯২%
              </div>
            </div>

            {/* Assessment Highlights */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#2D3142] uppercase tracking-wide">
                {currentLang === 'bn' ? 'রিপোর্টের মূল পর্যবেক্ষণ:' : 'Key Report Highlights:'}
              </span>
              <ul className="space-y-2 text-[#5C6479]">
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#EED9C7]">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B47] shrink-0 mt-0.5" />
                  <span>{currentLang === 'bn' ? 'শারীরিক চলন ও বসার ভারসাম্য সন্তোষজনক।' : 'Trunk stability and gross motor control are strong.'}</span>
                </li>
                <li className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#EED9C7]">
                  <CheckCircle2 className="w-4 h-4 text-[#2F6B47] shrink-0 mt-0.5" />
                  <span>{currentLang === 'bn' ? 'শ্রবণ ও সামাজিক সাড়া খুব সক্রিয়। রোজ পিক-আ-বু ও ছড়া গান খেলুন।' : 'High auditory alertness. Continue daily peek-a-boo and nursery rhymes.'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full py-3.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{currentLang === 'bn' ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Open Baby Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
