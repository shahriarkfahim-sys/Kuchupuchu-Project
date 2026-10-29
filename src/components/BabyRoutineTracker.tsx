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
import { formatDateForLocale } from '../utils/dateFormatting';
import { LocalizedDateInput } from './LocalizedDateInput';

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

const routineFieldClass = 'mt-2 block min-h-12 w-full rounded-xl border border-[#E6DDD4] bg-white px-4 text-base text-[#2D3142] shadow-sm outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6B47] focus:ring-4 focus:ring-[#2F6B47]/10';
const routineLabelClass = 'block text-sm font-semibold text-[#344054]';

const diaperTypes = [
  { id: 'urine', label: 'প্রস্রাব', labelEn: 'Urine', sticker: '💧' },
  { id: 'stool', label: 'পায়খানা', labelEn: 'Stool', sticker: '💩' },
  { id: 'both', label: 'দুটিই', labelEn: 'Both', sticker: '🧷' },
] as const;

const stoolConsistencyOptions = [
  { id: 'solid', label: 'গঠিত', labelEn: 'Solid', sticker: '🟤' },
  { id: 'loose', label: 'ঢিলা', labelEn: 'Loose', sticker: '💩' },
  { id: 'runny', label: 'পাতলা', labelEn: 'Runny', sticker: '💦' },
  { id: 'hard', label: 'শক্ত', labelEn: 'Hard', sticker: '🪨' },
  { id: 'pebbles', label: 'ছোট শক্ত দানা', labelEn: 'Pebbles', sticker: '🫘' },
  { id: 'diarrhea', label: 'ডায়রিয়া', labelEn: 'Diarrhea', sticker: '🌊' },
] as const;

const diaperAmountOptions = [
  { id: 'light', label: 'অল্প', labelEn: 'Light', sticker: '🌱' },
  { id: 'medium', label: 'মাঝারি', labelEn: 'Medium', sticker: '🌼' },
  { id: 'heavy', label: 'বেশি', labelEn: 'Heavy', sticker: '🌊' },
] as const;

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

