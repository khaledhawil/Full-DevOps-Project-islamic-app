import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface HadithBook {
  name: string;
  id: string;
  available: number;
}

interface HadithContent {
  number: number;
  arab: string;
  id: string; // Indonesian translation
}

interface HadithData {
  name: string;
  id: string;
  available: number;
  contents: HadithContent;
}

interface HadithResponse {
  code: number;
  message: string;
  data: HadithData;
  error: boolean;
}

interface BooksResponse {
  code: number;
  message: string;
  data: HadithBook[];
  error: boolean;
}

const Hadith: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { preferences, updateHadithFavorites } = useUserPreferences();
  
  // State management
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('bukhari');
  const [currentHadith, setCurrentHadith] = useState<HadithData | null>(null);
  const [hadithNumber, setHadithNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showArabicOnly, setShowArabicOnly] = useState<boolean>(false);
  const [autoRead, setAutoRead] = useState<boolean>(false);

  useEffect(() => {
    fetchBooks();
    loadFavorites();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetchHadith(hadithNumber);
    }
  }, [selectedBook, hadithNumber]);

  // Load user data when preferences are available
  useEffect(() => {
    if (preferences?.hadith_favorites) {
      setFavorites(preferences.hadith_favorites);
      console.log('Loaded Hadith favorites from database:', preferences.hadith_favorites);
    }
  }, [preferences]);

  // Clear favorites when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  // Save favorites to database whenever favorites change (debounced)
  useEffect(() => {
    if (isAuthenticated && updateHadithFavorites && preferences) {
      // Only update if favorites actually changed from what's in preferences
      const currentFavs = JSON.stringify(favorites.sort());
      const dbFavs = JSON.stringify((preferences.hadith_favorites || []).sort());
      
      if (currentFavs !== dbFavs && favorites.length >= 0) {
        const timeoutId = setTimeout(() => {
          updateHadithFavorites(favorites)
            .then(() => console.log('Saved Hadith favorites to database'))
            .catch(console.error);
        }, 500); // Debounce for 500ms
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [favorites, isAuthenticated, updateHadithFavorites, preferences]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('https://api.hadith.gading.dev/books');
      const data: BooksResponse = await response.json();
      if (data.code === 200) {
        setBooks(data.data);
      }
    } catch (err) {
      setError('فشل في تحميل قائمة الكتب');
      console.error('Error fetching books:', err);
    }
  };

  const fetchHadith = async (number: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.hadith.gading.dev/books/${selectedBook}/${number}`);
      const data: HadithResponse = await response.json();
      if (data.code === 200) {
        setCurrentHadith(data.data);
      } else {
        setError('الحديث غير متوفر');
      }
    } catch (err) {
      setError('فشل في تحميل الحديث');
      console.error('Error fetching hadith:', err);
    }
    setLoading(false);
  };

  const fetchRandomHadith = async () => {
    const book = books.find(b => b.id === selectedBook);
    if (book) {
      const randomNumber = Math.floor(Math.random() * book.available) + 1;
      setHadithNumber(randomNumber);
    }
  };

  const loadFavorites = () => {
    if (!isAuthenticated || !preferences) {
      setFavorites([]);
      return;
    }
    
    setFavorites(preferences.hadith_favorites || []);
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      setError('يجب تسجيل الدخول لحفظ الأحاديث المفضلة');
      return;
    }
    
    if (currentHadith) {
      const favoriteKey = `${selectedBook}-${currentHadith.contents.number}`;
      setFavorites(prev => 
        prev.includes(favoriteKey)
          ? prev.filter(f => f !== favoriteKey)
          : [...prev, favoriteKey]
      );
    }
  };

  const isFavorite = () => {
    if (!currentHadith) return false;
    return favorites.includes(`${selectedBook}-${currentHadith.contents.number}`);
  };

  const navigateHadith = (direction: 'prev' | 'next') => {
    const book = books.find(b => b.id === selectedBook);
    if (!book) return;

    if (direction === 'prev' && hadithNumber > 1) {
      setHadithNumber(hadithNumber - 1);
    } else if (direction === 'next' && hadithNumber < book.available) {
      setHadithNumber(hadithNumber + 1);
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📜</div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            الأحاديث النبوية الشريفة
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: theme.colors.textSecondary,
            marginBottom: '1rem'
          }}>
            استعرض وابحث في أصح الأحاديث النبوية من المصادر المعتمدة
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
                📚 {books.length} كتاب حديث
              </span>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                📖 {books.find(b => b.id === selectedBook)?.available || 0} حديث متاح
              </span>
            </div>
            <div style={{
              background: isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>
                ⭐ {favorites.length} حديث مفضل
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={cardStyle}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Book Selection */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                📚 اختر كتاب الحديث:
              </label>
              <select
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setHadithNumber(1);
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
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name} ({book.available} حديث)
                  </option>
                ))}
              </select>
            </div>

            {/* Hadith Number Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                🔢 رقم الحديث:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="1"
                  max={books.find(b => b.id === selectedBook)?.available || 1}
                  value={hadithNumber}
                  onChange={(e) => setHadithNumber(parseInt(e.target.value) || 1)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    background: isDarkMode ? '#1e293b' : 'white',
                    color: theme.colors.text,
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={fetchRandomHadith}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    padding: '0.75rem 1rem'
                  }}
                >
                  🎲 عشوائي
                </button>
              </div>
            </div>

            {/* Search */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.colors.text,
                fontWeight: 'bold'
              }}>
                🔍 البحث في النص:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في نص الحديث..."
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
          </div>

          {/* Options */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setShowArabicOnly(!showArabicOnly)}
              style={{
                ...buttonStyle,
                background: showArabicOnly ? 'linear-gradient(135deg, #22c55e, #16a34a)' : theme.colors.border
              }}
            >
              {showArabicOnly ? '🇸🇦 عربي فقط' : '🌍 عربي وترجمة'}
            </button>
            
            <button
              onClick={toggleFavorite}
              disabled={!currentHadith}
              style={{
                ...buttonStyle,
                background: isFavorite() 
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                  : theme.colors.border,
                opacity: !currentHadith ? 0.5 : 1
              }}
            >
              {isFavorite() ? '⭐ مفضل' : isAuthenticated ? '☆ أضف للمفضلة' : '🔒 سجل دخولك للحفظ'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            ...cardStyle,
            background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center',
            color: '#ef4444'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: theme.colors.text, fontSize: '1.5rem' }}>
              جاري تحميل الحديث...
            </p>
          </div>
        )}

        {/* Hadith Display */}
        {currentHadith && !loading && (
          <div style={cardStyle}>
            {/* Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <button
                onClick={() => navigateHadith('prev')}
                disabled={hadithNumber <= 1}
                style={{
                  ...buttonStyle,
                  opacity: hadithNumber <= 1 ? 0.5 : 1
                }}
              >
                ← الحديث السابق
              </button>
              
              <div style={{
                background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}>
                <h3 style={{
                  color: '#3b82f6',
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {currentHadith.name} - رقم {currentHadith.contents.number}
                </h3>
              </div>
              
              <button
                onClick={() => navigateHadith('next')}
                disabled={hadithNumber >= (books.find(b => b.id === selectedBook)?.available || 1)}
                style={{
                  ...buttonStyle,
                  opacity: hadithNumber >= (books.find(b => b.id === selectedBook)?.available || 1) ? 0.5 : 1
                }}
              >
                الحديث التالي →
              </button>
            </div>

            {/* Arabic Text */}
            <div style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(110, 231, 183, 0.05))',
              padding: '2rem',
              borderRadius: '15px',
              border: '2px solid rgba(34, 197, 94, 0.3)',
              marginBottom: showArabicOnly ? '0' : '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  fontSize: '2rem',
                  marginLeft: '0.5rem'
                }}>📜</span>
                <h4 style={{
                  color: '#22c55e',
                  margin: 0,
                  fontSize: '1.3rem',
                  fontWeight: 'bold'
                }}>
                  النص العربي:
                </h4>
              </div>
              <p style={{
                fontSize: '1.4rem',
                lineHeight: '2',
                color: theme.colors.text,
                fontFamily: 'Amiri, serif',
                textAlign: 'justify',
                margin: 0,
                fontWeight: '500'
              }}>
                {currentHadith.contents.arab}
              </p>
            </div>

            {/* Translation */}
            {!showArabicOnly && (
              <div style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.1))'
                  : 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(196, 181, 253, 0.05))',
                padding: '2rem',
                borderRadius: '15px',
                border: '2px solid rgba(168, 85, 247, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    fontSize: '2rem',
                    marginLeft: '0.5rem'
                  }}>🌍</span>
                  <h4 style={{
                    color: '#a855f7',
                    margin: 0,
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    الترجمة:
                  </h4>
                </div>
                <p style={{
                  fontSize: '1.2rem',
                  lineHeight: '1.8',
                  color: theme.colors.text,
                  textAlign: 'justify',
                  margin: 0
                }}>
                  {currentHadith.contents.id}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Favorites Section */}
        {isAuthenticated && favorites.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              ⭐ الأحاديث المفضلة لـ {user?.username} ({favorites.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {favorites.map((favorite) => {
                const [bookId, number] = favorite.split('-');
                const book = books.find(b => b.id === bookId);
                return (
                  <button
                    key={favorite}
                    onClick={() => {
                      setSelectedBook(bookId);
                      setHadithNumber(parseInt(number));
                    }}
                    style={{
                      background: (selectedBook === bookId && hadithNumber === parseInt(number))
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '10px',
                      padding: '1rem',
                      color: theme.colors.text,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'right'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {book?.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      رقم {number}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Login Encouragement for Favorites */}
        {!isAuthenticated && (
          <div style={{
            ...cardStyle,
            background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h3 style={{
              color: '#3b82f6',
              marginBottom: '1rem',
              fontSize: '1.5rem'
            }}>
              سجل دخولك لحفظ الأحاديث المفضلة
            </h3>
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              قم بتسجيل الدخول لحفظ الأحاديث المفضلة والوصول إليها في أي وقت
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hadith;
