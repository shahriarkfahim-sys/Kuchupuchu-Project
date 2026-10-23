import { DomainScore, ECD6Domain, ECDMasterMilestone } from '../types';
import rawData from '../../public/assets/aistudio/child_development_milestones_0_24m_e4b599d7.json';

export interface MonthMilestoneData {
  month: number;
  ageTitleBn: string;
  checkpointType: string;
  milestonesCount: number;
  milestones: ECDMasterMilestone[];
}

export const domainMeta: Record<ECD6Domain, { labelBn: string; labelEn: string; subLabelBn: string; subLabelEn: string; color: string; order: number }> = {
  gross_motor: {
    labelBn: 'স্থূল শারীরিক চলন',
    labelEn: 'Gross Motor',
    subLabelBn: 'বসা, দাঁড়ানো, হাঁটা ও দৌড়ঝাঁপ',
    subLabelEn: 'Sitting, standing & balance',
    color: '#3B82F6', // Blue
    order: 0,
  },
  fine_motor: {
    labelBn: 'সূক্ষ্ম হাতের কাজ',
    labelEn: 'Fine Motor',
    subLabelBn: 'আঙুল দিয়ে ধরা ও ব্লক সাজানো',
    subLabelEn: 'Pincer grasp & stacking blocks',
    color: '#8B5CF6', // Purple
    order: 1,
  },
  cognitive: {
    labelBn: 'বুদ্ধি ও সমস্যা সমাধান',
    labelEn: 'Cognitive',
    subLabelBn: 'বস্তু স্থায়িত্ব ও অনুকরণ',
    subLabelEn: 'Object permanence & logic',
    color: '#10B981', // Emerald
    order: 2,
  },
  communication: {
    labelBn: 'ভাষা ও যোগাযোগ',
    labelEn: 'Communication',
    subLabelBn: 'সাড়া দেওয়া, বাবলিং ও প্রথম শব্দ',
    subLabelEn: 'Speech & responding to name',
    color: '#F59E0B', // Amber
    order: 3,
  },
  social_emotional: {
    labelBn: 'সামাজিক ও আবেগীয়',
    labelEn: 'Social-Emotional',
    subLabelBn: 'হাসি, চোখের দৃষ্টি ও মেলামেশা',
    subLabelEn: 'Smiling & joint attention',
    color: '#EC4899', // Pink
    order: 4,
  },
  self_help: {
    labelBn: 'নিজের যত্ন ও অভ্যাস',
    labelEn: 'Self-Help',
    subLabelBn: 'নিজে খাওয়া ও কাপ ধরা',
    subLabelEn: 'Self-feeding & cup holding',
    color: '#14B8A6', // Teal
    order: 5,
  },
};

// Map months data from JSON
const monthsMap: Record<number, MonthMilestoneData> = {};

if (rawData && rawData.months_data) {
  rawData.months_data.forEach((m: any) => {
    monthsMap[m.month] = {
      month: m.month,
      ageTitleBn: m.age_title_bn,
      checkpointType: m.checkpoint_type,
      milestonesCount: m.milestones_count,
      milestones: (m.milestones || []).map((ms: any) => ({
        id: ms.id,
        domain: ms.domain as ECD6Domain,
        titleBn: ms.title_bn,
        questionBn: ms.question_bn,
        observableSignBn: ms.observable_sign_bn,
        expectedAgeRange: ms.expected_age_range,
        redFlagCutoffMonth: ms.red_flag_cutoff_month,
        isCriticalRedFlag: ms.is_critical_red_flag,
        homePlayInterventionBn: ms.home_play_intervention_bn,
      })),
    };
  });
}

export function getMonthMilestones(month: number): MonthMilestoneData {
  if (monthsMap[month]) return monthsMap[month];
  // Fallback to nearest month
  const availableMonths = Object.keys(monthsMap).map(Number).sort((a, b) => a - b);
  const nearest = availableMonths.reduce((prev, curr) => 
    Math.abs(curr - month) < Math.abs(prev - month) ? curr : prev, 9);
  return monthsMap[nearest] || monthsMap[9];
}

