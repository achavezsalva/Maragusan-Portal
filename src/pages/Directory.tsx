import React, { useState, useEffect } from 'react';
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
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DEPARTMENT_CATEGORIES, DepartmentInfo } from '../constants/departments';
import OfficeMap from '../components/OfficeMap';

const Directory: React.FC = () => {
  const [dynamicDepts, setDynamicDepts] = useState<DepartmentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      const { data } = await supabase.from('departments').select('*');
      if (data) setDynamicDepts(data);
      setLoading(false);
    };

    fetchDepts();

    const channel = supabase
      .channel('directory-depts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => {
        fetchDepts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = DEPARTMENT_CATEGORIES.map(cat => {
    let icon = Landmark;
    if (cat.title === "Executive Offices") icon = Landmark;
    else if (cat.title === "Financial & Administrative") icon = Wallet;
    else if (cat.title === "Social & Public Services") icon = HeartPulse;
    else if (cat.title === "Infrastructure & Planning") icon = PencilRuler;
    else if (cat.title === "Civil & Legal Services") icon = Scale;
    else if (cat.title === "Safety & Emergency") icon = ShieldAlert;
    else if (cat.title === "Environment & Community") icon = Leaf;
    else if (cat.title === "Business & Employment") icon = TrendingUp;
    else if (cat.title === "Culture, Education & Information") icon = GraduationCap;
    
    // Mix dynamic data with category structure
    const deptsInCategory = dynamicDepts.length > 0 
      ? dynamicDepts.filter(d => cat.depts.some(staticD => staticD.id === d.id))
      : cat.depts; // Fallback to static if firestore empty (during init)

    return { ...cat, icon, deptsList: deptsInCategory };
  });

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

      {loading && dynamicDepts.length === 0 ? (
        <div className="py-20 text-center uppercase tracking-widest text-xs font-black text-brand-text-dim/50 italic animate-pulse">
          Synchronizing sector metadata...
        </div>
      ) : (
        <div className="space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <OfficeMap departments={dynamicDepts.length > 0 ? dynamicDepts : categories.flatMap(c => c.deptsList)} />
          </motion.div>

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
                {category.deptsList.map((dept, dIdx) => (
                  <li key={dIdx}>
                    <Link 
                      to={`/directory/${dept.id}`}
                      className="group/item flex items-start gap-3 text-sm text-brand-text-dim hover:text-brand-accent transition-all font-medium leading-tight p-2 -ml-2 rounded-lg hover:bg-brand-secondary/10"
                    >
                      <div className="mt-1.5 w-1 h-1 bg-brand-border rounded-full group-hover/item:bg-brand-accent transition-colors shrink-0"></div>
                      <span className="group-hover/item:translate-x-1 transition-transform">{dept.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
