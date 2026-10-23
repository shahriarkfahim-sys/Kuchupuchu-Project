import React, { useState } from 'react';
import { 
  Coffee, 
  Moon, 
  Baby, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  TrendingUp, 
  Heart,
  Droplets,
  Utensils,
  Sun
} from 'lucide-react';
import { ChildProfile, Language, RoutineLogEntry } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

interface BabyRoutineTrackerProps {
  currentLang: Language;
  activeChild: ChildProfile;
  routineLogs: RoutineLogEntry[];
  onAddRoutineLog: (entry: RoutineLogEntry) => void;
}

export const BabyRoutineTracker: React.FC<BabyRoutineTrackerProps> = ({
  currentLang,
  activeChild,
  routineLogs,
  onAddRoutineLog,
}) => {
  const [selectedType, setSelectedType] = useState<'feed' | 'sleep' | 'potty'>('feed');
  const [logTime, setLogTime] = useState('১২:৩০');
  const [feedItem, setFeedItem] = useState('সবজি ও ডিমের খিচুড়ি');
  const [sleepDuration, setSleepDuration] = useState('১ ঘণ্টা');
  const [pottyStatus, setPottyStatus] = useState('স্বাভাবিক ও নরম');
  const [customNote, setCustomNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let titleBn = '';
    let titleEn = '';
    let detailsBn = '';
    let detailsEn = '';

    if (selectedType === 'feed') {
      titleBn = `খাবার: ${feedItem}`;
      titleEn = `Feed: ${feedItem}`;
      detailsBn = customNote || 'পর্যাপ্ত পরিমাণে খেয়েছে, খাওয়ার পর বেশ তৃপ্ত ছিল।';
      detailsEn = customNote || 'Good healthy intake, satisfied after feed.';
    } else if (selectedType === 'sleep') {
      titleBn = `ঘুম (${sleepDuration})`;
      titleEn = `Sleep (${sleepDuration})`;
      detailsBn = customNote || 'শান্ত গভীর ঘুম, কোনো ঝামেলা ছাড়া ঘুমিয়েছে।';
      detailsEn = customNote || 'Peaceful restorative sleep without disruption.';
    } else {
      titleBn = `পটি ও ডায়াপার পরিবর্তন (${pottyStatus})`;
      titleEn = `Potty & Diaper (${pottyStatus})`;
      detailsBn = customNote || 'স্বাভাবিক পেটের অবস্থা। পরিষ্কার করে তেল লাগানো হয়েছে।';
      detailsEn = customNote || 'Cleaned and fresh diaper applied.';
    }

    const newLog: RoutineLogEntry = {
      id: `r_${Date.now()}`,
      type: selectedType,
      time: logTime,
      titleBn,
      titleEn,
      detailsBn,
      detailsEn,
      iconType: selectedType === 'feed' ? 'soup' : selectedType === 'sleep' ? 'moon' : 'baby',
    };

    onAddRoutineLog(newLog);
    setSavedSuccess(true);
    setCustomNote('');
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  return (
    <section id="daily-routine" className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B47] uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'দৈনন্দিন রুটিন ও স্বাস্থ্য বিশ্লেষণ' : 'Daily Routine & Habit Tracker'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3142] tracking-tight mt-1">
          {currentLang === 'bn' 
            ? `${childName}-এর খাওয়া, ঘুম ও পটি ট্র্যাকার` 
            : `${childName}’s Feeding, Sleep & Potty Tracker`}
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6479] mt-1 max-w-2xl">
          {currentLang === 'bn'
            ? 'প্রতিদিনের স্বাভাবিক অভ্যাস লিখে রাখুন। নিয়মিত অভ্যাসের মাধ্যমেই শিশুর সুস্বাস্থ্য নিশ্চিত হয়।'
            : 'Track feedings, naps, and potty logs. Gain automated insights into baby’s digestive and sleep patterns.'}
        </p>
      </div>

      {/* Routine Quick Analysis Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Sleep Analysis */}
        <div className="bg-white rounded-3xl border border-[#EED9C7] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#7C8294] font-medium">আজকের মোট ঘুম</span>
            <div className="text-xl font-bold text-[#2D3142] tabular-nums">
              {currentLang === 'bn' ? '১৩.৫ ঘণ্টা' : '13.5 hours'}
            </div>
            <div className="text-[11px] text-[#2F6B47] font-semibold">
              {currentLang === 'bn' ? '✓ ৯ মাস বয়সের জন্য আদর্শ' : '✓ Ideal for 9 months'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
        </div>

        {/* Feeding Analysis */}
        <div className="bg-white rounded-3xl border border-[#EED9C7] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#7C8294] font-medium">আজকের খাবার ও দুধ</span>
            <div className="text-xl font-bold text-[#2D3142] tabular-nums">
              {currentLang === 'bn' ? '৪ বার আহার' : '4 sessions'}
            </div>
            <div className="text-[11px] text-[#C85D26] font-semibold">
              {currentLang === 'bn' ? '২ বার খিচুড়ি + বুকের দুধ' : '2 solids + breastmilk'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFE4D3] text-[#C85D26] flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        {/* Potty / Hydration Analysis */}
        <div className="bg-white rounded-3xl border border-[#EED9C7] p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#7C8294] font-medium">ডায়াপার ও পটি পরিবর্তন</span>
            <div className="text-xl font-bold text-[#2D3142] tabular-nums">
              {currentLang === 'bn' ? '৫ বার' : '5 times'}
            </div>
            <div className="text-[11px] text-[#2F6B47] font-semibold">
              {currentLang === 'bn' ? 'পানিশূন্যতা নেই, স্বাভাবিক' : 'Well hydrated & normal'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Input Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F3E7DC]">
            <div className="w-9 h-9 rounded-xl bg-[#EAF4EC] text-[#2F6B47] flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D3142]">
                {currentLang === 'bn' ? 'নতুন রুটিন এন্ট্রি যোগ করুন' : 'Log New Routine Entry'}
              </h3>
              <p className="text-xs text-[#7C8294]">
                {childName} · {currentLang === 'bn' ? 'আজকের ডায়েরি' : 'Today'}
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#EAF4EC] border border-[#CDE5D1] text-[#2F6B47] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentLang === 'bn' ? 'রুটিন সফলভাবে সেভ হয়েছে!' : 'Routine saved successfully!'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Type selector */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1.5">
                {currentLang === 'bn' ? 'কী যোগ করতে চান?' : 'Select Entry Type:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'feed', icon: '🥣', labelBn: 'খাবার/দুধ', labelEn: 'Feed' },
                  { id: 'sleep', icon: '🌙', labelBn: 'ঘুম', labelEn: 'Sleep' },
                  { id: 'potty', icon: '🚼', labelBn: 'পটি/ডায়াপার', labelEn: 'Potty' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id as any)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      selectedType === t.id
                        ? 'border-[#FF8552] bg-[#FFF0E2] text-[#C85D26] font-bold shadow-xs'
                        : 'border-[#F3E7DC] bg-[#FFFAF5] text-[#5C6479] hover:border-[#FFB07C]'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="block mt-0.5">{currentLang === 'bn' ? t.labelBn : t.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time of Entry */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1">
                {currentLang === 'bn' ? 'সময়:' : 'Time:'}
              </label>
              <input
                type="text"
                required
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
                placeholder="যেমন: দুপুর ১২:৩০ বা সকাল ০৯:০০"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
              />
            </div>

            {/* Dynamic Options based on selected type */}
            {selectedType === 'feed' && (
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'কী খাবার খেয়েছে?' : 'Meal Item:'}
                </label>
                <input
                  type="text"
                  required
                  value={feedItem}
                  onChange={(e) => setFeedItem(e.target.value)}
                  placeholder="যেমন: সবজির খিচুড়ি, কলা চটকানো, বুকের দুধ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            )}

            {selectedType === 'sleep' && (
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'কতক্ষণ ঘুমিয়েছে?' : 'Sleep Duration:'}
                </label>
                <input
                  type="text"
                  required
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  placeholder="যেমন: ১ ঘণ্টা ৩০ মিনিট বা ৪৫ মিনিট"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                />
              </div>
            )}

            {selectedType === 'potty' && (
              <div>
                <label className="block font-semibold text-[#2D3142] mb-1">
                  {currentLang === 'bn' ? 'পটির অবস্থা:' : 'Stool Condition:'}
                </label>
                <select
                  value={pottyStatus}
                  onChange={(e) => setPottyStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
                >
                  <option value="স্বাভাবিক ও নরম">স্বাভাবিক ও নরম</option>
                  <option value="শুধু প্রস্রাব (ভেজা ডায়াপার)">শুধু প্রস্রাব (ভেজা ডায়াপার)</option>
                  <option value="সামান্য শক্ত (পানি কম)">সামান্য শক্ত (পানি কম)</option>
                  <option value="পাতলা পায়খানা">পাতলা পায়খানা</option>
                </select>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block font-semibold text-[#2D3142] mb-1">
                {currentLang === 'bn' ? 'কোনো বিশেষ পর্যবেক্ষণ বা নোট (ঐচ্ছিক):' : 'Notes (Optional):'}
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="যেমন: বেশ আনন্দের সাথে খেয়েছে..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EED9C7] bg-[#FFFAF5] focus:bg-white focus:outline-none focus:border-[#FFB07C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2F6B47] hover:bg-[#1E432D] text-white font-bold rounded-2xl shadow-xs transition-colors"
            >
              {currentLang === 'bn' ? 'রুটিনে যোগ করুন' : 'Save Routine Log'}
            </button>
          </form>
        </div>

        {/* Routine Timeline Feed Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#2D3142]">
              {currentLang === 'bn' ? 'আজকের রুটিন বিবরণী' : "Today's Routine Timeline"}
            </h3>
            <span className="text-xs text-[#7C8294]">
              {formatLocalizedNumber(routineLogs.length, currentLang)} {currentLang === 'bn' ? 'টি এন্ট্রি' : 'logged'}
            </span>
          </div>

          <div className="space-y-3">
            {routineLogs.map((log) => {
              const isFeed = log.type === 'feed';
              const isSleep = log.type === 'sleep';
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-[#EED9C7] p-4.5 shadow-xs flex items-start gap-4 hover:border-[#FFB07C] transition-all"
                >
                  <div 
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-base ${
                      isFeed ? 'bg-[#FFE4D3] text-[#C85D26]' : isSleep ? 'bg-[#E0E7FF] text-[#4338CA]' : 'bg-[#EAF4EC] text-[#2F6B47]'
                    }`}
                  >
                    {isFeed ? '🥣' : isSleep ? '🌙' : '🚼'}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-[#2D3142] truncate">
                        {currentLang === 'bn' ? log.titleBn : log.titleEn}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#8C6D53] bg-[#FAF4ED] px-2 py-0.5 rounded-lg">
                        {log.time}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C6479] leading-relaxed">
                      {currentLang === 'bn' ? log.detailsBn : log.detailsEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
};
