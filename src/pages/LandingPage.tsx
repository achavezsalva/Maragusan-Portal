import React from 'react';
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
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HERO_SLIDES = [
  '/slide1.jpg.jpg',
  '/slide2.jpg.jpg',
  '/slide3.jpg.jpg',
  '/slide4.jpg.jpg',
  '/slide5.jpg.jpg',
  '/slide6.jpg.jpg',
  '/slide7.jpg.jpg',
  '/slide8.jpg.jpg',
  '/slide9.jpg.jpg',
  '/slide10.jpg.jpg',
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative -mt-24 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Slideshow with Overlay */}
        <div className="absolute inset-0 z-0">
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
              <Shield size={12} className="text-brand-secondary" />
              Official Municipal Interface
            </div>
            <h1 className="text-6xl md:text-8xl font-display leading-[1] tracking-tight text-white drop-shadow-2xl">
              Governance with <br />
              <span className="italic text-brand-secondary font-light">Excellence.</span>
            </h1>
            <p className="text-slate-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Access the digital heart of Maragusan. Our unified portal streamlines administrative 
              services and fosters absolute transparency for bawat mamamayan.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
            <button onClick={() => navigate('/directory')} className="btn-primary px-10 py-5 text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 mx-auto shadow-2xl">
              Explore Institutional Directory
              <ArrowRight size={18} />
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
                src="/municipal_hall.jpg.jpg" 
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
                  <Landmark className="text-brand-accent" size={24} />
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-text-bright">Modern Offices</div>
                  <p className="text-[10px] text-brand-text-dim leading-tight">Equipped with digital infrastructure for efficient processing.</p>
                </div>
                <div className="p-6 bg-slate-50 border border-brand-border rounded-2xl space-y-2">
                  <Shield className="text-brand-accent" size={24} />
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-text-bright">Public Hub</div>
                  <p className="text-[10px] text-brand-text-dim leading-tight">Designed to be accessible and welcoming to every Maraguseno.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 border-y border-brand-border py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="font-display text-5xl mb-2 text-brand-accent">24/7</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-text-dim font-bold">Uptime Guarantee</div>
          </div>
          <div>
            <div className="font-display text-5xl mb-2 text-brand-accent">12ms</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-text-dim font-bold">Response Latency</div>
          </div>
          <div>
            <div className="font-display text-5xl mb-2 text-brand-accent">99%</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-text-dim font-bold">Digital Adoption</div>
          </div>
          <div>
            <div className="font-display text-5xl mb-2 text-brand-accent">0</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-text-dim font-bold">System Downtime</div>
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
