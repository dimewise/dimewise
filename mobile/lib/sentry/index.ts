import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const isDev = __DEV__ || Constants.expoConfig?.extra?.APP_ENV === 'development';
const isPreview = Constants.expoConfig?.extra?.APP_ENV === 'preview';

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Call this early in your app's initialization (e.g., in _layout.tsx).
 */
export function initSentry() {
  // Only initialize Sentry in production/preview builds
  // In development, we rely on React Native's error handling
  if (isDev) {
    console.log('[Sentry] Skipping initialization in development mode');
    return;
  }

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] No DSN configured. Sentry will not be initialized.');
    return;
  }

  Sentry.init({
    dsn,
    environment: isPreview ? 'preview' : 'production',
    
    // Performance monitoring sample rates
    // Set to 1.0 to capture 100% of transactions for performance monitoring.
    // Reduce in production for cost optimization.
    tracesSampleRate: isPreview ? 1.0 : 0.2,
    
    // Enable profiling (sample rate relative to tracesSampleRate)
    profilesSampleRate: isPreview ? 1.0 : 0.1,
    
    // Session tracking
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds
    
    // Enable auto-instrumentation
    enableAutoPerformanceTracing: true,
    
    // Attach screenshots on error (iOS/Android only)
    attachScreenshot: true,
    
    // Attach view hierarchy on error
    attachViewHierarchy: true,
    
    // Filter out certain errors if needed
    beforeSend(event, hint) {
      // You can filter or modify events here
      // Example: Filter out network errors from specific domains
      // if (event.exception?.values?.[0]?.value?.includes('Network request failed')) {
      //   return null;
      // }
      return event;
    },
    
    // Breadcrumb configuration
    enableNativeCrashHandling: true,
    enableNativeNagger: false,
    
    // Integration configuration
    integrations: [
      Sentry.reactNativeTracingIntegration(),
    ],
  });
}

/**
 * Wrap your navigation container with Sentry's navigation instrumentation.
 * This enables performance monitoring for screen transitions.
 */
export const routingInstrumentation = Sentry.reactNavigationIntegration();

/**
 * Set user context for better error attribution.
 * Call this after successful authentication.
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add custom context to Sentry events.
 */
export function setContext(name: string, context: Record<string, unknown> | null) {
  Sentry.setContext(name, context);
}

/**
 * Add a custom breadcrumb for better debugging context.
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Manually capture an exception.
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message.
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * HOC to wrap components with Sentry error boundary.
 * Useful for catching render errors in specific components.
 */
export const withSentryErrorBoundary = Sentry.wrap;

/**
 * Export the native crash handler for manual initialization if needed.
 */
export { Sentry };
