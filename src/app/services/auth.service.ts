import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuth, AuthState, AccessToken } from '@okta/okta-auth-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oktaAuth: OktaAuth;
  private authStateSubject = new BehaviorSubject<AuthState | null>(null);
  public authState$: Observable<AuthState | null> = this.authStateSubject.asObservable();

  constructor(private router: Router) {
    this.oktaAuth = new OktaAuth({
      clientId: environment.okta.clientId,
      issuer: environment.okta.issuer,
      redirectUri: environment.okta.redirectUri,
      scopes: environment.okta.scopes,
      responseType: ['code'],
      pkce: environment.okta.pkce
    });

    // Subscribe to auth state changes
    this.oktaAuth.authStateManager.subscribe((authState) => {
      this.authStateSubject.next(authState);
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.oktaAuth.isAuthenticated();
  }

  async getUser() {
    const user = await this.oktaAuth.getUser();
    return user;
  }

  async getAccessToken(): Promise<string | undefined> {
    const tokenManager = this.oktaAuth.tokenManager;
    const accessToken = (await tokenManager.get('accessToken')) as AccessToken;
    return accessToken?.accessToken;
  }

  async login(username: string, password: string) {
    try {
      const transaction = await this.oktaAuth.signInWithCredentials({
        username,
        password
      });

      if (transaction.status === 'SUCCESS') {
        await this.oktaAuth.signInWithRedirect({ sessionToken: transaction.sessionToken });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async handleLoginRedirect() {
    try {
      await this.oktaAuth.handleLoginRedirect();
    } catch (error) {
      console.error('Handle login redirect error:', error);
    }
  }

  async logout() {
    await this.oktaAuth.signOut();
    this.router.navigate(['/login']);
  }

  async setTokensFromWidget(tokens: any): Promise<void> {
    try {
      // Set tokens in the token manager
      this.oktaAuth.tokenManager.setTokens(tokens);
      
      // Update auth state by getting the current state
      const authState = await this.oktaAuth.authStateManager.getAuthState();
      this.authStateSubject.next(authState);
    } catch (error) {
      console.error('Error setting tokens from widget:', error);
      throw error;
    }
  }

  getOktaAuth(): OktaAuth {
    return this.oktaAuth;
  }
}
