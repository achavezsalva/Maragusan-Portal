import React from 'react';
import { motion } from 'motion/react';
import { 
  Mountain, 
  Map, 
  History, 
  Users,
  ChevronRight,
  Wind,
  Coffee,
  Waves,
  ShieldCheck
} from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[70vh] -mt-10 -mx-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/about-img/about-maragusan.png" 
            alt="Maragusan Highlands Panoramic" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-brand-bg"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-6 px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary/20 backdrop-blur-md rounded-full border border-brand-secondary/30 text-brand-secondary text-[10px] font-black uppercase tracking-[0.2em]">
              <Mountain size={12} aria-hidden="true" />
              The Summer Capital of Davao de Oro
            </div>
            <h1 className="text-5xl md:text-8xl font-display text-white tracking-tight leading-none uppercase">
              About <span className="italic text-brand-secondary">Maragusan.</span>
            </h1>
            <p className="text-slate-200 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic border-l-2 border-brand-accent/50 pl-6">
              "A Highland Escape of Waterfalls, Hot Springs, and Coffee Farms"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-6 space-y-40">
        
        {/* Overview Row */}
        <section className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:-rotate-1">
              <img 
                src="/about-img/about-maragusan.png" 
                alt="Maragusan Overview" 
                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-accent/5 mix-blend-multiply"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-secondary rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-accent uppercase font-black tracking-[0.3em] text-[10px]">
                <ChevronRight size={14} />
                Overview
              </div>
              <h2 className="text-4xl md:text-6xl font-display leading-tight tracking-tighter">
                The Summer Capital <br />
                <span className="italic font-light text-brand-secondary">of Davao de Oro</span>
              </h2>
            </div>
            <div className="space-y-6 text-brand-text-dim leading-relaxed text-lg lg:text-xl font-light">
              <p>
                Nestled in the cool highlands of Davao de Oro, Maragusan is famous for its breathtaking waterfalls, lush rainforests, and thriving coffee plantations. 
              </p>
              <p>
                Often called the <span className="text-brand-text-bright font-black italic">"Summer Capital of Davao de Oro"</span>, this picturesque town offers a refreshing retreat from the tropical heat, making it a paradise for nature lovers, adventure seekers, and eco-tourists.
              </p>
            </div>
            <div className="flex gap-10 pt-4 border-t border-brand-border">
               <div className="flex flex-col gap-2">
                  <Wind className="text-brand-accent" size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Cool Climate</span>
               </div>
               <div className="flex flex-col gap-2">
                  <Waves className="text-brand-accent" size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Waterfalls</span>
               </div>
               <div className="flex flex-col gap-2">
                  <Coffee className="text-brand-accent" size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Coffee Farms</span>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Geography Row */}
        <section className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-accent uppercase font-black tracking-[0.3em] text-[10px]">
                <ChevronRight size={14} />
                Geography & Area
              </div>
              <h2 className="text-4xl md:text-6xl font-display leading-tight tracking-tighter">
                A Highland Gem <br />
                <span className="italic font-light text-brand-secondary">with Verdant Valleys</span>
              </h2>
            </div>
            <div className="space-y-6 text-brand-text-dim leading-relaxed text-lg lg:text-xl font-light">
              <p className="font-bold text-brand-text-bright italic decoration-brand-accent/30 underline decoration-2 underline-offset-4">
                Exploring 400+ Square Kilometers of Scenic Landscapes
              </p>
              <p>
                Maragusan spans over 400 square kilometers, boasting fertile valleys, dense forests, and misty mountain ranges. Located at a higher elevation, the town enjoys cool temperatures year-round, making it ideal for agriculture, eco-tourism, and adventure activities. 
              </p>
              <p>
                The municipality is home to several river systems, hot springs, and waterfalls, all contributing to its pristine natural beauty.
              </p>
            </div>
            <div className="pt-6">
              <div className="inline-flex items-center gap-6 bg-slate-50 border border-brand-border px-10 py-6 rounded-3xl shadow-xs">
                 <Map className="text-brand-accent" size={32} strokeWidth={1} aria-hidden="true" />
                 <div>
                    <div className="text-3xl font-display">400+ <span className="text-sm italic text-brand-text-dim">km²</span></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Total Land Area</div>
                 </div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[16px] border-white ring-1 ring-brand-border group transition-transform duration-700 group-hover:rotate-1">
              <img 
                src="/about-img/dense-forest.png" 
                alt="Maragusan Geography" 
                className="w-full h-auto transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </section>

        {/* History Row */}
        <section className="space-y-12 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 text-brand-accent uppercase font-black tracking-[0.3em] text-[10px]">
                <ChevronRight size={14} />
                Brief History
              </div>
              <h2 className="text-4xl md:text-6xl font-display leading-tight tracking-tighter">
                From a Tribal Homeland <br />
                <span className="italic font-light text-brand-secondary">to an Ecotourism Haven</span>
              </h2>
            </div>
            <div className="space-y-6 text-brand-text-dim leading-relaxed text-lg lg:text-xl font-light max-w-3xl mx-auto">
              <p className="font-bold text-brand-text-bright italic">
                Preserving Traditions While Embracing Progress
              </p>
              <p>
                Maragusan was once inhabited by the <span className="font-bold underline decoration-brand-secondary decoration-2 underline-offset-4">Mansaka</span> and <span className="font-bold underline decoration-brand-secondary decoration-2 underline-offset-4">Mandaya</span> indigenous groups, who lived harmoniously with nature. 
              </p>
              <p>
                As settlers from other regions arrived, the town developed into an agricultural center known for its coffee, cacao, and banana plantations. Over time, Maragusan's eco-tourism potential gained recognition, leading to the preservation of its natural wonders and indigenous heritage.
              </p>
            </div>
            <div className="flex items-center gap-4 py-4 px-6 bg-brand-bg/50 border border-brand-border rounded-2xl w-fit mx-auto">
               <History size={20} className="text-brand-accent" aria-hidden="true" />
               <span className="text-[10px] font-black uppercase tracking-widest">Heritage Conservation</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-video border border-brand-border max-w-4xl mx-auto">
              <img 
                src="/about-img/Agriculture.png" 
                alt="Maragusan History" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-tr from-brand-accent/20 to-transparent"></div>
            </div>
          </motion.div>
        </section>

        {/* Demographics Row */}
        <section className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-brand-accent uppercase font-black tracking-[0.3em] text-[10px]">
                <ChevronRight size={14} />
                Demographics & Language
              </div>
              <h2 className="text-4xl md:text-6xl font-display leading-tight tracking-tighter">
                A Blend of Indigenous <br />
                <span className="italic font-light text-brand-secondary">and Migrant Cultures</span>
              </h2>
            </div>
            <div className="space-y-6 text-brand-text-dim leading-relaxed text-lg lg:text-xl font-light">
              <p className="font-bold text-brand-text-bright italic border-b-2 border-brand-accent/30 pb-2 w-fit">
                Where Bisaya, Mansaka, and Tagalog Coexist
              </p>
              <p>
                Maragusan is home to a diverse population, including Cebuano (Bisaya) speakers, Mansaka and Mandaya indigenous groups, and migrant settlers from Luzon and the Visayas. 
              </p>
              <p>
                Tagalog and English are widely spoken, ensuring easy communication for tourists and business visitors who seek to explore the heart of our highlands.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {['Bisaya', 'Mansaka', 'Mandaya', 'Tagalog', 'English'].map((lang) => (
                  <div key={lang} className="flex items-center gap-3 px-6 py-3 bg-white border border-brand-border rounded-2xl text-xs font-bold text-brand-text-bright shadow-xs hover:border-brand-accent transition-colors cursor-default">
                     <Users size={14} className="text-brand-accent" aria-hidden="true" />
                     {lang}
                  </div>
               ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-brand-border group">
              <img 
                src="/about-img/tribes.png" 
                alt="Maragusan Culture" 
                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </section>

        {/* Travel Tips / Natural Wonders Section */}
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-block px-4 py-1 bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
              Traveler's Guide
            </div>
            <h2 className="text-4xl md:text-6xl font-display leading-tight tracking-tighter">
              Must-Visit <span className="italic text-brand-secondary">Highland Wonders</span>
            </h2>
            <p className="text-brand-text-dim text-lg font-light">
              Carefully curated experiences that define the spirit of Maragusan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10" role="list" aria-label="Natural Wonders of Maragusan">
            {[
              {
                title: "Tagbibinta Falls",
                desc: "One of the most popular waterfalls, featuring a majestic 7-tier cascade and crystalline natural pools perfect for a refreshing dip.",
                img: "/about-img/tagbibinta.png",
                icon: <Waves size={20} className="text-brand-accent" aria-hidden="true" />
              },
              {
                title: "Aguakan Cold Spring Resort",
                desc: "Aguacan Cold Spring Resort in Maragusan, Davao de Oro, is a scenic mountain retreat known for its Olympic-size pool filled with crystal-clear, refreshing, and very cold water sourced from natural springs.",
                img: "/about-img/aguakan-inland-resort.png",
                icon: <Waves size={20} className="text-brand-accent" aria-hidden="true" />
              },
              {
                title: "Marangig Falls",
                desc: "A hidden gem for the adventurous, surrounded by ancient lush forests and pristine trekking trails that lead to serenity.",
                img: "/about-img/marangig.png",
                icon: <Wind size={20} className="text-brand-accent" aria-hidden="true" />
              },
              {
                title: "Kanlawig Hot Springs",
                desc: "Rejuvenate your soul in our therapeutic geothermal springs, a relaxing escape nestled deep within nature's warm embrace.",
                img: "/about-img/kanlawig.png",
                icon: <Waves size={20} className="text-brand-accent" aria-hidden="true" />
              },
              {
                title: "Mount Candalaga",
                desc: "For the determined spirits, this peak offers a challenging yet immensely rewarding hike with breathtaking panoramic views of the valley.",
                img: "/about-img/mt-candalaga.png",
                icon: <Mountain size={20} className="text-brand-accent" aria-hidden="true" />
              },
              {
                title: "Banana Plantation",
                desc: "Maragusan, known as the Banana Capital of Davao de Oro,features extensive high-elevation plantations covering roughly 1,200 hectares that yield ~15,000 metric tons of Cavendish bananas annually.",
                img: "/about-img/banana-plantation.png",
                icon: <Coffee size={20} className="text-brand-accent" aria-hidden="true" />
              }
            ].map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col bg-white border border-brand-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-brand-accent/30 transition-all duration-500"
                role="listitem"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={tip.img} 
                    alt={tip.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-bg/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                    {tip.icon}
                  </div>
                </div>
                <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-display leading-tight">{tip.title}</h3>
                    <p className="text-brand-text-dim text-sm leading-relaxed font-light">
                      {tip.desc}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-brand-border mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-accent group-hover:gap-4 transition-all">
                      Learn More <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      {/* Closing Statement */}
      <section className="relative px-6 py-48 overflow-hidden bg-brand-bg border-t border-brand-border">
        <div className="absolute inset-0 z-0 opacity-30 grayscale mix-blend-overlay">
          <img src="/about-img/about-maragusan.png" className="w-full h-full object-cover" alt="Background" referrerPolicy="no-referrer" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <ShieldCheck className="mx-auto text-brand-accent" size={80} strokeWidth={0.5} aria-hidden="true" />
          <h2 className="text-4xl md:text-7xl font-display text-brand-text-bright leading-tight tracking-tighter">
            Rooted in <span className="italic">Heritage,</span> <br /> 
            Soaring Toward <span className="text-brand-secondary decoration-brand-accent underline decoration-4 underline-offset-8">Excellence.</span>
          </h2>
          <p className="text-brand-text-dim text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed">
            Maragusan is more than just a destination; it's a testament to the enduring bond between people and the mountains.
          </p>
          <div className="pt-12">
            <div className="inline-block px-10 py-4 bg-brand-accent text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-xl hover:bg-brand-accent/90 transition-colors cursor-pointer">
              Explore Our Highland Home
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
