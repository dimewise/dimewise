import { Ionicons } from '@expo/vector-icons';
import { forwardRef, memo, useState } from 'react';
import { Text, TextInput, type TextInputProps, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { IconName } from '@/types';
import { cn } from '@/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export const Input = memo(
  forwardRef<TextInput, InputProps>(function Input(
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerClassName,
      className,
      ...props
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className={cn('w-full', containerClassName)}>
        {label && <Text className="text-neutral-600 text-sm font-medium mb-2">{label}</Text>}
        <View
          className={cn(
            'flex-row items-center bg-white rounded-xl border px-4',
            isFocused ? 'border-primary-500' : 'border-neutral-200',
            error && 'border-error',
          )}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={colors.text.secondary}
              style={{ marginRight: 12 }}
            />
          )}
          <TextInput
            ref={ref}
            className={cn('flex-1 py-3.5 text-base text-neutral-900', className)}
            placeholderTextColor={colors.text.muted}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
        {(error || hint) && (
          <Text className={cn('text-sm mt-1.5', error ? 'text-error' : 'text-neutral-500')}>
            {error || hint}
          </Text>
        )}
      </View>
    );
  }),
);
