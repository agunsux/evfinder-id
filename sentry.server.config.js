// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  // Disable if DSN not set to avoid sending errors
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: 0,
});

export default Sentry;
