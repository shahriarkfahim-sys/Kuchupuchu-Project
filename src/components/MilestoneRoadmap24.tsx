import React, { useState } from 'react';
import { 
  Sparkles, 
  Baby, 
  Heart, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Language } from '../types';

interface MilestoneRoadmap24Props {
  currentLang: Language;
  onExploreFullMilestones?: () => void;
}

interface RoadmapStage {
  months: number;
  labelBn: string;
  labelEn: string;
  themeBn: string;
  themeEn: string;
  skillsBn: string[];
  skillsEn: string[];
  parentGameBn: string;
  parentGameEn: string;
  color: string;
}

const roadmapStages: RoadmapStage[] = [
  {
    months: 2,
    labelBn: '১-২ মাস',
    labelEn: '1-2 Months',
    themeBn: 'হাসিমুখ ও স্নেহের দৃষ্টি',
    themeEn: 'Social Smile & Eye Gaze',
    skillsBn: ['মায়ের গলার আওয়াজ চিনতে পেরে শান্ত হওয়া', 'প্রথম মিষ্টি সামাজিক হাসি দেওয়া', 'সামনে থাকা উজ্জ্বল জিনিস তাকিয়ে দেখা'],
    skillsEn: ['Calms at familiar parent voice', 'Shares first intentional social smile', 'Follows colorful objects briefly with eyes'],
    parentGameBn: 'সন্তানের মুখের কাছে গিয়ে স্নেহমাখা হাসিমুখে মৃদু সুরে কথা বলুন।',
    parentGameEn: 'Engage in gentle face-to-face eye contact and soft singing.',
    color: '#FFE4D3',
  },
  {
    months: 4,
    labelBn: '৩-৪ মাস',
    labelEn: '3-4 Months',
    themeBn: 'মাথা উঁচু করা ও হাসির শব্দ',
    themeEn: 'Head Lift & Giggling',
    skillsBn: ['উপুড় অবস্থায় কনুইয়ে ভর দিয়ে মাথা উঁচু রাখা', 'শব্দ শুনে মাথা ঘুরিয়ে খোঁজা', 'প্রথমবার খিলখিল করে শব্দ করে হাসা'],
    skillsEn: ['Lifts head and chest steadily during tummy time', 'Turns towards interesting rattles', 'Chuckles and makes joyful laughter sounds'],
    parentGameBn: 'নরম মাদুরে প্রতিদিন ৫-১০ মিনিট টামি টাইম দিন।',
    parentGameEn: 'Supervised gentle tummy time on a clean blanket.',
    color: '#EAF4EC',
  },
  {
    months: 6,
    labelBn: '৫-৬ মাস',
    labelEn: '5-6 Months',
    themeBn: 'হাত দিয়ে ধরা ও বসতে চাওয়া',
    themeEn: 'Reaching, Grasping & Rolling',
    skillsBn: ['বালিশের হেলান দিয়ে বসার চেষ্টা', 'এক পাশ থেকে অন্য পাশে গড়াগড়ি খাওয়া', 'খেলনা হাত দিয়ে ধরে মুখে নিয়ে পরখ করা'],
    skillsEn: ['Attempts sitting with mild cushion support', 'Rolls tummy to back and vice versa', 'Explores safe toys with hands and mouth'],
    parentGameBn: 'নরম কাপড়ের বল কিছুটা দূরে রেখে ধরতে উৎসাহিত করুন।',
    parentGameEn: 'Place colorful soft blocks within arm’s reach.',
    color: '#FFF0E2',
  },
  {
    months: 9,
    labelBn: '৭-৯ মাস',
    labelEn: '7-9 Months',
    themeBn: 'স্বাধীন বসা ও লুকোচুরি',
    themeEn: 'Independent Sitting & Peek-a-boo',
    skillsBn: ['কোনো ঠেস ছাড়া মেঝেতে সোজা হয়ে বসা', 'নাম ধরে ডাকলে সাথে সাথে তাকানো', 'লুকানো খেলনা চাদর সরিয়ে খোঁজা'],
    skillsEn: ['Sits independently with upright balance', 'Responds immediately to own name', 'Searches for toys hidden under a cloth'],
    parentGameBn: 'পাতলা সুতি রুমাল দিয়ে খেলনা ঢেকে পিক-আ-বু খেলুন।',
    parentGameEn: 'Play cloth peek-a-boo for object permanence.',
    color: '#E0E7FF',
  },
  {
    months: 12,
    labelBn: '১০-১২ মাস',
    labelEn: '10-12 Months',
    themeBn: 'ধরে দাঁড়ানো ও প্রথম কথা',
    themeEn: 'Cruising & First Words',
    skillsBn: ['সোফা বা খাট ধরে উঠে দাঁড়ানো', 'বাবা বা মামা বলে নির্দিষ্ট কাউকে ডাকা', 'বিদায় নেওয়ার সময় হাত নেড়ে টা-টা দেওয়া'],
    skillsEn: ['Pulls up to stand and cruises along edges', 'Articulates first meaningful words like Baba/Mama', 'Waves goodbye spontaneously'],
    parentGameBn: 'নিরাপদ আসবাবের কাছে খালি পায়ে দাঁড়ানোর অভ্যাস করান।',
    parentGameEn: 'Encourage barefoot standing on clean floors.',
    color: '#FEF3C7',
  },
  {
    months: 18,
    labelBn: '১৩-১৮ মাস',
    labelEn: '13-18 Months',
    themeBn: 'একা একা হাঁটা ও নতুন কথা',
    themeEn: 'Independent Walking & Vocabulary',
    skillsBn: ['কোনো অবলম্বন ছাড়া একা একা হাঁটাহাঁটি', '১০টির বেশি সাধারণ শব্দ বা অঙ্গভঙ্গি করা', 'চামচ দিয়ে নিজে নিজে খাওয়ার চেষ্টা'],
    skillsEn: ['Walks steadily without adult holding', 'Uses 10+ words and clear gestures', 'Attempts self-feeding with child spoon'],
    parentGameBn: 'ছবিওয়ালা রঙিন মোটা বোর্ড বই দেখিয়ে নাম বলুন।',
    parentGameEn: 'Read picture board books and point to familiar animals.',
    color: '#DCFCE7',
  },
  {
    months: 24,
    labelBn: '১৯-২৪ মাস',
    labelEn: '19-24 Months',
    themeBn: 'ছুটোছুটি ও দুই শব্দের বাক্য',
    themeEn: 'Running & Sentence Building',
    skillsBn: ['হাঁটার পাশাপাশি দৌড়ে যাওয়া', 'দুই শব্দের বাক্য (যেমন: "দুধ খাব", "বাবা যাই")', 'সহজ নির্দেশ বুঝতে পেরে খেলনা তুলে রাখা'],
    skillsEn: ['Runs steadily and climbs low steps', 'Combines two words (e.g. "Want milk")', 'Follows simple two-step instructions'],
    parentGameBn: 'সন্তানের সাথে ছন্দ মিলিয়ে বাংলা ছড়া গান গাওয়ার চর্চা করুন।',
    parentGameEn: 'Sing rhymes together and practice imaginative pretend play.',
    color: '#FFE4E6',
  },
];

