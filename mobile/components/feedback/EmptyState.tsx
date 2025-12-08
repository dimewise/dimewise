import React, { memo, type ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';
import { colors } from '@/theme/colors';
import { Button } from '@/components/ui/Button';
import type { IconName } from '@/types';

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
      <View className="mb-4 opacity-50">
        <Ionicons name={icon} size={64} color={colors.text.secondary} />
      </View>
      <Text className="text-lg font-semibold text-zinc-50 text-center mb-2">
        {title}
      </Text>
      {message && (
        <Text className="text-sm text-zinc-400 text-center mb-6 max-w-xs">
          {message}
        </Text>
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
