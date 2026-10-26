import React from 'react';
import { Language } from '../types';

interface JourneyAnimationProps {
  currentLang?: Language;
  className?: string;
}

export const JourneyAnimation: React.FC<JourneyAnimationProps> = ({
  className = '',
}) => (
  <iframe
    title="শিশুর বেড়ে ওঠার অ্যানিমেশন"
    src="/pregnancy-to-24-months-animation.html"
    className={`block h-[320px] w-full border-0 sm:h-[320px] ${className}`}
    loading="eager"
  />
);