export const MilestoneRoadmap24: React.FC<MilestoneRoadmap24Props> = ({
  currentLang,
  onExploreFullMilestones,
}) => {
  const [selectedStage, setSelectedStage] = useState<RoadmapStage>(roadmapStages[3]); // default 7-9 months

  return (
    <section className="bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-10 shadow-xs space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{currentLang === 'bn' ? 'গর্ভাবস্থা থেকে ২৪ মাস' : 'From pregnancy to 24 months'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3142] tracking-tight">
            {currentLang === 'bn' 
              ? 'এক যাত্রায় সন্তানের বেড়ে ওঠার প্রতিটি ধাপ'
              : 'Every step of your child’s growth, in one journey'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6479] max-w-2xl leading-relaxed">
            {currentLang === 'bn'
              ? 'নিচের মাসগুলোতে ক্লিক করে দেখে নিন প্রতিটি বয়সের মূল দক্ষতা এবং ঘরে বসেই কীভাবে সাহায্য করবেন।'
              : 'Click any milestone age node along the roadmap to see key skills and playful parent tips.'}
          </p>
        </div>

        <button
          onClick={onExploreFullMilestones}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF8552] hover:bg-[#E67332] text-white font-semibold rounded-2xl text-xs transition-colors shrink-0 shadow-xs"
        >
          <span>{currentLang === 'bn' ? 'অগ্রগতি ও গ্রাফে দেখুন' : 'Explore Growth & Graph'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sleek Rectangular Milestone Selector (Circles removed as requested; turns solid orange when touched/selected) */}
      <div className="py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {roadmapStages.map((stage) => {
            const isSelected = selectedStage.months === stage.months;
            return (
              <button
                key={stage.months}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className={`cursor-pointer w-full py-3.5 px-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-[#FF8552] hover:bg-[#E67332] text-white border-[#FF8552] shadow-md shadow-[#FF8552]/25 scale-102 ring-2 ring-[#FF8552]/30'
                    : 'bg-white hover:bg-[#FAF4ED] text-[#2D3142] border-[#EED9C7] hover:border-[#FF8552] shadow-xs'
                }`}
              >
                <span className={`text-sm sm:text-base font-bold tracking-tight ${isSelected ? 'text-white' : 'text-[#2D3142]'}`}>
                  {currentLang === 'bn' ? stage.labelBn : stage.labelEn}
                </span>
                <span className={`text-[11px] font-medium transition-colors ${
                  isSelected ? 'text-white/90 font-semibold' : 'text-[#8C6D53]'
                }`}>
                  {currentLang === 'bn' ? 'মাইলস্টোন' : 'Milestone'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Age Stage Card Details */}
      <div className="bg-[#FFFAF5] rounded-3xl border border-[#F0D5C1] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0D5C1]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0E2] text-[#C85D26] flex items-center justify-center font-bold text-lg shadow-xs">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#C85D26]">
                {currentLang === 'bn' ? `${selectedStage.labelBn} বয়সের মাইলস্টোন` : selectedStage.labelEn}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142]">
                {currentLang === 'bn' ? selectedStage.themeBn : selectedStage.themeEn}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#EED9C7] rounded-xl text-xs text-[#2F6B47] font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-[#2F6B47]" />
            <span>{currentLang === 'bn' ? 'স্বাভাবিক অগ্রগতির ধাপ' : 'Standard Development Stage'}</span>
          </div>
        </div>

        {/* 2 Column breakdown: Skills to look for & Recommended home play */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Key Emerging Skills */}
          <div className="bg-white rounded-2xl p-5 border border-[#EED9C7] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D3142] uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-[#FF8552]" />
              <span>{currentLang === 'bn' ? 'যেসব দক্ষতা ফুটে ওঠার কথা' : 'Milestone Skills to Notice'}</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#5C6479]">
              {(currentLang === 'bn' ? selectedStage.skillsBn : selectedStage.skillsEn).map((skill, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8552] mt-1.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practical Home Play */}
          <div className="bg-white rounded-2xl p-5 border border-[#EED9C7] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B47] uppercase tracking-wide">
              <Heart className="w-4 h-4 text-[#2F6B47]" />
              <span>{currentLang === 'bn' ? 'ঘরে বসেই সহজ খেলা' : 'Gentle Home Play'}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#5C6479] leading-relaxed">
              {currentLang === 'bn' ? selectedStage.parentGameBn : selectedStage.parentGameEn}
            </p>
            <div className="pt-2 text-[11px] text-[#8C6D53]">
              {currentLang === 'bn'
                ? '★ মনে রাখবেন: প্রতিটি শিশু নিজস্ব গতিতে বাড়ে। সামান্য সময় লাগলে দুশ্চিন্তার কোনো কারণ নেই।'
                : '★ Note: Every baby develops at their own rhythm. Variation of a few weeks is normal.'}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
