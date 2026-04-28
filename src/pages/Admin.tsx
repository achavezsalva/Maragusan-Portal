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
  Check,
  Building,
  Edit2,
  Save,
  Phone,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, setDoc, doc, deleteDoc, updateDoc, writeBatch, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, UserProfile } from '../hooks/useAuth';
import { ALL_DEPARTMENTS, ALL_DEPT_DETAILS, DepartmentInfo } from '../constants/departments';

const Admin: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'personnel' | 'departments'>('personnel');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentInfo | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeptEditModalOpen, setIsDeptEditModalOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    email?: string;
    key?: string;
  }>({ show: false, success: false, message: '' });

  // Form State for editing user
  const [editRole, setEditRole] = useState<UserProfile['role']>('citizen');
  const [editDept, setEditDept] = useState('');

  // Form State for adding user
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserProfile['role']>('staff');
  const [newDept, setNewDept] = useState('');
  const [newAccessKey, setNewAccessKey] = useState('');

  const generateAccessKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'LGU-';
    for (let i = 0; i < 8; i++) {
       key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAccessKey(key);
  };

  useEffect(() => {
    if (isAddModalOpen && !newAccessKey && (newRole === 'staff' || newRole === 'admin')) {
      generateAccessKey();
    }
  }, [isAddModalOpen, newRole]);

  // Form state for editing department
  const [deptForm, setDeptForm] = useState<DepartmentInfo | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const usersQuery = query(collection(db, 'users'), orderBy('created_at', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList: any[] = [];
      snapshot.forEach((doc) => usersList.push({ ...doc.data() }));
      setUsers(usersList);
    });

    const unsubscribeDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const deptsList: any[] = [];
      snapshot.forEach((doc) => deptsList.push({ ...doc.data() }));
      setDepartments(deptsList);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeDepts();
    };
  }, [isAdmin]);

  const syncDepartments = async () => {
    if (!confirm("This will overwrite existing department metadata with default configurations from the system constants. Proceed with synchronization?")) return;
    
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      ALL_DEPT_DETAILS.forEach((dept) => {
        const docRef = doc(db, 'departments', dept.id);
        batch.set(docRef, dept);
      });
      await batch.commit();
      alert("Departments synchronized successfully.");
    } catch (error) {
      console.error("Error syncing departments:", error);
      alert("Failed to sync departments.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredDeptList = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPending = (userId: string) => userId.startsWith('pre_auth:');

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDept(user.department_id || '');
    setIsEditModalOpen(true);
  };

  const handleDeptEditClick = (dept: DepartmentInfo) => {
    setSelectedDept(dept);
    setDeptForm({ ...dept });
    setIsDeptEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        role: editRole,
        department_id: editRole === 'citizen' ? null : editDept
      });
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUpdateDept = async () => {
    if (!deptForm || !selectedDept) return;
    
    try {
      await setDoc(doc(db, 'departments', selectedDept.id), deptForm);
      
      setIsDeptEditModalOpen(false);
      setSelectedDept(null);
      setDeptForm(null);
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Failed to update department metadata.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteDoc(doc(db, 'users', selectedUser.uid));
        
      setIsDeleteModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete personnel. Check administrative permissions.");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    try {
      // Create a document with a deterministic ID for pre-authorization
      const preAuthId = `pre_auth:${newEmail.toLowerCase().trim()}`;
      await setDoc(doc(db, 'users', preAuthId), {
        uid: preAuthId,
        name: newName,
        email: newEmail.toLowerCase().trim(),
        role: newRole,
        department_id: newRole === 'citizen' ? null : newDept,
        access_key: newAccessKey,
        is_claimed: false,
        created_at: new Date().toISOString()
      });
      
      // Feedback to user
      setRegistrationStatus({
        show: true,
        success: true,
        message: `Personnel identity profile successfully queued in municipal registers.`,
        email: newEmail.toLowerCase().trim(),
        key: newAccessKey
      });

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewRole('staff');
      setNewDept('');
      setNewAccessKey('');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      setRegistrationStatus({
        show: true,
        success: false,
        message: `Clearance Denied: ${error instanceof Error ? error.message : 'Check administrative permissions'}.`
      });
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
      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-brand-border">
        <button 
          onClick={() => setActiveTab('personnel')}
          className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'personnel' ? 'text-brand-accent' : 'text-brand-text-dim hover:text-brand-text-bright'
          }`}
        >
          Personnel Management
          {activeTab === 'personnel' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('departments')}
          className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
            activeTab === 'departments' ? 'text-brand-accent' : 'text-brand-text-dim hover:text-brand-text-bright'
          }`}
        >
          Department Profiles
          {activeTab === 'departments' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'personnel' ? (
        <>
          {/* Header Personnel */}
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

          {/* Stats Personnel */}
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

          {/* Quick Help Protocol */}
          <div className="bg-brand-accent/5 border border-brand-accent/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent shrink-0">
              <Shield size={24} />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Enrollment Protocol Notice</h4>
              <p className="text-xs text-brand-text-bright leading-relaxed">
                Personnel marked as <span className="text-yellow-500 font-bold uppercase">Pending</span> have been authorized but have not yet claimed their identity. 
                <span className="font-bold"> Instructions:</span> Staff must log in using their matching Google Email, then enter the <span className="font-bold">Access Key</span> (visible in the ledger below) to finalize their clearance.
              </p>
            </div>
            <div className="flex items-center gap-4 py-2 px-4 bg-white/5 rounded-xl border border-brand-border">
               <div className="flex flex-col items-center">
                 <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">Step 1</span>
                 <span className="text-[10px] font-bold text-brand-text-bright">Admin Registers</span>
               </div>
               <div className="w-4 h-px bg-brand-border" />
               <div className="flex flex-col items-center">
                 <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">Step 2</span>
                 <span className="text-[10px] font-bold text-brand-text-bright">Create/Login</span>
               </div>
               <div className="w-4 h-px bg-brand-border" />
               <div className="flex flex-col items-center">
                 <span className="text-[8px] font-black uppercase tracking-widest text-brand-text-dim">Step 3</span>
                 <span className="text-[10px] font-bold text-brand-text-bright">Claim Identity</span>
               </div>
            </div>
          </div>

          {/* Control Bar Personnel */}
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

          {/* Personnel Ledger */}
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
                            <div className="text-[10px] text-brand-text-dim font-black uppercase tracking-widest flex flex-col gap-1 mt-1">
                              <span className="flex items-center gap-2"><Mail size={10} /> {user.email}</span>
                              {isPending(user.uid) && user.access_key && (
                                <span className="text-brand-accent font-mono text-[9px] flex items-center gap-2">
                                  <Shield size={10} /> KEY: {user.access_key}
                                </span>
                              )}
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
                        <div className="flex items-center justify-end gap-2">
                          {isPending(user.uid) && (
                            <button 
                              onClick={() => {
                                const msg = `Municipal Portal Authorization:
Hi ${user.name}, you have been invited for ${user.role} access.
1. Visit ${window.location.origin}
2. Click "SIGN IN WITH GOOGLE"
3. Use your email: ${user.email}
4. Once logged in, enter your verification key: ${user.access_key}
Stay safe, citizen.`;
                                navigator.clipboard.writeText(msg);
                                alert("Authorization instructions copied to clipboard.");
                              }}
                              title="Copy Invite Instructions"
                              className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"
                            >
                              <Copy size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-brand-text-dim hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
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
        </>
      ) : (
        <>
          {/* Departments View */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-secondary/20">
                <Building size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-display uppercase tracking-tight text-brand-text-bright leading-none">Sector Metadata</h1>
                <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.3em] font-black italic mt-2">Municipal Administrative Profiles</p>
              </div>
            </div>
            <button 
              onClick={syncDepartments}
              disabled={isSyncing}
              className="flex items-center gap-3 bg-white/5 border border-brand-border text-brand-text-dim px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-brand-accent hover:border-brand-accent transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} /> Sync with System Defaults
            </button>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-dim" size={18} />
            <input 
              type="text" 
              placeholder="Search departments or heads of office..." 
              className="w-full bg-white/5 border border-brand-border rounded-xl py-3 pl-12 pr-4 text-brand-text-bright focus:outline-none focus:border-brand-accent transition-colors placeholder:text-brand-text-dim/50 uppercase tracking-[0.05em] text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeptList.map((dept) => (
              <motion.div 
                key={dept.id}
                layout
                className="glass-card p-6 flex flex-col justify-between group hover:border-brand-accent/50 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent">
                      <Building2 size={20} />
                    </div>
                    <button 
                      onClick={() => handleDeptEditClick(dept)}
                      className="p-2 text-brand-text-dim hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <h3 className="text-lg font-display text-brand-text-bright uppercase tracking-tight mb-1">{dept.name}</h3>
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-widest font-black mb-4">{dept.head}</p>
                  <p className="text-xs text-brand-text-dim line-clamp-2 mb-4 leading-relaxed italic">{dept.description}</p>
                </div>
                
                <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-text-dim">
                    <Phone size={10} /> {dept.contact.phone}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-brand-accent">
                    {dept.services.length} Services
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {departments.length === 0 && (
            <div className="glass-card p-20 text-center space-y-6">
              <Building size={48} className="mx-auto text-brand-text-dim/30" />
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-brand-text-dim">No departments detected in cloud database.</p>
                <p className="text-[10px] text-brand-text-dim/50 uppercase tracking-widest">Initialization required to enable dynamic content management.</p>
              </div>
              <button 
                onClick={syncDepartments}
                className="mx-auto flex items-center gap-3 bg-brand-accent text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all font-display"
              >
                Initialize Sector Database
              </button>
            </div>
          )}
        </>
      )}

      {/* User Edit Modal */}
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

      {/* Dept Edit Modal */}
      <AnimatePresence>
        {isDeptEditModalOpen && deptForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeptEditModalOpen(false)}
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
                  <div className="w-14 h-14 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary border border-brand-secondary/20">
                    <Building size={24} />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-secondary">Metadata Refinement</h2>
                    <p className="text-2xl font-display text-brand-text-bright leading-none mt-1">Profile Modification</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDeptEditModalOpen(false)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Sector Name</label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({...deptForm, name: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Head of Office</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={deptForm.head}
                      onChange={(e) => setDeptForm({...deptForm, head: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Official Email</label>
                    <input 
                      type="email"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={deptForm.contact.email}
                      onChange={(e) => setDeptForm({...deptForm, contact: {...deptForm.contact, email: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Contact Phone</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={deptForm.contact.phone}
                      onChange={(e) => setDeptForm({...deptForm, contact: {...deptForm.contact, phone: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Physical Location</label>
                    <input 
                      type="text"
                      className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-bold text-brand-text-bright focus:border-brand-accent outline-none"
                      value={deptForm.contact.location}
                      onChange={(e) => setDeptForm({...deptForm, contact: {...deptForm.contact, location: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Mandate & Mission Summary</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-white/5 border border-brand-border rounded-xl px-5 py-3 text-sm font-medium text-brand-text-bright focus:border-brand-accent outline-none italic leading-relaxed"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({...deptForm, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Frontline Services</label>
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
                  onClick={() => setIsDeptEditModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="button"
                  onClick={handleUpdateDept}
                  className="flex-1 py-4 rounded-2xl bg-brand-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-secondary/20 hover:bg-brand-secondary/90 transition-all font-display flex items-center justify-center gap-3"
                >
                  <Save size={16} /> Finalize Changes
                </button>
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
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Sector Assignment</label>
                        <DepartmentDropdown 
                          value={newDept}
                          onChange={setNewDept}
                          isOpen={isDeptDropdownOpen}
                          setIsOpen={setIsDeptDropdownOpen}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim px-2">Access Key Generation</label>
                        <div className="flex gap-2">
                           <input 
                             readOnly
                             type="text" 
                             placeholder="Click generate to create key..."
                             className="flex-1 bg-white/5 border border-brand-border rounded-xl px-4 py-3 text-sm font-mono font-bold text-brand-accent focus:outline-none"
                             value={newAccessKey}
                           />
                           <button 
                             type="button"
                             onClick={generateAccessKey}
                             className="px-4 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl hover:bg-brand-accent/20 transition-all shadow-sm"
                           >
                             <RefreshCw size={18} />
                           </button>
                        </div>
                        <p className="text-[9px] text-brand-text-dim italic px-2">Staff will use this key to claim their municipal sector profile.</p>
                      </div>
                    </>
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
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-brand-bg border border-red-500/30 rounded-[2.5rem] shadow-2xl p-10 space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 border border-red-500/20">
                  <AlertTriangle size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-display text-brand-text-bright uppercase tracking-tight">Security Breach?</h2>
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.2em] font-black italic">Identity De-Authorization Protocol</p>
                </div>
                <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10 w-full">
                  <p className="text-xs text-brand-text-bright leading-relaxed">
                    You are about to permanently terminate access for <span className="font-black text-red-500 uppercase">{selectedUser.name}</span>. 
                    This identity will be purged from the municipal database. This action is <span className="underline decoration-red-500 font-bold">irreversible</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-text-dim border border-brand-border hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all font-display"
                >
                  Purge Identity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Status Modal */}
      <AnimatePresence>
        {registrationStatus.show && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRegistrationStatus({ ...registrationStatus, show: false })}
              className="absolute inset-0 bg-brand-bg/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md bg-brand-bg border ${registrationStatus.success ? 'border-brand-accent/30' : 'border-red-500/30'} rounded-[2.5rem] shadow-2xl p-10 space-y-8`}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border transition-all ${
                  registrationStatus.success 
                    ? 'bg-brand-accent/10 text-brand-accent border-brand-accent/20' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {registrationStatus.success ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-display text-brand-text-bright uppercase tracking-tight">
                    {registrationStatus.success ? 'Process Confirmed' : 'System Restriction'}
                  </h2>
                  <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.2em] font-black italic">
                    Identity Management Protocol
                  </p>
                </div>

                <div className={`w-full p-6 rounded-2xl border ${
                  registrationStatus.success ? 'bg-brand-accent/5 border-brand-accent/10' : 'bg-red-500/5 border-red-500/10'
                }`}>
                  <p className="text-xs text-brand-text-bright leading-relaxed">
                    {registrationStatus.message}
                  </p>
                  
                  {registrationStatus.success && registrationStatus.email && (
                    <div className="mt-4 pt-4 border-t border-brand-accent/10 space-y-3">
                      <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-brand-text-dim">
                        <span>Personnel Email</span>
                        <span className="text-brand-text-bright lowercase">{registrationStatus.email}</span>
                      </div>
                      {registrationStatus.key && (
                        <div className="flex justify-between items-center bg-brand-accent/10 p-3 rounded-xl border border-brand-accent/20">
                          <span className="text-[9px] uppercase font-black tracking-widest text-brand-accent">Access Key</span>
                          <span className="font-mono text-sm font-bold text-brand-accent tracking-widest">{registrationStatus.key}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setRegistrationStatus({ ...registrationStatus, show: false })}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  registrationStatus.success 
                    ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/20 hover:bg-blue-900' 
                    : 'bg-white/5 text-brand-text-dim border border-brand-border hover:bg-white/10'
                }`}
              >
                Clear Terminal
              </button>
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
