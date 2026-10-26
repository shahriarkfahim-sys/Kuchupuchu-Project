import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Activity,
  BookOpen,
  MessageCircle,
  MapPin,
  ShoppingBag,
  Check,
  X,
  Gamepad2,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { JourneyAnimation } from './JourneyAnimation';
import { HowItWorksJourney } from './HowItWorksJourney';
import { makeMascot } from './SonaiAssistant';
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
  onOpenAuth: (mode: 'login' | 'register') => void;
  onGoToTracker: () => void;
  onGoToPlay: () => void;
  onStartWithChildName: (name: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentLang,
  onOpenAuth,
  onGoToTracker,
  onGoToPlay,
  onStartWithChildName,
}) => {
  const t = translations[currentLang];
  const isBangla = currentLang === 'bn';
  const [childName, setChildName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [sampleName, setSampleName] = useState('');
  const [animatedHook, setAnimatedHook] = useState('');
  const [tukiChatStarted, setTukiChatStarted] = useState(false);
  const tukiStageRef = useRef<HTMLDivElement>(null);
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
    const stage = tukiStageRef.current;
    if (!stage || tukiChatStarted) return;

    let visibleTimer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (visibleTimer === undefined) {
          visibleTimer = window.setTimeout(() => {
            setTukiChatStarted(true);
            observer.disconnect();
          }, 3000);
        }
      } else if (visibleTimer !== undefined) {
        window.clearTimeout(visibleTimer);
        visibleTimer = undefined;
      }
    }, { threshold: 0.4 });

    observer.observe(stage);
    return () => {
      observer.disconnect();
      if (visibleTimer !== undefined) window.clearTimeout(visibleTimer);
    };
  }, [tukiChatStarted]);

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
        {
          question: 'ঘুম, খাবার ও পটির তথ্য রাখা যাবে?',
          answer: 'হ্যাঁ। রুটিন ট্র্যাকার থেকে ঘুম, খাওয়ানো, ডায়াপার বা পটির মতো দৈনন্দিন যত্নের তথ্য লিখে রাখতে পারবেন।',
        },
        {
          question: 'সন্তানের স্মৃতি বা দৈনন্দিন কথা কোথায় লিখব?',
          answer: 'ডায়েরিতে ছোট নোট, নতুন শব্দ, ওজন, উচ্চতা ও মুড লিখে সন্তানের অগ্রগতি গুছিয়ে রাখতে পারবেন।',
        },
        {
          question: 'টুকি কীভাবে সাহায্য করবে?',
          answer: 'টুকি কুচুপুচু ব্যবহার, শিশুর বিকাশ এবং আপনার যোগ করা তথ্য বুঝতে সাহায্য করতে পারে। তবে এটি রোগ নির্ণয় বা চিকিৎসকের পরামর্শের বিকল্প নয়।',
        },
        {
          question: 'অন্য অভিভাবকের সঙ্গেও কি যুক্ত হওয়া যাবে?',
          answer: 'হ্যাঁ। প্যারেন্টস ফোরামে প্রশ্ন করতে ও অন্য অভিভাবকদের অভিজ্ঞতা থেকে শিখতে পারবেন।',
        },
        {
          question: 'সন্তানের তথ্য পরে বদলানো যাবে?',
          answer: 'হ্যাঁ। প্রোফাইল থেকে সন্তানের তথ্য পরে যোগ বা হালনাগাদ করতে পারবেন।',
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
        {
          question: 'Can I track sleep, feeding, and diaper changes?',
          answer: 'Yes. Use the routine tracker to record everyday care such as sleep, feeding, and diaper or potty updates.',
        },
        {
          question: 'Where can I save little memories and notes?',
          answer: 'Use the diary to record notes, new words, weight, height, and mood as your child grows.',
        },
        {
          question: 'How can Tuki help me?',
          answer: 'Tuki can help explain Kuchupuchu, child development topics, and information you add. It cannot diagnose or replace a healthcare professional.',
        },
        {
          question: 'Can I connect with other parents?',
          answer: 'Yes. You can ask questions in the parents forum and learn from other parents’ experiences.',
        },
        {
          question: 'Can I update my child’s details later?',
          answer: 'Yes. You can add or update your child’s details in their profile later.',
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
              ? 'সন্তান পালনে আপনার অনভিজ্ঞতা, ব্যস্ততা কিংবা ভুলে যাওয়ার শঙ্কা - এখন দূর হবে ৩ মিনিটেই'
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
            {isBangla ? <>আপনি এবং আপনার সন্তান <span className="text-[#D66A37]">আরও বেশি কিছু পাওয়ার যোগ্য</span></> : <>You and your child <span className="text-[#D66A37]">deserve even more</span></>}
          </h2>
        </div>

        <div className="rounded-3xl border border-[#E8EEEB] bg-white p-5 shadow-[0_12px_32px_rgba(33,55,43,0.07)] sm:p-7">
          <div className="mb-5 flex items-start justify-between">
            <h3 className="text-lg font-extrabold text-[#25313D]">
              {isBangla ? <>তাই, আপনাদের জন্য থাকছে <span className="text-[#D66A37]">৬টি বাড়তি সুবিধা</span></> : <>That’s why you get <span className="text-[#D66A37]">six extra benefits</span></>}
            </h3>
          </div>
          <div className="journey-highlight-grid" aria-label={isBangla ? 'কুচুপুচুর বাড়তি সুবিধা' : 'Kuchupuchu extra benefits'}>
            {(isBangla
              ? [
                  { title: 'খেলার ভাণ্ডার', description: 'শিশুর বিকাশের ৬টি ক্ষেত্রে, বয়স অনুযায়ী ঘরের উপকরণ দিয়ে খেলা', Icon: Gamepad2 },
                  { title: 'সন্তানের রুটিন ও যত্ন', description: 'ঘুম, খাবার বা পটি - সব তথ্যই এখন ট্র্যাক করা যাবে', Icon: Activity },
                  { title: 'মেমোরি ডায়েরি', description: 'সন্তানের স্মৃতি সংরক্ষণ করে সবার সঙ্গে শেয়ার করুন', Icon: BookOpen },
                  { title: 'প্যারেন্টস ফোরাম', description: 'যেকোনো সমস্যায় অভিজ্ঞ অভিভাবকদের সঙ্গে আলোচনা করুন', Icon: MessageCircle },
                  { title: 'কেনাকাটা', description: 'গিফট কার্ডসহ মাত্র ৩ ক্লিকে ঝামেলাহীন কেনাকাটা', Icon: ShoppingBag },
                  { title: 'জরুরি সাহায্য', description: 'টিকা কেন্দ্র, নিকটস্থ হাসপাতাল, পুষ্টিবিদ, শিশু বিশেষজ্ঞ, থেরাপি ও টেস্টিং সেন্টারের তথ্য, বুকিংয়ে সহায়তা ও যোগাযোগ করিয়ে দেওয়া', Icon: MapPin },
                ]
              : [
                  { title: 'Play library', description: 'Age-based home-material play for six areas of child development', Icon: Gamepad2 },
                  { title: 'Child routine & care', description: 'Track sleep, food, potty, and other care details', Icon: Activity },
                  { title: 'Memory diary', description: 'Save and share your child’s memories', Icon: BookOpen },
                  { title: 'Parents forum', description: 'Talk with experienced parents', Icon: MessageCircle },
                  { title: 'Shopping', description: 'Easy shopping in 3 clicks, with gift cards', Icon: ShoppingBag },
                  { title: 'Urgent help', description: 'Get information, booking help, and connections to vaccination centers, nearby hospitals, nutritionists, pediatricians, therapy, and testing centers', Icon: MapPin },
                ]
            ).map(({ title, description, Icon }, index) => (
              <div key={title} className="journey-highlight-card" style={{ animationDelay: `${index * 180}ms` }}>
                <span className="journey-highlight-icon"><Icon className="h-6 w-6" /></span>
                <strong>{title}</strong>
                <span className="journey-feature-description">{description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tuki-intro grid items-center gap-8 overflow-hidden rounded-3xl border border-[#F1DFD2] bg-gradient-to-br from-[#FFF9F3] via-white to-[#F5FAF7] p-6 shadow-[0_12px_36px_rgba(73,58,47,0.06)] sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <div ref={tukiStageRef} className={`tuki-mascot-stage relative mx-auto flex w-full max-w-sm flex-col items-center gap-3${tukiChatStarted ? ' tuki-stage-active' : ''}`}>
          <div className="tuki-mascot-card relative flex min-h-[480px] w-full items-center justify-center rounded-[2rem] bg-[#FFF1E6] p-5 sm:p-7">
            <span className="tuki-orbit tuki-orbit-one" aria-hidden="true" />
            <span className="tuki-orbit tuki-orbit-two" aria-hidden="true" />
            <span className="tuki-mascot-glow" aria-hidden="true" />
            <div className="tuki-chat-bubbles" aria-hidden={!tukiChatStarted}>
              <span className="tuki-chat-bubble tuki-chat-one">{isBangla ? 'হাই, আমি পুকি... হিহি! না, আমি টুকি!' : 'Hi, I’m Puki... hehe! No, I’m Tuki!'}</span>
              <span className="tuki-chat-bubble tuki-chat-two">{isBangla ? 'তুমি সাইন আপ করলেই পৃথিবীতে আসব!' : 'Sign up and I’ll be there when your baby arrives!'}</span>
              <span className="tuki-chat-bubble tuki-chat-three">{isBangla ? 'আমি কি তোমাদের আম্মু বা আব্বু বলে ডাকব?' : 'Should I call you Ammu or Abbu?'}</span>
              <span className="tuki-chat-bubble tuki-chat-four">{isBangla ? 'আমার সঙ্গে গল্প করবে?' : 'Will you tell me a story?'}</span>
              <span className="tuki-chat-bubble tuki-chat-five">{isBangla ? 'তোমার সোনামণির মজার খবরগুলো আমি মনে রাখব!' : 'I’ll remember all the fun little updates!'}</span>
              <span className="tuki-chat-bubble tuki-chat-six">{isBangla ? 'তাহলে, আমরা বন্ধু?' : 'So, are we friends?'}</span>
              <span className="tuki-chat-bubble tuki-chat-seven">{isBangla ? 'আমার প্রিয় কাজ? তোমাদের সঙ্গে বড় হওয়া!' : 'My favorite thing? Growing up with you!'}</span>
            </div>
            <div className="tuki-mascot" aria-label={isBangla ? 'টুকি, আপনার সহায়ক বন্ধু' : 'Tuki, your helpful friend'}>
              {makeMascot('large')}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-[#25313D] sm:text-3xl">
              {isBangla ? <>আপনার যাত্রায় পাশে থাকবে <span className="text-[#D66A37]">টুকি</span></> : <>Tuki will be with you on your journey</>}
            </h2>
            <p className="text-base font-bold leading-relaxed text-[#46534D] sm:text-lg">
              {isBangla ? 'আপনার সন্তানের সঙ্গে বড় হবে আপনার কৃত্রিম বুদ্ধিমত্তার বন্ধু টুকি।' : 'Your helpful companion Tuki will grow alongside your child.'}
            </p>
            <p className="text-sm leading-7 text-[#697582] sm:text-base">
              {isBangla
                ? 'সন্তানের রিপোর্ট বিশ্লেষণ করতে চান? জানতে চান, গড়ে আপনার সন্তান কতক্ষণ ঘুমাচ্ছে? টিকার তারিখে রিমাইন্ডার দরকার? এমন হাজারো প্রশ্নের উত্তর দেবে আপনার সন্তানের নিজস্ব কৃত্রিম বুদ্ধিমত্তার বন্ধু টুকি।'
                : 'Want help understanding your child’s report, finding out how long they sleep on average, or getting a vaccination reminder? Tuki, your child’s own AI friend, is ready to help with questions like these and many more.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-7 rounded-3xl border border-[#F1DFD2] bg-gradient-to-br from-[#FFF9F3] via-white to-[#F5FAF7] p-6 shadow-[0_12px_36px_rgba(73,58,47,0.06)] sm:p-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#25313D] sm:text-3xl">
            {isBangla ? 'আপনার সুবিধামতো প্ল্যান বেছে নিন' : 'Choose a plan that works for you'}
          </h2>
          <p className="text-sm leading-relaxed text-[#697582] sm:text-base">
            {isBangla ? 'মাসিক বা বার্ষিক প্ল্যান বেছে নিয়ে কুচুপুচুর সব সুবিধা ব্যবহার করুন।' : 'Choose a monthly or yearly plan to access Kuchupuchu features.'}
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {[
            { title: isBangla ? 'মাসিক' : 'Monthly', priceBn: '৮৯', priceEn: '89', suffix: isBangla ? 'প্রতি মাসে' : 'per month', note: isBangla ? 'মাসে মাসে নবায়নযোগ্য' : 'Renews monthly', recommended: false },
            { title: isBangla ? 'বার্ষিক' : 'Yearly', priceBn: '৪৯৯', priceEn: '499', suffix: isBangla ? 'প্রতি বছরে' : 'per year', note: isBangla ? 'মাসিক প্ল্যানে ১২ মাসে ৳১,০৬৮' : '12 monthly payments would be ৳1,068', recommended: true },
          ].map((plan) => (
            <div key={plan.title} className={`relative rounded-2xl border p-6 shadow-[0_8px_24px_rgba(33,55,43,0.05)] sm:p-7 ${plan.recommended ? 'border-[#E9753F] bg-[#FFF9F3] ring-2 ring-[#FCE2D3]' : 'border-[#E8EEEB] bg-white'}`}>
              {plan.recommended && <span className="absolute right-5 top-5 rounded-full bg-[#EAF4EC] px-3 py-1 text-xs font-bold text-[#47765D]">{isBangla ? '৫৩% সাশ্রয়' : 'Save 53%'}</span>}
              <h3 className="flex items-center gap-2 text-base font-bold text-[#46534D]">
                {plan.recommended && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E9753F] text-white"><Check className="h-3.5 w-3.5" /></span>}
                {plan.title}
                {plan.recommended && <span className="text-xs font-semibold text-[#C85D26]">{isBangla ? 'নির্বাচিত' : 'Selected'}</span>}
              </h3>
              <p className="mt-3 flex items-baseline gap-2 text-[#25313D]">
                {plan.recommended && <span className="text-lg font-semibold text-[#99A29D] line-through">{isBangla ? '৳১,০৬৮' : '৳1,068'}</span>}
                <span className="text-4xl font-black">৳{isBangla ? plan.priceBn : plan.priceEn}</span>
                <span className="text-sm text-[#697582]">{plan.suffix}</span>
              </p>
              <p className="mt-2 text-sm text-[#697582]">{plan.recommended ? (isBangla ? 'মাসিক প্ল্যানে ১২ মাসে ৳১,০৬৮ - এখানে একবারে পেমেন্টে পুরো ১২ মাস' : '৳1,068 for 12 monthly payments - pay once here for the full year') : plan.note}</p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EAF4EC] px-3 py-1.5 text-xs font-bold text-[#47765D]">
                <Check className="h-3.5 w-3.5" />
                {isBangla ? 'শুরুতে ৩০ দিনের ফ্রি ট্রায়াল' : '30-day free trial to start'}
              </p>
              <button type="button" onClick={() => onOpenAuth('register')} className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold transition-colors ${plan.recommended ? 'bg-[#E9753F] text-white hover:bg-[#D86430]' : 'border border-[#E8EEEB] bg-white text-[#46534D] hover:bg-[#F7FAF8]'}`}>
                {isBangla ? 'প্ল্যান নিন' : 'Choose plan'}
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-3">
          <div className="text-center">
            <h3 className="text-xl font-extrabold text-[#25313D] sm:text-2xl">{isBangla ? 'ফ্রি ও সাবস্ক্রিপশনে কী কী পাবেন?' : 'What do you get for free and with a subscription?'}</h3>
            <p className="mt-2 text-sm text-[#697582]">{isBangla ? 'আপনার পরিবারের জন্য কোন সুবিধাগুলো দরকার, সহজেই বেছে নিন।' : 'Choose the level of support that works for your family.'}</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-[#E8EEEB] bg-white shadow-[0_8px_24px_rgba(33,55,43,0.05)]">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#F7FAF8] text-[#25313D]">
                  <th scope="col" className="w-[52%] px-4 py-4 text-left font-bold sm:px-6">{isBangla ? 'সুবিধা' : 'Features'}</th>
                  <th scope="col" className="px-4 py-4 text-center font-extrabold sm:px-6">
                    <span className="block">{isBangla ? 'ফ্রি' : 'Free'}</span>
                    <span className="mt-1 block text-xs font-medium text-[#697582]">{isBangla ? '৳০' : '৳0'}</span>
                  </th>
                  <th scope="col" className="bg-[#FFF4EB] px-4 py-4 text-center font-extrabold text-[#C85D26] sm:px-6">
                    <span className="block">{isBangla ? 'সাবস্ক্রিপশন' : 'Subscription'}</span>
                    <span className="mt-1 block text-xs font-semibold">{isBangla ? 'মাসে ৳৮৯ · বছরে ৳৪৯৯' : '৳89/mo · ৳499/yr'}</span>
                    <span className="mt-1 block text-[11px] font-medium text-[#47765D]">{isBangla ? 'শুরুতে ৩০ দিন ফ্রি' : 'First 30 days free'}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1EF] text-[#53615A]">
                {(isBangla
                  ? [
                      ['২টির বেশি সন্তান একই প্রোফাইলে যোগ করা', false],
                      ['মাইলস্টোন চেক ও বিশ্লেষণ দেখা', true],
                      ['বিভিন্ন বয়সের মধ্যে তুলনা করা', true],
                      ['রিপোর্ট ডাউনলোড করার সুযোগ', false],
                      ['মাইলস্টোন অনুযায়ী আনলিমিটেড খেলার অ্যাক্সেস', false],
                      ['সম্পূর্ণ লার্নিং ভিডিও দেখা', false],
                      ['দিনে আনলিমিটেড রুটিন যোগ করা', false],
                      ['মেমোরি ফটোকার্ড কাস্টমাইজ ও শেয়ার করা', false],
                      ['ফোরামে পূর্ণ অ্যাক্সেস', true],
                      ['কেনাকাটার জন্য গিফট কার্ড', false],
                      ['টুকিকে আনলিমিটেড ব্যবহার', false],
                    ]
                  : [
                      ['Add more than 2 children to one profile', false],
                      ['Check milestones and view analysis', true],
                      ['Compare across different ages', true],
                      ['Download reports', false],
                      ['Unlimited milestone-based play access', false],
                      ['Access all learning videos', false],
                      ['Add unlimited daily routines', false],
                      ['Customize and share memory photo cards', false],
                      ['Full forum access', true],
                      ['Gift cards for shopping', false],
                      ['Unlimited use of Tuki', false],
                    ]
                ).map(([feature, freeIncluded]) => (
                  <tr key={String(feature)}>
                    <th scope="row" className="px-4 py-3.5 text-left font-semibold leading-relaxed sm:px-6">{feature}</th>
                    <td className="px-4 py-3.5 text-center">
                      {freeIncluded ? <Check aria-label={isBangla ? 'পাওয়া যাবে' : 'Included'} className="mx-auto h-5 w-5 text-[#47765D]" /> : <X aria-label={isBangla ? 'পাওয়া যাবে না' : 'Not included'} className="mx-auto h-5 w-5 text-[#B3BDB8]" />}
                    </td>
                    <td className="bg-[#FFFCF9] px-4 py-3.5 text-center">
                      <Check aria-label={isBangla ? 'পাওয়া যাবে' : 'Included'} className="mx-auto h-5 w-5 text-[#E9753F]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#25313D] sm:text-3xl">
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

    </div>
  );
};
