/**
 * Authentication Strategies
 * Strategy pattern for different authentication methods
 */

import { AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

// Base authentication strategy interface
export interface AuthStrategy {
  signIn(): Promise<{ error: AuthError | Error | null }>;
  signUp?(): Promise<{ error: AuthError | Error | null }>;
}

// Email/Password Strategy
export class EmailPasswordStrategy implements AuthStrategy {
  constructor(private email: string, private password: string) {}

  async signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });
    return { error };
  }

  async signUp() {
    const { error } = await supabase.auth.signUp({
      email: this.email,
      password: this.password,
    });
    return { error };
  }
}

// Google OAuth Strategy
export class GoogleOAuthStrategy implements AuthStrategy {
  private redirectUri: string;

  constructor() {
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: 'com.mytcgtracker.app', // Update with your actual scheme
    });
  }

  async signIn() {
    try {
      // Create code verifier and challenge for PKCE
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Get the authorization URL from Supabase
      const { data, error: urlError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.redirectUri,
          skipBrowserRedirect: true,
          queryParams: {
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
          },
        },
      });

      if (urlError || !data?.url) {
        return { error: urlError || new Error('Failed to get authorization URL') };
      }

      // Open browser for OAuth flow
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        this.redirectUri
      );

      if (result.type === 'success') {
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
        const code = params.get('code');

        if (code) {
          // Exchange code for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          return { error: exchangeError };
        }
      }

      return { error: new Error('OAuth flow was cancelled or failed') };
    } catch (error) {
      return { error: error as Error };
    }
  }

  private async generateCodeVerifier(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return this.base64URLEncode(randomBytes);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier
    );
    return this.base64URLEncode(hash);
  }

  private base64URLEncode(data: string | Uint8Array): string {
    let base64: string;
    if (typeof data === 'string') {
      base64 = Buffer.from(data).toString('base64');
    } else {
      base64 = Buffer.from(data).toString('base64');
    }
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// Apple OAuth Strategy
export class AppleOAuthStrategy implements AuthStrategy {
  async signIn() {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();

      if (!isAvailable) {
        return {
          error: new Error('Apple Authentication is not available on this device')
        };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Sign in with Supabase using the Apple ID token
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      return { error };
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { error: new Error('Apple sign in was cancelled') };
      }
      return { error: error as Error };
    }
  }
}

// Strategy Factory
export class AuthStrategyFactory {
  static createStrategy(
    type: 'email' | 'google' | 'apple',
    credentials?: { email?: string; password?: string }
  ): AuthStrategy {
    switch (type) {
      case 'email':
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required for email authentication');
        }
        return new EmailPasswordStrategy(credentials.email, credentials.password);

      case 'google':
        return new GoogleOAuthStrategy();

      case 'apple':
        return new AppleOAuthStrategy();

      default:
        throw new Error(`Unknown auth strategy type: ${type}`);
    }
  }
}
