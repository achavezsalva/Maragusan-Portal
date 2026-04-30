import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit2, 
  Filter, 
  Calendar, 
  User, 
  Building,
  X,
  Send,
  Flag,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { MUNICIPAL_BRANDING } from '../constants';

interface Announcement {
  id: string;
  title: string;
  content: string;
  department_id: string;
  author_id: string;
  created_at: any;
  is_municipal?: boolean;
}

interface Department {
  id: string;
  name: string;
}

const Announcements: React.FC = () => {
  const { user, profile, isAdmin, isStaff } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDept, setFilterDept] = useState('all');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deptId, setDeptId] = useState('');
  const [isMunicipal, setIsMunicipal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const canPostMunicipal = profile?.department_id && MUNICIPAL_BRANDING.newsAuthorizedDepts.includes(profile.department_id);

  useEffect(() => {
    // Depts listener
    const deptsUnsubscribe = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts: Department[] = [];
      snapshot.forEach((doc) => depts.push({ id: doc.id, ...(doc.data() as any) }));
      setDepartments(depts);
    });

    // Announcements listener
    const annQuery = query(collection(db, 'announcements'));
    const annUnsubscribe = onSnapshot(annQuery, (snapshot) => {
      const anns: Announcement[] = [];
      snapshot.forEach((doc) => anns.push({ id: doc.id, ...(doc.data() as any) }));
      
      // Sort client-side by date
      const sorted = anns.sort((a, b) => {
        const timeA = a.created_at?.toMillis?.() || (a.created_at?.seconds * 1000) || 0;
        const timeB = b.created_at?.toMillis?.() || (b.created_at?.seconds * 1000) || 0;
        return timeB - timeA;
      });
      
      setAnnouncements(sorted);
      setLoading(false);
    });

    return () => {
      deptsUnsubscribe();
      annUnsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !deptId) return;

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'announcements', isEditing), {
          title,
          content,
          department_id: deptId,
          is_municipal: isMunicipal,
          updated_at: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'announcements'), {
          title,
          content,
          department_id: deptId,
          author_id: user?.uid,
          is_municipal: isMunicipal,
          created_at: serverTimestamp()
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving announcement.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDeptId('');
    setIsMunicipal(false);
    setIsEditing(null);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete announcement.");
      }
    }
  };

  const filteredAnnouncements = filterDept === 'all' 
    ? announcements 
    : filterDept === 'municipal'
      ? announcements.filter(a => a.is_municipal)
      : announcements.filter(a => a.department_id === filterDept);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-display uppercase tracking-tight flex items-center gap-4">
            <Megaphone className="text-brand-accent" size={36} strokeWidth={1} />
            Public Briefings
          </h1>
          <p className="text-brand-text-dim text-sm uppercase tracking-widest">Official Municipal Communications</p>
        </div>

        {(isAdmin || isStaff) && (
          <button 
            onClick={() => {
              setDeptId(profile?.department_id || '');
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> New Communication
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-brand-border pb-8" role="tablist" aria-label="Department filters">
        <button 
          onClick={() => setFilterDept('all')}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all border-b-2 ${filterDept === 'all' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-dim hover:text-brand-text-bright'}`}
          role="tab"
          aria-selected={filterDept === 'all'}
        >
          All Briefings
        </button>
        <button 
          onClick={() => setFilterDept('municipal')}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all border-b-2 ${filterDept === 'municipal' ? 'border-brand-accent text-brand-accent font-bold' : 'border-transparent text-brand-text-dim hover:text-brand-text-bright'}`}
          role="tab"
          aria-selected={filterDept === 'municipal'}
        >
          <span className="flex items-center gap-2">
            <Globe size={12} className={filterDept === 'municipal' ? 'text-brand-accent' : ''} />
            News & Update
          </span>
        </button>
        {departments.map((dept) => (
          <button 
            key={dept.id}
            onClick={() => setFilterDept(dept.id)}
            className={`px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all border-b-2 ${filterDept === dept.id ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-dim hover:text-brand-text-bright'}`}
            role="tab"
            aria-selected={filterDept === dept.id}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20" aria-busy="true" aria-label="Loading briefings">
          <div className="w-10 h-10 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-10" role="list">
          {filteredAnnouncements.map((ann) => (
            <article key={ann.id} className="glass-card p-10 space-y-8 relative group" role="listitem">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 border border-brand-accent text-brand-accent rounded-full text-[9px] font-black uppercase tracking-widest">
                    {departments.find(d => d.id === ann.department_id)?.name || 'General'}
                  </span>
                  {ann.is_municipal && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/20">
                      <Globe size={10} /> Municipal Hub News
                    </span>
                  )}
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-widest">
                    {ann.created_at ? (typeof ann.created_at.toDate === 'function' ? format(ann.created_at.toDate(), 'MMMM d, yyyy') : format(new Date(ann.created_at), 'MMMM d, yyyy')) : 'Recently Published'}
                  </p>
                </div>
 
                {(isAdmin || (isStaff && ann.author_id === user?.id)) && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setIsEditing(ann.id);
                        setTitle(ann.title);
                        setContent(ann.content);
                        setDeptId(ann.department_id);
                        setIsMunicipal(ann.is_municipal || false);
                        setShowModal(true);
                      }}
                      className="text-brand-text-dim hover:text-brand-accent transition-colors"
                      aria-label={`Edit announcement ${ann.title}`}
                    >
                      <Edit2 size={16} aria-hidden="true" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="text-brand-text-dim hover:text-red-400 transition-colors"
                      aria-label={`Delete announcement ${ann.title}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-display tracking-tight leading-tight">{ann.title}</h2>
                <p className="text-brand-text-dim text-sm leading-relaxed max-w-3xl whitespace-pre-wrap">{ann.content}</p>
              </div>
              
              <div className="pt-8 border-t border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-border rounded-full flex items-center justify-center text-brand-accent text-xs font-bold">
                    M
                  </div>
                  <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Official LGU Release</span>
                </div>
              </div>
            </article>
          ))}

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-20 border border-dashed border-brand-border rounded-3xl">
              <p className="text-brand-text-dim text-sm uppercase tracking-widest font-bold">No active briefings found in this sector.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-card w-full max-w-2xl rounded-2xl border border-brand-border overflow-hidden shadow-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="briefing-modal-title"
          >
            <div className="p-8 border-b border-brand-border flex justify-between items-center bg-white/5">
              <h3 id="briefing-modal-title" className="font-display text-2xl tracking-tight">{isEditing ? 'Curate Briefing' : 'New Publication'}</h3>
              <button onClick={resetForm} className="text-brand-text-dim hover:text-brand-text-bright transition-colors" aria-label="Close dialog">
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-2">
                <label id="title-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-4 border border-brand-border rounded-lg bg-brand-bg/50 focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all"
                  placeholder="Publication Heading"
                  aria-labelledby="title-label"
                  required
                />
              </div>

              <div className="space-y-2">
                <label id="section-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Section</label>
                <select 
                  value={deptId}
                  onChange={e => setDeptId(e.target.value)}
                  disabled={isStaff && !isAdmin}
                  className="w-full p-4 border border-brand-border rounded-lg bg-brand-bg/50 appearance-none focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all"
                  aria-labelledby="section-label"
                  required
                >
                  <option value="">Select Section</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {canPostMunicipal && (
                <div className="p-6 bg-brand-accent/5 border border-brand-accent/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-accent text-white rounded-lg flex items-center justify-center">
                        <Globe size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-text-bright">Municipal Publication Hub</h4>
                        <p className="text-[9px] text-brand-text-dim uppercase tracking-widest font-bold">Authorized Sector: {profile?.department_id}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isMunicipal}
                        onChange={(e) => setIsMunicipal(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-brand-text-dim leading-relaxed px-1">
                    Enabling this will promote your publication to the global municipal portal news feed, making it visible to all Maragusanos on the homepage.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label id="content-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Content</label>
                <textarea 
                  rows={6}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-4 border border-brand-border rounded-lg bg-brand-bg/50 focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all"
                  placeholder="Draft communication content..."
                  aria-labelledby="content-label"
                  required
                />
              </div>

              <div className="flex justify-end gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs uppercase tracking-widest font-black text-brand-text-dim hover:text-brand-text-bright transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-10"
                >
                  Publish Briefing
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
