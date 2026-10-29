import React, { useEffect, useRef, useState } from 'react';
import { 
  Moon, 
  Baby, 
  CheckCircle2, 
  Droplets,
  Utensils,
  CalendarDays,
  ArrowLeft,
  Syringe,
  Check,
  X,
  LucideProps,
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
  diaper: { bn: 'ডায়পার পরিবর্তনের তথ্য লিখুন', en: 'Log a diaper change' },
  potty: { bn: 'পটির তথ্য লিখুন', en: 'Log potty' },
};

const routineFieldClass = 'mt-2 block min-h-12 w-full rounded-xl border border-[#E6DDD4] bg-white px-4 text-base text-[#2D3142] shadow-sm outline-none transition placeholder:text-[#98A2B3] focus:border-[#2F6B47] focus:ring-4 focus:ring-[#2F6B47]/10';
const routineLabelClass = 'block text-sm font-semibold text-[#344054]';

const DiaperIcon = React.forwardRef<SVGSVGElement, LucideProps>(({ className, ...props }, ref) => (
  <svg ref={ref} aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 5.5h15l-1.4 9.1a4 4 0 0 1-1.8 2.8L12 20l-4.3-2.6a4 4 0 0 1-1.8-2.8L4.5 5.5Z" />
    <path d="M4.8 8.5c2.4 1.2 4.8 1.8 7.2 1.8s4.8-.6 7.2-1.8M8 17.4c.4-2.6 1.8-4 4-4s3.6 1.4 4 4" />
    <path d="M7.3 6.4 8 8.1m8.7-1.7L16 8.1" />
  </svg>
));

