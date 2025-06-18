import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading, error } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Dynamic Islamic words for background animation
  const islamicWords = [
    'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'سُبْحَانَ اللَّهِ',
    'الْحَمْدُ لِلَّهِ', 'لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّهُ أَكْبَرُ', 'اسْتَغْفِرُ اللَّهَ',
    'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', 'وَفِي الْآخِرَةِ حَسَنَةً', 'وَقِنَا عَذَابَ النَّارِ',
    'رَبِّ اشْرَحْ لِي صَدْرِي', 'وَيَسِّرْ لِي أَمْرِي', 'رَبَّنَا تَقَبَّلْ مِنَّا',
    'إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ', 'وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ'
  ];

  const [animatedWords, setAnimatedWords] = useState<Array<{
    text: string;
    x: number;
    y: number;
    speed: number;
    opacity: number;
    size: number;
    id: number;
  }>>([]);

  useEffect(() => {
    // Create initial animated words
    const initialWords = Array.from({ length: 12 }, (_, i) => ({
      text: islamicWords[Math.floor(Math.random() * islamicWords.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.2 + Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.15,
      size: 12 + Math.random() * 8,
      id: i
    }));
    setAnimatedWords(initialWords);

    // Animate words
    const interval = setInterval(() => {
      setAnimatedWords(prev => prev.map(word => ({
        ...word,
        y: word.y <= -10 ? 110 : word.y - word.speed,
        opacity: word.y <= 20 ? word.opacity * 0.95 : word.opacity
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!username.trim() || !password.trim()) {
      setLocalError('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    try {
      await login(username.trim(), password);
      // Redirect to home page after successful login
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'فشل تسجيل الدخول');
    }
  };

  const displayError = localError || error;

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDarkMode 
      ? 'linear-gradient(135deg, #0c1129 0%, #1a1f3a 25%, #2d1b69 50%, #1e3a8a 75%, #1e40af 100%)'
      : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #b3e5fc 50%, #81d4fa 75%, #4fc3f7 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  };

  const formContainerStyle: React.CSSProperties = {
    background: isDarkMode 
      ? 'rgba(15, 23, 42, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
    boxShadow: isDarkMode
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.15)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(59, 130, 246, 0.15)',
    border: isDarkMode
      ? '1px solid rgba(59, 130, 246, 0.2)'
      : '1px solid rgba(59, 130, 246, 0.1)',
    position: 'relative',
    zIndex: 10
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '2rem'
  };

  const inputStyle = (focused: boolean, hasValue: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '1rem 3rem 1rem 1rem',
    border: `2px solid ${
      focused 
        ? (isDarkMode ? '#3b82f6' : '#2563eb')
        : (isDarkMode ? '#374151' : '#e5e7eb')
    }`,
    borderRadius: '12px',
    fontSize: '1rem',
    backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    color: isDarkMode ? '#f9fafb' : '#111827',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit'
  });

  const labelStyle = (focused: boolean, hasValue: boolean): React.CSSProperties => ({
    position: 'absolute',
    right: '1rem',
    top: focused || hasValue ? '-0.5rem' : '1rem',
    fontSize: focused || hasValue ? '0.75rem' : '1rem',
    color: focused 
      ? (isDarkMode ? '#3b82f6' : '#2563eb')
      : (isDarkMode ? '#9ca3af' : '#6b7280'),
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
    padding: '0 0.5rem',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    fontWeight: focused || hasValue ? '600' : '400'
  });

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    color: isDarkMode ? '#6b7280' : '#9ca3af'
  };

  return (
    <div style={containerStyle}>
      {/* Animated Background Words */}
      {animatedWords.map((word) => (
        <div
          key={word.id}
          style={{
            position: 'absolute',
            left: `${word.x}%`,
            top: `${word.y}%`,
            fontSize: `${word.size}px`,
            color: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)',
            opacity: word.opacity,
            fontWeight: '300',
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: 'serif',
            whiteSpace: 'nowrap'
          }}
        >
          {word.text}
        </div>
      ))}

      {/* Floating Geometric Shapes */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '100px',
        height: '100px',
        background: `linear-gradient(45deg, ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)'}, transparent)`,
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: '80px',
        height: '80px',
        background: `linear-gradient(45deg, ${isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(147, 51, 234, 0.1)'}, transparent)`,
        borderRadius: '30%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      <div style={formContainerStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
              : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🕌
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #f9fafb, #e5e7eb)'
              : 'linear-gradient(135deg, #111827, #374151)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem'
          }}>
            تسجيل الدخول
          </h1>
          <p style={{
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '1.1rem',
            fontWeight: '400'
          }}>
            أهلاً وسهلاً بعودتك
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            ⚠️ {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={isLoading}
              style={inputStyle(focusedField === 'username', !!username)}
            />
            <label style={labelStyle(focusedField === 'username', !!username)}>
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div style={iconStyle}>👤</div>
          </div>

          {/* Password Field */}
          <div style={inputContainerStyle}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={isLoading}
              style={inputStyle(focusedField === 'password', !!password)}
            />
            <label style={labelStyle(focusedField === 'password', !!password)}>
              كلمة المرور
            </label>
            <div style={iconStyle}>🔒</div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                left: '3rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem',
                color: isDarkMode ? '#6b7280' : '#9ca3af'
              }}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: isLoading 
                ? (isDarkMode ? '#374151' : '#d1d5db')
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isLoading ? 'none' : '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
              transform: isLoading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {isLoading ? (
              <span>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                {' '}جاري تسجيل الدخول...
              </span>
            ) : (
              <span>✨ تسجيل الدخول</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1.5rem',
          background: isDarkMode 
            ? 'rgba(17, 24, 39, 0.5)' 
            : 'rgba(249, 250, 251, 0.8)',
          borderRadius: '16px',
          border: isDarkMode 
            ? '1px solid rgba(55, 65, 81, 0.3)' 
            : '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <p style={{
            margin: '0 0 1rem 0',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '0.95rem'
          }}>
            ليس لديك حساب؟
          </p>
          <Link
            to="/register"
            style={{
              color: isDarkMode ? '#3b82f6' : '#2563eb',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.05rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>📝</span>
            إنشاء حساب جديد
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link
            to="/"
            style={{
              color: isDarkMode ? '#6b7280' : '#9ca3af',
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🏠</span>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;
