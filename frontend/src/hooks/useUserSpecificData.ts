import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import UserStorage from '../utils/userStorage';

/**
 * Hook to manage user-specific data that automatically resets when user changes
 */
export function useUserSpecificData<T>(
  key: string,
  defaultValue: T,
  setValue: (value: T) => void
): {
  loadUserData: () => void;
  saveUserData: (value: T) => void;
  clearUserData: () => void;
} {
  const { user } = useAuthStore();
  const previousUserIdRef = useRef<string | undefined>(user?.id);

  // Load user data
  const loadUserData = () => {
    if (!user?.id) {
      setValue(defaultValue);
      return;
    }
    
    const savedData = UserStorage.get(user.id, key, defaultValue);
    setValue(savedData);
    
    // Migrate old global data if it exists
    UserStorage.migrateGlobalData(user.id, key);
  };

  // Save user data
  const saveUserData = (value: T) => {
    if (user?.id) {
      UserStorage.set(user.id, key, value);
    }
  };

  // Clear user data
  const clearUserData = () => {
    setValue(defaultValue);
  };

  // Auto-load when user changes
  useEffect(() => {
    const currentUserId = user?.id;
    
    // Check if user actually changed
    if (previousUserIdRef.current !== currentUserId) {
      // User changed, clear current data first
      setValue(defaultValue);
      
      // Then load new user's data
      loadUserData();
      
      // Update the ref
      previousUserIdRef.current = currentUserId;
    }
  }, [user?.id]);

  return {
    loadUserData,
    saveUserData,
    clearUserData
  };
}

export default useUserSpecificData;
