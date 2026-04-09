import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  AccountInfo,
  getAccountInfo,
  signInWithApple,
  signInWithGoogle,
  signOut as authSignOut,
  classifyAuthError,
} from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { initializeAuth, pushAllFeedbackHistory } from '../services/syncService';

export interface AuthState {
  isAnonymous: boolean;
  provider: 'apple' | 'google' | null;
  email: string | null;
  isLoading: boolean;
  appleAvailable: boolean;
  handleSignInWithApple: () => Promise<void>;
  handleSignInWithGoogle: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({ status: 'anonymous' });
  const [isLoading, setIsLoading] = useState(true);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Check Apple availability once (iOS 13+ only)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
    }
  }, []);

  // Load initial state and subscribe to auth changes
  useEffect(() => {
    getAccountInfo().then((info) => {
      setAccountInfo(info);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const info = await getAccountInfo();
        setAccountInfo(info);
      } else if (event === 'SIGNED_OUT') {
        setAccountInfo({ status: 'anonymous' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignInWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      // signInWithIdToken with an active anonymous session links the identity
      // (user_id unchanged). On a new device it restores the authenticated session.
      await signInWithApple();
      // Ensure all local feedback is on the server after linking
      await pushAllFeedbackHistory();
    } catch (e) {
      const msg = classifyAuthError(e);
      if (msg) Alert.alert('Sign in failed', msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      await pushAllFeedbackHistory();
    } catch (e) {
      const msg = classifyAuthError(e);
      if (msg) Alert.alert('Sign in failed', msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      // Create a new anonymous session immediately so the app keeps working
      await initializeAuth();
    } catch {
      // Best-effort — local data is already cleared by authSignOut
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAnonymous: accountInfo.status === 'anonymous',
    provider: accountInfo.status === 'authenticated' ? accountInfo.provider : null,
    email: accountInfo.status === 'authenticated' ? accountInfo.email : null,
    isLoading,
    appleAvailable,
    handleSignInWithApple,
    handleSignInWithGoogle,
    handleSignOut,
  };
}
