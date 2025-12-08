import React, { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/utils/cn';
import { colors } from '@/theme/colors';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState = memo(function LoadingState({
  message,
  size = 'large',
  fullScreen = true,
  className,
}: LoadingStateProps) {
  return (
    <View
      className={cn(
        'items-center justify-center p-6',
        fullScreen && 'flex-1 bg-background',
        className
      )}
    >
      <ActivityIndicator size={size} color={colors.primary.DEFAULT} />
      {message && <Text className="mt-4 text-sm text-zinc-400">{message}</Text>}
    </View>
  );
});
