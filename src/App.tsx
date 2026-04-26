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
import Barangays from './pages/Barangays';
import About from './pages/About';
import Officials from './pages/Officials';
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
        className="relative group h-full flex items-center"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      >
        <button 
          className={`nav-link flex items-center gap-1.5 py-4 ${isActive ? 'active' : ''}`}
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
                  className="block px-6 py-3 text-[11px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-accent hover:bg-white/5 transition-all focus:bg-white/5 focus:outline-none focus:text-brand-accent"
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
      <Link to={to || '#'} className={`nav-link py-4 ${isActive ? 'active' : ''}`}>
        {label}
      </Link>
    </div>
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

      <nav 
        className="h-20 bg-brand-bg border-b border-brand-border sticky top-0 z-50 px-10 flex items-center justify-between"
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-4 group shrink-0" aria-label={`Home - ${MUNICIPAL_BRANDING.name}`}>
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
        <div className="hidden lg:flex items-center h-full gap-4 xl:gap-6">
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
          <ul className="flex items-center gap-2 lg:gap-4" role="list">
            <li className="hidden sm:block">
              <button 
                className="p-2.5 text-brand-text-dim hover:text-brand-accent transition-all cursor-pointer bg-white/5 rounded-lg border border-transparent hover:border-brand-border"
                aria-label="Search portal content"
              >
                <Search size={18} strokeWidth={1.5} aria-hidden="true" />
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
            © {new Date().getFullYear()} {MUNICIPAL_BRANDING.fullName} • Digital Integrity Guaranteed
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/staff" element={<Announcements />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
