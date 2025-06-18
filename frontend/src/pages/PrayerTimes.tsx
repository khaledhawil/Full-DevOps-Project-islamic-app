import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface PrayerTime {
  name: string;
  arabicName: string;
  time: string;
  timestamp: number;
  isPassed: boolean;
  isNext: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PrayerTimes: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { preferences } = useUserPreferences();
  
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeToNext, setTimeToNext] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [locationPermission, setLocationPermission] = useState<string>('prompt');
  const [manualLocation, setManualLocation] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showLocationSearch, setShowLocationSearch] = useState<boolean>(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load location and fetch prayer times
  useEffect(() => {
    initializeLocation();
  }, []);

  // Update prayer status and countdown every second
  useEffect(() => {
    if (prayerTimes.length > 0) {
      updatePrayerStatus();
    }
  }, [currentTime, prayerTimes]);

  const initializeLocation = async () => {
    setLoading(true);
    setError(null);

    // First try to load saved location from localStorage
    const savedLocationStr = localStorage.getItem('prayerTimes_location');
    if (savedLocationStr) {
      try {
        const savedLocation = JSON.parse(savedLocationStr);
        setLocation(savedLocation);
        await fetchPrayerTimes(savedLocation.latitude, savedLocation.longitude);
        return;
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('prayerTimes_location');
      }
    }

    // If no saved location, try GPS
    await getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('الموقع الجغرافي غير مدعوم في متصفحك');
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Get location name from coordinates
      const locationInfo = await getLocationInfo(latitude, longitude);
      
      const locationData: LocationData = {
        latitude,
        longitude,
        city: locationInfo.city || 'Unknown',
        country: locationInfo.country || 'Unknown',
        timezone: locationInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      setLocation(locationData);
      setLocationPermission('granted');

      // Save location to localStorage
      localStorage.setItem('prayerTimes_location', JSON.stringify(locationData));

      await fetchPrayerTimes(latitude, longitude);

    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationPermission('denied');
      
      if (error.code === error.PERMISSION_DENIED) {
        setError('تم رفض إذن الوصول للموقع. يرجى السماح بالوصول للموقع أو إدخال موقعك يدوياً');
      } else if (error.code === error.TIMEOUT) {
        setError('انتهت مهلة تحديد الموقع. جاري المحاولة مرة أخرى...');
        setTimeout(getCurrentLocation, 2000);
        return;
      } else {
        setError('خطأ في تحديد الموقع. يرجى إدخال موقعك يدوياً');
      }
      
      setLoading(false);
    }
  };

  const getLocationInfo = async (lat: number, lng: number): Promise<any> => {
    try {
      // Use Nominatim (OpenStreetMap) reverse geocoding - free and reliable
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar,en`
      );
      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown',
        country: data.address?.country || 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    } catch (error) {
      console.error('Error getting location info:', error);
      return { city: 'Unknown', country: 'Unknown', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    }
  };

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Use Al-Adhan API - reliable and free Islamic prayer times API
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4&tune=0,0,0,0,0,0,0,0,0`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error('Failed to fetch prayer times');
      }

      const timings: PrayerTimings = data.data.timings;
      
      // Convert to our format
      const prayers: PrayerTime[] = [
        { name: 'Fajr', arabicName: 'الفجر', time: timings.Fajr, timestamp: 0, isPassed: false, isNext: false },
        { name: 'Sunrise', arabicName: 'الشروق', time: timings.Sunrise, timestamp: 0, isPassed: false, isNext: false },
        { name: 'Dhuhr', arabicName: 'الظهر', time: timings.Dhuhr, timestamp: 0, isPassed: false, isNext: false },
        { name: 'Asr', arabicName: 'العصر', time: timings.Asr, timestamp: 0, isPassed: false, isNext: false },
        { name: 'Maghrib', arabicName: 'المغرب', time: timings.Maghrib, timestamp: 0, isPassed: false, isNext: false },
        { name: 'Isha', arabicName: 'العشاء', time: timings.Isha, timestamp: 0, isPassed: false, isNext: false }
      ];

      // Convert times to timestamps
      const now = new Date();
      prayers.forEach(prayer => {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerDate = new Date(now);
        prayerDate.setHours(hours, minutes, 0, 0);
        prayer.timestamp = prayerDate.getTime();
      });

      setPrayerTimes(prayers);
      updatePrayerStatus(prayers);
      setLoading(false);

    } catch (error: any) {
      console.error('Error fetching prayer times:', error);
      setError(`خطأ في جلب مواقيت الصلاة: ${error.message}`);
      setLoading(false);
    }
  };

  const updatePrayerStatus = (prayers = prayerTimes) => {
    const now = currentTime.getTime();
    
    // Reset status
    prayers.forEach(prayer => {
      prayer.isPassed = false;
      prayer.isNext = false;
    });

    // Find next prayer
    let nextPrayerIndex = -1;
    for (let i = 0; i < prayers.length; i++) {
      if (prayers[i].timestamp > now) {
        nextPrayerIndex = i;
        break;
      }
    }

    // If no prayer found for today, next prayer is Fajr tomorrow
    if (nextPrayerIndex === -1) {
      nextPrayerIndex = 0;
      const nextFajr = new Date(prayers[0].timestamp + 24 * 60 * 60 * 1000);
      prayers[0].timestamp = nextFajr.getTime();
    }

    // Mark prayers as passed or next
    for (let i = 0; i < prayers.length; i++) {
      if (i < nextPrayerIndex) {
        prayers[i].isPassed = true;
      } else if (i === nextPrayerIndex) {
        prayers[i].isNext = true;
      }
    }

    setNextPrayer(prayers[nextPrayerIndex].arabicName);
    
    // Calculate time to next prayer
    const timeLeft = prayers[nextPrayerIndex].timestamp - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (timeLeft > 0) {
      setTimeToNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setTimeToNext('00:00:00');
    }

    setPrayerTimes([...prayers]);
  };

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ar,en`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const selectLocation = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    const locationData: LocationData = {
      latitude: lat,
      longitude: lng,
      city: result.display_name.split(',')[0],
      country: result.display_name.split(',').slice(-1)[0].trim(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    setLocation(locationData);
    setShowLocationSearch(false);
    setManualLocation('');
    setSearchResults([]);

    // Save location to localStorage
    localStorage.setItem('prayerTimes_location', JSON.stringify(locationData));

    await fetchPrayerTimes(lat, lng);
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPrayerIcon = (name: string): string => {
    const icons: { [key: string]: string } = {
      'Fajr': '🌅',
      'Sunrise': '☀️',
      'Dhuhr': '🌞',
      'Asr': '🌆',
      'Maghrib': '🌇',
      'Isha': '🌙'
    };
    return icons[name] || '🕐';
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
          }
          .prayer-card {
            transition: all 0.3s ease;
          }
          .prayer-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px ${theme.colors.shadow};
          }
          .next-prayer {
            animation: glow 2s infinite;
          }
        `}
      </style>
      
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
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕐</div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              مواقيت الصلاة
            </h1>
            
            {/* Current time and location */}
            <div style={{
              background: isDarkMode 
                ? 'rgba(15, 23, 42, 0.9)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              padding: '1.5rem',
              margin: '0 auto 2rem',
              maxWidth: '500px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: `0 10px 30px ${theme.colors.shadow}`
            }}>
              <div style={{
                fontSize: '2rem',
                color: theme.colors.text,
                marginBottom: '0.5rem',
                fontFamily: 'monospace'
              }}>
                {currentTime.toLocaleTimeString('ar-SA', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit',
                  hour12: true 
                })}
              </div>
              
              {location && (
                <div style={{
                  color: theme.colors.textSecondary,
                  fontSize: '1.1rem'
                }}>
                  📍 {location.city}, {location.country}
                </div>
              )}
              
              {nextPrayer && timeToNext && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '10px',
                  color: 'white'
                }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    الصلاة القادمة: {nextPrayer}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>
                    ⏰ {timeToNext}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location controls */}
          <div style={{
            background: isDarkMode 
              ? 'rgba(15, 23, 42, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 15px 40px ${theme.colors.shadow}`
          }}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              🌍 إعدادات الموقع
            </h3>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              
              {/* GPS Button */}
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📍 استخدام GPS
              </button>
              
              {/* Manual location button */}
              <button
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔍 البحث عن موقع
              </button>
            </div>

            {/* Location search */}
            {showLocationSearch && (
              <div style={{ marginTop: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="ابحث عن مدينة أو بلد..."
                  value={manualLocation}
                  onChange={(e) => {
                    setManualLocation(e.target.value);
                    searchLocation(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                    color: theme.colors.text,
                    fontSize: '1rem',
                    direction: 'rtl'
                  }}
                />
                
                {searchResults.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(248, 250, 252, 0.9)',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => selectLocation(result)}
                        style={{
                          padding: '1rem',
                          cursor: 'pointer',
                          borderBottom: index < searchResults.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                          color: theme.colors.text,
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        📍 {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '2rem',
              textAlign: 'center',
              fontSize: '1.1rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{
              background: isDarkMode 
                ? 'rgba(15, 23, 42, 0.9)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '3rem',
              textAlign: 'center',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: `0 15px 40px ${theme.colors.shadow}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
              <p style={{
                fontSize: '1.5rem',
                color: theme.colors.text,
                margin: 0
              }}>
                جاري تحميل مواقيت الصلاة...
              </p>
            </div>
          )}

          {/* Prayer times grid */}
          {!loading && prayerTimes.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {prayerTimes.map((prayer, index) => (
                <div
                  key={prayer.name}
                  className={`prayer-card ${prayer.isNext ? 'next-prayer' : ''}`}
                  style={{
                    background: prayer.isNext
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      : prayer.isPassed
                        ? isDarkMode 
                          ? 'rgba(30, 41, 59, 0.5)' 
                          : 'rgba(248, 250, 252, 0.5)'
                        : isDarkMode 
                          ? 'rgba(15, 23, 42, 0.9)' 
                          : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: prayer.isNext 
                      ? '2px solid rgba(59, 130, 246, 0.6)'
                      : `1px solid ${theme.colors.border}`,
                    boxShadow: prayer.isNext
                      ? '0 20px 50px rgba(59, 130, 246, 0.3)'
                      : `0 15px 40px ${theme.colors.shadow}`,
                    textAlign: 'center',
                    opacity: prayer.isPassed ? 0.7 : 1
                  }}
                >
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem'
                  }}>
                    {getPrayerIcon(prayer.name)}
                  </div>
                  
                  <h3 style={{
                    color: prayer.isNext ? 'white' : theme.colors.text,
                    fontSize: '1.8rem',
                    margin: '0 0 0.5rem 0',
                    fontFamily: 'Amiri, serif'
                  }}>
                    {prayer.arabicName}
                  </h3>
                  
                  <p style={{
                    color: prayer.isNext 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : theme.colors.textSecondary,
                    fontSize: '1rem',
                    margin: '0 0 1rem 0'
                  }}>
                    {prayer.name}
                  </p>
                  
                  <div style={{
                    color: prayer.isNext ? 'white' : theme.colors.text,
                    fontSize: '2rem',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}>
                    {formatTime(prayer.time)}
                  </div>
                  
                  {prayer.isNext && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '0.9rem',
                      animation: 'pulse 2s infinite'
                    }}>
                      الصلاة القادمة
                    </div>
                  )}
                  
                  {prayer.isPassed && (
                    <div style={{
                      marginTop: '1rem',
                      color: theme.colors.textSecondary,
                      fontSize: '0.9rem'
                    }}>
                      ✓ انتهت
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer info */}
          {!loading && prayerTimes.length > 0 && (
            <div style={{
              background: isDarkMode 
                ? 'rgba(15, 23, 42, 0.9)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: `0 15px 40px ${theme.colors.shadow}`
            }}>
              <p style={{
                color: theme.colors.textSecondary,
                fontSize: '1rem',
                margin: 0,
                lineHeight: '1.6'
              }}>
                🕌 مواقيت الصلاة محسوبة وفقاً للموقع الجغرافي باستخدام طريقة أم القرى<br/>
                📡 البيانات محدثة تلقائياً وتشمل جميع دول العالم
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PrayerTimes;
