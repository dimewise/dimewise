import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-zinc-700', text: 'text-zinc-200' },
  success: { container: 'bg-success/20', text: 'text-success' },
  warning: { container: 'bg-warning/20', text: 'text-warning' },
  error: { container: 'bg-error/20', text: 'text-error' },
  info: { container: 'bg-info/20', text: 'text-info' },
};

export const Badge = memo(function Badge({
  label,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  const { container, text } = variantClasses[variant];

  return (
    <View
      className={cn(
        'rounded-full self-start',
        size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1',
        container,
        className,
      )}
    >
      <Text className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm', text)}>
        {label}
      </Text>
    </View>
  );
});
