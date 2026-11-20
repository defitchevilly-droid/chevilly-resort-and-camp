export interface HeroVideoItem {
  id: string;
  title: string;
  youtubeUrl: string; // YouTube URL, shorts, or embed code
  description?: string;
  badge?: string; // e.g. "Full Tour HD", "Shorts 60s", "Drone 4K", "Staycation"
  duration?: string;
  thumbnail?: string;
  isActive: boolean;
  showTitle?: boolean; // Button checklist pilihan tampil judul di halaman depan
  showDescription?: boolean; // Button checklist pilihan tampil keterangan di halaman depan
  showBadge?: boolean; // Button checklist pilihan tampil badge di halaman depan
  showDuration?: boolean; // Button checklist pilihan tampil durasi di halaman depan
}

export const INITIAL_HERO_VIDEOS: HeroVideoItem[] = [
  {
    id: 'hero-vid-1',
    title: 'Chevilly Resort & Camp Bogor — Full Cinematic Tour & Panorama Puncak',
    youtubeUrl: 'https://www.youtube.com/watch?v=fD363zLw-7g',
    description: 'Eksplorasi lengkap lanskap alam sejuk 2.450 mdpl, villa kayu eksklusif, kolam renang outdoor, dan fasilitas rekreasi keluarga terlengkap.',
    badge: 'Full Tour HD 1080p',
    duration: 'Full Tour (08:00 - 22:00)',
    thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    showTitle: true,
    showDescription: true,
    showBadge: true,
    showDuration: true,
  },
  {
    id: 'hero-vid-2',
    title: 'Spot Ikonik Colosseum, Skybridge & Wahana Petualangan Chevilly',
    youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    description: 'Suasana megah replika Colosseum Roma, sensasi Zip Coaster meluncur di atas kanopi pinus, dan jalur petualangan off-road.',
    badge: 'Wisata & Wahana HD',
    duration: 'Short Highlight (3 Menit)',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    showTitle: true,
    showDescription: true,
    showBadge: true,
    showDuration: true,
  },
  {
    id: 'hero-vid-3',
    title: 'Pengalaman Menginap Villa Lumbung & Suasana Malam Pegunungan',
    youtubeUrl: 'https://www.youtube.com/watch?v=uK1lS9t8W8w',
    description: 'Relaksasi sempurna di Villa Lumbung dengan interior kayu hangat, api unggun malam, dan udara segar alami Ciawi Bogor.',
    badge: 'Villa & Glamping HD',
    duration: 'Review Kamar HD',
    thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    showTitle: true,
    showDescription: true,
    showBadge: true,
    showDuration: true,
  },
  {
    id: 'hero-vid-4',
    title: 'Video Singkat: Pesona Pagi Hari di Chevilly Resort & Camp',
    youtubeUrl: 'https://www.youtube.com/shorts/0k5iZ9y-c-g',
    description: 'Kabut tipis pagi hari, panorama Gunung Salak & Pangrango, dan sajian kuliner lezat di Vine Restaurant.',
    badge: 'Shorts 60s HD',
    duration: '60 Detik',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    showTitle: true,
    showDescription: true,
    showBadge: true,
    showDuration: true,
  },
];

export interface ParsedVideo {
  type: 'youtube' | 'video' | 'iframe';
  embedUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export function parseYouTubeVideo(urlOrEmbed?: string): ParsedVideo | null {
  if (!urlOrEmbed) return null;
  const trimmed = urlOrEmbed.trim();

  // If iframe string, extract src
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match) {
      return parseYouTubeVideo(match[1]);
    }
  }

  // YouTube standard / short / embed
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch) {
    const videoId = ytMatch[1];
    const originParam =
      typeof window !== 'undefined' && window.location?.origin
        ? `&origin=${encodeURIComponent(window.location.origin)}`
        : '';
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&vq=hd1080&hd=1${originParam}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }

  // Direct MP4 / WebM
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.endsWith('.ogg')) {
    return {
      type: 'video',
      embedUrl: trimmed,
    };
  }

  // Generic URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'iframe',
      embedUrl: trimmed,
    };
  }

  return null;
}

export const getStoredHeroVideos = (): HeroVideoItem[] => {
  return INITIAL_HERO_VIDEOS;
};

export const saveStoredHeroVideos = (videos: HeroVideoItem[]) => {
  window.dispatchEvent(new CustomEvent('chevilly-hero-videos-updated', { detail: videos }));
};
