import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart } from 'lucide-react';
import { motion } from 'motion/react';

// Live public direct streaming premium music MP3 files with CORS support
const TRACKS = [
  {
    id: "the-script",
    name: "Serenade",
    artist: "Musik Latar",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "shape-of-my-heart",
    name: "Ambient Serenade",
    artist: "Musik Romantis",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  }
];

// GitHub Pages use direct CORS URLs; localhost can fall back to /api/proxy-audio
const getProxiedUrl = (url: string) => {
  const isLocalhost = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
  if (isLocalhost && url.startsWith("http")) {
    return `/api/proxy-audio?url=${encodeURIComponent(url)}`;
  }
  // GitHub Pages: use direct CORS-enabled URL
  return url;
};

export default function AudioPlayer() {
  const [selectedTrackId, setSelectedTrackId] = useState("the-script");
  const [isPlayingBase, setIsPlayingBase] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];
  const displayedTrackName = `${activeTrack.artist} - ${activeTrack.name}`;

  // 1. Sync Play/Pause base state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingBase) {
        audioRef.current.play().catch(err => {
          console.warn("User interaction required or playback blocked:", err);
          // Auto fall-back state sync if blocked
          setIsPlayingBase(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingBase]);

  // 2. Sync volume controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 3. Sync track source changes dynamically
  useEffect(() => {
    if (audioRef.current) {
      setHasError(false);
      setIsLoading(true);
      
      try {
        audioRef.current.load();
        audioRef.current.volume = volume;
        if (isPlayingBase) {
          audioRef.current.play().catch(err => {
            console.warn("Playback blocked on stream change:", err);
            if (err.name !== "AbortError") {
              setIsPlayingBase(false);
            }
          });
        }
      } catch (e) {
        console.warn("Dynamic source load error:", e);
      }
    }
  }, [selectedTrackId]);

  const toggleMusic = () => {
    setHasError(false);
    setIsPlayingBase(prev => !prev);
  };

  const handleTrackChange = (trackId: string) => {
    setSelectedTrackId(trackId);
    setHasError(false);
    setIsPlayingBase(true); // Auto-play on item selection
  };

  return (
    <div className="max-w-2xl mx-auto my-6">
      {/* Native invisible HTML5 Audio element */}
      <audio 
        ref={audioRef}
        src={getProxiedUrl(activeTrack.audioUrl)}
        loop
        preload="auto"
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          const errorCode = audioRef.current?.error?.code;
          const errorMessage = audioRef.current?.error?.message;
          console.error("Audio error code:", errorCode, "message:", errorMessage);
          if (errorCode === 1) { // MEDIA_ERR_ABORTED
            console.log("Safe track transition, ignoring abort.");
            return;
          }
          setIsLoading(false);
          setHasError(true);
        }}
      />

      <div id="media-panel-container" className="bg-white/85 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Area: Visual indicators & Song Selector */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-xl text-rose-500 overflow-hidden ${isPlayingBase && !isLoading ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
              🐱
            </div>
            {isPlayingBase && !isLoading && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 text-rose-400"
              >
                <Heart className="w-4 h-4 fill-rose-300" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs md:text-sm font-sans font-semibold text-gray-800">Suasana Latar:</h4>
              <select
                id="select-track"
                value={selectedTrackId}
                onChange={(e) => handleTrackChange(e.target.value)}
                className="text-xs font-sans font-medium border border-rose-200 bg-white shadow-xs text-rose-600 rounded-md px-2 py-0.5 outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
              >
                {TRACKS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.artist} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[10px] font-mono font-semibold text-rose-500 max-w-full truncate mt-1" title={displayedTrackName}>
              🎵 {displayedTrackName}
            </p>
            <p className="text-xs font-mono text-gray-400 font-medium">
              {hasError ? (
                <span className="text-red-500 font-semibold">❌ Gagal memuat musik pin. Pilih lagu lain atau coba klik tombol musik kembali.</span>
              ) : isLoading ? (
                <span className="text-rose-500 animate-pulse">⏳ Sedang memuat musik lirik...</span>
              ) : isPlayingBase ? (
                <span className="text-emerald-600 font-semibold">🟢 Musik Sedang Diputar (Menyala)</span>
              ) : (
                "Klik tombol Musik untuk memutar"
              )}
            </p>
          </div>
        </div>

        {/* Right Area: Player Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Play Button */}
          <button
            id="btn-play-bgm"
            onClick={toggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans border transition-all cursor-pointer ${
              isPlayingBase 
                ? 'bg-rose-50 border-rose-200 text-rose-650 font-semibold' 
                : 'bg-white border-gray-200 text-gray-650 hover:bg-gray-50'
            }`}
          >
            {isPlayingBase ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-gray-650" />}
            <span>{isPlayingBase ? "Pause Musik" : "Play Musik"}</span>
          </button>

          {/* Volume Controller */}
          <div className="flex items-center gap-1.5 ml-1">
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-400" />
            )}
            <input
              id="slider-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 accent-rose-400 cursor-pointer h-1 rounded-lg bg-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
