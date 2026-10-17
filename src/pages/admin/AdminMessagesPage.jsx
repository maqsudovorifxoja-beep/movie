import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { fetchMessages, deleteMessage } from '../../lib/supabase';

export function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMessages().then(data => {
      setMessages(data || []);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    setToast("Xabar muvaffaqiyatli o'chirildi");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
          Xabarlar & Murojaatlar
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Saytning "Bog'lanish" formasi orqali yuborilgan barcha xabarlar ({messages.length} ta)
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-white">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {messages.map((msg) => (
            <div key={msg.id} className="p-6 rounded-3xl bg-[#10121a] border border-white/[0.08] shadow-xl space-y-4 relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">{msg.name}</h3>
                  <div className="text-xs text-red-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{msg.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {msg.subject && (
                <div className="text-xs font-bold text-slate-200 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
                  Mavzu: {msg.subject}
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05] leading-relaxed">
                {msg.message}
              </p>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(msg.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-[#10121a] border border-white/[0.06] text-slate-400 text-xs">
          Hozircha hech qanday yangi xabar kelib tushmagan.
        </div>
      )}

    </div>
  );
}
