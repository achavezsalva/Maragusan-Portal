import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Info,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  status: 'pending' | 'processing' | 'completed';
  created_at: any;
}

const serviceTypes = [
  "Business Permit Application",
  "Mayor's Clearance",
  "Certificate of Residency",
  "Building Permit",
  "Sanitary Permit",
  "Occupancy Permit",
  "Livelihood Assistance"
];

const Services: React.FC = () => {
  const { user, isCitizen } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Service requests fetch error:", error);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    };

    fetchRequests();

    const channel = supabase
      .channel('service_requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'service_requests',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !user) return;
    
    setSubmitting(true);
    try {
      await supabase.from('service_requests').insert({
        user_id: user.id,
        service_type: serviceType,
        status: 'pending',
      });
      
      setShowModal(false);
      setServiceType('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <ShieldCheck className="mx-auto text-blue-600 mb-6" size={64} />
        <h2 className="text-3xl font-bold font-display">Identity Verification Required</h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto">Please sign in to your citizen account to access the online service portal and track your requests.</p>
        <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all">Sign In to Continue</button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display uppercase tracking-tight flex items-center gap-4">
            <FileText className="text-brand-accent" size={36} strokeWidth={1} />
            Institutional Services
          </h1>
          <p className="text-brand-text-dim text-sm uppercase tracking-widest">Administrative Resource Channel</p>
        </div>

        {isCitizen && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> New Formal Request
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-brand-text-dim">Request Registry</h2>
            <div className="text-[10px] text-brand-accent font-bold uppercase tracking-widest flex items-center gap-2" aria-live="polite">
              <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>
              Active Stream
            </div>
          </div>

          <div className="grid gap-6" role="list">
            {loading ? (
              <div className="flex justify-center py-20 bg-brand-card rounded-3xl border border-brand-border" aria-busy="true" aria-label="Loading your requests">
                <Loader2 className="animate-spin text-brand-accent" size={32} aria-hidden="true" />
              </div>
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="glass-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-accent transition-colors" role="listitem">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 border rounded text-[9px] font-black uppercase tracking-widest ${
                        req.status === 'completed' ? 'border-green-400 text-green-400' :
                        req.status === 'processing' ? 'border-brand-accent text-brand-accent' : 'border-brand-text-dim text-brand-text-dim'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[10px] text-brand-text-dim uppercase tracking-widest">
                        Ref: {req.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{req.service_type}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-brand-text-dim uppercase tracking-widest">
                      <Clock size={12} aria-hidden="true" />
                      Filing Date: {req.created_at ? format(new Date(req.created_at), 'MMMM d, yyyy') : 'Pending Verification'}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      {req.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                          <CheckCircle2 size={16} aria-hidden="true" /> Finalized
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-brand-text-dim text-xs font-bold uppercase tracking-widest">
                          <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Adjudicating
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-brand-border rounded-3xl" aria-live="polite">
                <p className="text-brand-text-dim text-sm uppercase tracking-widest font-bold">No institutional requests found.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-text-dim pb-4 border-b border-brand-border">Filing Protocol</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-display text-xs">1</div>
                <div className="text-xs text-brand-text-dim leading-relaxed">Select specialized service from the official catalog.</div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-display text-xs">2</div>
                <div className="text-xs text-brand-text-dim leading-relaxed">Verify identity credentials through administrative channels.</div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent font-display text-xs">3</div>
                <div className="text-xs text-brand-text-dim leading-relaxed">System adjudication occurs within 3-5 business days.</div>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 bg-brand-accent/5 border-brand-accent/20">
            <div className="flex items-center gap-3 text-brand-accent mb-4 uppercase text-[10px] font-black tracking-widest">
              <ShieldCheck size={18} /> Administrative Security
            </div>
            <p className="text-xs text-brand-text-dim leading-relaxed">
              All transactions are encrypted under the Maragusan LGU security protocol. Data integrity is guaranteed.
            </p>
          </div>
        </aside>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6" role="presentation">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-card w-full max-w-xl rounded-2xl border border-brand-border overflow-hidden shadow-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-modal-title"
          >
            <div className="p-8 border-b border-brand-border flex justify-between items-center bg-white/5">
              <h3 id="request-modal-title" className="font-display text-2xl tracking-tight">Formal Request Filing</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-brand-text-dim hover:text-brand-text-bright transition-colors"
                disabled={submitting}
                aria-label="Close dialog"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-4">
                <label id="service-catalog-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Select Service Category</label>
                <div className="grid gap-3" role="group" aria-labelledby="service-catalog-label">
                  {serviceTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                      className={`text-left p-5 rounded-xl border transition-all focus:ring-2 focus:ring-brand-accent outline-none ${
                        serviceType === type 
                          ? 'border-brand-accent bg-brand-accent/10' 
                          : 'border-brand-border bg-white/5 hover:border-brand-text-dim'
                      }`}
                      aria-pressed={serviceType === type}
                    >
                      <div className="font-bold text-sm mb-1">{type}</div>
                      <div className="text-[9px] text-brand-text-dim uppercase tracking-widest">Official Government Module</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="text-xs uppercase tracking-widest font-black text-brand-text-dim hover:text-brand-text-bright transition-colors"
                >
                  Withdraw
                </button>
                <button 
                  type="submit"
                  disabled={!serviceType || submitting}
                  className="btn-primary px-10"
                >
                  {submitting ? 'Filing...' : 'Submit Formal Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Services;
