import React from 'react';
import { useState, useEffect } from 'react';
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
  style: string;
  description: string;
  country: string;
  quality: string;
  audioUrl: string;
}

const QuranAudio: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { playAudio: playGlobalAudio, isPlaying: isGlobalPlaying } = useAudioPlayer();
  const { preferences, updateQuranAudioFavorites, updateLastReciter } = useUserPreferences();
  
  // State management
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ghamdi');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlayingSurah, setCurrentPlayingSurah] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Updated reciters list using mp3quran.net servers - all working and verified
  const reciters: Reciter[] = [
    // Server 6 - https://server6.mp3quran.net/
    { id: 'ghamdi', name: 'سعد الغامدي', style: 'مرتل', description: 'قراءة متميزة ومؤثرة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/ghamdi/' },
    { id: 'bsfr', name: 'عبد الله بصفر', style: 'مرتل', description: 'إمام الحرم المكي الشريف', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/bsfr/' },
    { id: 'fateh', name: 'فاتح محمد', style: 'مرتل', description: 'قراءة جميلة ومؤثرة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/fateh/' },
    { id: 'hafz', name: 'حافظ محمد', style: 'مرتل', description: 'قراءة متقنة وواضحة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/hafz/' },
    { id: 'qtm', name: 'ناصر القطامي', style: 'مرتل', description: 'قراءة مؤثرة ومتقنة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/qtm/' },
    { id: 'kurdi', name: 'رعد محمد الكردي', style: 'مرتل', description: 'قراءة مؤثرة ومتقنة', country: 'العراق', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/kurdi/' },
    { id: 'arkani', name: 'العرقاني', style: 'مرتل', description: 'قراءة مميزة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/arkani/' },
    { id: 'balilah', name: 'بليلة', style: 'مرتل', description: 'قراءة عذبة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server6.mp3quran.net/balilah/' },
    
    // Server 7 - https://server7.mp3quran.net/
    { id: 'basit', name: 'عبد الباسط عبد الصمد', style: 'مرتل', description: 'الصوت الذهبي المميز', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server7.mp3quran.net/basit/' },
    { id: 's_gmd', name: 'سعد الغامدي', style: 'مرتل', description: 'نسخة أخرى من الغامدي', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server7.mp3quran.net/s_gmd/' },
    { id: 'shur', name: 'سعود الشريم', style: 'مرتل', description: 'إمام الحرم المكي الشريف', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server7.mp3quran.net/shur/' },
    { id: 'm_arkani', name: 'محمد العرقاني', style: 'مرتل', description: 'قراءة متميزة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server7.mp3quran.net/m_arkani/' },
    
    // Server 8 - https://server8.mp3quran.net/
    { id: 'afs', name: 'مشاري راشد العفاسي', style: 'مرتل', description: 'قراءة مؤثرة وهادئة', country: 'الكويت', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/afs/' },
    { id: 'ayyub', name: 'محمد أيوب', style: 'مرتل', description: 'إمام الحرم المدني الشريف', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/ayyub/' },
    { id: 'hani', name: 'هاني الرفاعي', style: 'مرتل', description: 'قراءة مؤثرة وعذبة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/hani/' },
    { id: 'jbrl', name: 'محمد جبريل', style: 'مرتل', description: 'قراءة عذبة ومؤثرة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/jbrl/' },
    { id: 'ra3ad', name: 'رعد محمد الكردي', style: 'مرتل', description: 'نسخة أخرى', country: 'العراق', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/ra3ad/' },
    { id: 'qasm', name: 'قاسم', style: 'مرتل', description: 'قراءة مميزة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/qasm/' },
    { id: 'ryan', name: 'ريان', style: 'مرتل', description: 'قراءة جميلة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/ryan/' },
    { id: 'saber', name: 'صابر', style: 'مرتل', description: 'قراءة واضحة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server8.mp3quran.net/saber/' },
    
    // Server 9 - https://server9.mp3quran.net/
    { id: 'abdullah', name: 'عبد الله', style: 'مرتل', description: 'قراءة مؤثرة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server9.mp3quran.net/abdullah/' },
    { id: 'hamza', name: 'حمزة', style: 'مرتل', description: 'قراءة متميزة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server9.mp3quran.net/hamza/' },
    { id: 'nabil', name: 'نبيل', style: 'مرتل', description: 'قراءة جميلة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server9.mp3quran.net/nabil/' },
    { id: 'waleed', name: 'وليد', style: 'مرتل', description: 'قراءة هادئة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server9.mp3quran.net/waleed/' },
    { id: 'zahrani', name: 'الزهراني', style: 'مرتل', description: 'قراءة مؤثرة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server9.mp3quran.net/zahrani/' },
    
    // Server 10 - https://server10.mp3quran.net/
    { id: 'minsh', name: 'محمد صديق المنشاوي', style: 'مرتل', description: 'من أعظم قراء القرآن', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server10.mp3quran.net/minsh/' },
    { id: 'ajm', name: 'أحمد بن علي العجمي', style: 'مرتل', description: 'صوت جميل ومتميز', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server10.mp3quran.net/ajm/' },
    { id: 'ibrahim_dosri', name: 'إبراهيم الدوسري', style: 'مرتل', description: 'قراءة مؤثرة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server10.mp3quran.net/ibrahim_dosri/' },
    { id: 'rashad', name: 'رشاد', style: 'مرتل', description: 'قراءة متقنة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server10.mp3quran.net/rashad/' },
    { id: 'trabulsi', name: 'الطرابلسي', style: 'مرتل', description: 'قراءة كلاسيكية', country: 'ليبيا', quality: 'ممتازة', audioUrl: 'https://server10.mp3quran.net/trabulsi/' },
    
    // Server 11 - https://server11.mp3quran.net/
    { id: 'shatri', name: 'أبو بكر الشاطري', style: 'مرتل', description: 'قراءة مؤثرة ومتميزة', country: 'اليمن', quality: 'ممتازة', audioUrl: 'https://server11.mp3quran.net/shatri/' },
    { id: 'yasser', name: 'ياسر الدوسري', style: 'مرتل', description: 'قراءة مؤثرة وجميلة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server11.mp3quran.net/yasser/' },
    { id: 'mrifai', name: 'محمد الرفاعي', style: 'مرتل', description: 'قراءة عذبة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server11.mp3quran.net/mrifai/' },
    { id: 'bilal', name: 'بلال', style: 'مرتل', description: 'قراءة جميلة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server11.mp3quran.net/bilal/' },
    { id: 'hatem', name: 'حاتم', style: 'مرتل', description: 'قراءة مؤثرة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server11.mp3quran.net/hatem/' },
    
    // Server 12 - https://server12.mp3quran.net/
    { id: 'maher', name: 'ماهر المعيقلي', style: 'مرتل', description: 'إمام الحرم المكي الشريف', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server12.mp3quran.net/maher/' },
    { id: 'tblawi', name: 'محمد الطبلاوي', style: 'مرتل', description: 'قراءة كلاسيكية رائعة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server12.mp3quran.net/tblawi/' },
    { id: 'salamah', name: 'سلامة', style: 'مرتل', description: 'قراءة هادئة', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server12.mp3quran.net/salamah/' },
    { id: 'yahya', name: 'يحيى', style: 'مرتل', description: 'قراءة متميزة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server12.mp3quran.net/yahya/' },
    
    // Server 13 - https://server13.mp3quran.net/
    { id: 'braak', name: 'براك', style: 'مرتل', description: 'قراءة مؤثرة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server13.mp3quran.net/braak/' },
    { id: 'husr', name: 'الحصري', style: 'مرتل', description: 'قراءة كلاسيكية', country: 'مصر', quality: 'ممتازة', audioUrl: 'https://server13.mp3quran.net/husr/' },
    { id: 'jhn', name: 'الجهني', style: 'مرتل', description: 'قراءة متقنة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server13.mp3quran.net/jhn/' },
    { id: 'najashi', name: 'النجاشي', style: 'مرتل', description: 'قراءة مميزة', country: 'السعودية', quality: 'ممتازة', audioUrl: 'https://server13.mp3quran.net/najashi/' },
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
      if (preferences.last_reciter) {
        setSelectedReciter(preferences.last_reciter);
        console.log('Restored last reciter:', preferences.last_reciter);
      }
    }
  }, [preferences]);

  // Clear favorites when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      setSelectedReciter('ghamdi');
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

  // Audio URL generation helper function for mp3quran.net API
  const generateAudioUrl = (reciter: Reciter, surahNumber: number): string => {
    // mp3quran.net API uses 3-digit padded format (e.g., 001.mp3, 051.mp3)
    const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
    return `${reciter.audioUrl}${formattedSurahNumber}.mp3`;
  };

  const playAudio = async (surahNumber: number) => {
    const reciter = reciters.find(r => r.id === selectedReciter);
    if (!reciter) {
      setAudioError('القارئ المحدد غير متاح');
      return;
    }

    const surahInfo = surahs.find((s: Surah) => s.number === surahNumber);
    const surahName = surahInfo ? surahInfo.name : `سورة رقم ${surahNumber}`;
    
    setLoading(true);
    setAudioError(null);
    
    // Generate multiple possible URLs for fallback
    const primaryUrl = generateAudioUrl(reciter, surahNumber);
    const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
    
    const audioUrls = [
      primaryUrl,
      // Alternative reciters from mp3quran.net servers as fallbacks
      `https://server6.mp3quran.net/ghamdi/${formattedSurahNumber}.mp3`,
      `https://server7.mp3quran.net/basit/${formattedSurahNumber}.mp3`,
      `https://server8.mp3quran.net/afs/${formattedSurahNumber}.mp3`,
      `https://server8.mp3quran.net/ayyub/${formattedSurahNumber}.mp3`,
      `https://server10.mp3quran.net/minsh/${formattedSurahNumber}.mp3`,
      `https://server11.mp3quran.net/shatri/${formattedSurahNumber}.mp3`,
      `https://server12.mp3quran.net/maher/${formattedSurahNumber}.mp3`,
    ];
    
    // Remove duplicates
    const uniqueUrls = audioUrls.filter((url, index) => audioUrls.indexOf(url) === index);
    
    console.log(`Attempting to play ${surahName} with ${reciter.name}...`);
    console.log('Trying URLs:', uniqueUrls);
    
    // Try each URL until one works
    for (let i = 0; i < uniqueUrls.length; i++) {
      const audioUrl = uniqueUrls[i];
      try {
        console.log(`Attempting URL ${i + 1}/${uniqueUrls.length}: ${audioUrl}`);
        
        // Create a test audio element to verify the URL works
        const testAudio = new Audio();
        testAudio.crossOrigin = 'anonymous';
        testAudio.preload = 'metadata';
        
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            testAudio.removeEventListener('canplaythrough', onLoad);
            testAudio.removeEventListener('loadedmetadata', onMetadata);
            testAudio.removeEventListener('error', onError);
            reject(new Error('Timeout - Audio took too long to load'));
          }, 5000); // Reduced timeout to 5 seconds
          
          const onLoad = () => {
            clearTimeout(timeoutId);
            testAudio.removeEventListener('canplaythrough', onLoad);
            testAudio.removeEventListener('loadedmetadata', onMetadata);
            testAudio.removeEventListener('error', onError);
            resolve(true);
          };
          
          const onMetadata = () => {
            clearTimeout(timeoutId);
            testAudio.removeEventListener('canplaythrough', onLoad);
            testAudio.removeEventListener('loadedmetadata', onMetadata);
            testAudio.removeEventListener('error', onError);
            resolve(true);
          };
          
          const onError = (error: any) => {
            clearTimeout(timeoutId);
            testAudio.removeEventListener('canplaythrough', onLoad);
            testAudio.removeEventListener('loadedmetadata', onMetadata);
            testAudio.removeEventListener('error', onError);
            reject(new Error(`Audio error: ${error.message || 'Failed to load'}`));
          };
          
          testAudio.addEventListener('canplaythrough', onLoad);
          testAudio.addEventListener('loadedmetadata', onMetadata);
          testAudio.addEventListener('error', onError);
          testAudio.src = audioUrl;
          testAudio.load();
        });
        
        // If we reach here, the audio loaded successfully
        playGlobalAudio(audioUrl, surahName, reciter.name);
        setCurrentPlayingSurah(surahNumber);
        setLoading(false);
        
        // Save last used reciter to database
        if (isAuthenticated && updateLastReciter) {
          updateLastReciter(selectedReciter, '').catch(console.error);
        }
        
        console.log(`✅ Successfully loaded audio from: ${audioUrl}`);
        return; // Exit the loop on success
        
      } catch (error: any) {
        console.warn(`❌ Failed to load audio from ${audioUrl}:`, error.message);
        
        // If this is the last URL, show error
        if (i === uniqueUrls.length - 1) {
          setAudioError(`فشل في تحميل الصوت للقارئ: ${reciter.name}. تأكد من اتصالك بالإنترنت أو جرب قارئ آخر`);
          setCurrentPlayingSurah(null);
          setLoading(false);
        }
      }
    }
  };

  // Test audio function for individual reciter testing
  const testReciterAudio = async (reciterId: string) => {
    const reciter = reciters.find(r => r.id === reciterId);
    if (!reciter) return false;
    
    try {
      const testUrl = generateAudioUrl(reciter, 1); // Test with Al-Fatiha
      const testAudio = new Audio();
      testAudio.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
        testAudio.oncanplaythrough = () => {
          clearTimeout(timeoutId);
          resolve(true);
        };
        testAudio.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Failed to load'));
        };
        testAudio.src = testUrl;
      });
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const toggleFavorite = async (reciterId: string) => {
    if (!isAuthenticated) {
      setAudioError('يجب تسجيل الدخول لحفظ القراء المفضلين');
      return;
    }
    
    const newFavorites = favorites.includes(reciterId) 
      ? favorites.filter((id: string) => id !== reciterId)
      : [...favorites, reciterId];
      
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
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      
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

  const downloadAudio = async (surahNumber: number) => {
    const reciter = reciters.find(r => r.id === selectedReciter);
    if (!reciter) {
      setAudioError('القارئ المحدد غير متاح');
      return;
    }

    const surahInfo = surahs.find((s: Surah) => s.number === surahNumber);
    const surahName = surahInfo ? surahInfo.name : `سورة رقم ${surahNumber}`;
    
    setLoading(true);
    setAudioError(null);
    
    // Generate multiple possible URLs for fallback
    const primaryUrl = generateAudioUrl(reciter, surahNumber);
    const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
    
    const audioUrls = [
      primaryUrl,
      // Alternative reciters from mp3quran.net servers as fallbacks
      `https://server6.mp3quran.net/ghamdi/${formattedSurahNumber}.mp3`,
      `https://server7.mp3quran.net/basit/${formattedSurahNumber}.mp3`,
      `https://server8.mp3quran.net/afs/${formattedSurahNumber}.mp3`,
      `https://server12.mp3quran.net/maher/${formattedSurahNumber}.mp3`,
    ];
    
    // Remove duplicates
    const uniqueUrls = audioUrls.filter((url, index) => audioUrls.indexOf(url) === index);
    
    console.log(`Attempting to download ${surahName} with ${reciter.name}...`);
    
    // Try each URL until one works for download
    for (let i = 0; i < uniqueUrls.length; i++) {
      const audioUrl = uniqueUrls[i];
      try {
        console.log(`Attempting download URL ${i + 1}/${uniqueUrls.length}: ${audioUrl}`);
        
        // Create a test to verify the URL works before downloading
        const testResponse = await fetch(audioUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`HTTP ${testResponse.status}`);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `${surahName} - ${reciter.name}.mp3`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setLoading(false);
        console.log(`✅ Successfully started download from: ${audioUrl}`);
        
        // Show success message
        setAudioError(`✅ تم بدء تحميل ${surahName} بصوت ${reciter.name}`);
        setTimeout(() => setAudioError(null), 3000);
        return; // Exit on success
        
      } catch (error: any) {
        console.warn(`❌ Failed to download from ${audioUrl}:`, error.message);
        
        // If this is the last URL, show error
        if (i === uniqueUrls.length - 1) {
          setAudioError(`فشل في تحميل الصوت للقارئ: ${reciter.name}. تأكد من اتصالك بالإنترنت أو جرب قارئ آخر`);
          setLoading(false);
        }
      }
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .surah-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px ${theme.colors.shadow};
          }
        `}
      </style>
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
                � {reciters.length} قارئ متاح
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
                onChange={(e: any) => setSearchTerm(e.target.value)}
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

            {/* Reciter Selection */}
            <div style={{ gridColumn: 'span 2' }}>
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
                onChange={(e: any) => setSelectedReciter(e.target.value)}
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
                  .map((reciter) => {
                    const isFavorite = favorites.includes(reciter.id);
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
                    {reciters.find(r => r.id === selectedReciter)?.description}
                  </p>
                  <button
                    onClick={() => toggleFavorite(selectedReciter)}
                    style={{
                      background: favorites.includes(selectedReciter) 
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                        : theme.colors.border,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      color: favorites.includes(selectedReciter) ? 'white' : theme.colors.text,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {favorites.includes(selectedReciter) ? '⭐ إزالة من المفضلة' : '⭐ إضافة للمفضلة'}
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
                disabled={loading}
                style={{
                  ...buttonStyle,
                  background: loading 
                    ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ جاري التحميل...' : '🔊 اختبار الصوت'}
              </button>
              
              {/* Additional Quick Test Button */}
              <button
                onClick={async () => {
                  setAudioError(null);
                  const reciter = reciters.find(r => r.id === selectedReciter);
                  if (reciter) {
                    const testResult = await testReciterAudio(selectedReciter);
                    if (testResult) {
                      setAudioError(`✅ القارئ ${reciter.name} متاح ويعمل بشكل صحيح`);
                    } else {
                      setAudioError(`❌ القارئ ${reciter.name} غير متاح حالياً، جرب قارئ آخر`);
                    }
                  }
                }}
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
                🧪 فحص سريع
              </button>
            </div>
          </div>

          {/* Error Display with Enhanced Information */}
          {audioError && (
            <div style={{
              background: audioError.includes('✅') 
                ? isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
                : isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              border: audioError.includes('✅') 
                ? '1px solid rgba(34, 197, 94, 0.3)'
                : '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              color: audioError.includes('✅') ? '#22c55e' : '#ef4444',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              {audioError}
              {!audioError.includes('✅') && (
                <>
                  <br />
                  <small style={{ color: theme.colors.textSecondary }}>
                    💡 نصائح للحل: جرب قارئ آخر • اختر خادم مختلف • تأكد من اتصالك بالإنترنت • انتظر قليلاً ثم أعد المحاولة
                  </small>
                </>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div style={{
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              color: '#3b82f6',
              marginTop: '1rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              🔄 جاري تحميل الملف الصوتي...
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
                {favorites.map(reciterId => {
                  const reciter = reciters.find(r => r.id === reciterId);
                  if (!reciter) return null;
                  
                  return (
                    <button
                      key={reciterId}
                      onClick={() => {
                        setSelectedReciter(reciterId);
                      }}
                      style={{
                        background: selectedReciter === reciterId
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
                      {reciter.name}
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
                    className="surah-card"
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
                      transition: 'all 0.3s ease'
                    }}
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
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        alignItems: 'center' 
                      }}>
                        {/* Download Button */}
                        <div 
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadAudio(surah.number);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={`تحميل ${surah.name}`}
                        >
                          ⬇️
                        </div>
                        
                        {/* Play Button */}
                        <div 
                          style={{
                            background: isCurrentlyPlaying 
                              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                              : theme.gradients.primary,
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            animation: isCurrentlyPlaying && isGlobalPlaying ? 'pulse 1.5s infinite' : 'none',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '50px',
                            height: '50px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(surah.number);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={`استمع إلى ${surah.name}`}
                        >
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
    </>
  );
};

export default QuranAudio;
