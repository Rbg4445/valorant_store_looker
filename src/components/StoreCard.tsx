import React, { useState } from 'react';
import { ResolvedSkinOffer } from '../services/skinResolverService';
import { VpIcon } from './VpIcon';
import { Play, X, Image as ImageIcon } from 'lucide-react';

interface StoreCardProps {
  skin: ResolvedSkinOffer;
}

export const StoreCard: React.FC<StoreCardProps> = ({ skin }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <div
        className="group relative bg-[#0f1923] border rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[340px] sm:min-h-[380px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden active:scale-[0.99] touch-manipulation"
        style={{
          borderColor: skin.tierColorHex ? `${skin.tierColorHex}40` : '#374151',
          boxShadow: skin.tierColorHex ? `0 10px 30px -10px ${skin.tierColorHex}25` : undefined,
        }}
      >
        {/* Top Tier Badge & Video Icon */}
        <div className="flex justify-between items-center z-10 gap-2">
          <span
            className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider border truncate max-w-[170px]"
            style={{
              color: skin.tierColorHex || '#ff4655',
              borderColor: skin.tierColorHex ? `${skin.tierColorHex}60` : '#ff465560',
              backgroundColor: skin.tierColorHex ? `${skin.tierColorHex}15` : '#ff465515',
            }}
          >
            {skin.tierName || 'Valorant Skin'}
          </span>

          {skin.streamedVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-red-600/20 hover:bg-red-600/40 text-[#ff4655] rounded-xl transition-colors border border-red-500/30 flex items-center gap-1 text-[11px] font-bold cursor-pointer shrink-0"
              title="Önizleme Videosunu İzle"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">Video</span>
            </button>
          )}
        </div>

        {/* Ambient Rarity Glow Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15 group-hover:opacity-25 transition-opacity"
          style={{
            background: `radial-gradient(circle at center, ${skin.tierColorHex || '#ff4655'} 0%, transparent 70%)`,
          }}
        />

        {/* Skin Image Container */}
        <div className="relative my-auto py-3 sm:py-4 flex items-center justify-center h-40 sm:h-48 z-0">
          {!imgError && skin.displayIcon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={skin.displayIcon}
              alt={skin.displayName}
              onError={() => setImgError(true)}
              className="max-h-32 sm:max-h-36 max-w-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110 active:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-500 gap-2">
              <ImageIcon className="w-10 h-10 stroke-1" />
              <span className="text-xs">Görsel Yok</span>
            </div>
          )}
        </div>

        {/* Bottom Details Footer */}
        <div className="pt-3 sm:pt-4 border-t border-gray-800/80 z-10 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide truncate group-hover:text-red-400 transition-colors">
            {skin.displayName}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Günlük Teklif</span>
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#182531] border border-gray-700/60 rounded-xl">
              <VpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                {skin.vpCost > 0 ? skin.vpCost.toLocaleString() : 'Özel'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Streamed Video Modal (Mobile Responsive) */}
      {showVideo && skin.streamedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#0f1923] border border-red-500/40 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-800">
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2 truncate">
                <Play className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">{skin.displayName} - Önizleme</span>
              </h4>
              <button
                onClick={() => setShowVideo(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={skin.streamedVideo}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
