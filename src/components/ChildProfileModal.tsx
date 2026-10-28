import React, { useState } from 'react';
import { X, Calendar, User, Check, Sparkles } from 'lucide-react';
import { ChildProfile, Language } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';
import { calculateAgeFromBirthDate } from '../utils/ecdAssessment';

interface ChildProfileModalProps {
  currentLang: Language;
  isOpen: boolean;
  onClose: () => void;
  activeChild: ChildProfile;
  onUpdateChild: (updated: Partial<ChildProfile>) => void;
}

export const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  currentLang,
  isOpen,
  onClose,
  activeChild,
  onUpdateChild,
}) => {
  const t = translations[currentLang];
  const [nameBn, setNameBn] = useState(activeChild.nameBn);
  const [nameEn, setNameEn] = useState(activeChild.nameEn);
  const [birthDate, setBirthDate] = useState(activeChild.birthDate);
  const [motherNameBn, setMotherNameBn] = useState(activeChild.motherNameBn);
  const [motherNameEn, setMotherNameEn] = useState(activeChild.motherNameEn);
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { ageMonths, ageDays } = calculateAgeFromBirthDate(birthDate);

    onUpdateChild({
      nameBn,
      nameEn,
      birthDate,
      motherNameBn,
      motherNameEn,
      ageMonths,
      ageDays,
    });

    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3142]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#EED9C7] shadow-2xl p-6 sm:p-8 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#F3E7DC] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE4D3] text-[#C85D26] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2D3142]">
                {t.childProfileTitle}
              </h3>
              <p className="text-xs text-[#7C8294]">
                {currentLang === 'bn' ? 'সঠিক মাইলস্টোন গণনার জন্য জন্মতারিখ অপরিহার্য' : 'Accurate DOB ensures tailored CDC/WHO milestones'}
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

        {savedAlert ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#2D3142]">
              {t.profileSaved}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Child Name (Bn & En) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'শিশুর নাম (বাংলা)' : 'Child Name (Bangla)'}
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'শিশুর নাম (English)' : 'Child Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1">
                {t.editBirthdate}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            </div>

            {/* Mother Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'মায়ের নাম (বাংলা)' : 'Mother Name (Bangla)'}
                </label>
                <input
                  type="text"
                  required
                  value={motherNameBn}
                  onChange={(e) => setMotherNameBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'মায়ের নাম (English)' : 'Mother Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={motherNameEn}
                  onChange={(e) => setMotherNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F3E7DC] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-[#64748B] hover:text-[#2D3142]"
              >
                {t.close}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                {t.saveChanges}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
