import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import OktaSignIn from '@okta/okta-signin-widget';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  loading = true;
  currentTime = new Date();
  greeting = '';
  stats = [
    { label: 'Projects', value: 12, icon: '📊', color: '#3b82f6' },
    { label: 'Tasks', value: 48, icon: '✅', color: '#06b6d4' },
    { label: 'Messages', value: 23, icon: '💬', color: '#10b981' },
    { label: 'Reports', value: 7, icon: '📈', color: '#8b5cf6' }
  ];
  recentActivities = [
    { action: 'Completed project review', time: '2 hours ago', icon: '✓' },
    { action: 'Updated profile information', time: '5 hours ago', icon: '👤' },
    { action: 'Shared document with team', time: '1 day ago', icon: '📄' },
    { action: 'Attended virtual meeting', time: '2 days ago', icon: '📹' }
  ];
  isDarkTheme = false;
  showResetModal = false;
  private resetWidget: OktaSignIn | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      console.log('Dashboard: Checking authentication...');
      
      // Check authentication
      const isAuth = await this.authService.isAuthenticated();
      console.log('Dashboard: Authentication status:', isAuth);
      
      if (!isAuth) {
        console.warn('Dashboard: User not authenticated, redirecting to login');
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
        return;
      }

      // Get user information with timeout
      console.log('Dashboard: Fetching user information...');
      try {
        const userPromise = this.authService.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getUser timeout')), 10000)
        );
        
        this.user = await Promise.race([userPromise, timeoutPromise]) as any;
        
        if (!this.user) {
          throw new Error('User data is null');
        }
        
        console.log('Dashboard: User loaded successfully', this.user);
        this.loading = false;
        console.log('Dashboard: Loading set to false, user:', this.user ? 'exists' : 'null');
        this.setGreeting();
        this.cdr.detectChanges(); // Force change detection
        console.log('Dashboard: Change detection triggered');
        
        // Update time every minute
        setInterval(() => {
          this.currentTime = new Date();
          this.setGreeting();
          this.cdr.detectChanges();
        }, 60000);
      } catch (userError: any) {
        console.error('Dashboard: Error fetching user:', userError);
        
        // Try to get user info from token claims as fallback
        try {
          console.log('Dashboard: Attempting fallback user retrieval from token...');
          const accessToken = await this.authService.getAccessToken();
          if (accessToken) {
            // Token exists but getUser failed, try to decode token
            const tokenParts = accessToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              this.user = {
                name: payload.name || payload.preferred_username || 'User',
                email: payload.email || payload.sub,
                given_name: payload.given_name,
                preferred_username: payload.preferred_username,
                ...payload
              };
              console.log('Dashboard: User loaded from token fallback', this.user);
              this.loading = false;
              this.setGreeting();
              this.cdr.detectChanges(); // Force change detection
            } else {
              throw new Error('Invalid token format');
            }
          } else {
            throw userError;
          }
        } catch (fallbackError) {
          console.error('Dashboard: Fallback user retrieval failed:', fallbackError);
          this.loading = false;
          this.cdr.detectChanges();
          this.router.navigate(['/login']);
        }
      }
    } catch (error) {
      console.error('Dashboard: Error loading dashboard:', error);
      this.loading = false;
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    if (this.resetWidget) {
      this.resetWidget.remove();
      this.resetWidget = null;
    }
  }

  setGreeting() {
    const hour = this.currentTime.getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  openResetPassword() {
    this.showResetModal = true;
    this.cdr.detectChanges();
    this.renderResetWidget();
  }

  closeResetPassword() {
    this.showResetModal = false;
    if (this.resetWidget) {
      this.resetWidget.remove();
      this.resetWidget = null;
    }
    this.cdr.detectChanges();
  }

  private renderResetWidget() {
    if (this.resetWidget) {
      this.resetWidget.remove();
    }
    const userEmail = this.user?.email || this.user?.preferred_username || '';

    this.resetWidget = new OktaSignIn({
      baseUrl: environment.okta.issuer.split('/oauth2')[0],
      clientId: environment.okta.clientId,
      redirectUri: environment.okta.redirectUri,
      //username: 'shan.jami@cc.com',
      useInteractionCodeFlow: true, // Required for inline widget (no redirect)
      authParams: {
        issuer: environment.okta.issuer,
        scopes: environment.okta.scopes,
        pkce: environment.okta.pkce
      },
      features: {
        registration: true, // Explicitly enable registration on signup page
        rememberMe: true,
      },
      i18n: {
        en: {
          'forgotpassword.title': 'Reset Your Password',
          'forgotpassword.submit': 'Send Reset Email',
          'forgotpassword.email.placeholder': 'Email',
          'forgotpassword.email.tooltip': 'Email'
        }
      }
    });

    // Render the widget and auto-click forgot password link
    this.resetWidget.renderEl({ 
      el: '#reset-password-widget'
    },
      () => {
        // Widget rendered successfully
        /*
        setTimeout(() => {
          // Click the forgot password link
          const forgotLink = document.querySelector('[data-se="forgot-password"], .js-forgot-password') as HTMLElement;
          if (forgotLink) {
            console.log('4');
            forgotLink.click();
            
            // After clicking, prefill the email field
            setTimeout(() => {
              const emailInput = document.querySelector('#account-recovery-username, input[name="username"]') as HTMLInputElement;
              if (emailInput && userEmail) {
                emailInput.value = userEmail;
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                emailInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, 300);
          }
        }, 200);*/
      },
      (err: any) => {
        console.error('Error rendering reset widget:', err);
      }
    );
    
  }

  async logout() {
    await this.authService.logout();
  }

  getInitials(): string {
    if (!this.user || !this.user.name) return '?';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return this.user.name[0].toUpperCase();
  }

  getFormattedDate(): string {
    return this.currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedTime(): string {
    return this.currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
