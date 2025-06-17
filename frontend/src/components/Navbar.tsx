import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { path: '/', label: '🏠 الرئيسية', showWhenLoggedIn: true, showWhenLoggedOut: true },
    { path: '/azkar', label: '🤲 الأذكار', showWhenLoggedIn: true, showWhenLoggedOut: false },
    { path: '/tasbeh', label: '📿 التسبيح', showWhenLoggedIn: true, showWhenLoggedOut: false },
    { path: '/prayer-times', label: '🕌 أوقات الصلاة', showWhenLoggedIn: true, showWhenLoggedOut: false },
    { path: '/quran', label: '📖 القرآن', showWhenLoggedIn: true, showWhenLoggedOut: false },
    { path: '/quran-audio', label: '🎵 القرآن الصوتي', showWhenLoggedIn: true, showWhenLoggedOut: false },
    { path: '/hadith', label: '📚 الأحاديث', showWhenLoggedIn: true, showWhenLoggedOut: false },
    { path: '/profile', label: '👤 الملف الشخصي', showWhenLoggedIn: true, showWhenLoggedOut: false }
  ];

  const filteredItems = navigationItems.filter(item => 
    (isAuthenticated && item.showWhenLoggedIn) || (!isAuthenticated && item.showWhenLoggedOut)
  );

  return (
    <nav style={{
      background: isDarkMode 
        ? 'rgba(45, 55, 72, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${theme.colors.border}`,
      boxShadow: `0 4px 20px ${theme.colors.shadow}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo/Brand */}
        <div 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '2rem' }}>🕌</span>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            direction: 'rtl'
          }}>
            التطبيق الإسلامي
          </span>
        </div>

        {/* Desktop Navigation */}
        <div 
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}
        >
          {/* Navigation Links */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.text,
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  direction: 'rtl'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isDarkMode 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {isAuthenticated ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{
                  color: theme.colors.textSecondary,
                  fontSize: '0.9rem',
                  direction: 'rtl'
                }}>
                  مرحباً {user?.username} 👋
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '0.5rem 1rem',
                    background: theme.colors.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#c0392b'}
                  onMouseOut={(e) => e.currentTarget.style.background = theme.colors.error}
                >
                  🚪 خروج
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `2px solid ${theme.colors.primary}`,
                    color: theme.colors.primary,
                    background: 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = theme.colors.primary;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.colors.primary;
                  }}
                >
                  🔑 دخول
                </button>
                <button
                  onClick={() => navigate('/register')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: theme.gradients.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 12px ${theme.colors.shadow}`
                  }}
                >
                  📝 تسجيل
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.text,
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
          padding: '1rem 2rem',
          boxShadow: `0 4px 20px ${theme.colors.shadow}`
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.text,
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'right',
                  direction: 'rtl',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isDarkMode 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile User Actions */}
            <div style={{
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{
                  color: theme.colors.textSecondary,
                  fontSize: '0.9rem'
                }}>
                  الوضع: {isDarkMode ? 'ليلي 🌙' : 'نهاري ☀️'}
                </span>
                <DarkModeToggle />
              </div>

              {isAuthenticated ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    color: theme.colors.textSecondary,
                    fontSize: '0.9rem',
                    textAlign: 'right',
                    direction: 'rtl'
                  }}>
                    مرحباً {user?.username} 👋
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      background: theme.colors.error,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    🚪 تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      border: `2px solid ${theme.colors.primary}`,
                      color: theme.colors.primary,
                      background: 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    🔑 تسجيل الدخول
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      background: theme.gradients.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    📝 إنشاء حساب جديد
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
