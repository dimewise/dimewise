import React, { memo } from 'react';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';
import { colors } from '@/theme/colors';
import type { IconName } from '@/types';

interface IconButtonProps extends TouchableOpacityProps {
  icon: IconName;
  size?: number;
  color?: string;
  variant?: 'default' | 'filled' | 'danger';
}

export const IconButton = memo(function IconButton({
  icon,
  size = 24,
  color,
  variant = 'default',
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const iconColor =
    color ??
    {
      default: colors.text.secondary,
      filled: colors.primary.DEFAULT,
      danger: colors.error,
    }[variant];

  return (
    <TouchableOpacity
      className={cn(
        'p-2 rounded-lg active:opacity-70',
        variant === 'filled' && 'bg-primary-500/10',
        disabled && 'opacity-50',
        className
      )}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Ionicons name={icon} size={size} color={iconColor} />
    </TouchableOpacity>
  );
});
