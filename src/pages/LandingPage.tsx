import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Bell, 
  MessageSquare, 
  ArrowRight, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  Building,
  Landmark,
  Wallet,
  HeartPulse,
  PencilRuler,
  Scale,
  ShieldAlert,
  Leaf,
  TrendingUp,
  GraduationCap,
  Megaphone,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const HERO_SLIDES = [
  '/img/slide1.jpg.jpg',
  '/img/slide2.jpg.jpg',
  '/img/slide3.jpg.jpg',
  '/img/slide4.jpg.jpg',
  '/img/slide5.jpg.jpg',
  '/img/slide6.jpg.jpg',
  '/img/slide7.jpg.jpg',
  '/img/slide8.jpg.jpg',
  '/img/slide9.jpg.jpg',
  '/img/slide10.jpg.jpg',
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_municipal', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error("News fetch error:", error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();

    // Set up real-time subscription
    const channel = supabase
      .channel('announcements-news')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'announcements', 
        filter: 'is_municipal=eq.true' 
      }, () => {
        fetchNews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section 
        className="relative -mt-24 overflow-hidden min-h-[90vh] flex items-center"
        aria-roledescription="carousel"
        aria-label="Maragusan Highlights Slideshow"
      >
        {/* Background Slideshow with Overlay */}
        <div className="absolute inset-0 z-0" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentSlide}
              src={HERO_SLIDES[currentSlide]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              alt={`Maragusan Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Remove fallback to generated picture
                (e.target as HTMLImageElement).className = 'hidden';
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-white/90"></div>
        </div>

        <div className="relative z-10 w-full pt-32 pb-16 text-center space-y-10 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
              <Shield size={12} className="text-brand-secondary" aria-hidden="true" />
              Official Municipal Interface
            </div>
            <h1 className="text-6xl md:text-8xl font-display leading-[1] tracking-tight text-white drop-shadow-2xl">
              Governance with <br />
              <span className="italic text-brand-secondary font-light">Excellence.</span>
            </h1>
            <p className="text-slate-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Access the digital heart of Maragusan. Our unified portal streamlines administrative 
              services and fosters absolute transparency for every <span className="text-brand-secondary text-2xl md:text-3xl font-black italic inline-block transform hover:scale-110 transition-transform cursor-default ml-1">MARAGUSANON</span>
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
            <button 
              onClick={() => navigate('/directory')} 
              className="btn-primary px-10 py-5 text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 mx-auto shadow-2xl focus:ring-4 focus:ring-brand-accent/50 outline-none"
              aria-label="Explore Institutional Directory"
            >
              Explore Institutional Directory
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Landmark Section */}
      <section className="relative px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group"
            >
              <img 
                src="/img/municipal_hall.jpg.jpg" 
                alt="Maragusan Municipal Hall" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent flex items-end p-8">
                <div className="text-white drop-shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-brand-secondary italic shadow-black/50">Architectural Milestone</div>
                  <h3 className="text-2xl font-display text-white">Municipal Hall of Maragusan</h3>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-display leading-tight">
                  The Center of <br />
                  <span className="italic text-brand-accent">Public Service.</span>
                </h2>
                <p className="text-brand-text-dim text-lg leading-relaxed">
                  Our modern Municipal Hall stands as a symbol of our commitment to transparent 
                  governance and progressive development. It serves as the primary hub for administrative 
                  excellence, connecting every citizen to the services they need.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-slate-50 border border-brand-border rounded-2xl space-y-2">
                  <Landmark className="text-brand-accent" size={24} aria-hidden="true" />
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-text-bright">Modern Offices</div>
                  <p className="text-[10px] text-brand-text-dim leading-tight">Equipped with digital infrastructure for efficient processing.</p>
                </div>
                <div className="p-6 bg-slate-50 border border-brand-border rounded-2xl space-y-2">
                  <Shield className="text-brand-accent" size={24} aria-hidden="true" />
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-text-bright">Public Hub</div>
                  <p className="text-[10px] text-brand-text-dim leading-tight">Designed to be accessible and welcoming to every Maraguseno.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Municipal News & Activities */}
      <section className="px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full border border-brand-accent/20 text-brand-accent text-[9px] font-black uppercase tracking-[0.2em]">
                <Megaphone size={12} /> Live Updates
              </div>
              <h2 className="text-4xl md:text-6xl font-display uppercase tracking-tight leading-none">
                Official <br />
                <span className="italic text-brand-secondary font-light">News & Update.</span>
              </h2>
            </div>
            <Link 
              to="/announcements" 
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-accent transition-colors group"
            >
              See All Publication Briefings 
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-brand-border rounded-[2rem] overflow-hidden">
            {loadingNews ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-50 border-r last:border-r-0 border-brand-border animate-pulse" />
              ))
            ) : news.length > 0 ? (
              news.map((item, idx) => (
                <motion.article 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex flex-col p-10 bg-white border-r last:border-r-0 border-brand-border hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/announcements')}
                >
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono font-medium py-1 px-2 bg-slate-100 rounded text-brand-text-dim uppercase tracking-wider">
                        {item.created_at ? format(new Date(item.created_at), 'yyyy.MM.dd') : 'RECENT_ENTRY'}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
                    </div>
                    <h3 className="text-2xl font-display tracking-tight leading-[1.1] group-hover:text-brand-accent transition-colors line-clamp-2 uppercase">
                      {item.title}
                    </h3>
                    <p className="text-sm text-brand-text-dim leading-relaxed line-clamp-4 font-medium italic opacity-70">
                      {item.content}
                    </p>
                  </div>
                  <div className="pt-8 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent flex items-center gap-2">
                       READ_NEWS <ArrowRight size={12} />
                    </span>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-3 py-32 text-center bg-slate-50">
                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-brand-text-dim">
                  NO ACTIVE NEWS & UPDATE AT THIS_TIME
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Municipal Stats Section */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto border-y border-brand-border py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 divide-x-0 md:divide-x divide-brand-border text-center">
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-display text-brand-accent">24.</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Official Departments</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-display text-brand-accent">100%</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Data Transparency</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-display text-brand-accent">24/7.</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Digital Access</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-display text-brand-accent">99.</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Service Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
  

      {/* Contact Section */}
      <section className="px-6 py-20 flex flex-col items-center text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-display italic">At your service.</h2>
          <p className="text-brand-text-dim max-w-lg">Our physical offices remain open for specialized assistance.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10">
          <div className="flex items-center gap-4 text-sm font-medium">
            <MapPin size={18} className="text-brand-accent" />
            Municipal Hall, Maragusan
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Phone size={18} className="text-brand-accent" />
            (082) 234-5678
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Mail size={18} className="text-brand-accent" />
            contact@maragusan.gov.ph
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
