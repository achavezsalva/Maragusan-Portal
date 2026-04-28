import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { LogOut, Home, Menu, User, Bell, FileText, MessageSquare, LayoutDashboard, Shield, Building, ChevronDown, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MUNICIPAL_BRANDING } from './constants';

// Pages
import LandingPage from './pages/LandingPage';
import Announcements from './pages/Announcements';
import Services from './pages/Services';
import Feedback from './pages/Feedback';
import Directory from './pages/Directory';
import Barangays from './pages/Barangays';
import About from './pages/About';
import Officials from './pages/Officials';
import Admin from './pages/Admin';
import DepartmentDetail from './pages/DepartmentDetail';
import LoginModal from './components/LoginModal';

interface NavItemProps {
  label: string;
  to?: string;
  dropdown?: { label: string, to: string }[];
}

const NavItem: React.FC<NavItemProps> = ({ label, to, dropdown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = to ? location.pathname === to : dropdown?.some(item => location.pathname === item.to);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (dropdown) {
    return (
      <div 
        ref={dropdownRef}
        className="relative group h-full flex items-center"
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      >
        <button 
          className={`nav-link flex items-center gap-1.5 py-2 px-3 rounded-lg transition-all duration-300 hover:bg-brand-secondary/10 ${isActive ? 'bg-brand-secondary/10 active' : ''}`}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`${label} menu`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {label}
          <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 w-56 bg-brand-card border border-brand-border rounded-b-xl shadow-2xl overflow-hidden py-2 z-[100] backdrop-blur-xl border-t-0"
              role="menu"
            >
              {dropdown.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  className="block mx-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-text-bright hover:bg-brand-secondary/20 transition-all duration-200 focus:bg-brand-secondary/30 focus:outline-none focus:text-brand-text-bright"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
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
    <div className="h-full flex items-center">
      <Link to={to || '#'} className={`nav-link py-2 px-3 rounded-lg transition-all duration-300 hover:bg-brand-secondary/10 ${isActive ? 'bg-brand-secondary/10 active' : ''}`}>
        {label}
      </Link>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleSubMenu = (idx: number) => {
    setOpenSubMenu(openSubMenu === idx ? null : idx);
  };

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const menuItems: { label: string, to?: string, dropdown?: { label: string, to: string }[] }[] = [
    { label: 'Home', to: '/' },
    { 
      label: 'The Municipality', 
      dropdown: [
        { label: "Officials", to: '/officials' },
        { label: "Municipal Directory", to: '/directory' },
        { label: "Barangays", to: '/barangays' },
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
        { label: "Investment Incentives", to: '#' },
        { label: "Local Products", to: '#' },
        { label: "Investment profile", to: '#' },
        { label: "Tourist Arrivals", to: '#' }
      ] 
    },
    { 
      label: 'Transparency', 
      dropdown: [
        { label: "Invitation To Bid", to: '#' },
        { label: "Bayanihan Grant", to: '#' },
        { label: "Local Government Support Fund", to: '#' },
        { label: "Notices and Purchases", to: '#' },
        { label: "Job Opportunity", to: '#' },
      ] 
    },
    { label: 'About Maragusan', to: '/about' },
    { 
      label: 'Contact Us', 
      dropdown: [
        { label: "Feedback", to: '/feedback' }
      ] 
    },
  ];


  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-bright font-sans antialiased flex flex-col">
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-brand-accent focus:text-white focus:rounded-lg focus:shadow-2xl"
      >
        Skip to main content
      </a>

      <header 
        className="relative py-12 bg-brand-bg border-b border-brand-border/30 overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(10, 15, 30, 0.7), rgba(10, 15, 30, 0.7)), url('/about-img/about-maragusan.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-6 group shrink-0" aria-label={`Home - ${MUNICIPAL_BRANDING.name}`}>
            <figure className="w-20 h-20 rounded-full flex items-center justify-center border border-brand-border group-hover:border-brand-accent transition-all overflow-hidden bg-white shadow-md font-sans">
               <img 
                 src={MUNICIPAL_BRANDING.logo.seal} 
                 alt={MUNICIPAL_BRANDING.logo.alt} 
                 className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110" 
                 referrerPolicy="no-referrer"
               />
            </figure>
            <div className="flex flex-col">
              <span className="font-display text-4xl tracking-tighter leading-none text-[#FFD700] group-hover:text-white transition-colors drop-shadow-lg">
                {MUNICIPAL_BRANDING.name}
              </span>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-px w-8 bg-[#FFD700]/50" />
                <span className="text-[11px] text-white/90 uppercase tracking-[0.4em] font-black italic group-hover:text-white transition-colors drop-shadow-md">
                  {MUNICIPAL_BRANDING.portalName}
                </span>
              </div>
            </div>
          </Link>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="text-right flex flex-col items-end drop-shadow-lg">
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700]">Official Digital Portal of</div>
               <div className="text-xs font-bold text-white uppercase tracking-widest mt-1">{MUNICIPAL_BRANDING.fullName}</div>
            </div>
          </div>
        </div>
      </header>

      <nav 
        className={`h-16 bg-brand-bg border-b border-brand-border sticky top-0 z-50 px-10 flex items-center ${user ? 'justify-start' : 'justify-center'} relative`}
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center h-full gap-4 xl:gap-6">
          {menuItems.map((item, idx) => (
            <NavItem 
              key={idx} 
              label={item.label} 
              to={item.to} 
              dropdown={item.dropdown} 
            />
          ))}
        </div>

        <div className="absolute right-10 flex items-center gap-6">
          <ul className="flex items-center gap-2 lg:gap-4" role="list">

            <li className="hidden sm:flex items-center gap-4">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 group focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={isProfileOpen}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-black text-brand-accent border border-brand-border group-hover:border-brand-accent transition-all shadow-sm">
                      {profile?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <ChevronDown size={14} className={`text-brand-text-dim transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-brand-card border border-brand-border rounded-xl shadow-2xl py-2 z-[100] backdrop-blur-xl"
                      >
                        <div className="px-4 py-3 border-b border-brand-border mb-2 bg-brand-bg/50">
                          <div className="text-xs font-black uppercase tracking-widest leading-tight text-brand-text-bright">{profile?.name}</div>
                          <div className="text-[9px] text-brand-text-dim uppercase tracking-[0.2em] font-bold mt-1.5 italic">{profile?.role} Clearance</div>
                        </div>
                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Shield size={14} /> Admin
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            signOut(auth);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all text-left"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-3 py-2.5 px-4 bg-brand-accent border border-brand-accent rounded-lg text-white hover:bg-blue-900 transition-all group shadow-lg shadow-brand-accent/20 cursor-pointer font-sans"
                  title="Administrative Portal Access"
                >
                  <LayoutGrid size={18} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              )}
            </li>
          </ul>

          <button 
            className="lg:hidden p-2 text-brand-text-bright hover:text-brand-accent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle main menu"
          >
            <Menu size={24} />
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-brand-card border-b border-brand-border p-8 flex flex-col gap-4 z-40 max-h-[80vh] overflow-y-auto shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
            {menuItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                {item.to ? (
                  <Link 
                    to={item.to} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="nav-link text-lg block py-3 px-4 rounded-xl hover:bg-brand-secondary/10 transition-all font-medium border border-transparent hover:border-brand-border/30"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div className="space-y-1">
                    <button 
                      onClick={() => toggleSubMenu(idx)}
                      className="w-full flex items-center justify-between text-lg py-3 px-4 rounded-xl hover:bg-brand-secondary/10 transition-all font-medium border border-transparent hover:border-brand-border/30 text-left"
                    >
                      <span>{item.label}</span>
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 ${openSubMenu === idx ? 'rotate-180 text-brand-accent' : 'text-brand-text-dim'}`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {openSubMenu === idx && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-brand-secondary/5 rounded-xl ml-4 mr-2"
                        >
                          <div className="py-2 grid grid-cols-1 gap-1">
                            {item.dropdown?.map((sub, sIdx) => (
                              <Link 
                                key={sIdx} 
                                to={sub.to} 
                                onClick={() => setIsMenuOpen(false)} 
                                className="nav-link text-sm py-2.5 px-6 rounded-lg hover:bg-brand-secondary/10 transition-all text-brand-text-dim hover:text-brand-text-bright flex items-center gap-3"
                              >
                                <div className="w-1 h-1 rounded-full bg-brand-accent/40" />
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ))}
            {isAdmin && (
              <Link 
                to="/admin" 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center gap-3 nav-link text-lg block py-3 px-4 rounded-lg bg-brand-accent/10 border border-brand-accent/20 text-brand-accent mt-4"
              >
                <Shield size={18} /> Admin Console
              </Link>
            )}
            {!user && (
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="btn-primary w-full py-4 mt-6 uppercase tracking-widest font-black text-xs shadow-lg shadow-brand-accent/20 focus:ring-4"
                aria-label="Login to administrative portal"
              >
                Portal Login
              </button>
            )}
          </motion.div>
        )}
        </AnimatePresence>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </nav>


      <main 
        id="main-content"
        className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 overflow-x-hidden"
        role="main"
        tabIndex={-1}
      >
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

      <footer className="bg-brand-bg border-t border-brand-border py-12 px-10" role="contentinfo" aria-label="Portal Footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-display text-xl">
            {MUNICIPAL_BRANDING.name} <span className="italic text-brand-accent">{MUNICIPAL_BRANDING.portalName}</span>
          </div>
          <div className="text-brand-text-dim text-[11px] uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {MUNICIPAL_BRANDING.fullName} • DESIGNED by: ARTCHIE SALVA
          </div>
          <nav className="flex gap-6" aria-label="Footer links">
             <Link to="/feedback" className="nav-link text-[10px]">Contact</Link>
             <Link to="/announcements" className="nav-link text-[10px]">Legal</Link>
             <Link to="/services" className="nav-link text-[10px]">Privacy</Link>
          </nav>
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
            <Route path="/barangays" element={<Barangays />} />
            <Route path="/about" element={<About />} />
            <Route path="/officials" element={<Officials />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/services" element={<Services />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/directory/:deptId" element={<DepartmentDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/staff" element={<Announcements />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
