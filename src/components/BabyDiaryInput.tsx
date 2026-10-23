import React, { useState } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Check, 
  Calendar, 
  Weight, 
  Ruler, 
  MessageSquare, 
  Smile, 
  Heart,
  PlusCircle,
  LoaderCircle
} from 'lucide-react';
import { ChildProfile, GrowthLogEntry, Language, MoodConfig } from '../types';
import { moodOptions } from '../data/mockData';
import { translations, formatLocalizedNumber } from '../i18n/translations';

interface BabyDiaryInputProps {
  currentLang: Language;
  activeChild: ChildProfile;
  growthLogs: GrowthLogEntry[];
  onAddGrowthLog: (log: GrowthLogEntry) => void;
}

export const BabyDiaryInput: React.FC<BabyDiaryInputProps> = ({
  currentLang,
  activeChild,
  growthLogs,
  onAddGrowthLog,
}) => {
  const t = translations[currentLang];
  
  // Input form state
  const [weightKg, setWeightKg] = useState<string>(String(activeChild.currentWeightKg || '8.9'));
  const [heightCm, setHeightCm] = useState<string>(String(activeChild.currentHeightCm || '71.5'));
  const [newWord, setNewWord] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<'happy' | 'fussy' | 'sleepy' | 'active'>('happy');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [aiTip, setAiTip] = useState('');
  const [aiTipError, setAiTipError] = useState('');
  const [isLoadingAiTip, setIsLoadingAiTip] = useState(false);

  const handleGenerateAiTip = async () => {
    setIsLoadingAiTip(true);
    setAiTipError('');
    setAiTip('');

    try {
      const response = await fetch('/api/ai/development-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageMonths: activeChild.ageMonths,
          language: currentLang,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed');
      setAiTip(result.tip);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('API key is not configured')) {
        setAiTipError(currentLang === 'bn'
          ? 'Gemini চালু করতে প্রজেক্টের .env ফাইলে GEMINI_API_KEY যোগ করে dev server বন্ধ করে আবার চালু করুন।'
          : 'To enable Gemini, add GEMINI_API_KEY to the project .env file, then restart the dev server.');
      } else {
        setAiTipError(currentLang === 'bn'
          ? 'এখন পরামর্শ তৈরি করা যাচ্ছে না। ইন্টারনেট সংযোগ ও Gemini API key পরীক্ষা করুন।'
          : 'Could not generate a tip. Check your connection and Gemini API key.');
      }
    } finally {
      setIsLoadingAiTip(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || !heightCm) return;

    const newEntry: GrowthLogEntry = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ageMonths: activeChild.ageMonths,
      weightKg: parseFloat(weightKg),
      heightCm: parseFloat(heightCm),
      newWord: newWord.trim() || undefined,
      noteBn: noteText.trim() || (currentLang === 'bn' ? 'সন্তান আজ খুব ভালো ছিল!' : 'Baby was delightful today!'),
      noteEn: noteText.trim() || 'Baby was delightful today!',
      mood: selectedMood,
    };

    onAddGrowthLog(newEntry);
    setSavedSuccess(true);
    setNewWord('');
    setNoteText('');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <section id="baby-diary" className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8C6D53] uppercase tracking-wider">
          <PenTool className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'অভিভাবকের সরাসরি ইনপুট' : 'Direct Parent Input'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3142] tracking-tight mt-1">
          {t.inputSectionTitle}
        </h2>
        <p className="text-sm text-[#5C6479] mt-1 max-w-2xl">
          {t.inputSectionSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F3E7DC]">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E2] text-[#C85D26] flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D3142]">
                {currentLang === 'bn' ? 'আজকের তথ্য যোগ করুন' : 'Record New Entry'}
              </h3>
              <p className="text-xs text-[#7C8294]">
                {currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn} · {formatLocalizedNumber(activeChild.ageMonths, currentLang)} {t.months}
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#EAF4EC] border border-[#CDE5D1] text-[#2F6B47] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{t.logSavedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Weight and Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {t.logWeight}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {t.logHeight}
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            </div>

            {/* Baby Mood Selection */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1.5">
                {t.moodQuestion}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {moodOptions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      selectedMood === m.id
                        ? 'border-[#FF8552] bg-[#FFF0E2] font-bold text-[#C85D26]'
                        : 'border-[#F3E7DC] hover:border-[#EED9C7] bg-[#FFFAF5] text-[#5C6479]'
                    }`}
                  >
                    <div className="text-base">{m.emoji}</div>
                    <div className="text-[11px] truncate mt-0.5">
                      {currentLang === 'bn' ? m.labelBn : m.labelEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* First Words / Sounds */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1">
                {t.logNewWord}
              </label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={currentLang === 'bn' ? 'যেমন: মামা, বাবা, দে, টাটা' : 'e.g. Mama, Baba, Tata'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
              />
            </div>

            {/* Sweet Moment Note */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1">
                {t.logNote}
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={currentLang === 'bn' ? `আজ ${activeChild.nameBn} কী মজার কাণ্ড করেছে...` : 'Record today’s precious smiles or milestones...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-xl shadow-xs transition-colors"
            >
              {t.saveLogBtn}
            </button>
          </form>

          <div className="border-t border-[#F3E7DC] pt-4 space-y-3">
            <button
              type="button"
              onClick={handleGenerateAiTip}
              disabled={isLoadingAiTip}
              className="w-full py-2.5 bg-[#FFF0E2] hover:bg-[#FFE5D0] disabled:opacity-60 text-[#C85D26] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {isLoadingAiTip ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isLoadingAiTip
                ? (currentLang === 'bn' ? 'পরামর্শ তৈরি হচ্ছে…' : 'Generating tip…')
                : (currentLang === 'bn' ? 'Gemini থেকে যত্নের পরামর্শ নিন' : 'Get an AI parenting tip')}</span>
            </button>
            {aiTip && (
              <div className="rounded-2xl border border-[#FFD9B3] bg-[#FFFAF5] p-4 text-xs leading-relaxed text-[#2D3142] whitespace-pre-wrap">
                <p className="font-bold text-[#C85D26] mb-1">{currentLang === 'bn' ? 'আপনার জন্য পরামর্শ' : 'A helpful idea'}</p>
                {aiTip}
                <p className="mt-2 text-[10px] text-[#7C8294]">{currentLang === 'bn' ? 'এটি সাধারণ তথ্য, চিকিৎসকের পরামর্শ নয়।' : 'General information only—not medical advice.'}</p>
              </div>
            )}
            {aiTipError && <p role="alert" className="text-xs text-red-600">{aiTipError}</p>}
          </div>
        </div>

        {/* Recent Entries Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#2D3142]">
              {t.recentLogsTitle}
            </h3>
            <span className="text-xs text-[#7C8294]">
              {formatLocalizedNumber(growthLogs.length, currentLang)} {currentLang === 'bn' ? 'টি দিনলিপি সংরক্ষিত' : 'entries saved'}
            </span>
          </div>

          <div className="space-y-3">
            {growthLogs.map((log) => {
              const moodObj = moodOptions.find((m) => m.id === log.mood) || moodOptions[0];
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-[#EED9C7] p-5 shadow-xs space-y-3 hover:border-[#FFB07C] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[#2D3142] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF8552]" />
                        {log.date}
                      </span>
                      <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
                      <span className="text-[#7C8294]">
                        {formatLocalizedNumber(log.ageMonths, currentLang)} {t.months}
                      </span>
                    </div>

                    {/* Mood Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF0E2] text-xs font-medium text-[#C85D26]">
                      <span>{moodObj.emoji}</span>
                      <span>{currentLang === 'bn' ? moodObj.labelBn : moodObj.labelEn}</span>
                    </div>
                  </div>

                  {/* Metrics: Weight, Height, New Words */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1 text-[#2F6B47] bg-[#EAF4EC] px-2.5 py-1 rounded-lg">
                      <Weight className="w-3.5 h-3.5" />
                      <span>{formatLocalizedNumber(log.weightKg, currentLang)} কেজি</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#C85D26] bg-[#FFE4D3] px-2.5 py-1 rounded-lg">
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{formatLocalizedNumber(log.heightCm, currentLang)} সেমি</span>
                    </div>

                    {log.newWord && (
                      <div className="flex items-center gap-1 text-[#8C6D53] bg-[#FAF4ED] px-2.5 py-1 rounded-lg">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{log.newWord}</span>
                      </div>
                    )}
                  </div>

                  {/* Note Body */}
                  <p className="text-xs text-[#5C6479] leading-relaxed">
                    {currentLang === 'bn' ? log.noteBn : log.noteEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
};
