import api from './api';

export interface UserPreferences {
  id?: number;
  theme: string;
  language_preference: string;
  sound_enabled: boolean;
  volume_level: number;
  prayer_notifications: Record<string, any>;
  daily_goal: number;
  quran_audio_favorites: string[];
  hadith_favorites: string[];
  azkar_favorites: string[];
  last_reciter?: string;
  last_server?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  user: {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    country?: string;
    city?: string;
  };
  preferences: UserPreferences | null;
  location: any;
  reading_stats: any;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/user/profile');
    return response.data;
  }

  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get('/user/preferences');
    return response.data.preferences;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put('/user/preferences', preferences);
    return response.data.preferences;
  }

  async updateTheme(theme: string): Promise<UserPreferences> {
    return this.updatePreferences({ theme });
  }

  async updateQuranAudioFavorites(favorites: string[]): Promise<UserPreferences> {
    return this.updatePreferences({ quran_audio_favorites: favorites });
  }

  async updateHadithFavorites(favorites: string[]): Promise<UserPreferences> {
    return this.updatePreferences({ hadith_favorites: favorites });
  }

  async updateAzkarFavorites(favorites: string[]): Promise<UserPreferences> {
    return this.updatePreferences({ azkar_favorites: favorites });
  }

  async updateLastReciter(reciter: string, server: string): Promise<UserPreferences> {
    return this.updatePreferences({ 
      last_reciter: reciter,
      last_server: server 
    });
  }

  async updateVolumeLevel(volume: number): Promise<UserPreferences> {
    return this.updatePreferences({ volume_level: volume });
  }
}

export const userService = new UserService();
export default userService;
