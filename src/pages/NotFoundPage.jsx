import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-red-600/10 text-red-500 border border-red-500/20 flex items-center justify-center">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-white font-['Outfit']">404</h1>
      <h2 className="text-xl font-bold text-slate-200">Sahifa topilmadi</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Bosh sahifaga qaytish</span>
      </Link>
    </div>
  );
}
