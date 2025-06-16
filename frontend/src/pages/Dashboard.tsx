import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import axios from '../services/api';

interface UserStats {
  totalTasbeh: number;
  dailyGoal: number;
  currentStreak: number;
  totalReadings: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    totalTasbeh: 0,
    dailyGoal: 100,
    currentStreak: 0,
    totalReadings: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadUserStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await axios.get('/user/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem'
      }}>
        ⏳ جاري التحميل...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
        color: 'white',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem' }}>
          🕌 لوحة التحكم الإسلامية
        </h1>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
          مرحباً بك {user?.username}
        </h2>
        <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          <div>{formatDate(currentTime)}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📿</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2E7D32' }}>إجمالي التسبيحات</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976D2' }}>
            {stats.totalTasbeh.toLocaleString()}
          </div>
        </div>

        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2E7D32' }}>الهدف اليومي</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
            {stats.dailyGoal}
          </div>
        </div>

        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2E7D32' }}>أيام متتالية</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F44336' }}>
            {stats.currentStreak}
          </div>
        </div>

        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2E7D32' }}>إجمالي القراءات</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9C27B0' }}>
            {stats.totalReadings}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#2E7D32', textAlign: 'center' }}>
          ⚡ الإجراءات السريعة
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/tasbeh')}
            style={{
              padding: '1rem',
              backgroundColor: '#1976D2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            📿 بدء التسبيح
          </button>

          <button
            onClick={() => navigate('/prayer-times')}
            style={{
              padding: '1rem',
              backgroundColor: '#7B1FA2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            🕌 أوقات الصلاة
          </button>

          <button
            onClick={() => navigate('/quran')}
            style={{
              padding: '1rem',
              backgroundColor: '#388E3C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            📖 قراءة القرآن
          </button>

          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '1rem',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            👤 الملف الشخصي
          </button>
        </div>
      </div>

      {/* Today's Motivation */}
      <div style={{ 
        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>🌟 آية اليوم</h3>
        <div style={{ 
          fontSize: '1.3rem', 
          fontStyle: 'italic', 
          lineHeight: '1.6',
          marginBottom: '1rem'
        }}>
          "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
        </div>
        <div style={{ fontSize: '1rem', opacity: 0.9 }}>
          سورة الطلاق - آية 2
        </div>
      </div>

      {/* Account Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        marginTop: '2rem'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🏠 الرئيسية
        </button>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚪 تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
