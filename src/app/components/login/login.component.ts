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
    this.signIn = new OktaSignIn({
      baseUrl: environment.okta.issuer.split('/oauth2')[0],
      clientId: environment.okta.clientId,
      redirectUri: environment.okta.redirectUri,
      useInteractionCodeFlow: true, // Required for inline widget (no redirect)
      authParams: {
        issuer: environment.okta.issuer,
        scopes: environment.okta.scopes,
        pkce: environment.okta.pkce,
      },
      features: {
        registration: false,
        rememberMe: true,
        selfServiceUnlock: true,
        multiOptionalFactorEnroll: true
      },
      logo: 'https://www.ricoh.de/images/ricoh-logo.svg',
      i18n: {
        en: {
          'primaryauth.title': 'Sign In',
          'primaryauth.submit': 'Sign In'
        }
      }
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
      console.error('Error during sign-in:', err);
    });
  }

  ngOnDestroy(): void {
    if (this.signIn) {
      this.signIn.remove();
    }
  }
}
