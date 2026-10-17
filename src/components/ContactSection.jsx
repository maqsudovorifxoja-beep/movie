import React, { useState } from 'react';
import { Mail, MessageSquare, Send, MapPin, Send as TelegramIcon, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { sendMessage } from '../lib/supabase';

export function ContactSection() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ loading: false, success: false, error: "Iltimos, barcha maydonlarni to'ldiring." });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      const res = await sendMessage(formData);
      if (res.success) {
        setStatus({ loading: false, success: true, error: null });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      } else {
        setStatus({ loading: false, success: false, error: t.contact.error });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: t.contact.error });
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Aloqa</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-['Outfit']">
          {t.sections.contactTitle}
        </h2>

        <p className="text-base text-slate-600 dark:text-slate-300">
          {t.sections.contactSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Information & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#10121a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] space-y-6 shadow-sm dark:shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              To'g'ridan-to'g'ri aloqa
            </h3>
            
            <div className="space-y-4">
              
              {/* Telegram Channel */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] border border-slate-200 dark:border-white/[0.06] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TelegramIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Telegram</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">@cineflow_cinema</div>
                </div>
              </a>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.contact.email}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">support@cineflow.uz</div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manzil</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{t.contact.location}</div>
                </div>
              </div>

            </div>

            {/* Telegram Bot Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600/15 via-rose-600/10 to-transparent border border-red-500/20">
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
                <span>🤖 Telegram Bot</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px]">Rejada</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Keyingi bosqichda Telegram bot orqali yangi kinolarni qidirish va premyeralar haqida bildirishnoma olish imkoniyati qo'shiladi.
              </p>
            </div>

          </div>

        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#10121a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-2xl relative overflow-hidden">
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t.contact.name} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ali Valiyev"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t.contact.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ali@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.contact.subject}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Kino taklifi yoki hamkorlik..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.contact.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Fikr va takliflaringizni yozib qoldiring..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                />
              </div>

              {/* Alerts */}
              {status.success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{t.contact.success}</span>
                </div>
              )}

              {status.error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.loading}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-red-600/30 hover:shadow-red-600/50 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {status.loading ? (
                  <span>{t.contact.sending}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.contact.send}</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>

    </section>
  );
}
