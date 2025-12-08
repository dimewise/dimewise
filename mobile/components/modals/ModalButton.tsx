import { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import { cn } from '@/utils/cn';

type Props = {
  onPress: () => void;
  children: ReactNode;
  variant?: 'cancel' | 'primary' | 'error';
  disabled?: boolean;
};

const variantStyles = {
  cancel: {
    container: 'bg-neutral-100 border border-neutral-200',
    text: 'text-neutral-700',
  },
  primary: {
    container: 'bg-primary-500',
    text: 'text-white',
  },
  error: {
    container: 'bg-red-500',
    text: 'text-white',
  },
};

export const ModalButton = ({ onPress, children, variant = 'primary', disabled = false }: Props) => {
  const styles = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 py-3 rounded-xl items-center justify-center active:opacity-80',
        styles.container,
        disabled && 'opacity-50',
      )}
      disabled={disabled}
    >
      <Text className={cn('text-base font-semibold', styles.text)}>{children}</Text>
    </Pressable>
  );
};

