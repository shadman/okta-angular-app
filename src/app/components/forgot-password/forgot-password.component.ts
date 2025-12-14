import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import OktaSignIn from '@okta/okta-signin-widget';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  signIn: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.signIn = new OktaSignIn({
      baseUrl: environment.okta.issuer.split('/oauth2')[0],
      clientId: environment.okta.clientId,
      redirectUri: environment.okta.redirectUri,
      useInteractionCodeFlow: true,
      authParams: {
        issuer: environment.okta.issuer,
        scopes: environment.okta.scopes,
        pkce: environment.okta.pkce,
      },
      features: {
        registration: false,
        rememberMe: false,
        selfServiceUnlock: true,
        multiOptionalFactorEnroll: false
      },
      //logo: ' ',
      i18n: {
        en: {
          'primaryauth.title': 'Reset Password',
          'primaryauth.username.placeholder': 'Email',
          'primaryauth.password.placeholder': 'Password',
          'primaryauth.submit': 'Send Reset Link',
          'forgotpassword.title': 'Reset Password',
          'forgotpassword.submit': 'Send Reset Link'
        }
      }
    });

    // Show the forgot password widget - it will automatically show forgot password flow
    this.signIn.showSignIn({
      el: '#forgot-password-widget',
      features: {
        registration: false,
        rememberMe: false
      }
    }).then(() => {
      // Widget rendered, user can click "Forgot Password" link
      console.log('Forgot password widget rendered');
    }).catch((err: any) => {
      console.error('Error rendering forgot password widget:', err);
    });
  }

  ngOnDestroy(): void {
    if (this.signIn) {
      this.signIn.remove();
    }
  }
}

