import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface Zikr {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  category: string;
  count: number;
  reward?: string;
  times?: string;
}

interface AzkarCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  azkar: Zikr[];
}

const Azkar: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { preferences } = useUserPreferences();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('morning');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userProgress, setUserProgress] = useState<{[key: number]: number}>({});
  const [completedAzkar, setCompletedAzkar] = useState<Set<number>>(new Set());

  // Comprehensive Azkar database
  const azkarCategories: AzkarCategory[] = [
    {
      id: 'morning',
      name: 'أذكار الصباح',
      icon: '🌅',
      description: 'أذكار تُقال في الصباح من بعد الفجر حتى الضحى',
      azkar: [
        {
          id: 1,
          arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَـهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
          transliteration: 'Allahumma anta rabbee la ilaha illa anta, khalaqtanee wa ana abduka, wa ana ala ahdika wa wa\'dika mastata\'tu, a\'oothu bika min sharri ma sana\'tu, aboo\'u laka bini\'matika \'alayya, wa aboo\'u laka bithanbee faghfir lee fa\'innahu la yaghfiru ath-thunooba illa anta',
          translation: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.',
          source: 'البخاري',
          category: 'morning',
          count: 1,
          reward: 'من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة',
          times: 'مرة واحدة'
        },
        {
          id: 2,
          arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
          transliteration: 'Asbahna wa asbahal-mulku lillahi walhamdu lillahi la ilaha illallahu wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer, rabbi as\'aluka khayra ma fee hatha alyawmi wa khayra ma ba\'dahu, wa a\'oothu bika min sharri ma fee hatha alyawmi wa sharri ma ba\'dahu, rabbi a\'oothu bika minal-kasali wa soo\'il-kibari, rabbi a\'oothu bika min \'athabin fin-nari wa \'athabin fil-qabri',
          translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.',
          source: 'مسلم',
          category: 'morning',
          count: 1,
          times: 'مرة واحدة'
        },
        {
          id: 3,
          arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
          transliteration: 'Subhan Allahi wa bihamdih',
          translation: 'Glory is to Allah and praise is to Him',
          source: 'البخاري',
          category: 'morning',
          count: 100,
          reward: 'حُطَّت خطاياه وإن كانت مثل زبد البحر',
          times: '100 مرة'
        },
        {
          id: 4,
          arabic: 'حَسْبِيَ اللَّهُ لا إِلَـهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
          transliteration: 'Hasbiyal-lahu la ilaha illa huwa \'alayhi tawakkaltu wa huwa rabbul-\'arshil-\'atheem',
          translation: 'Allah is sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.',
          source: 'أبو داود',
          category: 'morning',
          count: 7,
          reward: 'من قالها سبع مرات كفاه الله ما أهمه',
          times: 'سبع مرات'
        }
      ]
    },
    {
      id: 'evening',
      name: 'أذكار المساء',
      icon: '🌙',
      description: 'أذكار تُقال في المساء من بعد العصر حتى المغرب',
      azkar: [
        {
          id: 5,
          arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
          transliteration: 'Amsayna wa amsal-mulku lillahi walhamdu lillahi la ilaha illallahu wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer, rabbi as\'aluka khayra ma fee hathihil-laylati wa khayra ma ba\'daha, wa a\'oothu bika min sharri ma fee hathihil-laylati wa sharri ma ba\'daha, rabbi a\'oothu bika minal-kasali wa soo\'il-kibari, rabbi a\'oothu bika min \'athabin fin-nari wa \'athabin fil-qabri',
          translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this night and the good of what follows it and I take refuge in You from the evil of this night and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.',
          source: 'مسلم',
          category: 'evening',
          count: 1,
          times: 'مرة واحدة'
        },
        {
          id: 6,
          arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
          transliteration: 'A\'oothu bikalimatil-lahit-tammati min sharri ma khalaq',
          translation: 'I take refuge in Allah\'s perfect words from the evil He has created.',
          source: 'مسلم',
          category: 'evening',
          count: 3,
          reward: 'من قالها ثلاث مرات لم تضره حمة تلك الليلة',
          times: 'ثلاث مرات'
        }
      ]
    },
    {
      id: 'general',
      name: 'الأذكار العامة',
      icon: '📿',
      description: 'أذكار متنوعة تُقال في أي وقت',
      azkar: [
        {
          id: 7,
          arabic: 'سُبْحَانَ اللَّهِ',
          transliteration: 'Subhan Allah',
          translation: 'Glory is to Allah',
          source: 'متفق عليه',
          category: 'general',
          count: 33,
          reward: 'من أعظم الأذكار',
          times: '33 مرة'
        },
        {
          id: 8,
          arabic: 'الْحَمْدُ لِلَّهِ',
          transliteration: 'Alhamdulillah',
          translation: 'All praise is due to Allah',
          source: 'متفق عليه',
          category: 'general',
          count: 33,
          reward: 'تملأ الميزان',
          times: '33 مرة'
        },
        {
          id: 9,
          arabic: 'اللَّهُ أَكْبَرُ',
          transliteration: 'Allahu Akbar',
          translation: 'Allah is the greatest',
          source: 'متفق عليه',
          category: 'general',
          count: 34,
          reward: 'تملأ ما بين السماء والأرض',
          times: '34 مرة'
        },
        {
          id: 10,
          arabic: 'لا إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
          transliteration: 'La ilaha illa Allah wahdahu la shareeka lahu, lahul-mulku walahul-hamdu wa huwa ala kulli shay\'in qadeer',
          translation: 'None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
          source: 'البخاري',
          category: 'general',
          count: 10,
          reward: 'كانت له عدل عشر رقاب',
          times: '10 مرات'
        }
      ]
    },
    {
      id: 'istighfar',
      name: 'الاستغفار',
      icon: '🤲',
      description: 'أذكار الاستغفار والتوبة',
      azkar: [
        {
          id: 11,
          arabic: 'أَسْتَغْفِرُ اللَّهَ',
          transliteration: 'Astaghfirullah',
          translation: 'I seek forgiveness of Allah',
          source: 'البخاري',
          category: 'istighfar',
          count: 100,
          reward: 'من أعظم الأذكار',
          times: '100 مرة'
        },
        {
          id: 12,
          arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لا إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
          transliteration: 'Astaghfirul-lahal-\'atheemil-lathee la ilaha illa huwal-hayyul-qayyoomu wa atoobu ilayh',
          translation: 'I seek forgiveness of Allah the Mighty, Whom there is none worthy of worship except Him, the Living, the Eternal, and I repent unto Him.',
          source: 'أبو داود',
          category: 'istighfar',
          count: 1,
          reward: 'غُفر له وإن كان فر من الزحف',
          times: 'مرة واحدة'
        }
      ]
    }
  ];

  // Load user progress when component mounts
  useEffect(() => {
    const savedProgress = localStorage.getItem('azkar_progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Update progress for a specific zikr
  const updateProgress = (zikreId: number, currentCount: number) => {
    const newProgress = { ...userProgress, [zikreId]: currentCount };
    setUserProgress(newProgress);
    localStorage.setItem('azkar_progress', JSON.stringify(newProgress));
  };

  // Increment counter for a zikr
  const incrementCounter = (zikr: Zikr) => {
    const currentCount = userProgress[zikr.id] || 0;
    const newCount = currentCount + 1;
    
    updateProgress(zikr.id, newCount);
    
    if (newCount >= zikr.count) {
      setCompletedAzkar(prev => new Set(prev).add(zikr.id));
    }
  };

  // Reset counter for a zikr
  const resetCounter = (zikreId: number) => {
    updateProgress(zikreId, 0);
    setCompletedAzkar(prev => {
      const newSet = new Set(prev);
      newSet.delete(zikreId);
      return newSet;
    });
  };

  // Get filtered azkar based on search term
  const getFilteredAzkar = (azkar: Zikr[]) => {
    if (!searchTerm) return azkar;
    
    return azkar.filter(zikr => 
      zikr.arabic.includes(searchTerm) ||
      zikr.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zikr.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentCategory = azkarCategories.find(cat => cat.id === selectedCategory);
  const filteredAzkar = currentCategory ? getFilteredAzkar(currentCategory.azkar) : [];

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

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            80% { transform: translateY(-5px); }
          }
          .zikr-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px ${theme.colors.shadow};
          }
          .counter-button:active {
            transform: scale(0.95);
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
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤲</div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              الأذكار والأدعية
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: theme.colors.textSecondary,
              marginBottom: '2rem'
            }}>
              مجموعة شاملة من الأذكار والأدعية النبوية الصحيحة
            </p>
          </div>

          {/* Category Selection */}
          <div style={cardStyle}>
            <h3 style={{
              color: theme.colors.text,
              marginBottom: '1rem',
              fontSize: '1.5rem',
              textAlign: 'center'
            }}>
              اختر فئة الأذكار
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {azkarCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    background: selectedCategory === category.id
                      ? theme.gradients.primary
                      : isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.5)',
                    border: selectedCategory === category.id
                      ? 'none'
                      : `1px solid ${theme.colors.border}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    color: selectedCategory === category.id
                      ? 'white'
                      : theme.colors.text,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {category.icon}
                  </div>
                  <div>{category.name}</div>
                  <div style={{
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    opacity: 0.8
                  }}>
                    {category.azkar.length} ذكر
                  </div>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في الأذكار..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  background: isDarkMode ? '#1e293b' : 'white',
                  color: theme.colors.text,
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Category Description */}
          {currentCategory && (
            <div style={cardStyle}>
              <div style={{
                textAlign: 'center',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {currentCategory.icon}
                </div>
                <h2 style={{
                  color: theme.colors.text,
                  fontSize: '2rem',
                  marginBottom: '1rem'
                }}>
                  {currentCategory.name}
                </h2>
                <p style={{
                  color: theme.colors.textSecondary,
                  fontSize: '1.1rem',
                  lineHeight: '1.6'
                }}>
                  {currentCategory.description}
                </p>
              </div>
            </div>
          )}

          {/* Azkar List */}
          {filteredAzkar.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {filteredAzkar.map((zikr) => {
                const currentCount = userProgress[zikr.id] || 0;
                const isCompleted = currentCount >= zikr.count;
                const progressPercentage = Math.min((currentCount / zikr.count) * 100, 100);

                return (
                  <div
                    key={zikr.id}
                    className="zikr-card"
                    style={{
                      ...cardStyle,
                      background: isCompleted
                        ? isDarkMode 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(34, 197, 94, 0.05)'
                        : cardStyle.background,
                      border: isCompleted
                        ? '2px solid rgba(34, 197, 94, 0.5)'
                        : cardStyle.border,
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Zikr Text */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <p style={{
                        fontSize: '1.8rem',
                        color: theme.colors.text,
                        lineHeight: '1.8',
                        marginBottom: '1rem',
                        fontFamily: 'Amiri, serif'
                      }}>
                        {zikr.arabic}
                      </p>
                      
                      <p style={{
                        fontSize: '1rem',
                        color: theme.colors.textSecondary,
                        fontStyle: 'italic',
                        marginBottom: '0.5rem'
                      }}>
                        {zikr.transliteration}
                      </p>
                      
                      <p style={{
                        fontSize: '1rem',
                        color: theme.colors.textSecondary,
                        lineHeight: '1.6'
                      }}>
                        {zikr.translation}
                      </p>
                    </div>

                    {/* Counter Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <button
                        onClick={() => resetCounter(zikr.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.75rem',
                          color: 'white',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        🔄
                      </button>

                      <div style={{
                        background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        borderRadius: '15px',
                        padding: '1rem 2rem',
                        textAlign: 'center',
                        minWidth: '120px'
                      }}>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: isCompleted ? '#22c55e' : theme.colors.text
                        }}>
                          {currentCount}/{zikr.count}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: theme.colors.textSecondary,
                          marginTop: '0.25rem'
                        }}>
                          {zikr.times}
                        </div>
                      </div>

                      <button
                        className="counter-button"
                        onClick={() => incrementCounter(zikr)}
                        disabled={isCompleted}
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                            : theme.gradients.primary,
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.75rem 1.5rem',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          cursor: isCompleted ? 'default' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: isCompleted ? 0.8 : 1
                        }}
                      >
                        {isCompleted ? '✅' : '📿'}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                      borderRadius: '10px',
                      height: '8px',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        background: isCompleted
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : theme.gradients.primary,
                        height: '100%',
                        width: `${progressPercentage}%`,
                        borderRadius: '10px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* Source and Reward */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      color: theme.colors.textSecondary
                    }}>
                      <div>
                        <strong>المصدر:</strong> {zikr.source}
                      </div>
                      {zikr.reward && (
                        <div style={{
                          background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          maxWidth: '300px'
                        }}>
                          <strong>الأجر:</strong> {zikr.reward}
                        </div>
                      )}
                    </div>

                    {/* Completion Badge */}
                    {isCompleted && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        animation: 'bounce 1s ease-in-out'
                      }}>
                        مكتمل ✅
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{
                textAlign: 'center',
                padding: '3rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <p style={{
                  fontSize: '1.2rem',
                  color: theme.colors.textSecondary
                }}>
                  لم يتم العثور على أذكار تطابق البحث
                </p>
              </div>
            </div>
          )}

          {/* Statistics */}
          {currentCategory && (
            <div style={cardStyle}>
              <h3 style={{
                color: theme.colors.text,
                marginBottom: '1rem',
                fontSize: '1.5rem',
                textAlign: 'center'
              }}>
                📊 إحصائيات التقدم
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  background: isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '0.5rem' }}>
                    {completedAzkar.size}
                  </div>
                  <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                    أذكار مكتملة
                  </div>
                </div>
                
                <div style={{
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
                    {currentCategory.azkar.length}
                  </div>
                  <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                    إجمالي الأذكار
                  </div>
                </div>
                
                <div style={{
                  background: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', color: '#a855f7', marginBottom: '0.5rem' }}>
                    {Math.round((completedAzkar.size / currentCategory.azkar.length) * 100)}%
                  </div>
                  <div style={{ color: theme.colors.text, fontWeight: 'bold' }}>
                    نسبة الإكمال
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Azkar;
