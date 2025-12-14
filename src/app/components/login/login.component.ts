import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import OktaSignIn from '@okta/okta-signin-widget';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  signIn: any;

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

    // Clear widget container
    const widgetContainer = document.getElementById('sign-in-widget');
    if (widgetContainer) {
      widgetContainer.innerHTML = '';
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
  }

  private initializeWidget(): void {
    // Ensure cleanup before initializing
    this.cleanupWidget();

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
        registration: false, // Explicitly disable registration on login page
        rememberMe: true,
        selfServiceUnlock: true,
        multiOptionalFactorEnroll: true
      },
      i18n: {
        en: {
          'primaryauth.title': 'Sign In',
          'primaryauth.submit': 'Sign In'
        }
      }
    });

    // Hide registration links whenever widget renders
    this.signIn.on('afterRender', (context: any) => {
      console.log('Login: Controller =', context.controller);
      setTimeout(() => this.hideRegistrationLinks(), 50);
    });

    this.signIn.showSignInToGetTokens({
      el: '#sign-in-widget',
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
      console.error('Login error:', err);
    });
  }

  private hideRegistrationLinks(): void {
    // Hide any signup/enroll/registration links with comprehensive selectors
    const container = document.getElementById('sign-in-widget');
    if (!container) return;

    const selectors = [
      'a[data-se="enroll"]',
      'a[data-se="registration"]',
      '.registration-link',
      '.js-enroll',
      '.enroll-link'
    ];
    
    selectors.forEach(selector => {
      const links = container.querySelectorAll(selector);
      links.forEach(link => {
        (link as HTMLElement).style.display = 'none';
      });
    });

    // Also search by text content
    const allLinks = Array.from(container.querySelectorAll('a'));
    allLinks.forEach(link => {
      const text = link.textContent?.toLowerCase() || '';
      if (text.includes('sign up') || text.includes('enroll') || text.includes('register')) {
        (link as HTMLElement).style.display = 'none';
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupWidget();
  }
}
