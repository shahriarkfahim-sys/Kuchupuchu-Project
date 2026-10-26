import React from 'react';
import { Lock, Users, LogIn, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface AuthGateCardProps {
  currentLang: Language;
  tabTitle: string;
  tabDescription: string;
  onOpenLogin: () => void;
  onOpenParentCode: () => void;
  onOpenRegister: () => void;
}

export const AuthGateCard: React.FC<AuthGateCardProps> = ({
  currentLang,
  tabTitle,
  tabDescription,
  onOpenLogin,
  onOpenParentCode,
  onOpenRegister,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-[#EED9C7] p-8 sm:p-12 text-center shadow-xs space-y-6 animate-in fade-in duration-200">
      
      {/* Icon Badge */}
      <div className="w-16 h-16 rounded-3xl bg-[#FFF0E2] text-[#FF8552] mx-auto flex items-center justify-center border border-[#F0D5C1] shadow-xs">
        <Lock className="w-8 h-8" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4ED] text-[#C85D26] text-xs font-bold border border-[#F0D5C1]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF8552]" />
          <span>{currentLang === 'bn' ? 'সুরক্ষিত তথ্য' : 'Protected Content'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D3142]">
          {tabTitle}
        </h2>

        <p className="text-sm text-[#5C6479] leading-relaxed">
          {tabDescription}
        </p>
      </div>

      {/* Trial Highlight */}
      <div className="bg-[#FFF8F3] border border-[#FFD9B3] p-4 rounded-2xl max-w-md mx-auto text-xs text-[#8C6D53]">
        <span className="font-bold text-[#C85D26] block">
          {currentLang === 'bn' ? '🎉 প্রথম ৩০ দিন সম্পূর্ণ ফ্রি ব্যবহারের সুযোগ!' : '🎉 First 30 Days Completely Free!'}
        </span>
        <span className="block mt-0.5 text-[#5C6479]">
          {currentLang === 'bn' 
            ? 'নতুন অ্যাকাউন্ট খুলে সরাসরি ট্র্যাকিং শুরু করুন অথবা আপনার জীবনসঙ্গীর পেরেন্ট কোড দিয়ে প্রবেশ করুন।' 
            : 'Sign up to start tracking for free, or enter your co-parent code to join instantly.'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
        <button
          onClick={onOpenLogin}
          className="w-full sm:w-auto flex-1 py-3 px-5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-2xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
        </button>

        <button
          onClick={onOpenParentCode}
          className="w-full sm:w-auto flex-1 py-3 px-5 bg-[#2F6B47] hover:bg-[#255437] text-white font-bold rounded-2xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'পেরেন্ট কোড দিন' : 'Enter Parent Code'}</span>
        </button>
      </div>

      <div className="pt-2">
        <button
          onClick={onOpenRegister}
          className="text-xs text-[#7C8294] hover:text-[#C85D26] font-semibold underline underline-offset-4 transition-colors"
        >
          {currentLang === 'bn' ? 'অ্যাকাউন্ট নেই? এখানে ক্লিক করে নতুন অ্যাকাউন্ট খুলুন' : "Don't have an account? Sign up here"}
        </button>
      </div>

    </div>
  );
};
