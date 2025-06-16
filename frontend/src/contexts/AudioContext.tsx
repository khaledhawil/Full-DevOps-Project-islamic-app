import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioContextType {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  audioUrl: string | null;
  surahName: string | null;
  reciterName: string | null;
  isWidgetVisible: boolean;
  
  // Actions
  playAudio: (url: string, surahName: string, reciterName: string) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  showWidget: () => void;
  hideWidget: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [surahName, setSurahName] = useState<string | null>(null);
  const [reciterName, setReciterName] = useState<string | null>(null);
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio error occurred');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playAudio = (url: string, surah: string, reciter: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If same audio is already playing, just resume
    if (audioUrl === url && audio.paused) {
      audio.play();
      setIsPlaying(true);
      setIsWidgetVisible(true);
      return;
    }

    // Stop current audio and play new one
    audio.pause();
    audio.src = url;
    setAudioUrl(url);
    setSurahName(surah);
    setReciterName(reciter);
    setCurrentTime(0);
    setIsWidgetVisible(true);
    
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    });
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    const audio = audioRef.current;
    if (audio && audio.paused && audioUrl) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error resuming audio:', error);
      });
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setIsWidgetVisible(false);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const showWidget = () => setIsWidgetVisible(true);
  const hideWidget = () => setIsWidgetVisible(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const contextValue: AudioContextType = {
    isPlaying,
    currentTime,
    duration,
    volume,
    audioUrl,
    surahName,
    reciterName,
    isWidgetVisible,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setVolume,
    seekTo,
    showWidget,
    hideWidget
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </AudioContext.Provider>
  );
};

export default AudioProvider;
