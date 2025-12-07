export const environment = {
  production: false,
  okta: {
    clientId: '0oayKEE91697', // Replace with your Okta app client ID
    issuer: 'https://integrator-9437.okta.com/oauth2/default', // Replace with your Okta domain
    redirectUri: 'http://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email', 'offline_access'],
    pkce: true,
    testing: {
      disableHttpsCheck: false
    }
  }
};