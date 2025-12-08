import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { colors } from '@/theme/colors';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl gap-2 active:opacity-80',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500',
        secondary: 'bg-surface-elevated border border-zinc-700',
        ghost: 'bg-transparent',
        danger: 'bg-error',
        outline: 'bg-transparent border border-primary-500',
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
  }
);

const textVariants = cva('font-semibold text-center', {
  variants: {
    variant: {
      primary: 'text-zinc-950',
      secondary: 'text-zinc-50',
      ghost: 'text-primary-500',
      danger: 'text-zinc-50',
      outline: 'text-primary-500',
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
        className
      )}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' ? colors.text.inverse : colors.primary.DEFAULT
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text className={cn(textVariants({ variant, size }), textClassName)}>
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
});
