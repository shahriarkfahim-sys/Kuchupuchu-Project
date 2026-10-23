import React, { useState } from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Shirt, 
  ShieldAlert, 
  X, 
  MapPin, 
  CheckCircle2, 
  ThermometerSun, 
  Info,
  Sparkles
} from 'lucide-react';
import { ChildProfile, Language, WeatherAdvisory } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

interface WeatherModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  weatherData: WeatherAdvisory;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  activeChild,
  weatherData,
}) => {
  const [selectedCity, setSelectedCity] = useState<'Dhaka' | 'Chittagong' | 'Sylhet'>('Dhaka');

  if (!isOpen) return null;

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full border border-[#EED9C7] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-[#FFF0E2] via-[#FFE4D3] to-[#FAF4ED] p-6 border-b border-[#F0D5C1] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#7C8294] hover:text-[#2D3142] hover:bg-white/80 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26] uppercase tracking-wider mb-1">
            <CloudSun className="w-4 h-4 text-[#FF8552]" />
            <span>{currentLang === 'bn' ? 'আজকের আবহাওয়া ও যত্ন সতর্কতা' : "Today's Weather & Baby Care Advice"}</span>
          </div>

          <h3 className="text-xl font-bold text-[#2D3142]">
            {currentLang === 'bn'
              ? `${childName}-এর জন্য আজকের আবহাওয়া প্রস্তুতি`
              : `Weather Preparation for ${childName}`}
          </h3>

          <div className="flex items-center gap-3 mt-3 text-xs text-[#5C6479]">
            <div className="flex items-center gap-1 font-semibold text-[#2D3142] bg-white/70 px-2.5 py-1 rounded-xl border border-[#F0D5C1]">
              <MapPin className="w-3.5 h-3.5 text-[#FF8552]" />
              <span>{currentLang === 'bn' ? weatherData.cityBn : weatherData.cityEn}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-[#C85D26] bg-white/70 px-2.5 py-1 rounded-xl border border-[#F0D5C1]">
              <ThermometerSun className="w-3.5 h-3.5" />
              <span>{formatLocalizedNumber(weatherData.tempCelsius, currentLang)}°C</span>
            </div>
            <div className="flex items-center gap-1 text-[#2F6B47] font-medium bg-white/70 px-2.5 py-1 rounded-xl border border-[#F0D5C1]">
              <Droplets className="w-3.5 h-3.5" />
              <span>{currentLang === 'bn' ? weatherData.conditionBn : weatherData.conditionEn}</span>
            </div>
          </div>
        </div>

        {/* Content body with specific advice */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* 1. Clothing & Skin Care */}
          <div className="p-4 rounded-2xl bg-[#FFFAF5] border border-[#F0D5C1] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26]">
              <Shirt className="w-4 h-4 text-[#FF8552]" />
              <span>{currentLang === 'bn' ? 'পোশাক ও আরাম' : 'Clothing & Comfort'}</span>
            </div>
            <p className="text-xs text-[#2D3142] leading-relaxed">
              {currentLang === 'bn' ? weatherData.clothingTipBn : weatherData.clothingTipEn}
            </p>
          </div>

          {/* 2. Hydration & Feeding */}
          <div className="p-4 rounded-2xl bg-[#EAF4EC]/60 border border-[#CDE5D3] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B47]">
              <Droplets className="w-4 h-4 text-[#2F6B47]" />
              <span>{currentLang === 'bn' ? 'পানি ও পুষ্টি সতর্কতা' : 'Hydration & Nutrition'}</span>
            </div>
            <p className="text-xs text-[#2D3142] leading-relaxed">
              {currentLang === 'bn' ? weatherData.fluidCareTipBn : weatherData.fluidCareTipEn}
            </p>
          </div>

          {/* 3. Indoor/Outdoor Play Advice */}
          <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#EED9C7] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D53]">
              <Wind className="w-4 h-4 text-[#8C6D53]" />
              <span>{currentLang === 'bn' ? 'বাতাস ও খেলার সতর্কতা' : 'Play & Outdoor Protection'}</span>
            </div>
            <p className="text-xs text-[#2D3142] leading-relaxed">
              {currentLang === 'bn' ? weatherData.activitySafetyTipBn : weatherData.activitySafetyTipEn}
            </p>
          </div>

          {/* Air Quality & Mosquito Alert */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {currentLang === 'bn'
                ? 'সন্ধ্যায় মশার উপদ্রব এড়াতে জানালার নেট দিন বা মশারি টানিয়ে রাখুন। ধূপ বা কয়েলের ধোঁয়া থেকে শিশুকে দূরে রাখুন।'
                : 'Keep windows netted or use mosquito nets around twilight. Keep incense/coils away from baby lungs.'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF4ED] border-t border-[#EED9C7] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#7C8294] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#C85D26]" />
            <span>{currentLang === 'bn' ? 'প্রতিদিন সকালে আবহাওয়া পর্যবেক্ষণ করা হয়' : 'Updated daily for your location'}</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{currentLang === 'bn' ? 'ধন্যবাদ, মনে রাখব' : 'Got it, thank you'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
