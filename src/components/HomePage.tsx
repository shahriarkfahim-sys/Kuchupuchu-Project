import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Baby,
  Check,
  ChevronDown,
  Activity,
  BookOpen,
  Heart,
  MessageCircle,
  PenTool,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { JourneyAnimation } from './JourneyAnimation';
import { HowItWorksJourney } from './HowItWorksJourney';
import './HomePage.css';

const hookEndingsByLanguage: Record<Language, string[]> = {
  bn: ['বেড়ে ওঠা হচ্ছে তো?', 'যত্ন নেওয়া হচ্ছে তো?', 'রুটিন মেনে চলা হচ্ছে তো?'],
  en: ['growing just right?', 'getting the right care?', 'in a good routine?'],
};

const sampleNamesByLanguage: Record<Language, string[]> = {
  bn: ['আয়ান', 'মেহের'],
  en: ['Ayan', 'Meher'],
};

interface HomePageProps {
  currentLang: Language;
  onGoToDashboard: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onGoToTracker: () => void;
  onGoToPlay: () => void;
  onGoToDiary: () => void;
  onGoToForum?: () => void;
  onStartWithChildName: (name: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentLang,
  onGoToDashboard,
  onOpenAuth,
  onGoToTracker,
  onGoToPlay,
  onGoToDiary,
  onGoToForum,
  onStartWithChildName,
}) => {
  const t = translations[currentLang];
  const isBangla = currentLang === 'bn';
  const [childName, setChildName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [sampleName, setSampleName] = useState('');
  const [animatedHook, setAnimatedHook] = useState('');
  const hookEndings = hookEndingsByLanguage[currentLang];
  const sampleNames = sampleNamesByLanguage[currentLang];

  useEffect(() => {
    let hookIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let timeoutId: number;

    const step = () => {
      const characters = Array.from(
        new Intl.Segmenter(isBangla ? 'bn' : 'en', { granularity: 'grapheme' })
          .segment(hookEndings[hookIndex]),
        ({ segment }) => segment,
      );

      if (isDeleting) {
        characterIndex -= 1;
        setAnimatedHook(characters.slice(0, characterIndex).join(''));
        if (characterIndex === 0) {
          isDeleting = false;
          hookIndex = (hookIndex + 1) % hookEndings.length;
          timeoutId = window.setTimeout(step, 450);
          return;
        }
      } else {
        characterIndex += 1;
        setAnimatedHook(characters.slice(0, characterIndex).join(''));
        if (characterIndex === characters.length) {
          isDeleting = true;
          timeoutId = window.setTimeout(step, 1800);
          return;
        }
      }

      timeoutId = window.setTimeout(step, 130);
    };

    timeoutId = window.setTimeout(step, 700);
    return () => window.clearTimeout(timeoutId);
  }, [currentLang, hookEndings]);

  useEffect(() => {
    if (childName || isNameFocused) {
      setSampleName('');
      return;
    }

    let nameIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    let timeoutId: number;

    const step = () => {
      const characters = Array.from(
        new Intl.Segmenter(isBangla ? 'bn' : 'en', { granularity: 'grapheme' })
          .segment(sampleNames[nameIndex]),
        ({ segment }) => segment,
      );

      characterIndex += isDeleting ? -1 : 1;
      setSampleName(characters.slice(0, characterIndex).join(''));

      if (!isDeleting && characterIndex === characters.length) {
        isDeleting = true;
        timeoutId = window.setTimeout(step, 1800);
        return;
      }

      if (isDeleting && characterIndex === 0) {
        isDeleting = false;
        nameIndex = (nameIndex + 1) % sampleNames.length;
        timeoutId = window.setTimeout(step, 650);
        return;
      }

      timeoutId = window.setTimeout(step, 300);
    };

    timeoutId = window.setTimeout(step, 900);
    return () => window.clearTimeout(timeoutId);
  }, [childName, currentLang, isNameFocused, sampleNames]);

  const renderChildNameInput = (id: string) => (
    <div className="relative flex flex-1 items-center px-3">
      <input
        id={id}
        type="text"
        value={childName}
        onChange={(event) => setChildName(event.target.value)}
        onFocus={() => setIsNameFocused(true)}
        onBlur={() => setIsNameFocused(false)}
        placeholder=""
        className="min-w-0 w-full rounded-xl bg-transparent py-3 text-sm text-[#25313D] outline-none sm:rounded-none"
      />
      {!childName && !isNameFocused && (
        <span aria-hidden="true" className="pointer-events-none absolute left-3 flex items-center whitespace-nowrap text-sm text-[#9AA4A0]">
          <span>{isBangla ? 'সন্তানের নাম লিখুন:' : 'Enter your child’s name:'}</span>
          <span className="ml-1 text-[#D66A37]">
            {sampleName}
            <span className="ml-0.5 animate-pulse text-[#E9753F]">|</span>
          </span>
        </span>
      )}
    </div>
  );

  const faqs = isBangla
    ? [
        {
          question: 'কুচুপুচু কীভাবে সন্তানের বিকাশে সাহায্য করে?',
          answer: 'বয়সভিত্তিক মাইলস্টোন, সহজ ঘরোয়া খেলা এবং আপনার দেওয়া তথ্য এক জায়গায় সাজিয়ে রাখে—যাতে সন্তানের বেড়ে ওঠা বুঝতে সুবিধা হয়।',
        },
        {
          question: 'এটি কি চিকিৎসকের পরামর্শের বিকল্প?',
          answer: 'না। কুচুপুচু তথ্য ও পর্যবেক্ষণে সহায়তা করে, তবে কোনো উদ্বেগ বা স্বাস্থ্যসংক্রান্ত প্রশ্নে শিশু বিশেষজ্ঞের পরামর্শ নিন।',
        },
        {
          question: 'কোন বয়সের শিশুর জন্য এটি ব্যবহার করা যাবে?',
          answer: 'জন্ম থেকে ২৪ মাস পর্যন্ত বয়সভিত্তিক মাইলস্টোন ও কার্যক্রম দেখতে পারবেন।',
        },
        {
          question: 'শুরু করতে কী কী তথ্য লাগবে?',
          answer: 'শুরুতে সন্তানের নাম লিখুন। এরপর চাইলে প্রোফাইলে জন্মতারিখসহ আরও তথ্য যোগ করতে পারবেন।',
        },
      ]
    : [
        {
          question: 'How does Kuchupuchu support my child’s development?',
          answer: 'It brings age-based milestones, simple at-home play ideas, and your observations together to make your child’s growth easier to follow.',
        },
        {
          question: 'Is this a substitute for medical advice?',
          answer: 'No. Kuchupuchu supports learning and observation. Please consult a pediatrician about health questions or concerns.',
        },
        {
          question: 'What age range does it cover?',
          answer: 'You can explore age-based milestones and activities from birth through 24 months.',
        },
        {
          question: 'What do I need to get started?',
          answer: 'Start by entering your child’s name. You can add details such as their birth date to the profile later.',
        },
      ];

  return (
    <div className="space-y-16 pb-12 sm:space-y-20">
      <section className="space-y-6 sm:space-y-8">
        <JourneyAnimation currentLang={currentLang} className="w-full" />

        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="mx-auto max-w-none text-[clamp(20px,6vw,46px)] font-extrabold leading-tight tracking-tight text-[#25313D]">
            <span className="block whitespace-nowrap text-[#D66A37]">{isBangla ? 'আপনার ছোট্ট সোনামণির ঠিকঠাক' : 'Your little one is doing well'}</span>
            <span className="block min-h-[1.2em] whitespace-nowrap text-[#25313D]">
              {animatedHook}
              <span className="ml-0.5 animate-pulse">|</span>
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#697582] sm:text-base">
            {isBangla
              ? 'সন্তান পালনে আপনার অনভিজ্ঞতা, ব্যস্ততা কিংবা ভুলে যাওয়ার শঙ্কা - এখন দূর হবে ২ মিনিটে।'
              : 'Inexperience, a busy schedule, or fear of forgetting in parenting—now put behind you in 2 minutes.'}
          </p>

          <form
            className="mx-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-[#E5E9E8] bg-white p-2 shadow-[0_10px_30px_rgba(33,55,43,0.08)] sm:flex-row sm:items-center sm:rounded-full sm:pl-5"
            onSubmit={(event) => {
              event.preventDefault();
              onStartWithChildName(childName.trim());
            }}
          >
            <label htmlFor="hero-child-name" className="sr-only">
              {isBangla ? 'সন্তানের নাম' : 'Child’s name'}
            </label>
            {renderChildNameInput('hero-child-name')}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E9753F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D86430] sm:rounded-full"
            >
              <span>{isBangla ? 'শুরু করুন' : 'Get started'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="block text-xs font-medium text-[#828D88] underline decoration-[#C8D0CC] underline-offset-4 transition-colors hover:text-[#C85D26]"
            >
              {isBangla ? 'সন্তান গর্ভাবস্থায়? সাইন আপ করুন' : 'Baby on the way? Sign up'}
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="block text-xs font-medium text-[#828D88] underline decoration-[#C8D0CC] underline-offset-4 transition-colors hover:text-[#C85D26]"
            >
              {isBangla ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </section>

      <HowItWorksJourney currentLang={currentLang} />

      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#25313D] sm:text-3xl">
            {isBangla ? 'ছোট্ট সোনামণির জন্য এইটুকু অফার করলে কী হবে?' : 'What could this little bundle of care offer your child?'}
          </h2>
        </div>

        <div className="rounded-3xl border border-[#E8EEEB] bg-white p-5 shadow-[0_12px_32px_rgba(33,55,43,0.07)] sm:p-7">
          <div className="mb-5 flex items-start justify-between">
            <h3 className="text-lg font-extrabold text-[#25313D]">
              {isBangla ? 'আপনাদের জন্য থাকছে ৪টি বাড়তি সুবিধা' : 'Plus four extra benefits'}
            </h3>
          </div>
          <div className="journey-feature-grid" aria-label={isBangla ? 'কুচুপুচুর সুবিধা' : 'Kuchupuchu features'}>
            {(isBangla
              ? [
                  { title: 'সন্তানের রুটিন ও যত্ন', description: 'ঘুম, খাবার বা পটি - সব তথ্যই এখন ট্র্যাক করা যাবে', Icon: Activity },
                  { title: 'মেমোরি ডায়েরি', description: 'সন্তানের স্মৃতি সংরক্ষণ করে সবার সঙ্গে শেয়ার করুন', Icon: BookOpen },
                  { title: 'প্যারেন্টস ফোরাম', description: 'যেকোনো সমস্যায় অভিজ্ঞ অভিভাবকদের সঙ্গে আলোচনা করুন', Icon: MessageCircle },
                  { title: 'কেনাকাটা', description: 'মাত্র ৩ ক্লিকে ঝামেলাহীন কেনাকাটা', Icon: ShoppingBag },
                ]
              : [
                  { title: 'Child routine & care', description: 'Track everyday care details with ease', Icon: Activity },
                  { title: 'Memory diary', description: 'Save your child’s memories and share them', Icon: BookOpen },
                  { title: 'Parents forum', description: 'Talk through concerns with experienced parents', Icon: MessageCircle },
                  { title: 'Shopping', description: 'A smooth shopping experience in 3 clicks', Icon: ShoppingBag },
                ]
            ).map(({ title, description, Icon }, index) => (
              <div key={title} className="journey-feature-item" style={{ animationDelay: `${index * 450}ms` }}>
                <span className="journey-feature-icon"><Icon className="h-6 w-6" /></span>
                <strong>{title}</strong>
                <span className="journey-feature-description">{description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-7">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#D66A37]">
            <TrendingUp className="h-4 w-4" />
            {isBangla ? 'বিকাশের পথে' : 'On the path of growth'}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#25313D] sm:text-3xl">
            {isBangla ? 'উন্নতি লিখুন, রিপোর্ট দেখুন' : 'Log progress, see a report'}
          </h2>
          <p className="text-sm text-[#697582]">
            {isBangla
              ? 'দৈনন্দিন পর্যবেক্ষণ থেকে সন্তানের অগ্রগতির একটি পরিষ্কার ছবি পান।'
              : 'Turn everyday observations into a clearer picture of your child’s progress.'}
          </p>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-[#E8EEEB] bg-white shadow-[0_10px_30px_rgba(33,55,43,0.06)] lg:grid-cols-2">
          <div className="space-y-4 bg-[#F8FAF9] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#25313D]">
                {isBangla ? 'আজকের পর্যবেক্ষণ' : 'Today’s observations'}
              </h3>
              <span className="text-[10px] font-medium text-[#89938E]">
                {isBangla ? 'উদাহরণ' : 'Preview'}
              </span>
            </div>
            {[
              isBangla ? 'নতুন কিছু ধরার চেষ্টা করেছে' : 'Reached for something new',
              isBangla ? 'শব্দ শুনে সাড়া দিয়েছে' : 'Responded to a familiar sound',
              isBangla ? 'খেলায় মনোযোগ দিয়েছে' : 'Stayed engaged during play',
            ].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-xl border border-[#EDF1EF] bg-white px-3.5 py-3 text-xs text-[#53615A]">
                <span>{item}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EEF7F0] text-[#4C8A68]">
                  <Check className="h-3 w-3" />
                </span>
              </div>
            ))}
            <button
              type="button"
              onClick={onGoToDiary}
              className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-[#D66A37] hover:text-[#B94F22]"
            >
              <PenTool className="h-3.5 w-3.5" />
              {isBangla ? 'ডায়েরিতে লিখুন' : 'Add to diary'}
            </button>
          </div>

          <div className="flex flex-col justify-center p-5 sm:p-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-[#8A9590]">
                  {isBangla ? 'বিকাশের সারাংশ' : 'Development summary'}
                </p>
                <h3 className="mt-1 text-base font-bold text-[#25313D]">
                  {isBangla ? '৬টি বিকাশের ক্ষেত্র' : 'Six areas of development'}
                </h3>
              </div>
              <span className="rounded-full bg-[#FFF3EA] px-2.5 py-1 text-[10px] font-bold text-[#C85D26]">
                {isBangla ? 'রিপোর্ট' : 'Report'}
              </span>
            </div>
            <div className="mx-auto w-full max-w-[300px]">
              <svg viewBox="0 0 300 210" role="img" aria-label={isBangla ? 'বিকাশের ছয়টি ক্ষেত্রের নমুনা চার্ট' : 'Sample chart across six areas of development'} className="w-full">
                <polygon points="150,28 220,68 220,148 150,188 80,148 80,68" fill="none" stroke="#E7ECE9" strokeWidth="1.5" />
                <polygon points="150,55 197,82 197,135 150,161 103,135 103,82" fill="none" stroke="#E7ECE9" strokeWidth="1.5" />
                <polygon points="150,82 174,96 174,122 150,135 126,122 126,96" fill="none" stroke="#E7ECE9" strokeWidth="1.5" />
                <line x1="150" y1="108" x2="150" y2="28" stroke="#E7ECE9" />
                <line x1="150" y1="108" x2="220" y2="68" stroke="#E7ECE9" />
                <line x1="150" y1="108" x2="220" y2="148" stroke="#E7ECE9" />
                <line x1="150" y1="108" x2="150" y2="188" stroke="#E7ECE9" />
                <line x1="150" y1="108" x2="80" y2="148" stroke="#E7ECE9" />
                <line x1="150" y1="108" x2="80" y2="68" stroke="#E7ECE9" />
                <polygon points="150,47 201,79 205,140 150,157 97,138 106,83" fill="#F6C6A9" fillOpacity=".42" stroke="#E9753F" strokeWidth="2.5" />
                <circle cx="150" cy="47" r="3.5" fill="#E9753F" />
                <circle cx="201" cy="79" r="3.5" fill="#E9753F" />
                <circle cx="205" cy="140" r="3.5" fill="#E9753F" />
                <circle cx="150" cy="157" r="3.5" fill="#E9753F" />
                <circle cx="97" cy="138" r="3.5" fill="#E9753F" />
                <circle cx="106" cy="83" r="3.5" fill="#E9753F" />
                <text x="150" y="17" textAnchor="middle" className="fill-[#64716A] text-[9px]">{isBangla ? 'শেখা' : 'Learning'}</text>
                <text x="235" y="68" textAnchor="start" className="fill-[#64716A] text-[9px]">{isBangla ? 'কথা' : 'Speech'}</text>
                <text x="235" y="154" textAnchor="start" className="fill-[#64716A] text-[9px]">{isBangla ? 'চলন' : 'Movement'}</text>
                <text x="150" y="205" textAnchor="middle" className="fill-[#64716A] text-[9px]">{isBangla ? 'মেলামেশা' : 'Social'}</text>
                <text x="65" y="154" textAnchor="end" className="fill-[#64716A] text-[9px]">{isBangla ? 'আবেগ' : 'Emotional'}</text>
                <text x="65" y="68" textAnchor="end" className="fill-[#64716A] text-[9px]">{isBangla ? 'স্বাস্থ্য' : 'Wellbeing'}</text>
              </svg>
            </div>
            <button
              type="button"
              onClick={onGoToDashboard}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9753F] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#D86430]"
            >
              {isBangla ? 'অগ্রগতি দেখুন' : 'View progress'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid items-center gap-6 rounded-3xl border border-[#E8EEEB] bg-white p-5 shadow-[0_6px_24px_rgba(33,55,43,0.04)] sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#D66A37]">
            <Heart className="h-4 w-4" />
            {isBangla ? 'প্রতিটি শিশু আলাদা' : 'Every child is different'}
          </span>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#25313D]">
            {isBangla ? 'যেখানে সময় লাগছে, সেখানেও থাকুন পাশে' : 'Be there, even when a little more time is needed'}
          </h2>
          <p className="text-sm leading-relaxed text-[#697582]">
            {isBangla
              ? 'শিশুরা নিজস্ব গতিতে শেখে। তুলনা নয়—ছোট ছোট অগ্রগতি লক্ষ্য করুন, আর কোনো দুশ্চিন্তা হলে শিশু বিশেষজ্ঞের সাথে কথা বলুন।'
              : 'Children learn at their own pace. Notice small steps rather than comparing, and speak with a pediatrician if you have concerns.'}
          </p>
          <button
            type="button"
            onClick={onGoToForum || onGoToDashboard}
            className="inline-flex items-center gap-2 pt-1 text-sm font-bold text-[#D66A37] hover:text-[#B94F22]"
          >
            {isBangla ? 'অভিভাবকদের সাথে কথা বলুন' : 'Connect with other parents'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2.5 rounded-2xl bg-[#F7FAF8] p-4 sm:p-5">
          {[
            isBangla ? 'সন্তানের নিজস্ব গতিকে সম্মান করুন' : 'Respect your child’s individual pace',
            isBangla ? 'প্রতিদিনের ছোট অগ্রগতি লিখে রাখুন' : 'Notice and record everyday progress',
            isBangla ? 'প্রয়োজনে বিশেষজ্ঞের পরামর্শ নিন' : 'Ask a professional when you need support',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs font-medium text-[#58655F]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EDF6F0] text-[#4C8A68]">
                <Check className="h-4 w-4" />
              </span>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D66A37]">
            {isBangla ? 'আপনার প্রশ্নের উত্তর' : 'A little more clarity'}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#25313D] sm:text-3xl">
            {isBangla ? 'মনে প্রশ্ন আছে?' : 'Questions on your mind?'}
          </h2>
        </div>
        <div className="divide-y divide-[#EDF1EF] overflow-hidden rounded-2xl border border-[#E8EEEB] bg-white">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="group px-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-bold text-[#35423B] marker:hidden">
                {question}
                <ChevronDown className="h-4 w-4 shrink-0 text-[#8B9690] transition-transform group-open:rotate-180" />
              </summary>
              <p className="max-w-2xl pb-4 pr-7 text-xs leading-relaxed text-[#748079]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#F2D7C8] bg-[#FFF7F2] px-5 py-10 text-center sm:px-10 sm:py-12">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#D66A37] shadow-sm">
          <Baby className="h-5 w-5" />
        </span>
        <h2 className="mx-auto mt-4 max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-[#25313D] sm:text-3xl">
          {isBangla ? 'আজই আপনার সোনামণির যাত্রা শুরু করুন' : 'Start your little one’s journey today'}
        </h2>
        <p className="mt-2 text-sm text-[#748079]">
          {isBangla ? 'নাম লিখে শুরু করুন—বাকিটা ধাপে ধাপে।' : 'Enter a name to begin, and take it one step at a time.'}
        </p>
        <form
          className="mx-auto mt-5 flex w-full max-w-lg flex-col gap-2 rounded-2xl border border-[#E8EEEB] bg-white p-2 sm:flex-row sm:rounded-full sm:pl-5"
          onSubmit={(event) => {
            event.preventDefault();
            onStartWithChildName(childName.trim());
          }}
        >
          <label htmlFor="footer-child-name" className="sr-only">
            {isBangla ? 'সন্তানের নাম' : 'Child’s name'}
          </label>
          {renderChildNameInput('footer-child-name')}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#E9753F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D86430] sm:rounded-full"
          >
            {isBangla ? 'শুরু করুন' : 'Get started'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-7 text-[10px] text-[#9AA49F]">
          © 2026 Kuchupuchu · {isBangla ? 'ভালোবাসায় বেড়ে ওঠা' : 'Growing with care'}
        </p>
      </section>
    </div>
  );
};
