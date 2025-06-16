import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../services/api';
import UserStorage from '../utils/userStorage';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => void;
  clearError: () => void;
  refreshAccessToken: () => Promise<void>;
  clearUserAccount: (userId?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/auth/login', {
            username,
            password,
          });

          const { user, tokens } = response.data;
          
          set({
            user,
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'فشل تسجيل الدخول';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null
          });
          throw new Error(errorMessage);
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/auth/register', {
            username,
            email,
            password,
          });

          const { user, tokens } = response.data;
          
          set({
            user,
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'فشل إنشاء الحساب';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
            refreshToken: null
          });
          throw new Error(errorMessage);
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('لا يوجد رمز تحديث');
        }
        
        try {
          const response = await axios.post('/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          
          const { access_token } = response.data;
          
          set({ token: access_token });
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      logout: () => {
        const currentUser = get().user;
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Remove axios default header
        delete axios.defaults.headers.common['Authorization'];
        
        // Only clear session-specific data, preserve user preferences like favorites and theme
        if (currentUser?.id) {
          UserStorage.clearSessionData(currentUser.id);
        }
        
        // Note: User preferences (favorites, theme, etc.) are preserved for when they log back in
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        const state = get();
        if (state.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          set({ isAuthenticated: true });
        }
      },

      clearUserAccount: (userId?: string) => {
        const targetUserId = userId || get().user?.id;
        if (targetUserId) {
          // Clear ALL user data including preferences (for account deletion)
          UserStorage.clearUserData(targetUserId);
          console.log(`Cleared all data for user account: ${targetUserId}`);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth on store creation
useAuthStore.getState().initializeAuth();

// Setup axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshAccessToken();
        return axios(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
