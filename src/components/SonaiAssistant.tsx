import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { ChildProfile, GrowthLogEntry, Language, MilestoneItem, RoutineLogEntry } from '../types';

interface SonaiAssistantProps {
  currentLang: Language;
  isLoggedIn: boolean;
  activeChild: ChildProfile;
  growthLogs: GrowthLogEntry[];
  milestones: MilestoneItem[];
  routineLogs: RoutineLogEntry[];
  activities: { id: string; completed: boolean }[];
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChildContext {
  ageMonths: number;
  ageDays: number;
  weightKg: number;
  heightCm: number;
  mood: string | null;
  assessmentScore: number | null;
  assessmentHighlights: string[];
  recentGrowth: { ageMonths: number; weightKg: number; heightCm: number; mood: string }[];
  achievedMilestones: { titleBn: string; titleEn: string }[];
  recentRoutines: { type: string; titleBn: string; titleEn: string; detailsBn: string; detailsEn: string }[];
  completedActivities: number;
};

function makeMascot(size: 'small' | 'large' = 'small') {
  const dimensions = size === 'large' ? 'h-24 w-24' : 'h-14 w-14';
  return (
    <svg className={`${dimensions} overflow-visible`} viewBox="0 0 96 96" role="img" aria-label="Sonai, a friendly little girl">
      <ellipse cx="48" cy="87" rx="26" ry="6" fill="#5B4A68" opacity=".12" />
      <g className="shonai-body">
        <path d="M30 72c3-9 10-13 18-13s15 4 18 13l5 12H25z" fill="#F08B78" />
        <path d="M39 61h18v13c0 5-4 9-9 9s-9-4-9-9z" fill="#F3BBA2" />
        <path d="M28 39c0-19 9-30 23-30 15 0 24 12 22 31l-5 23H33z" fill="#553F4B" />
        <path d="M30 42c0-16 8-25 19-25 13 0 20 9 19 25l-2 15c-1 9-9 15-18 15s-16-6-17-15z" fill="#F6C7A8" />
        <path d="M29 39c-2-18 7-31 23-31 14 0 24 11 23 27-7-1-12-5-15-11-5 7-16 11-31 12z" fill="#553F4B" />
        <path d="M26 28c-5-9 0-17 8-16 5-11 18-11 22-2 9-4 17 3 15 11 7 5 3 14-4 17l-3-12c-9 2-20 0-28-4l-6 13z" fill="#553F4B" />
        <path d="M31 37c-7-4-12 1-10 7 1 4 5 6 9 4M67 37c7-4 12 1 10 7-1 4-5 6-9 4" fill="#F6C7A8" />
        <g className="shonai-face">
          <ellipse cx="40" cy="47" rx="2.1" ry="2.8" fill="#403444" />
          <ellipse cx="58" cy="47" rx="2.1" ry="2.8" fill="#403444" />
          <path d="M39 42q2-2 4 0M55 42q2-2 4 0" fill="none" stroke="#684850" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M45 55q3 3 6 0" fill="none" stroke="#C76F70" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="34" cy="53" rx="4" ry="2" fill="#EB8E89" opacity=".45" />
          <ellipse cx="64" cy="53" rx="4" ry="2" fill="#EB8E89" opacity=".45" />
        </g>
        <path d="M39 70l-3 9m21-9 3 9" stroke="#F6C7A8" strokeWidth="5" strokeLinecap="round" />
        <path d="M38 83l-5 2m26-2 5 2" stroke="#604A70" strokeWidth="5" strokeLinecap="round" />
        <path d="M27 67l-5 8m47-8 5 8" stroke="#F6C7A8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="23" cy="76" r="2.5" fill="#F4C76A" />
        <circle cx="73" cy="76" r="2.5" fill="#F4C76A" />
      </g>
      <path d="M72 23l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z" fill="#F4C76A" />
    </svg>
  );
}

export const SonaiAssistant: React.FC<SonaiAssistantProps> = ({
  currentLang,
  isLoggedIn,
  activeChild,
  growthLogs,
  milestones,
  routineLogs,
  activities,
}) => {
  const isBn = currentLang === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const childContext: ChildContext = {
    ageMonths: activeChild.ageMonths,
    ageDays: activeChild.ageDays,
    weightKg: activeChild.currentWeightKg,
    heightCm: activeChild.currentHeightCm,
    mood: activeChild.todayMood || null,
    assessmentScore: activeChild.assessmentScore ?? null,
    assessmentHighlights: (activeChild.assessmentHighlights || []).slice(0, 8),
    recentGrowth: growthLogs.slice(0, 8).map(({ ageMonths, weightKg, heightCm, mood }) => ({ ageMonths, weightKg, heightCm, mood })),
    achievedMilestones: milestones.filter((milestone) => milestone.isAchieved).slice(0, 20).map(({ titleBn, titleEn }) => ({ titleBn, titleEn })),
    recentRoutines: routineLogs.slice(0, 8).map(({ type, titleBn, titleEn, detailsBn, detailsEn }) => ({ type, titleBn, titleEn, detailsBn, detailsEn })),
    completedActivities: activities.filter((activity) => activity.completed).length,
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setReminder(false);
      setMessages([]);
      setError('');
      window.clearTimeout(timerRef.current);
      return;
    }

    const remindLater = () => {
      timerRef.current = window.setTimeout(() => {
        if (document.visibilityState === 'visible') setReminder(true);
        remindLater();
      }, 30 * 60 * 1000);
    };

    remindLater();
    return () => window.clearTimeout(timerRef.current);
  }, [isLoggedIn]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending, isOpen]);

  const reminderQuestion = isBn
    ? activeChild.ageMonths < 6
      ? 'আজ খাওয়ানো বা ফিডিং রুটিনটা ঠিকমতো চলছে তো?'
      : 'আজ সোনামণিকে খাবারের সাথে একটু পানি অফার করা হয়েছে তো?'
    : activeChild.ageMonths < 6
      ? 'How is your little one’s feeding routine going today?'
      : 'Has your little one been offered a little water with meals today?';

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isSending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text: cleanText }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);
    setIsOpen(true);
    setReminder(false);

    try {
      const response = await fetch('/api/shonai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          language: currentLang,
          history: nextMessages.slice(-9, -1),
          child: isLoggedIn ? childContext : null,
        }),
      });
      const result: unknown = await response.json();
      const answer = typeof result === 'object' && result !== null && 'answer' in result && typeof result.answer === 'string'
        ? result.answer
        : null;
      if (!response.ok || answer === null) {
        throw new Error(typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string' ? result.error : 'assistant_unavailable');
      }
      setMessages((current) => [...current, { role: 'model', text: answer }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '';
      if (message === 'assistant_not_configured') {
        setError(isBn ? 'সোনাইকে চালু করতে server-এ Gemini API key যোগ করতে হবে।' : 'Add a Gemini API key on the server to enable Sonai.');
      } else {
        setError(isBn ? 'এখন সোনাইয়ের সাথে যোগাযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।' : 'Sonai could not connect just now. Please try again in a moment.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const openReminder = () => {
    setIsOpen(true);
    setReminder(false);
    setInput(reminderQuestion);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <style>{`
        @keyframes shonai-bob { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-5px) rotate(1deg); } }
        @keyframes shonai-nod { 0%,82%,100% { transform: rotate(0); } 86% { transform: rotate(-7deg); } 90% { transform: rotate(5deg); } 94% { transform: rotate(-3deg); } }
        @keyframes shonai-blink { 0%,45%,49%,100% { transform: scaleY(1); } 47% { transform: scaleY(.12); } }
        .shonai-body { transform-origin: 48px 77px; animation: shonai-bob 3s ease-in-out infinite; }
        .shonai-face { transform-origin: 48px 49px; animation: shonai-nod 7s ease-in-out infinite; }
        .shonai-face ellipse:nth-child(-n+2) { transform-box: fill-box; transform-origin: center; animation: shonai-blink 5s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .shonai-body,.shonai-face,.shonai-face ellipse { animation: none; } }
      `}</style>

      <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {reminder && isLoggedIn && !isOpen && (
          <div className="relative flex max-w-[280px] items-center gap-2 rounded-2xl border border-[#F0D9CC] bg-white p-3 pr-9 text-xs leading-relaxed text-[#4F4A55] shadow-lg">
            <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-[#F0D9CC] bg-white" />
            <span className="shrink-0">{makeMascot('small')}</span>
            <button onClick={openReminder} className="text-left hover:text-[#A95E49]">{reminderQuestion}</button>
            <button onClick={() => setReminder(false)} className="absolute right-2 top-2 rounded p-1 text-[#99919A]" aria-label={isBn ? 'রিমাইন্ডার বন্ধ করুন' : 'Dismiss reminder'}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isOpen && (
          <section role="dialog" aria-modal="false" aria-label={isBn ? 'সোনাই চ্যাট' : 'Chat with Sonai'} className="mb-1 flex h-[min(600px,calc(100dvh-120px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-[#EDE1D8] bg-[#FFFCF8] shadow-2xl">
            <header className="flex items-center justify-between bg-[#F5E8DF] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">{makeMascot('small')}</div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#383341]">{isBn ? 'সোনাই' : 'Sonai'} <span className="text-[#B77362]">♡</span></h2>
                  <p className="text-[10px] text-[#7D737B]">{isBn ? 'তোমার ছোট্ট AI বন্ধু' : 'Your little AI friend'}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-[#756C76] hover:bg-white/70" aria-label={isBn ? 'চ্যাট বন্ধ করুন' : 'Close chat'}>
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
              {messages.length === 0 && (
                <div className="flex items-end gap-2">
                  {makeMascot('small')}
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 text-xs leading-relaxed text-[#514B56] shadow-sm">
                    {isBn
                      ? `হ্যালো! আমি সোনাই। ${isLoggedIn ? 'তোমার ছোট্ট সোনামণির বিকাশ আর এই ওয়েবসাইট নিয়ে আমাকে জিজ্ঞেস করতে পারো।' : 'শিশুর বিকাশ বা এই ওয়েবসাইট নিয়ে আমাকে জিজ্ঞেস করতে পারো!'}`
                      : `Hello! I'm Sonai. ${isLoggedIn ? 'Ask me about your little one’s development or this website.' : 'Ask me about child development or this website!'}`}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={`${index}-${message.role}`} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && makeMascot('small')}
                  <p className={`max-w-[84%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-br-sm bg-[#D78D78] text-white'
                      : 'rounded-bl-sm bg-white text-[#514B56] shadow-sm'
                  }`}>{message.text}</p>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="ml-14 flex flex-wrap gap-1.5">
                  {(isBn
                    ? ['২ বছরের milestone কী?', 'এই website কীভাবে কাজ করে?', 'প্যাকেজ কী কী?']
                    : ['What are 2-year milestones?', 'How does this website work?', 'What plans are available?']
                  ).map((prompt) => (
                    <button key={prompt} onClick={() => void sendMessage(prompt)} className="rounded-full border border-[#EADBD1] bg-white px-2.5 py-1.5 text-[10px] text-[#755E58] hover:bg-[#FFF2EA]">
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {isSending && (
                <div className="flex items-center gap-2 text-[11px] text-[#887D85]">
                  {makeMascot('small')}
                  <span className="animate-pulse">{isBn ? 'সোনাই ভাবছে…' : 'Sonai is thinking…'}</span>
                </div>
              )}
              {error && <p role="alert" className="rounded-xl bg-[#FFF0ED] px-3 py-2 text-[11px] leading-relaxed text-[#A34840]">{error}</p>}
              <div ref={messageEndRef} />
            </div>

            <div className="border-t border-[#EFE5DE] px-3 py-2">
              <p className="mb-1.5 text-center text-[9px] leading-relaxed text-[#968C94]">
                {isBn
                  ? isLoggedIn
                    ? 'উত্তরে শিশুর বয়স, growth ও routine-এর প্রয়োজনীয় তথ্য Gemini AI-তে যাবে। জরুরি স্বাস্থ্য সমস্যায় চিকিৎসকের পরামর্শ নিন।'
                    : 'উত্তর তৈরি করতে আপনার প্রশ্ন Gemini AI-তে যাবে। স্বাস্থ্য সমস্যায় চিকিৎসকের পরামর্শ নিন।'
                  : isLoggedIn
                    ? 'Relevant age, growth and routine details are sent to Gemini AI with your question. Ask a clinician for urgent health concerns.'
                    : 'Your question is sent to Gemini AI to generate an answer. Ask a clinician about urgent health concerns.'}
              </p>
              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={isBn ? 'সোনাইকে কিছু জিজ্ঞেস করো…' : 'Ask Sonai something…'}
                  className="min-w-0 flex-1 rounded-xl border border-[#E9DED6] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#CF927E]"
                  aria-label={isBn ? 'সোনাইকে বার্তা লিখুন' : 'Message Sonai'}
                  maxLength={1000}
                />
                <button type="submit" disabled={!input.trim() || isSending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D78D78] text-white transition hover:bg-[#BC735E] disabled:cursor-not-allowed disabled:opacity-45" aria-label={isBn ? 'বার্তা পাঠান' : 'Send message'}>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        )}

        <button
          onClick={() => {
            setIsOpen((open) => !open);
            setReminder(false);
          }}
          className="group flex items-center gap-2 rounded-full border border-[#F0DCD2] bg-white p-1.5 pr-4 text-sm font-bold text-[#5A4651] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          aria-label={isOpen ? (isBn ? 'সোনাই চ্যাট বন্ধ করুন' : 'Close Sonai chat') : (isBn ? 'সোনাইয়ের সাথে কথা বলুন' : 'Chat with Sonai')}
        >
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F9E7DE]">{makeMascot('small')}</span>
          <span>{isBn ? 'সোনাই' : 'Sonai'}</span>
          <span className="ml-0.5 flex h-2 w-2 rounded-full bg-[#70A87C]" />
          <span className="sr-only">AI assistant</span>
          <MessageCircle className="h-4 w-4 text-[#B77362]" />
        </button>
      </div>
    </>
  );
};
