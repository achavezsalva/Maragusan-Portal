import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  UserPlus, 
  Building2,
  Mail,
  Calendar,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, updateDoc, doc, orderBy, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, UserProfile } from '../hooks/useAuth';
import { ALL_DEPARTMENTS } from '../constants/departments';

const Admin: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Form State for editing
  const [editRole, setEditRole] = useState<UserProfile['role']>('citizen');
  const [editDept, setEditDept] = useState('');

  // Form State for adding
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserProfile['role']>('staff');
  const [newDept, setNewDept] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'users'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as UserProfile[];
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isPending = (userId: string) => userId.startsWith('pre_auth:');

  const filteredDepts = ALL_DEPARTMENTS.filter(d => 
    d.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDept(user.department_id || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      await updateDoc(userRef, {
        role: editRole,
        department_id: editRole === 'citizen' ? null : editDept
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    if (confirm(`Are you sure you want to permanently delete authorization for ${selectedUser.name}? This action cannot be undone.`)) {
      try {
        const userRef = doc(db, 'users', selectedUser.uid);
        await deleteDoc(userRef);
        setIsEditModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete personnel. Check administrative permissions.");
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      // Create a document with a deterministic ID for pre-authorization
      const preAuthId = `pre_auth:${newEmail.toLowerCase().trim()}`;
      const newUserRef = doc(db, 'users', preAuthId);
      await setDoc(newUserRef, {
        uid: preAuthId,
        name: newName,
        email: newEmail.toLowerCase().trim(),
        role: newRole,
        department_id: newRole === 'citizen' ? null : newDept,
        created_at: serverTimestamp(),
      });
      
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewRole('staff');
      setNewDept('');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user. Check permissions.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Shield size={64} className="text-red-500/50" />
        <h1 className="text-2xl font-display uppercase tracking-tight text-brand-text-bright text-center">
          Restricted Access Area
        </h1>
        <p className="text-brand-text-dim max-w-md text-center uppercase tracking-widest text-xs font-black">
          You do not have the clearance levels required to access the Administrative Protocols. 
          Please return to the public sector.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-accent/20">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display uppercase tracking-tight text-brand-text-bright leading-none">Administration</h1>
            <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.3em] font-black italic mt-2">Personnel & Sector Management Ledger</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-3 bg-brand-accent text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 hover:scale-[1.02] transition-all"
        >
          <UserPlus size={18} /> New Authorization
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-brand-accent">
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Total Personnel</div>
          <div className="text-3xl font-display text-brand-text-bright">{users.filter(u => !isPending(u.uid)).length}</div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-brand-secondary">
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Municipal Staff</div>
          <div className="text-3xl font-display text-brand-text-bright">
            {users.filter(u => !isPending(u.uid) && (u.role === 'staff' || u.role === 'admin')).length}
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-brand-text-dim">
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Public Citizens</div>
          <div className="text-3xl font-display text-brand-text-bright">
            {users.filter(u => !isPending(u.uid) && u.role === 'citizen').length}
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-yellow-500">
          <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim mb-1">Pending Portal Auth</div>
          <div className="text-3xl font-display text-yellow-500">
            {users.filter(u => isPending(u.uid)).length}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-dim" size={18} />
          <input 
            type="text" 
            placeholder="Identity scan: search by name or email..." 
            className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-12 pr-4 text-brand-text-bright focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-text-dim/50 uppercase tracking-[0.05em] text-xs font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-dim" size={14} />
            <select 
              className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-10 pr-8 text-brand-text-bright appearance-none focus:outline-none focus:border-brand-accent transition-colors uppercase tracking-widest text-[10px] font-black cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Clearance</option>
              <option value="admin">Administrators</option>
              <option value="staff">Sector Staff</option>
              <option value="citizen">Public Citizens</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-dim pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* User Ledger */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Clearance Level</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Sector Assignment</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-brand-accent/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent font-display text-lg">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-brand-text-bright tracking-tight flex items-center gap-2">
                          {user.name}
                          {isPending(user.uid) && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full font-black uppercase tracking-widest">Pending</span>
                          )}
                        </div>
                        <div className="text-[10px] text-brand-text-dim font-black uppercase tracking-widest flex items-center gap-2">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' :
                      user.role === 'staff' ? 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20' :
                      'bg-white/5 text-brand-text-dim border-brand-border'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-brand-text-dim uppercase tracking-widest">
                      <Building2 size={12} className={user.department_id ? 'text-brand-accent' : 'text-brand-text-dim/50'} />
                      {user.department_id || 'N/A — Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-brand-text-dim hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center uppercase tracking-[0.3em] font-black text-xs text-brand-text-dim/50">
                    No matching personnel found in ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
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
              className="relative w-full max-w-xl bg-brand-bg border border-brand-border rounded-[2.5rem] shadow-2xl p-10 space-y-10 overflow-visible"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Updating Permissions</h2>
                    <p className="text-2xl font-display text-brand-text-bright leading-none mt-1">Identity Override</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-8">
                {/* User Info Header */}
                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center font-display text-xl text-brand-accent">
                    {selectedUser.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-text-bright">{selectedUser.name}</div>
                    <div className="text-[10px] text-brand-text-dim font-black uppercase tracking-widest">{selectedUser.email}</div>
                  </div>
                </div>

                {/* Role Switch */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Clearance Authorization</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['citizen', 'staff', 'admin'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setEditRole(role as any)}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          editRole === role 
                            ? 'bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-accent/20' 
                            : 'bg-white/5 text-brand-text-dim border-brand-border hover:border-brand-text-dim'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sector Assignment */}
                {editRole !== 'citizen' && (
                  <div className="space-y-4 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Sector Assignment Protocol</label>
                    <DepartmentDropdown 
                      value={editDept}
                      onChange={setEditDept}
                      isOpen={isDeptDropdownOpen}
                      setIsOpen={setIsDeptDropdownOpen}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-500/20 hover:bg-red-500/5 transition-all"
                >
                  Terminate
                </button>
                <div className="flex-1 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    type="button"
                    onClick={handleUpdateUser}
                    className="flex-1 py-4 rounded-2xl bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all font-display"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-brand-bg border border-brand-border rounded-[2.5rem] shadow-2xl p-10 space-y-8 overflow-visible"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent border border-brand-accent/20">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Personnel Enrollment</h2>
                    <p className="text-2xl font-display text-brand-text-bright leading-none mt-1">Add New Identity</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Personnel Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Juan De La Cruz"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-4 text-sm font-bold text-brand-text-bright focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-text-dim/30"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Official Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="e.g. juan@municipality.gov.ph"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-4 text-sm font-bold text-brand-text-bright focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-text-dim/30"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Clearance Authorization</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['citizen', 'staff', 'admin'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setNewRole(role as any)}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            newRole === role 
                              ? 'bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-accent/20' 
                              : 'bg-white/5 text-brand-text-dim border-brand-border hover:border-brand-text-dim'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newRole !== 'citizen' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Sector Assignment</label>
                      <DepartmentDropdown 
                        value={newDept}
                        onChange={setNewDept}
                        isOpen={isDeptDropdownOpen}
                        setIsOpen={setIsDeptDropdownOpen}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all font-display"
                  >
                    Confirm Authorization
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

// Sub-component for Department Dropdown to avoid repetitive logic
const DepartmentDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}> = ({ value, onChange, isOpen, setIsOpen }) => {
  const [search, setSearch] = useState('');
  const filteredDepts = ALL_DEPARTMENTS.filter(d => 
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div 
        className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-4 cursor-pointer flex items-center justify-between group hover:border-brand-accent/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Building2 size={16} className="text-brand-accent" />
          <span className={`text-xs font-bold uppercase tracking-widest ${value ? 'text-brand-text-bright' : 'text-brand-text-dim/40'}`}>
            {value || 'Select Sector...'}
          </span>
        </div>
        <ChevronDown size={16} className={`text-brand-text-dim transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-[65] left-0 right-0 mt-2 bg-brand-bg border border-brand-border rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col"
          >
            <div className="p-3 border-b border-brand-border bg-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-dim" size={14} />
                <input 
                  type="text" 
                  placeholder="Sector scan..."
                  className="w-full bg-brand-bg border border-brand-border rounded-lg py-2 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-colors"
                  value={search}
                  autoFocus
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {filteredDepts.map((d, idx) => (
                <div 
                  key={idx}
                  className="px-4 py-3 flex items-center justify-between hover:bg-brand-accent/10 cursor-pointer transition-colors group"
                  onClick={() => {
                    onChange(d);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim group-hover:text-brand-accent transition-colors">
                    {d}
                  </span>
                  {value === d && <Check size={14} className="text-brand-accent" />}
                </div>
              ))}
              {filteredDepts.length === 0 && (
                <div className="p-8 text-center text-[9px] font-black uppercase tracking-widest text-brand-text-dim/50">
                  No sectors found match scan.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
