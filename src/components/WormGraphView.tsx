import React, { useEffect, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Calendar
} from 'lucide-react';
import { ChildProfile, Language, WormGraphPoint } from '../types';
import { translations, formatLocalizedNumber } from '../i18n/translations';
import { ECD6Domain } from '../types';
import { calculateECDResult, childAssessmentMonths, childChecklistRangeLabel, ECDAnswers, getECDQuestions } from '../utils/ecdAssessment';

const chartDomains: Record<string, ECD6Domain> = {
  'মূল শারীরিক চলন': 'gross_motor',
  'সূক্ষ্ম হাতের কাজ': 'fine_motor',
  'বুদ্ধি ও সমস্যা সমাধান': 'cognitive',
  'ভাষা ও যোগাযোগ': 'communication',
  'সামাজিক ও আবেগীয়': 'social_emotional',
  'নিজের যত্ন ও অভ্যাস': 'self_help',
};

function getRadarPoint(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return { x: 200 + Math.cos(angle) * radius, y: 165 + Math.sin(angle) * radius };
}

function toSvgPoints(points: Array<{ x: number; y: number }>) {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

interface WormGraphViewProps {
  currentLang: Language;
  activeChild: ChildProfile;
  wormData: WormGraphPoint[];
}

export const WormGraphView: React.FC<WormGraphViewProps> = ({
  currentLang,
  activeChild,
  wormData,
}) => {
  const t = translations[currentLang];
  
  // Selected month link bar
  const [selectedMonthRange, setSelectedMonthRange] = useState<number>(9);
  const [activeHoverNode, setActiveHoverNode] = useState<WormGraphPoint | null>(wormData.find((point) => point.month === 9) || wormData[3] || wormData[0]);
  const selectedGraphMonth = activeHoverNode?.month ?? selectedMonthRange;
  const selectedPoint = wormData.find((point) => point.month === activeHoverNode?.month) ?? wormData.find((point) => point.month === selectedMonthRange) ?? null;
  useEffect(() => {
    setActiveHoverNode((selected) => wormData.find((point) => point.month === selected?.month) ?? wormData.find((point) => point.month === selectedMonthRange) ?? null);
  }, [wormData, selectedMonthRange]);
  const assessmentSummary = useMemo(() => {
    const assessmentMonth = [...childAssessmentMonths].reverse().find((month) => month <= selectedGraphMonth);
    if (!assessmentMonth) return null;

    const questionById = new Map<string, ReturnType<typeof getECDQuestions>[number]>();
    const latestAnswers: ECDAnswers = {};
    const earlierMonths = childAssessmentMonths.filter((month) => month < assessmentMonth);
    const earlierQuestions = new Map<string, { question: ReturnType<typeof getECDQuestions>[number]; firstMonth: number }>();
    earlierMonths.forEach((month) => getECDQuestions('child', month).forEach((question) => {
      if (!earlierQuestions.has(question.id)) earlierQuestions.set(question.id, { question, firstMonth: month });
    }));
    for (const { question, firstMonth } of earlierQuestions.values()) {
      let latestAnswer: number | undefined;
      for (const month of earlierMonths.filter((candidate) => candidate >= firstMonth)) {
        try {
          const saved = localStorage.getItem(`kuchu_ecd_${activeChild.id}_child_${month}`);
          if (saved) {
            const answers = JSON.parse(saved) as ECDAnswers;
            if (answers[question.id] !== undefined) latestAnswer = answers[question.id];
          }
        } catch {
          // Ignore malformed saved answer data.
        }
      }
      if (latestAnswer !== undefined && question.options[latestAnswer]?.weight < 2) {
        questionById.set(question.id, question);
      }
    }
    getECDQuestions('child', assessmentMonth).forEach((question) => questionById.set(question.id, question));
    for (const month of childAssessmentMonths.filter((candidate) => candidate <= assessmentMonth)) {
      try {
        const saved = localStorage.getItem(`kuchu_ecd_${activeChild.id}_child_${month}`);
        if (saved) Object.assign(latestAnswers, JSON.parse(saved) as ECDAnswers);
      } catch {
        // Leave unavailable saved answers out of the comparison.
      }
    }
    const result = calculateECDResult(Array.from(questionById.values()), latestAnswers, 'child');
    return result.answeredQuestions > 0 ? { ...result, assessmentMonth } : null;
  }, [activeChild.id, selectedGraphMonth, wormData]);

  // Monthly link bar ranges
  const monthRanges = [
    { months: 3, labelBn: '০-৩ মাস', labelEn: '0-3 Months' },
    { months: 6, labelBn: '৪-৬ মাস', labelEn: '4-6 Months' },
    { months: 9, labelBn: '৭-৯ মাস', labelEn: '7-9 Months' },
    { months: 12, labelBn: '১০-১২ মাস', labelEn: '10-12 Months' },
    { months: 18, labelBn: '১৩-১৮ মাস', labelEn: '13-18 Months' },
    { months: 24, labelBn: '১৯-২৪ মাস', labelEn: '19-24 Months' },
  ];

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
      </div>

      {/* 1. VISUAL MONTHLY DEVELOPMENT LINK BAR */}
      <div className="bg-white rounded-3xl border border-[#EED9C7] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D3142] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FF8552]" />
            <span>{currentLang === 'bn' ? 'মাসের অগ্রগতির লিংক বার' : 'Monthly Milestone Roadmap Bar'}</span>
          </span>
          <span className="text-xs text-[#7C8294]">
            {currentLang === 'bn' ? 'মাস বেছে গ্রাফের অগ্রগতি দেখুন' : 'Choose a month to inspect its progress point'}
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

      {/* Spider chart and comparison stay in sync with the selected month above. */}
      <section className="rounded-3xl border border-[#EED9C7] bg-white p-5 shadow-xs sm:p-7">
        <h3 className="text-center text-xl font-bold text-[#2D3142]">
          {currentLang === 'bn' ? '৬টি ক্ষেত্রে বিকাশের স্পাইডার চার্ট' : 'Development across six areas'}
        </h3>
        <p className="mt-1 text-center text-sm text-[#7C8294]">
          {currentLang === 'bn'
            ? `${selectedPoint?.labelBn ?? `${formatLocalizedNumber(selectedGraphMonth, currentLang)} মাস`}-এর নির্বাচিত মূল্যায়নের সঙ্গে মিলিয়ে দেখুন`
            : `Assessment and growth curve for ${selectedPoint?.labelEn ?? `${selectedGraphMonth} months`}`}
        </p>
        {assessmentSummary ? (
          <>
            {assessmentSummary.domains.filter((domain) => chartDomains[domain.key]).length > 2 ? (
              <svg viewBox="0 0 400 330" role="img" aria-label={currentLang === 'bn' ? 'ছয়টি বিকাশের ক্ষেত্রে সন্তানের অগ্রগতির স্পাইডার চার্ট' : 'Spider chart of child development across six areas'} className="mx-auto mt-4 block w-full max-w-md overflow-visible">
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                  <polygon key={scale} points={toSvgPoints(assessmentSummary.domains.filter((domain) => chartDomains[domain.key]).map((_, index, domains) => getRadarPoint(index, domains.length, 100 * scale)))} fill="none" stroke="#EEDFD1" strokeWidth="1" />
                ))}
                {assessmentSummary.domains.filter((domain) => chartDomains[domain.key]).map((domain, index, domains) => {
                  const point = getRadarPoint(index, domains.length, 100);
                  return <line key={`axis-${domain.key}`} x1="200" y1="165" x2={point.x} y2={point.y} stroke="#E8D9CB" strokeWidth="1" />;
                })}
                <polygon points={toSvgPoints(assessmentSummary.domains.filter((domain) => chartDomains[domain.key]).map((domain, index, domains) => getRadarPoint(index, domains.length, Math.max(4, domain.score))))} fill="rgba(233,117,63,0.2)" stroke="#E9753F" strokeWidth="2.5" strokeLinejoin="round" />
                {assessmentSummary.domains.filter((domain) => chartDomains[domain.key]).map((domain, index, domains) => {
                  const point = getRadarPoint(index, domains.length, Math.max(4, domain.score));
                  const label = getRadarPoint(index, domains.length, 137);
                  return <g key={`score-${domain.key}`}>
                    <circle cx={point.x} cy={point.y} r="4" fill="#C85D26" stroke="white" strokeWidth="1.5" />
                    <text x={label.x} y={label.y} textAnchor={label.x < 175 ? 'end' : label.x > 225 ? 'start' : 'middle'} dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#5C6479">{domain.labelBn}</text>
                    <title>{`${domain.labelBn}: ${formatLocalizedNumber(domain.score, currentLang)}%`}</title>
                  </g>;
                })}
              </svg>
            ) : (
              <p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#FFFAF5] p-4 text-center text-sm text-[#667085]">
                {currentLang === 'bn' ? 'স্পাইডার চার্ট দেখাতে এই ধাপের আরও কয়েকটি ক্ষেত্রের উত্তর দরকার।' : 'Answer a few more areas in this milestone to display the spider chart.'}
              </p>
            )}
            <div className="mx-auto mt-4 max-w-2xl rounded-2xl bg-[#FFFAF5] p-4 text-center">
              <p className="text-sm font-bold text-[#2D3142]">
                {currentLang === 'bn'
                  ? `${childChecklistRangeLabel(assessmentSummary.assessmentMonth, currentLang)} মূল্যায়ন: ${formatLocalizedNumber(assessmentSummary.overallScore, currentLang)}% · সাধারণ বেঞ্চমার্ক: ${formatLocalizedNumber(selectedPoint?.standardScore ?? 0, currentLang)}%`
                  : `${childChecklistRangeLabel(assessmentSummary.assessmentMonth, currentLang)} assessment: ${assessmentSummary.overallScore}% · typical benchmark: ${selectedPoint?.standardScore ?? 0}%`}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#667085]">
                {currentLang === 'bn'
                  ? (assessmentSummary.overallScore >= (selectedPoint?.standardScore ?? 0)
                    ? 'এই নির্বাচিত সময়ে মূল্যায়নের সামগ্রিক স্কোর সাধারণ বেঞ্চমার্কের সমান বা বেশি। প্রতিটি ক্ষেত্রের স্কোর ও চর্চার পরামর্শ উপরের স্পাইডার চার্টে দেখুন।'
                    : 'এই নির্বাচিত সময়ে মূল্যায়নের সামগ্রিক স্কোর সাধারণ বেঞ্চমার্কের নিচে। কোন ক্ষেত্রে আরও চর্চা সহায়ক হতে পারে, তা স্পাইডার চার্টে দেখুন।')
                  : (assessmentSummary.overallScore >= (selectedPoint?.standardScore ?? 0)
                    ? 'The assessment score is at or above the typical benchmark for this selected period. Review each area in the radar chart.'
                    : 'The assessment score is below the typical benchmark for this selected period. Review the radar chart for areas that may benefit from practice.')}
              </p>
            </div>
          </>
        ) : (
          <p className="mx-auto mt-4 max-w-xl rounded-xl bg-[#FFFAF5] p-4 text-center text-sm text-[#667085]">
            {currentLang === 'bn' ? 'এই সময়ের স্পাইডার চার্ট ও তুলনা দেখতে আগে বিকাশের প্রশ্নগুলোর উত্তর দিন।' : 'Complete the developmental assessment to see the spider chart and comparison for this period.'}
          </p>
        )}
      </section>

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

      </div>

    </section>
  );
};
