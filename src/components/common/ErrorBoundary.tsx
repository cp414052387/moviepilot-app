/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component trees,
 * logs them, and displays a fallback UI.
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, IconButton, useTheme } from 'react-native-paper';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Class Component
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleReset);
      }
      return <ErrorFallback error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
function ErrorFallback({ error, reset }: { error: Error | null; reset: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorContainer || '#FEE2E2'}]}>
          <IconButton
            icon="alert-circle"
            size={48}
            iconColor={theme.colors.error || '#DC2626'}
            style={styles.errorIcon}
          />
        </View>

        <Text variant="headlineMedium" style={styles.title}>
          Oops! Something went wrong
        </Text>

        <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          {error?.message || 'An unexpected error occurred'}
        </Text>

        {__DEV__ && error?.stack && (
          <ScrollView style={styles.stackContainer}>
            <Text variant="bodySmall" style={styles.stackTrace}>
              {error.stack}
            </Text>
          </ScrollView>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={reset}
            style={styles.retryButton}
            buttonColor={theme.colors.primary}
          >
            Try Again
          </Button>
        </View>
      </View>
    </View>
  );
}

/**
 * WithErrorBoundary HOC
 * Wraps a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, resetError: () => void) => ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Use Error Hook
 * Returns error thrower for try-catch in async functions
 */
export function useErrorHandler() {
  return (error: unknown) => {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIcon: {
    margin: 0,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  stackContainer: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
  },
  stackTrace: {
    color: '#B3B3B3',
    fontFamily: 'monospace',
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    minWidth: 120,
  },
});
