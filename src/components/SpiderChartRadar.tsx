import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  Info,
  Layers,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  Heart
} from 'lucide-react';
import { ChildProfile, DomainScore, ECD6Domain, Language } from '../types';
import { formatLocalizedNumber, translations } from '../i18n/translations';
import { calculate6DomainScores, getInitialResponsesForMonth, getMonthMilestones } from '../data/ecdDataset';

interface SpiderChartRadarProps {
  currentLang: Language;
  activeChild: ChildProfile;
  onNavigateToCare?: () => void;
  onSaveAssessment?: (month: number, overallScore: number, domainScores: DomainScore[]) => void;
}

export const SpiderChartRadar: React.FC<SpiderChartRadarProps> = ({
  currentLang,
  activeChild,
  onNavigateToCare,
  onSaveAssessment,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(activeChild.ageMonths || 9);
  
  // Load saved responses from localStorage if present, else default
  const [responses, setResponses] = useState<Record<string, 'achieved' | 'emerging' | 'not_yet'>>(() => {
    try {
      const saved = localStorage.getItem(`kuchupuchu_eval_${activeChild.id}_${activeChild.ageMonths || 9}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return getInitialResponsesForMonth(activeChild.ageMonths || 9);
  });

  const [activeDomainFilter, setActiveDomainFilter] = useState<ECD6Domain | 'all'>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  const t = translations[currentLang];
  const monthData = getMonthMilestones(selectedMonth);
  const assessment = calculate6DomainScores(selectedMonth, responses);

  // Switch month
  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    try {
      const saved = localStorage.getItem(`kuchupuchu_eval_${activeChild.id}_${newMonth}`);
      if (saved) {
        setResponses(JSON.parse(saved));
      } else {
        setResponses(getInitialResponsesForMonth(newMonth));
      }
    } catch {
      setResponses(getInitialResponsesForMonth(newMonth));
    }
    setActiveDomainFilter('all');
    setExpandedTipId(null);
    setIsSavedRecently(false);
  };

  // Toggle milestone response
  const handleResponseChange = (milestoneId: string, value: 'achieved' | 'emerging' | 'not_yet') => {
    setResponses((prev) => ({
      ...prev,
      [milestoneId]: value,
    }));
    setIsSavedRecently(false);
  };

  // Save assessment to local storage & parent
  const handleSaveAssessment = () => {
    try {
      localStorage.setItem(`kuchupuchu_eval_${activeChild.id}_${selectedMonth}`, JSON.stringify(responses));
    } catch (e) {
      // ignore
    }
    setIsSavedRecently(true);
    if (onSaveAssessment) {
      onSaveAssessment(selectedMonth, assessment.overallProgress, assessment.domainScores);
    }
    setTimeout(() => setIsSavedRecently(false), 3500);
  };

  // Radar SVG Math Constants
  const size = 520;
  const center = size / 2;
  const radius = 190;
  const numAxes = 6;
  const angleStep = (2 * Math.PI) / numAxes;
  const angleOffset = -Math.PI / 2;

  const getCoordinates = (index: number, value: number) => {
    const angle = angleOffset + index * angleStep;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const generatePolygonPoints = (values: number[]) => {
    return values.map((val, idx) => {
      const { x, y } = getCoordinates(idx, val);
      return `${x},${y}`;
    }).join(' ');
  };

  const domainOrder: ECD6Domain[] = [
    'gross_motor',
    'fine_motor',
    'cognitive',
    'communication',
    'social_emotional',
    'self_help',
  ];

  const scoresByDomain = domainOrder.map((dom) => {
    const found = assessment.domainScores.find((d) => d.domain === dom);
    return found ? found.score : 0;
  });

  const childPolygonPoints = generatePolygonPoints(scoresByDomain);
  const childName = currentLang === 'bn' ? activeChild.nameBn : activeChild.nameEn;

  const displayedMilestones = activeDomainFilter === 'all'
    ? monthData.milestones
    : monthData.milestones.filter((m) => m.domain === activeDomainFilter);

  return (
    <div className="bg-white rounded-3xl border border-[#EED9C7] p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in duration-200">
      
      {/* Header and Title (Without redundant prefix as requested) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#F3E7DC] pb-5">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-[#2D3142]">
            {currentLang === 'bn' 
              ? `${childName}-এর অগ্রগতির রাডার (Spider Chart)` 
              : `${childName}'s Developmental Radar Chart`}
          </h3>
          <p className="text-xs sm:text-sm text-[#5C6479]">
            {t.spiderChartSubtitle}
          </p>
        </div>

        {/* Overall Status Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            assessment.overallZone === 'on_track'
              ? 'bg-[#EAF4EC] border-[#CDE5D1] text-[#2F6B47]'
              : assessment.overallZone === 'caution'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-current" />
            <span>
              {currentLang === 'bn' ? 'সামগ্রিক অগ্রগতি: ' : 'Overall Score: '}
              {formatLocalizedNumber(assessment.overallProgress, currentLang)}% (
              {assessment.overallZone === 'on_track'
                ? currentLang === 'bn' ? 'স্বাভাবিক গতি' : 'On Track'
                : assessment.overallZone === 'caution'
                ? currentLang === 'bn' ? 'পর্যবেক্ষণ' : 'Monitoring'
                : currentLang === 'bn' ? 'ডাক্তারের পরামর্শ' : 'Needs Support'}
              )
            </span>
          </div>
        </div>
      </div>

      {/* Month Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#7C8294]">
          <span className="font-semibold text-[#2D3142]">
            {currentLang === 'bn' ? 'মাইলস্টোন চেকপয়েন্ট নির্বাচন করুন:' : 'Select Milestone Checkpoint Age:'}
          </span>
          <span>{currentLang === 'bn' ? '০-২৪ মাস প্রতি মাসের ডেটা' : '0-24 Months Master Dataset'}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[2, 4, 6, 9, 12, 15, 18, 24].map((m) => {
            const isSelected = selectedMonth === m;
            const isBabyCurrent = activeChild.ageMonths === m;
            return (
              <button
                key={m}
                onClick={() => handleMonthChange(m)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#FF8552] text-white border-[#FF8552] shadow-sm font-bold ring-2 ring-[#FF8552]/20'
                    : 'bg-[#FAF4ED] text-[#5C6479] border-[#EED9C7] hover:bg-white hover:text-[#2D3142]'
                }`}
              >
                <span>{formatLocalizedNumber(m, currentLang)} {t.monthUnit}</span>
                {isBabyCurrent && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white text-[#C85D26]' : 'bg-[#EAF4EC] text-[#2F6B47]'
                  }`}>
                    {currentLang === 'bn' ? 'বর্তমান' : 'Current'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Radar Chart SVG and Legend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 bg-[#FFFAF5] rounded-3xl p-6 sm:p-8 border border-[#F0D5C1]">
        
        {/* Left: The Spider Radar Chart Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center select-none">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible drop-shadow-xs"
            >
              <defs>
                <radialGradient id="redFlagGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FECACA" stopOpacity="0.4" />
                </radialGradient>
                <linearGradient id="radarPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Concentric Background Polygons */}
              <polygon
                points={generatePolygonPoints([100, 100, 100, 100, 100, 100])}
                fill="#ECFDF5"
                stroke="#10B981"
                strokeWidth="1.5"
                opacity="0.9"
              />

              <polygon
                points={generatePolygonPoints([80, 80, 80, 80, 80, 80])}
                fill="#FEF9C3"
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity="0.9"
              />

              <polygon
                points={generatePolygonPoints([50, 50, 50, 50, 50, 50])}
                fill="url(#redFlagGrad)"
                stroke="#EF4444"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              <circle
                cx={center}
                cy={center}
                r={(20 / 100) * radius}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Radial Axis Spokes */}
              {domainOrder.map((_, idx) => {
                const outer = getCoordinates(idx, 100);
                return (
                  <line
                    key={`axis-${idx}`}
                    x1={center}
                    y1={center}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                  />
                );
              })}

              <text x={center + 6} y={center - (20 / 100) * radius} className="text-[10px] fill-[#94A3B8] font-mono">20%</text>
              <text x={center + 6} y={center - (50 / 100) * radius} className="text-[10px] fill-[#EF4444] font-bold font-mono">50%</text>
              <text x={center + 6} y={center - (80 / 100) * radius} className="text-[10px] fill-[#F59E0B] font-bold font-mono">80%</text>
              <text x={center + 6} y={center - radius + 12} className="text-[10px] fill-[#10B981] font-bold font-mono">100%</text>

              {/* The Child's Evaluated Radar Polygon */}
              <polygon
                points={childPolygonPoints}
                fill="url(#radarPolyGrad)"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />

              {/* Apex Nodes for Each Domain */}
              {scoresByDomain.map((score, idx) => {
                const pt = getCoordinates(idx, score);
                const dom = domainOrder[idx];
                const isSelected = activeDomainFilter === dom;
                return (
                  <g 
                    key={`apex-${idx}`} 
                    className="cursor-pointer"
                    onClick={() => setActiveDomainFilter(activeDomainFilter === dom ? 'all' : dom)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 10 : 7}
                      fill="#FFFFFF"
                      stroke="#2563EB"
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200 hover:scale-125"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 4 : 3}
                      fill="#2563EB"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-[#1E3A8A] font-mono select-none"
                    >
                      {formatLocalizedNumber(score, currentLang)}%
                    </text>
                  </g>
                );
              })}

              {/* Domain Labels at Outer Perimeter */}
              {domainOrder.map((dom, idx) => {
                const angle = angleOffset + idx * angleStep;
                const labelRadius = radius + 34;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);
                const meta = assessment.domainScores.find((d) => d.domain === dom);
                const isSelected = activeDomainFilter === dom;

                let anchor: 'middle' | 'start' | 'end' = 'middle';
                if (Math.cos(angle) > 0.3) anchor = 'start';
                if (Math.cos(angle) < -0.3) anchor = 'end';

                return (
                  <text
                    key={`lbl-${idx}`}
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    onClick={() => setActiveDomainFilter(activeDomainFilter === dom ? 'all' : dom)}
                    className={`cursor-pointer text-[12px] transition-all select-none ${
                      isSelected 
                        ? 'fill-[#C85D26] font-bold text-[13px]' 
                        : 'fill-[#2D3142] font-semibold hover:fill-[#FF8552]'
                    }`}
                  >
                    {currentLang === 'bn' ? meta?.labelBn : meta?.labelEn}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Legend & Domain Status Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EED9C7] space-y-2 text-xs">
            <span className="font-bold text-[#2D3142] block uppercase tracking-wide text-[11px]">
              {currentLang === 'bn' ? 'স্পাইডার চার্টের ৩-স্তরের মানদণ্ড:' : 'Spider Chart Scoring Legend:'}
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#ECFDF5] border border-[#10B981] shrink-0" />
                <span className="text-[#065F46] font-medium">{t.zoneOnTrack}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#FEF9C3] border border-[#F59E0B] shrink-0" />
                <span className="text-[#854D0E] font-medium">{t.zoneCaution}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#FEE2E2] border border-[#EF4444] shrink-0" />
                <span className="text-[#991B1B] font-medium">{t.zoneRedFlag}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-[#F3E7DC]">
                <span className="w-3.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                <span className="text-[#1E40AF] font-bold">
                  {currentLang === 'bn' ? `${childName}-এর বর্তমান স্কোর রেখা` : `${childName}'s Assessment Curve`}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
            {assessment.domainScores.map((ds) => {
              const isSelected = activeDomainFilter === ds.domain;
              return (
                <div
                  key={ds.domain}
                  onClick={() => setActiveDomainFilter(isSelected ? 'all' : ds.domain)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-[#FF8552] shadow-xs ring-2 ring-[#FF8552]/20'
                      : 'bg-white/80 border-[#EED9C7] hover:bg-white hover:border-[#FFB07C]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2D3142]">
                        {currentLang === 'bn' ? ds.labelBn : ds.labelEn}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ds.zone === 'on_track'
                          ? 'bg-[#EAF4EC] text-[#2F6B47]'
                          : ds.zone === 'caution'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ds.zone === 'on_track' ? '✓ On Track' : ds.zone === 'caution' ? '⚠ Caution' : '🚨 Red Flag'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7C8294]">
                      {currentLang === 'bn' ? ds.subLabelBn : ds.subLabelEn}
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono font-bold text-sm text-[#2563EB]">
                    {formatLocalizedNumber(ds.score, currentLang)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Critical Red Flag Alert Banner (If Any Detected) */}
      {assessment.criticalRedFlagsDetected.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>{currentLang === 'bn' ? 'সতর্কবার্তা: ডাক্তারের পরামর্শ প্রয়োজন' : 'Clinical Red Flag Notice'}</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              {currentLang === 'bn'
                ? `নির্দিষ্ট কাট-অফ বয়সে কিছু গুরুত্বপূর্ণ মাইলস্টোন এখনো শুরু হয়নি (${assessment.criticalRedFlagsDetected.map(m => m.titleBn).join(', ')})। কোনো আতঙ্কের কারণ নেই, তবে অভিজ্ঞ শিশু বিশেষজ্ঞের সাথে পরামর্শ করা শ্রেয়।`
                : `Critical milestones for this age have not yet emerged. Consulting a pediatric specialist is recommended for early reassurance.`}
            </p>
          </div>

          <button
            onClick={onNavigateToCare}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{currentLang === 'bn' ? 'বিশেষজ্ঞ ডাক্তার খুঁজুন' : 'Consult Specialist'}</span>
          </button>
        </div>
      )}

      {/* Domain Compact Questionnaire & Save Action (Redesigned compactly per feedback) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E7DC] pb-3">
          <div>
            <h4 className="text-base font-bold text-[#2D3142] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF8552]" />
              <span>
                {currentLang === 'bn'
                  ? `${formatLocalizedNumber(selectedMonth, currentLang)} মাসের চেকলিস্ট ও মূল্যায়ন`
                  : `Milestone Checklist for ${selectedMonth} Months`}
              </span>
            </h4>
            <p className="text-xs text-[#7C8294]">
              {currentLang === 'bn'
                ? 'উত্তর নির্বাচন করুন এবং নিচে "সংরক্ষণ করুন" বাটনে ক্লিক করে ডেটা সেভ রাখুন।'
                : 'Choose responses and click Save to store progress in your profile.'}
            </p>
          </div>

          {/* Save Button Header Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAssessment}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                isSavedRecently 
                  ? 'bg-[#2F6B47] text-white' 
                  : 'bg-[#FF8552] hover:bg-[#E67332] text-white'
              }`}
            >
              {isSavedRecently ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSavedRecently ? (currentLang === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved!') : (currentLang === 'bn' ? 'অ্যাসেসমেন্ট সংরক্ষণ করুন' : 'Save Assessment')}</span>
            </button>
          </div>
        </div>

        {/* Save Confirmation Toast */}
        {isSavedRecently && (
          <div className="p-3 bg-[#EAF4EC] border border-[#CDE5D1] text-[#2F6B47] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#2F6B47]" />
            <span>{currentLang === 'bn' ? '✓ ডেটা সফলভাবে সংরক্ষিত হয়েছে! ওয়ার্ম গ্রাফ ও স্পাইডার চার্ট আপডেট সম্পন্ন।' : '✓ Assessment saved successfully! Trajectory updated.'}</span>
          </div>
        )}

        {/* Compact List of Questions */}
        <div className="space-y-2.5">
          {displayedMilestones.map((ms) => {
            const currentVal = responses[ms.id] ?? 'achieved';
            const isTipExpanded = expandedTipId === ms.id;

            return (
              <div 
                key={ms.id} 
                className="bg-[#FFFAF5] hover:bg-white rounded-2xl border border-[#EED9C7] p-3.5 transition-all shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Compact Title & Question + Tip Toggle */}
                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-[#8C6D53] bg-[#FFF0E2] px-1.5 py-0.5 rounded border border-[#F0D5C1]">
                        {assessment.domainScores.find(d => d.domain === ms.domain)?.labelBn || ms.domain}
                      </span>
                      {ms.isCriticalRedFlag && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          {currentLang === 'bn' ? 'মূল দক্ষতা' : 'Key'}
                        </span>
                      )}
                      <h5 className="text-xs sm:text-sm font-bold text-[#2D3142]">
                        {ms.titleBn}
                      </h5>
                    </div>

                    <p className="text-xs text-[#5C6479] leading-snug">
                      {ms.questionBn}
                    </p>
                  </div>

                  {/* Right: Compact 3-Choice Button Group */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleResponseChange(ms.id, 'achieved')}
                      className={`py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all border ${
                        currentVal === 'achieved'
                          ? 'bg-[#2F6B47] text-white border-[#2F6B47] shadow-xs'
                          : 'bg-white text-[#2F6B47] border-[#CDE5D1] hover:bg-[#EAF4EC]'
                      }`}
                      title={currentLang === 'bn' ? 'হ্যাঁ, খুব ভালো পারছে' : 'Mastered'}
                    >
                      ✓ {currentLang === 'bn' ? 'পারছে' : 'Yes'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResponseChange(ms.id, 'emerging')}
                      className={`py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all border ${
                        currentVal === 'emerging'
                          ? 'bg-[#D97706] text-white border-[#D97706] shadow-xs'
                          : 'bg-white text-[#D97706] border-[#FDE68A] hover:bg-amber-50'
                      }`}
                      title={currentLang === 'bn' ? 'চেষ্টা করছে' : 'Trying'}
                    >
                      → {currentLang === 'bn' ? 'চেষ্টা করছে' : 'Trying'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResponseChange(ms.id, 'not_yet')}
                      className={`py-1.5 px-2.5 text-xs font-bold rounded-xl transition-all border ${
                        currentVal === 'not_yet'
                          ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                          : 'bg-white text-[#DC2626] border-[#FECACA] hover:bg-red-50'
                      }`}
                      title={currentLang === 'bn' ? 'এখনো পারছে না' : 'Not yet'}
                    >
                      ✕ {currentLang === 'bn' ? 'এখনো না' : 'Not yet'}
                    </button>

                    {/* Expand Tip Button */}
                    {(ms.observableSignBn || ms.homePlayInterventionBn) && (
                      <button
                        type="button"
                        onClick={() => setExpandedTipId(isTipExpanded ? null : ms.id)}
                        className="p-1.5 text-[#7C8294] hover:text-[#2D3142] rounded-lg transition-colors ml-1"
                        title={currentLang === 'bn' ? 'টিপস ও খেলা দেখুন' : 'View tips'}
                      >
                        {isTipExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5 text-[#FF8552]" />}
                      </button>
                    )}
                  </div>

                </div>

                {/* Collapsible Guidance & Home Play */}
                {isTipExpanded && (
                  <div className="pt-2 border-t border-[#F3E7DC] space-y-1.5 text-xs animate-in fade-in">
                    {ms.observableSignBn && (
                      <div className="text-[#5C6479] bg-white p-2 rounded-xl border border-[#F3E7DC]">
                        <strong className="text-[#2D3142]">{currentLang === 'bn' ? 'পর্যবেক্ষণ কৌশল: ' : 'Observation: '}</strong>
                        {ms.observableSignBn}
                      </div>
                    )}
                    {ms.homePlayInterventionBn && (
                      <div className="text-[#2F6B47] bg-[#EAF4EC]/70 p-2 rounded-xl border border-[#CDE5D1] flex items-start gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#2F6B47] shrink-0 mt-0.5" />
                        <span>
                          <strong>{currentLang === 'bn' ? 'ঘরোয়া খেলা: ' : 'Home Play: '}</strong>
                          {ms.homePlayInterventionBn}
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Save Assessment Floating CTA Footer */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF4ED] p-4 rounded-2xl border border-[#EED9C7]">
          <div className="text-xs text-[#5C6479] space-y-0.5 text-center sm:text-left">
            <span className="font-bold text-[#2D3142] block">
              {currentLang === 'bn' ? 'সব উত্তর দেওয়া শেষ হলে সংরক্ষণ করুন' : 'Save your responses'}
            </span>
            <span>{currentLang === 'bn' ? 'ডেটা ব্রাউজারে সংরক্ষিত থাকবে এবং আপনার বাচ্চার সামগ্রিক অগ্রগতি গ্রাফে সংযুক্ত হবে।' : 'Data is stored securely and syncs directly to the trajectory curve.'}</span>
          </div>

          <button
            onClick={handleSaveAssessment}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 ${
              isSavedRecently 
                ? 'bg-[#2F6B47] text-white' 
                : 'bg-[#FF8552] hover:bg-[#E67332] text-white'
            }`}
          >
            {isSavedRecently ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSavedRecently ? (currentLang === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved!') : (currentLang === 'bn' ? 'অ্যাসেসমেন্ট সংরক্ষণ করুন' : 'Save Assessment')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
