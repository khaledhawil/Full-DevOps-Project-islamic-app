/**
 * User-specific localStorage utilities
 * Ensures that all user data is stored per user to prevent data mixing between users
 */

export class UserStorage {
  /**
   * Get user-specific data from localStorage
   * @param userId - The user ID
   * @param key - The storage key
   * @param defaultValue - Default value if not found
   * @returns The stored value or default value
   */
  static get<T>(userId: string | undefined, key: string, defaultValue: T): T {
    if (!userId) {
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(`${key}_${userId}`);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage for key ${key}_${userId}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set user-specific data in localStorage
   * @param userId - The user ID
   * @param key - The storage key
   * @param value - The value to store
   */
  static set<T>(userId: string | undefined, key: string, value: T): void {
    if (!userId) {
      console.warn('Cannot store data without user ID');
      return;
    }
    
    try {
      localStorage.setItem(`${key}_${userId}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}_${userId}:`, error);
    }
  }

  /**
   * Remove user-specific data from localStorage
   * @param userId - The user ID
   * @param key - The storage key
   */
  static remove(userId: string | undefined, key: string): void {
    if (!userId) {
      return;
    }
    
    try {
      localStorage.removeItem(`${key}_${userId}`);
    } catch (error) {
      console.error(`Error removing from localStorage for key ${key}_${userId}:`, error);
    }
  }

  /**
   * Clear all user-specific data from localStorage
   * @param userId - The user ID
   */
  static clearUserData(userId: string | undefined): void {
    if (!userId) {
      return;
    }
    
    try {
      // Get all localStorage keys and collect user-specific ones
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith(`_${userId}`)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all collected keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`Cleared ${keysToRemove.length} user-specific items for user ${userId}`);
    } catch (error) {
      console.error(`Error clearing user data for user ${userId}:`, error);
    }
  }

  /**
   * Migrate old global data to user-specific storage
   * @param userId - The user ID
   * @param oldKey - The old global key
   * @param newKey - The new user-specific key base
   */
  static migrateGlobalData(userId: string | undefined, oldKey: string, newKey?: string): void {
    if (!userId) {
      return;
    }
    
    const key = newKey || oldKey;
    
    try {
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        // Move old data to user-specific key
        localStorage.setItem(`${key}_${userId}`, oldData);
        // Remove old global data
        localStorage.removeItem(oldKey);
        console.log(`Migrated data from ${oldKey} to ${key}_${userId}`);
      }
    } catch (error) {
      console.error(`Error migrating data from ${oldKey}:`, error);
    }
  }

  /**
   * Clear only session-related user data (temporary data that shouldn't persist after logout)
   * @param userId - The user ID
   */
  static clearSessionData(userId: string | undefined): void {
    if (!userId) {
      return;
    }
    
    // Define session-specific keys that should be cleared on logout
    const sessionKeys = [
      'currentPlayingSurah',
      'audioPlayerState',
      'tempSettings',
      'sessionCache'
    ];
    
    try {
      sessionKeys.forEach(key => {
        this.remove(userId, key);
      });
      
      console.log(`Cleared session data for user ${userId}`);
    } catch (error) {
      console.error(`Error clearing session data for user ${userId}:`, error);
    }
  }

  /**
   * Clear only user preferences and persistent data (use with caution)
   * This should only be called when explicitly requested by user (like account deletion)
   * @param userId - The user ID
   */
  static clearUserPreferences(userId: string | undefined): void {
    if (!userId) {
      return;
    }
    
    // Define preference keys that contain user's saved preferences
    const preferenceKeys = [
      'theme',
      'hadithFavorites',
      'quranAudioFavorites',
      'userSettings',
      'savedRecitations'
    ];
    
    try {
      preferenceKeys.forEach(key => {
        this.remove(userId, key);
      });
      
      console.log(`Cleared user preferences for user ${userId}`);
    } catch (error) {
      console.error(`Error clearing user preferences for user ${userId}:`, error);
    }
  }
}

export default UserStorage;
