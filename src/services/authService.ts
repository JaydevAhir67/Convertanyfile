import { UserProfile, AuthState } from '../types';

const AUTH_STORAGE_KEY = 'caf_auth_session';

export interface AuthTestStepResult {
  step: number;
  name: string;
  action: string;
  expected: string;
  actual: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  timestamp: string;
  details?: string;
}

export class AuthService {
  private static listeners: Array<(state: AuthState) => void> = [];

  /**
   * Retrieves the current persisted authentication state from localStorage
   */
  public static getInitialState(): AuthState {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          return {
            isAuthenticated: true,
            user: parsed.user,
            token: parsed.token
          };
        }
      }
    } catch {
      // Fallback on storage errors
    }
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }

  /**
   * Subscribe to authentication state changes
   */
  public static subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(state: AuthState) {
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Log in with credentials
   */
  public static login(email: string, name?: string): AuthState {
    const cleanEmail = email.trim().toLowerCase() || 'user@convertanyfile.com';
    const cleanName = name || cleanEmail.split('@')[0] || 'Member';

    const user: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      lastLoginAt: new Date().toISOString()
    };

    const token = `jwt_caf_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const newState: AuthState = {
      isAuthenticated: true,
      user,
      token
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignore localStorage quotas
    }

    this.notify(newState);
    return newState;
  }

  /**
   * Log out current user and invalidate session
   */
  public static logout(): AuthState {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }

    const newState: AuthState = {
      isAuthenticated: false,
      user: null,
      token: null
    };

    this.notify(newState);
    return newState;
  }

  /**
   * Verify if a given route requires authentication
   */
  public static isRouteProtected(route: string): boolean {
    const clean = route.toLowerCase().replace(/^\/+/, '').replace(/^#\/?/, '');
    return clean === 'history';
  }
}
