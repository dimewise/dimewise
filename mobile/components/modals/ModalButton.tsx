import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  onPress: () => void;
  children: ReactNode;
  variant?: 'cancel' | 'primary' | 'error';
  disabled?: boolean;
};

export const ModalButton = ({ onPress, children, variant = 'primary', disabled = false }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (pressed || disabled) && styles.disabled,
      ]}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, styles[`${variant}Text`]]}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: colors.backgroundSurface,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  error: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: colors.textPrimary,
  },
  primaryText: {
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.backgroundDefault,
  },
});

