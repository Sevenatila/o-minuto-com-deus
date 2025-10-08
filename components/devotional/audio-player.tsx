
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/devotional-utils';

interface AudioPlayerProps {
  audioUrl: string | null;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export function AudioPlayer({
  audioUrl,
  onProgress,
  onEnded,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (onProgress) {
        onProgress(audio.currentTime, audio.duration);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) {
        onEnded();
      }
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        audio.play().catch(() => {
          // Autoplay blocked
          setIsPlaying(false);
        });
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [onProgress, onEnded, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!audioUrl || hasError) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">
          Modo silencioso ativado. Continue meditando.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Play/Pause Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-8 w-8 text-white" />
          ) : (
            <Play className="h-8 w-8 text-white ml-1" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {!isLoading && (
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer audio-slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) ${
                (currentTime / duration) * 100
              }%, hsl(var(--muted)) ${(currentTime / duration) * 100}%)`,
            }}
          />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <button
              onClick={toggleMute}
              className="p-1 hover:text-foreground transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .audio-slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .audio-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
