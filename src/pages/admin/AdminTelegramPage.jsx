import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Save, HelpCircle, ExternalLink, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';
import { getTelegramConfig, saveTelegramConfig, testTelegramConnection } from '../../lib/telegram';

export function AdminTelegramPage() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const config = getTelegramConfig();
    setBotToken(config.botToken || '8690944939:AAFAoy4ubx52L3BK5xM0p2IBSnBlwUd3qSY');
    setChatId(config.chatId || '5389465132');
    setEnabled(config.enabled !== false);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    saveTelegramConfig({
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      enabled,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTest = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestResult({ success: false, message: "Avval Bot Token va Chat ID maydonlarini to'ldiring!" });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      await testTelegramConnection(botToken.trim(), chatId.trim());
      setTestResult({ success: true, message: "Test xabari Telegram kanalingiz/botingizga muvaffaqiyatli yetib bordi! 🎉" });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
          <Send className="w-4 h-4" />
          <span>Telegram Integratsiyasi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
          Telegram Bot & Kanal Sozlamalari
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Saytga har safar yangi kino qo'shilganda rasmi, IMDb reytingi, tavsifi va treyleri bilan avtomatik Telegramga yuborish.
        </p>

        {/* Verified Bot Info Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              🤖
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Bot:</span>
                <span className="text-sky-400">@orifxojabot</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Faol</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ID: 8690944939
              </div>
            </div>
          </div>

          <a
            href="https://t.me/orifxojabot"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-sky-500 text-black font-bold text-xs hover:bg-sky-400 transition-all flex items-center gap-1"
          >
            <span>Botni ochish</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a] border border-white/[0.08] shadow-2xl space-y-6">
        
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <div className="text-sm font-bold text-white">Avtomatik yuborish holati</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Yangi film qo'shilganda darhol Telegramga xabar yuboriladi
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Bot Token */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Telegram Bot Token *
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                required
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Telegramda @BotFather orqali yaratilgan bot tokeni
            </p>
          </div>

          {/* Chat ID / Channel Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Telegram Kanal yoki Chat ID *
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              required
              placeholder="@kino_kanalimiz yoki -100123456789"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <p className="text-[11px] text-slate-500">
              Ommaviy kanal bo'lsa @ bilan boshlanadigan username (masalan: <code>@mening_kinolarim</code>) yoki shaxsiy guruh/kanal bo'lsa chat ID raqami.
            </p>
          </div>

          {/* Test Feedback Alerts */}
          {testResult && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 animate-in fade-in ${
              testResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold text-sky-400 hover:text-sky-300 border border-sky-500/20 transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testing ? 'Yuborilmoqda...' : 'Test Xabar Yuborish'}</span>
            </button>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Sozlamalarni Saqlash</span>
            </button>
          </div>

        </form>

      </div>

      {/* Step-by-Step Telegram Bot Setup Guide */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a] border border-white/[0.08] space-y-4">
        <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Telegram Bot va Kanalni ulash bo'yicha 3 ta qadam:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-black text-xs flex items-center justify-center">1</span>
            <div className="font-bold text-xs text-white">Bot oching</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Telegramda <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">@BotFather</a> ga o'tib, <code>/newbot</code> yuboring va berilgan HTTP API tokenni nusxalang.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-black text-xs flex items-center justify-center">2</span>
            <div className="font-bold text-xs text-white">Kanalga Admin qiling</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O'zingizning Telegram kanalingizga kiring va yangi ochgan botingizni <b>Administrator</b> qilib qo'shing (xabar yozish ruxsati bilan).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="w-6 h-6 rounded-full bg-sky-500 text-black font-black text-xs flex items-center justify-center">3</span>
            <div className="font-bold text-xs text-white">Saqlang & Sinang</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tepadagi formaga tokenni va kanal usernameni (masalan <code>@kino_kanalim</code>) yozib, "Test Xabar Yuborish" tugmasini bosing!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
