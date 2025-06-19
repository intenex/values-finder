import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  saveValuesSession: (topValues: any[], allValues?: any[]) => Promise<void>;
  saveProgress: (progress: any, topValues?: any[], allValues?: any[]) => Promise<void>;
  getValuesSessions: () => Promise<any[]>;
  getLatestIncomplete: () => Promise<any>;
}

const API_BASE = '/api';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const authStore = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (authStore.sessionId) {
    headers['Authorization'] = `Bearer ${authStore.sessionId}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      sessionId: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        try {
          const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          
          set({
            user: response.user,
            sessionId: response.sessionId,
            isAuthenticated: true,
          });
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          };
        }
      },
      
      signup: async (email, password) => {
        try {
          const response = await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          
          set({
            user: response.user,
            sessionId: response.sessionId,
            isAuthenticated: true,
          });
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Signup failed' 
          };
        }
      },
      
      logout: async () => {
        try {
          await apiCall('/auth/logout', { method: 'POST' });
        } catch {
          // Ignore errors on logout
        }
        
        set({
          user: null,
          sessionId: null,
          isAuthenticated: false,
        });
      },
      
      checkAuth: async () => {
        try {
          const response = await apiCall('/auth/me');
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch {
          set({
            user: null,
            sessionId: null,
            isAuthenticated: false,
          });
        }
      },
      
      saveValuesSession: async (topValues, allValues) => {
        await apiCall('/values/sessions', {
          method: 'POST',
          body: JSON.stringify({ topValues, allValues }),
        });
      },
      
      saveProgress: async (progress, topValues, allValues) => {
        await apiCall('/values/progress', {
          method: 'POST',
          body: JSON.stringify({ progress, topValues, allValues }),
        });
      },
      
      getValuesSessions: async () => {
        return apiCall('/values/sessions');
      },
      
      getLatestIncomplete: async () => {
        return apiCall('/values/latest-incomplete');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        sessionId: state.sessionId,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);