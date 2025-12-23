import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';

const isDev = __DEV__ || Constants.expoConfig?.extra?.APP_ENV === 'development';
const isPreview = Constants.expoConfig?.extra?.APP_ENV === 'preview';

/**
 * Wrap your navigation container with Sentry's navigation instrumentation.
 * This enables performance monitoring for screen transitions.
 */
export const routingInstrumentation = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Call this early in your app's initialization (e.g., in _layout.tsx).
 */
export function initSentry() {
  // Only initialize Sentry in production/preview builds
  // In development, we rely on React Native's error handling
  if (isDev) {
    console.log('[Sentry] Running in Dev - Sentry is disabled');
  }

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] No DSN configured. Sentry will not be initialized.');
    return;
  }

  Sentry.init({
    dsn,
    enabled: !isDev,
    environment: isPreview ? 'preview' : 'production',

    // Performance
    tracesSampleRate: isPreview ? 1.0 : 0.2,
    profilesSampleRate: isPreview ? 1.0 : 0.1,

    // UI/Debug metadata
    attachScreenshot: true,
    attachViewHierarchy: true,

    // Session tracking
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds

    // Enable auto-instrumentation
    enableAutoPerformanceTracing: true,

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Filter out certain errors if needed
    beforeSend(event, _hint) {
      // You can filter or modify events here
      // Example: Filter out network errors from specific domains
      // if (event.exception?.values?.[0]?.value?.includes('Network request failed')) {
      //   return null;
      // }
      return event;
    },

    // Breadcrumb configuration
    enableNativeCrashHandling: true,
    enableLogs: true,
    enableNativeNagger: false,

    // Integration configuration
    integrations: [Sentry.reactNativeTracingIntegration(), routingInstrumentation],
    enableNativeFramesTracking: !isRunningInExpoGo(),
  });
}

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
