import { memo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { cn } from '@/utils/cn';

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
      className={cn('items-center justify-center p-6', fullScreen && 'flex-1 bg-white', className)}
    >
      <ActivityIndicator
        size={size}
        color={colors.primary.DEFAULT}
      />
      {message && <Text className="mt-4 text-sm text-neutral-500">{message}</Text>}
    </View>
  );
});
