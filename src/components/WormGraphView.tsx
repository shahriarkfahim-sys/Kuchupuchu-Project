import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Heart, 
  Calendar
} from 'lucide-react';
import { ChildProfile, Language, MilestoneItem, WormGraphPoint } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';

interface WormGraphViewProps {
  currentLang: Language;
  activeChild: ChildProfile;
  wormData: WormGraphPoint[];
  milestones: MilestoneItem[];
  onToggleMilestone: (id: string) => void;
  onNavigateToCare: () => void;
}

export const WormGraphView: React.FC<WormGraphViewProps> = ({
  currentLang,
  activeChild,
  wormData,
  milestones,
  onToggleMilestone,
  onNavigateToCare,
}) => {
  const t = translations[currentLang];
  
  // Selected month link bar
  const [selectedMonthRange, setSelectedMonthRange] = useState<number>(9);
  const [activeHoverNode, setActiveHoverNode] = useState<WormGraphPoint | null>(wormData[3] || wormData[0]);

  // Monthly link bar ranges
  const monthRanges = [
    { months: 3, labelBn: '০-৩ মাস', labelEn: '0-3 Months' },
    { months: 6, labelBn: '৪-৬ মাস', labelEn: '4-6 Months' },
    { months: 9, labelBn: '৭-৯ মাস', labelEn: '7-9 Months' },
    { months: 12, labelBn: '১০-১২ মাস', labelEn: '10-12 Months' },
    { months: 18, labelBn: '১৩-১৮ মাস', labelEn: '13-18 Months' },
    { months: 24, labelBn: '১৯-২৪ মাস', labelEn: '19-24 Months' },
  ];

  // Filtered milestones based on the selected month range
  const filteredMilestones = milestones.filter((ms) => {
    if (selectedMonthRange <= 3) return ms.ageRangeMonths <= 3;
    if (selectedMonthRange <= 6) return ms.ageRangeMonths > 3 && ms.ageRangeMonths <= 6;
    if (selectedMonthRange <= 9) return ms.ageRangeMonths > 6 && ms.ageRangeMonths <= 9;
    if (selectedMonthRange <= 12) return ms.ageRangeMonths > 9 && ms.ageRangeMonths <= 12;
    if (selectedMonthRange <= 18) return ms.ageRangeMonths > 12 && ms.ageRangeMonths <= 18;
    return ms.ageRangeMonths > 18;
  });

  // SVG Worm Graph Dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 50;
  const paddingY = 40;

  // Convert points to SVG coordinates
  const getCoordinates = (index: number, score: number) => {
    const x = paddingX + (index / (wormData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (score / 100) * (svgHeight - 2 * paddingY);
    return { x, y };
  };

  // Generate smooth SVG path string
  // CRITICAL: Baby line stops strictly at activeChild.ageMonths (no future line)
  const generatePath = (type: 'standard' | 'baby') => {
    let dataPoints = wormData;
    if (type === 'baby') {
      dataPoints = wormData.filter((d) => d.month <= activeChild.ageMonths);
    }
    if (dataPoints.length === 0) return '';

    const points = dataPoints.map((d) => {
      const originalIdx = wormData.findIndex((w) => w.month === d.month);
      return getCoordinates(originalIdx, type === 'standard' ? d.standardScore : d.babyScore);
    });

    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const standardPath = generatePath('standard');
  const babyPath = generatePath('baby');
  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;

  return (
    <section id="growth-tracker" className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26] uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>{currentLang === 'bn' ? 'মাইলস্টোন ও প্রবৃদ্ধি' : 'Milestones & Growth Curve'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3142] tracking-tight mt-1">
          {t.growthTrackerTitle}
        </h2>
        <p className="text-sm text-[#5C6479] mt-1 max-w-2xl leading-relaxed">
          {t.growthTrackerSubtitle}
        </p>
      </div>

      {/* 1. VISUAL MONTHLY DEVELOPMENT LINK BAR */}
      <div className="bg-white rounded-3xl border border-[#EED9C7] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D3142] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FF8552]" />
            <span>{currentLang === 'bn' ? 'মাসের অগ্রগতির লিংক বার' : 'Monthly Milestone Roadmap Bar'}</span>
          </span>
          <span className="text-xs text-[#7C8294]">
            {currentLang === 'bn' ? 'যেকোনো মাসে ক্লিক করে দেখুন' : 'Click to filter milestones below'}
          </span>
        </div>

        {/* The Visual Link Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {monthRanges.map((range) => {
            const isSelected = selectedMonthRange === range.months;
            const isBabyCurrent = activeChild.ageMonths >= range.months - 2 && activeChild.ageMonths <= range.months;
            return (
              <button
                key={range.months}
                onClick={() => {
                  setSelectedMonthRange(range.months);
                  const matchingWormPoint = wormData.find((w) => w.month === range.months);
                  if (matchingWormPoint) setActiveHoverNode(matchingWormPoint);
                }}
                className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#FFFAF5] border-[#FFB07C] shadow-xs ring-2 ring-[#FFB07C]/30'
                    : 'bg-[#FAF4ED]/50 border-[#EED9C7] hover:border-[#FFB07C] hover:bg-white'
                }`}
              >
                <div className="text-xs font-bold text-[#2D3142]">
                  {currentLang === 'bn' ? range.labelBn : range.labelEn}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#7C8294] mt-1">
                  <span>
                    {range.months <= 9
                      ? currentLang === 'bn' ? 'অর্জিত' : 'Achieved'
                      : range.months === 12
                      ? currentLang === 'bn' ? 'চলতি' : 'Current'
                      : currentLang === 'bn' ? 'আসছে' : 'Upcoming'}
                  </span>
                </div>
                {isBabyCurrent && (
                  <span className="absolute top-1 right-2 text-[10px] font-bold text-[#2F6B47] bg-[#EAF4EC] px-1.5 py-0.5 rounded-full">
                    {currentLang === 'bn' ? 'বর্তমান' : 'Now'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE WORM GRAPH (ওয়ার্ম গ্রাফ) COMPARISON */}
      <div className="bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Worm Graph Header & Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F3E7DC] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#2D3142] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF8552]" />
              <span>
                {currentLang === 'bn' 
                  ? `${childName}-এর অগ্রগতির ওয়ার্ম গ্রাফ` 
                  : `${childName}'s Developmental Worm Curve`}
              </span>
            </h3>
            <p className="text-xs text-[#5C6479] mt-0.5">
              {t.wormGraphNote}
            </p>
          </div>

          {/* Graph Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-[#94A3B8]" />
              <span className="text-[#64748B]">{t.wormGraphStandardLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-1.5 bg-[#FF8552] rounded-full" />
              <span className="text-[#C85D26] font-bold">
                {currentLang === 'bn' ? `${childName}-এর রেখা` : `${childName}'s Curve`}
              </span>
            </div>
          </div>
        </div>

        {/* Worm Graph SVG Canvas */}
        <div className="w-full overflow-x-auto no-scrollbar py-2">
          <div className="min-w-[700px] relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Background Horizontal Guide Lines */}
              {[25, 50, 75, 100].map((score) => {
                const y = svgHeight - paddingY - (score / 100) * (svgHeight - 2 * paddingY);
                return (
                  <line
                    key={score}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#F1E3D3"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Standard Benchmark Curve */}
              <path
                d={standardPath}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />

              {/* Baby's Worm Curve */}
              <path
                d={babyPath}
                fill="none"
                stroke="#FF8552"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Benchmark Dots */}
              {wormData.map((d, i) => {
                const coord = getCoordinates(i, d.standardScore);
                return (
                  <circle
                    key={`std-${i}`}
                    cx={coord.x}
                    cy={coord.y}
                    r="3"
                    fill="#94A3B8"
                  />
                );
              })}

              {/* Interactive Baby Worm Beads */}
              {wormData.map((d, i) => {
                const coord = getCoordinates(i, d.babyScore);
                const isSelected = activeHoverNode?.month === d.month;
                const isCurrent = d.month === activeChild.ageMonths;
                const isFuture = d.month > activeChild.ageMonths;

                return (
                  <g
                    key={`baby-${i}`}
                    onClick={() => {
                      setActiveHoverNode(d);
                      setSelectedMonthRange(d.month <= 3 ? 3 : d.month <= 6 ? 6 : d.month <= 9 ? 9 : d.month <= 12 ? 12 : d.month <= 18 ? 18 : 24);
                    }}
                    className="cursor-pointer group"
                  >
                    {!isFuture ? (
                      <>
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={isSelected ? 14 : isCurrent ? 12 : 9}
                          fill="#FFFAF5"
                          stroke={isSelected ? '#C85D26' : '#FF8552'}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-200"
                        />
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r={isSelected ? 6 : 4}
                          fill={isCurrent ? '#2F6B47' : '#FF8552'}
                        />
                      </>
                    ) : (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="3"
                        fill="none"
                        stroke="#CBD5E1"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    <text
                      x={coord.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-semibold transition-colors ${
                        isSelected 
                          ? 'fill-[#C85D26] font-bold' 
                          : isFuture 
                          ? 'fill-[#94A3B8]' 
                          : 'fill-[#64748B]'
                      }`}
                    >
                      {currentLang === 'bn' ? d.labelBn : d.labelEn}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Worm Node Details Card */}
        {activeHoverNode && (
          <div className="bg-[#FFFAF5] rounded-2xl p-5 border border-[#F0D5C1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C85D26]">
                <span>{currentLang === 'bn' ? activeHoverNode.labelBn : activeHoverNode.labelEn}</span>
                <span aria-hidden="true" className="text-[#D8C2B0]">·</span>
                <span className="text-[#2F6B47]">
                  {activeHoverNode.status === 'completed'
                    ? currentLang === 'bn' ? '✓ সফলভাবে সম্পন্ন' : '✓ Milestone Achieved'
                    : activeHoverNode.status === 'current'
                    ? currentLang === 'bn' ? '★ বর্তমান পর্যায়' : '★ Current Window'
                    : currentLang === 'bn' ? 'পরবর্তী ধাপ' : 'Upcoming Stage'}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#2D3142]">
                {currentLang === 'bn' ? activeHoverNode.highlightSkillBn : activeHoverNode.highlightSkillEn}
              </h4>
              <p className="text-xs text-[#5C6479]">
                {currentLang === 'bn' 
                  ? `সাধারণ গড় স্কোর: ${formatLocalizedNumber(activeHoverNode.standardScore, currentLang)}% | আপনার সন্তানের অগ্রগতি: ${formatLocalizedNumber(activeHoverNode.babyScore, currentLang)}%`
                  : `Standard Benchmark: ${activeHoverNode.standardScore}% | Baby's Trajectory: ${activeHoverNode.babyScore}%`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-[#8C6D53]">
                {formatLocalizedNumber(activeHoverNode.milestonesCount, currentLang)} {currentLang === 'bn' ? 'টি মূল দক্ষতা' : 'key milestones'}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 3. SIMPLIFIED MILESTONES CHECKLIST FOR SELECTED MONTH */}
      <div className="bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E7DC] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#2D3142]">
              {currentLang === 'bn' 
                ? `${formatLocalizedNumber(selectedMonthRange, currentLang)} মাসের অগ্রগতি দক্ষতা তালিকা`
                : `Milestone Checklist for ${selectedMonthRange} Months`}
            </h3>
            <p className="text-xs text-[#5C6479] mt-0.5">
              {currentLang === 'bn' 
                ? 'সন্তান যা যা করতে পারছে তাতে টিক দিন। না পারলেও চিন্তার কিছু নেই, নিচে সহজ টিপস দেখুন।'
                : 'Check off what baby has unlocked. Use the parent tips for playful encouragement.'}
            </p>
          </div>
        </div>

        {/* Milestone Items List */}
        <div className="divide-y divide-[#F3E7DC]">
          {filteredMilestones.map((item) => {
            return (
              <div
                key={item.id}
                className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 max-w-2xl">
                  <button
                    onClick={() => onToggleMilestone(item.id)}
                    className="mt-0.5 text-[#FF8552] focus:outline-none transition-transform hover:scale-110 shrink-0"
                  >
                    {item.isAchieved ? (
                      <CheckCircle2 className="w-6 h-6 text-[#2F6B47] fill-[#EAF4EC]" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#CBD5E1] hover:text-[#FF8552]" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-sm text-[#2D3142]">
                        {currentLang === 'bn' ? item.titleBn : item.titleEn}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C6479] leading-relaxed">
                      {currentLang === 'bn' ? item.descriptionBn : item.descriptionEn}
                    </p>

                    {/* Easy Parent Tip */}
                    <div className="pt-1.5 flex items-start gap-1.5 text-xs text-[#8C6D53] bg-[#FAF4ED] p-2.5 rounded-xl border border-[#F0D5C1]">
                      <Heart className="w-3.5 h-3.5 text-[#FF8552] shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold">{t.easyParentTipTitle}: </strong>
                        {currentLang === 'bn' ? item.easyParentTipBn : item.easyParentTipEn}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      item.isAchieved
                        ? 'bg-[#EAF4EC] text-[#2F6B47]'
                        : 'bg-[#FFFAF5] text-[#8C6D53] border border-[#F0D5C1]'
                    }`}
                  >
                    {item.isAchieved ? t.achieved : t.notYet}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Note */}
        <div className="bg-[#FAF4ED] rounded-2xl p-4 border border-[#EED9C7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#8C6D53]">
              {t.gentleDelayNoteTitle}
            </h4>
            <p className="text-xs text-[#5C6479]">
              {t.gentleDelayNoteDesc}
            </p>
          </div>
          <button
            onClick={onNavigateToCare}
            className="px-4 py-2 bg-white text-[#C85D26] hover:bg-[#FAF4ED] border border-[#EED9C7] rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 shadow-xs"
          >
            {currentLang === 'bn' ? 'ডাক্তারদের তালিকা দেখুন' : 'View Specialist Directory'}
          </button>
        </div>

      </div>

    </section>
  );
};
