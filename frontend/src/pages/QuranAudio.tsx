import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useAudioPlayer } from '../contexts/AudioContext';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Reciter {
  id: string;
  name: string;
  server: string;
  style: string;
  description: string;
  country: string;
  quality: string;
}

const QuranAudio: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { playAudio: playGlobalAudio, isPlaying: isGlobalPlaying } = useAudioPlayer();
  const { preferences, updateQuranAudioFavorites, updateLastReciter } = useUserPreferences();
  
  // State management
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ghamdi');
  const [selectedServer, setSelectedServer] = useState<string>('server6');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlayingSurah, setCurrentPlayingSurah] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Simplified and reliable reciters list
  const reciters: Reciter[] = [
    // Server 6 - High Quality Reciters
    { id: 'ghamdi', name: 'سعد الغامدي', server: 'server6', style: 'مرتل', description: 'قراءة متميزة ومؤثرة', country: 'السعودية', quality: 'ممتازة' },
    { id: 'afasy', name: 'مشاري راشد العفاسي', server: 'server6', style: 'مرتل', description: 'قراءة مؤثرة وهادئة', country: 'الكويت', quality: 'ممتازة' },
    { id: 'husary', name: 'محمود خليل الحصري', server: 'server6', style: 'مرتل', description: 'من أعظم قراء القرآن', country: 'مصر', quality: 'ممتازة' },
    { id: 'maher', name: 'ماهر المعيقلي', server: 'server6', style: 'مرتل', description: 'إمام الحرم المكي', country: 'السعودية', quality: 'ممتازة' },
    { id: 'sudais', name: 'عبد الرحمن السديس', server: 'server6', style: 'مرتل', description: 'إمام الحرم المكي', country: 'السعودية', quality: 'ممتازة' },
    { id: 'shur', name: 'سعود الشريم', server: 'server6', style: 'مرتل', description: 'إمام الحرم المكي', country: 'السعودية', quality: 'ممتازة' },
    { id: 'ajmy', name: 'أحمد بن علي العجمي', server: 'server6', style: 'مرتل', description: 'صوت جميل ومتميز', country: 'السعودية', quality: 'ممتازة' },
    { id: 'qatami', name: 'ناصر القطامي', server: 'server6', style: 'مرتل', description: 'قراءة مؤثرة', country: 'السعودية', quality: 'ممتازة' },
    { id: 'tablwy', name: 'محمد صديق المنشاوي', server: 'server6', style: 'مرتل', description: 'من أعظم قراء القرآن', country: 'مصر', quality: 'ممتازة' },
    
    // Server 7 - Classical Reciters
    { id: 'basit', name: 'عبد الباسط عبد الصمد', server: 'server7', style: 'مرتل', description: 'صوت ذهبي مميز', country: 'مصر', quality: 'ممتازة' },
    { id: 'aloosi', name: 'عبد الله الأودي', server: 'server7', style: 'مرتل', description: 'قراءة جميلة', country: 'العراق', quality: 'جيدة جداً' },
    { id: 'fares', name: 'فارس عباد', server: 'server7', style: 'مرتل', description: 'صوت مميز', country: 'الكويت', quality: 'جيدة جداً' },
    
    // Server 8 - Popular Reciters
    { id: 'afs', name: 'مشاري العفاسي', server: 'server8', style: 'مرتل', description: 'قراءة مؤثرة وهادئة', country: 'الكويت', quality: 'ممتازة' },
    { id: 'ayyub', name: 'محمد أيوب', server: 'server8', style: 'مرتل', description: 'إمام الحرم المدني', country: 'السعودية', quality: 'ممتازة' },
    { id: 'tblwy', name: 'إبراهيم الأخضر', server: 'server8', style: 'مرتل', description: 'قراءة متميزة', country: 'مصر', quality: 'جيدة جداً' },
    
    // Server 10 - Additional Quality Reciters
    { id: 'parhizgar', name: 'عبد الله کاندهلوی', server: 'server10', style: 'مرتل', description: 'قراءة مؤثرة', country: 'باكستان', quality: 'جيدة جداً' },
    { id: 'shdshry', name: 'ياسر الشدشري', server: 'server10', style: 'مرتل', description: 'قراءة جميلة', country: 'السعودية', quality: 'جيدة جداً' },
    
    // Server 11 - More Reciters
    { id: 'abdurrahman_al_sudais', name: 'عبد الرحمن السديس', server: 'server11', style: 'مرتل', description: 'إمام الحرم المكي', country: 'السعودية', quality: 'ممتازة' },
    { id: 'jbreen', name: 'عبد الله الجبرين', server: 'server11', style: 'مرتل', description: 'قراءة متميزة', country: 'السعودية', quality: 'جيدة جداً' },
    
    // Server 12 - Contemporary Reciters
    { id: 'alshawkani', name: 'عبد الهادي الشوكاني', server: 'server12', style: 'مرتل', description: 'قراءة جميلة', country: 'اليمن', quality: 'جيدة جداً' },
    { id: 'haram', name: 'علي بن عبد الرحمن الحذيفي', server: 'server12', style: 'مرتل', description: 'إمام الحرم المدني', country: 'السعودية', quality: 'ممتازة' },
    
    // Server 13 - Additional Options
    { id: 'bucatar', name: 'رعد محمد الكردي', server: 'server13', style: 'مرتل', description: 'قراءة مؤثرة', country: 'العراق', quality: 'جيدة جداً' },
    { id: 'ahmedajamy', name: 'أحمد نعينع', server: 'server13', style: 'مرتل', description: 'قراءة متميزة', country: 'المغرب', quality: 'جيدة جداً' },
    
    // Additional Classical Reciters
    { id: 'rifai', name: 'هاني الرفاعي', server: 'server6', style: 'مرتل', description: 'قراءة مؤثرة', country: 'السعودية', quality: 'جيدة جداً' },
    { id: 'husari_muallim', name: 'محمود خليل الحصري (تعليمي)', server: 'server7', style: 'تعليمي', description: 'قراءة تعليمية واضحة', country: 'مصر', quality: 'ممتازة' },
    { id: 'jalalayn', name: 'خالد الجليل', server: 'server8', style: 'مرتل', description: 'قراءة هادئة ومؤثرة', country: 'السعودية', quality: 'ممتازة' },
    { id: 'hudhaify', name: 'علي الحذيفي', server: 'server10', style: 'مرتل', description: 'إمام الحرم المدني', country: 'السعودية', quality: 'ممتازة' },
    { id: 'shahat', name: 'محمد صديق شحات', server: 'server11', style: 'مرتل', description: 'قراءة جميلة', country: 'مصر', quality: 'جيدة جداً' },
    { id: 'amer', name: 'إسلام صبحي', server: 'server12', style: 'مرتل', description: 'قراءة معاصرة', country: 'مصر', quality: 'جيدة جداً' },
    { id: 'banashawy', name: 'محمد رشاد الشريف', server: 'server13', style: 'مرتل', description: 'قراءة متميزة', country: 'مصر', quality: 'جيدة جداً' }
  ];

  useEffect(() => {
    fetchSurahs();
  }, []);

  // Load user data when preferences are available
  useEffect(() => {
    if (preferences) {
      // Load favorites from user preferences
      if (preferences.quran_audio_favorites) {
        setFavorites(preferences.quran_audio_favorites);
        console.log('Loaded QuranAudio favorites from database:', preferences.quran_audio_favorites);
      }
      // Load last used reciter
      if (preferences.last_reciter && preferences.last_server) {
        setSelectedReciter(preferences.last_reciter);
        setSelectedServer(preferences.last_server);
        console.log('Restored last reciter:', preferences.last_reciter, preferences.last_server);
      }
    }
  }, [preferences]);

  // Clear favorites when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      setSelectedReciter('ghamdi');
      setSelectedServer('server6');
    }
  }, [isAuthenticated]);

  // Save favorites to database whenever favorites change (debounced)
  useEffect(() => {
    if (isAuthenticated && updateQuranAudioFavorites && preferences) {
      // Only update if favorites actually changed from what's in preferences
      const currentFavs = JSON.stringify(favorites.sort());
      const dbFavs = JSON.stringify((preferences.quran_audio_favorites || []).sort());
      
      if (currentFavs !== dbFavs && favorites.length >= 0) {
        const timeoutId = setTimeout(() => {
          updateQuranAudioFavorites(favorites)
            .then(() => console.log('Saved QuranAudio favorites to database'))
            .catch(console.error);
        }, 500); // Debounce for 500ms
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [favorites, isAuthenticated, updateQuranAudioFavorites, preferences]);

  const fetchSurahs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await response.json();
      if (data.code === 200) {
        setSurahs(data.data);
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
    }
    setLoading(false);
  };

  const playAudio = async (surahNumber: number) => {
    const reciter = reciters.find(r => r.id === selectedReciter && r.server === selectedServer);
    if (!reciter) {
      setAudioError('القارئ المحدد غير متاح');
      return;
    }

    // Format surah number with leading zeros (001, 002, etc.)
    const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
    const audioUrl = `https://${reciter.server}.mp3quran.net/${reciter.id}/${formattedSurahNumber}.mp3`;
    
    const surahInfo = surahs.find(s => s.number === surahNumber);
    const surahName = surahInfo ? surahInfo.name : `سورة رقم ${surahNumber}`;
    
    try {
      setAudioError(null);
      // Use global audio context instead of local state
      playGlobalAudio(audioUrl, surahName, reciter.name);
      setCurrentPlayingSurah(surahNumber);
      
      // Save last used reciter to database
      if (isAuthenticated && updateLastReciter) {
        updateLastReciter(selectedReciter, selectedServer).catch(console.error);
      }
    } catch (error) {
      setAudioError(`فشل في تحميل الصوت للقارئ: ${reciter.name} من ${reciter.server}`);
      setCurrentPlayingSurah(null);
    }
  };

  const toggleFavorite = async (reciterId: string) => {
    if (!isAuthenticated) {
      setAudioError('يجب تسجيل الدخول لحفظ القراء المفضلين');
      return;
    }
    
    const reciterKey = `${selectedServer}-${reciterId}`;
    const newFavorites = favorites.includes(reciterKey) 
      ? favorites.filter(id => id !== reciterKey)
      : [...favorites, reciterKey];
      
    setFavorites(newFavorites);
    
    // The useEffect will handle saving to database automatically
  };

  const getFilteredReciters = () => {
    let filtered = reciters;
    
    if (searchTerm) {
      filtered = filtered.filter(reciter => 
        reciter.name.includes(searchTerm) || 
        reciter.country.includes(searchTerm) ||
        reciter.style.includes(searchTerm)
      );
    }
    
    // Sort by favorites first, then by quality, then by name
    return filtered.sort((a, b) => {
      const aKey = `${a.server}-${a.id}`;
      const bKey = `${b.server}-${b.id}`;
      const aFav = favorites.includes(aKey);
      const bFav = favorites.includes(bKey);
      
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      
      // Sort by quality
      const qualityOrder = { 'ممتازة': 0, 'عالية': 1, 'متوسطة': 2 };
      const aqIndex = qualityOrder[a.quality as keyof typeof qualityOrder] ?? 3;
      const bqIndex = qualityOrder[b.quality as keyof typeof qualityOrder] ?? 3;
      
      if (aqIndex !== bqIndex) return aqIndex - bqIndex;
      
      return a.name.localeCompare(b.name, 'ar');
    });
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
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            مكتبة القرآن الصوتية
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: theme.colors.textSecondary,
            marginBottom: '1rem'
          }}>
            استمع إلى القرآن الكريم بأصوات أشهر القراء ({reciters.length} قارئ متاح)
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                📊 {reciters.filter(r => r.quality === 'ممتازة').length} قارئ بجودة ممتازة
              </span>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                🌐 {Array.from(new Set(reciters.map(r => r.server))).length} خادم متاح
              </span>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>
                🌍 {Array.from(new Set(reciters.map(r => r.country))).length} دولة
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => window.location.href = '/quran'}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
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
              📖 انتقل إلى قراءة القرآن
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
            {/* Search Bar */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                🔍 البحث في القراء:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو البلد أو النوع..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  background: isDarkMode ? '#1e293b' : 'white',
                  color: theme.colors.text,
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Server Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                🌐 اختر الخادم:
              </label>
              <select 
                value={selectedServer} 
                onChange={(e) => setSelectedServer(e.target.value)}
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
                <option value="server6">خادم 6</option>
                <option value="server7">خادم 7</option>
                <option value="server8">خادم 8</option>
                <option value="server9">خادم 9</option>
                <option value="server10">خادم 10</option>
                <option value="server11">خادم 11</option>
                <option value="server12">خادم 12</option>
                <option value="server13">خادم 13</option>
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
                🎙️ اختر القارئ:
              </label>
              <select 
                value={selectedReciter} 
                onChange={(e) => setSelectedReciter(e.target.value)}
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
                {getFilteredReciters()
                  .filter(reciter => reciter.server === selectedServer)
                  .map((reciter) => {
                    const reciterKey = `${reciter.server}-${reciter.id}`;
                    const isFavorite = favorites.includes(reciterKey);
                    return (
                      <option key={reciter.id} value={reciter.id}>
                        {isFavorite ? '⭐ ' : ''}{reciter.name} ({reciter.style}) - {reciter.country} - {reciter.quality}
                      </option>
                    );
                  })}
              </select>
              {selectedReciter && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{
                    fontSize: '0.9rem',
                    color: theme.colors.textSecondary,
                    marginBottom: '0.5rem'
                  }}>
                    {reciters.find(r => r.id === selectedReciter && r.server === selectedServer)?.description}
                  </p>
                  <button
                    onClick={() => toggleFavorite(selectedReciter)}
                    style={{
                      background: favorites.includes(`${selectedServer}-${selectedReciter}`) 
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                        : theme.colors.border,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      color: favorites.includes(`${selectedServer}-${selectedReciter}`) ? 'white' : theme.colors.text,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {favorites.includes(`${selectedServer}-${selectedReciter}`) ? '⭐ إزالة من المفضلة' : '⭐ إضافة للمفضلة'}
                  </button>
                </div>
              )}
            </div>

            {/* Test Audio Button */}
            <div style={{ display: 'flex', alignItems: 'end', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  // Test current reciter with Al-Fatiha
                  playAudio(1);
                }}
                style={{
                  ...buttonStyle,
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                }}
              >
                🔊 اختبار الصوت
              </button>
            </div>
          </div>

          {/* Error Display */}
          {audioError && (
            <div style={{
              background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              color: '#ef4444',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              ⚠️ {audioError}
              <br />
              <small style={{ color: theme.colors.textSecondary }}>
                جرب قارئ آخر أو خادم مختلف أو تأكد من اتصالك بالإنترنت
              </small>
            </div>
          )}

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{
                color: theme.colors.text,
                marginBottom: '0.5rem',
                fontSize: '1.1rem'
              }}>
                ⭐ القراء المفضلون:
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {favorites.map(favoriteKey => {
                  const [server, reciterId] = favoriteKey.split('-');
                  const reciter = reciters.find(r => r.id === reciterId && r.server === server);
                  if (!reciter) return null;
                  
                  return (
                    <button
                      key={favoriteKey}
                      onClick={() => {
                        setSelectedServer(server);
                        setSelectedReciter(reciterId);
                      }}
                      style={{
                        background: (selectedServer === server && selectedReciter === reciterId)
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                          : isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: theme.colors.text,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {reciter.name} ({server})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Playing Info */}
        {currentPlayingSurah && (
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              🎵 يتم تشغيل: {surahs.find(s => s.number === currentPlayingSurah)?.name}
            </h3>
            
            <div style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.05))',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              textAlign: 'center'
            }}>
              <p style={{ color: theme.colors.text, margin: 0 }}>
                يتم التحكم في الصوت من خلال مشغل الصوت أسفل الشاشة
              </p>
            </div>
          </div>
        )}

        {/* Surahs List */}
        {loading ? (
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: theme.colors.text, fontSize: '1.5rem' }}>
              جاري تحميل السور...
            </p>
          </div>
        ) : (
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1.5rem',
              fontSize: '2rem',
              textAlign: 'center'
            }}>
              📖 سور القرآن الكريم
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1rem',
              maxHeight: '600px',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {surahs.map((surah) => {
                const isCurrentlyPlaying = currentPlayingSurah === surah.number;
                
                return (
                  <div 
                    key={surah.number} 
                    style={{
                      background: isCurrentlyPlaying
                        ? isDarkMode 
                          ? 'rgba(59, 130, 246, 0.2)' 
                          : 'rgba(59, 130, 246, 0.1)'
                        : isDarkMode 
                          ? 'rgba(30, 41, 59, 0.3)' 
                          : 'rgba(248, 250, 252, 0.6)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: isCurrentlyPlaying
                        ? '2px solid rgba(59, 130, 246, 0.6)'
                        : `1px solid ${theme.colors.border}`,
                      transform: isCurrentlyPlaying ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => playAudio(surah.number)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{
                          color: isCurrentlyPlaying 
                            ? isDarkMode ? '#60a5fa' : '#1d4ed8'
                            : theme.colors.text,
                          margin: 0,
                          fontSize: '1.2rem',
                          fontFamily: 'Amiri, serif'
                        }}>
                          {surah.number}. {surah.name}
                        </h4>
                        <p style={{
                          color: theme.colors.textSecondary,
                          margin: '0.25rem 0',
                          fontSize: '0.9rem'
                        }}>
                          {surah.englishName} - {surah.englishNameTranslation}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          background: isCurrentlyPlaying 
                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                            : theme.gradients.primary,
                          color: 'white',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          fontSize: '1.5rem',
                          animation: isCurrentlyPlaying && isGlobalPlaying ? 'pulse 1.5s infinite' : 'none'
                        }}>
                          {isCurrentlyPlaying && isGlobalPlaying ? '⏸️' : '▶️'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: theme.colors.textSecondary
                    }}>
                      <span>{surah.numberOfAyahs} آية</span>
                      <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuranAudio;