const diaperTypes = [
  { id: 'urine', label: 'প্রস্রাব', labelEn: 'Urine', sticker: '💧' },
  { id: 'stool', label: 'পায়খানা', labelEn: 'Stool', sticker: '💩' },
  { id: 'both', label: 'দুটিই', labelEn: 'Both', sticker: '💧💩' },
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

type VaccineMilestone = {
  id: string;
  phase: 'pregnancy' | 'baby';
  offsetDays?: number;
  offsetMonths?: number;
  ageBn: string;
  ageEn: string;
  nameBn: string;
  nameEn: string;
  noteBn: string;
  noteEn: string;
  isReview?: boolean;
};

const pregnancyVaccineMilestones: VaccineMilestone[] = [
  {
    id: 'maternal-td-1',
    phase: 'pregnancy',
    offsetDays: 16 * 7,
    ageBn: 'গর্ভের ১৬ সপ্তাহ · ৪র্থ মাস',
    ageEn: '16 weeks pregnant · Month 4',
    nameBn: 'টিটি/টিডি — ১ম ডোজ',
    nameEn: 'TT/Td — Dose 1',
    noteBn: 'আগের টিকার ইতিহাস দেখে চিকিৎসক বা টিকাকর্মীর সাথে ডোজটি নিশ্চিত করুন।',
    noteEn: 'Confirm the dose with a clinician or vaccinator based on prior vaccination history.',
  },
  {
    id: 'maternal-td-2',
    phase: 'pregnancy',
    offsetDays: 21 * 7,
    ageBn: 'গর্ভের ২১ সপ্তাহ · ৬ষ্ঠ মাসের দিকে',
    ageEn: '21 weeks pregnant · Around Month 6',
    nameBn: 'টিটি/টিডি — ২য় ডোজ',
    nameEn: 'TT/Td — Dose 2',
    noteBn: 'প্রথম ডোজের অন্তত ১ মাস পরের সময়; আগের টিকার কার্ড ও স্বাস্থ্যকর্মীর পরামর্শ মেনে চলুন।',
    noteEn: 'Usually at least 1 month after the first dose; follow the vaccination card and health worker’s advice.',
  },
];

const babyVaccineMilestones: VaccineMilestone[] = [
  {
    id: 'baby-bcg',
    phase: 'baby',
    offsetDays: 0,
    ageBn: 'জন্মের সময়',
    ageEn: 'At birth',
    nameBn: 'বিসিজি (BCG)',
    nameEn: 'BCG',
    noteBn: 'জন্মের পর যত দ্রুত সম্ভব; না হয়ে থাকলে টিকাকেন্দ্রে যোগাযোগ করুন।',
    noteEn: 'As soon as possible after birth; contact an EPI center if missed.',
  },
  {
    id: 'baby-6-weeks',
    phase: 'baby',
    offsetDays: 42,
    ageBn: '৬ সপ্তাহ · প্রায় দেড় মাস',
    ageEn: '6 weeks · About 1.5 months',
    nameBn: 'পেন্টা-১, ওপিভি-১, পিসিভি-১ ও আইপিভি-১',
    nameEn: 'Penta-1, OPV-1, PCV-1 & IPV-1',
    noteBn: 'শিশুর টিকাকার্ড অনুযায়ী প্রথম সেটের টিকা দিন।',
    noteEn: 'First set of vaccines; follow the child’s EPI card.',
  },
  {
    id: 'baby-10-weeks',
    phase: 'baby',
    offsetDays: 70,
    ageBn: '১০ সপ্তাহ · প্রায় আড়াই মাস',
    ageEn: '10 weeks · About 2.5 months',
    nameBn: 'পেন্টা-২, ওপিভি-২ ও পিসিভি-২',
    nameEn: 'Penta-2, OPV-2 & PCV-2',
    noteBn: 'দ্বিতীয় ডোজগুলো টিকাকার্ডের তারিখে সম্পন্ন করুন।',
    noteEn: 'Complete the second doses on the dates in the EPI card.',
  },
  {
    id: 'baby-14-weeks',
    phase: 'baby',
    offsetDays: 98,
    ageBn: '১৪ সপ্তাহ · প্রায় সাড়ে তিন মাস',
    ageEn: '14 weeks · About 3.5 months',
    nameBn: 'পেন্টা-৩, ওপিভি-৩, পিসিভি-৩ ও আইপিভি-২',
    nameEn: 'Penta-3, OPV-3, PCV-3 & IPV-2',
    noteBn: 'এই পর্যায়ের ডোজের জন্য টিকাকার্ডের নির্দেশনা অনুসরণ করুন।',
    noteEn: 'Follow the EPI card for doses due at this stage.',
  },
  {
    id: 'baby-9-months',
    phase: 'baby',
    offsetMonths: 9,
    ageBn: '৯ মাস',
    ageEn: '9 months',
    nameBn: 'এমআর-১ ও ভিটামিন-এ',
    nameEn: 'MR-1 & Vitamin A',
    noteBn: 'জাতীয় টিকাকার্ড/স্বাস্থ্যকর্মীর নির্দেশনা অনুযায়ী।',
    noteEn: 'Follow the national vaccination card and health worker’s advice.',
  },
  {
    id: 'baby-15-months',
    phase: 'baby',
    offsetMonths: 15,
    ageBn: '১৫ মাস',
    ageEn: '15 months',
    nameBn: 'এমআর-২',
    nameEn: 'MR-2',
    noteBn: 'হাম-রুবেলার পরবর্তী ডোজের সময় টিকাকার্ডে মিলিয়ে নিন।',
    noteEn: 'Check the EPI card for the next measles-rubella dose.',
  },
  {
    id: 'baby-18-month-review',
    phase: 'baby',
    offsetMonths: 18,
    ageBn: '১৮ মাস',
    ageEn: '18 months',
    nameBn: 'টিকাকার্ড পর্যালোচনা',
    nameEn: 'Review the vaccination card',
    noteBn: 'স্বাস্থ্যকর্মীর সাথে বাকি বা অতিরিক্ত ডোজের সময় যাচাই করুন।',
    noteEn: 'Ask a health worker to check for any due or additional doses.',
    isReview: true,
  },
  {
    id: 'baby-24-month-review',
    phase: 'baby',
    offsetMonths: 24,
    ageBn: '২৪ মাস',
    ageEn: '24 months',
    nameBn: 'টিকাকার্ড পর্যালোচনা',
    nameEn: 'Review the vaccination card',
    noteBn: 'সব ডোজের রেকর্ড সম্পূর্ণ আছে কি না টিকাকার্ডে মিলিয়ে নিন।',
    noteEn: 'Check the vaccination card to make sure all doses are recorded.',
    isReview: true,
  },
];

const feedMethods = [
  { id: 'bottle', label: 'বোতল', labelEn: 'Bottle', sticker: '🍼' },
  { id: 'breastfeeding', label: 'ব্রেস্টফিডিং', labelEn: 'Breastfeeding', sticker: '🤱' },
  { id: 'solid', label: 'সলিড খাবার', labelEn: 'Solid food', sticker: '🥣' },
] as const;

const feedAmountUnits: Record<(typeof feedMethods)[number]['id'], readonly { id: string; label: string; labelEn: string }[]> = {
  bottle: [
    { id: 'ml', label: 'মিলিলিটার', labelEn: 'ml' },
    { id: 'oz', label: 'আউন্স', labelEn: 'oz' },
  ],
  breastfeeding: [
    { id: 'minutes', label: 'মিনিট', labelEn: 'minutes' },
  ],
  solid: [
    { id: 'spoon', label: 'চামচ', labelEn: 'spoons' },
    { id: 'bowl', label: 'বাটি', labelEn: 'bowls' },
    { id: 'piece', label: 'পিস', labelEn: 'pieces' },
  ],
};

const feedMethodOptions: Record<(typeof feedMethods)[number]['id'], typeof feedOptions[number][]> = {
  bottle: feedOptions.filter((item) => item.id === 'formula' || item.id === 'breastmilk'),
  breastfeeding: feedOptions.filter((item) => item.id === 'breastmilk'),
  solid: feedOptions.filter((item) => item.id !== 'formula' && item.id !== 'breastmilk'),
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

function dateFromLocalString(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function shiftDate(value: string, days: number) {
  const date = dateFromLocalString(value);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function addMonthsToDate(value: string, months: number) {
  const date = dateFromLocalString(value);
  const targetMonth = date.getMonth() + months;
  const targetDate = new Date(date.getFullYear(), targetMonth, 1);
  const lastDayOfTargetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
  targetDate.setDate(Math.min(date.getDate(), lastDayOfTargetMonth));
  return localDateString(targetDate);
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
  const [showVaccineJourney, setShowVaccineJourney] = useState(false);
  const [completedVaccines, setCompletedVaccines] = useState<string[]>([]);
  const [actualBirthDate, setActualBirthDate] = useState('');
  const [vaccineError, setVaccineError] = useState('');
  const [analysisView, setAnalysisView] = useState<'daily' | 'monthly' | 'range'>('daily');
  const [analysisCategory, setAnalysisCategory] = useState<RoutineLogEntry['type']>('sleep');
  const [analysisDate, setAnalysisDate] = useState(() => localDateString());
  const [analysisMonth, setAnalysisMonth] = useState(() => localDateString().slice(0, 7));
  const [analysisStartDate, setAnalysisStartDate] = useState(() => shiftDate(localDateString(), -6));
  const [analysisEndDate, setAnalysisEndDate] = useState(() => localDateString());
  const [logDate, setLogDate] = useState(() => localDateString());
  const [logTime, setLogTime] = useState(() => currentTimeSlot());
  const [feedItem, setFeedItem] = useState<string>(feedOptions[3].id);
  const [feedMethod, setFeedMethod] = useState<(typeof feedMethods)[number]['id']>('solid');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedAmountUnit, setFeedAmountUnit] = useState(feedAmountUnits.solid[0].id);
  const [customFeedItem, setCustomFeedItem] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<'feed' | 'diaper' | null>(null);
  const [sleepDuration, setSleepDuration] = useState(60);
  const [sleepEntryMode, setSleepEntryMode] = useState<'timer' | 'manual'>('timer');
  const [diaperType, setDiaperType] = useState<(typeof diaperTypes)[number]['id']>('urine');
  const [stoolConsistency, setStoolConsistency] = useState<(typeof stoolConsistencyOptions)[number]['id']>('solid');
  const [diaperAmount, setDiaperAmount] = useState<(typeof diaperAmountOptions)[number]['id']>('medium');
  const [pottyStatus, setPottyStatus] = useState('স্বাভাবিক ও নরম');
  const [customNote, setCustomNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSleep, setActiveSleep] = useState<ActiveSleepSession | null>(null);
  const [sleepError, setSleepError] = useState('');
  const [clockNow, setClockNow] = useState(() => Date.now());
  const entryFormRef = useRef<HTMLElement>(null);

  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;
  const isCurrentChildSleeping = activeSleep?.childId === activeChild.id;
  const vaccineStorageKey = `kuchupuchu_vaccine_journey_${activeChild.id}`;
  const expectedBirthDate = activeChild.isPregnant && activeChild.expectedDueDate
    ? activeChild.expectedDueDate
    : activeChild.birthDate;
  const vaccineAnchorDate = activeChild.isPregnant ? actualBirthDate || expectedBirthDate : activeChild.birthDate;
  const pregnancyStartDate = shiftDate(expectedBirthDate, -280);
  const vaccineTimeline = [
    ...(activeChild.isPregnant ? pregnancyVaccineMilestones : []),
    ...babyVaccineMilestones,
  ].map((milestone) => ({
    ...milestone,
    dueDate: milestone.phase === 'pregnancy'
      ? shiftDate(pregnancyStartDate, milestone.offsetDays ?? 0)
      : milestone.offsetMonths !== undefined
        ? addMonthsToDate(vaccineAnchorDate, milestone.offsetMonths)
        : shiftDate(vaccineAnchorDate, milestone.offsetDays ?? 0),
  }));
  const completedVaccineCount = vaccineTimeline.filter((milestone) => completedVaccines.includes(milestone.id)).length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(vaccineStorageKey);
      if (!saved) {
        setCompletedVaccines([]);
        setVaccineError('');
        return;
      }

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== 'string')) {
        throw new Error('Stored vaccine journey is invalid.');
      }
      setCompletedVaccines(parsed);
      setVaccineError('');
    } catch (error) {
      console.error('Unable to read vaccine journey.', error);
      setCompletedVaccines([]);
      setVaccineError(currentLang === 'bn' ? 'টিকার যাত্রার তথ্য পড়া যায়নি।' : 'Could not load the vaccination journey.');
    }
  }, [vaccineStorageKey, currentLang]);

  useEffect(() => {
    if (!activeChild.isPregnant) {
      setActualBirthDate('');
      return;
    }

    try {
      setActualBirthDate(localStorage.getItem(`kuchupuchu_actual_birth_date_${activeChild.id}`) ?? '');
    } catch (error) {
      console.error('Unable to read actual birth date for vaccine journey.', error);
      setVaccineError(currentLang === 'bn' ? 'প্রকৃত জন্মতারিখ পড়া যায়নি।' : 'Could not load the actual birth date.');
    }
  }, [activeChild.id, activeChild.isPregnant, currentLang]);

  const handleActualBirthDateChange = (value: string) => {
    try {
      const key = `kuchupuchu_actual_birth_date_${activeChild.id}`;
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
      setActualBirthDate(value);
      setVaccineError('');
    } catch (error) {
      console.error('Unable to save actual birth date for vaccine journey.', error);
      setVaccineError(currentLang === 'bn' ? 'প্রকৃত জন্মতারিখ সংরক্ষণ করা যায়নি।' : 'Could not save the actual birth date.');
    }
  };

  const toggleVaccineCompletion = (milestoneId: string) => {
    const next = completedVaccines.includes(milestoneId)
      ? completedVaccines.filter((id) => id !== milestoneId)
      : [...completedVaccines, milestoneId];
    try {
      localStorage.setItem(vaccineStorageKey, JSON.stringify(next));
      setCompletedVaccines(next);
      setVaccineError('');
    } catch (error) {
      console.error('Unable to save vaccine journey.', error);
      setVaccineError(currentLang === 'bn' ? 'টিকার তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' : 'Could not save vaccine progress. Please try again.');
    }
  };

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
    if (!isEntryOpen && !activeActionMenu && !showAnalysis && !showVaccineJourney) return;

    const dialog = entryFormRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector);

    document.body.style.overflow = 'hidden';
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeActionMenu) {
          setActiveActionMenu(null);
        } else if (showAnalysis) {
          setShowAnalysis(false);
        } else if (showVaccineJourney) {
          setShowVaccineJourney(false);
        } else {
          setIsEntryOpen(false);
        }
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
  }, [activeActionMenu, isEntryOpen, showAnalysis, showVaccineJourney]);

  const selectedDateLogs = routineLogs.filter((log) => (log.date ?? localDateString()) === logDate);
  const feedCount = selectedDateLogs.filter((log) => log.type === 'feed').length;
  const sleepLogs = selectedDateLogs.filter((log) => log.type === 'sleep');
  const totalSleepMinutes = sleepLogs.reduce((sum, log) => sum + sleepMinutesForLog(log), 0);
  const diaperCount = selectedDateLogs.filter((log) => log.type === 'diaper').length;
  const pottyCount = selectedDateLogs.filter((log) => log.type === 'potty').length;
  const totalCareEntries = feedCount + sleepLogs.length + diaperCount + pottyCount;
  const SelectedTypeIcon = selectedType === 'feed' ? Utensils : selectedType === 'sleep' ? Moon : selectedType === 'diaper' ? DiaperIcon : Droplets;
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
    { id: 'diaper', icon: DiaperIcon, labelBn: 'ডায়পার পরিবর্তন', labelEn: 'Diaper changes', color: '#28745C', softColor: '#EAF7F1' },
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
      const selectedFeed = feedMethodOptions[feedMethod].find((item) => item.id === feedItem);
      const foodBn = feedItem === 'other' ? customFeedItem.trim() : selectedFeed?.labelBn ?? '';
      const foodEn = feedItem === 'other' ? customFeedItem.trim() : selectedFeed?.labelEn ?? '';
      const method = feedMethods.find((item) => item.id === feedMethod)!;
      const amountUnit = feedAmountUnits[feedMethod].find((item) => item.id === feedAmountUnit) ?? feedAmountUnits[feedMethod][0];
      titleBn = feedMethod === 'breastfeeding' ? 'ব্রেস্টফিডিং' : `${method.label}: ${foodBn}`;
      titleEn = feedMethod === 'breastfeeding' ? 'Breastfeeding' : `${method.labelEn}: ${foodEn}`;
      const feedAmountDetailsBn = `${feedMethod === 'breastfeeding' ? 'খাওয়ানোর সময়' : 'পরিমাণ'}: ${formatLocalizedNumber(Number(feedAmount), currentLang)} ${amountUnit.label}`;
      const feedAmountDetailsEn = `${feedMethod === 'breastfeeding' ? 'Feeding duration' : 'Amount'}: ${feedAmount} ${amountUnit.labelEn}`;
      detailsBn = [customNote.trim(), feedAmountDetailsBn].filter(Boolean).join(' · ');
      detailsEn = [customNote.trim(), feedAmountDetailsEn].filter(Boolean).join(' · ');
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
      titleBn = `ডায়পার পরিবর্তন · ${diaperActivityBn}`;
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

  const openRoutineEntry = (type: 'feed' | 'sleep' | 'diaper' | 'potty') => {
    setSelectedType(type);
    if (type === 'sleep') setSleepEntryMode('timer');
    setLogDate(localDateString());
    setLogTime(currentTimeSlot());
    setShowAnalysis(false);
    setActiveActionMenu(null);
    setIsEntryOpen(true);
  };

  const openFeedEntry = (method: (typeof feedMethods)[number]['id']) => {
    setFeedMethod(method);
    setFeedItem(feedMethodOptions[method][0].id);
    setCustomFeedItem('');
    setFeedAmount('');
    setFeedAmountUnit(feedAmountUnits[method][0].id);
    openRoutineEntry('feed');
  };

  const openDiaperEntry = (type: (typeof diaperTypes)[number]['id']) => {
    setDiaperType(type);
    openRoutineEntry('diaper');
  };

  return (
    <section id="daily-routine" className="space-y-8">
      
      {/* Header */}
      <div>
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

      {showVaccineJourney ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#202532]/65 p-2 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowVaccineJourney(false);
          }}
        >
        <section ref={entryFormRef} role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby="vaccine-journey-title" className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col space-y-6 overflow-y-auto rounded-2xl border border-[#E9DED3] bg-white p-5 shadow-[0_24px_80px_rgba(27,35,48,0.28)] animate-in fade-in zoom-in-95 duration-200 sm:max-h-[min(90dvh,900px)] sm:rounded-3xl sm:p-7">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setShowVaccineJourney(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E8E2DA] bg-white text-[#475467] transition hover:bg-[#F8F5F1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30"
              aria-label={currentLang === 'bn' ? 'ট্র্যাকারে ফিরে যান' : 'Back to tracker'}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[#B95727]">
                <Syringe className="h-5 w-5" />
                <p className="text-xs font-bold uppercase tracking-wider">{currentLang === 'bn' ? 'সুরক্ষার পথচলা' : 'VACCINATION JOURNEY'}</p>
              </div>
              <h3 id="vaccine-journey-title" className="mt-1 text-xl font-extrabold text-[#2D3142] sm:text-2xl">{currentLang === 'bn' ? `${childName}-এর টিকার যাত্রা` : `${childName}'s vaccine journey`}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#667085]">
                {currentLang === 'bn'
                  ? activeChild.isPregnant ? 'গর্ভকালীন টিকা থেকে শিশুর ২৪ মাস পর্যন্ত ধাপে ধাপে মনে রাখুন।' : 'জন্ম থেকে ২৪ মাস পর্যন্ত টিকার ধাপগুলো মনে রাখুন।'
                  : activeChild.isPregnant ? 'Follow each step from pregnancy through your baby’s first 24 months.' : 'Keep track of each vaccine step from birth through 24 months.'}
              </p>
            </div>
            <button type="button" onClick={() => setShowVaccineJourney(false)} aria-label={currentLang === 'bn' ? 'টিকার যাত্রা বন্ধ করুন' : 'Close vaccine journey'} className="shrink-0 rounded-xl p-2 text-[#667085] transition hover:bg-[#F4F1EC] hover:text-[#25313D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B95727]/20"><X className="h-5 w-5" /></button>
          </div>

          <div className="rounded-2xl border border-[#F0D4C2] bg-[#FFFAF5] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#8F421F]">{currentLang === 'bn' ? 'যাত্রার অগ্রগতি' : 'Journey progress'}</p>
                <p className="mt-1 text-xs text-[#8C6D53]">{formatLocalizedNumber(completedVaccineCount, currentLang)} / {formatLocalizedNumber(vaccineTimeline.length, currentLang)} {currentLang === 'bn' ? 'ধাপ সম্পন্ন' : 'steps completed'}</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-sm font-extrabold text-[#B95727]">
                {Math.round((completedVaccineCount / Math.max(vaccineTimeline.length, 1)) * 100)}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0D4C2]">
              <div className="h-full rounded-full bg-[#E9753F] transition-all" style={{ width: `${(completedVaccineCount / Math.max(vaccineTimeline.length, 1)) * 100}%` }} />
            </div>
          </div>

          {vaccineError && (
            <div role="alert" className="rounded-xl border border-[#F2B8B5] bg-[#FFF4F2] px-4 py-3 text-sm font-semibold text-[#A3332B]">
              {vaccineError}
            </div>
          )}

          <div className="rounded-2xl border border-[#E6E9F2] bg-[#F7F8FC] p-4 text-sm leading-relaxed text-[#5C6479]">
            {currentLang === 'bn'
              ? 'এটি মনে রাখার সহায়ক তালিকা—টিকার সঠিক সময় ও ডোজ আপনার EPI টিকাকার্ড এবং স্বাস্থ্যকর্মীর পরামর্শ অনুযায়ী মিলিয়ে নিন। কোনো ডোজ বাদ পড়লে করণীয় জানতে টিকাকেন্দ্রে যোগাযোগ করুন।'
              : 'This is a reminder, not a medical schedule. Confirm exact timing and doses with your EPI card and health worker. Contact an EPI center for advice if a dose was missed.'}
          </div>

          {activeChild.isPregnant && (
            <label className={routineLabelClass}>
              {currentLang === 'bn' ? 'শিশুর প্রকৃত জন্মতারিখ (জন্মের পর যোগ করুন)' : 'Baby’s actual birth date (add after birth)'}
              <LocalizedDateInput
                currentLang={currentLang}
                max={localDateString()}
                value={actualBirthDate}
                onChange={(event) => handleActualBirthDateChange(event.target.value)}
                className={routineFieldClass}
              />
              <span className="mt-2 block text-xs font-normal leading-relaxed text-[#667085]">
                {currentLang === 'bn'
                  ? 'জন্মতারিখ দিলে শিশুর পরবর্তী টিকার তারিখ সম্ভাব্য প্রসবের তারিখ নয়, প্রকৃত জন্মতারিখ থেকে গণনা হবে।'
                  : 'After you add it, your baby’s vaccine dates will be calculated from the actual birth date instead of the due date.'}
              </span>
            </label>
          )}

          <div className="space-y-7">
            {(activeChild.isPregnant
              ? [
                { phase: 'pregnancy' as const, labelBn: 'গর্ভকালীন মায়ের টিকা', labelEn: 'Vaccines during pregnancy' },
                { phase: 'baby' as const, labelBn: 'জন্ম থেকে ২৪ মাস', labelEn: 'Birth to 24 months' },
              ]
              : [{ phase: 'baby' as const, labelBn: 'জন্ম থেকে ২৪ মাস', labelEn: 'Birth to 24 months' }]
            ).map((group) => {
              const milestones = vaccineTimeline.filter((milestone) => milestone.phase === group.phase);
              return (
                <div key={group.phase}>
                  <h4 className="mb-4 text-base font-extrabold text-[#344054]">{currentLang === 'bn' ? group.labelBn : group.labelEn}</h4>
                  <div className="relative space-y-4 before:absolute before:bottom-5 before:left-[15px] before:top-5 before:w-0.5 before:bg-[#E9DED3]">
                    {milestones.map((milestone) => {
                      const completed = completedVaccines.includes(milestone.id);
                      const overdue = milestone.dueDate < localDateString() && !completed;
                      const dueSoon = milestone.dueDate >= localDateString()
                        && milestone.dueDate <= shiftDate(localDateString(), 14)
                        && !completed;
                      const statusLabel = completed
                        ? currentLang === 'bn' ? 'সম্পন্ন' : 'Completed'
                        : overdue
                          ? currentLang === 'bn' ? 'সময় পেরিয়েছে' : 'Past due'
                          : dueSoon
                            ? currentLang === 'bn' ? 'শিগগিরই' : 'Due soon'
                            : currentLang === 'bn' ? 'পরবর্তী ধাপ' : 'Upcoming';
                      return (
                        <article key={milestone.id} className="relative pl-10">
                          <span className={`absolute left-0 top-5 z-10 grid h-8 w-8 place-items-center rounded-full border-2 ${completed ? 'border-[#2F6B47] bg-[#2F6B47] text-white' : overdue ? 'border-[#E9753F] bg-[#FFF2E9] text-[#B95727]' : 'border-[#E8DCD1] bg-white text-[#A5ADA7]'}`}>
                            {completed ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                          </span>
                          <div className={`rounded-2xl border p-4 transition-colors sm:p-5 ${completed ? 'border-[#CDE5D1] bg-[#F5FAF6]' : overdue ? 'border-[#F0D4C2] bg-[#FFFAF5]' : 'border-[#E8E2DA] bg-white opacity-75'}`}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-[#8C6D53]">{currentLang === 'bn' ? milestone.ageBn : milestone.ageEn}</p>
                                <h5 className="mt-1 text-base font-extrabold text-[#2D3142]">{currentLang === 'bn' ? milestone.nameBn : milestone.nameEn}</h5>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${completed ? 'bg-[#EAF4EC] text-[#2F6B47]' : overdue ? 'bg-[#FFF0E8] text-[#A84D26]' : 'bg-[#F4F1EC] text-[#78837D]'}`}>{statusLabel}</span>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-[#667085]">
                              {currentLang === 'bn' ? 'সম্ভাব্য তারিখ' : 'Estimated date'}: {formatDateForLocale(milestone.dueDate, currentLang)}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-[#667085]">{currentLang === 'bn' ? milestone.noteBn : milestone.noteEn}</p>
                            <button
                              type="button"
                              aria-pressed={completed}
                              onClick={() => toggleVaccineCompletion(milestone.id)}
                              className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2F6B47]/20 sm:w-auto ${completed ? 'border border-[#CDE5D1] bg-white text-[#2F6B47] hover:bg-[#F5FAF6]' : 'bg-[#2F6B47] text-white hover:bg-[#1E432D]'}`}
                            >
                              {completed && <Check className="h-4 w-4" />}
                              {completed
                                ? currentLang === 'bn' ? 'সম্পন্ন হয়েছে · বাতিল করুন' : 'Completed · Undo'
                                : milestone.isReview
                                  ? currentLang === 'bn' ? 'পর্যালোচনা সম্পন্ন' : 'Mark review complete'
                                  : currentLang === 'bn' ? 'টিকা নেওয়া হয়েছে' : 'Mark vaccine as received'}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        </div>
      ) : activeActionMenu ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#202532]/65 p-2 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveActionMenu(null);
          }}
        >
          <section
            ref={entryFormRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="routine-action-menu-title"
            tabIndex={-1}
            className="relative my-auto flex w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-[#E9DED3] bg-white p-5 shadow-[0_24px_80px_rgba(27,35,48,0.28)] animate-in fade-in zoom-in-95 duration-200 sm:rounded-3xl sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#F0E8E1] pb-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activeActionMenu === 'feed' ? 'bg-[#FFF2E9] text-[#B95727]' : 'bg-[#EAF7F1] text-[#28745C]'}`}>
                  {activeActionMenu === 'feed' ? <Utensils className="h-6 w-6" /> : <Baby className="h-6 w-6" />}
                </span>
                <div>
                  <h3 id="routine-action-menu-title" className="text-lg font-bold leading-snug text-[#25313D] sm:text-xl">
                    {activeActionMenu === 'feed'
                      ? currentLang === 'bn' ? 'খাবারের ধরন বেছে নিন' : 'Choose a feeding type'
                      : currentLang === 'bn' ? 'ডায়পারে কী হয়েছে?' : 'Choose a diaper entry'}
                  </h3>
                  <p className="mt-1 text-sm text-[#667085]">{childName} · {currentLang === 'bn' ? 'নতুন এন্ট্রি' : 'New entry'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionMenu(null)}
                aria-label={currentLang === 'bn' ? 'বন্ধ করুন' : 'Close'}
                className="shrink-0 rounded-xl p-2 text-[#667085] transition hover:bg-[#F4F1EC] hover:text-[#25313D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`rounded-2xl border p-4 sm:p-5 ${activeActionMenu === 'feed' ? 'border-[#F0D4C2] bg-[#FFFAF5]' : 'border-[#D7E8DE] bg-[#F4FAF7]'}`}>
              <p className={`mb-4 text-sm font-bold ${activeActionMenu === 'feed' ? 'text-[#8F421F]' : 'text-[#1F624D]'}`}>
                {activeActionMenu === 'feed'
                  ? currentLang === 'bn' ? 'যে ধরনের খাবারের এন্ট্রি দিতে চান, সেটি বেছে নিন।' : 'Choose the feeding type you want to log.'
                  : currentLang === 'bn' ? 'যে তথ্যটি লিখতে চান, সেটি বেছে নিন।' : 'Choose what you want to log.'}
              </p>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#F4F1EC] p-1.5" role="group" aria-label={activeActionMenu === 'feed' ? (currentLang === 'bn' ? 'খাবারের ধরন' : 'Feeding type') : (currentLang === 'bn' ? 'ডায়পারের ধরন' : 'Diaper type')}>
                {activeActionMenu === 'feed'
                  ? feedMethods.map(({ id: method, label, labelEn, sticker }) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => openFeedEntry(method)}
                      className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-center text-sm font-bold text-[#5C6479] transition hover:bg-[#B95727] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B95727]/20 sm:min-h-16 sm:flex-row sm:gap-2 sm:px-3 sm:text-base"
                    >
                      <span className="text-2xl leading-none" aria-hidden="true">{sticker}</span>
                      <span>{currentLang === 'bn' ? label : labelEn}</span>
                    </button>
                  ))
                  : diaperTypes.map(({ id: type, label, labelEn, sticker }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => openDiaperEntry(type)}
                      className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-center text-sm font-bold text-[#5C6479] transition hover:bg-[#28745C] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#28745C]/20 sm:min-h-16 sm:flex-row sm:gap-2 sm:px-3 sm:text-base"
                    >
                      <span className="text-2xl leading-none" aria-hidden="true">{sticker}</span>
                      <span>{currentLang === 'bn' ? label : labelEn}</span>
                    </button>
                  ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { id: 'feed', icon: Utensils, labelBn: 'খাওয়া', labelEn: 'Feeding', color: 'border-[#A9471C] bg-[#B95727] text-white hover:bg-[#A9471C]' },
            { id: 'sleep', icon: Moon, labelBn: 'ঘুম', labelEn: 'Sleep', color: 'border-[#39458E] bg-[#4955A4] text-white hover:bg-[#39458E]' },
            { id: 'diaper', icon: DiaperIcon, labelBn: 'ডায়পার পরিবর্তন', labelEn: 'Diaper change', color: 'border-[#1F624D] bg-[#28745C] text-white hover:bg-[#1F624D]' },
            { id: 'vaccine', icon: Syringe, labelBn: 'টিকা', labelEn: 'Vaccines', color: 'border-[#A9471C] bg-[#B95727] text-white hover:bg-[#A9471C]' },
          ].map(({ id, icon: Icon, labelBn, labelEn, color }) => (
            <button
              key={id}
              type="button"
              disabled={id === 'sleep' && isCurrentChildSleeping}
              onClick={() => {
                if (id === 'sleep' && isCurrentChildSleeping) return;
                if (id === 'feed' || id === 'diaper') {
                  setActiveActionMenu(id);
                  setShowAnalysis(false);
                  return;
                }
                if (id === 'vaccine') {
                  setShowVaccineJourney(true);
                  setShowAnalysis(false);
                  return;
                }
                openRoutineEntry('sleep');
              }}
              className={`flex min-h-24 items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-bold shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB07C]/30 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-28 sm:px-5 sm:text-lg ${color}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white shadow-xs sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <span>{id === 'sleep' && isCurrentChildSleeping ? (currentLang === 'bn' ? 'ঘুম চলছে' : 'Sleep in progress') : currentLang === 'bn' ? labelBn : labelEn}</span>
            </button>
          ))}
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
      )}

      {showAnalysis && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#202532]/65 p-2 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAnalysis(false);
          }}
        >
        <section ref={entryFormRef} role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby="routine-analysis-title" className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl border border-[#E9DED3] bg-white p-5 shadow-[0_24px_80px_rgba(27,35,48,0.28)] animate-in fade-in zoom-in-95 duration-200 sm:max-h-[min(90dvh,900px)] sm:rounded-3xl sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#F0E8E1] pb-4">
            <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#B95727]">{currentLang === 'bn' ? 'যত্নের অগ্রগতি' : 'CARE TRENDS'}</p>
            <h3 id="routine-analysis-title" className="mt-1 text-xl font-extrabold text-[#2D3142] sm:text-2xl">{currentLang === 'bn' ? `${childName}-এর বিশ্লেষণ` : `${childName}'s analysis`}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#667085]">{currentLang === 'bn' ? 'আপনার সংরক্ষিত এন্ট্রি থেকে ঘুম, খাওয়া, ডায়পার ও পটির ধারাবাহিকতা দেখুন।' : 'Explore sleep, feeding, diaper, and potty patterns from your saved entries.'}</p>
            </div>
            <button type="button" onClick={() => setShowAnalysis(false)} aria-label={currentLang === 'bn' ? 'বিশ্লেষণ বন্ধ করুন' : 'Close analysis'} className="shrink-0 rounded-xl p-2 text-[#667085] transition hover:bg-[#F4F1EC] hover:text-[#25313D] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B95727]/20"><X className="h-5 w-5" /></button>
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
        </div>
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
            <div><p className="text-xs text-[#667085]">{currentLang === 'bn' ? 'ডায়পার পরিবর্তন' : 'Diaper changes'}</p><p className="text-lg font-extrabold text-[#2D3142]">{formatLocalizedNumber(diaperCount, currentLang)} {currentLang === 'bn' ? 'বার' : 'times'}</p></div>
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

            {selectedType === 'feed' && (
              <div className="space-y-4 rounded-2xl border border-[#F0D4C2] bg-[#FFFAF5] p-4 sm:p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-[#8F421F]">
                  <span aria-hidden="true">{feedMethods.find((item) => item.id === feedMethod)?.sticker}</span>
                  {feedMethods.find((item) => item.id === feedMethod)?.label}
                </p>
                {feedMethod === 'breastfeeding' ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#F0D4C2] bg-white p-4">
                    <span className="text-2xl" aria-hidden="true">🤱</span>
                    <span className="font-semibold text-[#344054]">মায়ের বুকের দুধ</span>
                  </div>
                ) : (
                  <div>
                    <label className={routineLabelClass}>
                      {currentLang === 'bn'
                        ? feedMethod === 'bottle' ? 'বোতলে কী দিয়েছেন?' : 'কী খেয়েছে?'
                        : feedMethod === 'bottle' ? 'What was in the bottle?' : 'What did your baby eat?'}
                      <select required value={feedItem} onChange={(event) => setFeedItem(event.target.value)} className={routineFieldClass}>
                        {feedMethodOptions[feedMethod].map((item) => <option key={item.id} value={item.id}>{currentLang === 'bn' ? item.labelBn : item.labelEn}</option>)}
                        <option value="other">{currentLang === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                      </select>
                    </label>
                    {feedItem === 'other' && <input type="text" required value={customFeedItem} onChange={(event) => setCustomFeedItem(event.target.value)} placeholder={currentLang === 'bn' ? feedMethod === 'bottle' ? 'দুধের নাম লিখুন' : 'খাবারের নাম লিখুন' : feedMethod === 'bottle' ? 'Enter the milk type' : 'Enter the food name'} className={routineFieldClass} />}
                  </div>
                )}
                <label className={routineLabelClass}>
                  {currentLang === 'bn' ? feedMethod === 'breastfeeding' ? 'খাওয়ানোর সময়' : 'পরিমাণ' : feedMethod === 'breastfeeding' ? 'Feeding duration' : 'Amount'}
                  <span className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      value={feedAmount}
                      onChange={(event) => setFeedAmount(event.target.value)}
                      placeholder={feedMethod === 'breastfeeding' ? '10' : feedMethod === 'bottle' ? '120' : '1'}
                      className={routineFieldClass}
                    />
                    <select required value={feedAmountUnit} onChange={(event) => setFeedAmountUnit(event.target.value)} className="mt-2 min-h-12 rounded-xl border border-[#E6DDD4] bg-white px-3 text-base text-[#2D3142] shadow-sm outline-none transition focus:border-[#2F6B47] focus:ring-4 focus:ring-[#2F6B47]/10">
                      {feedAmountUnits[feedMethod].map((unit) => <option key={unit.id} value={unit.id}>{currentLang === 'bn' ? unit.label : unit.labelEn}</option>)}
                    </select>
                  </span>
                </label>
              </div>
            )}

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

            {selectedType === 'potty' && <label className={routineLabelClass}>{currentLang === 'bn' ? 'পটির অবস্থা' : 'Potty details'}<select value={pottyStatus} onChange={(event) => setPottyStatus(event.target.value)} className={routineFieldClass}><option value="স্বাভাবিক ও নরম">স্বাভাবিক ও নরম</option><option value="শুধু প্রস্রাব (ভেজা ডায়পার)">শুধু প্রস্রাব (ভেজা ডায়পার)</option><option value="সামান্য শক্ত (পানি কম)">সামান্য শক্ত (পানি কম)</option><option value="পাতলা পায়খানা">পাতলা পায়খানা</option></select></label>}

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
