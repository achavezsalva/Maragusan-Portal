import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'citizen';
  department_id?: string;
  created_at: any;
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
    let unsubPreAuth: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous listener if it exists
      if (unsubPreAuth) {
        unsubPreAuth();
        unsubPreAuth = null;
      }

      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userEmail = firebaseUser.email?.toLowerCase().trim();
        const docRef = doc(db, 'users', firebaseUser.uid);
        
        // Initial setup
        const setupProfile = async () => {
          try {
            // ... check pre-auth once first
            if (userEmail) {
              const preAuthId = `pre_auth:${userEmail}`;
              const preAuthRef = doc(db, 'users', preAuthId);
              const preAuthSnap = await getDoc(preAuthRef);

              if (preAuthSnap.exists()) {
                const preAuthData = preAuthSnap.data() as UserProfile;
                const mergedProfile: UserProfile = {
                  ...preAuthData,
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || preAuthData.name,
                  email: firebaseUser.email || preAuthData.email,
                  created_at: preAuthData.created_at || serverTimestamp(),
                };
                await setDoc(docRef, mergedProfile);
                await deleteDoc(preAuthRef);
                setProfile(mergedProfile);
                setLoading(false);
                return;
              }
            }

            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              if (firebaseUser.email === 'achavezsalva@gmail.com' && data.role !== 'admin') {
                await updateDoc(docRef, { role: 'admin' });
                setProfile({ ...data, role: 'admin' });
              } else {
                setProfile(data);
              }
            } else {
              const role = firebaseUser.email === 'achavezsalva@gmail.com' ? 'admin' : 'citizen';
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Anonymous Citizen',
                email: firebaseUser.email || '',
                role: role,
                created_at: serverTimestamp(),
              };
              await setDoc(docRef, newProfile);
              setProfile(newProfile);
            }
          } catch (error) {
            console.error("Error initializing user profile:", error);
          }
          setLoading(false);
        };

        setupProfile();

        // Reactive listener for pending auth changes
        if (userEmail) {
          const preAuthRef = doc(db, 'users', `pre_auth:${userEmail}`);
          unsubPreAuth = onSnapshot(preAuthRef, async (snap) => {
            if (snap.exists()) {
              const preAuthData = snap.data() as UserProfile;
              const mergedProfile: UserProfile = {
                ...preAuthData,
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || preAuthData.name,
                email: firebaseUser.email || preAuthData.email,
                created_at: preAuthData.created_at || serverTimestamp(),
              };
              await setDoc(docRef, mergedProfile);
              await deleteDoc(preAuthRef);
              setProfile(mergedProfile);
            }
          });
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubPreAuth) unsubPreAuth();
    };
  }, []);

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
