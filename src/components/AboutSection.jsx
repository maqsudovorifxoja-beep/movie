import React from 'react';
import { Sparkles, Film, Tv, Volume2, ShieldCheck, Zap, Heart, MonitorSmartphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function AboutSection() {
  const { t } = useLanguage();

  const stats = [
    { value: t.about.heroStat1, label: t.about.heroStat1Text, icon: Film, color: 'from-red-600 to-rose-600' },
    { value: t.about.heroStat2, label: t.about.heroStat2Text, icon: Zap, color: 'from-amber-500 to-orange-500' },
    { value: t.about.heroStat3, label: t.about.heroStat3Text, icon: Tv, color: 'from-blue-500 to-indigo-600' },
    { value: t.about.heroStat4, label: t.about.heroStat4Text, icon: ShieldCheck, color: 'from-emerald-500 to-teal-600' },
  ];

  const features = [
    {
      icon: Tv,
      title: t.about.feature1Title,
      description: t.about.feature1Desc,
      glow: 'group-hover:border-red-500/40 group-hover:shadow-red-600/10'
    },
    {
      icon: Volume2,
      title: t.about.feature2Title,
      description: t.about.feature2Desc,
      glow: 'group-hover:border-purple-500/40 group-hover:shadow-purple-600/10'
    },
    {
      icon: MonitorSmartphone,
      title: t.about.feature3Title,
      description: t.about.feature3Desc,
      glow: 'group-hover:border-blue-500/40 group-hover:shadow-blue-600/10'
    },
    {
      icon: ShieldCheck,
      title: t.about.feature4Title,
      description: t.about.feature4Desc,
      glow: 'group-hover:border-emerald-500/40 group-hover:shadow-emerald-600/10'
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-24 relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biz Haqimizda</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            {t.sections.aboutTitle}
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.sections.aboutSub}
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="relative group p-6 rounded-3xl bg-white dark:bg-[#10121a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 text-center shadow-sm dark:shadow-xl"
              >
                <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className={`group p-8 rounded-3xl bg-white dark:bg-[#10121a]/70 backdrop-blur-xl border border-slate-200 dark:border-white/[0.07] ${feat.glow} transition-all duration-300 hover:shadow-xl flex items-start gap-5 shadow-sm dark:shadow-none`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all flex-shrink-0 group-hover:scale-105">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-red-500 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
