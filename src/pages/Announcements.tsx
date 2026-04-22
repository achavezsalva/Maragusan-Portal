import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
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
  Send
} from 'lucide-react';
import { motion } from 'motion/react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  department_id: string;
  author_id: string;
  created_at: any;
}

interface Department {
  id: string;
  department_name: string;
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
  const [isEditing, setIsEditing] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Departments
    const deptUnsub = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    });

    // Fetch Announcements
    const q = query(collection(db, 'announcements'), orderBy('created_at', 'desc'));
    const annUnsub = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
      setLoading(false);
    });

    return () => {
      deptUnsub();
      annUnsub();
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
        });
      } else {
        await addDoc(collection(db, 'announcements'), {
          title,
          content,
          department_id: deptId,
          author_id: user?.uid,
          created_at: serverTimestamp(),
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving announcement. Check console for details.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDeptId('');
    setIsEditing(null);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  const filteredAnnouncements = filterDept === 'all' 
    ? announcements 
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

      <div className="flex flex-wrap items-center gap-4 border-b border-brand-border pb-8">
        <button 
          onClick={() => setFilterDept('all')}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all border-b-2 ${filterDept === 'all' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-dim hover:text-brand-text-bright'}`}
        >
          All Briefings
        </button>
        {departments.map((dept) => (
          <button 
            key={dept.id}
            onClick={() => setFilterDept(dept.id)}
            className={`px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] transition-all border-b-2 ${filterDept === dept.id ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-dim hover:text-brand-text-bright'}`}
          >
            {dept.department_name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-10">
          {filteredAnnouncements.map((ann) => (
            <article key={ann.id} className="glass-card p-10 space-y-8 relative group">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 border border-brand-accent text-brand-accent rounded-full text-[9px] font-black uppercase tracking-widest">
                    {departments.find(d => d.id === ann.department_id)?.department_name || 'General'}
                  </span>
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-widest">
                    {ann.created_at?.seconds ? format(ann.created_at.toDate(), 'MMMM d, yyyy') : 'Recently Published'}
                  </p>
                </div>

                {(isAdmin || (isStaff && ann.author_id === user?.uid)) && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        setIsEditing(ann.id);
                        setTitle(ann.title);
                        setContent(ann.content);
                        setDeptId(ann.department_id);
                        setShowModal(true);
                      }}
                      className="text-brand-text-dim hover:text-brand-accent transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="text-brand-text-dim hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
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
          >
            <div className="p-8 border-b border-brand-border flex justify-between items-center bg-white/5">
              <h3 className="font-display text-2xl tracking-tight">{isEditing ? 'Curate Briefing' : 'New Publication'}</h3>
              <button onClick={resetForm} className="text-brand-text-dim hover:text-brand-text-bright transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-4 border border-brand-border rounded-lg bg-brand-bg/50"
                  placeholder="Publication Heading"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Section</label>
                <select 
                  value={deptId}
                  onChange={e => setDeptId(e.target.value)}
                  disabled={isStaff && !isAdmin}
                  className="w-full p-4 border border-brand-border rounded-lg bg-brand-bg/50 appearance-none"
                  required
                >
                  <option value="">Select Section</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Content</label>
                <textarea 
                  rows={6}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full p-4 border border-brand-border rounded-lg bg-brand-bg/50"
                  placeholder="Draft communication content..."
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
