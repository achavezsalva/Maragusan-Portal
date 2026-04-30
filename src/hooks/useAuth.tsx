import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'citizen';
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '');
      } else {
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
        setProfile(null);
        setNeedsVerification(false);
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
      // D. No profile found at all -> Create new citizen.

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
        // Create new profile
        const role = normalizedEmail === 'achavezsalva@gmail.com' ? 'admin' : 'citizen';
        const defaultName = role === 'admin' ? 'System Administrator' : (user?.user_metadata?.full_name || 'Anonymous Citizen');
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
          if (createError.code === '23505') { 
            // Email already exists! This is a pre-registered user that RLS prevents us from seeing.
            setNeedsVerification(true);
            setProfile({ email: normalizedEmail, role: 'staff', name: user?.user_metadata?.full_name || 'Staff' } as UserProfile);
          } else {
            console.error("Error creating profile:", createError);
            setProfile({ ...newProfile, id, created_at: new Date().toISOString() } as UserProfile);
            setNeedsVerification(false);
          }
        } else {
          setProfile(createdProfile as UserProfile);
          setNeedsVerification(false);
        }
      }
    } catch (error) {
      console.error("Auth initialization failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: (profile?.role === 'admin' && profile?.is_claimed) || user?.email?.toLowerCase() === 'achavezsalva@gmail.com',
    isStaff: ((profile?.role === 'staff' || profile?.role === 'admin') && profile?.is_claimed) || user?.email?.toLowerCase() === 'achavezsalva@gmail.com',
    isCitizen: profile?.role === 'citizen',
    needsVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
