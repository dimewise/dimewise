import { Ionicons } from '@expo/vector-icons';
import { memo, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import type { IconName } from '@/types';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  children?: ReactNode;
  className?: string;
}

export const EmptyState = memo(function EmptyState({
  icon = 'folder-open-outline',
  title,
  message,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center p-6 py-12', className)}>
      <View className="mb-4">
        <Ionicons
          name={icon}
          size={64}
          color={colors.neutral[300]}
        />
      </View>
      <Text className="text-base font-medium text-neutral-600 text-center mb-1">{title}</Text>
      {message && (
        <Text className="text-sm text-neutral-500 text-center mb-6 max-w-xs">{message}</Text>
      )}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="primary"
        />
      )}
      {children}
    </View>
  );
});
