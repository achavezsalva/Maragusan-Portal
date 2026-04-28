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
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ALL_DEPT_DETAILS, DepartmentInfo } from '../constants/departments';
import { Save, X, Edit2, RefreshCw } from 'lucide-react';

const DepartmentDetail: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const [department, setDepartment] = useState<DepartmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState<DepartmentInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = isAdmin || (profile?.role === 'staff' && profile?.department_id === deptId);
  
  useEffect(() => {
    if (!deptId) return;

    const docRef = doc(db, 'departments', deptId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
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

  const handleSaveDept = async () => {
    if (!deptForm || !deptId) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'departments', deptId), deptForm);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to update department profile. Insufficient clearance.");
    } finally {
      setIsSaving(false);
    }
  };

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
        {canEdit && (
          <button 
            onClick={() => {
              setDeptForm({ ...department });
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-3 bg-brand-accent text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-blue-900 hover:scale-[1.02] transition-all"
          >
            <Edit2 size={18} /> Update Sector Data
          </button>
        )}
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
      
      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && deptForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-bg border border-brand-border rounded-[2.5rem] shadow-2xl p-10 space-y-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                    <Edit2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Sector Maintenance</h2>
                    <p className="text-2xl font-display text-brand-text-bright leading-none mt-1">Update Protocol</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Department Mission / Summary</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-medium text-brand-text-bright focus:border-brand-accent outline-none italic leading-relaxed"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({...deptForm, description: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Official Email</label>
                    <input 
                      type="email"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={deptForm.contact.email}
                      onChange={(e) => setDeptForm({...deptForm, contact: {...deptForm.contact, email: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Contact Hotline</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={deptForm.contact.phone}
                      onChange={(e) => setDeptForm({...deptForm, contact: {...deptForm.contact, phone: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Office Location</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                    value={deptForm.contact.location}
                    onChange={(e) => setDeptForm({...deptForm, contact: {...deptForm.contact, location: e.target.value}})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Sector Service Protocols</label>
                    <button 
                      type="button"
                      onClick={() => setDeptForm({...deptForm, services: [...deptForm.services, 'New Service Requested']})}
                      className="text-[9px] font-black uppercase tracking-widest text-brand-accent hover:underline"
                    >
                      + Add Protocol
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {deptForm.services.map((service, sidx) => (
                      <div key={sidx} className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 bg-white/5 border border-brand-border rounded-lg px-4 py-2 text-xs font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                          value={service}
                          onChange={(e) => {
                            const newServices = [...deptForm.services];
                            newServices[sidx] = e.target.value;
                            setDeptForm({...deptForm, services: newServices});
                          }}
                        />
                        <button 
                          onClick={() => {
                            const newServices = deptForm.services.filter((_, i) => i !== sidx);
                            setDeptForm({...deptForm, services: newServices});
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="button"
                  onClick={handleSaveDept}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-2xl bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-blue-900 transition-all font-display flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                  {isSaving ? 'Synchronizing...' : 'Finalize Profile Update'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentDetail;
