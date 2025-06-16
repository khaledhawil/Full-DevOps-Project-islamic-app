import React, { useState, useEffect, useCallback } from 'react';
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
}

const Tasbeh: React.FC = () => {
  const { token } = useAuthStore(); // Removed unused 'user'
  const { theme } = useTheme();
  const [selectedPhrase, setSelectedPhrase] = useState('سبحان الله');
  const [count, setCount] = useState(0);
  const [totalCounts, setTotalCounts] = useState<TasbehCount[]>([]);
  const [dailyGoal] = useState(100); // Removed unused setDailyGoal
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const islamicPhrases: { [key: string]: PhraseInfo } = {
    'سبحان الله': {
      arabic: 'سبحان الله',
      english: 'Glory be to Allah',
      transliteration: 'SubhanAllah',
      reward: 'A palm tree is planted in Paradise'
    },
    'الحمد لله': {
      arabic: 'الحمد لله',
      english: 'All praise is due to Allah',
      transliteration: 'Alhamdulillah',
      reward: 'Fills the scales of good deeds'
    },
    'لا إله إلا الله': {
      arabic: 'لا إله إلا الله',
      english: 'There is no god but Allah',
      transliteration: 'La ilaha illa Allah',
      reward: 'The best dhikr'
    },
    'الله أكبر': {
      arabic: 'الله أكبر',
      english: 'Allah is the Greatest',
      transliteration: 'Allahu Akbar',
      reward: 'Fills what is between heaven and earth'
    },
    'لا حول ولا قوة إلا بالله': {
      arabic: 'لا حول ولا قوة إلا بالله',
      english: 'There is no power except with Allah',
      transliteration: 'La hawla wa la quwwata illa billah',
      reward: 'A treasure from the treasures of Paradise'
    },
    'أستغفر الله': {
      arabic: 'أستغفر الله',
      english: 'I seek forgiveness from Allah',
      transliteration: 'Astaghfirullah',
      reward: 'Opens the doors of sustenance'
    },
    'اللهم صل على محمد': {
      arabic: 'اللهم صل على محمد',
      english: 'O Allah, send prayers upon Muhammad',
      transliteration: 'Allahumma salli ala Muhammad',
      reward: 'Allah sends 10 prayers upon you'
    }
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
      }
    } catch (error) {
      console.error('Error loading tasbeh counts:', error);
    }
  }, [token, selectedPhrase]);

  useEffect(() => {
    loadTasbehCounts();
  }, [loadTasbehCounts]);

  const incrementCount = async () => {
    const newCount = count + 1;
    setCount(newCount);

    // Vibration feedback
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }

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
        setTotalCounts(prev => {
          const updated = [...prev];
          const index = updated.findIndex(t => t.phrase === selectedPhrase);
          if (index >= 0) {
            updated[index].count = newCount;
          } else {
            updated.push({ phrase: selectedPhrase, count: newCount });
          }
          return updated;
        });
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
      background: theme.colors.background,
      padding: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: theme.colors.text
        }}>
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '3rem',
            fontWeight: '300',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            📿 التسبيح الرقمي
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '1.2rem', 
            opacity: 0.9 
          }}>
            Digital Tasbih Counter
          </p>
          <div style={{
            marginTop: '1rem',
            fontSize: '1.1rem',
            opacity: 0.8
          }}>
            إجمالي التسبيحات: {totalDhikr.toLocaleString()}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Main Counter */}
          <div style={{
            background: theme.colors.surface,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: `0 20px 40px ${theme.colors.shadow}`,
            textAlign: 'center'
          }}>
            {/* Current Phrase Info */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: '0.5rem',
                direction: 'rtl'
              }}>
                {currentPhraseInfo.arabic}
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: theme.colors.textSecondary,
                marginBottom: '0.5rem'
              }}>
                {currentPhraseInfo.transliteration}
              </div>
              <div style={{
                fontSize: '1rem',
                color: theme.colors.textSecondary
              }}>
                {currentPhraseInfo.english}
              </div>
            </div>

            {/* Counter Display */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              width: '200px',
              height: '200px',
              margin: '2rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
              userSelect: 'none'
            }}
            onClick={incrementCount}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                color: 'white',
                fontSize: '3rem',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {count}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                  التقدم اليومي
                </span>
                <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                  {count}/{dailyGoal}
                </span>
              </div>
              <div style={{
                background: '#ecf0f1',
                borderRadius: '10px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  height: '100%',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                  borderRadius: '10px'
                }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={resetCount}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#c0392b'}
                onMouseOut={(e) => e.currentTarget.style.background = '#e74c3c'}
              >
                🔄 إعادة تعيين
              </button>
              
              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                style={{
                  background: vibrationEnabled ? '#27ae60' : '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 12px rgba(${vibrationEnabled ? '39, 174, 96' : '149, 165, 166'}, 0.3)`
                }}
              >
                📳 {vibrationEnabled ? 'تشغيل' : 'إيقاف'} الاهتزاز
              </button>
            </div>

            {/* Reward Info */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              fontSize: '0.9rem',
              color: '#495057'
            }}>
              <strong>الأجر:</strong> {currentPhraseInfo.reward}
            </div>
          </div>

          {/* Phrases Selection */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1.5rem 0',
              color: '#2c3e50',
              textAlign: 'center',
              fontSize: '1.8rem'
            }}>
              اختر الذكر
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {Object.keys(islamicPhrases).map((phrase) => {
                const phraseInfo = islamicPhrases[phrase];
                const phraseCount = totalCounts.find(t => t.phrase === phrase)?.count || 0;
                const isSelected = phrase === selectedPhrase;
                
                return (
                  <button
                    key={phrase}
                    onClick={() => changePhrase(phrase)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f8f9fa',
                      color: isSelected ? 'white' : '#2c3e50',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'right',
                      direction: 'rtl',
                      boxShadow: isSelected ? '0 8px 25px rgba(102, 126, 234, 0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#e9ecef';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {phraseInfo.arabic}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.8,
                      marginBottom: '0.5rem'
                    }}>
                      {phraseInfo.transliteration}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      opacity: 0.7
                    }}>
                      <span>{phraseInfo.english}</span>
                      <span style={{
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(102, 126, 234, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}>
                        {phraseCount.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasbeh;
