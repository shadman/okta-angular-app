# Development Tips

## Running Commands on Windows

Since PowerShell script execution is disabled, use the full node path:

```powershell
# Start dev server
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" start

# Install packages
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install

# Build for production
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build

# Run tests
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" test
```

Or enable PowerShell scripts (run as Administrator):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then use normal commands:

```powershell
npm start
npm install
npm run build
```

## Testing Without Okta Setup

If you want to test the UI before setting up Okta:

1. Comment out the authentication checks in `auth.guard.ts`
2. Navigate directly to `/dashboard`
3. The dashboard will show, but user data won't load

## Customizing the Dashboard

### Adding New Stats
Edit `dashboard.component.ts`:

```typescript
stats = [
  { label: 'Your Label', value: 42, icon: '🎯', color: '#your-color' },
  // ... add more
];
```

### Adding Activities
```typescript
recentActivities = [
  { action: 'Your action', time: 'Just now', icon: '✨' },
  // ... add more
];
```

### Changing Themes
Modify colors in `dashboard.component.scss`:
- Light theme: Lines 1-38
- Dark theme: Lines 6-37

## Widget Customization

### Login Widget
File: `src/app/components/login/login.component.ts`

```typescript
this.signIn = new OktaSignIn({
  // ... existing config
  logo: '/assets/your-logo.png',  // Custom logo
  colors: {
    brand: '#your-color'           // Custom brand color
  },
  i18n: {
    en: {
      'primaryauth.title': 'Your Custom Title'
    }
  }
});
```

### Signup Widget
File: `src/app/components/signup/signup.component.ts`

Similar customization options as login widget.

## Environment Management

### Multiple Environments

Create additional environment files:

```
src/environments/
├── environment.ts           # Development
├── environment.staging.ts   # Staging
├── environment.prod.ts      # Production
```

### Using Environments

Update `angular.json` configurations:

```json
"configurations": {
  "staging": {
    "fileReplacements": [{
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.staging.ts"
    }]
  }
}
```

Build with specific environment:
```powershell
npm run build -- --configuration=staging
```

## Debugging

### Enable Debug Logging

In `auth.service.ts`:

```typescript
this.oktaAuth = new OktaAuth({
  // ... config
  devMode: true  // Add this for detailed logs
});
```

### Check Auth State

In browser console:
```javascript
// Get current auth state
localStorage.getItem('okta-token-storage')

// Check user data
localStorage.getItem('okta-cache-storage')
```

### Common Issues

**Widget not showing:**
- Check browser console for errors
- Verify Okta credentials in environment.ts
- Check network tab for failed requests

**Authentication loop:**
- Clear localStorage
- Verify redirect URI matches Okta app settings
- Check for CORS issues

**Dashboard not loading:**
- Check auth guard is working
- Verify user is authenticated
- Check console for errors

## Performance Optimization

### Lazy Load Routes

```typescript
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  }
];
```

### Optimize Bundle Size

```powershell
# Analyze bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/okta-angular-app/stats.json
```

## Testing

### Unit Tests

Create test files:
```typescript
// dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### E2E Tests

Consider using Playwright or Cypress for end-to-end testing.

## Deployment

### Build for Production

```powershell
npm run build
```

Output will be in `dist/okta-angular-app/browser/`

### Deploy to Vercel

```powershell
npm install -g vercel
vercel
```

### Deploy to Netlify

```powershell
npm install -g netlify-cli
netlify deploy
```

### Deploy to Azure

```powershell
az webapp up --name your-app-name --html --resource-group your-rg
```

## Git Best Practices

### .gitignore additions

```
# Environment files with secrets
src/environments/environment.ts
src/environments/environment.*.ts
!src/environments/environment.example.ts

# Okta configuration
.okta.env
```

### Create example environment

```typescript
// environment.example.ts
export const environment = {
  production: false,
  okta: {
    clientId: 'YOUR_CLIENT_ID',
    issuer: 'https://YOUR_DOMAIN.okta.com/oauth2/default',
    redirectUri: 'http://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    testing: {
      disableHttpsCheck: false
    }
  }
};
```

## VS Code Extensions

Recommended extensions:
- Angular Language Service
- ESLint
- Prettier
- Angular Snippets
- GitLens

## Useful Commands

```powershell
# Check Angular version
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run ng version

# Generate new component
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run ng generate component components/my-component

# Generate service
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run ng generate service services/my-service

# Update Angular
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run ng update @angular/core @angular/cli

# Lint code
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run lint
```

## Resources

- [Angular Documentation](https://angular.dev/)
- [Okta Angular SDK](https://github.com/okta/okta-angular)
- [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget)
- [RxJS Documentation](https://rxjs.dev/)
- [Angular Material](https://material.angular.io/) - For additional UI components
