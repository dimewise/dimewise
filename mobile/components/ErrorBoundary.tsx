import { router } from 'expo-router';
import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to crash reporting service in production
    if (!__DEV__) {
      // You can add Sentry, Crashlytics, or other crash reporting here
      console.log('Production error logged:', error.message);
    }

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Default fallback component
const DefaultErrorFallback: React.FC<{
  error: Error | null;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View style={{ alignItems: 'center', maxWidth: 320 }}>
          <Text
            variant="headlineSmall"
            style={{
              textAlign: 'center',
              marginBottom: 12,
              color: theme.colors.onSurface,
              fontWeight: '600',
            }}
          >
            {t('errors.title')}
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              textAlign: 'center',
              marginBottom: 32,
              color: theme.colors.onSurfaceVariant,
              lineHeight: 20,
            }}
          >
            {t('errors.subtitle')}
          </Text>

          {__DEV__ && error && (
            <View
              style={{
                width: '100%',
                marginBottom: 24,
                padding: 16,
                backgroundColor: theme.colors.errorContainer,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onErrorContainer,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              >
                {error.message}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <Button
              mode="contained"
              onPress={onRetry}
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 8 }}
            >
              {t('errors.tryAgain')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                router.replace('/(tabs)/');
              }}
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 8 }}
            >
              {t('errors.goHome')}
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Specific fallbacks for different scenarios
export const LoadingErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Text
        variant="headlineSmall"
        style={{
          marginBottom: 16,
          color: theme.colors.onSurface,
          textAlign: 'center',
        }}
      >
        {t('errors.loadingError')}
      </Text>
      <Button
        mode="contained"
        onPress={onRetry}
        contentStyle={{ paddingVertical: 8, paddingHorizontal: 24 }}
      >
        {t('errors.tryAgain')}
      </Button>
    </View>
  );
};

export const ExpensesErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Text
        variant="headlineSmall"
        style={{
          marginBottom: 12,
          color: theme.colors.onSurface,
          textAlign: 'center',
        }}
      >
        {t('errors.expensesError')}
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          textAlign: 'center',
          marginBottom: 32,
          color: theme.colors.onSurfaceVariant,
          lineHeight: 20,
        }}
      >
        {t('errors.expensesErrorSubtitle')}
      </Text>
      <Button
        mode="contained"
        onPress={onRetry}
        contentStyle={{ paddingVertical: 8, paddingHorizontal: 24 }}
      >
        {t('errors.tryAgain')}
      </Button>
    </View>
  );
};

// Wrapper component to access theme in class component context
const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
