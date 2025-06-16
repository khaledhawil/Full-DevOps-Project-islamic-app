import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';

const Home: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Main Islamic worship sections
  const worshipSections = [
    { 
      name: 'التسبيح', 
      path: '/tasbeh', 
      icon: '📿',
      secondaryIcon: '🤲',
      color: '#059669',
      gradientFrom: '#059669',
      gradientTo: '#10B981',
      description: 'عداد التسبيح الرقمي',
      detailedDesc: 'اذكر الله وسبحه في كل وقت',
      category: 'عبادة',
      priority: 1
    },
    { 
      name: 'الأذكار', 
      path: '/azkar', 
      icon: '🌙',
      secondaryIcon: '✨',
      color: '#7C3AED',
      gradientFrom: '#7C3AED',
      gradientTo: '#A855F7',
      description: 'أذكار الصباح والمساء',
      detailedDesc: 'احصن نفسك بالأذكار المباركة',
      category: 'عبادة',
      priority: 2
    },
    { 
      name: 'القرآن الكريم', 
      path: '/quran', 
      icon: '📖',
      secondaryIcon: '🕌',
      color: '#DC6317',
      gradientFrom: '#DC6317',
      gradientTo: '#F59E0B',
      description: 'القرآن الكريم',
      detailedDesc: 'اتل كتاب الله وتدبر آياته',
      category: 'تلاوة',
      priority: 3
    },
    { 
      name: 'الأحاديث النبوية', 
      path: '/hadith', 
      icon: '📜',
      secondaryIcon: '⭐',
      color: '#DC2626',
      gradientFrom: '#DC2626',
      gradientTo: '#EF4444',
      description: 'الأحاديث النبوية الشريفة',
      detailedDesc: 'تعلم من سنة النبي ﷺ',
      category: 'تعلم',
      priority: 4
    },
    { 
      name: 'مواقيت الصلاة', 
      path: '/prayer-times', 
      icon: '🕐',
      secondaryIcon: '🕋',
      color: '#2563EB',
      gradientFrom: '#2563EB',
      gradientTo: '#3B82F6',
      description: 'مواقيت الصلوات الخمس',
      detailedDesc: 'لا تفوت وقت صلاتك أبداً',
      category: 'عبادة',
      priority: 5
    }
  ];

  // Personal management sections
  const personalSections = [
    { 
      name: 'الملف الشخصي', 
      path: '/profile', 
      icon: '👤',
      secondaryIcon: '📊',
      color: '#4F46E5',
      gradientFrom: '#4F46E5',
      gradientTo: '#6366F1',
      description: 'إدارة الحساب الشخصي',
      detailedDesc: 'تتبع إنجازاتك الروحانية',
      category: 'شخصي',
      priority: 6
    },
    { 
      name: 'الإعدادات', 
      path: '/settings', 
      icon: '⚙️',
      secondaryIcon: '🎛️',
      color: '#64748B',
      gradientFrom: '#64748B',
      gradientTo: '#94A3B8',
      description: 'إعدادات التطبيق',
      detailedDesc: 'خصص التطبيق حسب احتياجاتك',
      category: 'إعدادات',
      priority: 7
    }
  ];

  const navigateToPage = (path: string) => {
    if (!isAuthenticated && ['/tasbeh', '/profile', '/settings'].includes(path)) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e293b 50%, #334155 75%, #475569 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
      direction: 'rtl'
    }}>
      {/* Islamic Pattern Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isDarkMode ? '%23334155' : '%23cbd5e1'}' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '2rem'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            🕌
          </div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            textShadow: isDarkMode ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}>
            التطبيق الإسلامي
          </h1>
          
          <p style={{
            fontSize: '1.5rem',
            color: theme.colors.textSecondary,
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {isAuthenticated 
              ? 'مرحباً بك في رحلتك الروحانية 🌟'
              : 'تطبيقك الشامل للعبادة والذكر 🤲'
            }
          </p>

          {/* Time Display */}
          <div style={{
            background: isDarkMode 
              ? 'rgba(15, 23, 42, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '1.5rem',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 10px 30px ${theme.colors.shadow}`,
            display: 'inline-block',
            marginBottom: '3rem'
          }}>
            <div style={{
              fontSize: '2rem',
              color: theme.colors.text,
              fontWeight: 'bold'
            }}>
              {currentTime.toLocaleDateString('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div style={{
              fontSize: '1.5rem',
              color: theme.colors.textSecondary,
              marginTop: '0.5rem'
            }}>
              {currentTime.toLocaleTimeString('ar-SA')}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={{
          maxWidth: '1500px',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          {/* Worship Sections */}
          <div style={{
            marginBottom: '5rem'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '4rem',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem'
              }}>
                🕌
              </div>
              
              <h2 style={{
                fontSize: '3.2rem',
                fontWeight: 'bold',
                color: theme.colors.text,
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: theme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: isDarkMode ? '0 0 30px rgba(99, 102, 241, 0.3)' : 'none'
              }}>
                العبادة والتعلم
              </h2>
              
              <div style={{
                width: '120px',
                height: '4px',
                background: theme.gradients.primary,
                margin: '0 auto 2rem auto',
                borderRadius: '2px',
                boxShadow: `0 0 20px ${isDarkMode ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)'}`
              }} />
              
              <p style={{
                fontSize: '1.4rem',
                color: theme.colors.textSecondary,
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.7',
                fontWeight: '500'
              }}>
                أقسام العبادة والذكر وتلاوة القرآن الكريم والأحاديث النبوية الشريفة
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '3rem',
              marginBottom: '3rem'
            }}>
              {worshipSections.map((section, index) => (
                <div
                  key={section.path}
                  onClick={() => navigateToPage(section.path)}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))' 
                      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '32px',
                    padding: '3.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: `3px solid transparent`,
                    boxShadow: isDarkMode 
                      ? `0 25px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
                      : `0 25px 60px rgba(0,0,0,0.12), 0 10px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-25px) scale(1.05)';
                    e.currentTarget.style.borderColor = section.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: '2.5rem',
                    background: `linear-gradient(135deg, ${section.gradientFrom}, ${section.gradientTo})`,
                    color: 'white',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: `0 8px 25px ${section.color}50`,
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {section.category}
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1.5rem',
                      marginBottom: '2.5rem'
                    }}>
                      <div style={{
                        fontSize: '6rem',
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))'
                      }}>
                        {section.icon}
                      </div>
                      <div style={{
                        fontSize: '3rem',
                        opacity: 0.8,
                        marginLeft: '0.8rem'
                      }}>
                        {section.secondaryIcon}
                      </div>
                    </div>
                    
                    <h3 style={{
                      fontSize: '2.6rem',
                      fontWeight: 'bold',
                      color: theme.colors.text,
                      marginBottom: '1.5rem',
                      background: `linear-gradient(135deg, ${section.gradientFrom}, ${section.gradientTo})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: '1.2'
                    }}>
                      {section.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '1.5rem',
                      color: theme.colors.textSecondary,
                      lineHeight: '1.7',
                      marginBottom: '1.5rem',
                      fontWeight: '600'
                    }}>
                      {section.description}
                    </p>

                    <p style={{
                      fontSize: '1.2rem',
                      color: theme.colors.textSecondary,
                      lineHeight: '1.6',
                      marginBottom: '2.5rem',
                      fontStyle: 'italic',
                      opacity: 0.85
                    }}>
                      {section.detailedDesc}
                    </p>

                    <div style={{
                      width: '120px',
                      height: '6px',
                      background: `linear-gradient(90deg, transparent, ${section.gradientFrom}, ${section.gradientTo}, transparent)`,
                      borderRadius: '3px',
                      margin: '0 auto',
                      boxShadow: `0 0 25px ${section.color}70`
                    }} />
                  </div>

                  {!isAuthenticated && ['/tasbeh', '/profile', '/settings'].includes(section.path) && (
                    <div style={{
                      position: 'absolute',
                      top: '1.5rem',
                      left: '1.5rem',
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      color: 'white',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      🔒 مطلوب تسجيل الدخول
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personal Management Sections */}
          <div style={{
            marginBottom: '4rem'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '4rem'
            }}>
              <div style={{
                fontSize: '3.5rem',
                marginBottom: '1.5rem'
              }}>
                👤
              </div>
              
              <h2 style={{
                fontSize: '2.8rem',
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: '1.5rem',
                background: theme.gradients.secondary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                الإدارة الشخصية
              </h2>
              
              <div style={{
                width: '100px',
                height: '4px',
                background: theme.gradients.secondary,
                margin: '0 auto 2rem auto',
                borderRadius: '2px'
              }} />
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '2.5rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {personalSections.map((section, index) => (
                <div
                  key={section.path}
                  onClick={() => navigateToPage(section.path)}
                  style={{
                    background: isDarkMode 
                      ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))' 
                      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
                    backdropFilter: 'blur(25px)',
                    borderRadius: '28px',
                    padding: '3.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: `3px solid transparent`,
                    boxShadow: isDarkMode 
                      ? `0 20px 50px rgba(0,0,0,0.35), 0 8px 25px rgba(0,0,0,0.25)`
                      : `0 20px 50px rgba(0,0,0,0.1), 0 8px 25px rgba(0,0,0,0.08)`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-20px) scale(1.04)';
                    e.currentTarget.style.borderColor = section.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2.2rem',
                    right: '2.2rem',
                    background: `linear-gradient(135deg, ${section.gradientFrom}, ${section.gradientTo})`,
                    color: 'white',
                    padding: '0.7rem 1.4rem',
                    borderRadius: '25px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold'
                  }}>
                    {section.category}
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '1.2rem',
                      marginBottom: '2.5rem'
                    }}>
                      <div style={{
                        fontSize: '5rem'
                      }}>
                        {section.icon}
                      </div>
                      <div style={{
                        fontSize: '2.5rem',
                        opacity: 0.8
                      }}>
                        {section.secondaryIcon}
                      </div>
                    </div>
                    
                    <h3 style={{
                      fontSize: '2.2rem',
                      fontWeight: 'bold',
                      color: theme.colors.text,
                      marginBottom: '1.5rem',
                      background: `linear-gradient(135deg, ${section.gradientFrom}, ${section.gradientTo})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: '1.2'
                    }}>
                      {section.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '1.3rem',
                      color: theme.colors.textSecondary,
                      lineHeight: '1.7',
                      marginBottom: '1.5rem',
                      fontWeight: '600'
                    }}>
                      {section.description}
                    </p>

                    <p style={{
                      fontSize: '1.1rem',
                      color: theme.colors.textSecondary,
                      lineHeight: '1.6',
                      marginBottom: '2.5rem',
                      fontStyle: 'italic',
                      opacity: 0.85
                    }}>
                      {section.detailedDesc}
                    </p>

                    <div style={{
                      width: '100px',
                      height: '5px',
                      background: `linear-gradient(90deg, transparent, ${section.gradientFrom}, ${section.gradientTo}, transparent)`,
                      borderRadius: '3px',
                      margin: '0 auto'
                    }} />
                  </div>

                  {!isAuthenticated && ['/tasbeh', '/profile', '/settings'].includes(section.path) && (
                    <div style={{
                      position: 'absolute',
                      top: '1.5rem',
                      left: '1.5rem',
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      🔒 مطلوب تسجيل الدخول
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem',
          padding: '2rem'
        }}>
          <div style={{
            background: isDarkMode 
              ? 'rgba(15, 23, 42, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2.5rem',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 15px 40px ${theme.colors.shadow}`,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: '1.8rem',
              color: theme.colors.text,
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.6'
            }}>
              "وَاذْكُرُوا اللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ"
            </div>
            <div style={{
              fontSize: '1.2rem',
              color: theme.colors.textSecondary,
              fontStyle: 'italic'
            }}>
              سورة الأنفال - آية 45
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
