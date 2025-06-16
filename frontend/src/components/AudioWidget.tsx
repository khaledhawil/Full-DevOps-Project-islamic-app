import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AudioWidgetProps {
  isVisible: boolean;
  surahName?: string;
  reciterName?: string;
  audioUrl?: string;
  onClose: () => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
}

const AudioWidget: React.FC<AudioWidgetProps> = ({
  isVisible,
  surahName,
  reciterName,
  audioUrl,
  onClose,
  onPlayPause,
  isPlaying,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  onSeek
}) => {
  const { theme, isDarkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isExpanded ? '20px' : '0px',
        left: '20px',
        right: '20px',
        zIndex: 1000,
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
        backdropFilter: 'blur(20px)',
        borderRadius: isExpanded ? '15px' : '15px 15px 0 0',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      {/* Mini Player */}
      {!isExpanded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            cursor: 'pointer'
          }}
          onClick={() => setIsExpanded(true)}
        >
          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            style={{
              background: theme.gradients.primary,
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
              cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Track Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: theme.colors.text,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {surahName || 'القرآن الكريم'}
            </div>
            <div style={{
              color: theme.colors.textSecondary,
              fontSize: '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {reciterName || 'القارئ'}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            flex: 2,
            height: '4px',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: '2px',
            margin: '0 12px',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <div style={{
              height: '100%',
              background: theme.gradients.primary,
              borderRadius: '2px',
              width: `${progressPercentage}%`,
              transition: 'width 0.1s ease'
            }} />
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textSecondary,
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Expanded Player */}
      {isExpanded && (
        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.textSecondary,
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ⬇️
            </button>
            <h3 style={{
              color: theme.colors.text,
              margin: 0,
              fontSize: '1.1rem',
              textAlign: 'center'
            }}>
              مشغل القرآن الكريم
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.textSecondary,
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>

          {/* Track Info */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              color: theme.colors.text,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {surahName || 'القرآن الكريم'}
            </div>
            <div style={{
              color: theme.colors.textSecondary,
              fontSize: '1rem'
            }}>
              بصوت: {reciterName || 'القارئ'}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            marginBottom: '20px'
          }}>
            <div
              style={{
                height: '6px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = (clickX / rect.width);
                onSeek(percentage * duration);
              }}
            >
              <div style={{
                height: '100%',
                background: theme.gradients.primary,
                borderRadius: '3px',
                width: `${progressPercentage}%`,
                transition: 'width 0.1s ease'
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
              color: theme.colors.textSecondary,
              fontSize: '0.9rem'
            }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}>
            {/* Volume Control */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.text,
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              
              {showVolumeSlider && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: isDarkMode ? '#1e293b' : 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  marginBottom: '10px'
                }}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    style={{
                      width: '80px',
                      height: '4px'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Main Play/Pause Button */}
            <button
              onClick={onPlayPause}
              style={{
                background: theme.gradients.primary,
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.8rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Stop Button */}
            <button
              onClick={() => {
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text,
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ⏹️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioWidget;
