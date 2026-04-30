import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;
        alert('Registration successful! Please check your email for verification.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      onClose();
    } catch (err: any) {
      console.error("Supabase Auth Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      console.error("Supabase OAuth Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-card p-10 space-y-8 bg-white overflow-hidden shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 p-2 text-brand-text-dim hover:text-brand-accent transition-colors rounded-full hover:bg-slate-50"
              aria-label="Close authentication dialog"
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent mx-auto border border-brand-accent/20">
                <ShieldCheck size={32} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 id="login-modal-title" className="text-3xl font-display uppercase tracking-tight text-brand-text-bright">
                  {isRegistering ? 'New Account' : 'Portal Access'}
                </h2>
                <p className="text-brand-text-dim text-xs uppercase tracking-[0.2em] font-bold">
                  {isRegistering 
                    ? 'Institutional Registration Protocol' 
                    : 'Secured Administrative Channel'}
                </p>
              </div>
            </div>

            {error && (
              <div 
                className="bg-red-500/10 text-red-600 p-4 rounded-lg text-xs font-bold border border-red-500/20 text-center uppercase tracking-wider"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegistering && (
                <div className="space-y-2">
                  <label id="name-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Identity Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-brand-text-dim" size={16} aria-hidden="true" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-brand-border rounded-lg py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-hidden"
                      placeholder="Full Legal Name"
                      aria-labelledby="name-label"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label id="email-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Electronic Mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-brand-text-dim" size={16} aria-hidden="true" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-brand-border rounded-lg py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-hidden"
                    placeholder="name@government.ph"
                    aria-labelledby="email-label"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label id="password-label" className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-brand-text-dim" size={16} aria-hidden="true" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-brand-border rounded-lg py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all outline-hidden"
                    placeholder="••••••••"
                    aria-labelledby="password-label"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 uppercase tracking-[0.2em] font-bold mt-4 shadow-lg shadow-brand-accent/20"
              >
                {loading ? 'Authenticating...' : (isRegistering ? 'Register' : 'Initialize Access')}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[2px]">
                <span className="bg-white px-4 text-brand-text-dim font-black">Institutional SSO</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 border border-brand-border rounded-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-brand-accent transition-all flex items-center justify-center gap-3 bg-white active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
