import React from 'react';
import { 
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
import { motion } from 'motion/react';

const Directory: React.FC = () => {
  const categories = [
    {
      title: "Executive Offices",
      icon: Landmark,
      depts: ["Office of the Mayor", "Office of the Vice Mayor", "Sangguniang Bayan (Legislative Council)"]
    },
    {
      title: "Financial & Administrative",
      icon: Wallet,
      depts: ["Municipal Treasurer’s Office", "Municipal Budget Office", "Municipal Accounting Office", "Municipal Assessor’s Office"]
    },
    {
      title: "Social & Public Services",
      icon: HeartPulse,
      depts: ["Municipal Health Office (MHO)", "Municipal Social Welfare and Development Office (MSWDO)", "Municipal Agriculture Office (MAO)"]
    },
    {
      title: "Infrastructure & Planning",
      icon: PencilRuler,
      depts: ["Municipal Engineering Office", "Municipal Planning and Development Office (MPDO)"]
    },
    {
      title: "Civil & Legal Services",
      icon: Scale,
      depts: ["Municipal Civil Registrar’s Office", "Municipal Legal Office"]
    },
    {
      title: "Safety & Emergency",
      icon: ShieldAlert,
      depts: ["Municipal Disaster Risk Reduction and Management Office (MDRRMO)", "Bureau of Fire Protection (BFP) – Local Station", "Philippine National Police (PNP) – Local Station"]
    },
    {
      title: "Environment & Community",
      icon: Leaf,
      depts: ["Municipal Environment and Natural Resources Office (MENRO)"]
    },
    {
      title: "Business & Employment",
      icon: TrendingUp,
      depts: ["Business Permits and Licensing Office (BPLO)", "Public Employment Service Office (PESO)"]
    },
    {
      title: "Culture, Education & Information",
      icon: GraduationCap,
      depts: ["Municipal Tourism Office", "Municipal Information Office", "Library Services (if available)"]
    }
  ];

  return (
    <div className="space-y-16 py-10">
      <div className="flex items-center gap-6 border-b border-brand-border pb-8">
        <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-accent/20" aria-hidden="true">
          <Building size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tight text-brand-text-bright">Municipal Directory</h1>
          <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.3em] font-black italic mt-1">Institutional Governance & Administrative Map</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list" aria-label="Department categories">
        {categories.map((category, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ 
              delay: idx * 0.05,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="glass-card p-8 group hover:border-brand-secondary hover:border-2 hover:bg-brand-secondary/10 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300"
            role="listitem"
          >
            <div className="flex items-center gap-3 mb-6">
               <category.icon className="text-brand-accent transition-all" size={24} strokeWidth={1.5} aria-hidden="true" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-text-bright">{category.title}</h3>
            </div>
            <ul className="space-y-3" aria-label={`${category.title} departments`}>
              {category.depts.map((dept, dIdx) => (
                <li key={dIdx} className="flex items-start gap-3 text-sm text-brand-text-dim hover:text-brand-accent transition-colors font-medium leading-tight cursor-default">
                  <div className="mt-1.5 w-1 h-1 bg-brand-border rounded-full group-hover:bg-brand-accent transition-colors"></div>
                  {dept}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Directory;
