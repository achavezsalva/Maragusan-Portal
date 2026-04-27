import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { motion } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ALL_DEPT_DETAILS, DepartmentInfo } from '../constants/departments';

const DepartmentDetail: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<DepartmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!deptId) return;

    // Listen to Firestore first
    const unsubscribe = onSnapshot(doc(db, 'departments', deptId), (docSnap) => {
      if (docSnap.exists()) {
        setDepartment(docSnap.data() as DepartmentInfo);
      } else {
        // Fallback to static data if not in Firestore (during migration/init)
        const staticDept = ALL_DEPT_DETAILS.find(d => d.id === deptId);
        if (staticDept) {
          setDepartment(staticDept);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6">
        <Building size={48} className="text-brand-accent animate-pulse" />
        <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.4em] font-black italic">Accessing Municipal Ledger...</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <h2 className="text-2xl font-display text-brand-text-bright">Department Profile Not Found</h2>
        <p className="text-brand-text-dim">The requested administrative office information is currently being summarized.</p>
        <button 
          onClick={() => navigate('/directory')}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-xl hover:bg-blue-900 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={16} /> Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6">
      {/* Navigation & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-border pb-8">
        <div className="space-y-4">
          <Link 
            to="/directory" 
            className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-text-bright transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Directory
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand-accent/10 border border-brand-accent/20 rounded-xl flex items-center justify-center text-brand-accent">
                <Building size={24} />
             </div>
             <div>
                <h1 className="text-4xl font-display uppercase tracking-tight text-brand-text-bright">{department.name}</h1>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.3em] font-black italic mt-1">Official Municipal Department Profile</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mission/Description Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Building size={120} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-accent mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Mandate & Functional Focus
            </h2>
            <p className="text-lg text-brand-text-bright leading-relaxed font-medium">
              {department.description}
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-dim ml-2">Frontline Services & Operations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {department.services.map((service, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-6 flex items-start gap-4 hover:border-brand-accent transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-sm font-bold text-brand-text-bright group-hover:text-brand-accent transition-colors">{service}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Head of Office */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 border-l-4 border-l-brand-accent"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim mb-6">Head of Office</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-500 border border-brand-border">
                <User size={32} />
              </div>
              <div>
                <div className="text-lg font-display text-brand-text-bright uppercase tracking-tight leading-tight">{department.head}</div>
                <div className="text-[9px] text-brand-accent font-black uppercase tracking-widest mt-1 italic">Department Head</div>
              </div>
            </div>
          </motion.div>

          {/* Contact Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 space-y-8"
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-accent shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Official Email</div>
                  <a href={`mailto:${department.contact.email}`} className="text-sm font-bold text-brand-text-bright hover:text-brand-accent transition-colors">{department.contact.email}</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-accent shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Direct Line / Hotline</div>
                  <div className="text-sm font-bold text-brand-text-bright">{department.contact.phone}</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-accent shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Office Location</div>
                  <div className="text-sm font-bold text-brand-text-bright leading-relaxed">{department.contact.location}</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-border">
               <button className="w-full py-4 bg-brand-bg border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-accent hover:border-brand-accent transition-all">
                  Request Appointment
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;
