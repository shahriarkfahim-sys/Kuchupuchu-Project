import React, { useEffect, useState } from 'react';
import { BarChart3, Check, CircleHelp, UserRound, WandSparkles } from 'lucide-react';
import { Language } from '../types';
import './HowItWorksJourney.css';

interface HowItWorksJourneyProps {
  currentLang: Language;
}

const Cursor: React.FC = () => (
  <svg className="journey-demo-cursor" viewBox="0 0 16 20" aria-hidden="true">
    <path d="M1 1v14l4-4 3 7 3-1.3-3-6.8h6L1 1Z" fill="white" stroke="#25313D" strokeWidth="1.25" strokeLinejoin="round" />
  </svg>
);

const DemoWindow: React.FC<{ children: React.ReactNode; label: string; canvasClassName?: string }> = ({ children, label, canvasClassName = '' }) => (
  <div className="journey-demo-window">
    <div className="journey-demo-bar">
      <span>{label}</span>
    </div>
    <div className={`journey-demo-canvas ${canvasClassName}`}>{children}<Cursor /></div>
  </div>
);

const radarValues = [
  [74, 56, 68, 58, 46, 62],
  [84, 70, 77, 72, 62, 73],
  [68, 78, 63, 84, 75, 58],
];
const radarScores = [68, 78, 84];
const radarSuggestions = {
  bn: ['চলন ও ভারসাম্য নিয়ে মজার খেলা করুন।', 'খেলার মাধ্যমে নতুন দক্ষতার চর্চা চালিয়ে যান।', 'ভাষা ও নিজের যত্নের দক্ষতায় উৎসাহ দিন।'],
  en: ['Try playful activities for movement and balance.', 'Keep practicing new skills through play.', 'Encourage language and self-care skills.'],
};

