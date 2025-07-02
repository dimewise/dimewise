import React, { Component, type ReactNode } from 'react';
import { View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
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
const DefaultErrorFallback: React.FC<{ error: Error | null; onRetry: () => void }> = ({ error, onRetry }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Card.Content style={{ alignItems: 'center', padding: 24 }}>
            <Text
              variant="displaySmall"
              style={{
                fontSize: 48,
                marginBottom: 16,
                color: theme.colors.error
              }}
            >
              😵
            </Text>
            <Text
              variant="headlineSmall"
              style={{
                textAlign: 'center',
                marginBottom: 8,
                color: theme.colors.onSurface,
                fontWeight: '600'
              }}
            >
              Oops! Something went wrong
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: 'center',
                marginBottom: 24,
                color: theme.colors.onSurfaceVariant,
                lineHeight: 20
              }}
            >
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {__DEV__ && error && (
              <Card style={{
                width: '100%',
                marginBottom: 24,
                backgroundColor: theme.colors.errorContainer
              }}>
                <Card.Content>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onErrorContainer,
                      fontFamily: 'monospace',
                      fontSize: 12
                    }}
                  >
                    {error.message}
                  </Text>
                </Card.Content>
              </Card>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                mode="contained"
                onPress={onRetry}
                style={{ flex: 1 }}
              >
                Try Again
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  // In React Native, you might want to restart the app
                  // or navigate to a safe screen
                  console.log('Restart requested');
                }}
                style={{ flex: 1 }}
              >
                Go to Home
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

// Specific fallbacks for different scenarios
export const LoadingErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16, color: theme.colors.onSurface }}>
        Failed to load data
      </Text>
      <Button mode="contained" onPress={onRetry}>
        Retry
      </Button>
    </View>
  );
};

export const ExpensesErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text
        variant="displaySmall"
        style={{ fontSize: 48, marginBottom: 16 }}
      >
        💸
      </Text>
      <Text variant="headlineSmall" style={{ marginBottom: 8, color: theme.colors.onSurface }}>
        Expenses Error
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          textAlign: 'center',
          marginBottom: 24,
          color: theme.colors.onSurfaceVariant
        }}
      >
        There was a problem loading your expenses. Your data is safe.
      </Text>
      <Button mode="contained" onPress={onRetry}>
        Reload Expenses
      </Button>
    </View>
  );
};

// Wrapper component to access theme in class component context
const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary; 