import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { checkDatabaseStatus } from '../../lib/supabase';

export function AdminSqlPage() {
  const [copied, setCopied] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);
  const [dbStatus, setDbStatus] = useState({ checking: true, isConnected: false });

  const verifyDb = async () => {
    setDbStatus({ checking: true, isConnected: false });
    const res = await checkDatabaseStatus();
    setDbStatus({ checking: false, isConnected: res.isConnected, count: res.count });
  };

  useEffect(() => {
    verifyDb();
  }, []);

  const rlsFixSql = `-- ==========================================================
-- KINO QO'SHISH VA TAHRIRLASH RLS SIYOSATLARINI RUXSAT BERISH
-- Supabase SQL Editor ga nusxalang va "RUN" tugmasini bosing:
-- ==========================================================

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Movies" ON public.movies;
DROP POLICY IF EXISTS "Movies are viewable by everyone" ON public.movies;
CREATE POLICY "Public Read Movies" ON public.movies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Insert Movies" ON public.movies;
DROP POLICY IF EXISTS "Admins can insert movies" ON public.movies;
CREATE POLICY "Allow Insert Movies" ON public.movies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Update Movies" ON public.movies;
DROP POLICY IF EXISTS "Admins can update movies" ON public.movies;
CREATE POLICY "Allow Update Movies" ON public.movies FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Delete Movies" ON public.movies;
DROP POLICY IF EXISTS "Admins can delete movies" ON public.movies;
CREATE POLICY "Allow Delete Movies" ON public.movies FOR DELETE USING (true);
`;

  const copyRlsFix = () => {
    navigator.clipboard.writeText(rlsFixSql);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] flex items-center gap-2">
          <Database className="w-6 h-6 text-red-500" />
          <span>Supabase Baza & SQL Sozlamalari</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Supabase SQL Editor orqali RLS ruxsatlarini va jadvallarni yangilang
        </p>
      </div>

      {/* Live Status Card */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        dbStatus.isConnected
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            {dbStatus.isConnected ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <AlertCircle className="w-6 h-6 text-amber-400" />}
          </div>
          <div>
            <div className="font-bold text-sm">
              {dbStatus.isConnected ? "Supabase PostgreSQL Bazasiga Ulandi!" : "Supabase jadvallari hali yaratilmagan"}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {dbStatus.isConnected
                ? "Baza mavjud. Kino qo'shishda xatolik bo'lmasligi uchun pastdagi RLS ruxsat skriptini RUN qiling."
                : "Iltimos, SQL skriptini Supabase SQL Editor ga nusxalang va 'RUN' tugmasini bosing."}
            </div>
          </div>
        </div>

        <button
          onClick={verifyDb}
          disabled={dbStatus.checking}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${dbStatus.checking ? 'animate-spin' : ''}`} />
          <span>Qayta tekshirish</span>
        </button>
      </div>

      {/* Important RLS Permission Script Card */}
      <div className="rounded-3xl border border-red-500/30 bg-[#0c0d14] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#12141e]">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>Muhim: Kino qo'shish va tahrirlashga ruxsat beruvchi SQL (RLS Fix)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kino qo'shganda Supabase rad etmasligi uchun ushbu qisqa kodni SQL Editorda ishga tushiring:
            </p>
          </div>

          <button
            onClick={copyRlsFix}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30"
          >
            {copiedFix ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Nusxa olindi!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Kodni Nusxalash</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-6 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed bg-[#0a0b11]">
          {rlsFixSql}
        </pre>
      </div>

      {/* Supabase Dashboard Link */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs text-slate-300">
        <span>Supabase loyihangiz SQL muharririga to'g'ridan-to'g'ri o'tish:</span>
        <a 
          href="https://supabase.com/dashboard/project/erfwnqbjvyjguflpfifa/sql" 
          target="_blank" 
          rel="noreferrer"
          className="text-red-400 hover:text-red-300 font-bold underline flex items-center gap-1.5"
        >
          <span>Supabase SQL Editorni ochish</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
