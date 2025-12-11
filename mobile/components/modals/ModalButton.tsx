import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { cn } from '@/utils/cn';

type Props = {
  onPress: () => void;
  children: ReactNode;
  variant?: 'cancel' | 'primary' | 'error';
  disabled?: boolean;
  loading?: boolean;
};

const variantStyles = {
  cancel: {
    container: 'bg-neutral-100 border border-neutral-200',
    text: 'text-neutral-700',
    spinner: '#525252', // neutral-600
  },
  primary: {
    container: 'bg-primary-500',
    text: 'text-white',
    spinner: '#ffffff',
  },
  error: {
    container: 'bg-red-500',
    text: 'text-white',
    spinner: '#ffffff',
  },
};

export const ModalButton = ({
  onPress,
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) => {
  const styles = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 py-3 rounded-xl items-center justify-center active:opacity-80',
        styles.container,
        (disabled || loading) && 'opacity-50',
      )}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={styles.spinner}
        />
      ) : (
        <Text className={cn('text-base font-semibold', styles.text)}>{children}</Text>
      )}
    </Pressable>
  );
};
