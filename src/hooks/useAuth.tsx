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
  access_key?: string;
  is_claimed?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCitizen: boolean;
  needsVerification: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  isCitizen: false,
  needsVerification: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser.email || '');
      } else {
        setProfile(null);
        setNeedsVerification(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    if (!email) {
      console.warn("FetchProfile: No email provided for UID", uid);
    }

    try {
      setLoading(true);
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      const normalizedEmail = email.toLowerCase().trim();

      // Check for pre-authorization record regardless of whether a UID doc exists
      // This allows existing citizens to be "upgraded" to staff/admin via email authorization
      const preAuthId = `pre_auth:${normalizedEmail}`;
      const preAuthRef = doc(db, 'users', preAuthId);
      const preAuthSnap = await getDoc(preAuthRef);

      if (preAuthSnap.exists()) {
        const preAuthData = preAuthSnap.data() as UserProfile;
        
        // If they have a regular profile, but a pre_auth exists, they need to verify to upgrade
        // or if they don't have a profile yet, they definitely need to verify
        setProfile(preAuthData);
        setNeedsVerification(true);
        setLoading(false);
        return;
      }

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Auto-upgrade admin if email matches
        if (normalizedEmail === 'achavezsalva@gmail.com' && data.role !== 'admin') {
          await updateDoc(docRef, { role: 'admin' });
          setProfile({ ...data, role: 'admin' });
        } else {
          setProfile(data);
        }
        setNeedsVerification(false);
      } else {
        // New user profile creation (normal citizen)
        const role = normalizedEmail === 'achavezsalva@gmail.com' ? 'admin' : 'citizen';
        const newProfile: UserProfile = {
          uid,
          name: auth.currentUser?.displayName || 'Anonymous Citizen',
          email: normalizedEmail,
          role,
          created_at: new Date().toISOString(),
          is_claimed: true // Default profiles for non-pre-auth users are claimed by definition
        };

        await setDoc(docRef, newProfile);
        setProfile(newProfile);
        setNeedsVerification(false);
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
    needsVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
