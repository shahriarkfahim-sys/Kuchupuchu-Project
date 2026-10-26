import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  ArrowRight, 
  CreditCard,
  Download,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { Language, UserSubscription, SubscriptionPlanType } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

interface SubscriptionModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSaveSubscription: (sub: UserSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  subscription,
  onSaveSubscription,
}) => {
  // Step in bKash checkout: 'select_plan' | 'bkash_number' | 'bkash_pin' | 'processing' | 'success'
  const [checkoutStep, setCheckoutStep] = useState<'select_plan' | 'bkash_number' | 'bkash_pin' | 'processing' | 'success'>('select_plan');
  
  // Selected plan: 'monthly' (89 BDT) or 'yearly' (499 BDT)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('yearly');
  
  // Promo code
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent?: number; discountFlat?: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // bKash credentials
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashOtp, setBkashOtp] = useState('');
  const [bkashPin, setBkashPin] = useState('');
  const [trxId, setTrxId] = useState('');
  const [bkashError, setBkashError] = useState('');

  if (!isOpen) return null;

  // Base pricing
  const baseMonthlyPrice = 89;
  const baseYearlyPrice = 499;
  const basePrice = selectedPlan === 'monthly' ? baseMonthlyPrice : baseYearlyPrice;

  // Calculate discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = Math.round((basePrice * appliedPromo.discountPercent) / 100);
    } else if (appliedPromo.discountFlat) {
      discountAmount = Math.min(basePrice, appliedPromo.discountFlat);
    }
  }
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Calculate remaining trial days
  const trialEnd = new Date(subscription.trialEndDate);
  const now = new Date();
  const diffTime = trialEnd.getTime() - now.getTime();
  const remainingTrialDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isTrialActive = subscription.status === 'trial' && remainingTrialDays > 0;
  const isPaidActive = subscription.status === 'active';

  // Apply promo code
  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'BRAC50') {
      setAppliedPromo({ code: clean, discountPercent: 50 });
      setPromoSuccess(currentLang === 'bn' ? '৫০% ছাড় সফলভাবে প্রয়োগ হয়েছে!' : '50% discount applied successfully!');
    } else if (clean === 'KUCHU20') {
      setAppliedPromo({ code: clean, discountPercent: 20 });
      setPromoSuccess(currentLang === 'bn' ? '২০% ছাড় সফলভাবে প্রয়োগ হয়েছে!' : '20% discount applied successfully!');
    } else if (clean === 'FREE100' || clean === 'SHISHU100') {
      setAppliedPromo({ code: clean, discountPercent: 100 });
      setPromoSuccess(currentLang === 'bn' ? '১০০% ফ্রি প্রোমো কোড প্রযোজ্য হয়েছে!' : '100% Free Promo applied!');
    } else if (clean === 'EID100' || clean === 'KUCHU100') {
      setAppliedPromo({ code: clean, discountFlat: 100 });
      setPromoSuccess(currentLang === 'bn' ? '৳১০০ ফ্ল্যাট ছাড় প্রযোজ্য হয়েছে!' : '৳100 flat discount applied!');
    } else {
      setPromoError(currentLang === 'bn' ? 'দুঃখিত, এই প্রোমো কোডটি সঠিক নয়। (চেষ্টা করুন: BRAC50 বা KUCHU20)' : 'Invalid promo code. (Try: BRAC50 or KUCHU20)');
    }
  };

  // Start bKash Payment
  const handleProceedToBkash = () => {
    setBkashError('');
    setCheckoutStep('bkash_number');
  };

  // Confirm bKash Number
  const handleConfirmBkashNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = bkashNumber.replace(/\D/g, '');
    if (cleanNumber.length < 11) {
      setBkashError(currentLang === 'bn' ? '১১ ডিজিটের সঠিক বিকাশ নম্বর দিন (যেমন: 017XXXXXXXX)' : 'Please enter valid 11-digit bKash number');
      return;
    }
    setBkashError('');
    setCheckoutStep('bkash_pin');
  };

  // Complete Payment with PIN
  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bkashPin || bkashPin.length < 4) {
      setBkashError(currentLang === 'bn' ? 'সঠিক বিকাশ পিন (PIN) দিন' : 'Enter valid bKash PIN');
      return;
    }
    setBkashError('');
    setCheckoutStep('processing');

    setTimeout(() => {
      const generatedTrxId = `BKSH${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
      setTrxId(generatedTrxId);

      const startDate = new Date();
      const endDate = new Date();
      if (selectedPlan === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const updatedSubscription: UserSubscription = {
        ...subscription,
        status: 'active',
        plan: selectedPlan,
        subscriptionStartDate: startDate.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        paidAmount: finalPrice,
        originalAmount: basePrice,
        discountAmount: discountAmount,
        promoCode: appliedPromo?.code,
        bkashNumber: bkashNumber || '01712-345678',
        bkashTrxId: generatedTrxId,
      };

      onSaveSubscription(updatedSubscription);
      setCheckoutStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D3142]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#EED9C7] shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#FFF0E2] via-[#FFFAF5] to-[#FFEBE4] px-6 py-5 border-b border-[#F0D5C1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8552] to-[#FFB07C] flex items-center justify-center text-white shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#2D3142] flex items-center gap-2">
                <span>{currentLang === 'bn' ? 'কুচুপুচু সাবস্ক্রিপশন প্ল্যান' : 'Kuchupuchu Subscription'}</span>
              </h3>
              <p className="text-xs text-[#7C8294]">
                {currentLang === 'bn' ? 'প্রথম ৩০ দিন সম্পূর্ণ ফ্রি · এরপর মাসিক বা বার্ষিক প্যাকেজ' : 'First 30 days free · Then choose a monthly or yearly plan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-[#7C8294] hover:text-[#2D3142] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* STEP 1: Select Plan & Apply Promo */}
          {checkoutStep === 'select_plan' && (
            <div className="space-y-6">
              
              {/* Active Trial Notice Banner */}
              {isPaidActive ? (
                <div className="bg-[#EAF4EC] border border-[#C5E5CE] p-4 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#2F6B47] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#2F6B47] block text-sm">
                      {currentLang === 'bn' ? 'আপনার প্রিমিয়াম সাবস্ক্রিপশন সক্রিয় রয়েছে' : 'Your Premium Subscription is Active'}
                    </span>
                    <span className="text-[#3A5643] block mt-0.5">
                      {currentLang === 'bn' 
                        ? `প্ল্যান: ${subscription.plan === 'yearly' ? 'বার্ষিক (৳৪৯৯)' : 'মাসিক (৳৮৯)'} · বিকাশ ট্রানজেকশন আইডি: ${subscription.bkashTrxId || 'N/A'}`
                        : `Plan: ${subscription.plan === 'yearly' ? 'Yearly (৳499)' : 'Monthly (৳89)'} · bKash TrxID: ${subscription.bkashTrxId || 'N/A'}`}
                    </span>
                  </div>
                </div>
              ) : isTrialActive ? (
                <div className="bg-[#FFF4E5] border border-[#FFD9B3] p-4 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#FF8552] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#C85D26] block text-sm">
                      {currentLang === 'bn' 
                        ? `🎉 আপনার ৩০ দিনের ফ্রি ট্রায়াল চলছে! (বাকি ${formatLocalizedNumber(remainingTrialDays, currentLang)} দিন)`
                        : `🎉 Your 30-day free trial is active! (${remainingTrialDays} days remaining)`}
                    </span>
                    <span className="text-[#8C6D53] block mt-0.5">
                      {currentLang === 'bn' 
                        ? 'ফ্রি ট্রায়ালের পরও সেবা চালু রাখতে বিকাশ (bKash) দিয়ে যেকোনো সময় সাবস্ক্রাইব করতে পারেন।'
                        : 'Subscribe anytime via bKash to keep using the service after your free trial.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFF0F0] border border-[#FFCDD2] p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-[#D32F2F] block text-sm">
                      {currentLang === 'bn' ? 'আপনার ৩০ দিনের ফ্রি ট্রায়াল সমাপ্ত হয়েছে' : 'Your 30-day free trial has expired'}
                    </span>
                    <span className="text-[#853434] block mt-0.5">
                      {currentLang === 'bn'
                        ? 'অগ্রগতি গ্রাফ, আজকের খেলা ও ডায়েরি পুনরায় ব্যবহার করতে বিকাশ দিয়ে মাসিক বা বার্ষিক সাবস্ক্রিপশন নিন।'
                        : 'Renew via bKash to regain access to growth curves, daily activities, and routine diary.'}
                    </span>
                  </div>
                </div>
              )}

              {/* 2 Plan Cards (Monthly vs Yearly) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#2D3142] uppercase tracking-wider block">
                  {currentLang === 'bn' ? 'সাবস্ক্রিপশন প্যাকেজ নির্বাচন করুন:' : 'Select Subscription Package:'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Monthly Plan: 89 BDT */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                      selectedPlan === 'monthly'
                        ? 'border-[#FF8552] bg-[#FFF8F3] shadow-xs'
                        : 'border-[#EED9C7] bg-white hover:border-[#FFB07C]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#2D3142]">
                        {currentLang === 'bn' ? 'মাসিক প্যাকেজ' : 'Monthly Plan'}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'monthly' ? 'border-[#FF8552] bg-[#FF8552]' : 'border-gray-300'
                      }`}>
                        {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-2xl font-black text-[#2D3142]">
                        {currentLang === 'bn' ? `৳${formatLocalizedNumber(baseMonthlyPrice, currentLang)}` : `৳${baseMonthlyPrice}`}
                      </span>
                      <span className="text-xs text-[#7C8294]">
                        {currentLang === 'bn' ? '/ প্রতি মাস' : '/ month'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5C6479] mt-2 leading-relaxed">
                      {currentLang === 'bn' 
                        ? 'ফ্রি ট্রায়ালের পর প্রতি মাসে নবায়নযোগ্য। যেকোনো সময় বাতিল করা যাবে।' 
                        : 'Billed monthly after the free trial. Cancel anytime.'}
                    </p>
                  </div>

                  {/* Yearly Plan: 499 BDT (Best Value) */}
                  <div
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                      selectedPlan === 'yearly'
                        ? 'border-[#FF8552] bg-[#FFF8F3] shadow-xs'
                        : 'border-[#EED9C7] bg-white hover:border-[#FFB07C]'
                    }`}
                  >
                    {/* Best Value Badge */}
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FF8552] to-[#FF9F68] text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                      {currentLang === 'bn' ? '৫৩% সাশ্রয়ী · সেরা ডিল' : 'SAVE 53% · POPULAR'}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#2D3142]">
                        {currentLang === 'bn' ? 'বার্ষিক প্যাকেজ' : 'Yearly Plan'}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'yearly' ? 'border-[#FF8552] bg-[#FF8552]' : 'border-gray-300'
                      }`}>
                        {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="text-2xl font-black text-[#2D3142]">
                        {currentLang === 'bn' ? `৳${formatLocalizedNumber(baseYearlyPrice, currentLang)}` : `৳${baseYearlyPrice}`}
                      </span>
                      <span className="text-xs text-[#7C8294]">
                        {currentLang === 'bn' ? '/ পুরো বছর' : '/ year'}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        {currentLang === 'bn' ? 'মাসিক গড়ে ৳৪২' : 'About ৳42/mo'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5C6479] mt-2 leading-relaxed">
                      {currentLang === 'bn' 
                        ? '৩৬৫ দিনের সম্পূর্ণ আনলিমিটেড এক্সেস। কোনো মাসিক বিলের ঝামেলা নেই।' 
                        : 'Full 365 days unlimited access. No monthly renewal hassle.'}
                    </p>
                  </div>

                </div>
              </div>

              {/* Promo Code Input Section */}
              <div className="bg-[#FAF5EF] p-4 rounded-2xl border border-[#F0D5C1] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#8C6D53] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#FF8552]" />
                    <span>{currentLang === 'bn' ? 'ডিসকাউন্ট প্রোমো কোড (Promo Code):' : 'Discount Promo Code:'}</span>
                  </label>
                  <span className="text-[10px] text-[#7C8294]">
                    {currentLang === 'bn' ? 'যেমন: BRAC50 বা KUCHU20' : 'e.g. BRAC50 or KUCHU20'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError(null);
                    }}
                    placeholder={currentLang === 'bn' ? 'প্রোমো কোড লিখুন' : 'Enter promo code'}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#EED9C7] bg-white text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#FF8552]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-[#2D3142] hover:bg-[#1E222D] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {currentLang === 'bn' ? 'প্রয়োগ করুন' : 'Apply'}
                  </button>
                </div>

                {promoSuccess && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    ✓ {promoSuccess}
                  </p>
                )}

                {promoError && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    ✕ {promoError}
                  </p>
                )}
              </div>

              {/* Price Breakdown & Only-bKash Indicator */}
              <div className="border-t border-[#F0D5C1] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#7C8294]">
                  <span>{currentLang === 'bn' ? 'প্যাকেজ মূল্য' : 'Base Price'}</span>
                  <span>৳{formatLocalizedNumber(basePrice, currentLang)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>{currentLang === 'bn' ? `প্রোমো কোড ছাড় (${appliedPromo?.code})` : `Promo Discount (${appliedPromo?.code})`}</span>
                    <span>-৳{formatLocalizedNumber(discountAmount, currentLang)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-[#EED9C7] text-sm font-bold text-[#2D3142]">
                  <span>{currentLang === 'bn' ? 'সর্বমোট প্রদেয় টাকা' : 'Total Payable'}</span>
                  <div className="flex items-baseline gap-2">
                    {discountAmount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{formatLocalizedNumber(basePrice, currentLang)}
                      </span>
                    )}
                    <span className="text-xl font-black text-[#E2136E]">
                      ৳{formatLocalizedNumber(finalPrice, currentLang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Box: ONLY bKash */}
              <div className="bg-[#FFF0F6] border-2 border-[#E2136E]/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-xl bg-[#E2136E] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                    bKash
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2D3142] block">
                      {currentLang === 'bn' ? 'শুধুমাত্র বিকাশ (bKash) পেমেন্ট' : 'Exclusive bKash Payment'}
                    </span>
                    <span className="text-[11px] text-[#7C8294] block">
                      {currentLang === 'bn' ? 'বিকাশ ওয়ালেট থেকে সরাসরি নিরাপদ ও তাৎক্ষণিক অ্যাকটিভেশন' : 'Instant and secure activation via bKash Wallet'}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-bold bg-[#E2136E]/10 text-[#E2136E] px-2 py-0.5 rounded-full">
                    Official Partner
                  </span>
                </div>
              </div>

              {/* Proceed to bKash Checkout Button */}
              <button
                type="button"
                onClick={handleProceedToBkash}
                className="w-full py-3.5 px-4 bg-[#E2136E] hover:bg-[#D00F62] text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {currentLang === 'bn' 
                    ? `বিকাশ (bKash) দিয়ে ৳${formatLocalizedNumber(finalPrice, currentLang)} পে করুন` 
                    : `Pay ৳${finalPrice} with bKash`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

          {/* STEP 2: bKash Gateway - Enter Mobile Number */}
          {checkoutStep === 'bkash_number' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* bKash Official Gateway Header */}
              <div className="bg-[#E2136E] text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-black text-xl tracking-tight">bKash</div>
                  <div className="text-[11px] opacity-90">Payment Gateway · Kuchupuchu Subscription</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">{currentLang === 'bn' ? 'পরিশোধযোগ্য' : 'Amount'}</div>
                  <div className="text-xl font-bold">৳{formatLocalizedNumber(finalPrice, currentLang)}</div>
                </div>
              </div>

              <form onSubmit={handleConfirmBkashNumber} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#2D3142]">
                    {currentLang === 'bn' ? 'আপনার বিকাশ অ্যাকাউন্ট নম্বর দিন:' : 'Enter your bKash Account Number:'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={11}
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#EED9C7] focus:border-[#E2136E] focus:outline-none font-mono text-base font-bold tracking-widest text-[#2D3142]"
                    />
                  </div>
                  <p className="text-[11px] text-[#7C8294]">
                    {currentLang === 'bn' ? 'যেমন: 01712345678 বা 01812345678' : 'e.g. 01712345678 or 01812345678'}
                  </p>
                </div>

                {bkashError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    ✕ {bkashError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('select_plan')}
                    className="flex-1 py-3 px-4 border border-[#EED9C7] hover:bg-gray-50 text-[#2D3142] font-semibold rounded-xl text-xs transition-colors"
                  >
                    {currentLang === 'bn' ? 'পিছনে যান' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#E2136E] hover:bg-[#D00F62] text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    {currentLang === 'bn' ? 'পরবর্তী ধাপ (OTP)' : 'Next Step (OTP)'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: bKash Gateway - Enter OTP and PIN */}
          {checkoutStep === 'bkash_pin' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#E2136E] text-white p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-black text-xl tracking-tight">bKash</div>
                  <div className="text-[11px] opacity-90">{bkashNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80">{currentLang === 'bn' ? 'পরিশোধযোগ্য' : 'Amount'}</div>
                  <div className="text-xl font-bold">৳{formatLocalizedNumber(finalPrice, currentLang)}</div>
                </div>
              </div>

              <form onSubmit={handleCompletePayment} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#2D3142]">
                      {currentLang === 'bn' ? 'যাচাইকরণ কোড (OTP):' : 'Verification Code (OTP):'}
                    </label>
                    <span className="text-[10px] text-[#E2136E] font-semibold cursor-pointer" onClick={() => setBkashOtp('849201')}>
                      {currentLang === 'bn' ? 'অটো-ফিল (849201)' : 'Auto-fill (849201)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={bkashOtp}
                    onChange={(e) => setBkashOtp(e.target.value)}
                    placeholder="849201"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EED9C7] focus:border-[#E2136E] focus:outline-none font-mono text-center text-sm font-bold tracking-widest text-[#2D3142]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#2D3142]">
                    {currentLang === 'bn' ? 'বিকাশ পিন (PIN):' : 'bKash PIN:'}
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    maxLength={5}
                    value={bkashPin}
                    onChange={(e) => setBkashPin(e.target.value)}
                    placeholder="•••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EED9C7] focus:border-[#E2136E] focus:outline-none font-mono text-center text-lg font-bold tracking-widest text-[#2D3142]"
                  />
                  <p className="text-[10px] text-center text-[#7C8294]">
                    🔒 {currentLang === 'bn' ? 'নিরাপদ ১০০% এনক্রিপ্টেড পেমেন্ট প্রোটোকল' : '100% Encrypted Payment Protocol'}
                  </p>
                </div>

                {bkashError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    ✕ {bkashError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('bkash_number')}
                    className="flex-1 py-3 px-4 border border-[#EED9C7] hover:bg-gray-50 text-[#2D3142] font-semibold rounded-xl text-xs transition-colors"
                  >
                    {currentLang === 'bn' ? 'পিছনে' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-[#E2136E] hover:bg-[#D00F62] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    {currentLang === 'bn' ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Processing State */}
          {checkoutStep === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-150">
              <div className="w-16 h-16 rounded-full border-4 border-[#E2136E]/20 border-t-[#E2136E] animate-spin" />
              <div className="text-center">
                <div className="font-bold text-base text-[#2D3142]">
                  {currentLang === 'bn' ? 'বিকাশ পেমেন্ট প্রসেসিং হচ্ছে...' : 'Processing bKash payment...'}
                </div>
                <div className="text-xs text-[#7C8294] mt-1">
                  {currentLang === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন, উইন্ডোটি বন্ধ করবেন না' : 'Please wait, do not close this window'}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Receipt */}
          {checkoutStep === 'success' && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? 'সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে!' : 'Subscription Activated Successfully!'}
                </h4>
                <p className="text-xs text-[#5C6479]">
                  {currentLang === 'bn' 
                    ? 'কুচুপুচুর সম্পূর্ণ প্রিমিয়াম ফিচার এখন আপনার ও আপনার সন্তানের জন্য উন্মুক্ত।' 
                    : 'All premium features of Kuchupuchu are now unlocked for you and your baby.'}
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#FAF5EF] p-5 rounded-2xl border border-[#EED9C7] text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#EED9C7] font-bold text-[#2D3142]">
                  <span>{currentLang === 'bn' ? 'বিকাশ পেমেন্ট রিসিট' : 'bKash Payment Receipt'}</span>
                  <span className="font-mono text-[#E2136E] font-bold">{trxId}</span>
                </div>
                <div className="flex justify-between text-[#7C8294]">
                  <span>{currentLang === 'bn' ? 'নির্বাচিত প্ল্যান' : 'Plan'}</span>
                  <span className="font-semibold text-[#2D3142]">
                    {selectedPlan === 'yearly' ? (currentLang === 'bn' ? 'বার্ষিক প্যাকেজ (১ বছর)' : 'Yearly (1 Year)') : (currentLang === 'bn' ? 'মাসিক প্যাকেজ (১ মাস)' : 'Monthly (1 Month)')}
                  </span>
                </div>
                <div className="flex justify-between text-[#7C8294]">
                  <span>{currentLang === 'bn' ? 'পরিশোধিত অর্থ' : 'Amount Paid'}</span>
                  <span className="font-bold text-[#2D3142]">৳{formatLocalizedNumber(finalPrice, currentLang)}</span>
                </div>
                <div className="flex justify-between text-[#7C8294]">
                  <span>{currentLang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</span>
                  <span className="font-semibold text-[#E2136E]">bKash Wallet</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                {currentLang === 'bn' ? 'অ্যাপে ফিরে যান' : 'Back to App'}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
