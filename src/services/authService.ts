import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, AuthState } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
// Keep select account prompt if needed
provider.setCustomParameters({
  prompt: 'select_account'
});

// Flag to track ongoing sign in flow
let isSigningIn = false;
// MANDATORY: In-memory cache for the access token. Never stored in localStorage.
let cachedAccessToken: string | null = null;

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
  private static isInitialized = false;

  /**
   * Initializes the Firebase Auth state listener and sets up token tracking.
   */
  public static initAuth(
    onAuthSuccess?: (user: UserProfile, token: string) => void,
    onAuthFailure?: () => void
  ) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    onAuthStateChanged(auth, async (user: User | null) => {
      if (user && cachedAccessToken) {
        const profile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
          email: user.email || '',
          role: 'user',
          avatarUrl: user.photoURL || undefined,
          lastLoginAt: new Date().toISOString(),
          provider: 'google'
        };

        const state: AuthState = {
          isAuthenticated: true,
          user: profile,
          token: cachedAccessToken,
          hasDriveAccess: true
        };

        this.persistBasicUserSession(profile);
        this.notify(state);
        if (onAuthSuccess) onAuthSuccess(profile, cachedAccessToken);
      } else if (!isSigningIn) {
        // If not in middle of interactive popup and no token, clean in-memory token
        cachedAccessToken = null;
        if (!user) {
          // If completely signed out of Firebase, clear any session if provider was google
          const current = this.getInitialState();
          if (current.user?.provider === 'google') {
            this.clearSession();
          }
        }
        if (onAuthFailure) onAuthFailure();
      }
    });
  }

  /**
   * Retrieves the current persisted authentication state from memory or localStorage fallback
   */
  public static getInitialState(): AuthState {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          return {
            isAuthenticated: true,
            user: parsed.user,
            token: cachedAccessToken || (parsed.user?.provider !== 'google' ? parsed.token : null),
            hasDriveAccess: !!cachedAccessToken
          };
        }
      }
    } catch {
      // Fallback on storage errors
    }
    return {
      isAuthenticated: false,
      user: null,
      token: cachedAccessToken,
      hasDriveAccess: !!cachedAccessToken
    };
  }

  /**
   * Returns the cached in-memory access token for Google Workspace / Drive APIs
   */
  public static async getAccessToken(): Promise<string | null> {
    return cachedAccessToken;
  }

  /**
   * Interactive "Continue with Google" sign-in flow.
   * Acquires Google Drive OAuth token and stores it in memory.
   */
  public static async googleSignIn(): Promise<{ user: UserProfile; accessToken: string }> {
    try {
      isSigningIn = true;
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error('Google Sign-In succeeded, but no access token was returned for Google Drive.');
      }

      cachedAccessToken = credential.accessToken;

      const profile: UserProfile = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
        email: result.user.email || '',
        role: 'user',
        avatarUrl: result.user.photoURL || undefined,
        lastLoginAt: new Date().toISOString(),
        provider: 'google'
      };

      const newState: AuthState = {
        isAuthenticated: true,
        user: profile,
        token: cachedAccessToken,
        hasDriveAccess: true
      };

      this.persistBasicUserSession(profile);
      this.notify(newState);

      return { user: profile, accessToken: cachedAccessToken };
    } catch (error: any) {
      console.error('[AuthService] Google Sign-In failed:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  }

  /**
   * Persists non-sensitive user metadata to localStorage (WITHOUT the OAuth access token)
   */
  private static persistBasicUserSession(user: UserProfile) {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user,
          savedAt: new Date().toISOString()
        })
      );
    } catch {}
  }

  private static clearSession() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
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
   * Standard Email/Password Login (Fallback / Demo)
   */
  public static login(email: string, name?: string): AuthState {
    const cleanEmail = email.trim().toLowerCase() || 'user@convertanyfile.com';
    const cleanName = name || cleanEmail.split('@')[0] || 'Member';

    const user: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      lastLoginAt: new Date().toISOString(),
      provider: 'email'
    };

    const token = `jwt_caf_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const newState: AuthState = {
      isAuthenticated: true,
      user,
      token,
      hasDriveAccess: false
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
    } catch {}

    this.notify(newState);
    return newState;
  }

  /**
   * Invalidate session and sign out from Google and local state
   */
  public static async logout(): Promise<AuthState> {
    try {
      await signOut(auth).catch(() => {});
    } catch {}

    cachedAccessToken = null;
    this.clearSession();

    const newState: AuthState = {
      isAuthenticated: false,
      user: null,
      token: null,
      hasDriveAccess: false
    };

    this.notify(newState);
    return newState;
  }

  /**
   * Verify if a given route requires authentication
   */
  public static isRouteProtected(route: string): boolean {
    const clean = route.toLowerCase().replace(/^\/+/, '').replace(/^#\/?/, '');
    return clean === 'history' || clean === 'drive';
  }
}
