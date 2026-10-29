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

const mascotImages: Record<string, string> = {
  kantha: '/assets/characters/live/5_kuchu_kantha_baby_live.svg',
  boy: '/assets/characters/live/1_baby_boy_live.svg',
  girl: '/assets/characters/live/2_baby_girl_live.svg',
  tiger: '/assets/characters/live/3_tiger_cub_live.svg',
  doel: '/assets/characters/live/4_doel_bird_live.svg',
};

const mascotNamesEn: Record<string, string> = {
  kantha: 'Kuchu',
  boy: 'Tuku',
  girl: 'Mim',
  tiger: 'Baghu',
  doel: 'Piu',
};

export function makeMascot(size: 'small' | 'large' = 'small', mascotId = 'kantha', name = 'কুচু') {
  const dimensions = size === 'large' ? 'h-24 w-24' : 'h-12 w-12';
  return (
    <img className={`${dimensions} shrink-0 object-contain`} src={mascotImages[mascotId] ?? mascotImages.kantha} alt={name} />
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
  const mascotId = activeChild.mascotId && mascotImages[activeChild.mascotId] ? activeChild.mascotId : 'kantha';
  const assistantNameBn = activeChild.mascotNameBn || 'কুচু';
  const assistantNameEn = mascotNamesEn[mascotId];
  const assistantName = isBn ? assistantNameBn : assistantNameEn;
  const [isOpen, setIsOpen] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [quotaSleepUntil, setQuotaSleepUntil] = useState<number | null>(null);
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

  useEffect(() => {
    setMessages([]);
    setInput('');
    setError('');
  }, [activeChild.id, mascotId]);

  useEffect(() => {
    if (quotaSleepUntil === null) return;
    const remaining = quotaSleepUntil - Date.now();
    if (remaining <= 0) {
      setQuotaSleepUntil(null);
      return;
    }
    const timer = window.setTimeout(() => setQuotaSleepUntil(null), remaining);
    return () => window.clearTimeout(timer);
  }, [quotaSleepUntil]);

  const reminderQuestion = isBn
    ? activeChild.ageMonths < 6
      ? 'আজ খাওয়ানো বা ফিডিং রুটিনটা ঠিকমতো চলছে তো?'
      : 'আজ সোনামণিকে খাবারের সাথে একটু পানি অফার করা হয়েছে তো?'
    : activeChild.ageMonths < 6
      ? 'How is your little one’s feeding routine going today?'
      : 'Has your little one been offered a little water with meals today?';

  const sendMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isSending || (quotaSleepUntil !== null && quotaSleepUntil > Date.now())) return;
    if (quotaSleepUntil !== null) setQuotaSleepUntil(null);
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
          mascotId,
          history: nextMessages.slice(-9, -1),
          child: isLoggedIn ? childContext : null,
        }),
      });
      const result: unknown = await response.json();
      const answer = typeof result === 'object' && result !== null && 'answer' in result && typeof result.answer === 'string'
        ? result.answer
        : null;
      const errorCode = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
        ? result.error
        : null;
      if (!response.ok && errorCode === 'assistant_quota_exceeded') {
        const retryAfterSeconds = typeof result === 'object' && result !== null && 'retryAfterSeconds' in result &&
          typeof result.retryAfterSeconds === 'number' && Number.isFinite(result.retryAfterSeconds) && result.retryAfterSeconds > 0
          ? result.retryAfterSeconds
          : null;
        const wakeAt = retryAfterSeconds === null ? null : Date.now() + retryAfterSeconds * 1000;
        setQuotaSleepUntil(wakeAt);
        const wakeTime = wakeAt === null
          ? null
          : new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(wakeAt);
        const sleepReply = isBn
          ? wakeTime
            ? `আমার AI request limit আপাতত শেষ, তাই আমি এখন একটু ঘুমাবো। আনুমানিক ${wakeTime}-এ জেগে উঠব—তখন আবার প্রশ্ন কোরো!`
            : 'আমার AI request limit আপাতত শেষ, তাই আমি এখন একটু ঘুমাবো। কখন জাগব তা জানা যাচ্ছে না—limit reset হলে আবার প্রশ্ন কোরো!'
          : wakeTime
            ? `My AI request limit is reached, so I’m going to sleep for a bit. I expect to wake up around ${wakeTime}—ask me again then!`
            : 'My AI request limit is reached, so I’m going to sleep for a bit. I don’t know when it will reset; please ask me again later!';
        setMessages((current) => [...current, { role: 'model', text: sleepReply }]);
        return;
      }
      if (!response.ok || answer === null) {
        throw new Error(errorCode || 'assistant_unavailable');
      }
      setMessages((current) => [...current, { role: 'model', text: answer }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '';
      if (message === 'assistant_not_configured') {
        setError(isBn ? `${assistantNameBn}-কে চালু করতে server-এ DeepSeek API key যোগ করতে হবে।` : `Add a DeepSeek API key on the server to enable ${assistantNameEn}.`);
      } else if (message === 'assistant_invalid_api_key') {
        setError(isBn
          ? 'DeepSeek API key গ্রহণ করা হয়নি। server-এর DEEPSEEK_API_KEY পরীক্ষা করুন।'
          : 'DeepSeek rejected the API key. Check the server DEEPSEEK_API_KEY setting.');
      } else if (message === 'assistant_billing_required') {
        setError(isBn
          ? 'DeepSeek account-এ balance বা billing সেটআপ প্রয়োজন। DeepSeek dashboard দেখে আবার চেষ্টা করুন।'
          : 'DeepSeek requires an account balance or billing setup. Check your DeepSeek dashboard and try again.');
      } else if (message === 'assistant_access_denied') {
        setError(isBn
          ? 'DeepSeek API-তে প্রবেশ অনুমোদিত হয়নি। API key-এর access ও account status পরীক্ষা করুন।'
          : 'DeepSeek denied API access. Check the API key permissions and account status.');
      } else if (message === 'assistant_quota_exceeded') {
        setError(isBn
          ? 'DeepSeek API request limit শেষ। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন, অথবা DeepSeek account-এর usage দেখুন।'
          : 'The DeepSeek API request limit has been reached. Wait a little and try again, or check usage in your DeepSeek account.');
      } else if (message === 'assistant_busy') {
        setError(isBn ? 'DeepSeek এখন ব্যস্ত। কিছুক্ষণ পরে আবার চেষ্টা করুন।' : 'DeepSeek is busy right now. Please try again in a little while.');
      } else if (message === 'rate_limited') {
        setError(isBn ? 'অল্প সময়ে অনেকবার চেষ্টা হয়েছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।' : 'There have been too many requests. Please wait a minute and try again.');
      } else {
        setError(isBn ? `এখন ${assistantNameBn}-এর সাথে যোগাযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।` : `${assistantNameEn} could not connect just now. Please try again in a moment.`);
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
      <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {reminder && isLoggedIn && !isOpen && (
          <div className="relative flex max-w-[280px] items-center gap-2 rounded-2xl border border-[#F0D9CC] bg-white p-3 pr-9 text-xs leading-relaxed text-[#4F4A55] shadow-lg">
            <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-[#F0D9CC] bg-white" />
            <span className="shrink-0">{makeMascot('small', mascotId, assistantNameBn)}</span>
            <button onClick={openReminder} className="text-left hover:text-[#A95E49]">{reminderQuestion}</button>
            <button onClick={() => setReminder(false)} className="absolute right-2 top-2 rounded p-1 text-[#99919A]" aria-label={isBn ? 'রিমাইন্ডার বন্ধ করুন' : 'Dismiss reminder'}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isOpen && (
          <section role="dialog" aria-modal="false" aria-label={isBn ? `${assistantNameBn} চ্যাট` : `Chat with ${assistantNameEn}`} className="mb-1 flex h-[min(600px,calc(100dvh-120px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-[#EDE1D8] bg-[#FFFCF8] shadow-2xl">
            <header className="flex items-center justify-between bg-[#F5E8DF] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">{makeMascot('small', mascotId, assistantNameBn)}</div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#383341]">{assistantName} <span className="text-[#B77362]">♡</span></h2>
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
                  {makeMascot('small', mascotId, assistantNameBn)}
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 text-xs leading-relaxed text-[#514B56] shadow-sm">
                    {isBn
                      ? `হ্যালো! আমি ${assistantNameBn}। ${isLoggedIn ? 'তোমার ছোট্ট সোনামণির বিকাশ আর এই ওয়েবসাইট নিয়ে আমাকে জিজ্ঞেস করতে পারো।' : 'শিশুর বিকাশ বা এই ওয়েবসাইট নিয়ে আমাকে জিজ্ঞেস করতে পারো!'}`
                      : `Hello! I'm ${assistantNameEn}. ${isLoggedIn ? 'Ask me about your little one’s development or this website.' : 'Ask me about child development or this website!'}`}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={`${index}-${message.role}`} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && makeMascot('small', mascotId, assistantNameBn)}
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
                  {makeMascot('small', mascotId, assistantNameBn)}
                  <span className="animate-pulse">{isBn ? `${assistantNameBn} ভাবছে…` : `${assistantNameEn} is thinking…`}</span>
                </div>
              )}
              {error && <p role="alert" className="rounded-xl bg-[#FFF0ED] px-3 py-2 text-[11px] leading-relaxed text-[#A34840]">{error}</p>}
              <div ref={messageEndRef} />
            </div>

            <div className="border-t border-[#EFE5DE] px-3 py-2">
              <p className="mb-1.5 text-center text-[9px] leading-relaxed text-[#968C94]">
                {isBn
                  ? isLoggedIn
                    ? 'উত্তরে শিশুর বয়স, growth ও routine-এর প্রয়োজনীয় তথ্য DeepSeek AI-তে যাবে। জরুরি স্বাস্থ্য সমস্যায় চিকিৎসকের পরামর্শ নিন।'
                    : 'উত্তর তৈরি করতে আপনার প্রশ্ন DeepSeek AI-তে যাবে। স্বাস্থ্য সমস্যায় চিকিৎসকের পরামর্শ নিন।'
                  : isLoggedIn
                    ? 'Relevant age, growth and routine details are sent to DeepSeek AI with your question. Ask a clinician for urgent health concerns.'
                    : 'Your question is sent to DeepSeek AI to generate an answer. Ask a clinician about urgent health concerns.'}
              </p>
              <form onSubmit={submit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={quotaSleepUntil !== null
                    ? isBn ? `${assistantNameBn} এখন ঘুমাচ্ছে…` : `${assistantNameEn} is sleeping…`
                    : isBn ? `${assistantNameBn}-কে কিছু জিজ্ঞেস করো…` : `Ask ${assistantNameEn} something…`}
                  className="min-w-0 flex-1 rounded-xl border border-[#E9DED6] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#CF927E]"
                  aria-label={isBn ? `${assistantNameBn}-কে বার্তা লিখুন` : `Message ${assistantNameEn}`}
                  maxLength={1000}
                  disabled={quotaSleepUntil !== null}
                />
                <button type="submit" disabled={!input.trim() || isSending || quotaSleepUntil !== null} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D78D78] text-white transition hover:bg-[#BC735E] disabled:cursor-not-allowed disabled:opacity-45" aria-label={isBn ? 'বার্তা পাঠান' : 'Send message'}>
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
          aria-label={isOpen ? (isBn ? `${assistantNameBn} চ্যাট বন্ধ করুন` : `Close ${assistantNameEn} chat`) : (isBn ? `${assistantNameBn}-র সাথে কথা বলুন` : `Chat with ${assistantNameEn}`)}
        >
          <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F9E7DE]">{makeMascot('small', mascotId, assistantNameBn)}</span>
          <span>{assistantName}</span>
          <span className="ml-0.5 flex h-2 w-2 rounded-full bg-[#70A87C]" />
          <span className="sr-only">AI assistant</span>
          <MessageCircle className="h-4 w-4 text-[#B77362]" />
        </button>
      </div>
    </>
  );
};
