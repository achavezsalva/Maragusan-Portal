import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { auth } from './lib/firebase';
import { LogOut, Home, Menu, User, Bell, FileText, MessageSquare, LayoutDashboard, Shield, Building, ChevronDown, Search, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MUNICIPAL_BRANDING } from './constants';

// Pages
import LandingPage from './pages/LandingPage';
import Announcements from './pages/Announcements';
import Services from './pages/Services';
import Feedback from './pages/Feedback';
import Admin from './pages/Admin';
import Directory from './pages/Directory';
import LoginModal from './components/LoginModal';

interface NavItemProps {
  label: string;
  to?: string;
  dropdown?: { label: string, to: string }[];
}

const NavItem: React.FC<NavItemProps> = ({ label, to, dropdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = to ? location.pathname === to : dropdown?.some(item => location.pathname === item.to);

  if (dropdown) {
    return (
      <div 
        className="relative group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button className={`nav-link flex items-center gap-1.5 py-2 ${isActive ? 'active' : ''}`}>
          {label}
          <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-0 w-56 bg-brand-card border border-brand-border rounded-xl shadow-2xl overflow-hidden py-2 z-[100] backdrop-blur-xl"
            >
              {dropdown.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  className="block px-6 py-3 text-[11px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-accent hover:bg-white/5 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link to={to || '#'} className={`nav-link py-2 ${isActive ? 'active' : ''}`}>
      {label}
    </Link>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();

  const menuItems: { label: string, to?: string, dropdown?: { label: string, to: string }[] }[] = [
    { label: 'Home', to: '/' },
    { 
      label: 'The Municipality', 
      dropdown: [
        { label: "History", to: '#' },
        { label: "Municipal Directory", to: '/directory' },
        { label: "Officials", to: '#' },
        { label: "Barangays", to: '#' },
        { label: "Vision, Mission & Goal", to: '#' },
        { label: "Development Thrust", to: '#' },
        { label: "Citizen Charter", to: '/services' },
        { label: "Service Pledge", to: '#' },
        { label: "Quality Management System", to: '#' }
      ] 
    },
    { 
      label: 'Branches', 
      dropdown: [
        { label: "Executive: Orders", to: '#' },
        { label: "Legislative: Ordinances", to: '#' },
        { label: "Judiciary", to: '#' },
        { label: "NGA's", to: '#' }
      ] 
    },
    { 
      label: 'Visit & Invest', 
      dropdown: [
        { label: "Tourist Circuit", to: '#' },
        { label: "Eatventures", to: '#' },
        { label: "Coastal Circuits", to: '#' },
        { label: "Cost of doing business", to: '#' },
        { label: "Investment Incentives", to: '#' },
        { label: "Local Products", to: '#' },
        { label: "Investment profile", to: '#' },
        { label: "Tourist Arrivals", to: '#' }
      ] 
    },
    { 
      label: 'News & Events', 
      dropdown: [
        { label: "News", to: '/announcements' },
        { label: "Events", to: '#' },
        { label: "Emagazine", to: '#' }
      ] 
    },
    { 
      label: 'Transparency', 
      dropdown: [
        { label: "Pre-Bidding Conference", to: '#' },
        { label: "Invitation To Bid", to: '#' },
        { label: "Bayanihan Grant", to: '#' },
        { label: "Local Government Support Fund", to: '#' },
        { label: "Notices and Purchases", to: '#' },
        { label: "FDPP Maragusan", to: '#' },
        { label: "Full Disclosure Policy Portal", to: '#' },
        { label: "European Commission Grant", to: '#' }
      ] 
    },
    { 
      label: 'Contact Us', 
      dropdown: [
        { label: "Directory", to: '/feedback' }
      ] 
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-bright font-sans antialiased flex flex-col">
      <nav className="h-20 bg-brand-bg border-b border-brand-border sticky top-0 z-50 px-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <figure className="w-14 h-14 rounded-full flex items-center justify-center border border-brand-border group-hover:border-brand-accent transition-all overflow-hidden bg-white shadow-sm font-sans">
               <img 
                 src={MUNICIPAL_BRANDING.logo.seal} 
                 alt={MUNICIPAL_BRANDING.logo.alt} 
                 className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110" 
                 referrerPolicy="no-referrer"
               />
            </figure>
            <div className="flex flex-col">
              <span className="font-display text-xl tracking-tight leading-none text-brand-accent">{MUNICIPAL_BRANDING.name}</span>
              <span className="text-[9px] text-brand-text-dim uppercase tracking-[0.2em] font-black italic mt-1 group-hover:text-brand-accent transition-colors">{MUNICIPAL_BRANDING.portalName}</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {menuItems.map((item, idx) => (
            <NavItem 
              key={idx} 
              label={item.label} 
              to={item.to} 
              dropdown={item.dropdown} 
            />
          ))}
          {isAdmin && (
            <Link to="/admin" className={`nav-link flex items-center gap-2 ${location.pathname === '/admin' ? 'active' : ''}`}>
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-2 lg:gap-4">
            <li className="hidden sm:block">
              <button className="p-2.5 text-brand-text-dim hover:text-brand-accent transition-all cursor-pointer bg-white/5 rounded-lg border border-transparent hover:border-brand-border">
                <Search size={18} strokeWidth={1.5} />
              </button>
            </li>
            
            <li className="hidden sm:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3 lg:gap-4 group">
                  <div className="hidden xl:flex text-right flex-col justify-center">
                    <span className="text-xs font-black uppercase tracking-widest leading-none text-brand-text-bright">{profile?.name}</span>
                    <span className="text-[9px] text-brand-text-dim uppercase tracking-[0.2em] font-bold mt-1 italic">{profile?.role}</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-black text-brand-accent border border-brand-border group-hover:border-brand-accent transition-all shadow-sm">
                    {profile?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <button 
                    onClick={() => auth.signOut()}
                    className="p-2.5 text-brand-text-dim hover:text-red-600 bg-slate-50 rounded-lg border border-transparent hover:border-red-200 transition-all font-sans"
                    title="Terminate Session"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-3 py-2.5 px-4 bg-brand-accent border border-brand-accent rounded-lg text-white hover:bg-blue-900 transition-all group shadow-lg shadow-brand-accent/20 cursor-pointer font-sans"
                  title="Administrative Portal Access"
                >
                  <LayoutGrid size={18} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Portal Login</span>
                </button>
              )}
            </li>
          </ul>

          <button 
            className="lg:hidden p-2 text-brand-text-bright hover:text-brand-accent transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden absolute top-20 left-0 right-0 bg-brand-card border-b border-brand-border p-8 flex flex-col gap-4 z-40 max-h-[80vh] overflow-y-auto shadow-xl"
          >
            {menuItems.map((item, idx) => (
              <div key={idx} className="space-y-2">
                {item.to ? (
                  <Link to={item.to} onClick={() => setIsMenuOpen(false)} className="nav-link text-lg block">{item.label}</Link>
                ) : (
                  <>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent mt-4 first:mt-0">{item.label}</div>
                    <div className="grid grid-cols-1 gap-2 pl-4">
                      {item.dropdown?.map((sub, sIdx) => (
                        <Link key={sIdx} to={sub.to} onClick={() => setIsMenuOpen(false)} className="nav-link text-sm">{sub.label}</Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="nav-link text-lg text-brand-accent pt-4 border-t border-brand-border">Admin Console</Link>}
            {!user && (
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="btn-primary w-full py-4 mt-6 uppercase tracking-widest font-black text-xs shadow-lg shadow-brand-accent/20"
              >
                Portal Login
              </button>
            )}
          </motion.div>
        )}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-brand-bg border-t border-brand-border py-12 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-display text-xl">
            {MUNICIPAL_BRANDING.name} <span className="italic text-brand-accent">{MUNICIPAL_BRANDING.portalName}</span>
          </div>
          <div className="text-brand-text-dim text-[11px] uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {MUNICIPAL_BRANDING.fullName} • Digital Integrity Guaranteed
          </div>
          <div className="flex gap-6">
             <Link to="/feedback" className="nav-link text-[10px]">Contact</Link>
             <Link to="/announcements" className="nav-link text-[10px]">Legal</Link>
             <Link to="/services" className="nav-link text-[10px]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/services" element={<Services />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/staff" element={<Announcements />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
