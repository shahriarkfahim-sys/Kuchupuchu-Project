import React, { useEffect, useRef, useState } from 'react';
import { 
  Moon, 
  Baby, 
  Clock, 
  CheckCircle2, 
  Droplets,
  Utensils,
  CalendarDays,
  X,
} from 'lucide-react';
import { ChildProfile, Language, RoutineLogEntry } from '../types';
import { formatLocalizedNumber } from '../i18n/translations';

const feedOptions = [
  { id: 'breastmilk', labelBn: 'মায়ের বুকের দুধ', labelEn: 'Breast milk' },
  { id: 'formula', labelBn: 'ফর্মুলা দুধ', labelEn: 'Formula milk' },
  { id: 'rice', labelBn: 'ভাত', labelEn: 'Rice' },
  { id: 'khichuri_veg_egg', labelBn: 'সবজি ও ডিমের খিচুড়ি', labelEn: 'Vegetable and egg khichuri' },
  { id: 'khichuri_fish', labelBn: 'মাছের খিচুড়ি', labelEn: 'Fish khichuri' },
  { id: 'rice_dal', labelBn: 'ভাত ও ডাল', labelEn: 'Rice and lentils' },
  { id: 'dal', labelBn: 'ডাল', labelEn: 'Lentils' },
  { id: 'fish', labelBn: 'মাছ', labelEn: 'Fish' },
  { id: 'egg', labelBn: 'ডিম', labelEn: 'Egg' },
  { id: 'chicken', labelBn: 'মুরগির মাংস', labelEn: 'Chicken' },
  { id: 'vegetables', labelBn: 'সবজি', labelEn: 'Vegetables' },
  { id: 'potato', labelBn: 'আলু ভর্তা', labelEn: 'Mashed potato' },
  { id: 'pumpkin', labelBn: 'মিষ্টি কুমড়া', labelEn: 'Pumpkin' },
  { id: 'spinach', labelBn: 'শাক', labelEn: 'Leafy greens' },
  { id: 'suji', labelBn: 'সুজি', labelEn: 'Semolina' },
  { id: 'oats', labelBn: 'ওটস', labelEn: 'Oats' },
  { id: 'banana', labelBn: 'কলা', labelEn: 'Banana' },
  { id: 'papaya', labelBn: 'পেঁপে', labelEn: 'Papaya' },
  { id: 'mango', labelBn: 'আম', labelEn: 'Mango' },
  { id: 'guava', labelBn: 'পেয়ারা', labelEn: 'Guava' },
  { id: 'yogurt', labelBn: 'টক দই', labelEn: 'Plain yogurt' },
  { id: 'bread', labelBn: 'রুটি বা পাউরুটি', labelEn: 'Roti or bread' },
] as const;

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${String(hours).padStart(2, '0')}:${minutes}`;
});

const routineEntryTitles: Record<RoutineLogEntry['type'], { bn: string; en: string }> = {
  feed: { bn: 'খাবারের তথ্য লিখুন', en: 'Log a feeding' },
  sleep: { bn: 'ঘুমের তথ্য লিখুন', en: 'Log sleep' },
  diaper: { bn: 'ডায়াপার পরিবর্তনের তথ্য লিখুন', en: 'Log a diaper change' },
  potty: { bn: 'পটির তথ্য লিখুন', en: 'Log potty' },
};

function formatRoutineTime(value: string, lang: Language) {
  const [hoursText, minutes] = value.split(':');
  const hours = Number(hoursText);
  const periodBn = hours < 4 ? 'রাত' : hours < 6 ? 'ভোর' : hours < 11 ? 'সকাল' : hours < 15 ? 'দুপুর' : hours < 18 ? 'বিকাল' : hours < 20 ? 'সন্ধ্যা' : 'রাত';
  const periodEn = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours % 12 || 12;
  const time = `${formatLocalizedNumber(displayHours, lang)}:${formatLocalizedNumber(minutes, lang)}`;
  return lang === 'bn' ? `${periodBn} ${time}` : `${time} ${periodEn}`;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentTimeSlot(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = date.getMinutes() < 30 ? '00' : '30';
  return `${hours}:${minutes}`;
}

function sleepMinutesForLog(log: RoutineLogEntry) {
  if (log.durationMinutes) return log.durationMinutes;
  const title = log.titleBn.replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
  const hours = title.match(/(\d+(?:\.\d+)?)\s*ঘণ্টা/);
  const minutes = title.match(/(\d+)\s*মিনিট/);
  return (hours ? Number(hours[1]) * 60 : title.includes('দেড় ঘণ্টা') ? 90 : 0) + (minutes ? Number(minutes[1]) : 0);
}

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
  const [selectedType, setSelectedType] = useState<'feed' | 'sleep' | 'diaper' | 'potty'>('feed');
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [logDate, setLogDate] = useState(() => localDateString());
  const [logTime, setLogTime] = useState(() => currentTimeSlot());
  const [feedItem, setFeedItem] = useState<string>(feedOptions[3].id);
  const [customFeedItem, setCustomFeedItem] = useState('');
  const [sleepDuration, setSleepDuration] = useState(60);
  const [pottyStatus, setPottyStatus] = useState('স্বাভাবিক ও নরম');
  const [customNote, setCustomNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const entryFormRef = useRef<HTMLDivElement>(null);

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;

  useEffect(() => {
    if (isEntryOpen) {
      entryFormRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, [isEntryOpen]);

  const selectedDateLogs = routineLogs.filter((log) => (log.date ?? localDateString()) === logDate);
  const feedCount = selectedDateLogs.filter((log) => log.type === 'feed').length;
  const sleepLogs = selectedDateLogs.filter((log) => log.type === 'sleep');
  const totalSleepMinutes = sleepLogs.reduce((sum, log) => sum + sleepMinutesForLog(log), 0);
  const diaperCount = selectedDateLogs.filter((log) => log.type === 'diaper').length;
  const pottyCount = selectedDateLogs.filter((log) => log.type === 'potty').length;
  const totalCareEntries = feedCount + sleepLogs.length + diaperCount + pottyCount;
  const SelectedTypeIcon = selectedType === 'feed' ? Utensils : selectedType === 'sleep' ? Moon : selectedType === 'diaper' ? Baby : Droplets;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let titleBn = '';
    let titleEn = '';
    let detailsBn = '';
    let detailsEn = '';

    if (selectedType === 'feed') {
      const selectedFeed = feedOptions.find((item) => item.id === feedItem);
      const foodBn = feedItem === 'other' ? customFeedItem.trim() : selectedFeed?.labelBn ?? '';
      const foodEn = feedItem === 'other' ? customFeedItem.trim() : selectedFeed?.labelEn ?? '';
      titleBn = `খাবার: ${foodBn}`;
      titleEn = `Feed: ${foodEn}`;
      detailsBn = customNote || 'পর্যাপ্ত পরিমাণে খেয়েছে, খাওয়ার পর বেশ তৃপ্ত ছিল।';
      detailsEn = customNote || 'Good healthy intake, satisfied after feed.';
    } else if (selectedType === 'sleep') {
      titleBn = `ঘুম (${formatLocalizedNumber(Math.floor(sleepDuration / 60), currentLang)} ঘণ্টা ${formatLocalizedNumber(sleepDuration % 60, currentLang)} মিনিট)`;
      titleEn = `Sleep (${Math.floor(sleepDuration / 60)}h ${sleepDuration % 60}m)`;
      detailsBn = customNote || 'শান্ত গভীর ঘুম, কোনো ঝামেলা ছাড়া ঘুমিয়েছে।';
      detailsEn = customNote || 'Peaceful restorative sleep without disruption.';
    } else if (selectedType === 'diaper') {
      titleBn = 'ডায়াপার পরিবর্তন';
      titleEn = 'Diaper change';
      detailsBn = customNote || 'ডায়াপার বদলে পরিষ্কার ও আরামদায়ক করে দেওয়া হয়েছে।';
      detailsEn = customNote || 'Changed to a clean, comfortable diaper.';
    } else {
      titleBn = `পটি (${pottyStatus})`;
      titleEn = `Potty (${pottyStatus})`;
      detailsBn = customNote || 'স্বাভাবিক পেটের অবস্থা। পরিষ্কার করে তেল লাগানো হয়েছে।';
      detailsEn = customNote || 'Cleaned and fresh diaper applied.';
    }

    const newLog: RoutineLogEntry = {
      id: `r_${Date.now()}`,
      type: selectedType,
      date: logDate,
      ...(selectedType === 'sleep' ? { durationMinutes: sleepDuration } : {}),
      time: formatRoutineTime(logTime, currentLang),
      titleBn,
      titleEn,
      detailsBn,
      detailsEn,
      iconType: selectedType === 'feed' ? 'soup' : selectedType === 'sleep' ? 'moon' : selectedType === 'diaper' ? 'diaper' : 'baby',
    };

    onAddRoutineLog(newLog);
    setSavedSuccess(true);
    setCustomNote('');
    setIsEntryOpen(false);
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
            ? 'ট্র্যাকার'
            : 'Tracker'}
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6479] mt-1 max-w-2xl">
          {currentLang === 'bn'
            ? 'প্রতিদিনের স্বাভাবিক অভ্যাস লিখে রাখুন। নিয়মিত অভ্যাসের মাধ্যমেই শিশুর সুস্বাস্থ্য নিশ্চিত হয়।'
            : 'Track feedings, naps, and potty logs. Gain automated insights into baby’s digestive and sleep patterns.'}
        </p>
      </div>

      {/* Daily care entry actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { id: 'feed', icon: Utensils, labelBn: 'খাওয়া', labelEn: 'Feeding', color: 'border-[#A9471C] bg-[#B95727] text-white hover:bg-[#A9471C]' },
          { id: 'sleep', icon: Moon, labelBn: 'ঘুম', labelEn: 'Sleep', color: 'border-[#39458E] bg-[#4955A4] text-white hover:bg-[#39458E]' },
          { id: 'diaper', icon: Baby, labelBn: 'ডায়াপার পরিবর্তন', labelEn: 'Diaper change', color: 'border-[#1F624D] bg-[#28745C] text-white hover:bg-[#1F624D]' },
          { id: 'potty', icon: Droplets, labelBn: 'পটি', labelEn: 'Potty', color: 'border-[#526324] bg-[#61752D] text-white hover:bg-[#526324]' },
        ].map(({ id, icon: Icon, labelBn, labelEn, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setSelectedType(id as 'feed' | 'sleep' | 'diaper' | 'potty');
              setLogDate(localDateString());
              setLogTime(currentTimeSlot());
              setShowHistory(false);
              setIsEntryOpen(true);
            }}
            className={`flex min-h-24 items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-bold shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30 sm:min-h-28 sm:px-5 sm:text-lg ${color}`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xs sm:h-14 sm:w-14">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <span>{currentLang === 'bn' ? labelBn : labelEn}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setIsEntryOpen(false);
            setShowHistory((show) => !show);
          }}
          className="flex min-h-24 items-center gap-3 rounded-2xl border-2 border-[#39458E] bg-[#4955A4] px-4 py-4 text-left text-base font-bold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-[#39458E] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A5B1EE]/60 sm:min-h-28 sm:px-5 sm:text-lg"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xs sm:h-14 sm:w-14">
            <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <span>{currentLang === 'bn' ? 'তারিখভিত্তিক হিসাব' : 'View by date'}</span>
        </button>
      </div>

      {showHistory && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-[#B8C4F2] bg-[#F7F8FF] p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#424F9B]">{currentLang === 'bn' ? 'কোন দিনের এন্ট্রি দেখতে চান?' : 'Choose a date to review'}</h3>
            <p className="mt-1 text-sm text-[#667085]">{currentLang === 'bn' ? 'আজকের এবং আগের দিনের যত্নের হিসাব দেখুন।' : 'Review care entries from today or an earlier date.'}</p>
          </div>
          <label className="block w-full text-sm font-semibold text-[#424F9B] sm:max-w-xs">
            {currentLang === 'bn' ? 'তারিখ বাছুন' : 'Select date'}
            <input type="date" max={localDateString()} value={logDate} onChange={(event) => setLogDate(event.target.value)} className="mt-1.5 block min-h-12 w-full rounded-xl border border-[#B8C4F2] bg-white px-3 text-base text-[#2D3142] outline-none focus:ring-2 focus:ring-[#A5B1EE]" />
          </label>
        </div>
      )}

      {/* Selected day's summary */}
      <div className="rounded-3xl border border-[#214B3A] bg-[#285A45] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">
            {currentLang === 'bn' ? (logDate === localDateString() ? 'আজকের সারাংশ' : 'নির্বাচিত দিনের সারাংশ') : (logDate === localDateString() ? "Today's care summary" : 'Selected day summary')}
          </h3>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            {formatLocalizedNumber(totalCareEntries, currentLang)} {currentLang === 'bn' ? 'টি মোট এন্ট্রি' : 'total entries'}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#CCD3F0] bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F6FF] text-[#4955A4]"><Moon className="h-5 w-5" /></span>
            <div><p className="text-xs text-[#667085]">{currentLang === 'bn' ? 'মোট ঘুম' : 'Total sleep'}</p><p className="text-lg font-extrabold text-[#2D3142]">{formatLocalizedNumber(Math.floor(totalSleepMinutes / 60), currentLang)} {currentLang === 'bn' ? 'ঘণ্টা' : 'h'} {formatLocalizedNumber(totalSleepMinutes % 60, currentLang)} {currentLang === 'bn' ? 'মিনিট' : 'm'}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#F4C7A9] bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF6EF] text-[#B95727]"><Utensils className="h-5 w-5" /></span>
            <div><p className="text-xs text-[#667085]">{currentLang === 'bn' ? 'খাবার ও দুধ' : 'Feeds'}</p><p className="text-lg font-extrabold text-[#2D3142]">{formatLocalizedNumber(feedCount, currentLang)} {currentLang === 'bn' ? 'বার' : 'times'}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#BFE4D7] bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FAF6] text-[#28745C]"><Baby className="h-5 w-5" /></span>
            <div><p className="text-xs text-[#667085]">{currentLang === 'bn' ? 'ডায়াপার পরিবর্তন' : 'Diaper changes'}</p><p className="text-lg font-extrabold text-[#2D3142]">{formatLocalizedNumber(diaperCount, currentLang)} {currentLang === 'bn' ? 'বার' : 'times'}</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#D5DDB2] bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8FAEF] text-[#61752D]"><Droplets className="h-5 w-5" /></span>
            <div><p className="text-xs text-[#667085]">{currentLang === 'bn' ? 'পটি' : 'Potty'}</p><p className="text-lg font-extrabold text-[#2D3142]">{formatLocalizedNumber(pottyCount, currentLang)} {currentLang === 'bn' ? 'বার' : 'times'}</p></div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#CDE5D1] bg-[#EAF4EC] p-4 text-sm font-semibold text-[#2F6B47]">
          <CheckCircle2 className="h-5 w-5" />
          {currentLang === 'bn' ? 'রুটিন এন্ট্রি সংরক্ষণ হয়েছে!' : 'Routine entry saved!'}
        </div>
      )}

      {isEntryOpen && (
        <div ref={entryFormRef} className="mx-auto w-full max-w-3xl scroll-mt-24 rounded-3xl border border-[#EED9C7] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#F3E7DC] pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4EC] text-[#2F6B47]"><SelectedTypeIcon className="h-6 w-6" /></span>
              <div>
                <h3 className="text-xl font-bold text-[#2D3142]">{currentLang === 'bn' ? routineEntryTitles[selectedType].bn : routineEntryTitles[selectedType].en}</h3>
                <p className="mt-1 text-sm text-[#7C8294]">{childName} · {currentLang === 'bn' ? 'নতুন এন্ট্রি' : 'New entry'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsEntryOpen(false)} aria-label={currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'} className="rounded-full p-2 text-[#667085] hover:bg-[#F8F7F5]"><X className="h-5 w-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="font-semibold text-[#344054]">{currentLang === 'bn' ? 'তারিখ' : 'Date'}<input type="date" required max={localDateString()} value={logDate} onChange={(event) => setLogDate(event.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 text-base outline-none focus:border-[#FFB07C]" /></label>
              <label className="font-semibold text-[#344054]">{currentLang === 'bn' ? 'সময়' : 'Time'}<select required value={logTime} onChange={(event) => setLogTime(event.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 text-base outline-none focus:border-[#FFB07C]">{timeOptions.map((time) => <option key={time} value={time}>{formatRoutineTime(time, currentLang)}</option>)}</select></label>
            </div>

            {selectedType === 'feed' && <div>
              <label className="font-semibold text-[#344054]">{currentLang === 'bn' ? 'কী খেয়েছে?' : 'What did the child eat?'}<select required value={feedItem} onChange={(event) => setFeedItem(event.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 text-base outline-none focus:border-[#FFB07C]">{feedOptions.map((item) => <option key={item.id} value={item.id}>{currentLang === 'bn' ? item.labelBn : item.labelEn}</option>)}<option value="other">{currentLang === 'bn' ? 'অন্যান্য' : 'Other'}</option></select></label>
              {feedItem === 'other' && <input type="text" required value={customFeedItem} onChange={(event) => setCustomFeedItem(event.target.value)} placeholder={currentLang === 'bn' ? 'খাবারের নাম লিখুন' : 'Enter food name'} className="mt-3 min-h-12 w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 text-base outline-none focus:border-[#FFB07C]" />}
            </div>}

            {selectedType === 'sleep' && <label className="block font-semibold text-[#344054]">{currentLang === 'bn' ? 'কতক্ষণ ঘুমিয়েছে? (মিনিট)' : 'Sleep duration (minutes)'}<input type="number" min="1" step="5" required value={sleepDuration} onChange={(event) => setSleepDuration(Number(event.target.value))} placeholder="60" className="mt-2 block min-h-12 w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 text-base outline-none focus:border-[#FFB07C]" /></label>}

            {selectedType === 'potty' && <label className="block font-semibold text-[#344054]">{currentLang === 'bn' ? 'পটির অবস্থা' : 'Potty details'}<select value={pottyStatus} onChange={(event) => setPottyStatus(event.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 text-base outline-none focus:border-[#FFB07C]"><option value="স্বাভাবিক ও নরম">স্বাভাবিক ও নরম</option><option value="শুধু প্রস্রাব (ভেজা ডায়াপার)">শুধু প্রস্রাব (ভেজা ডায়াপার)</option><option value="সামান্য শক্ত (পানি কম)">সামান্য শক্ত (পানি কম)</option><option value="পাতলা পায়খানা">পাতলা পায়খানা</option></select></label>}

            <label className="block font-semibold text-[#344054]">{currentLang === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (optional)'}<textarea rows={3} value={customNote} onChange={(event) => setCustomNote(event.target.value)} placeholder={currentLang === 'bn' ? 'কোনো বিশেষ তথ্য লিখুন…' : 'Add any details…'} className="mt-2 block w-full rounded-xl border border-[#EED9C7] bg-[#FFFAF5] px-3 py-3 text-base outline-none focus:border-[#FFB07C]" /></label>

            <button type="submit" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2F6B47] px-5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#1E432D]">
              <CheckCircle2 className="h-5 w-5" /> {currentLang === 'bn' ? 'এন্ট্রি সংরক্ষণ করুন' : 'Save entry'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#2D3142]">{currentLang === 'bn' ? (logDate === localDateString() ? 'আজকের এন্ট্রি' : 'নির্বাচিত দিনের এন্ট্রি') : (logDate === localDateString() ? "Today's entries" : 'Entries for selected date')}</h3>
          <span className="rounded-full bg-[#F4F1EC] px-3 py-1 text-sm font-semibold text-[#667085]">{formatLocalizedNumber(selectedDateLogs.length, currentLang)} {currentLang === 'bn' ? 'টি এন্ট্রি' : 'entries'}</span>
        </div>
        {selectedDateLogs.length ? selectedDateLogs.map((log) => {
          const Icon = log.type === 'feed' ? Utensils : log.type === 'sleep' ? Moon : log.type === 'diaper' ? Baby : Droplets;
          return (
            <article key={log.id} className="flex items-start gap-4 rounded-2xl border border-[#EED9C7] bg-white p-4 shadow-xs sm:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4F1EC] text-[#5C6479]"><Icon className="h-6 w-6" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-base font-bold text-[#2D3142]">{currentLang === 'bn' ? log.titleBn : log.titleEn}</h4><time className="rounded-lg bg-[#FFFAF5] px-3 py-1 text-sm font-semibold text-[#8C6D53]">{log.time}</time></div>
                <p className="mt-1 text-sm leading-relaxed text-[#5C6479]">{currentLang === 'bn' ? log.detailsBn : log.detailsEn}</p>
              </div>
            </article>
          );
        }) : <div className="rounded-2xl border border-dashed border-[#EED9C7] bg-white p-8 text-center text-sm text-[#7C8294]">{currentLang === 'bn' ? 'এই তারিখে কোনো এন্ট্রি নেই। উপরের বাটনে চাপ দিয়ে যোগ করুন।' : 'No entries for this date. Use a button above to add one.'}</div>}
      </div>
    </section>
  );
};
