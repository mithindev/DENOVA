import React, { useEffect, useState, useCallback } from 'react';
import { Camera, Maximize2, ExternalLink, Loader2, Image as ImageIcon, X, RefreshCcw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../../api/api.client';

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
            className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 group ${refreshing ? 'opacity-50' : ''}`}
            title="Scan for new images"
          >
            <RefreshCcw size={14} className={`text-slate-500 group-hover:text-indigo-600 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-600">
              {refreshing ? 'Scanning...' : 'Refresh'}
            </span>
          </button>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
            {images.length} Images Found
          </span>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center space-y-2">
          <ImageIcon className="text-slate-300 w-10 h-10" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No X-rays uploaded yet</p>
          <p className="text-[10px] text-slate-400 uppercase">Export images for this patient's OP number into the shared folder</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div 
              key={img.id}
              className="group relative bg-white border-2 border-slate-100 rounded-xl overflow-hidden hover:border-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => setSelectedImage(img)}
            >
              <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                <img 
                  src={`${api.defaults.baseURL}/imaging/${img.id}`} 
                  alt={img.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
              </div>
              <div className="p-2 bg-white">
                <p className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-tight">{img.fileName}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(img.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-lg">
                  <Maximize2 size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Pro Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-300">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 md:p-6 text-white border-b border-white/10 backdrop-blur-md bg-black/40 z-10">
            <div>
              <h4 className="text-base md:text-lg font-bold tracking-tight uppercase leading-tight">{selectedImage.fileName}</h4>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {new Date(selectedImage.createdAt).toLocaleString()} • {(selectedImage.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <a 
                href={`${api.defaults.baseURL}/imaging/${selectedImage.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                title="Open in New Tab"
              >
                <ExternalLink size={18} />
              </a>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-2 md:p-3 bg-red-600/80 hover:bg-red-600 rounded-xl transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="flex-1 overflow-hidden relative group">
            <TransformWrapper
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              centerOnInit={true}
              minScale={0.1}
              maxScale={10}
              doubleClick={{ mode: "toggle" }}
              smooth={true}
              wheel={{ 
                step: 0.2,
                activationKeys: [], // No CTRL needed
              }}
              zoomAnimation={{
                animationTime: 200,
                animationType: "easeOut",
              }}
              pinch={{ step: 5 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <React.Fragment>
                  {/* Floating Controls */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-60 hover:opacity-100 focus-within:opacity-100 transition-all">
                    <button 
                      onClick={() => zoomIn()}
                      className="p-3 hover:bg-white/20 rounded-xl transition-colors text-white flex flex-col items-center gap-1"
                      title="Zoom In"
                    >
                      <ZoomIn size={20} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">In</span>
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button 
                      onClick={() => zoomOut()}
                      className="p-3 hover:bg-white/20 rounded-xl transition-colors text-white flex flex-col items-center gap-1"
                      title="Zoom Out"
                    >
                      <ZoomOut size={20} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Out</span>
                    </button>
                    <div className="w-px h-8 bg-white/10" />
                    <button 
                      onClick={() => resetTransform()}
                      className="p-3 hover:bg-white/20 rounded-xl transition-colors text-white flex flex-col items-center gap-1"
                      title="Reset View"
                    >
                      <RotateCcw size={20} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Reset</span>
                    </button>
                  </div>

                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <img 
                      src={`${api.defaults.baseURL}/imaging/${selectedImage.id}`} 
                      alt={selectedImage.fileName}
                      className="max-w-[95%] max-h-[95%] object-contain shadow-2xl animate-in zoom-in-95 duration-500 cursor-grab active:cursor-grabbing"
                    />
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>
          </div>
          
          {/* Footer Info (Mobile hint) */}
          <div className="p-3 text-center bg-black/40 backdrop-blur-sm border-t border-white/5 md:hidden">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Pinch to zoom • Drag to pan</p>
          </div>
        </div>
      )}
    </div>
  );
};