export const HowItWorksJourney: React.FC<HowItWorksJourneyProps> = ({ currentLang }) => {
  const isBangla = currentLang === 'bn';
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileClicking, setProfileClicking] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [resultMonth, setResultMonth] = useState(0);

  useEffect(() => {
    let clickTimer = 0;
    let successTimer = 0;
    let resetTimer = 0;
    const cycle = () => {
      setProfileSaved(false);
      setProfileClicking(false);
      clickTimer = window.setTimeout(() => setProfileClicking(true), 3600);
      successTimer = window.setTimeout(() => setProfileSaved(true), 4050);
      resetTimer = window.setTimeout(() => {
        cycle();
      }, 12000);
    };
    cycle();
    return () => {
      window.clearTimeout(clickTimer);
      window.clearTimeout(successTimer);
      window.clearTimeout(resetTimer);
    };
  }, []);

  useEffect(() => {
    let answerTimer: number;
    let nextTimer: number;
    let resetTimer: number;
    const cycle = () => {
      answerTimer = window.setTimeout(() => setAnswerSelected(true), 4100);
      nextTimer = window.setTimeout(() => {
        setQuestionIndex(1);
        setAnswerSelected(false);
      }, 6500);
      resetTimer = window.setTimeout(() => {
        setQuestionIndex(0);
        cycle();
      }, 11800);
    };
    cycle();
    return () => {
      window.clearTimeout(answerTimer);
      window.clearTimeout(nextTimer);
      window.clearTimeout(resetTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setResultMonth((month) => (month + 1) % 3), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const steps = isBangla
    ? [
        { number: '১', title: 'প্রোফাইল খুলুন', description: 'সন্তানের নাম ও জন্মতারিখ দিয়ে ছোট্ট একটি প্রোফাইল তৈরি করুন।', icon: UserRound },
        { number: '২', title: 'বয়স অনুযায়ী প্রশ্নের উত্তর দিন', description: 'সন্তানের বয়সের উপযোগী সহজ প্রশ্নে তার দক্ষতাগুলো চিহ্নিত করুন।', icon: CircleHelp },
        { number: '৩', title: 'ফলাফল ও বিশ্লেষণ দেখুন', description: 'ছয়টি বিকাশের ক্ষেত্রে অগ্রগতি বুঝুন, সঙ্গে পান পরের ধাপের সহায়ক পরামর্শ।', icon: BarChart3 },
      ]
    : [
        { number: '1', title: 'Create a profile', description: 'Add your child’s name and birth date to get started.', icon: UserRound },
        { number: '2', title: 'Answer age-based questions', description: 'Answer a few simple questions about skills for your child’s age.', icon: CircleHelp },
        { number: '3', title: 'See results and insights', description: 'Understand progress across six areas and get helpful next steps.', icon: BarChart3 },
      ];

  const selectedRadarPoints = radarValues[resultMonth].map((value, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    return [120 + Math.cos(angle) * value * 0.78, 88 + Math.sin(angle) * value * 0.68] as const;
  });
  const selectedRadarPolygon = selectedRadarPoints.map(([x, y]) => `${x},${y}`).join(' ');
  const monthLabels = isBangla ? ['৯ মাস', '১২ মাস', '১৮ মাস'] : ['9 months', '12 months', '18 months'];
  const question = isBangla
    ? questionIndex === 0 ? 'কোনো কিছু ধরে বসার চেষ্টা করে?' : 'নাম ধরে ডাকলে আপনার দিকে তাকায়?'
    : questionIndex === 0 ? 'Does your child try to sit while holding onto something?' : 'Does your child look toward you when called by name?';

  return (
    <section className="space-y-8 sm:space-y-10" aria-label={isBangla ? 'তিন ধাপে শুরু' : 'Get started in three steps'}>
      <ol className="journey-step-list mx-auto max-w-5xl space-y-7 sm:space-y-9">
        {steps.map(({ number, title, description, icon: Icon }, index) => (
          <li key={number} className={`journey-step journey-step-${index + 1}`}>
            <div className="journey-step-copy">
              <span className="journey-step-marker"><span>{number}</span></span>
              <div className="journey-step-text">
                <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF2EA] text-[#D66A37]">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <h3 className="text-lg font-bold leading-snug text-[#25313D] sm:text-xl">{title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#77817D]">{description}</p>
              </div>
            </div>

            <div className="journey-step-demo">
              {index === 0 && (
                <DemoWindow label={isBangla ? 'সন্তানের প্রোফাইল' : 'Child profile'} canvasClassName={profileSaved ? 'profile-success' : ''}>
                  {profileSaved ? (
                    <div className="journey-profile-success" role="status" aria-live="polite">
                      <span className="journey-success-check"><Check className="h-6 w-6" /></span>
                      <strong>{isBangla ? 'আপনার প্রোফাইল সফলভাবে খোলা হয়েছে' : 'Your profile has been created successfully'}</strong>
                      <span>{isBangla ? 'আয়ানের প্রোফাইল এখন প্রস্তুত' : 'Ayan’s profile is ready'}</span>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-md p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E5] text-[#D66A37]"><UserRound className="h-5 w-5" /></span>
                        <div><p className="text-sm font-bold text-[#25313D]">{isBangla ? 'নতুন প্রোফাইল' : 'New profile'}</p><p className="text-[11px] text-[#8A9590]">{isBangla ? 'শুরু করতে তথ্য দিন' : 'Add a few details to begin'}</p></div>
                      </div>
                      <div className="space-y-2.5">
                        <div className="journey-demo-field"><span>{isBangla ? 'সন্তানের নাম' : 'Child’s name'}</span><b>{isBangla ? 'আয়ান' : 'Ayan'}</b></div>
                        <div className="journey-demo-field"><span>{isBangla ? 'জন্মতারিখ' : 'Date of birth'}</span><b>{isBangla ? '১৪ ফেব্রুয়ারি ২০২৫' : 'February 14, 2025'}</b></div>
                        <button type="button" onClick={() => { setProfileClicking(true); window.setTimeout(() => setProfileSaved(true), 350); }} className={`journey-demo-submit ${profileClicking ? 'journey-profile-clicked' : ''}`}><Check className="h-4 w-4" />{isBangla ? 'প্রোফাইল তৈরি করুন' : 'Create profile'}</button>
                      </div>
                    </div>
                  )}
                </DemoWindow>
              )}

              {index === 1 && (
                <DemoWindow label={isBangla ? 'বয়সভিত্তিক মূল্যায়ন' : 'Age-based check-in'}>
                  <div className="mx-auto max-w-md p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-[#FFF2EA] px-2.5 py-1 text-[10px] font-bold text-[#C85D26]">{isBangla ? '৯ মাস বয়স' : '9 months'}</span>
                      <span className="text-[11px] font-semibold text-[#8A9590]">{isBangla ? `প্রশ্ন ${questionIndex === 0 ? '৩' : '৪'} / ৮` : `Question ${questionIndex === 0 ? '3' : '4'} of 8`}</span>
                    </div>
                    <h4 className="min-h-10 text-sm font-bold text-[#25313D]">{question}</h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#89938E]">{isBangla ? 'আপনার দেখা আচরণের সবচেয়ে কাছের উত্তরটি বেছে নিন।' : 'Choose the answer closest to what you have observed.'}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button type="button" className="journey-demo-answer" onClick={() => setAnswerSelected(false)}>{isBangla ? 'হ্যাঁ' : 'Yes'}</button>
                      <button type="button" className="journey-demo-answer" onClick={() => setAnswerSelected(false)}>{isBangla ? 'মাঝে মাঝে' : 'Sometimes'}</button>
                      <button type="button" className={`journey-demo-answer ${answerSelected ? 'journey-answer-active' : ''}`} onClick={() => setAnswerSelected(true)}>{isBangla ? 'এখনো না' : 'Not yet'}{answerSelected && <Check className="h-3.5 w-3.5" />}</button>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#EEF1EF] pt-3 text-[11px]">
                      <span className="text-[#8A9590]">{answerSelected ? (isBangla ? 'উত্তর সংরক্ষিত' : 'Answer saved') : (isBangla ? 'একটি উত্তর বেছে নিন' : 'Choose an answer')}</span>
                      <button type="button" onClick={() => { setQuestionIndex((current) => (current + 1) % 2); setAnswerSelected(false); }} className="font-bold text-[#D66A37]">{isBangla ? 'পরের প্রশ্ন →' : 'Next question →'}</button>
                    </div>
                  </div>
                </DemoWindow>
              )}

              {index === 2 && (
                <DemoWindow label={isBangla ? 'বিকাশের সারাংশ' : 'Development summary'}>
                  <div className="px-3 pt-3 sm:px-4">
                    <div className="flex items-center justify-center gap-2" role="group" aria-label={isBangla ? 'বয়স নির্বাচন' : 'Select age'}>
                      {monthLabels.map((label, month) => (
                        <button key={label} type="button" onClick={() => setResultMonth(month)} className={`journey-month-button ${resultMonth === month ? 'journey-month-active' : ''}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid items-center gap-2 p-3 sm:grid-cols-[1.1fr_.9fr] sm:gap-3 sm:p-4">
                    <div className="rounded-xl bg-[#FBFCFB] p-2 sm:p-3">
                      <svg viewBox="0 0 240 190" className="mx-auto h-40 w-full max-w-[280px] sm:h-44" role="img" aria-label={isBangla ? `${monthLabels[resultMonth]} বয়সে ছয় ক্ষেত্রে বিকাশের স্পাইডার চার্ট` : `Spider chart across six areas at ${monthLabels[resultMonth]}`}>
                        {[25, 50, 75, 100].map((level) => <polygon key={level} points={Array.from({ length: 6 }, (_, i) => { const angle = -Math.PI / 2 + i * Math.PI / 3; return `${120 + Math.cos(angle) * level * 0.78},${88 + Math.sin(angle) * level * 0.68}`; }).join(' ')} fill="none" stroke="#E5EBE7" strokeWidth="1" />)}
                        {Array.from({ length: 6 }, (_, i) => { const angle = -Math.PI / 2 + i * Math.PI / 3; return <line key={i} x1="120" y1="88" x2={120 + Math.cos(angle) * 78} y2={88 + Math.sin(angle) * 68} stroke="#E5EBE7" />; })}
                        <polygon className="journey-radar-area" points={selectedRadarPolygon} fill="#EFA27E" fillOpacity=".32" stroke="#E9753F" strokeWidth="2.5" />
                        {selectedRadarPoints.map(([x, y], i) => <circle className="journey-radar-point" key={`${resultMonth}-${i}`} cx={x} cy={y} r="3.5" fill="#D66A37" style={{ animationDelay: `${i * 180}ms` }} />)}
                        <text x="120" y="12" textAnchor="middle">{isBangla ? 'চলন' : 'Movement'}</text><text x="210" y="51" textAnchor="start">{isBangla ? 'বুদ্ধি' : 'Thinking'}</text><text x="208" y="145" textAnchor="start">{isBangla ? 'ভাষা' : 'Language'}</text><text x="120" y="177" textAnchor="middle">{isBangla ? 'সামাজিক' : 'Social'}</text><text x="27" y="145" textAnchor="end">{isBangla ? 'যত্ন' : 'Self-care'}</text><text x="28" y="51" textAnchor="end">{isBangla ? 'সূক্ষ্ম কাজ' : 'Fine motor'}</text>
                      </svg>
                    </div>
                    <div className="space-y-2 rounded-xl bg-[#F7FAF8] p-3">
                      <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-[#697582]">{isBangla ? `${monthLabels[resultMonth]}-এর অগ্রগতি` : `Progress at ${monthLabels[resultMonth]}`}</span><span className="text-lg font-extrabold text-[#47745A]">{isBangla ? `${['৬৮', '৭৮', '৮৪'][resultMonth]}%` : `${radarScores[resultMonth]}%`}</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#E6EEE8]"><span className="journey-progress-fill block h-full rounded-full bg-[#6EAA83]" style={{ width: `${radarScores[resultMonth]}%` }} /></div>
                      <div className="flex items-start gap-2 pt-1 text-[10px] leading-relaxed text-[#697582]"><WandSparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D66A37]" />{radarSuggestions[currentLang][resultMonth]}</div>
                    </div>
                  </div>
                </DemoWindow>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
