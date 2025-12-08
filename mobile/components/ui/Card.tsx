import React, { memo, type ReactNode } from 'react';
import { View, TouchableOpacity, type ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = memo(function Card({
  children,
  onPress,
  padding = 'md',
  elevated = false,
  className,
  ...props
}: CardProps) {
  const cardClasses = cn(
    'bg-surface rounded-2xl border border-zinc-800',
    paddingClasses[padding],
    elevated && 'shadow-lg shadow-black/50',
    className
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={cardClasses}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={cardClasses} {...props}>
      {children}
    </View>
  );
});
