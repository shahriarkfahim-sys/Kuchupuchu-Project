export type Language = 'bn' | 'en';

export type ECD6Domain = 
  | 'gross_motor' 
  | 'fine_motor' 
  | 'cognitive' 
  | 'communication' 
  | 'social_emotional' 
  | 'self_help';

export type DevelopmentalDomain = 'cognitive' | 'physical' | 'speech' | 'sensory' | 'social';

export interface DomainScore {
  domain: ECD6Domain;
  labelBn: string;
  labelEn: string;
  subLabelBn: string;
  subLabelEn: string;
  score: number; // 0 to 100
  zone: 'on_track' | 'caution' | 'red_flag';
  earnedPoints: number;
  totalPoints: number;
  homePlayInterventionBn: string;
  homePlayInterventionEn: string;
  milestoneTitleBn: string;
}

export interface ECDMasterMilestone {
  id: string;
  domain: ECD6Domain;
  titleBn: string;
  questionBn: string;
  observableSignBn: string;
  expectedAgeRange: [number, number];
  redFlagCutoffMonth: number;
  isCriticalRedFlag: boolean;
  homePlayInterventionBn: string;
  userResponse?: 'achieved' | 'emerging' | 'not_yet';
}

export interface ChildProfile {
  id: string;
  nameBn: string;
  nameEn: string;
  nicknameBn: string;
  nicknameEn: string;
  gender: 'boy' | 'girl' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  ageMonths: number;
  ageDays: number;
  isPregnant?: boolean;
  expectedDueDate?: string;
  gestationalAgeWeeks?: number;
  gestationalMonth?: number;
  avatarSeed: string;
  mascotId?: string;
  mascotNameBn?: string;
  currentLeap: number;
  motherNameBn: string;
  motherNameEn: string;
  fatherNameBn?: string;
  fatherNameEn?: string;
  partnerCode: string; // e.g. "KUCHU-7421"
  linkedPartners: string[];
  currentWeightKg: number;
  currentHeightCm: number;
  todayMood?: 'happy' | 'fussy' | 'sleepy' | 'active';
  assessmentScore?: number;
  assessmentHighlights?: string[];
  assessmentDomainScores?: Array<{
    domain: string;
    labelBn: string;
    score: number;
    status: 'on_track' | 'monitor' | 'delay_risk';
    earnedPoints: number;
    totalPoints: number;
  }>;
}

export interface RoutineLogEntry {
  id: string;
  type: 'feed' | 'sleep' | 'diaper' | 'potty';
  date?: string;
  durationMinutes?: number;
  time: string;
  titleBn: string;
  titleEn: string;
  detailsBn: string;
  detailsEn: string;
  iconType: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: string; // 'মা', 'বাবা'
  childAgeBn: string;
  childAgeEn: string;
  timeAgoBn: string;
  timeAgoEn: string;
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
  category: 'sleep' | 'food' | 'milestones' | 'health' | 'play';
  upvotes: number;
  isUpvoted?: boolean;
  replies: {
    id: string;
    authorName: string;
    authorRole: string;
    bodyBn: string;
    bodyEn: string;
    timeAgoBn: string;
  }[];
}

export interface WeatherAdvisory {
  cityBn: string;
  cityEn: string;
  tempCelsius: number;
  conditionBn: string;
  conditionEn: string;
  airQualityBn: string;
  airQualityEn: string;
  clothingTipBn: string;
  clothingTipEn: string;
  fluidCareTipBn: string;
  fluidCareTipEn: string;
  activitySafetyTipBn: string;
  activitySafetyTipEn: string;
}

export interface GrowthLogEntry {
  id: string;
  date: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  newWord?: string;
  noteBn: string;
  noteEn: string;
  mood: 'happy' | 'fussy' | 'sleepy' | 'active';
}

export interface WormGraphPoint {
  month: number;
  labelBn: string;
  labelEn: string;
  standardScore: number; // 0 to 100
  babyScore: number;     // 0 to 100
  milestonesCount: number;
  highlightSkillBn: string;
  highlightSkillEn: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Activity {
  id: string;
  titleBn: string;
  titleEn: string;
  domain: DevelopmentalDomain;
  durationMinutes: number;
  objectiveBn: string;
  objectiveEn: string;
  stepsBn: string[];
  stepsEn: string[];
  milestoneMappedBn: string;
  milestoneMappedEn: string;
  materialsBn: string[];
  materialsEn: string[];
  cautionBn?: string;
  cautionEn?: string;
  image?: string;
  completed: boolean;
}

export type MilestoneCategory = 'cognitive' | 'motor' | 'speech' | 'social';

export interface MilestoneItem {
  id: string;
  category: MilestoneCategory;
  ageRangeMonths: number;
  ageRangeLabelBn: string;
  ageRangeLabelEn: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  isAchieved: boolean;
  redFlagThresholdMonths: number;
  easyParentTipBn: string;
  easyParentTipEn: string;
}

export interface ClinicProvider {
  id: string;
  nameBn: string;
  nameEn: string;
  institutionBn: string;
  institutionEn: string;
  specialtyBn: string;
  specialtyEn: string;
  division: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna';
  areaBn: string;
  areaEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  hotline: string;
  verifiedGovtReg: boolean;
  servicesOfferedBn: string[];
  servicesOfferedEn: string[];
  consultationFeeRange: string;
  image?: string;
}

export interface MoodConfig {
  id: 'happy' | 'fussy' | 'sleepy' | 'active';
  emoji: string;
  labelBn: string;
  labelEn: string;
  color: string;
}

export type SubscriptionStatus = 'trial' | 'active' | 'expired';
export type SubscriptionPlanType = 'monthly' | 'yearly';

export interface UserSubscription {
  status: SubscriptionStatus;
  plan?: SubscriptionPlanType;
  trialStartDate: string; // ISO date string
  trialEndDate: string; // ISO date string (30 days from start)
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paidAmount?: number;
  originalAmount?: number;
  discountAmount?: number;
  promoCode?: string;
  bkashNumber?: string;
  bkashTrxId?: string;
}

