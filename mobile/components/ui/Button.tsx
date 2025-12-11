import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { memo } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { colors } from '@/theme/colors';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl gap-2 active:opacity-80',
  {
    variants: {
      variant: {
        primary: 'bg-neutral-900',
        secondary: 'bg-neutral-100 border border-neutral-200',
        ghost: 'bg-transparent',
        danger: 'bg-error',
        outline: 'bg-transparent border border-neutral-900',
      },
      size: {
        sm: 'px-4 py-2',
        md: 'px-5 py-3',
        lg: 'px-6 py-4',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

const textVariants = cva('font-semibold text-center', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-neutral-900',
      ghost: 'text-neutral-900',
      danger: 'text-white',
      outline: 'text-neutral-900',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps
  extends Omit<TouchableOpacityProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  title: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textClassName?: string;
}

export const Button = memo(function Button({
  title,
  variant,
  size,
  fullWidth,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={cn(
        buttonVariants({ variant, size, fullWidth }),
        isDisabled && 'opacity-50',
        className,
      )}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.primary.DEFAULT}
        />
      ) : (
        <>
          {leftIcon}
          <Text className={cn(textVariants({ variant, size }), textClassName)}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
});
