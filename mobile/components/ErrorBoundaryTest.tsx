import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

interface ErrorBoundaryTestProps {
  onTriggerError: () => void;
}

export const ErrorBoundaryTest: React.FC<ErrorBoundaryTestProps> = ({ onTriggerError }) => {
  const theme = useTheme();
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error for error boundary design verification');
  }

  return (
    <Card style={{ margin: 16, backgroundColor: theme.colors.surfaceVariant }}>
      <Card.Content>
        <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
          Error Boundary Test
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            mode="contained"
            onPress={() => setShouldThrow(true)}
            style={{ flex: 1 }}
          >
            Trigger Error
          </Button>
          <Button
            mode="outlined"
            onPress={onTriggerError}
            style={{ flex: 1 }}
          >
            Custom Error
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

// Component that throws an error immediately
export const ImmediateErrorTest: React.FC = () => {
  throw new Error('Immediate test error for error boundary design verification');
}; 