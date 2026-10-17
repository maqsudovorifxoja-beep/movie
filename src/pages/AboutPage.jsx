import React from 'react';
import { AboutSection } from '../components/AboutSection';
import { Film, Shield, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-24 sm:pt-28 pb-16">
      <AboutSection />
    </div>
  );
}
