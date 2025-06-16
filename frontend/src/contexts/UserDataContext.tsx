import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUserPreferences } from '../hooks/useUserPreferences';

interface UserDataContextType {
  isDataLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  reloadUserData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: React.ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { preferences, loading: preferencesLoading, error: preferencesError, reloadPreferences } = useUserPreferences();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, checking preferences loading state...');
      setIsLoading(preferencesLoading);
      setError(preferencesError);
      
      // Set data as loaded once preferences have finished loading (success or error)
      if (!preferencesLoading) {
        setIsDataLoaded(true);
        console.log('User data loading completed. Error:', preferencesError);
      }
    } else {
      // User is not authenticated, reset state
      console.log('User not authenticated, resetting user data state');
      setIsDataLoaded(false);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user?.id, preferencesLoading, preferencesError]);

  const reloadUserData = async () => {
    if (isAuthenticated && user) {
      console.log('Reloading user data...');
      setIsDataLoaded(false);
      setIsLoading(true);
      setError(null);
      
      try {
        await reloadPreferences();
        setIsDataLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to reload user data:', error);
        setError('Failed to reload user data');
        setIsLoading(false);
      }
    }
  };

  const value: UserDataContextType = {
    isDataLoaded,
    isLoading,
    error,
    reloadUserData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