function dateFromLocalString(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function shiftDate(value: string, days: number) {
  const date = dateFromLocalString(value);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function logDateForAnalysis(log: RoutineLogEntry) {
  return log.date ?? localDateString();
}

function logHourForAnalysis(value: string) {
  const normalized = value.replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
  const match = normalized.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  let hour = Number(match[1]) % 12;
  if (
    normalized.includes('দুপুর')
    || normalized.includes('বিকাল')
    || normalized.includes('সন্ধ্যা')
    || (normalized.includes('রাত') && hour >= 8)
  ) hour += 12;
  else if (/PM/i.test(normalized)) hour += 12;
  return hour;
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

interface ActiveSleepSession {
  childId: string;
  startedAt: string;
}

function activeSleepStorageKey(childId: string) {
  return `kuchupuchu_active_sleep_${childId}`;
}

function parseActiveSleepSession(value: string, childId: string): ActiveSleepSession {
  const parsed = JSON.parse(value) as Partial<ActiveSleepSession>;
  if (parsed.childId !== childId || typeof parsed.startedAt !== 'string' || !Number.isFinite(Date.parse(parsed.startedAt))) {
    throw new Error('Stored sleep session is invalid.');
  }
  return { childId, startedAt: parsed.startedAt };
}

export const BabyRoutineTracker: React.FC<BabyRoutineTrackerProps> = ({
  currentLang,
  activeChild,
  routineLogs,
  onAddRoutineLog,
}) => {
  const [selectedType, setSelectedType] = useState<'feed' | 'sleep' | 'diaper' | 'potty'>('feed');
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisView, setAnalysisView] = useState<'daily' | 'monthly' | 'range'>('daily');
  const [analysisCategory, setAnalysisCategory] = useState<RoutineLogEntry['type']>('sleep');
  const [analysisDate, setAnalysisDate] = useState(() => localDateString());
  const [analysisMonth, setAnalysisMonth] = useState(() => localDateString().slice(0, 7));
  const [analysisStartDate, setAnalysisStartDate] = useState(() => shiftDate(localDateString(), -6));
  const [analysisEndDate, setAnalysisEndDate] = useState(() => localDateString());
  const [logDate, setLogDate] = useState(() => localDateString());
  const [logTime, setLogTime] = useState(() => currentTimeSlot());
  const [feedItem, setFeedItem] = useState<string>(feedOptions[3].id);
  const [customFeedItem, setCustomFeedItem] = useState('');
  const [sleepDuration, setSleepDuration] = useState(60);
  const [sleepEntryMode, setSleepEntryMode] = useState<'timer' | 'manual'>('timer');
  const [diaperType, setDiaperType] = useState<(typeof diaperTypes)[number]['id']>('urine');
  const [stoolConsistency, setStoolConsistency] = useState<(typeof stoolConsistencyOptions)[number]['id']>('solid');
  const [diaperAmount, setDiaperAmount] = useState<(typeof diaperAmountOptions)[number]['id']>('medium');
  const [diaperChoicesOpen, setDiaperChoicesOpen] = useState(false);
  const [pottyStatus, setPottyStatus] = useState('স্বাভাবিক ও নরম');
  const [customNote, setCustomNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSleep, setActiveSleep] = useState<ActiveSleepSession | null>(null);
  const [sleepError, setSleepError] = useState('');
  const [clockNow, setClockNow] = useState(() => Date.now());
  const entryFormRef = useRef<HTMLDivElement>(null);

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;
  const isCurrentChildSleeping = activeSleep?.childId === activeChild.id;

  useEffect(() => {
    const storageKey = activeSleepStorageKey(activeChild.id);
    const readSession = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        setActiveSleep(saved ? parseActiveSleepSession(saved, activeChild.id) : null);
        setSleepError('');
      } catch (error) {
        console.error('Unable to read active sleep session.', error);
        setActiveSleep(null);
        setSleepError(currentLang === 'bn' ? 'চলমান ঘুমের তথ্য পড়া যায়নি। আবার চেষ্টা করুন।' : 'Could not load the active sleep session. Please try again.');
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      readSession();
    };

    readSession();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [activeChild.id, currentLang]);

  useEffect(() => {
    if (!isCurrentChildSleeping) return;
    const intervalId = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [isCurrentChildSleeping]);

  useEffect(() => {
    if (!isEntryOpen) return;

    const dialog = entryFormRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector);

    document.body.style.overflow = 'hidden';
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEntryOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isEntryOpen]);

  const selectedDateLogs = routineLogs.filter((log) => (log.date ?? localDateString()) === logDate);
  const feedCount = selectedDateLogs.filter((log) => log.type === 'feed').length;
  const sleepLogs = selectedDateLogs.filter((log) => log.type === 'sleep');
  const totalSleepMinutes = sleepLogs.reduce((sum, log) => sum + sleepMinutesForLog(log), 0);
  const diaperCount = selectedDateLogs.filter((log) => log.type === 'diaper').length;
  const pottyCount = selectedDateLogs.filter((log) => log.type === 'potty').length;
  const totalCareEntries = feedCount + sleepLogs.length + diaperCount + pottyCount;
  const SelectedTypeIcon = selectedType === 'feed' ? Utensils : selectedType === 'sleep' ? Moon : selectedType === 'diaper' ? Baby : Droplets;
  const analysisRange = (() => {
    if (analysisView === 'daily') return { start: analysisDate, end: analysisDate };
    if (analysisView === 'monthly') {
      const [year, month] = analysisMonth.split('-').map(Number);
      const monthEnd = localDateString(new Date(year, month, 0));
      return {
        start: `${analysisMonth}-01`,
        end: analysisMonth === localDateString().slice(0, 7) ? localDateString() : monthEnd,
      };
    }
    return { start: analysisStartDate, end: analysisEndDate };
  })();
  const isAnalysisRangeValid = /^\d{4}-\d{2}-\d{2}$/.test(analysisRange.start)
    && /^\d{4}-\d{2}-\d{2}$/.test(analysisRange.end)
    && analysisRange.start <= analysisRange.end;
  const analysisLogs = isAnalysisRangeValid
    ? routineLogs.filter((log) => {
      const date = logDateForAnalysis(log);
      return date >= analysisRange.start && date <= analysisRange.end;
    })
    : [];
  const analysisCategoryLogs = analysisLogs.filter((log) => log.type === analysisCategory);
  const analysisValueForLogs = (logs: RoutineLogEntry[]) => logs.reduce(
    (total, log) => total + (analysisCategory === 'sleep' ? sleepMinutesForLog(log) : 1),
    0,
  );
  const analysisTotal = analysisValueForLogs(analysisCategoryLogs);
  const analysisPeriodLength = isAnalysisRangeValid
    ? Math.max(1, Math.round((dateFromLocalString(analysisRange.end).getTime() - dateFromLocalString(analysisRange.start).getTime()) / 86400000) + 1)
    : 1;
  const previousAnalysisRange = (() => {
    if (analysisView === 'daily') {
      const previousDate = shiftDate(analysisDate, -1);
      return { start: previousDate, end: previousDate };
    }
    if (analysisView === 'monthly') {
      const previousMonthDate = dateFromLocalString(`${analysisMonth}-01`);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      const previousMonth = localDateString(previousMonthDate).slice(0, 7);
      const [year, month] = previousMonth.split('-').map(Number);
      const currentEndDay = Number(analysisRange.end.slice(-2));
      const previousMonthEndDay = new Date(year, month, 0).getDate();
      const previousEndDay = Math.min(currentEndDay, previousMonthEndDay);
      return { start: `${previousMonth}-01`, end: `${previousMonth}-${String(previousEndDay).padStart(2, '0')}` };
    }
    const previousEnd = shiftDate(analysisRange.start, -1);
    const previousStart = shiftDate(previousEnd, -(analysisPeriodLength - 1));
    return { start: previousStart, end: previousEnd };
  })();
  const previousAnalysisLogs = routineLogs.filter((log) => {
    const date = logDateForAnalysis(log);
    return date >= previousAnalysisRange.start && date <= previousAnalysisRange.end && log.type === analysisCategory;
  });
  const previousAnalysisTotal = analysisValueForLogs(previousAnalysisLogs);
  const analysisCategories: Array<{
    id: RoutineLogEntry['type'];
    icon: typeof Moon;
    labelBn: string;
    labelEn: string;
    color: string;
    softColor: string;
  }> = [
    { id: 'sleep', icon: Moon, labelBn: 'ঘুম', labelEn: 'Sleep', color: '#4955A4', softColor: '#F0F1FF' },
    { id: 'feed', icon: Utensils, labelBn: 'খাওয়া', labelEn: 'Feeding', color: '#B95727', softColor: '#FFF2E9' },
    { id: 'diaper', icon: Baby, labelBn: 'ডায়াপার পরিবর্তন', labelEn: 'Diaper changes', color: '#28745C', softColor: '#EAF7F1' },
    { id: 'potty', icon: Droplets, labelBn: 'পটি', labelEn: 'Potty', color: '#61752D', softColor: '#F3F7E8' },
  ];
  const selectedAnalysisCategory = analysisCategories.find((category) => category.id === analysisCategory)!;
  const analysisChartData: Array<{ label: string; value: number; fullLabel: string }> = [];
  if (analysisView === 'daily' && isAnalysisRangeValid) {
    for (let startHour = 0; startHour < 24; startHour += 3) {
      const endHour = startHour + 3;
      const bucketLogs = analysisCategoryLogs.filter((log) => {
        const hour = logHourForAnalysis(log.time);
        return hour !== null && hour >= startHour && hour < endHour;
      });
      const label = `${formatLocalizedNumber(startHour, currentLang)}-${formatLocalizedNumber(endHour, currentLang)}`;
      analysisChartData.push({
        label,
        fullLabel: `${label} ${currentLang === 'bn' ? 'টা' : 'hours'}`,
        value: analysisValueForLogs(bucketLogs),
      });
    }
  } else if (isAnalysisRangeValid) {
    const bucketSize = analysisPeriodLength > 31 ? 7 : 1;
    for (let offset = 0; offset < analysisPeriodLength; offset += bucketSize) {
      const bucketStart = shiftDate(analysisRange.start, offset);
      const bucketEnd = shiftDate(analysisRange.start, Math.min(offset + bucketSize - 1, analysisPeriodLength - 1));
      const dayLogs = analysisCategoryLogs.filter((log) => {
        const date = logDateForAnalysis(log);
        return date >= bucketStart && date <= bucketEnd;
      });
      const dayNumber = Number(bucketStart.slice(-2));
      const label = bucketSize === 1
        ? (currentLang === 'bn' ? formatLocalizedNumber(dayNumber, currentLang) : String(dayNumber))
        : `${formatLocalizedNumber(Number(bucketStart.slice(-2)), currentLang)}-${formatLocalizedNumber(Number(bucketEnd.slice(-2)), currentLang)}`;
      analysisChartData.push({
        label,
        fullLabel: bucketSize === 1 ? bucketStart : `${bucketStart} - ${bucketEnd}`,
        value: analysisValueForLogs(dayLogs),
      });
    }
  }
  const analysisChartMax = Math.max(1, ...analysisChartData.map(({ value }) => value));
  const analysisPeriodLabel = analysisView === 'daily'
    ? (currentLang === 'bn' ? 'এই দিনের হিসাব' : "This day's activity")
    : analysisView === 'monthly'
      ? (currentLang === 'bn' ? 'দিন অনুযায়ী' : 'By day')
      : (currentLang === 'bn' ? 'দিন অনুযায়ী' : 'By day');
  const analysisComparisonLabel = analysisView === 'daily'
    ? (currentLang === 'bn' ? 'আগের দিনের তুলনায়' : 'vs. previous day')
    : analysisView === 'monthly'
      ? (currentLang === 'bn' ? 'আগের মাসের তুলনায়' : 'vs. previous month')
      : (currentLang === 'bn' ? 'আগের সমান সময়ের তুলনায়' : 'vs. previous period');
  const analysisDelta = analysisTotal - previousAnalysisTotal;
  const activeSleepElapsedSeconds = isCurrentChildSleeping && activeSleep
    ? Math.max(0, Math.floor((clockNow - Date.parse(activeSleep.startedAt)) / 1000))
    : 0;
  const activeSleepDuration = `${formatLocalizedNumber(String(Math.floor(activeSleepElapsedSeconds / 3600)).padStart(2, '0'), currentLang)}:${formatLocalizedNumber(String(Math.floor((activeSleepElapsedSeconds % 3600) / 60)).padStart(2, '0'), currentLang)}:${formatLocalizedNumber(String(activeSleepElapsedSeconds % 60).padStart(2, '0'), currentLang)}`;
  const activeSleepStart = activeSleep ? new Date(activeSleep.startedAt) : null;
  const activeSleepStartTime = activeSleepStart
    ? formatRoutineTime(`${String(activeSleepStart.getHours()).padStart(2, '0')}:${String(activeSleepStart.getMinutes()).padStart(2, '0')}`, currentLang)
    : '';

  const handleStartSleep = () => {
    const session = { childId: activeChild.id, startedAt: new Date().toISOString() };
    try {
      localStorage.setItem(activeSleepStorageKey(activeChild.id), JSON.stringify(session));
      setActiveSleep(session);
      setClockNow(Date.now());
      setSleepError('');
      setIsEntryOpen(false);
    } catch (error) {
      console.error('Unable to start sleep session.', error);
      setSleepError(currentLang === 'bn' ? 'ঘুমের সময় শুরু করা যায়নি। আবার চেষ্টা করুন।' : 'Could not start the sleep timer. Please try again.');
    }
  };

  const handleFinishSleep = () => {
    if (!isCurrentChildSleeping || !activeSleep) return;

    const startAt = new Date(activeSleep.startedAt);
    const endAt = new Date();
    const durationMinutes = Math.max(1, Math.floor((endAt.getTime() - startAt.getTime()) / 60000));
    const startTimeValue = `${String(startAt.getHours()).padStart(2, '0')}:${String(startAt.getMinutes()).padStart(2, '0')}`;
    const endTimeValue = `${String(endAt.getHours()).padStart(2, '0')}:${String(endAt.getMinutes()).padStart(2, '0')}`;
    const startTime = formatRoutineTime(startTimeValue, currentLang);
    const endTime = formatRoutineTime(endTimeValue, currentLang);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;

    try {
      onAddRoutineLog({
        id: `r_sleep_${activeChild.id}_${startAt.getTime()}`,
        type: 'sleep',
        date: localDateString(startAt),
        durationMinutes,
        time: startTime,
        titleBn: `ঘুম (${formatLocalizedNumber(durationHours, currentLang)} ঘণ্টা ${formatLocalizedNumber(remainingMinutes, currentLang)} মিনিট)`,
        titleEn: `Sleep (${durationHours}h ${remainingMinutes}m)`,
        detailsBn: `ঘুম শুরু: ${startTime} · ঘুম শেষ: ${endTime}`,
        detailsEn: `Started at ${startTime} · woke at ${endTime}`,
        iconType: 'moon',
      });
      localStorage.removeItem(activeSleepStorageKey(activeChild.id));
      setActiveSleep(null);
      setSleepError('');
      setLogDate(localDateString(startAt));
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2200);
    } catch (error) {
      console.error('Unable to finish sleep session.', error);
      setSleepError(currentLang === 'bn' ? 'ঘুমের এন্ট্রি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' : 'Could not save the sleep entry. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType === 'sleep' && sleepEntryMode === 'timer') return;

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
      const selectedDiaperType = diaperTypes.find((option) => option.id === diaperType)!;
      const selectedAmount = diaperAmountOptions.find((option) => option.id === diaperAmount)!;
      const selectedConsistency = stoolConsistencyOptions.find((option) => option.id === stoolConsistency)!;
      const includesStool = diaperType === 'stool' || diaperType === 'both';
      const diaperActivityBn = selectedDiaperType.label;
      const diaperActivityEn = diaperType === 'both' ? 'Urine and stool' : selectedDiaperType.labelEn;
      titleBn = `ডায়াপার পরিবর্তন · ${diaperActivityBn}`;
      titleEn = `Diaper change · ${diaperActivityEn}`;
      const detailsPartsBn = [
        includesStool ? `পায়খানার ধরন: ${selectedConsistency.label}` : '',
        `${diaperType === 'urine' ? 'প্রস্রাবের পরিমাণ' : 'পরিমাণ'}: ${selectedAmount.label}`,
      ].filter(Boolean);
      const detailsPartsEn = [
        includesStool ? `Consistency: ${selectedConsistency.labelEn}` : '',
        `${diaperType === 'urine' ? 'Urine amount' : 'Amount'}: ${selectedAmount.labelEn}`,
      ].filter(Boolean);
      detailsBn = [customNote.trim(), ...detailsPartsBn].filter(Boolean).join(' · ');
      detailsEn = [customNote.trim(), ...detailsPartsEn].filter(Boolean).join(' · ');
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
      {sleepError && (
        <div role="alert" className="rounded-xl border border-[#F2B8B5] bg-[#FFF4F2] px-4 py-3 text-sm font-semibold text-[#A3332B]">
          {sleepError}
        </div>
      )}

      {isCurrentChildSleeping && activeSleep && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#39458E] bg-[#4955A4] p-5 text-white shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Moon className="h-6 w-6" /></span>
            <div>
              <p className="text-sm font-semibold text-white/85">{currentLang === 'bn' ? 'ঘুম চলছে' : 'Sleep in progress'}</p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-wider" aria-live="off">{activeSleepDuration}</p>
              <p className="mt-1 text-xs text-white/75">{currentLang === 'bn' ? 'শুরু' : 'Started'} {activeSleepStartTime}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFinishSleep}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#39458E] shadow-sm transition hover:bg-[#F1F3FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            <CheckCircle2 className="h-5 w-5" />
            {currentLang === 'bn' ? 'ঘুম শেষ' : 'End sleep'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { id: 'feed', icon: Utensils, labelBn: 'খাওয়া', labelEn: 'Feeding', color: 'border-[#A9471C] bg-[#B95727] text-white hover:bg-[#A9471C]' },
          { id: 'sleep', icon: Moon, labelBn: 'ঘুম', labelEn: 'Sleep', color: 'border-[#39458E] bg-[#4955A4] text-white hover:bg-[#39458E]' },
          { id: 'diaper', icon: Baby, labelBn: 'ডায়াপার পরিবর্তন', labelEn: 'Diaper change', color: 'border-[#1F624D] bg-[#28745C] text-white hover:bg-[#1F624D]' },
          { id: 'potty', icon: Droplets, labelBn: 'পটি', labelEn: 'Potty', color: 'border-[#526324] bg-[#61752D] text-white hover:bg-[#526324]' },
        ].map(({ id, icon: Icon, labelBn, labelEn, color }) => {
          const openEntry = (type: 'feed' | 'sleep' | 'diaper' | 'potty') => {
            setSelectedType(type);
            if (type === 'sleep') setSleepEntryMode('timer');
            setLogDate(localDateString());
            setLogTime(currentTimeSlot());
            setShowAnalysis(false);
            setDiaperChoicesOpen(false);
            setIsEntryOpen(true);
          };

          if (id === 'diaper') {
            return (
              <div key={id} role="group" aria-label="ডায়াপার পরিবর্তনের ধরন বাছুন" className="group relative min-w-0">
                <button
                  type="button"
                  aria-expanded={diaperChoicesOpen}
                  onClick={() => setDiaperChoicesOpen((open) => !open)}
                  className={`flex min-h-24 w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-bold shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30 sm:min-h-28 sm:px-5 sm:text-lg ${color}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xs sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </span>
                  <span>{currentLang === 'bn' ? labelBn : labelEn}</span>
                </button>
                <div className={`absolute inset-0 z-10 grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-[#1F624D] bg-[#28745C] p-2 shadow-lg transition-all sm:gap-2 sm:p-3 ${diaperChoicesOpen ? 'visible opacity-100' : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'}`}>
                  {diaperTypes.map(({ id: type, label, sticker }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setDiaperType(type);
                        openEntry('diaper');
                      }}
                      className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-white/12 px-1 py-2 text-center text-xs font-bold leading-tight text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span className="text-xl sm:text-2xl" aria-hidden="true">{sticker}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <button
              key={id}
              type="button"
              disabled={id === 'sleep' && isCurrentChildSleeping}
              onClick={() => {
                if (id === 'sleep' && isCurrentChildSleeping) return;
                openEntry(id as 'feed' | 'sleep' | 'potty');
              }}
              className={`flex min-h-24 items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-bold shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-28 sm:px-5 sm:text-lg ${color}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xs sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <span>{id === 'sleep' && isCurrentChildSleeping ? (currentLang === 'bn' ? 'ঘুম চলছে' : 'Sleep in progress') : currentLang === 'bn' ? labelBn : labelEn}</span>
            </button>
          );
        })}
        <button
          type="button"
          aria-expanded={showAnalysis}
          onClick={() => {
            setIsEntryOpen(false);
            setShowAnalysis((show) => !show);
          }}
          className="flex min-h-24 items-center gap-3 rounded-2xl border-2 border-[#39458E] bg-[#4955A4] px-4 py-4 text-left text-base font-bold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-[#39458E] hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A5B1EE]/60 sm:min-h-28 sm:px-5 sm:text-lg"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xs sm:h-14 sm:w-14">
            <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <span>{currentLang === 'bn' ? 'বিশ্লেষণ' : 'Analysis'}</span>
        </button>
      </div>

      {showAnalysis && (
        <section className="space-y-6 rounded-3xl border border-[#E8E2DA] bg-white p-4 shadow-sm sm:p-6" aria-labelledby="routine-analysis-title">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#B95727]">{currentLang === 'bn' ? 'যত্নের অগ্রগতি' : 'CARE TRENDS'}</p>
            <h3 id="routine-analysis-title" className="mt-1 text-xl font-extrabold text-[#2D3142] sm:text-2xl">{currentLang === 'bn' ? `${childName}-এর বিশ্লেষণ` : `${childName}'s analysis`}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#667085]">{currentLang === 'bn' ? 'আপনার সংরক্ষিত এন্ট্রি থেকে ঘুম, খাওয়া, ডায়াপার ও পটির ধারাবাহিকতা দেখুন।' : 'Explore sleep, feeding, diaper, and potty patterns from your saved entries.'}</p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#F4F1EC] p-1.5" role="tablist" aria-label={currentLang === 'bn' ? 'বিশ্লেষণের সময়কাল' : 'Analysis period'}>
            {([
              { id: 'daily', bn: 'দৈনিক', en: 'Daily' },
              { id: 'monthly', bn: 'মাসিক', en: 'Monthly' },
              { id: 'range', bn: 'তারিখের রেঞ্জ', en: 'Date range' },
            ] as const).map(({ id, bn, en }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={analysisView === id}
                aria-controls="routine-analysis-chart"
                onClick={() => setAnalysisView(id)}
                className={`min-h-11 rounded-xl px-2 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B95727]/20 sm:px-4 ${analysisView === id ? 'bg-[#B95727] text-white shadow-sm' : 'text-[#5C6479] hover:bg-white'}`}
              >
                {currentLang === 'bn' ? bn : en}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {analysisView === 'daily' && (
              <label className={routineLabelClass}>
                {currentLang === 'bn' ? 'দিন বাছুন' : 'Select day'}
                <LocalizedDateInput currentLang={currentLang} type="date" max={localDateString()} value={analysisDate} onChange={(event) => setAnalysisDate(event.target.value)} className={routineFieldClass} />
              </label>
            )}
            {analysisView === 'monthly' && (
              <label className={routineLabelClass}>
                {currentLang === 'bn' ? 'মাস বাছুন' : 'Select month'}
                <LocalizedDateInput currentLang={currentLang} type="month" max={localDateString().slice(0, 7)} value={analysisMonth} onChange={(event) => setAnalysisMonth(event.target.value)} className={routineFieldClass} />
              </label>
            )}
            {analysisView === 'range' && (
              <>
                <label className={routineLabelClass}>
                  {currentLang === 'bn' ? 'শুরুর তারিখ' : 'Start date'}
                  <LocalizedDateInput currentLang={currentLang} type="date" max={localDateString()} value={analysisStartDate} onChange={(event) => setAnalysisStartDate(event.target.value)} className={routineFieldClass} />
                </label>
                <label className={routineLabelClass}>
                  {currentLang === 'bn' ? 'শেষের তারিখ' : 'End date'}
                  <LocalizedDateInput currentLang={currentLang} type="date" max={localDateString()} value={analysisEndDate} onChange={(event) => setAnalysisEndDate(event.target.value)} className={routineFieldClass} />
                </label>
              </>
            )}
          </div>

          {!isAnalysisRangeValid ? (
            <div role="alert" className="rounded-2xl border border-[#F2B8B5] bg-[#FFF4F2] p-4 text-sm font-semibold text-[#A3332B]">
              {currentLang === 'bn' ? 'শুরুর তারিখ শেষের তারিখের আগে হতে হবে।' : 'The start date must be on or before the end date.'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {analysisCategories.map(({ id, icon: Icon, labelBn, labelEn, color, softColor }) => {
                  const categoryLogs = analysisLogs.filter((log) => log.type === id);
                  const totalMinutes = categoryLogs.reduce((sum, log) => sum + sleepMinutesForLog(log), 0);
                  const value = id === 'sleep'
                    ? `${formatLocalizedNumber(Math.floor(totalMinutes / 60), currentLang)} ${currentLang === 'bn' ? 'ঘণ্টা' : 'h'} ${formatLocalizedNumber(totalMinutes % 60, currentLang)} ${currentLang === 'bn' ? 'মিনিট' : 'm'}`
                    : `${formatLocalizedNumber(categoryLogs.length, currentLang)} ${currentLang === 'bn' ? 'বার' : 'times'}`;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={analysisCategory === id}
                      onClick={() => setAnalysisCategory(id)}
                      className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B95727]/20 ${analysisCategory === id ? 'border-[#B95727] shadow-sm ring-2 ring-[#B95727]/10' : 'border-[#E8E2DA] hover:border-[#D6B9A5]'}`}
                      style={{ backgroundColor: analysisCategory === id ? softColor : '#FFFFFF' }}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-[#667085]">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: softColor, color }}><Icon className="h-5 w-5" /></span>
                        {currentLang === 'bn' ? labelBn : labelEn}
                      </span>
                      <span className="mt-3 block text-lg font-extrabold text-[#2D3142] sm:text-xl">{value}</span>
                    </button>
                  );
                })}
              </div>

              <div id="routine-analysis-chart" role="tabpanel" className="rounded-3xl border border-[#E8E2DA] bg-[#FFFCF9] p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#667085]">{currentLang === 'bn' ? selectedAnalysisCategory.labelBn : selectedAnalysisCategory.labelEn}</p>
                    <h4 className="mt-1 text-lg font-extrabold text-[#2D3142]">{analysisPeriodLabel}</h4>
                    <p className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: selectedAnalysisCategory.color }}>
                      {analysisCategory === 'sleep'
                        ? `${formatLocalizedNumber(Math.floor(analysisTotal / 60), currentLang)} ${currentLang === 'bn' ? 'ঘণ্টা' : 'h'} ${formatLocalizedNumber(analysisTotal % 60, currentLang)} ${currentLang === 'bn' ? 'মিনিট' : 'm'}`
                        : `${formatLocalizedNumber(analysisTotal, currentLang)} ${currentLang === 'bn' ? 'বার' : 'times'}`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E8E2DA] bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-[#667085]">{analysisComparisonLabel}</p>
                    <p className="mt-1 text-base font-extrabold text-[#2D3142]">
                      {analysisCategory === 'sleep'
                        ? `${formatLocalizedNumber(Math.floor(previousAnalysisTotal / 60), currentLang)} ${currentLang === 'bn' ? 'ঘণ্টা' : 'h'} ${formatLocalizedNumber(previousAnalysisTotal % 60, currentLang)} ${currentLang === 'bn' ? 'মিনিট' : 'm'}`
                        : `${formatLocalizedNumber(previousAnalysisTotal, currentLang)} ${currentLang === 'bn' ? 'বার' : 'times'}`}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#667085]">
                      {analysisDelta === 0
                        ? (currentLang === 'bn' ? 'কোনো পরিবর্তন নেই' : 'No change')
                        : currentLang === 'bn'
                          ? `${analysisDelta > 0 ? 'বেড়েছে' : 'কমেছে'} ${formatLocalizedNumber(Math.abs(analysisDelta), currentLang)} ${analysisCategory === 'sleep' ? 'মিনিট' : 'বার'}`
                          : `${analysisDelta > 0 ? 'Increased' : 'Decreased'} by ${formatLocalizedNumber(Math.abs(analysisDelta), currentLang)} ${analysisCategory === 'sleep' ? 'minutes' : 'times'}`}
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-2xl bg-white px-2 pb-3 pt-2" role="img" aria-label={currentLang === 'bn' ? `${selectedAnalysisCategory.labelBn} ${analysisView === 'daily' ? 'দিনের সময়ভিত্তিক' : 'তারিখভিত্তিক'} চার্ট` : `${selectedAnalysisCategory.labelEn} chart`}>
                  <div className="flex h-60 items-end gap-3 border-b border-l border-[#E8E2DA] px-3 pb-1 pt-3" style={{ minWidth: `${Math.max(520, analysisChartData.length * (analysisView === 'daily' ? 60 : 56))}px` }}>
                    {analysisChartData.map(({ label, value, fullLabel }, index) => {
                      const height = value ? Math.max(6, (value / analysisChartMax) * 165) : 4;
                      const shouldShowLabel = analysisView === 'daily' || analysisChartData.length <= 12 || index % 5 === 0 || index === analysisChartData.length - 1;
                      const dateLabel = analysisView === 'daily'
                        ? fullLabel
                        : fullLabel.includes(' - ')
                          ? fullLabel.split(' - ').map((date) => formatDateForLocale(date, currentLang)).join(' - ')
                          : formatDateForLocale(fullLabel, currentLang);
                      return (
                        <div key={`${fullLabel}-${index}`} className="flex h-full min-w-[42px] flex-1 flex-col items-center justify-end gap-2" title={`${dateLabel}: ${formatLocalizedNumber(value, currentLang)} ${analysisCategory === 'sleep' ? (currentLang === 'bn' ? 'মিনিট' : 'minutes') : (currentLang === 'bn' ? 'বার' : 'entries')}`}>
                          <span className="min-h-4 whitespace-nowrap text-[11px] font-semibold tabular-nums text-[#667085]">{value ? formatLocalizedNumber(value, currentLang) : ''}</span>
                          <div className="w-full max-w-9 shrink-0 rounded-t-lg transition-all" style={{ height: `${height}px`, backgroundColor: selectedAnalysisCategory.color, opacity: value ? 0.9 : 0.18 }} />
                          <span className="h-5 whitespace-nowrap text-[11px] font-semibold tabular-nums text-[#667085]">{shouldShowLabel ? label : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085]">
                  <span>{analysisCategory === 'sleep' ? (currentLang === 'bn' ? 'বারের উচ্চতা = ঘুমের মিনিট' : 'Bar height = sleep minutes') : (currentLang === 'bn' ? 'বারের উচ্চতা = এন্ট্রির সংখ্যা' : 'Bar height = number of entries')}</span>
                  <span>{currentLang === 'bn' ? 'শুধু সংরক্ষিত এন্ট্রির ভিত্তিতে' : 'Based only on saved entries'}</span>
                </div>
                {!analysisCategoryLogs.length && (
                  <p className="mt-4 rounded-xl bg-white px-4 py-3 text-center text-sm text-[#667085]">
                    {currentLang === 'bn' ? 'এই সময়ের জন্য এখনো কোনো এন্ট্রি নেই। এন্ট্রি যোগ করলে বিশ্লেষণ এখানে দেখা যাবে।' : 'No entries for this period yet. Add entries to see them here.'}
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* Selected day's summary */}
      <div className="rounded-3xl border border-[#214B3A] bg-[#285A45] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white">
            {currentLang === 'bn' ? (logDate === localDateString() ? 'আজকের সারাংশ' : `${formatDateForLocale(logDate, currentLang)}-এর সারাংশ`) : (logDate === localDateString() ? "Today's care summary" : `Summary for ${formatDateForLocale(logDate, currentLang)}`)}
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
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#202532]/65 p-2 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsEntryOpen(false);
          }}
        >
          <section
            ref={entryFormRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="routine-entry-title"
            tabIndex={-1}
            className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-[#E9DED3] bg-white p-5 shadow-[0_24px_80px_rgba(27,35,48,0.28)] animate-in fade-in zoom-in-95 duration-200 sm:max-h-[min(90dvh,860px)] sm:rounded-3xl sm:p-7"
          >
          <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-6 flex items-start justify-between gap-4 border-b border-[#F0E8E1] bg-white/95 px-5 pb-4 pt-5 backdrop-blur-sm sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4EC] text-[#2F6B47]"><SelectedTypeIcon className="h-6 w-6" /></span>
              <div>
                <h3 id="routine-entry-title" className="text-lg font-bold leading-snug text-[#25313D] sm:text-xl">{selectedType === 'diaper' || currentLang === 'bn' ? routineEntryTitles[selectedType].bn : routineEntryTitles[selectedType].en}</h3>
                <p className="mt-1 text-sm text-[#667085]">{childName} · {currentLang === 'bn' ? 'নতুন এন্ট্রি' : 'New entry'}</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsEntryOpen(false)} aria-label={currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'} className="shrink-0 rounded-xl p-2 text-[#667085] transition hover:bg-[#F4F1EC] hover:text-[#25313D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6B47]/15"><X className="h-5 w-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(selectedType !== 'sleep' || sleepEntryMode === 'manual') && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className={routineLabelClass}>{selectedType === 'diaper' || currentLang === 'bn' ? 'তারিখ' : 'Date'}<LocalizedDateInput currentLang={selectedType === 'diaper' ? 'bn' : currentLang} required max={localDateString()} value={logDate} onChange={(event) => setLogDate(event.target.value)} className={routineFieldClass} /></label>
              <label className={routineLabelClass}>{selectedType === 'diaper' || currentLang === 'bn' ? 'সময়' : 'Time'}<select required value={logTime} onChange={(event) => setLogTime(event.target.value)} className={routineFieldClass}>{timeOptions.map((time) => <option key={time} value={time}>{formatRoutineTime(time, selectedType === 'diaper' ? 'bn' : currentLang)}</option>)}</select></label>
            </div>}

            {selectedType === 'feed' && <div>
              <label className={routineLabelClass}>{currentLang === 'bn' ? 'কী খেয়েছে?' : 'What did the child eat?'}<select required value={feedItem} onChange={(event) => setFeedItem(event.target.value)} className={routineFieldClass}>{feedOptions.map((item) => <option key={item.id} value={item.id}>{currentLang === 'bn' ? item.labelBn : item.labelEn}</option>)}<option value="other">{currentLang === 'bn' ? 'অন্যান্য' : 'Other'}</option></select></label>
              {feedItem === 'other' && <input type="text" required value={customFeedItem} onChange={(event) => setCustomFeedItem(event.target.value)} placeholder={currentLang === 'bn' ? 'খাবারের নাম লিখুন' : 'Enter food name'} className={routineFieldClass} />}
            </div>}

            {selectedType === 'sleep' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F4F1EC] p-1.5" role="group" aria-label={currentLang === 'bn' ? 'ঘুমের এন্ট্রি পদ্ধতি' : 'Sleep entry method'}>
                  <button
                    type="button"
                    aria-pressed={sleepEntryMode === 'timer'}
                    onClick={() => setSleepEntryMode('timer')}
                    className={`min-h-11 rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4955A4]/20 ${sleepEntryMode === 'timer' ? 'bg-[#4955A4] text-white shadow-sm' : 'text-[#5C6479] hover:bg-white'}`}
                  >
                    {currentLang === 'bn' ? 'টাইমার দিয়ে' : 'Use timer'}
                  </button>
                  <button
                    type="button"
                    aria-pressed={sleepEntryMode === 'manual'}
                    onClick={() => setSleepEntryMode('manual')}
                    className={`min-h-11 rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4955A4]/20 ${sleepEntryMode === 'manual' ? 'bg-[#4955A4] text-white shadow-sm' : 'text-[#5C6479] hover:bg-white'}`}
                  >
                    {currentLang === 'bn' ? 'নিজে এন্ট্রি দিন' : 'Enter manually'}
                  </button>
                </div>

                {sleepEntryMode === 'timer' ? (
                  <div className="rounded-2xl border border-[#D8DDF5] bg-[#F5F6FF] p-5">
                    <p className="font-semibold text-[#39458E]">{currentLang === 'bn' ? 'ঘুম শুরু করলে সময় নিজে থেকেই চলবে' : 'The timer starts automatically when sleep begins'}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#5C6479]">
                      {currentLang === 'bn' ? 'অ্যাপ বন্ধ করলেও সময় গণনা চলবে। ঘুম শেষ হলে ফিরে এসে “ঘুম শেষ” চাপুন - সময় ও তারিখসহ এন্ট্রি নিজে থেকেই তৈরি হবে।' : 'The timer keeps running if you leave the app. When sleep ends, return and tap “End sleep” to save the duration, date, and time automatically.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleStartSleep}
                      className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#4955A4] px-5 text-base font-bold text-white shadow-sm transition hover:bg-[#39458E] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4955A4]/20"
                    >
                      <Moon className="h-5 w-5" />
                      {currentLang === 'bn' ? 'ঘুম শুরু করুন' : 'Start sleep'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 rounded-2xl border border-[#D8DDF5] bg-[#F5F6FF] p-5">
                    <p className="text-sm leading-relaxed text-[#5C6479]">{currentLang === 'bn' ? 'আগের ঘুমের শুরুর তারিখ, সময় ও মোট সময় লিখে এন্ট্রি সংরক্ষণ করুন।' : 'Enter when the sleep started and how long it lasted, then save the entry.'}</p>
                    <label className={routineLabelClass}>
                      {currentLang === 'bn' ? 'ঘুমের সময়কাল (মিনিট)' : 'Sleep duration (minutes)'}
                      <input type="number" min="1" step="1" required value={sleepDuration} onChange={(event) => setSleepDuration(Number(event.target.value))} placeholder="60" className={routineFieldClass} />
                    </label>
                  </div>
                )}
              </div>
            )}

            {selectedType === 'diaper' && (
              <>
                <label className={routineLabelClass}>
                  নোট (ঐচ্ছিক)
                  <textarea rows={3} value={customNote} onChange={(event) => setCustomNote(event.target.value)} placeholder="কোনো বিশেষ তথ্য লিখুন…" className={`${routineFieldClass} min-h-24 resize-y py-3`} />
                </label>

                {(diaperType === 'stool' || diaperType === 'both') && (
                  <fieldset>
                    <legend className={routineLabelClass}>পায়খানার ধরন</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {stoolConsistencyOptions.map(({ id, label, sticker }) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={stoolConsistency === id}
                          onClick={() => setStoolConsistency(id)}
                          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#28745C]/20 ${stoolConsistency === id ? 'border-[#28745C] bg-[#28745C] text-white shadow-sm' : 'border-[#D7E8DE] bg-white text-[#344054] hover:bg-[#F0FAF6]'}`}
                        >
                          <span aria-hidden="true">{sticker}</span>
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <fieldset>
                  <legend className={routineLabelClass}>{diaperType === 'urine' ? 'প্রস্রাবের পরিমাণ' : 'পরিমাণ'}</legend>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {diaperAmountOptions.map(({ id, label, sticker }) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={diaperAmount === id}
                        onClick={() => setDiaperAmount(id)}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#28745C]/20 ${diaperAmount === id ? 'border-[#28745C] bg-[#28745C] text-white shadow-sm' : 'border-[#D7E8DE] bg-white text-[#344054] hover:bg-[#F0FAF6]'}`}
                      >
                        <span aria-hidden="true">{sticker}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {selectedType === 'potty' && <label className={routineLabelClass}>{currentLang === 'bn' ? 'পটির অবস্থা' : 'Potty details'}<select value={pottyStatus} onChange={(event) => setPottyStatus(event.target.value)} className={routineFieldClass}><option value="স্বাভাবিক ও নরম">স্বাভাবিক ও নরম</option><option value="শুধু প্রস্রাব (ভেজা ডায়াপার)">শুধু প্রস্রাব (ভেজা ডায়াপার)</option><option value="সামান্য শক্ত (পানি কম)">সামান্য শক্ত (পানি কম)</option><option value="পাতলা পায়খানা">পাতলা পায়খানা</option></select></label>}

            {(selectedType !== 'sleep' && selectedType !== 'diaper' || selectedType === 'sleep' && sleepEntryMode === 'manual') && <label className={routineLabelClass}>{currentLang === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (optional)'}<textarea rows={3} value={customNote} onChange={(event) => setCustomNote(event.target.value)} placeholder={currentLang === 'bn' ? 'কোনো বিশেষ তথ্য লিখুন…' : 'Add any details…'} className={`${routineFieldClass} min-h-28 resize-y py-3`} /></label>}

            {(selectedType !== 'sleep' || sleepEntryMode === 'manual') && <button type="submit" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#2F6B47] px-5 text-base font-bold text-white shadow-sm transition hover:bg-[#1E432D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6B47]/20 active:scale-[.99]">
              <CheckCircle2 className="h-5 w-5" /> {selectedType === 'diaper' || currentLang === 'bn' ? 'এন্ট্রি সংরক্ষণ করুন' : 'Save entry'}
            </button>}
          </form>
          </section>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#2D3142]">{currentLang === 'bn' ? (logDate === localDateString() ? 'আজকের এন্ট্রি' : `${formatDateForLocale(logDate, currentLang)}-এর এন্ট্রি`) : (logDate === localDateString() ? "Today's entries" : `Entries for ${formatDateForLocale(logDate, currentLang)}`)}</h3>
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
