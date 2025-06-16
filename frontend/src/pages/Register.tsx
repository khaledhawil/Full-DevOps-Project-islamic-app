import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formValidation, setFormValidation] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const { register, isLoading, error } = useAuth();
  const { isDarkMode } = useTheme();

  // Enhanced Islamic phrases for background animation
  const islamicPhrases = [
    { text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
    { text: 'أَهْلاً وَسَهْلاً بِكَ', translation: 'Welcome' },
    { text: 'بَارَكَ اللَّهُ فِيكَ', translation: 'May Allah bless you' },
    { text: 'جَزَاكَ اللَّهُ خَيْراً', translation: 'May Allah reward you with good' },
    { text: 'فِي أَمَانِ اللَّهِ', translation: 'In Allah\'s protection' },
    { text: 'إِنْ شَاءَ اللَّهُ', translation: 'God willing' },
    { text: 'مَا شَاءَ اللَّهُ', translation: 'What Allah willed' },
    { text: 'تَبَارَكَ اللَّهُ', translation: 'Blessed is Allah' },
    { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Glory be to Allah and praise Him' },
    { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translation: 'There is no power except with Allah' },
    { text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا', translation: 'Our Lord, perfect our light for us' },
    { text: 'وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', translation: 'And forgive us, indeed You are capable of all things' }
  ];

  const [animatedWords, setAnimatedWords] = useState<Array<{
    text: string;
    translation: string;
    x: number;
    y: number;
    speed: number;
    opacity: number;
    size: number;
    rotation: number;
    id: number;
  }>>([]);

  const [floatingElements, setFloatingElements] = useState<Array<{
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
    speed: number;
    id: number;
    shape: 'star' | 'crescent' | 'circle' | 'diamond';
  }>>([]);

  useEffect(() => {
    // Create animated Islamic phrases
    const initialWords = Array.from({ length: 16 }, (_, i) => {
      const phrase = islamicPhrases[Math.floor(Math.random() * islamicPhrases.length)];
      return {
        text: phrase.text,
        translation: phrase.translation,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.3,
        opacity: 0.06 + Math.random() * 0.1,
        size: 10 + Math.random() * 6,
        rotation: Math.random() * 360,
        id: i
      };
    });
    setAnimatedWords(initialWords);

    // Create floating geometric elements
    const initialElements = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 30,
      opacity: 0.03 + Math.random() * 0.07,
      rotation: Math.random() * 360,
      speed: 0.05 + Math.random() * 0.1,
      id: i,
      shape: ['star', 'crescent', 'circle', 'diamond'][Math.floor(Math.random() * 4)] as 'star' | 'crescent' | 'circle' | 'diamond'
    }));
    setFloatingElements(initialElements);

    // Animate elements
    const interval = setInterval(() => {
      setAnimatedWords(prev => prev.map(word => ({
        ...word,
        y: word.y <= -10 ? 110 : word.y - word.speed,
        opacity: word.y <= 25 ? word.opacity * 0.98 : word.opacity,
        rotation: word.rotation + 0.1
      })));

      setFloatingElements(prev => prev.map(el => ({
        ...el,
        y: el.y <= -5 ? 105 : el.y - el.speed,
        rotation: el.rotation + 0.2
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Password strength calculation
  useEffect(() => {
    let strength = 0;
    const password = formData.password;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(Math.min(strength, 100));
  }, [formData.password]);

  // Form validation
  useEffect(() => {
    setFormValidation({
      username: formData.username.length >= 3,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      password: formData.password.length >= 8,
      confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
    });
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setLocalError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      return 'يرجى إدخال اسم المستخدم';
    }
    if (formData.username.trim().length < 3) {
      return 'اسم المستخدم يجب أن يكون على الأقل 3 أحرف';
    }
    if (!formData.email.trim()) {
      return 'يرجى إدخال البريد الإلكتروني';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'تنسيق البريد الإلكتروني غير صحيح';
    }
    if (!formData.password) {
      return 'يرجى إدخال كلمة المرور';
    }
    if (formData.password.length < 8) {
      return 'كلمة المرور يجب أن تكون على الأقل 8 أحرف';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'كلمات المرور غير متطابقة';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      await register(formData.username.trim(), formData.email.trim().toLowerCase(), formData.password);
    } catch (err: any) {
      setLocalError(err.message || 'فشل إنشاء الحساب');
    }
  };

  const displayError = localError || error;

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDarkMode 
      ? 'radial-gradient(ellipse at top, #1e1b4b 0%, #312e81 25%, #3730a3 50%, #1e40af 75%, #1e3a8a 100%)'
      : 'radial-gradient(ellipse at top, #fef7ff 0%, #f3e8ff 25%, #e9d5ff 50%, #d8b4fe 75%, #c084fc 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    padding: '2rem 1rem'
  };

  const formContainerStyle: React.CSSProperties = {
    background: isDarkMode 
      ? 'rgba(15, 23, 42, 0.97)' 
      : 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(25px)',
    borderRadius: '32px',
    padding: '3.5rem',
    width: '100%',
    maxWidth: '520px',
    boxShadow: isDarkMode
      ? '0 32px 64px -12px rgba(0, 0, 0, 0.7), 0 0 60px rgba(147, 51, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 32px 64px -12px rgba(0, 0, 0, 0.3), 0 0 60px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    border: isDarkMode
      ? '1px solid rgba(147, 51, 234, 0.25)'
      : '1px solid rgba(147, 51, 234, 0.15)',
    position: 'relative',
    zIndex: 10
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: '2.5rem'
  };

  const inputStyle = (focused: boolean, hasValue: boolean, isValid: boolean = true): React.CSSProperties => ({
    width: '100%',
    padding: '1.25rem 3.5rem 1.25rem 1.25rem',
    border: `2px solid ${
      !isValid 
        ? '#ef4444'
        : focused 
          ? (isDarkMode ? '#a855f7' : '#9333ea')
          : (isDarkMode ? '#475569' : '#e2e8f0')
    }`,
    borderRadius: '16px',
    fontSize: '1.1rem',
    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
    color: isDarkMode ? '#f8fafc' : '#1e293b',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: focused 
      ? (isDarkMode ? '0 0 30px rgba(168, 85, 247, 0.3)' : '0 0 30px rgba(147, 51, 234, 0.2)')
      : '0 4px 8px rgba(0, 0, 0, 0.05)'
  });

  const labelStyle = (focused: boolean, hasValue: boolean, isValid: boolean = true): React.CSSProperties => ({
    position: 'absolute',
    right: '1.25rem',
    top: focused || hasValue ? '-0.75rem' : '1.25rem',
    fontSize: focused || hasValue ? '0.875rem' : '1.1rem',
    color: !isValid
      ? '#ef4444'
      : focused 
        ? (isDarkMode ? '#a855f7' : '#9333ea')
        : (isDarkMode ? '#94a3b8' : '#64748b'),
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
    padding: '0.25rem 0.75rem',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    fontWeight: focused || hasValue ? '600' : '500',
    borderRadius: '8px'
  });

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '1.25rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.5rem',
    color: isDarkMode ? '#64748b' : '#94a3b8',
    transition: 'all 0.3s ease'
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#ef4444';
    if (passwordStrength < 50) return '#f59e0b';
    if (passwordStrength < 75) return '#eab308';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'ضعيفة جداً';
    if (passwordStrength < 50) return 'ضعيفة';
    if (passwordStrength < 75) return 'متوسطة';
    if (passwordStrength < 90) return 'قوية';
    return 'قوية جداً';
  };

  const renderShapeIcon = (shape: string) => {
    switch (shape) {
      case 'star': return '⭐';
      case 'crescent': return '🌙';
      case 'circle': return '⭕';
      case 'diamond': return '💎';
      default: return '✨';
    }
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
            color: isDarkMode ? 'rgba(147, 51, 234, 0.08)' : 'rgba(147, 51, 234, 0.06)',
            opacity: word.opacity,
            fontWeight: '400',
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: '"Amiri", serif',
            whiteSpace: 'nowrap',
            transform: `rotate(${word.rotation}deg)`,
            transition: 'all 0.3s ease'
          }}
          title={word.translation}
        >
          {word.text}
        </div>
      ))}

      {/* Floating Geometric Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}px`,
            opacity: element.opacity,
            transform: `rotate(${element.rotation}deg)`,
            userSelect: 'none',
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {renderShapeIcon(element.shape)}
        </div>
      ))}

      {/* Main Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '150px',
        height: '150px',
        background: `linear-gradient(45deg, ${isDarkMode ? 'rgba(147, 51, 234, 0.12)' : 'rgba(147, 51, 234, 0.08)'}, transparent)`,
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '5%',
        width: '120px',
        height: '120px',
        background: `linear-gradient(45deg, ${isDarkMode ? 'rgba(236, 72, 153, 0.12)' : 'rgba(236, 72, 153, 0.08)'}, transparent)`,
        borderRadius: '30%',
        animation: 'float 10s ease-in-out infinite reverse'
      }} />

      <div style={formContainerStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '1.5rem',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)'
              : 'linear-gradient(135deg, #9333ea, #db2777, #ea580c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}>
            🌟
          </div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
              : 'linear-gradient(135deg, #1e293b, #475569)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            letterSpacing: '-0.025em'
          }}>
            انضم إلينا
          </h1>
          <p style={{
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '1.25rem',
            fontWeight: '500',
            lineHeight: '1.6'
          }}>
            ابدأ رحلتك الروحية معنا
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '2px solid #fca5a5',
            color: '#dc2626',
            padding: '1.25rem',
            borderRadius: '16px',
            marginBottom: '2.5rem',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)'
          }}>
            <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>⚠️</span>
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={isLoading}
              style={inputStyle(focusedField === 'username', !!formData.username, formValidation.username || !formData.username)}
            />
            <label style={labelStyle(focusedField === 'username', !!formData.username, formValidation.username || !formData.username)}>
              اسم المستخدم
            </label>
            <div style={iconStyle}>👤</div>
            {formData.username && !formValidation.username && (
              <div style={{
                position: 'absolute',
                right: '1.25rem',
                bottom: '-1.75rem',
                fontSize: '0.875rem',
                color: '#ef4444',
                fontWeight: '500'
              }}>
                يجب أن يكون 3 أحرف على الأقل
              </div>
            )}
          </div>

          {/* Email Field */}
          <div style={inputContainerStyle}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={isLoading}
              style={inputStyle(focusedField === 'email', !!formData.email, formValidation.email || !formData.email)}
            />
            <label style={labelStyle(focusedField === 'email', !!formData.email, formValidation.email || !formData.email)}>
              البريد الإلكتروني
            </label>
            <div style={iconStyle}>📧</div>
            {formData.email && !formValidation.email && (
              <div style={{
                position: 'absolute',
                right: '1.25rem',
                bottom: '-1.75rem',
                fontSize: '0.875rem',
                color: '#ef4444',
                fontWeight: '500'
              }}>
                تنسيق البريد الإلكتروني غير صحيح
              </div>
            )}
          </div>

          {/* Password Field */}
          <div style={inputContainerStyle}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={isLoading}
              style={inputStyle(focusedField === 'password', !!formData.password, formValidation.password || !formData.password)}
            />
            <label style={labelStyle(focusedField === 'password', !!formData.password, formValidation.password || !formData.password)}>
              كلمة المرور
            </label>
            <div style={iconStyle}>🔒</div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                left: '3.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: isDarkMode ? '#64748b' : '#94a3b8',
                transition: 'all 0.3s ease'
              }}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${passwordStrength}%`,
                    height: '100%',
                    backgroundColor: getPasswordStrengthColor(),
                    transition: 'all 0.5s ease',
                    borderRadius: '3px'
                  }} />
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: getPasswordStrengthColor(),
                  margin: '0.5rem 0 0 0',
                  fontWeight: '600'
                }}>
                  قوة كلمة المرور: {getPasswordStrengthText()} ({passwordStrength}%)
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={inputContainerStyle}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={isLoading}
              style={inputStyle(
                focusedField === 'confirmPassword', 
                !!formData.confirmPassword, 
                formValidation.confirmPassword || !formData.confirmPassword
              )}
            />
            <label style={labelStyle(
              focusedField === 'confirmPassword', 
              !!formData.confirmPassword, 
              formValidation.confirmPassword || !formData.confirmPassword
            )}>
              تأكيد كلمة المرور
            </label>
            <div style={iconStyle}>🔐</div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                left: '3.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: isDarkMode ? '#64748b' : '#94a3b8',
                transition: 'all 0.3s ease'
              }}
            >
              {showConfirmPassword ? '👁️' : '🙈'}
            </button>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div style={{
                position: 'absolute',
                right: '1.25rem',
                bottom: '-1.75rem',
                fontSize: '0.875rem',
                color: formValidation.confirmPassword ? '#10b981' : '#ef4444',
                fontWeight: '600'
              }}>
                {formValidation.confirmPassword ? '✅ كلمات المرور متطابقة' : '❌ كلمات المرور غير متطابقة'}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !Object.values(formValidation).every(Boolean)}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: isLoading || !Object.values(formValidation).every(Boolean)
                ? (isDarkMode ? '#374151' : '#d1d5db')
                : 'linear-gradient(135deg, #a855f7, #9333ea, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1.25rem',
              fontWeight: '700',
              cursor: isLoading || !Object.values(formValidation).every(Boolean) ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isLoading || !Object.values(formValidation).every(Boolean) 
                ? 'none' 
                : '0 16px 32px -8px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
              transform: isLoading ? 'scale(0.98)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && Object.values(formValidation).every(Boolean)) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(168, 85, 247, 0.5), 0 0 50px rgba(168, 85, 247, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && Object.values(formValidation).every(Boolean)) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)';
              }
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ 
                  display: 'inline-block', 
                  animation: 'spin 1s linear infinite',
                  fontSize: '1.5rem'
                }}>⏳</span>
                جاري إنشاء الحساب...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                إنشاء الحساب
              </span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{
          textAlign: 'center',
          marginTop: '2.5rem',
          padding: '2rem',
          background: isDarkMode 
            ? 'rgba(30, 41, 59, 0.6)' 
            : 'rgba(248, 250, 252, 0.8)',
          borderRadius: '20px',
          border: isDarkMode 
            ? '1px solid rgba(71, 85, 105, 0.4)' 
            : '1px solid rgba(226, 232, 240, 0.6)'
        }}>
          <p style={{
            margin: '0 0 1.25rem 0',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            لديك حساب بالفعل؟
          </p>
          <Link
            to="/login"
            style={{
              color: isDarkMode ? '#a855f7' : '#9333ea',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(147, 51, 234, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(147, 51, 234, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(147, 51, 234, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🔑</span>
            تسجيل الدخول
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/"
            style={{
              color: isDarkMode ? '#64748b' : '#94a3b8',
              textDecoration: 'none',
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#64748b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDarkMode ? '#64748b' : '#94a3b8';
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
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-15px) rotate(2deg); }
            66% { transform: translateY(-8px) rotate(-2deg); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        `}
      </style>
    </div>
  );
};

export default Register;
