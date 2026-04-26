import React, { useState } from 'react';
import { Search, MapPin, Users, Building2, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface Barangay {
  name: string;
  population: string;
  slug: string;
}

const BARANGAYS: Barangay[] = [
  { name: "Bagong Silang", population: "3,362", slug: "bagong-silang" },
  { name: "Bahi", population: "1,112", slug: "bahi" },
  { name: "Cambagang", population: "1,636", slug: "cambagang" },
  { name: "Coronobe", population: "3,145", slug: "coronobe" },
  { name: "Katipunan", population: "1,662", slug: "katipunan" },
  { name: "Lahi", population: "1,279", slug: "lahi" },
  { name: "Langgawisan", population: "3,019", slug: "langgawisan" },
  { name: "Mabugnao", population: "406", slug: "mabugnao" },
  { name: "Magcagong", population: "3,417", slug: "magcagong" },
  { name: "Mahayahay", population: "663", slug: "mahayahay" },
  { name: "Mapawa", population: "5,932", slug: "mapawa" },
  { name: "Maragusan", population: "15,488", slug: "maragusan" },
  { name: "Mauswagon", population: "3,100", slug: "mauswagon" },
  { name: "New Albay", population: "4,185", slug: "new-albay" },
  { name: "New Katipunan", population: "3,009", slug: "new-katipunan" },
  { name: "New Manay", population: "1,044", slug: "new-manay" },
  { name: "New Panay", population: "1,373", slug: "new-panay" },
  { name: "Paloc", population: "1,876", slug: "paloc" },
  { name: "Pamintaran", population: "1,873", slug: "pamintaran" },
  { name: "Parasanon", population: "820", slug: "parasanon" },
  { name: "Talian", population: "1,715", slug: "talian" },
  { name: "Tandik", population: "754", slug: "tandik" },
  { name: "Tigbao", population: "1,635", slug: "tigbao" },
  { name: "Tupas", population: "1,907", slug: "tupas" },
];

const Barangays: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalPopulation = BARANGAYS.reduce((acc, curr) => {
    return acc + parseInt(curr.population.replace(/,/g, ''), 10);
  }, 0);

  const avgPopulation = Math.round(totalPopulation / BARANGAYS.length);

  const filteredBarangays = BARANGAYS.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-border pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-accent/20">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-display uppercase tracking-tight text-brand-text-bright">Local Barangays</h1>
            <p className="text-[10px] text-brand-text-dim uppercase tracking-[0.3em] font-black italic mt-1">Foundations of Maragusan Community</p>
          </div>
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="Search 24 barangays..." 
            className="w-full pl-12 pr-6 py-4 bg-brand-card border border-brand-border rounded-2xl focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search barangays"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" role="list">
            {filteredBarangays.map((barangay, idx) => (
              <motion.a
                key={barangay.slug}
                href={`/davao-de-oro/maragusan/${barangay.slug}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden bg-white border-2 border-brand-border rounded-3xl p-8 hover:border-brand-secondary hover:shadow-[0_30px_60px_-15px_rgba(234,179,8,0.2)] transition-all duration-500 block focus:ring-4 focus:ring-brand-accent/30 outline-none"
                role="listitem"
                aria-label={`${barangay.name} barangay info`}
              >
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-brand-secondary/5 rounded-full blur-2xl group-hover:bg-brand-secondary/20 transition-all duration-700" aria-hidden="true" />
                
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-accent/5 flex items-center justify-center text-brand-accent group-hover:bg-brand-secondary group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                    <MapPin size={28} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-display text-brand-text-bright group-hover:text-brand-accent transition-colors leading-tight">
                      {barangay.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="px-3 py-1 bg-brand-border/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-text-dim group-hover:bg-brand-secondary/10 group-hover:text-brand-secondary transition-colors">
                        Population
                      </div>
                      <span className="text-sm font-bold text-brand-accent group-hover:text-brand-accent transition-colors">
                        {barangay.population}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-border/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary italic">View Details</span>
                    <ArrowRight size={16} className="text-brand-secondary" aria-hidden="true" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {filteredBarangays.length === 0 && (
            <div className="py-20 text-center space-y-4" aria-live="assertive">
              <Search size={48} className="mx-auto text-slate-200" aria-hidden="true" />
              <p className="text-brand-text-dim font-medium">No barangays found matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 border-l border-brand-border pl-12 hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div className="p-6 bg-brand-card rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Advertise Here</h4>
                <p className="text-xs text-slate-400 mt-2">Promote your local business to the whole municipality.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-dim">Demographics Quick-View</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-brand-accent/5 rounded-xl border border-brand-accent/10">
                  <span className="text-xs font-bold text-brand-text-dim uppercase">Total Population</span>
                  <span className="text-lg font-display text-brand-accent">{totalPopulation.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-brand-secondary/5 rounded-xl border border-brand-secondary/10">
                  <span className="text-xs font-bold text-brand-text-dim uppercase">Avg. Population</span>
                  <span className="text-lg font-display text-brand-secondary">{avgPopulation.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-brand-card rounded-xl border border-brand-border">
                  <span className="text-xs font-bold text-brand-text-dim uppercase">Total Barangays</span>
                  <span className="text-lg font-display text-brand-text-bright">{BARANGAYS.length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Barangays;
