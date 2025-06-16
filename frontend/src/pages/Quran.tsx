import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
  translation?: string;
  surah?: {
    number: number;
    name: string;
    englishName: string;
  };
}

interface Reciter {
  identifier: string;
  name: string;
  style: string;
  audioUrl: string;
}

const Quran: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State management
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.alafasy');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Ayah[]>([]);
  const [randomAyah, setRandomAyah] = useState<Ayah | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [listeningMode, setListeningMode] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Available reciters
  const reciters: Reciter[] = [
    { identifier: 'ar.alafasy', name: 'مشاري العفاسي', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy' },
    { identifier: 'ar.abdurrahmaansudais', name: 'عبد الرحمن السديس', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.abdurrahmaansudais' },
    { identifier: 'ar.shaatree', name: 'أبو بكر الشاطري', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.shaatree' },
    { identifier: 'ar.hani', name: 'هاني الرفاعي', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.hani' },
    { identifier: 'ar.husary', name: 'محمود خليل الحصري', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.husary' },
    { identifier: 'ar.maher', name: 'ماهر المعيقلي', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.maher' },
    { identifier: 'ar.saoodshuraym', name: 'سعود الشريم', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.saoodshuraym' },
    { identifier: 'ar.mahmoudkhalil_al-hussary', name: 'محمود خليل الحصري (مجود)', style: 'Mujawwad', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.mahmoudkhalil_al-hussary' },
    { identifier: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد (مرتل)', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal' },
    { identifier: 'ar.abdulbasitmujawwad', name: 'عبد الباسط عبد الصمد (مجود)', style: 'Mujawwad', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmujawwad' },
    { identifier: 'ar.minshawi', name: 'محمد صديق المنشاوي', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.minshawi' },
    { identifier: 'ar.minshawimujawwad', name: 'محمد صديق المنشاوي (مجود)', style: 'Mujawwad', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.minshawimujawwad' },
    { identifier: 'ar.walk', name: 'وليد الكلباني', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.walk' },
    { identifier: 'ar.sahlchild', name: 'سهل ياسين (طفل)', style: 'Child', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.sahlchild' },
    { identifier: 'ar.ibrahimakhder', name: 'إبراهيم الأخضر', style: 'Murattal', audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.ibrahimakhder' }
  ];

  // Fetch all surahs on component mount
  useEffect(() => {
    fetchSurahs();
    fetchRandomAyah();
  }, []);

  // Fetch ayahs when surah changes
  useEffect(() => {
    if (selectedSurah) {
      // Stop any playing audio when changing surah
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentAudio(null);
        setCurrentPlayingAyah(null);
      }
      fetchAyahs(selectedSurah);
    }
  }, [selectedSurah]);

  // Search functionality with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setSearchLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedReciter]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && currentPlayingAyah) {
        event.preventDefault();
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } else if (event.code === 'ArrowRight' && currentPlayingAyah && autoAdvance) {
        event.preventDefault();
        playNextAyah();
      } else if (event.code === 'Escape' && isPlaying) {
        event.preventDefault();
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setCurrentAudio(null);
          setCurrentPlayingAyah(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPlayingAyah, isPlaying, autoAdvance]);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await response.json();
      if (data.code === 200) {
        setSurahs(data.data);
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
    }
  };

  const fetchAyahs = async (surahNumber: number) => {
    setLoading(true);
    try {
      // Fetch Arabic text
      const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const arabicData = await arabicResponse.json();
      
      // Fetch English translation
      const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
      const translationData = await translationResponse.json();
      
      if (arabicData.code === 200 && translationData.code === 200) {
        const surahInfo = {
          number: arabicData.data.number,
          name: arabicData.data.name,
          englishName: arabicData.data.englishName
        };
        
        const combinedAyahs = arabicData.data.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          translation: translationData.data.ayahs[index]?.text || '',
          audio: `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${ayah.number}.mp3`,
          surah: surahInfo
        }));
        setAyahs(combinedAyahs);
      }
    } catch (error) {
      console.error('Error fetching ayahs:', error);
    }
    setLoading(false);
  };

  const fetchRandomAyah = async () => {
    try {
      // Random surah (1-114) and random ayah
      const randomSurahNum = Math.floor(Math.random() * 114) + 1;
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${randomSurahNum}`);
      const surahData = await surahResponse.json();
      
      if (surahData.code === 200) {
        const randomAyahIndex = Math.floor(Math.random() * surahData.data.ayahs.length);
        const randomAyahData = surahData.data.ayahs[randomAyahIndex];
        
        // Get translation
        const translationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahData.number}/en.asad`);
        const translationData = await translationResponse.json();
        
        const surahInfo = {
          number: surahData.data.number,
          name: surahData.data.name,
          englishName: surahData.data.englishName
        };
        
        setRandomAyah({
          ...randomAyahData,
          translation: translationData.data?.text || '',
          audio: `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${randomAyahData.number}.mp3`,
          surah: surahInfo
        });
      }
    } catch (error) {
      console.error('Error fetching random ayah:', error);
    }
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      // Try multiple search endpoints for better results
      const searchPromises = [
        fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/ar`),
        fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/en.asad`)
      ];

      const responses = await Promise.allSettled(searchPromises);
      let allMatches: any[] = [];

      // Process Arabic search results
      if (responses[0].status === 'fulfilled') {
        const arabicData = await responses[0].value.json();
        if (arabicData.code === 200 && arabicData.data.matches) {
          allMatches = [...allMatches, ...arabicData.data.matches];
        }
      }

      // Process English search results
      if (responses[1].status === 'fulfilled') {
        const englishData = await responses[1].value.json();
        if (englishData.code === 200 && englishData.data.matches) {
          allMatches = [...allMatches, ...englishData.data.matches];
        }
      }

      // Remove duplicates based on ayah number
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.number === match.number)
      );

      // Limit to 15 results and sort by relevance
      const results = uniqueMatches.slice(0, 15);
      
      const searchAyahs = await Promise.all(
        results.map(async (match: any) => {
          try {
            // Get both Arabic text and English translation
            const [arabicResponse, translationResponse] = await Promise.all([
              fetch(`https://api.alquran.cloud/v1/ayah/${match.number}`),
              fetch(`https://api.alquran.cloud/v1/ayah/${match.number}/en.asad`)
            ]);

            const arabicData = await arabicResponse.json();
            const translationData = await translationResponse.json();

            return {
              number: match.number,
              text: arabicData.data?.text || match.text,
              numberInSurah: arabicData.data?.numberInSurah || match.numberInSurah,
              translation: translationData.data?.text || '',
              audio: `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${match.number}.mp3`,
              surah: arabicData.data?.surah || match.surah || {
                number: Math.ceil(match.number / 10),
                name: 'غير محدد',
                englishName: 'Unknown'
              }
            };
          } catch (error) {
            console.error('Error fetching ayah details:', error);
            return {
              ...match,
              translation: '',
              audio: `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${match.number}.mp3`,
              surah: match.surah || {
                number: Math.ceil(match.number / 10),
                name: 'غير محدد',
                englishName: 'Unknown'
              }
            };
          }
        })
      );
      
      setSearchResults(searchAyahs);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const playAudio = (audioUrl: string, ayahNumber: number) => {
    if (audioRef.current) {
      if (currentAudio === audioUrl && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentAudio(null);
        setCurrentPlayingAyah(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentAudio(audioUrl);
        setCurrentPlayingAyah(ayahNumber);
        
        // Scroll to the playing ayah
        scrollToAyah(ayahNumber);
      }
    }
  };

  const scrollToAyah = (ayahNumber: number) => {
    const ayahElement = document.getElementById(`ayah-${ayahNumber}`);
    if (ayahElement) {
      ayahElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  const playNextAyah = () => {
    if (!autoAdvance || !currentPlayingAyah) return;
    
    const currentIndex = ayahs.findIndex(ayah => ayah.number === currentPlayingAyah);
    if (currentIndex >= 0 && currentIndex < ayahs.length - 1) {
      const nextAyah = ayahs[currentIndex + 1];
      setTimeout(() => {
        playAudio(nextAyah.audio!, nextAyah.number);
      }, 500); // Small delay before playing next ayah
    } else {
      // End of surah
      setIsPlaying(false);
      setCurrentAudio(null);
      setCurrentPlayingAyah(null);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentAudio(null);
    
    if (autoAdvance && currentPlayingAyah) {
      playNextAyah();
    } else {
      setCurrentPlayingAyah(null);
    }
  };

  const cardStyle = {
    background: isDarkMode 
      ? 'rgba(15, 23, 42, 0.9)' 
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '1.5rem',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: `0 10px 30px ${theme.colors.shadow}`,
    marginBottom: '1rem'
  };

  const buttonStyle = {
    background: theme.gradients.primary,
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0.25rem'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e293b 50%, #334155 75%, #475569 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
      direction: 'rtl',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            القرآن الكريم
          </h1>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => window.location.href = '/quran-audio'}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🎵 انتقل إلى المكتبة الصوتية
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div style={cardStyle}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Surah Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                اختر السورة:
              </label>
              <select 
                value={selectedSurah} 
                onChange={(e) => setSelectedSurah(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  background: isDarkMode ? '#1e293b' : 'white',
                  color: theme.colors.text,
                  fontSize: '1rem'
                }}
              >
                {surahs.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name} - {surah.englishName}
                  </option>
                ))}
              </select>
            </div>

            {/* Reciter Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                اختر القارئ:
              </label>
              <select 
                value={selectedReciter} 
                onChange={(e) => {
                  setSelectedReciter(e.target.value);
                  if (selectedSurah) fetchAyahs(selectedSurah);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  background: isDarkMode ? '#1e293b' : 'white',
                  color: theme.colors.text,
                  fontSize: '1rem'
                }}
              >
                {reciters.map((reciter) => (
                  <option key={reciter.identifier} value={reciter.identifier}>
                    {reciter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search and Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {/* Search */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                البحث في القرآن:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.length >= 2) {
                      setSearchLoading(true);
                    }
                  }}
                  placeholder="ابحث في الآيات... (أدخل حرفين على الأقل)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: searchLoading ? '3rem' : '0.75rem',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    background: isDarkMode ? '#1e293b' : 'white',
                    color: theme.colors.text,
                    fontSize: '1rem'
                  }}
                />
                {searchLoading && (
                  <div style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.2rem'
                  }}>
                    ⏳
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', alignItems: 'end', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                style={{
                  ...buttonStyle,
                  background: showTranslation ? theme.gradients.primary : theme.colors.border
                }}
              >
                {showTranslation ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
              </button>
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                style={{
                  ...buttonStyle,
                  background: autoAdvance ? theme.gradients.primary : theme.colors.border
                }}
              >
                {autoAdvance ? '🔄 التقدم التلقائي' : '⏸️ إيقاف التقدم'}
              </button>
              <button
                onClick={() => setListeningMode(!listeningMode)}
                style={{
                  ...buttonStyle,
                  background: listeningMode ? 'linear-gradient(135deg, #22c55e, #16a34a)' : theme.colors.border
                }}
              >
                {listeningMode ? '🎧 وضع الاستماع' : '📖 وضع القراءة'}
              </button>
              <button
                onClick={fetchRandomAyah}
                style={buttonStyle}
              >
                آية عشوائية
              </button>
            </div>
          </div>
          
          {/* Keyboard Controls Info */}
          {currentPlayingAyah && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.9rem',
              color: theme.colors.textSecondary,
              textAlign: 'center'
            }}>
              ⌨️ اختصارات لوحة المفاتيح: المسافة (إيقاف/تشغيل) • → (الآية التالية) • Esc (إيقاف نهائي)
            </div>
          )}
        </div>

        {/* Random Ayah */}
        {randomAyah && (
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              🌟 آية اليوم
            </h3>
            <div style={{
              background: (randomAyah && currentPlayingAyah === randomAyah.number)
                ? isDarkMode 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(59, 130, 246, 0.1)'
                : isDarkMode 
                  ? 'rgba(59, 130, 246, 0.1)' 
                  : 'rgba(59, 130, 246, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: (randomAyah && currentPlayingAyah === randomAyah.number)
                ? '2px solid rgba(59, 130, 246, 0.6)'
                : '1px solid rgba(59, 130, 246, 0.2)',
              transform: (randomAyah && currentPlayingAyah === randomAyah.number) ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}>
              <p style={{
                fontSize: '2rem',
                lineHeight: '2.5',
                color: (randomAyah && currentPlayingAyah === randomAyah.number)
                  ? isDarkMode ? '#60a5fa' : '#1d4ed8'
                  : theme.colors.text,
                textAlign: 'center',
                marginBottom: '1rem',
                fontFamily: 'Amiri, serif',
                textShadow: (randomAyah && currentPlayingAyah === randomAyah.number) ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {randomAyah?.text}
              </p>
              <p style={{
                fontSize: '1rem',
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                سورة {randomAyah?.surah?.name} - الآية {randomAyah?.numberInSurah}
              </p>
              {showTranslation && randomAyah?.translation && (
                <p style={{
                  fontSize: '1.2rem',
                  color: (randomAyah && currentPlayingAyah === randomAyah.number)
                    ? isDarkMode ? '#93c5fd' : '#3730a3'
                    : theme.colors.textSecondary,
                  textAlign: 'center',
                  fontStyle: 'italic',
                  marginBottom: '1rem',
                  direction: 'ltr',
                  transition: 'color 0.3s ease'
                }}>
                  "{randomAyah.translation}"
                </p>
              )}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => randomAyah && playAudio(randomAyah.audio!, randomAyah.number)}
                  style={{
                    ...buttonStyle,
                    background: (randomAyah && currentAudio === randomAyah.audio && isPlaying)
                      ? theme.colors.error 
                      : (randomAyah && currentPlayingAyah === randomAyah.number)
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                        : theme.gradients.primary,
                    animation: (randomAyah && currentPlayingAyah === randomAyah.number) ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {(randomAyah && currentAudio === randomAyah.audio && isPlaying) ? '⏹️ إيقاف' : '▶️ تشغيل'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {(searchResults.length > 0 || searchLoading) && (
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              {searchLoading ? '🔍 جاري البحث...' : `🔍 نتائج البحث (${searchResults.length})`}
            </h3>
            {searchLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: theme.colors.textSecondary
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>جاري البحث في القرآن الكريم...</p>
              </div>
            ) : (
              <div style={{
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {searchResults.map((ayah, index) => {
                  const isCurrentlyPlaying = currentPlayingAyah === ayah.number;
                  const isCurrentAudio = currentAudio === ayah.audio && isPlaying;
                  
                  return (
                    <div 
                      key={index} 
                      id={`search-ayah-${ayah.number}`}
                      style={{
                        background: isCurrentlyPlaying
                          ? isDarkMode 
                            ? 'rgba(59, 130, 246, 0.2)' 
                            : 'rgba(59, 130, 246, 0.1)'
                          : isDarkMode 
                            ? 'rgba(30, 41, 59, 0.5)' 
                            : 'rgba(248, 250, 252, 0.8)',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        border: isCurrentlyPlaying
                          ? '2px solid rgba(59, 130, 246, 0.6)'
                          : `1px solid ${theme.colors.border}`,
                        transform: isCurrentlyPlaying ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          fontSize: '0.9rem',
                          color: theme.colors.textSecondary,
                          background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          سورة {ayah.surah?.name} - الآية {ayah.numberInSurah}
                        </span>
                        <button
                          onClick={() => playAudio(ayah.audio!, ayah.number)}
                          style={{
                            ...buttonStyle,
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            background: isCurrentAudio 
                              ? theme.colors.error 
                              : isCurrentlyPlaying
                                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                : theme.gradients.primary,
                            animation: isCurrentlyPlaying ? 'pulse 1.5s infinite' : 'none'
                          }}
                        >
                          {isCurrentAudio ? '⏹️ إيقاف' : '▶️ تشغيل'}
                        </button>
                      </div>
                      <p style={{
                        fontSize: '1.5rem',
                        lineHeight: '2',
                        color: isCurrentlyPlaying
                          ? isDarkMode ? '#60a5fa' : '#1d4ed8'
                          : theme.colors.text,
                        marginBottom: '0.5rem',
                        fontFamily: 'Amiri, serif',
                        textShadow: isCurrentlyPlaying ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {ayah.text}
                      </p>
                      {showTranslation && ayah.translation && (
                        <p style={{
                          fontSize: '1rem',
                          color: isCurrentlyPlaying
                            ? isDarkMode ? '#93c5fd' : '#3730a3'
                            : theme.colors.textSecondary,
                          fontStyle: 'italic',
                          direction: 'ltr',
                          transition: 'color 0.3s ease',
                          borderTop: `1px solid ${theme.colors.border}`,
                          paddingTop: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          "{ayah.translation}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Listening Mode */}
        {listeningMode && ayahs.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1.5rem',
              fontSize: '2rem',
              textAlign: 'center'
            }}>
              🎧 وضع الاستماع - سورة {surahs.find(s => s.number === selectedSurah)?.name}
            </h3>
            
            {/* Current Playing Ayah Display */}
            {currentPlayingAyah && (
              <div style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.05))',
                padding: '2rem',
                borderRadius: '15px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                marginBottom: '2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  animation: 'pulse 2s infinite'
                }}>
                  🎵
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  color: theme.colors.textSecondary,
                  marginBottom: '1rem'
                }}>
                  الآية رقم {ayahs.find(a => a.number === currentPlayingAyah)?.numberInSurah}
                </div>
                <p style={{
                  fontSize: '2.5rem',
                  lineHeight: '2.5',
                  color: isDarkMode ? '#60a5fa' : '#1d4ed8',
                  fontFamily: 'Amiri, serif',
                  textShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                  marginBottom: '1rem'
                }}>
                  {ayahs.find(a => a.number === currentPlayingAyah)?.text}
                </p>
                {showTranslation && ayahs.find(a => a.number === currentPlayingAyah)?.translation && (
                  <p style={{
                    fontSize: '1.3rem',
                    color: isDarkMode ? '#93c5fd' : '#3730a3',
                    fontStyle: 'italic',
                    direction: 'ltr',
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    "{ayahs.find(a => a.number === currentPlayingAyah)?.translation}"
                  </p>
                )}
              </div>
            )}

            {/* Listening Controls */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => {
                  if (!currentPlayingAyah && ayahs.length > 0) {
                    playAudio(ayahs[0].audio!, ayahs[0].number);
                  } else if (currentPlayingAyah) {
                    if (audioRef.current) {
                      if (isPlaying) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }
                }}
                style={{
                  ...buttonStyle,
                  padding: '1rem',
                  fontSize: '1.1rem',
                  background: isPlaying 
                    ? theme.colors.error 
                    : 'linear-gradient(135deg, #22c55e, #16a34a)'
                }}
              >
                {isPlaying ? '⏸️ إيقاف مؤقت' : currentPlayingAyah ? '▶️ متابعة' : '▶️ بدء الاستماع'}
              </button>
              
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    setCurrentPlayingAyah(null);
                  }
                }}
                style={{
                  ...buttonStyle,
                  padding: '1rem',
                  fontSize: '1.1rem',
                  background: theme.colors.error
                }}
              >
                ⏹️ إيقاف
              </button>
              
              <button
                onClick={() => {
                  const currentIndex = ayahs.findIndex(a => a.number === currentPlayingAyah);
                  if (currentIndex > 0) {
                    const prevAyah = ayahs[currentIndex - 1];
                    playAudio(prevAyah.audio!, prevAyah.number);
                  }
                }}
                disabled={!currentPlayingAyah || ayahs.findIndex(a => a.number === currentPlayingAyah) === 0}
                style={{
                  ...buttonStyle,
                  padding: '1rem',
                  fontSize: '1.1rem',
                  opacity: (!currentPlayingAyah || ayahs.findIndex(a => a.number === currentPlayingAyah) === 0) ? 0.5 : 1
                }}
              >
                ⏮️ السابق
              </button>
              
              <button
                onClick={() => {
                  const currentIndex = ayahs.findIndex(a => a.number === currentPlayingAyah);
                  if (currentIndex >= 0 && currentIndex < ayahs.length - 1) {
                    const nextAyah = ayahs[currentIndex + 1];
                    playAudio(nextAyah.audio!, nextAyah.number);
                  }
                }}
                disabled={!currentPlayingAyah || ayahs.findIndex(a => a.number === currentPlayingAyah) === ayahs.length - 1}
                style={{
                  ...buttonStyle,
                  padding: '1rem',
                  fontSize: '1.1rem',
                  opacity: (!currentPlayingAyah || ayahs.findIndex(a => a.number === currentPlayingAyah) === ayahs.length - 1) ? 0.5 : 1
                }}
              >
                ⏭️ التالي
              </button>
            </div>

            {/* Progress Bar */}
            {currentPlayingAyah && (
              <div style={{
                background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                padding: '1rem',
                borderRadius: '10px',
                border: `1px solid ${theme.colors.border}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: theme.colors.textSecondary
                  }}>
                    الآية {ayahs.findIndex(a => a.number === currentPlayingAyah) + 1} من {ayahs.length}
                  </span>
                  <span style={{
                    fontSize: '0.9rem',
                    color: theme.colors.textSecondary
                  }}>
                    القارئ: {reciters.find(r => r.identifier === selectedReciter)?.name}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: isDarkMode ? '#374151' : '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${((ayahs.findIndex(a => a.number === currentPlayingAyah) + 1) / ayahs.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Surah Content */}
        {loading ? (
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: theme.colors.text, fontSize: '1.5rem' }}>
              جاري تحميل الآيات...
            </p>
          </div>
        ) : (
          ayahs.length > 0 && !listeningMode && (
            <div style={cardStyle}>
              <h3 style={{
                color: theme.colors.text,
                marginBottom: '1.5rem',
                fontSize: '2rem',
                textAlign: 'center'
              }}>
                سورة {surahs.find(s => s.number === selectedSurah)?.name}
              </h3>
              <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                padding: '0 1rem'
              }}>
                {ayahs.map((ayah) => {
                  const isCurrentlyPlaying = currentPlayingAyah === ayah.number;
                  const isCurrentAudio = currentAudio === ayah.audio && isPlaying;
                  
                  return (
                    <div 
                      key={ayah.number} 
                      id={`ayah-${ayah.number}`}
                      style={{
                        background: isCurrentlyPlaying 
                          ? isDarkMode 
                            ? 'rgba(59, 130, 246, 0.3)' 
                            : 'rgba(59, 130, 246, 0.15)'
                          : isDarkMode 
                            ? 'rgba(30, 41, 59, 0.3)' 
                            : 'rgba(248, 250, 252, 0.6)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                        border: isCurrentlyPlaying 
                          ? '2px solid rgba(59, 130, 246, 0.6)' 
                          : `1px solid ${theme.colors.border}`,
                        transform: isCurrentlyPlaying ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        boxShadow: isCurrentlyPlaying 
                          ? '0 8px 25px rgba(59, 130, 246, 0.3)' 
                          : `0 2px 10px ${theme.colors.shadow}`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          background: isCurrentlyPlaying 
                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                            : theme.gradients.primary,
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          animation: isCurrentlyPlaying ? 'pulse 1.5s infinite' : 'none'
                        }}>
                          {ayah.numberInSurah}
                        </span>
                        <button
                          onClick={() => playAudio(ayah.audio!, ayah.number)}
                          style={{
                            ...buttonStyle,
                            padding: '0.5rem 1rem',
                            background: isCurrentAudio 
                              ? theme.colors.error 
                              : isCurrentlyPlaying
                                ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                : theme.gradients.primary,
                            animation: isCurrentlyPlaying ? 'pulse 1.5s infinite' : 'none'
                          }}
                        >
                          {isCurrentAudio ? '⏹️ إيقاف' : '▶️ تشغيل'}
                        </button>
                      </div>
                      <p style={{
                        fontSize: '2rem',
                        lineHeight: '2.5',
                        color: isCurrentlyPlaying 
                          ? isDarkMode ? '#60a5fa' : '#1d4ed8'
                          : theme.colors.text,
                        marginBottom: '1rem',
                        textAlign: 'justify',
                        fontFamily: 'Amiri, serif',
                        textShadow: isCurrentlyPlaying ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {ayah.text}
                      </p>
                      {showTranslation && ayah.translation && (
                        <p style={{
                          fontSize: '1.2rem',
                          color: isCurrentlyPlaying 
                            ? isDarkMode ? '#93c5fd' : '#3730a3'
                            : theme.colors.textSecondary,
                          fontStyle: 'italic',
                          direction: 'ltr',
                          textAlign: 'left',
                          borderTop: `1px solid ${theme.colors.border}`,
                          paddingTop: '1rem',
                          transition: 'color 0.3s ease'
                        }}>
                          "{ayah.translation}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Audio Player */}
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default Quran;
