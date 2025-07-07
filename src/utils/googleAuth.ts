import { GoogleAuthConfig } from '../types';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export class GoogleAuthManager {
  private static instance: GoogleAuthManager;
  private isInitialized = false;
  private authInstance: any = null;
  private clientId = '';
  
  private constructor() {}
  
  static getInstance(): GoogleAuthManager {
    if (!GoogleAuthManager.instance) {
      GoogleAuthManager.instance = new GoogleAuthManager();
    }
    return GoogleAuthManager.instance;
  }
  
  async initialize(clientId: string): Promise<void> {
    if (this.isInitialized && this.clientId === clientId) {
      return;
    }
    
    this.clientId = clientId;
    
    // Load Google Identity Services
    await this.loadGoogleIdentityServices();
    
    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: this.handleCredentialResponse.bind(this)
    });
    
    this.isInitialized = true;
  }
  
  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }
  
  private handleCredentialResponse(response: any) {
    // This is for ID token, we need access token for API calls
    console.log('Credential response:', response);
  }
  
  async signIn(): Promise<GoogleAuthConfig> {
    if (!this.isInitialized) {
      throw new Error('GoogleAuthManager not initialized');
    }
    
    return new Promise((resolve, reject) => {
      // Use OAuth 2.0 flow for access token
      window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          
          const authConfig: GoogleAuthConfig = {
            clientId: this.clientId,
            isSignedIn: true,
            accessToken: response.access_token,
            userEmail: 'authenticated-user' // We'll get this from profile API if needed
          };
          
          // Store token with expiry
          const tokenData = {
            accessToken: response.access_token,
            tokenExpiry: Date.now() + (response.expires_in * 1000),
            refreshToken: response.refresh_token
          };
          
          localStorage.setItem('google-auth-token', JSON.stringify(tokenData));
          resolve(authConfig);
        }
      }).requestAccessToken();
    });
  }
  
  async signOut(): Promise<void> {
    localStorage.removeItem('google-auth-token');
    
    if (window.google?.accounts?.oauth2) {
      // Revoke token if available
      const tokenData = this.getStoredToken();
      if (tokenData?.accessToken) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${tokenData.accessToken}`, {
            method: 'POST'
          });
        } catch (error) {
          console.warn('Failed to revoke token:', error);
        }
      }
    }
  }
  
  getStoredToken(): { accessToken: string; tokenExpiry: number; refreshToken?: string } | null {
    const stored = localStorage.getItem('google-auth-token');
    if (!stored) return null;
    
    try {
      const tokenData = JSON.parse(stored);
      
      // Check if token is expired
      if (tokenData.tokenExpiry && Date.now() > tokenData.tokenExpiry) {
        localStorage.removeItem('google-auth-token');
        return null;
      }
      
      return tokenData;
    } catch {
      localStorage.removeItem('google-auth-token');
      return null;
    }
  }
  
  isSignedIn(): boolean {
    const token = this.getStoredToken();
    return !!token?.accessToken;
  }
  
  getAccessToken(): string | null {
    const token = this.getStoredToken();
    return token?.accessToken || null;
  }
  
  async getCurrentUser(): Promise<{ email: string; name: string } | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;
    
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        return {
          email: userInfo.email,
          name: userInfo.name
        };
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
    
    return null;
  }
}

export const googleAuth = GoogleAuthManager.getInstance();