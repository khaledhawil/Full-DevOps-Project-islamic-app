import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../services/api';

interface TasbehCount {
  phrase: string;
  count: number;
  last_updated?: string;
}

interface PhraseInfo {
  arabic: string;
  english: string;
  transliteration: string;
  reward: string;
  category: string;
}

interface DailyStats {
  today: number;
  streak: number;
  totalToday: number;
  bestDay: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  achieved: boolean;
}

const Tasbeh: React.FC = () => {
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const [selectedPhrase, setSelectedPhrase] = useState('سبحان الله');
  const [count, setCount] = useState(0);
  const [totalCounts, setTotalCounts] = useState<TasbehCount[]>([]);
  const [dailyGoal, setDailyGoal] = useState(100);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoIncrement, setAutoIncrement] = useState(false);
  const [stats, setStats] = useState<DailyStats>({
    today: 0,
    streak: 0,
    totalToday: 0,
    bestDay: 0
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [achievementNotification, setAchievementNotification] = useState<Achievement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const islamicPhrases: { [key: string]: PhraseInfo } = {
    'سبحان الله': {
      arabic: 'سبحان الله',
      english: 'Glory be to Allah',
      transliteration: 'SubhanAllah',
      reward: 'A palm tree is planted in Paradise',
      category: 'praise'
    },
    'الحمد لله': {
      arabic: 'الحمد لله',
      english: 'All praise is due to Allah',
      transliteration: 'Alhamdulillah',
      reward: 'Fills the scales of good deeds',
      category: 'praise'
    },
    'لا إله إلا الله': {
      arabic: 'لا إله إلا الله',
      english: 'There is no god but Allah',
      transliteration: 'La ilaha illa Allah',
      reward: 'The best dhikr',
      category: 'tawheed'
    },
    'الله أكبر': {
      arabic: 'الله أكبر',
      english: 'Allah is the Greatest',
      transliteration: 'Allahu Akbar',
      reward: 'Fills what is between heaven and earth',
      category: 'praise'
    },
    'لا حول ولا قوة إلا بالله': {
      arabic: 'لا حول ولا قوة إلا بالله',
      english: 'There is no power except with Allah',
      transliteration: 'La hawla wa la quwwata illa billah',
      reward: 'A treasure from the treasures of Paradise',
      category: 'dua'
    },
    'أستغفر الله': {
      arabic: 'أستغفر الله',
      english: 'I seek forgiveness from Allah',
      transliteration: 'Astaghfirullah',
      reward: 'Opens the doors of sustenance',
      category: 'istighfar'
    },
    'اللهم صل على محمد': {
      arabic: 'اللهم صل على محمد',
      english: 'O Allah, send prayers upon Muhammad',
      transliteration: 'Allahumma salli ala Muhammad',
      reward: 'Allah sends 10 prayers upon you',
      category: 'salawat'
    },
    'سبحان الله وبحمده': {
      arabic: 'سبحان الله وبحمده',
      english: 'Glory be to Allah and praise be to Him',
      transliteration: 'SubhanAllahi wa bihamdih',
      reward: 'Light on the tongue, heavy on the scales',
      category: 'praise'
    },
    'رب اغفر لي': {
      arabic: 'رب اغفر لي',
      english: 'My Lord, forgive me',
      transliteration: 'Rabbi ghfir li',
      reward: 'Seeking Allah\'s forgiveness',
      category: 'dua'
    },
    'لا إله إلا أنت سبحانك إني كنت من الظالمين': {
      arabic: 'لا إله إلا أنت سبحانك إني كنت من الظالمين',
      english: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers',
      transliteration: 'La ilaha illa anta subhanaka inni kuntu min az-zalimin',
      reward: 'The prayer of Prophet Yunus (AS)',
      category: 'dua'
    }
  };

  const achievements: Achievement[] = [
    { id: '1', title: 'البداية', description: 'أول 10 تسبيحات', icon: '🌱', target: 10, achieved: false },
    { id: '2', title: 'المواظب', description: '100 تسبيحة', icon: '💪', target: 100, achieved: false },
    { id: '3', title: 'المجتهد', description: '1000 تسبيحة', icon: '⭐', target: 1000, achieved: false },
    { id: '4', title: 'سبعة أيام', description: '7 أيام متتالية', icon: '🔥', target: 7, achieved: false },
    { id: '5', title: 'الهدف اليومي', description: 'إكمال الهدف اليومي', icon: '🎯', target: 1, achieved: false },
    { id: '6', title: 'عاشق الذكر', description: '10000 تسبيحة', icon: '👑', target: 10000, achieved: false }
  ];

  const playSound = () => {
    if (soundEnabled) {
      try {
        // Create a pleasant dhikr sound using Web Audio API
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create multiple oscillators for a richer sound
        const oscillator1 = context.createOscillator();
        const oscillator2 = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(context.destination);
        
        // Set frequencies for a pleasant tone
        oscillator1.frequency.value = 440; // A note
        oscillator2.frequency.value = 554.37; // C# note (major third)
        
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        // Create an envelope for smooth attack and decay
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
        
        oscillator1.start(context.currentTime);
        oscillator2.start(context.currentTime);
        oscillator1.stop(context.currentTime + 0.3);
        oscillator2.stop(context.currentTime + 0.3);
        
      } catch (error) {
        console.log('Audio context not available');
      }
    }
  };

  const triggerAnimation = () => {
    setAnimationClass('pulse');
    setTimeout(() => setAnimationClass(''), 300);
  };

  const checkAchievements = (newCount: number, totalToday: number) => {
    // Simple achievement checking logic
    achievements.forEach(achievement => {
      if (!achievement.achieved) {
        let progress = 0;
        switch (achievement.id) {
          case '1':
            progress = newCount;
            break;
          case '2':
            progress = newCount;
            break;
          case '3':
            progress = newCount;
            break;
          case '5':
            progress = totalToday >= dailyGoal ? 1 : 0;
            break;
          case '6':
            progress = newCount;
            break;
        }
        
        if (progress >= achievement.target && !achievement.achieved) {
          achievement.achieved = true;
          // Show achievement notification in page
          setAchievementNotification(achievement);
          
          // Auto hide notification after 5 seconds
          setTimeout(() => {
            setAchievementNotification(null);
          }, 5000);
        }
      }
    });
  };

  const loadTasbehCounts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasbeh/phrases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTotalCounts(data.data);
        // Set current count for selected phrase
        const currentPhrase = data.data.find((t: TasbehCount) => t.phrase === selectedPhrase);
        setCount(currentPhrase?.count || 0);
        
        // Calculate stats
        const totalToday = data.data.reduce((sum: number, t: TasbehCount) => sum + t.count, 0);
        setStats(prev => ({ ...prev, totalToday }));
      }
    } catch (error) {
      console.error('Error loading tasbeh counts:', error);
    }
  }, [token, selectedPhrase]);

  useEffect(() => {
    loadTasbehCounts();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadTasbehCounts]);

  useEffect(() => {
    if (autoIncrement) {
      intervalRef.current = setInterval(() => {
        incrementCount();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoIncrement]);

  const incrementCount = async () => {
    const newCount = count + 1;
    setCount(newCount);

    // Visual and audio feedback
    triggerAnimation();
    playSound();

    // Vibration feedback
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Check achievements
    checkAchievements(newCount, stats.totalToday + 1);

    // Save to backend
    try {
      const response = await fetch(`${API_BASE_URL}/tasbeh/count`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phrase: selectedPhrase,
          amount: 1
        })
      });
      
      if (response.ok) {
        // Update local state
        setTotalCounts((prev: TasbehCount[]) => {
          const updated = [...prev];
          const index = updated.findIndex(t => t.phrase === selectedPhrase);
          if (index >= 0) {
            updated[index].count = newCount;
          } else {
            updated.push({ phrase: selectedPhrase, count: newCount });
          }
          return updated;
        });
        
        // Update daily stats
        setStats(prev => ({ ...prev, totalToday: prev.totalToday + 1 }));
      }
    } catch (error) {
      console.error('Error saving count:', error);
      // Revert on error
      setCount(count);
    }
  };

  const resetCount = async () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين العداد؟')) {
      setCount(0);
      
      try {
        const response = await fetch(`${API_BASE_URL}/tasbeh/reset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phrase: selectedPhrase
          })
        });
        
        if (response.ok) {
          setTotalCounts(prev => 
            prev.map(t => 
              t.phrase === selectedPhrase ? { ...t, count: 0 } : t
            )
          );
        }
      } catch (error) {
        console.error('Error resetting count:', error);
      }
    }
  };

  const changePhrase = (phrase: string) => {
    setSelectedPhrase(phrase);
    const phraseCount = totalCounts.find(t => t.phrase === phrase);
    setCount(phraseCount?.count || 0);
  };

  const currentPhraseInfo = islamicPhrases[selectedPhrase];
  const progress = Math.min((count / dailyGoal) * 100, 100);
  const totalDhikr = totalCounts.reduce((sum, t) => sum + t.count, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.background}, #f8f9fa)`,
      padding: '1rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Enhanced Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: theme.colors.text
        }}>
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '300',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📿 التسبيح الرقمي المتطور
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '1.2rem', 
            opacity: 0.9 
          }}>
            Advanced Digital Tasbih Counter
          </p>
          
          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            maxWidth: '600px',
            margin: '1.5rem auto 0'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                {totalDhikr.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>إجمالي التسبيحات</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#764ba2' }}>
                {stats.totalToday.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>اليوم</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                {stats.streak}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>أيام متتالية</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                {Math.round((stats.totalToday / dailyGoal) * 100)}%
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>الهدف اليومي</div>
            </div>
          </div>
        </div>
        
        {/* Achievement Notification */}
        {achievementNotification && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 1000,
            animation: 'slideInDown 0.5s ease-out',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              🎉 {achievementNotification.icon}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              إنجاز جديد: {achievementNotification.title}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {achievementNotification.description}
            </div>
            <button 
              onClick={() => setAchievementNotification(null)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                opacity: 0.7
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Settings and Achievement Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 24px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
            }}
          >
            ⚙️ الإعدادات
          </button>
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            style={{
              background: 'linear-gradient(135deg, #f39c12, #e67e22)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 24px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)'
            }}
          >
            🏆 الإنجازات
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', color: '#2c3e50' }}>
              ⚙️ إعدادات التسبيح
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  الهدف اليومي
                </label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #ecf0f1',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={vibrationEnabled}
                    onChange={(e) => setVibrationEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  📳 تفعيل الاهتزاز
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  🔊 تفعيل الصوت
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={autoIncrement}
                    onChange={(e) => setAutoIncrement(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  ⏱️ العد التلقائي (كل ثانية)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Panel */}
        {showAchievements && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', color: '#2c3e50' }}>
              🏆 الإنجازات
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  style={{
                    background: achievement.achieved 
                      ? 'linear-gradient(135deg, #2ecc71, #27ae60)' 
                      : '#f8f9fa',
                    color: achievement.achieved ? 'white' : '#2c3e50',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                    opacity: achievement.achieved ? 1 : 0.6
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {achievement.icon}
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    {achievement.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Enhanced Main Counter */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            borderRadius: '25px',
            padding: '2.5rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)`,
              pointerEvents: 'none'
            }} />
            
            {/* Current Phrase Info */}
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
              <div style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '0.5rem',
                direction: 'rtl'
              }}>
                {currentPhraseInfo.arabic}
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: '#7f8c8d',
                marginBottom: '0.5rem'
              }}>
                {currentPhraseInfo.transliteration}
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#7f8c8d'
              }}>
                {currentPhraseInfo.english}
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#667eea',
                display: 'inline-block'
              }}>
                {currentPhraseInfo.category}
              </div>
            </div>

            {/* Enhanced Counter Display */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              width: 'clamp(180px, 25vw, 220px)',
              height: 'clamp(180px, 25vw, 220px)',
              margin: '2rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4), 0 5px 15px rgba(0,0,0,0.1)',
              userSelect: 'none',
              position: 'relative',
              transform: animationClass === 'pulse' ? 'scale(1.05)' : 'scale(1)'
            }}
            onClick={incrementCount}
            onMouseDown={(e: any) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e: any) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e: any) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Ripple effect */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                transform: 'translate(-50%, -50%)',
                animation: animationClass === 'pulse' ? 'ripple 0.6s ease-out' : 'none'
              }} />
              
              <div style={{
                color: 'white',
                fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                {count.toLocaleString()}
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.8rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                  التقدم اليومي
                </span>
                <span style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: 'bold' }}>
                  {count}/{dailyGoal}
                </span>
              </div>
              <div style={{
                background: '#ecf0f1',
                borderRadius: '15px',
                height: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  height: '100%',
                  width: `${progress}%`,
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '15px',
                  position: 'relative'
                }}>
                  {progress > 10 && (
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {Math.round(progress)}%
                    </div>
                  )}
                </div>
              </div>
              {progress >= 100 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  color: '#27ae60',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  🎉 أحسنت! لقد حققت هدفك اليومي
                </div>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={resetCount}
                style={{
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🔄 إعادة تعيين
              </button>
              
              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                style={{
                  background: vibrationEnabled 
                    ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
                    : 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 15px rgba(${vibrationEnabled ? '39, 174, 96' : '149, 165, 166'}, 0.3)`,
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📳 {vibrationEnabled ? 'تشغيل' : 'إيقاف'}
              </button>
              
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: soundEnabled 
                    ? 'linear-gradient(135deg, #3498db, #2980b9)' 
                    : 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 15px rgba(${soundEnabled ? '52, 152, 219' : '149, 165, 166'}, 0.3)`,
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🔊 {soundEnabled ? 'تشغيل' : 'إيقاف'}
              </button>
            </div>

            {/* Enhanced Reward Info */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '15px',
              fontSize: '0.95rem',
              color: '#495057',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#667eea' }}>
                ✨ الأجر والثواب
              </div>
              <div style={{ lineHeight: '1.5' }}>
                {currentPhraseInfo.reward}
              </div>
            </div>
          </div>

          {/* Enhanced Phrases Selection */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            borderRadius: '25px',
            padding: '2.5rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h2 style={{
              margin: '0 0 2rem 0',
              color: '#2c3e50',
              textAlign: 'center',
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}>
              🤲 اختر الذكر المفضل
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {Object.keys(islamicPhrases).map((phrase) => {
                const phraseInfo = islamicPhrases[phrase];
                const phraseCount = totalCounts.find((t: TasbehCount) => t.phrase === phrase)?.count || 0;
                const isSelected = phrase === selectedPhrase;
                
                return (
                  <button
                    key={phrase}
                    onClick={() => changePhrase(phrase)}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                        : 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                      color: isSelected ? 'white' : '#2c3e50',
                      border: isSelected ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                      borderRadius: '18px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textAlign: 'right',
                      direction: 'rtl',
                      boxShadow: isSelected 
                        ? '0 10px 30px rgba(102, 126, 234, 0.4)' 
                        : '0 5px 15px rgba(0,0,0,0.08)',
                      transform: isSelected ? 'translateY(-3px)' : 'translateY(0)'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef, #dee2e6)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {phraseInfo.arabic}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      opacity: 0.8,
                      marginBottom: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      {phraseInfo.transliteration}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      opacity: 0.7,
                      marginBottom: '1rem',
                      lineHeight: '1.4'
                    }}>
                      {phraseInfo.english}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{
                        background: isSelected 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'rgba(102, 126, 234, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        color: isSelected ? 'white' : '#667eea'
                      }}>
                        #{phraseInfo.category}
                      </div>
                      <div style={{
                        background: isSelected 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'rgba(39, 174, 96, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        color: isSelected ? 'white' : '#27ae60'
                      }}>
                        {phraseCount.toLocaleString()} مرة
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Add CSS animations */}
        <style>
          {`
            @keyframes ripple {
              0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
              }
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes slideInDown {
              from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
              }
              to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Tasbeh;
