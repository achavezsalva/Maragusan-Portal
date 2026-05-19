import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  department_id?: string;
  access_key?: string;
  is_claimed?: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  needsVerification: boolean;
  isUnauthorized: boolean;
  initializeAccess: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyAccessKey: (email: string, key: string) => Promise<{ success: boolean; message: string; profile?: UserProfile }>;
  signOut: () => Promise<void>;
  resetUnauthorized: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  needsVerification: false,
  isUnauthorized: false,
  initializeAccess: async () => ({ success: false, message: '' }),
  verifyAccessKey: async () => ({ success: false, message: '' }),
  signOut: async () => {},
  resetUnauthorized: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check for manual session
    const savedManualProfile = localStorage.getItem('manual_profile');
    if (savedManualProfile && !user) {
      setProfile(JSON.parse(savedManualProfile));
      setLoading(false);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email ?? '');
      } else if (!savedManualProfile) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email ?? '');
      } else {
        // Only clear profile if there's no manual session
        if (!localStorage.getItem('manual_profile')) {
          setProfile(null);
          setNeedsVerification(false);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string, email: string) => {
    try {
      setLoading(true);
      const normalizedEmail = email.toLowerCase().trim();

      // 1. Check if there's a profile with the user's permanent UID
      let { data: profileById, error: idError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (idError && idError.code !== 'PGRST116') {
        console.error("Error fetching profile by ID:", idError);
      }

      // 2. If no profile by UID, check if there's a pending profile with this email
      // This handles pre-registered staff/admins
      let { data: profileByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (emailError && emailError.code !== 'PGRST116') {
        console.error("Error fetching profile by email:", emailError);
      }

      // Logic Decision Table:
      // A. Profile exists with current UID -> Use it.
      // B. No profile with UID, but profile with Email exists and is NOT claimed -> Verification required.
      // C. No profile with UID, but profile with Email exists and IS claimed -> This is a conflict (UID changed?), 
      //    but since email is unique, we should probably link the new UID to this profile.
      // D. No profile found at all -> Create new staff profile.

      if (profileById) {
        setProfile(profileById as UserProfile);
        // If a profile exists with this UID but is not claimed (shouldn't happen with auth uid but good to check), require verification
        setNeedsVerification(profileById.is_claimed === false);
      } else if (profileByEmail) {
        if (!profileByEmail.is_claimed) {
          // Pre-registered user found!
          setProfile(profileByEmail as UserProfile);
          setNeedsVerification(true);
        } else {
          // Profile exists and is claimed, but has a different ID.
          // Link this record to the new UID
          const { data: updatedProfile } = await supabase
            .from('users')
            .update({ id })
            .eq('email', normalizedEmail)
            .select()
            .single();
          
          setProfile(updatedProfile as UserProfile);
          setNeedsVerification(false);
        }
      } else {
        // Only allow auto-creation for the master admin email
        if (normalizedEmail === 'achavezsalva@gmail.com') {
          const role = 'admin';
          const defaultName = 'System Administrator';
          const newProfile: Partial<UserProfile> = {
            id,
            name: defaultName,
            email: normalizedEmail,
            role,
            is_claimed: true
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error("Error creating admin profile:", createError);
            setProfile({ ...newProfile, id, created_at: new Date().toISOString() } as UserProfile);
            setNeedsVerification(false);
          } else {
            setProfile(createdProfile as UserProfile);
            setNeedsVerification(false);
          }
        } else {
          // NOT AUTHORIZED: This is a new user with no pre-existing profile
          setIsUnauthorized(true);
          setProfile(null);
          setNeedsVerification(false);
        }
      }
    } catch (error) {
      console.error("Auth initialization failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeAccess = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (error || !data) {
        // Fallback for primary admin initialization if record doesn't exist yet
        if (normalizedEmail === 'achavezsalva@gmail.com') {
          const adminProfile: UserProfile = {
            id: 'admin-init',
            name: 'System Administrator',
            email: normalizedEmail,
            role: 'admin',
            access_key: 'ADMIN123', // Default initialization key
            is_claimed: false,
            created_at: new Date().toISOString()
          };
          setPendingEmail(normalizedEmail);
          setProfile(adminProfile);
          setNeedsVerification(true);
          return { success: true, message: 'Administrative Identity recognized. Verification procedure initiated.' };
        }
        return { success: false, message: `Identity (${normalizedEmail}) not found in municipal records. Please verify registration status with administration.` };
      }

      // REMOVED: if (data.is_claimed && !user) ... 
      // This allows users to use their access key even if they have a Google account (fallback login)

      setPendingEmail(normalizedEmail);
      setProfile(data as UserProfile);
      setNeedsVerification(true);
      return { success: true, message: 'Identity recognized. Verification required.' };
    } catch (err) {
      return { success: false, message: 'System error during initialization.' };
    }
  };

  const verifyAccessKey = async (email: string, key: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let sessionData: UserProfile | null = null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('access_key', key.trim())
        .single();

      if (error || !data) {
        // Fallback check for primary admin if DB record missing or key mismatch in DB
        if (normalizedEmail === 'achavezsalva@gmail.com' && key === 'ADMIN123') {
          sessionData = {
            id: 'admin-manual',
            name: 'System Administrator',
            email: normalizedEmail,
            role: 'admin',
            is_claimed: false,
            created_at: new Date().toISOString()
          };
        } else {
          return { success: false, message: 'Invalid Access Key. Synchronization failed.' };
        }
      } else {
        sessionData = data as UserProfile;
      }

      // Record that the identity has been claimed/accessed
      if (sessionData.id !== 'admin-manual') {
        const updateData: any = { is_claimed: true };
        if (user) {
          updateData.id = user.id;
          updateData.access_key = null;
        }
        
        await supabase
          .from('users')
          .update(updateData)
          .eq('email', normalizedEmail);
          
        // Update local session data for immediate UI feedback
        sessionData.is_claimed = true;
        sessionData.access_key = user ? undefined : sessionData.access_key;
      }

      setProfile(sessionData);
      setNeedsVerification(false);
      setPendingEmail(null);
      
      // Store manual session
      localStorage.setItem('manual_profile', JSON.stringify(sessionData));

      return { success: true, message: 'Access granted.', profile: sessionData };
    } catch (err) {
      return { success: false, message: 'System error during verification.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('manual_profile');
    setProfile(null);
    setUser(null);
    setIsUnauthorized(false);
  };

  const resetUnauthorized = () => {
    setIsUnauthorized(false);
    signOut();
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: (profile?.role === 'admin' && (profile?.is_claimed || !user)) || user?.email?.toLowerCase() === 'achavezsalva@gmail.com',
    isStaff: ((profile?.role === 'staff' || profile?.role === 'admin') && (profile?.is_claimed || !user)) || user?.email?.toLowerCase() === 'achavezsalva@gmail.com',
    needsVerification,
    isUnauthorized,
    initializeAccess,
    verifyAccessKey,
    signOut,
    resetUnauthorized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
