import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Share2, 
  AlertCircle, 
  PictureInPicture, 
  Settings,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface VideoPlayerProps {
  url: string;
  title: string;
  onReport?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, onReport }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quality, setQuality] = useState('Auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  const initPlayer = () => {
    const video = videoRef.current;
    if (!video || !url) return;

    setError(false);
    setLoading(true);
    setErrorMessage('');

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingMaxRetry: 4,
        manifestLoadingRetryDelay: 1000,
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setPlaying(false));
        setPlaying(true);
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMessage('Network error: Unable to load stream');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMessage('Media error: Trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              setError(true);
              setErrorMessage('Stream encounterred a fatal error');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
        setPlaying(true);
        setLoading(false);
      });
      video.addEventListener('error', () => {
        setError(true);
        setErrorMessage('Failed to play stream in this browser');
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
      setPlaying(!playing);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        toast.error(`Error: ${err.message}`);
      });
      // Rotation hint
      if (typeof (screen as any).orientation !== 'undefined' && (screen as any).orientation.lock) {
        (screen as any).orientation.lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      toast.error('PiP not supported');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  const handleReload = () => {
    initPlayer();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing]);

  return (
    <div 
      ref={containerRef}
      className="relative group w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
    >
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Stream Unavailable</h3>
          <p className="text-gray-400 mb-6">{errorMessage || 'Stream error.'}</p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleReload} className="bg-white/5 border-white/10">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
            <Button variant="destructive" onClick={onReport}>Report</Button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
      />

      <div className={cn(
        "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 transition-all duration-300",
        isFullscreen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={togglePlay} className="text-white hover:text-cyan-400 transition-colors">
                {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center gap-2 group/vol hidden sm:flex">
                <button onClick={() => setMuted(!muted)} className="text-white">
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (videoRef.current) videoRef.current.volume = v;
                    setMuted(v === 0);
                  }}
                  className="w-16 md:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <span className="text-white font-medium truncate text-sm md:text-base max-w-[150px] md:max-w-[300px]">{title}</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={handleReload} className="text-white hover:text-cyan-400 p-1">
                <RotateCcw className="w-5 h-5" />
              </button>

              <button onClick={togglePiP} className="text-white hover:text-cyan-400 p-1">
                <PictureInPicture className="w-5 h-5" />
              </button>
              
              <button onClick={toggleFullscreen} className="text-white hover:text-cyan-400 p-1">
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};