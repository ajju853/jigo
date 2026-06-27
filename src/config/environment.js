export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Jigo',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  ENABLE_WEBSOCKETS: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  ENABLE_PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  IS_DEVELOPMENT: import.meta.env.VITE_APP_ENV === 'development',
  IS_PRODUCTION: import.meta.env.VITE_APP_ENV === 'production',
  DEBUG: import.meta.env.VITE_APP_DEBUG === 'true',
};

export default ENV;
