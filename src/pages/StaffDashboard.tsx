import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Edit2, 
  Users, 
  Megaphone, 
  FileText,
  Save,
  X,
  Shield,
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Plus,
  Globe,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth, UserProfile } from '../hooks/useAuth';
import { DepartmentInfo, ALL_DEPT_DETAILS } from '../constants/departments';
import { MUNICIPAL_BRANDING } from '../constants';
import { Link } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const { profile, user, isStaff, loading } = useAuth();
  const [department, setDepartment] = useState<DepartmentInfo | null>(null);
  const [sectorStaff, setSectorStaff] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<DepartmentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{show: boolean, success: boolean, message: string}>({
    show: false,
    success: false,
    message: ''
  });

  // Announcement State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annImageUrl, setAnnImageUrl] = useState('');
  const [annImages, setAnnImages] = useState<string[]>([]);
  const [isAnnMunicipal, setIsAnnMunicipal] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  const canPostMunicipal = !!(profile?.role === 'admin' || (profile?.department_id && MUNICIPAL_BRANDING.newsAuthorizedDepts.includes(profile.department_id)));

  const sectorId = profile?.department_id;

  useEffect(() => {
    if (!profile || !isStaff) {
      if (!loading && !isStaff) setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const sectorId = profile.department_id;
        if (!sectorId) {
          setIsLoading(false);
          return;
        }

        // 1. Fetch Department
        const fallbackDept = ALL_DEPT_DETAILS.find(d => d.id === sectorId || d.name === sectorId);
        const targetId = fallbackDept?.id || sectorId;

        // Auto-fix legacy text-based department IDs if user is logged in via Supabase
        if (user && fallbackDept && sectorId === fallbackDept.name) {
          await supabase
            .from('users')
            .update({ department_id: fallbackDept.id })
            .eq('id', user.id);
        }

        const { data: deptData } = await supabase
          .from('departments')
          .select('*')
          .eq('id', targetId)
          .single();

        if (deptData) {
          setDepartment(deptData);
          setEditForm(deptData);
        } else if (fallbackDept) {
          setDepartment(fallbackDept);
          setEditForm(fallbackDept);
        }

        // 2. Fetch Staff
        const { data: staffData } = await supabase
          .from('users')
          .select('*')
          .eq('department_id', targetId)
          .order('name', { ascending: true });
        
        setSectorStaff((staffData || []).filter(u => !u.id.startsWith('pre_auth:')));

        // 3. Fetch Announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .eq('department_id', targetId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setAnnouncements(annData || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const usersChannel = supabase
      .channel('staff-users-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users',
        filter: `department_id=eq.${sectorId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const deptsChannel = supabase
      .channel('staff-depts-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'departments',
        filter: `id=eq.${sectorId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const annChannel = supabase
      .channel('staff-ann-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcements',
        filter: `department_id=eq.${sectorId}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      if (usersChannel) supabase.removeChannel(usersChannel);
      if (deptsChannel) supabase.removeChannel(deptsChannel);
      if (annChannel) supabase.removeChannel(annChannel);
    };
  }, [profile?.id, user?.id, isStaff, loading]);

  const handleUpdateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !sectorId) return;

    try {
      const targetId = department?.id || sectorId;
      const { error } = await supabase
        .from('departments')
        .upsert(editForm);

      if (error) throw error;

      setDepartment(editForm);
      setIsEditingProfile(false);
      setSaveStatus({
        show: true,
        success: true,
        message: 'Sector metadata synchronized successfully.'
      });
      setTimeout(() => setSaveStatus({ ...saveStatus, show: false }), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setSaveStatus({
        show: true,
        success: false,
        message: 'Failed to synchronize metadata. Check clearance levels.'
      });
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !sectorId) return;

    try {
      if (editingAnnId) {
        await supabase
          .from('announcements')
          .update({
            title: annTitle,
            content: annContent,
            image_url: annImageUrl,
            images: annImages,
            is_municipal: isAnnMunicipal
          })
          .eq('id', editingAnnId);
      } else {
        await supabase
          .from('announcements')
          .insert({
            title: annTitle,
            content: annContent,
            image_url: annImageUrl,
            images: annImages,
            department_id: sectorId,
            author_id: user?.id,
            is_municipal: isAnnMunicipal
          });
      }
      
      setAnnTitle('');
      setAnnContent('');
      setAnnImageUrl('');
      setAnnImages([]);
      setIsAnnMunicipal(false);
      setEditingAnnId(null);
      setShowAnnModal(false);
      
      setSaveStatus({
        show: true,
        success: true,
        message: isAnnMunicipal 
          ? 'Municipal Publication synchronized successfully. It will now appear on the Home Portal feed.' 
          : 'Department Publication synchronized successfully.'
      });
      setTimeout(() => setSaveStatus({ ...saveStatus, show: false }), 3000);
    } catch (err) {
      console.error("Ann save error:", err);
      alert("Error saving publication.");
    }
  };

  const handleDeleteAnn = async (id: string) => {
    if (!window.confirm('Terminate this publication record?')) return;
    try {
      await supabase.from('announcements').delete().eq('id', id);
      setSaveStatus({
        show: true,
        success: true,
        message: 'Publication record terminated.'
      });
      setTimeout(() => setSaveStatus({ ...saveStatus, show: false }), 3000);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
        <p className="text-[10px] uppercase font-black tracking-widest text-brand-text-dim">Synchronizing Sector Access...</p>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-brand-text-dim border border-slate-100">
          <Shield size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display uppercase tracking-tight text-brand-text-bright">
            Sector Clearance Required
          </h1>
          <p className="text-brand-text-dim max-w-sm mx-auto uppercase tracking-widest text-[10px] font-black leading-relaxed text-center">
            Staff level clearance and identity verification (Is Claimed) are required to access sector management tools.
          </p>
        </div>
      </div>
    );
  }

  if (!sectorId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-brand-text-dim border border-slate-100">
          <Users size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display uppercase tracking-tight text-brand-text-bright">
            Awaiting Assignment
          </h1>
          <p className="text-brand-text-dim max-w-sm mx-auto uppercase tracking-widest text-[10px] font-black leading-relaxed text-center">
            Your identity profile has not yet been assigned to a municipal sector. 
            Please contact the chief administrator for clearance protocols.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10">
      {/* Top Banner with Department Name */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-brand-accent rounded-[2.5rem] p-10 text-white shadow-2xl shadow-brand-accent/20"
      >
        <div className="absolute top-0 right-0 -tr-20 opacity-10 pointer-events-none">
          <Building2 size={300} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/20 text-white">
               Official Municipal Sector
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display uppercase tracking-tight leading-none drop-shadow-lg text-amber-400">
            {department?.name || (profile?.department_id ? profile.department_id : 'Unauthorized Sector')}
          </h1>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm text-white border border-white/10">
              <Shield size={14} /> Authorized Personnel Dashboard
            </div>
            {profile?.department_id && MUNICIPAL_BRANDING.newsAuthorizedDepts.includes(profile.department_id) && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-amber-400 text-brand-bg px-4 py-2 rounded-xl shadow-lg border border-amber-300 animate-pulse">
                <Globe size={14} /> Municipal Hub Access
              </div>
            )}
            {department?.head && (
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest opacity-80 italic">
                Under the directorship of: {department.head}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white/5 border border-brand-border rounded-2xl flex items-center justify-center text-brand-text-dim shadow-xl">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-display uppercase tracking-tight text-brand-text-bright leading-none">Control Interface</h2>
            <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.3em] font-black italic mt-2">
              Sector Management & Communications
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setEditingAnnId(null);
              setAnnTitle('');
              setAnnContent('');
              setAnnImageUrl('');
              setIsAnnMunicipal(canPostMunicipal);
              setShowAnnModal(true);
            }}
            className="flex items-center gap-3 bg-white/5 border border-brand-border text-brand-text-dim px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-accent hover:border-brand-accent transition-all"
          >
            <Megaphone size={16} /> New Publication
          </button>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="flex items-center gap-3 bg-brand-accent text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:scale-[1.02] transition-all"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {saveStatus.show && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border flex items-center gap-4 ${
            saveStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}
        >
          {saveStatus.success ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-xs font-black uppercase tracking-widest">{saveStatus.message}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 space-y-8 h-full">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                 <Building2 size={24} />
               </div>
               <div>
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent mb-1">Official Profile</h2>
                 <h1 className="text-3xl font-display text-brand-text-bright uppercase tracking-tight">{department?.name}</h1>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim block mb-1">Office Head</label>
                   <p className="text-lg font-display text-brand-text-bright uppercase tracking-tight">{department?.head || 'Pending Assignment'}</p>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-xs text-brand-text-dim uppercase tracking-widest leading-relaxed">
                      <Phone size={14} className="text-brand-accent" /> {department?.contact.phone}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-brand-text-dim uppercase tracking-widest leading-relaxed">
                      <Mail size={14} className="text-brand-accent" /> {department?.contact.email}
                   </div>
                   <div className="flex items-center gap-3 text-xs text-brand-text-dim uppercase tracking-widest leading-relaxed">
                      <MapPin size={14} className="text-brand-accent" /> {department?.contact.location}
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim block border-b border-brand-border pb-1">Mandate Summary</label>
                 <p className="text-xs text-brand-text-dim leading-relaxed italic">{department?.description}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-brand-border">
               <label className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim block mb-4">Core Service Protocols</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {department?.services.map((service, idx) => (
                   <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-brand-border rounded-xl group hover:border-brand-accent/30 transition-all">
                     <div className="w-1.5 h-1.5 rounded-full bg-brand-accent group-hover:scale-150 transition-all" />
                     <span className="text-[10px] font-bold text-brand-text-bright uppercase tracking-tight">{service}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Staff Roster */}
        <div className="space-y-8">
           <div className="glass-card p-8 space-y-6 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-secondary/10 rounded-xl flex items-center justify-center text-brand-secondary border border-brand-secondary/20">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display text-brand-text-bright uppercase tracking-tight">Personnel</h3>
                    <p className="text-[8px] text-brand-text-dim uppercase tracking-widest font-black">Authorized Staff</p>
                  </div>
                </div>
                <div className="text-[10px] font-black text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full border border-brand-accent/20">
                  {sectorStaff.length}
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {sectorStaff.map((staffMember) => (
                  <div key={staffMember.id} className="p-4 bg-white/5 border border-brand-border rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent font-display text-lg">
                      {staffMember.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-brand-text-bright truncate">{staffMember.name}</div>
                      <div className="text-[9px] text-brand-text-dim font-black uppercase tracking-widest mt-1 italic">{staffMember.role}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-brand-border">
                <p className="text-[8px] text-brand-text-dim uppercase tracking-widest text-center italic font-black">
                  Identity profiles managed by Office of the Mayor
                </p>
              </div>
           </div>
        </div>

        {/* Latest Announcements Control */}
        <div className="lg:col-span-3">
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-display text-brand-text-bright uppercase tracking-tight">Recent Communications</h2>
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-widest font-black italic">Active Public Sector Briefings</p>
                </div>
              </div>
              {(profile?.role === 'admin' || (profile?.department_id && MUNICIPAL_BRANDING.newsAuthorizedDepts.includes(profile.department_id))) && (
                <button 
                  onClick={() => {
                    setEditingAnnId(null);
                    setAnnTitle('');
                    setAnnContent('');
                    setAnnImageUrl('');
                    setIsAnnMunicipal(canPostMunicipal);
                    setShowAnnModal(true);
                  }}
                  className="flex items-center gap-3 bg-white/5 border border-brand-border text-brand-text-dim px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-brand-accent hover:border-brand-accent transition-all"
                >
                  <Plus size={16} /> New Publication
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-6 bg-white/5 border border-brand-border rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-all border-l-4 border-l-brand-accent">
                  <div className="space-y-2 max-w-2xl">
                    <h3 className="text-lg font-display text-brand-text-bright tracking-tight uppercase leading-none">{ann.title}</h3>
                    <p className="text-[10px] text-brand-text-dim line-clamp-1 italic italic uppercase tracking-widest">{ann.content.substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <div className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-text-dim">PUBLISHED</div>
                       <div className="text-[10px] font-bold text-brand-text-bright">{ann.created_at ? 'System Logged' : 'Recent'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => {
                           setEditingAnnId(ann.id);
                           setAnnTitle(ann.title);
                           setAnnContent(ann.content);
                           setAnnImageUrl(ann.image_url || '');
                           setAnnImages(ann.images || []);
                           setIsAnnMunicipal(ann.is_municipal || false);
                           setShowAnnModal(true);
                         }}
                         className="p-3 text-brand-text-dim hover:text-brand-accent transition-all"
                       >
                          <Edit2 size={16} />
                       </button>
                       <button 
                         onClick={() => handleDeleteAnn(ann.id)}
                         className="p-3 text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                       >
                          <X size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-brand-border rounded-[2.5rem]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">No record of sector communications found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
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
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Metadata Refinement</h2>
                    <p className="text-2xl font-display text-brand-text-bright leading-none mt-1">Sector Profile Modification</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateSector} className="grid gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Sector Identity</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Head of Office</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={editForm.head}
                      onChange={(e) => setEditForm({...editForm, head: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Official Email</label>
                    <input 
                      type="email"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={editForm.contact.email}
                      onChange={(e) => setEditForm({...editForm, contact: {...editForm.contact, email: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Contact Phone</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={editForm.contact.phone}
                      onChange={(e) => setEditForm({...editForm, contact: {...editForm.contact, phone: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Physical Location</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={editForm.contact.location}
                      onChange={(e) => setEditForm({...editForm, contact: {...editForm.contact, location: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Mandate & Mission Summary</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-medium text-brand-text-bright focus:border-brand-accent outline-none italic leading-relaxed"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Frontline Protocols</label>
                    <button 
                      type="button"
                      onClick={() => setEditForm({...editForm, services: [...editForm.services, 'New Service Requested']})}
                      className="text-[9px] font-black uppercase tracking-widest text-brand-accent hover:underline"
                    >
                      + Add Protocol
                    </button>
                  </div>
                  <div className="grid gap-2">
                    {editForm.services.map((service, sidx) => (
                      <div key={sidx} className="flex gap-2">
                        <input 
                          type="text"
                          className="flex-1 bg-white/5 border border-brand-border rounded-xl px-5 py-2 text-[11px] font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                          value={service}
                          onChange={(e) => {
                            const newServices = [...editForm.services];
                            newServices[sidx] = e.target.value;
                            setEditForm({...editForm, services: newServices});
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const newServices = editForm.services.filter((_, i) => i !== sidx);
                            setEditForm({...editForm, services: newServices});
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all font-display flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Synchronize Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publication Modal */}
      <AnimatePresence>
        {showAnnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAnnModal(false)}
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
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Communication Protocol</h2>
                    <p className="text-2xl font-display text-brand-text-bright leading-none mt-1">
                      {editingAnnId ? 'Curate Publication' : 'New Publication Briefing'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAnnModal(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveAnnouncement} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Heading</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-4 text-base font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                    placeholder="Enter briefing title..."
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Publication Gallery</label>
                    <button 
                      type="button"
                      onClick={() => setAnnImages([...annImages, ''])}
                      className="text-[9px] font-black uppercase tracking-widest text-brand-accent hover:underline"
                    >
                      + Add Image URL
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <input 
                        type="url"
                        className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-4 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none pr-12"
                        placeholder="Primary Cover Image URL..."
                        value={annImageUrl}
                        onChange={(e) => setAnnImageUrl(e.target.value)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-widest text-brand-accent bg-brand-accent/10 px-2 py-1 rounded border border-brand-accent/20">COVER</div>
                    </div>

                    {annImages.map((url, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="url"
                          className="flex-1 bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-xs font-medium text-brand-text-bright focus:border-brand-accent outline-none"
                          placeholder={`Gallery Image #${idx + 1} URL...`}
                          value={url}
                          onChange={(e) => {
                            const newImages = [...annImages];
                            newImages[idx] = e.target.value;
                            setAnnImages(newImages);
                          }}
                        />
                        <button 
                          type="button"
                          onClick={() => setAnnImages(annImages.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-brand-text-dim uppercase tracking-widest px-2 italic">Add multiple images for a dynamic gallery view in the article detail page.</p>
                </div>

                {canPostMunicipal ? (
                  <div className="p-6 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-accent text-white rounded-lg flex items-center justify-center shadow-lg shadow-brand-accent/20">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-text-bright">Municipal Publication Hub</h4>
                        <p className="text-[9px] text-brand-text-dim uppercase tracking-widest font-black italic">Promote to home portal feed</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isAnnMunicipal}
                        onChange={(e) => setIsAnnMunicipal(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                    </label>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100/50 border border-brand-border rounded-xl text-[9px] font-bold text-brand-text-dim uppercase tracking-widest italic text-center">
                    Note: This publication will be limited to your sector entry. Only authorized offices can promote to the home portal.
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Draft Content</label>
                  <textarea 
                    rows={8}
                    required
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-4 text-sm font-medium text-brand-text-bright focus:border-brand-accent outline-none leading-relaxed"
                    placeholder="Provide full disclosure of municipal update..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAnnModal(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all font-display flex items-center justify-center gap-3"
                  >
                    <Send size={16} /> Publish Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffDashboard;
