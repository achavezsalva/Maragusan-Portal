import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Shield, 
  Star,
  Share2,
  Bookmark,
  Clock,
  ChevronRight,
  X,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, departments(name)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost(data);

        // Fetch other recent news for sidebar
        const { data: recent } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_municipal', true)
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        setRecentNews(recent || []);
      } catch (err) {
        console.error("Fetch error:", err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-text-dim">Retrieving Official Record...</p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const allImages = [
    ...(post.image_url ? [post.image_url] : []),
    ...(post.images || []).filter((url: string) => url && url.trim() !== '')
  ];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + 1) % allImages.length
    }));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightbox(prev => ({
      ...prev,
      index: (prev.index - 1 + allImages.length) % allImages.length
    }));
  };

  return (
    <div className="bg-[#f4f7f9] min-h-screen pb-32">
      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightbox.open && allImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setLightbox({ ...lightbox, open: false })}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-10 p-2 hover:bg-white/10 rounded-full"
              onClick={() => setLightbox({ ...lightbox, open: false })}
            >
              <X size={32} />
            </button>

            {allImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-10 p-4 hover:bg-white/10 rounded-full"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={48} />
                </button>
                <button 
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-10 p-4 hover:bg-white/10 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight size={48} />
                </button>
              </>
            )}

            <div className="relative max-w-7xl max-h-[90vh] flex flex-col items-center gap-6 cursor-default" onClick={e => e.stopPropagation()}>
              <motion.img 
                key={lightbox.index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={allImages[lightbox.index]} 
                alt="Enlarged view" 
                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
              />
              {allImages.length > 1 && (
                <div className="flex items-center gap-4 py-2 px-6 bg-white/10 rounded-full border border-white/10">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    IMAGE {lightbox.index + 1} OF {allImages.length}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Editorial Header */}
      <div className="bg-white border-b border-brand-border pt-32 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-text-dim hover:text-brand-accent transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Home Portal
            </Link>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 py-1 px-3 bg-brand-accent/10 rounded-lg text-brand-accent text-[10px] font-black uppercase tracking-widest border border-brand-accent/20">
                  <Star size={12} fill="currentColor" />
                  MUNICIPAL_NEWS_ENTRY
                </div>
                <div className="h-px flex-1 bg-brand-border" />
              </div>

              <h1 className="text-4xl md:text-6xl font-display leading-[1.1] tracking-tight uppercase text-slate-900">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-brand-text-dim pt-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-brand-accent" />
                  {post.created_at ? format(new Date(post.created_at), 'MMMM d, yyyy') : 'Recently Published'}
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-brand-accent" />
                  {post.departments?.name || 'Municipal Information Office'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-brand-accent" />
                  3 MIN READ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom mt-12">
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Main Article */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-brand-border overflow-hidden"
            >
              {/* Main Image / Gallery */}
              {allImages.length > 0 && (
                <div className="space-y-4 mb-12">
                  {post.image_url && (
                    <div 
                      className="w-full rounded-2xl overflow-hidden shadow-inner border border-brand-border bg-slate-50 flex items-center justify-center cursor-zoom-in group relative"
                      onClick={() => setLightbox({ open: true, index: 0 })}
                    >
                      <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[600px] object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="px-4 py-2 bg-white/90 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl">Click to Enlarge</div>
                      </div>
                    </div>
                  )}
                  
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {post.images.filter((url: string) => url && url.trim() !== '').map((url: string, index: number) => {
                        const actualIndex = post.image_url ? index + 1 : index;
                        return (
                          <div 
                            key={index} 
                            className="aspect-video rounded-xl overflow-hidden border border-brand-border shadow-sm group cursor-zoom-in hover:border-brand-accent transition-all relative"
                            onClick={() => setLightbox({ open: true, index: actualIndex })}
                          >
                            <img 
                              src={url} 
                              alt={`${post.title} - Gallery ${index + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="prose prose-slate prose-lg max-w-none">
                <div className="text-slate-700 leading-relaxed font-normal whitespace-pre-wrap text-lg md:text-xl selection:bg-brand-accent/20">
                  {post.content}
                </div>
              </div>

              <div className="mt-16 pt-12 border-t border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border border-brand-border flex items-center justify-center bg-brand-accent/5">
                    <Shield size={24} className="text-brand-accent" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-dim">Official Release</div>
                    <div className="text-base font-bold text-slate-900">Maragusan Municipal Government</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-3 rounded-xl border border-brand-border text-brand-text-dim hover:text-brand-accent transition-all">
                    <Share2 size={18} />
                  </button>
                  <button className="p-3 rounded-xl border border-brand-border text-brand-text-dim hover:text-brand-accent transition-all">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-brand-border space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 border-b border-brand-border pb-4">
                Other Recent News
              </h3>
              
              <div className="space-y-8">
                {recentNews.length > 0 ? recentNews.map((news) => (
                  <Link 
                    key={news.id} 
                    to={`/news/${news.id}`}
                    className="group block space-y-3"
                  >
                    <div className="text-[9px] font-black text-brand-accent uppercase tracking-widest">
                      {news.created_at ? format(new Date(news.created_at), 'dd MMM yyyy') : 'Recent'}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-accent transition-colors line-clamp-2 uppercase leading-tight">
                      {news.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-brand-text-dim opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                      Read Article <ChevronRight size={10} />
                    </div>
                  </Link>
                )) : (
                  <p className="text-[10px] font-medium italic text-brand-text-dim">No older entries found.</p>
                )}
              </div>
            </div>

            <div className="bg-brand-accent rounded-3xl p-8 text-white space-y-4">
              <Star size={24} fill="white" />
              <h3 className="text-xl font-display uppercase tracking-tight leading-tight">
                Get Notified on <br />Municipal Updates
              </h3>
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                Stay connected with the latest briefings and official announcements from the Local Government Unit.
              </p>
              <button className="w-full bg-white text-brand-accent py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                Subscribe to Bulletin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
