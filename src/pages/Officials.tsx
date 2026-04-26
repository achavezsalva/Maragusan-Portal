import React from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, ChevronRight, Gavel, Award } from 'lucide-react';

const Officials = () => {
  const mayor = {
    name: "Hon. Cesar Clarion Colina Sr.",
    position: "Municipal Mayor",
    img: "/officials-img/mayor-colina.png",
    description: "Leading Maragusan towards a legacy of progress, transparency, and sustainable growth."
  };

  const viceMayor = {
    name: "Hon. Osberht Yanong",
    position: "Municipal Vice Mayor",
    img: "", // Placeholder for now
    description: "Presiding over the legislative body to ensure laws that protect and empower every Maragusanon."
  };

  const councilors = [
    { name: "Hon. Rey Mantog", position: "SB Member" },
    { name: "Hon. Wewe Anino", position: "SB Member" },
    { name: "Hon. Obet Gran", position: "SB Member" },
    { name: "Hon. Maricel Colina-Vendiola", position: "SB Member" },
    { name: "Hon. Myra Kap Colina", position: "SB Member" },
    { name: "Hon. Tata Albarico", position: "SB Member" },
    { name: "Hon. Larry Bunyogan", position: "SB Member" },
    { name: "Hon. Keith Yanong", position: "SB Member" }
  ];

  const [mayorImgError, setMayorImgError] = React.useState(false);
  const [vmImgError, setVmImgError] = React.useState(false);

  return (
    <div className="min-h-screen bg-brand-bg pt-10 pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        
        {/* Header Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-full"
          >
            <ShieldCheck size={14} className="text-brand-accent" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">
              Official Leadership 2022 - 2025
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display leading-[0.9] tracking-tighter"
          >
            The Faces of <br />
            <span className="italic font-light text-brand-secondary">Maragusan Governance</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-brand-text-dim text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed"
          >
            Dedicated public servants working in harmony to serve the highlands and its people.
          </motion.p>
        </section>

        {/* Executive Tier */}
        <section className="space-y-12">
          {/* Mayor - Top Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative group max-w-3xl mx-auto"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-accent/5 blur-3xl rounded-full group-hover:bg-brand-accent/10 transition-all duration-700"></div>
            <div className="relative p-12 bg-white border border-brand-border rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-brand-accent/10">
                <Award size={120} aria-hidden="true" />
              </div>
              <div className="flex flex-col items-center gap-10 text-center relative z-10">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] bg-brand-bg overflow-hidden flex items-center justify-center border-2 border-brand-border group-hover:border-brand-accent/30 transition-all shadow-inner relative">
                  {mayor.img && !mayorImgError ? (
                    <img 
                      src={mayor.img} 
                      alt={`Portrait of ${mayor.name}`} 
                      onError={() => setMayorImgError(true)}
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={120} className="text-brand-accent/20" aria-hidden="true" />
                  )}
                </div>
                <div className="space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center justify-center gap-2 text-brand-accent">
                    <ShieldCheck size={18} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{mayor.position}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display leading-tight">{mayor.name}</h2>
                  <p className="text-brand-text-dim font-light leading-relaxed">{mayor.description}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Vice Mayor - Below Top Box */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative group max-w-2xl mx-auto"
          >
            <div className="relative p-10 bg-brand-bg border border-brand-border rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="flex flex-col items-center gap-8 text-center relative z-10">
                <div className="w-32 h-32 rounded-3xl bg-white overflow-hidden flex items-center justify-center border border-brand-border group-hover:border-brand-secondary/30 transition-all shadow-inner">
                  {viceMayor.img && !vmImgError ? (
                    <img 
                      src={viceMayor.img} 
                      alt={`Portrait of ${viceMayor.name}`} 
                      onError={() => setVmImgError(true)}
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={48} className="text-brand-secondary/40" aria-hidden="true" />
                  )}
                </div>
                <div className="space-y-3 max-w-lg mx-auto">
                  <div className="flex items-center justify-center gap-2 text-brand-secondary">
                    <Gavel size={16} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{viceMayor.position}</span>
                  </div>
                  <h3 className="text-3xl font-display leading-tight">{viceMayor.name}</h3>
                  <p className="text-brand-text-dim text-sm font-light leading-relaxed italic">{viceMayor.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Legislative Tier - Sangguniang Bayan */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-display">Sangguniang Bayan <span className="italic text-brand-accent font-light">Members</span></h3>
            <div className="h-1 w-24 bg-brand-accent/20 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {councilors.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative h-full"
                role="listitem"
              >
                <div className="p-8 bg-white border border-brand-border rounded-[2rem] hover:border-brand-accent/30 hover:shadow-xl transition-all duration-500 h-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-brand-bg rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User size={32} className="text-brand-text-dim/30" aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-display leading-tight mb-2 flex-grow">{member.name}</h4>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent/60">
                    {member.position}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <section className="pt-20 text-center">
           <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim/50">
             <span>Service through Transparency</span>
             <div className="w-1 h-1 bg-brand-border rounded-full"></div>
             <span>Unity through Progress</span>
           </div>
        </section>

      </div>
    </div>
  );
};

export default Officials;
