import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import OktaSignIn from '@okta/okta-signin-widget';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  signIn: any;
  private signupClicked = false; // Flag to prevent multiple clicks
  private widgetInitialized = false; // Flag to prevent multiple initializations

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Ensure complete cleanup first
    this.cleanupWidget();
    
    // Small delay to ensure cleanup from previous component
    setTimeout(() => {
      this.initializeWidget();
    }, 150);
  }

  private cleanupWidget(): void {
    // Remove any existing widget instance
    if (this.signIn) {
      try {
        this.signIn.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
      this.signIn = null;
    }

    // Clear widget container completely
    const widgetContainer = document.getElementById('sign-up-widget');
    if (widgetContainer) {
      widgetContainer.innerHTML = '';
      // Remove any event listeners or data attributes
      widgetContainer.removeAttribute('data-okta-widget');
    }

    // Remove any globally stored widget references
    try {
      if ((window as any).oktaSignIn) {
        (window as any).oktaSignIn.remove();
        delete (window as any).oktaSignIn;
      }
    } catch (e) {
      // Ignore
    }

    // Clear any Okta-related session storage that might maintain state
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.includes('okta') || key.includes('idx')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore if sessionStorage is not available
    }
  }

  private initializeWidget(): void {
    // Prevent multiple initializations
    if (this.widgetInitialized) {
      return;
    }
    
    // Ensure cleanup before initializing
    this.cleanupWidget();
    
    // Reset flags
    this.signupClicked = false;
    this.widgetInitialized = true;
    
    // Create widget after cleanup
    setTimeout(() => {
      this.createWidget();
    }, 100);
  }

  private createWidget(): void {
    this.signIn = new OktaSignIn({
      baseUrl: environment.okta.issuer.split('/oauth2')[0],
      clientId: environment.okta.clientId,
      redirectUri: environment.okta.redirectUri,
      useInteractionCodeFlow: true, // Required for inline widget (no redirect)
      authParams: {
        issuer: environment.okta.issuer,
        scopes: environment.okta.scopes,
        pkce: environment.okta.pkce
      },
      features: {
        registration: true, // Explicitly enable registration on signup page
        rememberMe: true,
        selfServiceUnlock: true,
        multiOptionalFactorEnroll: false
      }
    });

    // Handle widget rendering - click signup when on primary-auth
    this.signIn.on('afterRender', (context: any) => {
      // Only process if we're on primary-auth and haven't clicked signup yet
      if (context.controller === 'primary-auth' && !this.signupClicked) {
        console.log('Signup: Primary auth rendered, triggering signup click...');
        this.triggerSignupClick();
      } else if (context.controller !== 'primary-auth' && !this.signupClicked) {
        // If we're not on primary-auth (e.g., password step), try to find back button
        console.log('Signup: Not on primary-auth, looking for back button...');
        const container = document.getElementById('sign-up-widget');
        if (container) {
          const backButton = container.querySelector('a[data-se="back"], a[href*="back"], .back-link') as HTMLElement;
          if (backButton) {
            console.log('Signup: Found back button, clicking to return to primary-auth...');
            backButton.click();
            // Don't set signupClicked here - wait for primary-auth to render
          }
        }
      }
    });

    this.signIn.showSignInToGetTokens({
      el: '#sign-up-widget',
      scopes: environment.okta.scopes
    }).then(async (tokens: any) => {
      try {
        // Use the service method to properly set tokens and update auth state
        await this.authService.setTokensFromWidget(tokens);
        
        // Verify authentication before navigating
        const isAuth = await this.authService.isAuthenticated();
        if (isAuth) {
          this.signIn.remove();
          this.router.navigate(['/dashboard']);
        } else {
          console.error('Authentication verification failed after setting tokens');
        }
      } catch (error) {
        console.error('Error setting tokens:', error);
      }
    }).catch((err: any) => {
      console.error('Error during sign-up:', err);
    });
  }

  private triggerSignupClick(): void {
    // Prevent multiple clicks
    if (this.signupClicked) {
      return;
    }

    setTimeout(() => {
      // ONLY search within the signup widget container
      const container = document.getElementById('sign-up-widget');
      if (!container) {
        console.error('Signup widget container not found');
        return;
      }

      let signupLink: HTMLElement | null = null;
      
      // Method 1: Direct selectors within container
      const selectors = [
        'a[data-se="enroll"]',
        'a[data-se="registration"]',
        '.registration-link',
        '.js-enroll',
        '.enroll-link'
      ];
      
      for (const selector of selectors) {
        signupLink = container.querySelector(selector) as HTMLElement;
        if (signupLink) {
          console.log('Signup: Found link with selector:', selector);
          break;
        }
      }
      
      // Method 2: Search links by text content within container only
      if (!signupLink) {
        const allLinks = Array.from(container.querySelectorAll('a'));
        signupLink = allLinks.find(link => {
          const text = link.textContent?.toLowerCase() || '';
          return text.includes('sign up') || text.includes('enroll') || text.includes('register');
        }) as HTMLElement || null;
        
        if (signupLink) {
          console.log('Signup: Found link by text:', signupLink.textContent);
        }
      }
      
      if (signupLink) {
        console.log('Signup: Clicking signup link...');
        this.signupClicked = true; // Set flag before clicking
        signupLink.click();
      } else {
        console.warn('Signup: Link not found. Enable self-service registration in Okta.');
      }
    }, 400);
  }

  ngOnDestroy(): void {
    this.widgetInitialized = false;
    this.signupClicked = false;
    this.cleanupWidget();
  }
}
