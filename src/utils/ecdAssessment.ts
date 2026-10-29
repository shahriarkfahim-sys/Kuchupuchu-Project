import questionBank from '../data/ecdQuestionBank.json';

export type ECDPhase = 'pregnancy' | 'child';
export type ECDQuestion = (typeof questionBank)[number];
export type ECDAnswers = Record<string, number>;
export type ECDStatus = 'on_track' | 'monitor' | 'delay_risk';
export const childAssessmentMonths = [2, 4, 6, 9, 12, 15, 18, 24] as const;

export interface ECDDomainResult {
  key: string;
  labelBn: string;
  score: number;
  earnedPoints: number;
  totalPoints: number;
  status: ECDStatus;
  questions: number;
  followUpSkills: string[];
}

export interface ECDAssessmentResult {
  overallScore: number;
  status: ECDStatus;
  answeredQuestions: number;
  domains: ECDDomainResult[];
}

const childDomainLabels: Record<string, string> = {
  'মূল শারীরিক চলন': 'মূল শারীরিক চলন',
  'সূক্ষ্ম হাতের কাজ': 'সূক্ষ্ম হাতের কাজ',
  'বুদ্ধি ও সমস্যা সমাধান': 'বুদ্ধি ও সমস্যা সমাধান',
  'ভাষা ও যোগাযোগ': 'ভাষা ও যোগাযোগ',
  'সামাজিক ও আবেগীয়': 'সামাজিক ও আবেগীয়',
  'নিজের যত্ন ও অভ্যাস': 'নিজের যত্ন ও অভ্যাস',
  'জাতীয় ইপিআই টিকা (EPI Vaccine)': 'জাতীয় ইপিআই টিকা',
};

function statusFor(score: number): ECDStatus {
  if (score >= 80) return 'on_track';
  if (score >= 50) return 'monitor';
  return 'delay_risk';
}

export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return parsed.getFullYear() === Number(year) && parsed.getMonth() === Number(month) - 1 && parsed.getDate() === Number(day)
    ? parsed
    : null;
}

function addCalendarMonthsClamped(date: Date, months: number): Date {
  const firstOfTarget = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const daysInTargetMonth = new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth() + 1, 0).getDate();
  return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), Math.min(date.getDate(), daysInTargetMonth));
}

export function calculateAgeFromBirthDate(birthDate: string, now = new Date()): { ageMonths: number; ageDays: number } {
  const birth = parseLocalDate(birthDate);
  if (!birth) return { ageMonths: 0, ageDays: 0 };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < birth) return { ageMonths: 0, ageDays: 0 };

  let ageMonths = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) ageMonths -= 1;
  const lastMonthDate = addCalendarMonthsClamped(birth, ageMonths);
  const ageDays = Math.floor((today.getTime() - lastMonthDate.getTime()) / 86_400_000);
  return { ageMonths: Math.max(0, ageMonths), ageDays: Math.max(0, ageDays) };
}

export function calculatePregnancyWeeks(expectedDueDate: string, now = new Date()): number {
  const dueDate = parseLocalDate(expectedDueDate);
  if (!dueDate) return 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const estimatedPregnancyStart = new Date(dueDate.getTime() - 280 * 86_400_000);
  return Math.max(0, Math.floor((today.getTime() - estimatedPregnancyStart.getTime()) / (7 * 86_400_000)));
}

export function pregnancyMonthFromWeeks(weeks: number): number {
  return Math.max(1, Math.min(10, Math.ceil(Math.max(1, weeks) / 4)));
}

export function childChecklistMonth(ageMonths: number): number {
  return childAssessmentMonths.reduce((selected, month) => ageMonths >= month ? month : selected, 2);
}

export function childChecklistRangeLabel(month: number, language: 'bn' | 'en'): string {
  const index = childAssessmentMonths.indexOf(month as (typeof childAssessmentMonths)[number]);
  const nextMonth = childAssessmentMonths[index + 1];
  if (language === 'bn') {
    return nextMonth
      ? `${formatAssessmentNumber(month, language)}–${formatAssessmentNumber(nextMonth, language)} মাস`
      : `${formatAssessmentNumber(month, language)}+ মাস`;
  }
  return nextMonth ? `${month}–${nextMonth} months` : `${month}+ months`;
}

function formatAssessmentNumber(value: number, language: 'bn' | 'en'): string {
  if (language === 'en') return String(value);
  return String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);
}

export function childChecklistEndMonth(month: number): number {
  const index = childAssessmentMonths.indexOf(month as (typeof childAssessmentMonths)[number]);
  return childAssessmentMonths[index + 1] ?? month;
}

export function childMilestoneEndDate(birthDate: string, month: number): Date | null {
  const birth = parseLocalDate(birthDate);
  return birth ? addCalendarMonthsClamped(birth, childChecklistEndMonth(month)) : null;
}

export function getECDQuestions(phase: ECDPhase, month: number): ECDQuestion[] {
  return questionBank.filter((question) => question.phase === phase && question.month === month) as ECDQuestion[];
}

export function calculateECDResult(
  questions: ECDQuestion[],
  answers: ECDAnswers,
  phase: ECDPhase,
): ECDAssessmentResult {
  const grouped = new Map<string, { earned: number; total: number; count: number; followUpSkills: string[] }>();
  let earnedTotal = 0;
  let possibleTotal = 0;
  let answeredQuestions = 0;

  for (const question of questions) {
    const selectedOption = answers[question.id];
    if (selectedOption === undefined) continue;
    const option = question.options[selectedOption];
    if (!option) continue;
    const key = phase === 'pregnancy' ? 'pregnancy_care' : question.domainSource;
    const current = grouped.get(key) ?? { earned: 0, total: 0, count: 0, followUpSkills: [] };
    current.earned += option.weight;
    current.total += 2;
    current.count += 1;
    if (option.weight < 2) current.followUpSkills.push(question.coreSkillBn);
    grouped.set(key, current);
    earnedTotal += option.weight;
    possibleTotal += 2;
    answeredQuestions += 1;
  }

  const domains = Array.from(grouped.entries()).map(([key, data]) => {
    const score = data.total ? Math.round((data.earned / data.total) * 100) : 0;
    return {
      key,
      labelBn: phase === 'pregnancy' ? 'গর্ভকালীন যত্ন' : (childDomainLabels[key] ?? key),
      score,
      earnedPoints: data.earned,
      totalPoints: data.total,
      status: statusFor(score),
      questions: data.count,
      followUpSkills: data.followUpSkills,
    };
  });
  const overallScore = possibleTotal ? Math.round((earnedTotal / possibleTotal) * 100) : 0;

  return { overallScore, status: statusFor(overallScore), answeredQuestions, domains };
}

export { questionBank };
