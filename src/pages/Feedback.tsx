import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
  ShieldCheck,
  Trash2,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface FeedbackEntry {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  status: string;
  created_at: any;
}

const Feedback: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [messages, setMessages] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Feedback fetch error:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchFeedback();

    const channel = supabase
      .channel('feedback-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'feedback' 
      }, () => {
        fetchFeedback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !user) return;
    
    setSubmitting(true);
    try {
      await supabase.from('feedback').insert({
        user_id: user.id,
        user_name: profile?.name || user.user_metadata?.full_name || user.email || 'Anonymous Citizen',
        message: text,
        status: 'received',
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

  const handleStatusUpdate = async (feedbackId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'resolved' ? 'received' : 'resolved';
    try {
      await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', feedbackId);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDelete = (feedbackId: string) => {
    setDeleteModal({ open: true, id: feedbackId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await supabase.from('feedback').delete().eq('id', deleteModal.id);
      setDeleteModal({ open: false, id: null });
    } catch (err: any) {
      console.error("Failed to delete feedback:", err);
      alert(`Delete failed: ${err.message}`);
      setDeleteModal({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display uppercase tracking-tight flex items-center gap-4">
            <MessageSquare className="text-brand-accent" size={36} strokeWidth={1} aria-hidden="true" />
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
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 size={12} aria-hidden="true" /> Communication Transmitted Successfully
              </motion.div>
            )}

            <div className="space-y-1">
              <h2 className="text-2xl font-display tracking-tight">Formal Feedback Submission</h2>
              <p className="text-brand-text-dim text-[11px] uppercase tracking-widest">Ensuring administrative accountability through direct citizen consultation.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label id="engagement-brief-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Engagement Brief</label>
                <textarea 
                  rows={8}
                  required
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-lg p-6 focus:ring-1 focus:ring-brand-accent text-sm outline-none transition-all"
                  placeholder="Draft your detailed observation or suggestion for municipal review..."
                  disabled={!user}
                  aria-labelledby="engagement-brief-label"
                />
              </div>

              {!user ? (
                <div className="bg-brand-accent/5 p-4 rounded-lg flex gap-3 text-brand-accent border border-brand-accent/20 text-[10px] uppercase font-black tracking-widest" role="alert">
                  <AlertCircle size={16} className="text-brand-accent flex-shrink-0" aria-hidden="true" />
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
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-text-dim flex items-center gap-2">
              Interaction Log
              {isAdmin && <span className="bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded text-[8px] uppercase tracking-tighter">Admin Active</span>}
            </h3>
            {user && messages.length > 0 && <span className="text-[10px] font-bold text-brand-accent">{messages.length} ENTRIES</span>}
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" role="list" aria-label="Feedback history">
            {loading ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading history">
                {[1,2,3].map(i => <div key={i} className="bg-brand-card h-24 rounded-xl border border-brand-border animate-pulse"></div>)}
              </div>
            ) : !user ? (
              <div className="text-center py-12 px-6 border border-dashed border-brand-border rounded-2xl">
                <p className="text-brand-text-dim text-[10px] uppercase tracking-widest font-black italic">Verification needed for log access.</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map(m => (
                <div key={m.id} className="glass-card p-6 space-y-4 hover:border-brand-accent transition-colors group" role="listitem">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-brand-text-bright uppercase tracking-widest mb-1">
                        {m.user_name}
                      </span>
                      <span className="text-[9px] font-bold text-brand-text-dim uppercase tracking-widest">
                        {m.created_at ? format(new Date(m.created_at), 'MMMM d, yyyy') : 'Processing...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 border rounded-[4px] text-[8px] font-black uppercase tracking-widest ${
                        m.status === 'resolved' ? 'border-green-400 text-green-400' : 'border-brand-accent text-brand-accent'
                      }`}>
                        {m.status}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleStatusUpdate(m.id, m.status)}
                            className="p-2 text-brand-text-bright hover:text-brand-accent transition-colors bg-white/10 rounded-md border border-brand-border"
                            title={m.status === 'resolved' ? 'Mark as Received' : 'Mark as Resolved'}
                          >
                            {m.status === 'resolved' ? <RotateCcw size={14} /> : <CheckCircle size={14} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(m.id)}
                            className="p-2 text-brand-text-bright hover:text-red-500 transition-colors bg-white/10 rounded-md border border-brand-border"
                            title="Delete Permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-brand-text-dim text-xs leading-relaxed italic border-l-2 border-brand-accent/20 pl-4 py-1">"{m.message}"</p>
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

      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal({ open: false, id: null })}
            className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md glass-card p-8 space-y-6 border-red-500/30 shadow-2xl shadow-red-500/10"
          >
            <div className="flex items-center gap-4 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-display uppercase tracking-tight text-brand-text-bright">Confirm Deletion</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Irreversible Administrative Action</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-brand-text-dim leading-relaxed italic border-l-2 border-red-500/20 pl-4">
                "Are you absolutely certain you want to permanently remove this record from the interaction log? This operation cannot be reversed."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button 
                onClick={handleConfirmDelete}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={12} /> Confirm Removal
              </button>
              <button 
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-brand-text-dim text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-colors border border-brand-border"
              >
                Cancel
              </button>
            </div>

            <button 
              onClick={() => setDeleteModal({ open: false, id: null })}
              className="absolute top-4 right-4 p-2 text-brand-text-dim hover:text-brand-text-bright transition-colors"
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
