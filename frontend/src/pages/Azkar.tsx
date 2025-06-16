import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Azkar: React.FC = () => {
  const { theme, isDarkMode } = useTheme();

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
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '5rem',
          marginBottom: '2rem'
        }}>
          🌙
        </div>
        
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem'
        }}>
          الأذكار
        </h1>
        
        <div style={{
          background: isDarkMode 
            ? 'rgba(15, 23, 42, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: `0 15px 40px ${theme.colors.shadow}`
        }}>
          <p style={{
            fontSize: '1.8rem',
            color: theme.colors.text,
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            🕌 صفحة الأذكار قيد التطوير
          </p>
          
          <p style={{
            fontSize: '1.2rem',
            color: theme.colors.textSecondary,
            lineHeight: '1.6'
          }}>
            ستحتوي هذه الصفحة على أذكار الصباح والمساء والأذكار المتنوعة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Azkar;
