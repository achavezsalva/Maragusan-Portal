import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'citizen';
  department_id?: string;
  created_at: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCitizen: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  isCitizen: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser.email || '');
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-upgrade admin if email matches
        if (email === 'achavezsalva@gmail.com' && data.role !== 'admin') {
          await updateDoc(docRef, { role: 'admin' });
          setProfile({ ...data, role: 'admin' });
        } else {
          setProfile(data);
        }
      } else {
        // New user profile creation
        const role = email === 'achavezsalva@gmail.com' ? 'admin' : 'citizen';
        const newProfile: UserProfile = {
          uid,
          name: auth.currentUser?.displayName || 'Anonymous Citizen',
          email: email,
          role,
          created_at: new Date().toISOString(),
        };

        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || user?.email === 'achavezsalva@gmail.com',
    isStaff: profile?.role === 'staff' || profile?.role === 'admin' || user?.email === 'achavezsalva@gmail.com',
    isCitizen: profile?.role === 'citizen',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