/**
 * Calculates domain scores according to the specification formula:
 * Domain Score (%) = (sum of points earned / total possible points) * 100
 * Options:
 *  - 'achieved' = 1.0
 *  - 'emerging' = 0.5
 *  - 'not_yet' = 0.0
 *
 * Zones:
 *  - >= 80%: on_track (সবুজ জোন)
 *  - 50% - 79%: caution (হলুদ জোন)
 *  - < 50% or critical red flag: red_flag (লাল জোন)
 */
export function calculate6DomainScores(
  month: number,
  responses: Record<string, 'achieved' | 'emerging' | 'not_yet'>
): {
  domainScores: DomainScore[];
  overallProgress: number;
  overallZone: 'on_track' | 'caution' | 'red_flag';
  criticalRedFlagsDetected: ECDMasterMilestone[];
} {
  const monthData = getMonthMilestones(month);
  const domains: ECD6Domain[] = [
    'gross_motor',
    'fine_motor',
    'cognitive',
    'communication',
    'social_emotional',
    'self_help',
  ];

  const domainScores: DomainScore[] = [];
  const criticalRedFlagsDetected: ECDMasterMilestone[] = [];
  let totalEarned = 0;
  let totalPossible = 0;

  domains.forEach((dom) => {
    const domainMilestones = monthData.milestones.filter((m) => m.domain === dom);
    let earned = 0;
    const possible = Math.max(1, domainMilestones.length);

    let representativeInterventionBn = '';
    let representativeTitleBn = '';

    domainMilestones.forEach((ms) => {
      const resp = responses[ms.id] ?? 'achieved'; // Default to achieved if not explicitly toggled
      if (resp === 'achieved') earned += 1.0;
      else if (resp === 'emerging') earned += 0.5;
      else {
        earned += 0.0;
        if (ms.isCriticalRedFlag && month >= ms.redFlagCutoffMonth) {
          criticalRedFlagsDetected.push(ms);
        }
      }

      if (!representativeInterventionBn && ms.homePlayInterventionBn) {
        representativeInterventionBn = ms.homePlayInterventionBn;
        representativeTitleBn = ms.titleBn;
      }
    });

    totalEarned += earned;
    totalPossible += possible;

    const scorePercent = Math.round((earned / possible) * 100);
    let zone: 'on_track' | 'caution' | 'red_flag' = 'on_track';
    if (scorePercent < 50) {
      zone = 'red_flag';
    } else if (scorePercent < 80) {
      zone = 'caution';
    }

    const meta = domainMeta[dom];
    domainScores.push({
      domain: dom,
      labelBn: meta.labelBn,
      labelEn: meta.labelEn,
      subLabelBn: meta.subLabelBn,
      subLabelEn: meta.subLabelEn,
      score: scorePercent,
      zone,
      earnedPoints: earned,
      totalPoints: possible,
      homePlayInterventionBn: representativeInterventionBn || 'সহজ ঘরে থাকা জিনিস দিয়ে খেলাধুলা চালিয়ে যান।',
      homePlayInterventionEn: 'Continue daily playful interactions with household safe toys.',
      milestoneTitleBn: representativeTitleBn,
    });
  });

  const overallProgress = Math.round((totalEarned / Math.max(1, totalPossible)) * 100);
  let overallZone: 'on_track' | 'caution' | 'red_flag' = 'on_track';
  if (overallProgress < 50 || criticalRedFlagsDetected.length > 0) {
    overallZone = 'red_flag';
  } else if (overallProgress < 80) {
    overallZone = 'caution';
  }

  return {
    domainScores,
    overallProgress,
    overallZone,
    criticalRedFlagsDetected,
  };
}

// Default initial responses for a 9-month child (e.g., Ayaan Ahmed)
export function getInitialResponsesForMonth(month: number): Record<string, 'achieved' | 'emerging' | 'not_yet'> {
  const monthData = getMonthMilestones(month);
  const initialMap: Record<string, 'achieved' | 'emerging' | 'not_yet'> = {};

  monthData.milestones.forEach((m, idx) => {
    // Make most achieved, with 1-2 emerging in Self-Help / Communication for realistic data representation
    if (m.domain === 'self_help' && idx % 2 === 1) {
      initialMap[m.id] = 'emerging';
    } else if (m.domain === 'communication' && idx % 2 === 1) {
      initialMap[m.id] = 'emerging';
    } else {
      initialMap[m.id] = 'achieved';
    }
  });

  return initialMap;
}
