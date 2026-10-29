import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Language } from '../types';
import { formatDateForLocale } from '../utils/dateFormatting';

interface LocalizedDateInputProps {
  currentLang: Language;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className: string;
  type?: 'date' | 'month';
  id?: string;
  name?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

export const LocalizedDateInput: React.FC<LocalizedDateInputProps> = ({
  currentLang,
  value,
  onChange,
  className,
  type = 'date',
  id,
  name,
  min,
  max,
  required,
}) => {
  const displayValue = value
    ? formatDateForLocale(value, currentLang, type === 'month' ? { month: 'long', year: 'numeric' } : undefined)
    : currentLang === 'bn'
      ? type === 'month' ? 'মাস নির্বাচন করুন' : 'তারিখ নির্বাচন করুন'
      : type === 'month' ? 'Select month' : 'Select date';

  return (
    <span className={`relative flex min-h-12 items-center justify-between gap-3 ${className} has-[:focus-visible]:border-[#2F6B47] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[#2F6B47]/10`}>
      <span aria-hidden="true" className={`min-w-0 truncate ${value ? 'text-[#2D3142]' : 'text-[#98A2B3]'}`}>{displayValue}</span>
      <CalendarDays aria-hidden="true" className="h-5 w-5 shrink-0 text-[#667085]" />
      <input
        id={id}
        name={name}
        type={type}
        lang={currentLang === 'bn' ? 'bn-BD' : 'en-US'}
        required={required}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </span>
  );
};
