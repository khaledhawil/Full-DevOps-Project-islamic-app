import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AudioProvider, useAudioPlayer } from './contexts/AudioContext';
import { UserDataProvider } from './contexts/UserDataContext';
import Navbar from './components/Navbar';
import AudioWidget from './components/AudioWidget';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasbeh from './pages/Tasbeh';
import PrayerTimes from './pages/PrayerTimes';
import Quran from './pages/Quran';
import QuranAudio from './pages/QuranAudio';
import Hadith from './pages/Hadith';
import Azkar from './pages/Azkar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './App.css';

// Define ProtectedRoute component for cleaner route protection
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  return auth.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Component to render AudioWidget
const AudioWidgetRenderer = () => {
  const {
    isWidgetVisible,
    isPlaying,
    currentTime,
    duration,
    volume,
    surahName,
    reciterName,
    pauseAudio,
    resumeAudio,
    stopAudio,
    setVolume,
    seekTo,
    hideWidget
  } = useAudioPlayer();

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  return (
    <AudioWidget
      isVisible={isWidgetVisible}
      surahName={surahName || undefined}
      reciterName={reciterName || undefined}
      onClose={() => {
        stopAudio();
        hideWidget();
      }}
      onPlayPause={handlePlayPause}
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      onVolumeChange={setVolume}
      onSeek={seekTo}
    />
  );
};

// App Routes configuration with authentication checks
const AppRoutes = () => {
  const auth = useAuth();

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!auth.isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!auth.isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/tasbeh" element={<ProtectedRoute><Tasbeh /></ProtectedRoute>} />
          <Route path="/prayer-times" element={<ProtectedRoute><PrayerTimes /></ProtectedRoute>} />
          <Route path="/quran" element={<ProtectedRoute><Quran /></ProtectedRoute>} />
          <Route path="/quran-audio" element={<ProtectedRoute><QuranAudio /></ProtectedRoute>} />
          <Route path="/hadith" element={<ProtectedRoute><Hadith /></ProtectedRoute>} />
          <Route path="/azkar" element={<ProtectedRoute><Azkar /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </main>
      <AudioWidgetRenderer />
    </div>
  );
};

// Main App component with providers
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserDataProvider>
            <AudioProvider>
              <AppRoutes />
            </AudioProvider>
          </UserDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
