import React, { useState } from 'react';
import { Users, X, Check, Copy, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { ChildProfile, Language } from '../types';

interface PartnerCodeModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  onLinkPartnerCode: (code: string) => boolean | Promise<boolean>;
}

export const PartnerCodeModal: React.FC<PartnerCodeModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  activeChild,
  onLinkPartnerCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;
  const currentPartnerCode = activeChild.partnerCode || 'KUCHU-8821';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentPartnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const success = await onLinkPartnerCode(inputCode.trim().toUpperCase());
    if (success) {
      setFeedbackMsg({
        type: 'success',
        text: currentLang === 'bn' 
          ? 'অভিনন্দন! সফলভাবে পার্টনার হিসেবে যুক্ত হয়েছেন। এখন উভয় অভিভাবকই একসাথে দেখতে ও ইনপুট দিতে পারবেন।'
          : 'Success! Linked as co-parent. Both parents can now view and log entries simultaneously.'
      });
      setInputCode('');
    } else {
      setFeedbackMsg({
        type: 'error',
        text: currentLang === 'bn' 
          ? 'দুঃখিত, কোডটি সঠিক নয়। অনুগ্রহ করে অন্য অভিভাবকের কাছ থেকে কোডটি মিলিয়ে নিন (যেমন: KUCHU-8821)।'
          : 'Invalid partner code. Please verify with your spouse (e.g., KUCHU-8821).'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full border border-[#EED9C7] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFF0E2] to-[#FAF4ED] p-6 border-b border-[#F0D5C1] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#7C8294] hover:text-[#2D3142] hover:bg-white/80 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-[#FF8552]" />
            <span>{currentLang === 'bn' ? 'মা-বাবার যৌথ পেরেন্টিং' : 'Dual Co-Parenting'}</span>
          </div>

          <h3 className="text-xl font-bold text-[#2D3142]">
            {currentLang === 'bn' ? 'পার্টনার কোড ও পরিবার শেয়ার' : 'Family Partner Code'}
          </h3>
          <p className="text-xs text-[#5C6479] mt-1">
            {currentLang === 'bn'
              ? '১টি প্রোফাইলে মা ও বাবা উভয়ই আলাদা ফোন বা কম্পিউটার থেকে লগইন করে সন্তানের বিকাশ ট্র্যাক ও ইনপুট দিতে পারেন।'
              : 'Link both parents to 1 baby profile so you can both view milestones and log growth.'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Section 1: Your Child's Shareable Code */}
          <div className="bg-[#FFFAF5] p-4 rounded-2xl border border-[#F0D5C1] space-y-3">
            <div className="text-xs font-semibold text-[#8C6D53]">
              {currentLang === 'bn' 
                ? `${childName}-এর বর্তমান পার্টনার কোড:` 
                : `${childName}'s Shareable Partner Code:`}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-[#EED9C7] font-mono text-base font-bold text-[#C85D26] tracking-wider text-center select-all">
                {currentPartnerCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (currentLang === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (currentLang === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>

            <div className="text-[11px] text-[#7C8294]">
              {currentLang === 'bn'
                ? 'এই কোডটি আপনার জীবনসঙ্গী বা পার্টনারকে হোয়াটসঅ্যাপ বা মেসেজে পাঠিয়ে দিন।'
                : 'Send this code to your spouse or co-parent to connect their account.'}
            </div>
          </div>

          {/* Section 2: Join via Partner Code */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#2D3142] uppercase tracking-wide">
              {currentLang === 'bn' ? 'আপনি কি অন্য অভিভাবকের কোড পেয়েছেন?' : 'Have a Partner Code to Link?'}
            </h4>

            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <input
                type="text"
                placeholder={currentLang === 'bn' ? 'যেমন: KUCHU-8821' : 'e.g. KUCHU-8821'}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EED9C7] text-sm font-mono uppercase focus:ring-2 focus:ring-[#FF8552] focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2F6B47] hover:bg-[#255638] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>{currentLang === 'bn' ? 'কোড দিয়ে প্রোফাইলে যুক্ত হন' : 'Link Profile with Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              feedbackMsg.type === 'success' 
                ? 'bg-[#EAF4EC] text-[#2F6B47] border border-[#CDE5D1]' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedbackMsg.text}
            </div>
          )}

          {/* Linked co-parents */}
          {activeChild.linkedPartners && activeChild.linkedPartners.length > 0 && (
            <div className="pt-2 border-t border-[#F3E7DC] space-y-1.5">
              <span className="text-[11px] font-bold text-[#7C8294] uppercase tracking-wide">
                {currentLang === 'bn' ? 'যুক্ত থাকা অভিভাবকবৃন্দ:' : 'Active Linked Parents:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {activeChild.linkedPartners.map((partner, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF4ED] text-[#8C6D53] text-xs font-medium border border-[#EED9C7]">
                    <Heart className="w-3 h-3 text-[#FF8552] fill-[#FF8552]" />
                    <span>{partner}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="p-4 bg-[#FAF4ED] border-t border-[#EED9C7] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white text-[#2D3142] hover:bg-[#FAF4ED] border border-[#EED9C7] rounded-xl text-xs font-semibold transition-colors"
          >
            {currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
