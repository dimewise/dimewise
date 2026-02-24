import { memo, type ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
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
    'bg-white rounded-2xl border border-neutral-200',
    paddingClasses[padding],
    elevated && 'shadow-sm',
    className,
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={cn(cardClasses, 'active:opacity-80')}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      className={cardClasses}
      {...props}
    >
      {children}
    </View>
  );
});
