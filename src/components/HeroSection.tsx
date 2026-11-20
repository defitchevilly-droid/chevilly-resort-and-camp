import React, { useState, useEffect } from 'react';
import {
  parseYouTubeVideo,
  HeroVideoItem,
  INITIAL_HERO_VIDEOS
} from '../data/heroVideos';
import { fetchHeroVideos } from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Video,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface HeroSectionProps {
  videos?: HeroVideoItem[] | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ videos: dbVideos }) => {
  const [videos, setVideos] = useState<HeroVideoItem[]>(() =>
    Array.isArray(dbVideos) && dbVideos.length > 0 ? dbVideos : INITIAL_HERO_VIDEOS
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (Array.isArray(dbVideos)) {
      const activeList = dbVideos.filter((v) => v.isActive !== false);
      setVideos(activeList.length > 0 ? activeList : INITIAL_HERO_VIDEOS);
      setCurrentIndex((prev) => (prev >= activeList.length ? 0 : prev));
    }
  }, [dbVideos]);

  // Also refresh directly from backend DB if updated via Admin Portal
  useEffect(() => {
    const handleSync = async () => {
      const fresh = await fetchHeroVideos<HeroVideoItem>();
      if (Array.isArray(fresh)) {
        const activeList = fresh.filter((v) => v.isActive !== false);
        setVideos(activeList.length > 0 ? activeList : INITIAL_HERO_VIDEOS);
        setCurrentIndex((prev) => (prev >= activeList.length ? 0 : prev));
      }
    };

    window.addEventListener('chevilly-hero-videos-updated', handleSync);
    return () => {
      window.removeEventListener('chevilly-hero-videos-updated', handleSync);
    };
  }, []);

  const activeVideos = videos.filter((v) => v.isActive !== false);
  const currentVideo = activeVideos[currentIndex] || activeVideos[0] || INITIAL_HERO_VIDEOS[0];
  const parsedVideo = parseYouTubeVideo(currentVideo?.youtubeUrl);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeVideos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeVideos.length) % activeVideos.length);
  };

  const requestFullHdQuality = (iframeEl: HTMLIFrameElement | null) => {
    try {
      const win = iframeEl?.contentWindow;
      if (!win) return;
      win.postMessage(JSON.stringify({ event: 'listening' }), '*');
      win.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackQualityRange', args: ['hd1080', 'hd1080'] }),
        '*'
      );
      win.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }),
        '*'
      );
    } catch {
      // ignore cross-origin postMessage errors
    }
  };

  return (
    <section className="relative flex flex-col justify-between pt-[64px] pb-10 sm:min-h-[82vh] lg:min-h-[88vh] sm:pt-28 sm:pb-16 sm:px-8 overflow-hidden bg-black">
      {/* Background HD YouTube Video Embed / Carousel Player */}
      <div className="relative w-full aspect-video sm:aspect-auto sm:absolute sm:inset-0 overflow-hidden z-0 bg-black">
        {parsedVideo ? (
          parsedVideo.type === 'video' ? (
            <video
              key={parsedVideo.embedUrl}
              src={parsedVideo.embedUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-contain sm:object-cover"
            />
          ) : (
            <div className="relative w-full h-full pointer-events-auto overflow-hidden [container-type:size]">
              <iframe
                key={`${currentVideo.id}-${currentIndex}-${isMuted}`}
                src={
                  isMuted
                    ? parsedVideo.embedUrl
                    : parsedVideo.embedUrl.replace('mute=1', 'mute=0')
                }
                width={1920}
                height={1080}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={(e) => {
                  const iframeEl = e.currentTarget;
                  requestFullHdQuality(iframeEl);
                  window.setTimeout(() => requestFullHdQuality(iframeEl), 1200);
                }}
                className="absolute inset-0 w-full h-full sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[max(100cqw,177.7778cqh)] sm:h-[max(100cqh,56.25cqw)] border-0"
              />
            </div>
          )
        ) : (
          <div className="w-full h-full bg-[#0d1613] flex items-center justify-center text-white/40">
            <Video className="w-16 h-16 animate-pulse" />
          </div>
        )}

        {/* Lighter, clear Scrim Gradient so video details shine through */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20 sm:from-black/75 sm:via-transparent sm:to-black/35 pointer-events-none" />
      </div>

      {/* Top Info & Carousel Controls */}
      <div className="absolute top-[74px] left-3 right-3 z-10 pointer-events-none sm:pointer-events-auto sm:relative sm:top-auto sm:left-auto sm:right-auto max-w-7xl mx-auto sm:w-full sm:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-white">
          <div className="flex items-center gap-2 pointer-events-auto">
            {currentVideo.showBadge !== false && currentVideo.badge && (
              <span className="px-2.5 py-1 bg-[#d4af37] text-[#0d1613] text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{currentVideo.badge}</span>
              </span>
            )}

            {currentVideo.showDuration !== false && currentVideo.duration && (
              <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-mono">
                {currentVideo.duration}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="px-2 py-0.5 bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
              title={isMuted ? 'Nyalakan Audio Video' : 'Bisukan Video'}
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-rose-300" /> : <Volume2 className="w-3 h-3 text-emerald-300" />}
              <span>{isMuted ? 'Suara: Mati' : 'Suara: Nyala'}</span>
            </button>
          </div>

          {/* Carousel Next/Prev Navigation Buttons */}
          {activeVideos.length > 1 && (
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 p-1 pointer-events-auto">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Video Sebelumnya"
                className="p-1.5 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Video Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-[#fae7b3] px-2 font-semibold">
                {currentIndex + 1} / {activeVideos.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Video Berikutnya"
                className="p-1.5 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Video Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Video Title and Caption (Unobstructed View) */}
        <div className="mt-4 max-w-3xl">
          {currentVideo.showTitle !== false && currentVideo.title && (
            <h1 className="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-md leading-tight">
              {currentVideo.title}
            </h1>
          )}
          {currentVideo.showDescription !== false && currentVideo.description && (
            <p className="text-xs sm:text-sm text-stone-200 mt-2 max-w-2xl drop-shadow line-clamp-2 sm:line-clamp-none font-light">
              {currentVideo.description}
            </p>
          )}
        </div>

        {/* Video Thumbnail Pills Switcher */}
        {activeVideos.length > 1 && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
            {activeVideos.map((vid, idx) => (
              <button
                key={vid.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium border transition-all cursor-pointer backdrop-blur-md shrink-0 ${
                  currentIndex === idx
                    ? 'bg-[#d4af37] text-[#0d1613] border-[#d4af37] font-bold shadow-md'
                    : 'bg-black/50 text-stone-300 hover:text-white border-white/20 hover:bg-black/70'
                }`}
              >
                <Play className={`w-3 h-3 ${currentIndex === idx ? 'fill-[#0d1613]' : ''}`} />
                <span className="truncate max-w-[180px] sm:max-w-[240px]">
                  {vid.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

    </section>
  );
};
