import { Language } from '../types';

export function formatDateForLocale(value: string, lang: Language, options: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || (value.split('-').length === 3 && !day)) return value;
  return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', options).format(new Date(year, month - 1, day || 1));
}
