# Okta Angular App - Authentication POC

A modern Angular application featuring Okta authentication with Sign-In and Sign-Up widgets, and a feature-rich dashboard.

## Features

### 🔐 Authentication
- **Okta Sign-In Widget** - Fully customizable login page with Okta's hosted widget
- **Okta Sign-Up Widget** - Dedicated registration page for new users
- **Auth Guard** - Protected routes that require authentication
- **Automatic Token Management** - Secure token storage and refresh

### 📊 Dashboard Features
- **User Profile Display** - View comprehensive user information
- **Dynamic Greeting** - Time-based greetings (Good Morning/Afternoon/Evening)
- **Real-time Clock** - Live date and time display
- **Statistics Cards** - Visual representation of metrics (Projects, Tasks, Messages, Reports)
- **Recent Activity Feed** - Track recent actions and events
- **Quick Actions** - Easy access buttons for common tasks
- **Daily Productivity Tip** - Motivational content
- **Theme Toggle** - Switch between light and dark modes
- **Responsive Design** - Mobile-friendly layout
- **Smooth Animations** - Professional transitions and effects

### 🎨 UI/UX
- Modern gradient backgrounds
- Card-based layout
- Smooth animations and transitions
- Hover effects
- User avatars with initials
- Emoji icons for visual appeal
- Sticky header navigation
- Professional color scheme

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Okta Developer Account (free)

### 1. Create an Okta Application

1. Sign up for a free Okta Developer account at [developer.okta.com](https://developer.okta.com/)
2. Log in to your Okta dashboard
3. Navigate to **Applications** > **Create App Integration**
4. Select **OIDC - OpenID Connect**
5. Choose **Single-Page Application (SPA)**
6. Configure the application:
   - **App integration name**: Angular Okta App
   - **Sign-in redirect URIs**: `http://localhost:4200/login/callback`
   - **Sign-out redirect URIs**: `http://localhost:4200`
   - **Trusted Origins**: Add `http://localhost:4200`
   - **Assignments**: Allow everyone in your organization or select specific groups
7. Save the application
8. Copy your **Client ID** and **Okta Domain**

### 2. Configure Environment Variables

Open `src/environments/environment.ts` and update with your Okta credentials:

\`\`\`typescript
export const environment = {
  production: false,
  okta: {
    clientId: 'YOUR_CLIENT_ID_HERE',           // From step 1
    issuer: 'https://YOUR_DOMAIN.okta.com/oauth2/default',  // Your Okta domain
    redirectUri: 'http://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    testing: {
      disableHttpsCheck: false
    }
  }
};
\`\`\`

### 3. Enable Self-Service Registration (Optional)

For the sign-up widget to work:

1. In Okta Dashboard, go to **Directory** > **Self-Service Registration**
2. Enable **Self-service registration**
3. Configure registration settings (email verification, etc.)
4. Save changes

### 4. Install Dependencies

The dependencies are already installed. If you need to reinstall:

\`\`\`powershell
node "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" install
\`\`\`

### 5. Run the Application

Start the development server:

\`\`\`powershell
node "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" start
\`\`\`

Or use:

\`\`\`powershell
node "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" run ng serve
\`\`\`

Navigate to `http://localhost:4200/`

## Application Structure

\`\`\`
src/
├── app/
│   ├── components/
│   │   ├── login/              # Sign-in page with Okta widget
│   │   ├── signup/             # Registration page with Okta widget
│   │   └── dashboard/          # Protected dashboard page
│   ├── services/
│   │   └── auth.service.ts     # Authentication service
│   ├── guards/
│   │   └── auth.guard.ts       # Route protection guard
│   └── environments/
│       ├── environment.ts      # Development config
│       └── environment.prod.ts # Production config
\`\`\`

## Routes

- `/` - Redirects to login
- `/login` - Sign-in page
- `/signup` - Registration page
- `/dashboard` - Protected dashboard (requires authentication)

## Usage

### First Time Users

1. Navigate to `http://localhost:4200/signup`
2. Fill in registration details
3. Verify email (if configured in Okta)
4. You'll be automatically logged in and redirected to dashboard

### Returning Users

1. Navigate to `http://localhost:4200/login`
2. Enter credentials
3. Click "Sign In"
4. Access your personalized dashboard

### Dashboard Features

- **Theme Toggle**: Click the moon/sun icon to switch themes
- **User Profile**: View your complete profile information
- **Statistics**: See overview of your activities
- **Recent Activity**: Check your latest actions
- **Quick Actions**: Access common features quickly
- **Logout**: Click the logout button to sign out

## Customization

### Changing Colors

Edit the respective component SCSS files:
- Login: `src/app/components/login/login.component.scss`
- Signup: `src/app/components/signup/signup.component.scss`
- Dashboard: `src/app/components/dashboard/dashboard.component.scss`

### Adding Features

The dashboard is designed to be extended. You can:
- Add more stat cards
- Customize activity feed
- Add new quick action buttons
- Integrate real APIs for data

### Widget Customization

Modify the Okta widget configuration in:
- `src/app/components/login/login.component.ts`
- `src/app/components/signup/signup.component.ts`

## Security Notes

- Never commit your Okta credentials to version control
- Use environment variables for production deployments
- Enable HTTPS in production
- Configure proper CORS settings in Okta
- Implement token refresh logic for long sessions
- Add proper error handling for production use

## Troubleshooting

### Widget Not Showing
- Ensure Okta credentials are correct
- Check browser console for errors
- Verify Okta app configuration matches redirect URIs

### Authentication Errors
- Verify client ID and issuer are correct
- Check that the app is assigned to your user
- Ensure redirect URIs match exactly

### Build Errors
- Clear node_modules and reinstall: `npm clean-install`
- Check Angular and Node versions
- Verify all imports are correct

## Production Deployment

Before deploying:

1. Update `src/environments/environment.prod.ts`
2. Set production domain in Okta app settings
3. Enable HTTPS
4. Run production build: `npm run build`
5. Deploy the `dist/` folder to your hosting service

## Technologies Used

- **Angular 21** - Frontend framework
- **TypeScript** - Programming language
- **SCSS** - Styling
- **Okta Auth JS** - Authentication SDK
- **Okta Sign-In Widget** - Pre-built authentication UI
- **RxJS** - Reactive programming

## License

This is a proof of concept application for demonstration purposes.

## Support

For Okta-specific issues, refer to:
- [Okta Developer Documentation](https://developer.okta.com/docs/)
- [Okta Angular SDK](https://github.com/okta/okta-angular)
- [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget)
