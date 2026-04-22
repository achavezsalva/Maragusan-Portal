import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  History, 
  AlertCircle,
  X,
  MessageCircleQuestion,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface FeedbackEntry {
  id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: any;
}

const Feedback: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'feedback'), 
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackEntry)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !user) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        user_id: user.uid,
        message: text,
        status: 'received',
        created_at: serverTimestamp(),
      });
      setText('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display uppercase tracking-tight flex items-center gap-4">
            <MessageSquare className="text-brand-accent" size={36} strokeWidth={1} />
            Civic Outreach
          </h1>
          <p className="text-brand-text-dim text-sm uppercase tracking-widest">Community Engagement Resource Channel</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-card p-10 space-y-8 relative overflow-hidden">
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-x-0 top-0 bg-green-500 text-brand-bg py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <CheckCircle2 size={12} /> Communication Transmitted Successfully
              </motion.div>
            )}

            <div className="space-y-1">
              <h2 className="text-2xl font-display tracking-tight">Formal Feedback Submission</h2>
              <p className="text-brand-text-dim text-[11px] uppercase tracking-widest">Ensuring administrative accountability through direct citizen consultation.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Engagement Brief</label>
                <textarea 
                  rows={8}
                  required
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-lg p-6 focus:ring-1 focus:ring-brand-accent text-sm"
                  placeholder="Draft your detailed observation or suggestion for municipal review..."
                  disabled={!user}
                />
              </div>

              {!user ? (
                <div className="bg-brand-accent/5 p-4 rounded-lg flex gap-3 text-brand-accent border border-brand-accent/20 text-[10px] uppercase font-black tracking-widest">
                  <AlertCircle size={16} className="text-brand-accent flex-shrink-0" />
                  Electronic Identity Required for Submission
                </div>
              ) : (
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={submitting || !text}
                    className="btn-primary px-12 py-4 uppercase tracking-[0.2em] font-bold"
                  >
                    {submitting ? 'Transmitting...' : 'Send Communication'}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="glass-card p-8 bg-brand-accent/5 border-brand-accent/20">
             <div className="flex items-center gap-3 text-brand-accent mb-6 uppercase text-[10px] font-black tracking-widest">
               <ShieldCheck size={20} /> Executive Integrity Policy
             </div>
             <p className="text-xs text-brand-text-dim leading-relaxed">
               All community interactions are handled according to the Municipality's civic engagement protocols. Data integrity is guaranteed via secure administrative routing.
             </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Interaction Log</h3>
            {user && messages.length > 0 && <span className="text-[10px] font-bold text-brand-accent">{messages.length} ENTRIES</span>}
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="bg-brand-card h-24 rounded-xl border border-brand-border animate-pulse"></div>)}
              </div>
            ) : !user ? (
              <div className="text-center py-12 px-6 border border-dashed border-brand-border rounded-2xl">
                <p className="text-brand-text-dim text-[10px] uppercase tracking-widest font-black italic">Verification needed for log access.</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map(m => (
                <div key={m.id} className="glass-card p-6 space-y-4 hover:border-brand-accent transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">
                      {m.created_at?.seconds ? format(m.created_at.toDate(), 'MMMM d') : 'Pending'}
                    </span>
                    <span className={`px-2 py-0.5 border rounded-[4px] text-[8px] font-black uppercase tracking-widest ${
                      m.status === 'resolved' ? 'border-green-400 text-green-400' : 'border-brand-accent text-brand-accent'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-brand-text-dim text-xs leading-relaxed italic line-clamp-2">"{m.message}"</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-6 border border-dashed border-brand-border rounded-2xl">
                <p className="text-brand-text-dim text-[10px] uppercase tracking-widest font-black italic">No interaction history found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
