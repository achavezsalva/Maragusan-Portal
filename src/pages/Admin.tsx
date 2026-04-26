import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,  
  query,
  limit,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Building2, 
  Plus, 
  Trash2, 
  Shield, 
  Settings,
  Activity,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';

interface Department {
  id: string;
  department_name: string;
}

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'citizen';
  department_id?: string;
}

const Admin: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'staff' | 'citizen'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unresolvedFeedbackCount, setUnresolvedFeedbackCount] = useState(0);
  const [newDeptName, setNewDeptName] = useState('');
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch Departments
    const deptUnsub = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    });

    // Fetch Users (Full Registry)
    const userUnsub = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      setLoading(false);
    });

    // Fetch Pending Service Requests Count
    const requestsUnsub = onSnapshot(
      query(collection(db, 'service_requests'), where('status', '==', 'pending')),
      (snapshot) => {
        setPendingRequestsCount(snapshot.size);
      }
    );

    // Fetch Unresolved Feedback Count
    // Assuming anything not 'resolved' is unresolved
    const feedbackUnsub = onSnapshot(
      query(collection(db, 'feedback'), where('status', '!=', 'resolved')),
      (snapshot) => {
        setUnresolvedFeedbackCount(snapshot.size);
      }
    );

    return () => {
      deptUnsub();
      userUnsub();
      requestsUnsub();
      feedbackUnsub();
    };
  }, [isAdmin]);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const trimmedName = newDeptName.trim();
    if (trimmedName.length < 3) {
      setErrorMessage('Sector designation must be at least 3 characters.');
      return;
    }

    const exists = departments.some(d => d.department_name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      setErrorMessage('This sector designation is already registered.');
      return;
    }

    try {
      await addDoc(collection(db, 'departments'), { department_name: trimmedName });
      setNewDeptName('');
    } catch (err) {
      setErrorMessage('System failure during sector registration.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      await deleteDoc(doc(db, 'departments', deptToDelete.id));
      setDeptToDelete(null);
    } catch (err) {
      setErrorMessage('System failure during sector decommissioning.');
    }
  };

  const handleUpdateRole = async (uid: string, role: string, deptId?: string) => {
    await updateDoc(doc(db, 'users', uid), { 
      role,
      department_id: deptId || null 
    });
    if (selectedUser?.uid === uid) {
      setSelectedUser(prev => prev ? { ...prev, role: role as any, department_id: deptId } : null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (!isAdmin) return (
    <div className="text-center py-20 px-4">
      <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield size={40} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">Unprivileged Access</h2>
      <p className="text-slate-500 max-w-md mx-auto">This area is reserved for Municipal Administrators. Your access attempt has been logged for security audit.</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-brand-border pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-display uppercase tracking-tight flex items-center gap-4">
            <Shield className="text-brand-accent" size={36} strokeWidth={1} aria-hidden="true" />
            Command Center
          </h1>
          <p className="text-brand-text-dim text-[11px] uppercase tracking-[0.3em]">Municipal System Adjudication & Oversight</p>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] uppercase font-black tracking-widest text-brand-text-dim" role="status" aria-label="System status">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             System Nominal
           </div>
           <div className="flex items-center gap-2 border-l border-brand-border pl-6">
             {profile?.name} (Root Admin)
           </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="glass-card p-6 space-y-3 group">
          <div className="text-[10px] uppercase tracking-widest text-brand-text-dim">Verified Citizens</div>
          <div className="flex items-baseline justify-between font-display">
            <div className="text-4xl">{users.filter(u => u.role === 'citizen').length}</div>
            <div className="text-[9px] text-brand-accent font-bold uppercase">Registry</div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-3 group">
          <div className="text-[10px] uppercase tracking-widest text-brand-text-dim">Municipal Sectors</div>
          <div className="flex items-baseline justify-between font-display">
            <div className="text-4xl">{departments.length}</div>
            <div className="text-[9px] text-brand-accent font-bold uppercase">Departments</div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-3 group border-brand-accent/20">
          <div className="text-[10px] uppercase tracking-widest text-brand-accent">Pending Actions</div>
          <div className="flex items-baseline justify-between font-display text-brand-accent">
            <div className="text-4xl">{pendingRequestsCount}</div>
            <div className="text-[9px] font-black uppercase tracking-widest">Requests</div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-3 group border-brand-accent/20">
          <div className="text-[10px] uppercase tracking-widest text-brand-accent">Civic Attention</div>
          <div className="flex items-baseline justify-between font-display text-brand-accent">
            <div className="text-4xl">{unresolvedFeedbackCount}</div>
            <div className="text-[9px] font-black uppercase tracking-widest">Feedback</div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-3 group">
          <div className="text-[10px] uppercase tracking-widest text-brand-text-dim">Active Staff</div>
          <div className="flex items-baseline justify-between font-display">
            <div className="text-4xl">{users.filter(u => u.role === 'staff' || u.role === 'admin').length}</div>
            <div className="text-[9px] text-brand-accent font-bold uppercase tracking-widest">Units</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Manage Departments */}
        <section className="space-y-6">
          <div className="flex flex-col gap-4 pb-4 border-b border-brand-border">
             <h2 className="text-xs uppercase tracking-[0.3em] font-black italic">Sector Directory</h2>
             <form onSubmit={handleAddDept} className="space-y-3">
               <div className="flex gap-4">
                 <input 
                   type="text" 
                   value={newDeptName}
                   onChange={e => {
                     setNewDeptName(e.target.value);
                     if (errorMessage) setErrorMessage('');
                   }}
                   placeholder="New Sector Name"
                   className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest appearance-none outline-hidden focus:border-brand-accent transition-all"
                   aria-label="New sector name"
                 />
                 <button className="text-brand-accent hover:opacity-80 transition-opacity" aria-label="Register new sector">
                   <Plus size={20} aria-hidden="true" />
                 </button>
               </div>
               {errorMessage && (
                 <motion.p 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-[9px] text-red-400 uppercase font-black tracking-widest italic"
                 >
                   Error: {errorMessage}
                 </motion.p>
               )}
             </form>
          </div>

          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" role="list" aria-label="Department list">
            {departments.map((dept) => (
              <div key={dept.id} className="glass-card p-6 flex items-center justify-between group hover:border-brand-accent transition-colors" role="listitem">
                <div className="space-y-1">
                  <div className="font-bold text-lg text-brand-text-bright">{dept.department_name}</div>
                  <div className="text-[10px] text-brand-text-dim uppercase tracking-widest">Registry ID: {dept.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <button 
                  onClick={() => setDeptToDelete(dept)}
                  className="text-brand-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-bold text-[10px] flex items-center gap-2"
                  aria-label={`Decommission sector ${dept.department_name}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Manage Users */}
        <section className="space-y-6">
          <div className="flex flex-col gap-6 pb-4 border-b border-brand-border">
             <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.3em] font-black italic">Identity Registry Oversight</h2>
                <div className="text-[9px] font-black uppercase tracking-widest text-brand-text-dim bg-brand-border px-2 py-0.5 rounded">
                  {filteredUsers.length} Units Active
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg pl-4 pr-10 py-2 text-[10px] font-bold uppercase tracking-widest outline-hidden focus:border-brand-accent transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'admin', 'staff', 'citizen'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        filterRole === role 
                          ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' 
                          : 'border-brand-border text-brand-text-dim hover:border-brand-text-bright'
                      }`}
                    >
                      {role === 'all' ? 'Universal' : role}
                    </button>
                  ))}
                </div>
             </div>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" role="list" aria-label="Filtered identities registry">
            {filteredUsers.map((u) => (
              <div 
                key={u.uid} 
                className="glass-card p-6 space-y-4 hover:border-brand-accent/50 transition-colors cursor-pointer group" 
                onClick={() => setSelectedUser(u)} 
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedUser(u)}
                aria-label={`Adjudicate identity for ${u.name}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-brand-border rounded-full flex items-center justify-center text-brand-accent font-display text-sm group-hover:border-brand-accent transition-colors" aria-hidden="true">
                      {u.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm tracking-tight text-brand-text-bright">{u.name}</div>
                      <div className="text-[10px] text-brand-text-dim uppercase tracking-widest">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'border-red-400 text-red-400' : 
                      u.role === 'staff' ? 'border-brand-accent text-brand-accent' : 'border-brand-text-dim text-brand-text-dim'
                    }`}>
                      {u.role}
                    </div>
                    <div className="text-[8px] text-brand-text-dim uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to Adjudicate
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center border border-dashed border-brand-border rounded-2xl">
                 <p className="text-brand-text-dim text-[10px] uppercase tracking-[0.2em] font-black">No identities match current criteria.</p>
              </div>
            )}
          </div>
        </section>

        {selectedUser && (
          <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-[150] flex items-center justify-center p-6" role="presentation">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-card w-full max-w-xl rounded-2xl border border-brand-border overflow-hidden shadow-3xl text-brand-text-bright"
              role="dialog"
              aria-modal="true"
              aria-labelledby="adjudication-modal-title"
            >
              <div className="p-8 border-b border-brand-border flex justify-between items-center bg-white/5">
                <div className="space-y-1">
                  <h3 id="adjudication-modal-title" className="font-display text-2xl tracking-tight">Identity Adjudication</h3>
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-widest">Protocol Ref: {selectedUser.uid.toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="text-brand-text-dim hover:text-brand-text-bright transition-colors"
                  aria-label="Close dialog"
                >
                  <Plus className="rotate-45" size={24} aria-hidden="true" />
                </button>
              </div>

              <div className="p-10 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 border-2 border-brand-accent rounded-full flex items-center justify-center text-brand-accent font-display text-3xl">
                    {selectedUser.name[0]}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold tracking-tight">{selectedUser.name}</h4>
                    <p className="text-brand-text-dim text-sm">{selectedUser.email}</p>
                    <div className={`inline-block px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border mt-2 ${
                      selectedUser.role === 'admin' ? 'border-red-400 text-red-400' : 
                      selectedUser.role === 'staff' ? 'border-brand-accent text-brand-accent' : 'border-brand-text-dim text-brand-text-dim'
                    }`}>
                      Current Status: {selectedUser.role}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-brand-border">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Reassign Identity Tier</label>
                    <div className="grid gap-2">
                      {(['citizen', 'staff', 'admin'] as const).map(r => (
                        <button
                          key={r}
                          onClick={() => handleUpdateRole(selectedUser.uid, r, selectedUser.department_id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${
                            selectedUser.role === r 
                              ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' 
                              : 'border-brand-border bg-white/5 hover:border-brand-text-dim'
                          }`}
                        >
                          {r}
                          {selectedUser.role === r && <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${selectedUser.role === 'staff' ? 'text-brand-text-dim' : 'text-brand-text-dim/30'}`}>Sector Assignment</label>
                    <div className={`grid gap-2 ${selectedUser.role !== 'staff' && 'opacity-30 pointer-events-none'}`}>
                      <select 
                        value={selectedUser.department_id || ''}
                        onChange={(e) => handleUpdateRole(selectedUser.uid, 'staff', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg text-[10px] font-bold uppercase tracking-widest p-4 appearance-none hover:border-brand-accent transition-all"
                      >
                        <option value="">Unassigned Reserve</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.department_name}</option>
                        ))}
                      </select>
                      <p className="text-[9px] text-brand-text-dim mt-2 leading-relaxed uppercase tracking-wider">Note: Sector assignment is strictly professional to administrative tier identities.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-accent/5 p-6 border border-brand-accent/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-brand-accent text-[10px] font-black uppercase tracking-widest">
                    <Activity size={14} /> Audit Trace
                  </div>
                  <p className="text-[10px] text-brand-text-dim leading-relaxed uppercase tracking-wide">Any displacement of identity permissions is permanently recorded within the municipal system registry for administrative accountability.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Department Deletion Confirmation Modal */}
        {deptToDelete && (
          <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6" role="presentation">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-card w-full max-w-md rounded-2xl border border-brand-border overflow-hidden shadow-3xl text-brand-text-bright"
              role="dialog"
              aria-modal="true"
              aria-labelledby="decommission-modal-title"
            >
              <div className="p-8 border-b border-brand-border bg-red-500/10 flex items-center gap-4">
                <Trash2 className="text-red-400" size={24} aria-hidden="true" />
                <div className="space-y-1">
                  <h3 id="decommission-modal-title" className="font-display text-xl tracking-tight">Sector Decommissioning</h3>
                  <p className="text-[10px] text-red-300 font-bold uppercase tracking-widest">High-Impact Destructive Action</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-xs text-brand-text-dim leading-relaxed uppercase tracking-wider">
                  You are about to permanently decommission the <span className="text-brand-text-bright font-black">"{deptToDelete.department_name}"</span> sector from the municipal registry. This action is irreversible.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleConfirmDelete}
                    className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                  >
                    Confirm Decommissioning
                  </button>
                  <button 
                    onClick={() => setDeptToDelete(null)}
                    className="w-full py-4 bg-brand-border text-brand-text-dim text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:text-brand-text-bright transition-colors"
                  >
                    Abort Protocol
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
