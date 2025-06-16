import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userService, UserPreferences } from '../services/userService';

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateTheme: (theme: string) => Promise<void>;
  updateQuranAudioFavorites: (favorites: string[]) => Promise<void>;
  updateHadithFavorites: (favorites: string[]) => Promise<void>;
  updateAzkarFavorites: (favorites: string[]) => Promise<void>;
  updateLastReciter: (reciter: string, server: string) => Promise<void>;
  updateVolumeLevel: (volume: number) => Promise<void>;
  reloadPreferences: () => Promise<void>;
}

export const useUserPreferences = (): UseUserPreferencesReturn => {
  const { user, isAuthenticated } = useAuthStore();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('Cannot load preferences: not authenticated or no user');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching preferences from API for user:', user.id);
      const userPrefs = await userService.getPreferences();
      console.log('Successfully loaded user preferences:', userPrefs);
      setPreferences(userPrefs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preferences';
      setError(errorMessage);
      console.error('Failed to load user preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Single effect to handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!preferences && !loading && !hasInitialized) {
        console.log('Loading user preferences for user:', user.id);
        setHasInitialized(true);
        loadPreferences();
      }
    } else {
      // Clear preferences when user logs out
      console.log('User logged out, clearing preferences');
      setPreferences(null);
      setError(null);
      setHasInitialized(false);
    }
  }, [isAuthenticated, user?.id, preferences, loading, hasInitialized, loadPreferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to update preferences');
    }

    try {
      const updatedPrefs = await userService.updatePreferences(updates);
      setPreferences(updatedPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  const updateTheme = async (theme: string) => {
    await updatePreferences({ theme });
  };

  const updateQuranAudioFavorites = async (favorites: string[]) => {
    await updatePreferences({ quran_audio_favorites: favorites });
  };

  const updateHadithFavorites = async (favorites: string[]) => {
    await updatePreferences({ hadith_favorites: favorites });
  };

  const updateAzkarFavorites = async (favorites: string[]) => {
    await updatePreferences({ azkar_favorites: favorites });
  };

  const updateLastReciter = async (reciter: string, server: string) => {
    await updatePreferences({ 
      last_reciter: reciter,
      last_server: server 
    });
  };

  const updateVolumeLevel = async (volume: number) => {
    await updatePreferences({ volume_level: volume });
  };

  const reloadPreferences = async () => {
    if (isAuthenticated && user) {
      console.log('Manually reloading preferences for user:', user.id);
      await loadPreferences();
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateTheme,
    updateQuranAudioFavorites,
    updateHadithFavorites,
    updateAzkarFavorites,
    updateLastReciter,
    updateVolumeLevel,
    reloadPreferences,
  };
};

export default useUserPreferences;
