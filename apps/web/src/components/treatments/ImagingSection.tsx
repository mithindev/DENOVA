import React, { useEffect, useState, useCallback } from 'react';
import { 
  Camera, 
  Maximize2, 
  ExternalLink, 
  Loader2, 
  Image as ImageIcon, 
  X, 
  RefreshCcw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../../api/api.client';
import { cn } from '../../lib/utils';

interface ImagingRecord {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

interface Props {
  patientId: string;
}

export const ImagingSection: React.FC<Props> = ({ patientId }) => {
  const [images, setImages] = useState<ImagingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagingRecord | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isInverted, setIsInverted] = useState(false);

  const fetchImages = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await api.get(`/imaging/patient/${patientId}`);
      setImages(res.data);
    } catch (err) {
      console.error('Failed to fetch patient images', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchImages();
    }
  }, [patientId, fetchImages]);

  const handleSelectImage = (img: ImagingRecord) => {
    const idx = images.findIndex(i => i.id === img.id);
    setSelectedIndex(idx);
    setSelectedImage(img);
    setIsInverted(false);
  };

  const handleNext = useCallback(() => {
    if (selectedIndex < images.length - 1) {
      const nextIdx = selectedIndex + 1;
      setSelectedIndex(nextIdx);
      setSelectedImage(images[nextIdx]);
    }
  }, [selectedIndex, images]);

  const handlePrev = useCallback(() => {
    if (selectedIndex > 0) {
      const prevIdx = selectedIndex - 1;
      setSelectedIndex(prevIdx);
      setSelectedImage(images[prevIdx]);
    }
  }, [selectedIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleNext, handlePrev]);

  if (loading && images.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin mr-2" />
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading X-rays...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mt-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Camera size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Imaging & X-Rays</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchImages(true)}
            disabled={refreshing}
            className={`px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 group ${refreshing ? 'opacity-50' : ''}`}
            title="Scan for new images"
          >
            <RefreshCcw size={14} className={`text-slate-500 group-hover:text-indigo-600 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-600">
              {refreshing ? 'Scanning...' : 'Refresh'}
            </span>
          </button>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-widest">
            {images.length} Records
          </span>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="p-4 bg-white rounded-full shadow-sm">
            <ImageIcon className="text-slate-300 w-12 h-12" />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">No images found</p>
            <p className="text-[11px] text-slate-500 uppercase leading-relaxed font-medium">
              Export X-rays for this patient into the shared network folder to see them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {images.map((img) => (
            <div 
              key={img.id}
              className="group relative bg-white border border-slate-200 p-1.5 rounded-2xl overflow-hidden hover:border-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
              onClick={() => handleSelectImage(img)}
            >
              <div className="aspect-square bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src={`${api.defaults.baseURL}/imaging/${img.id}`} 
                  alt={img.fileName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
              </div>
              <div className="px-1.5 py-2">
                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{img.fileName}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(img.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xl">
                  <Maximize2 size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Pro Viewer Redesign */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-sm flex flex-col animate-in fade-in duration-500 overflow-hidden text-white">
          {/* Immersive Top Navigation */}
          <div className="flex items-center justify-between h-20 px-8 z-20 border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-5">
              <div className="hidden md:flex flex-col">
                <h4 className="text-sm font-black tracking-widest uppercase border-l-2 border-indigo-500 pl-4">{selectedImage.fileName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-4 mt-1">
                  Captured {new Date(selectedImage.createdAt).toLocaleString()} • {(selectedImage.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsInverted(!isInverted)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all",
                  isInverted ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                )}
              >
                {isInverted ? "Disable Invert" : "Invert Colors"}
              </button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-3 bg-white/5 hover:bg-red-500/20 active:bg-red-500/40 border border-white/10 rounded-2xl transition-all text-white hover:text-red-400 hover:border-red-500/30"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Main Viewer with Sticky Sides */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            {/* Left Prev Arrow */}
            <button 
              onClick={handlePrev}
              disabled={selectedIndex <= 0}
              className="absolute left-6 z-30 p-5 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white disabled:opacity-0 transition-all border border-white/5 active:scale-90"
            >
              <ArrowLeft size={32} />
            </button>

            {/* Right Next Arrow */}
            <button 
              onClick={handleNext}
              disabled={selectedIndex >= images.length - 1}
              className="absolute right-6 z-30 p-5 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white disabled:opacity-0 transition-all border border-white/5 active:scale-90"
            >
              <ArrowRight size={32} />
            </button>

            <TransformWrapper
              initialScale={1}
              centerOnInit={true}
              minScale={0.5}
              maxScale={8}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%", cursor: 'grab' }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <img 
                      src={`${api.defaults.baseURL}/imaging/${selectedImage.id}`} 
                      alt={selectedImage.fileName}
                      className={cn(
                        "max-w-[85%] max-h-[85%] object-contain transition-all duration-500 rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)]",
                        isInverted && "invert brightness-110 contrast-125"
                      )}
                    />
                  </TransformComponent>

                  {/* Floating Toolbar Sidebar */}
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                    <button onClick={() => zoomIn()} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white group" title="Zoom In">
                      <ZoomIn size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button onClick={() => zoomOut()} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white group" title="Zoom Out">
                      <ZoomOut size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="h-px bg-white/10 mx-2" />
                    <button onClick={() => resetTransform()} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white group" title="Reset View">
                      <RotateCcw size={22} className="group-hover:rotate-[-90deg] transition-transform" />
                    </button>
                    <div className="h-px bg-white/10 mx-2" />
                    <a 
                      href={`${api.defaults.baseURL}/imaging/${selectedImage.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white group"
                      title="Open in New Tab"
                    >
                      <ExternalLink size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="h-32 px-10 pb-6 pt-2 z-20 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar bg-gradient-to-t from-black/60 to-transparent">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setSelectedImage(img);
                }}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-0.5",
                  selectedIndex === idx 
                    ? "border-indigo-500 scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                    : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
                )}
              >
                <img 
                  src={`${api.defaults.baseURL}/imaging/${img.id}`} 
                  alt="thumb" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
