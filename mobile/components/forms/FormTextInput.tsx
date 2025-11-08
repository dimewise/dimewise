import {
  type Control,
  Controller,
  type FieldErrors,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { type KeyboardTypeOptions, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useGradualAnimation } from '@/hooks/useGradualAnimation';
import { sharedStyles } from '@/theme/stylesheets';
import { colors as themeColors } from '@/theme/colors';

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  labelKey: string;
  placeholderKey: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  loading?: boolean;
  errors?: FieldErrors<TFieldValues>;
  colors: {
    textPrimary: string;
    error: string;
  };
  t: (key: string) => string;
  secureTextEntry?: boolean;
  animateView?: boolean;
}

export const FormTextInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  labelKey,
  placeholderKey,
  keyboardType = 'default',
  autoCapitalize = 'none',
  loading = false,
  errors,
  colors,
  t,
  secureTextEntry,
  animateView,
}: Props<TFieldValues>) => {
  const { height } = useGradualAnimation();

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
              {t(labelKey)}
            </Text>
            <TextInput
              style={[
                sharedStyles.input,
                errors?.[name] && { borderWidth: 1, borderColor: colors.error },
              ]}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              secureTextEntry={secureTextEntry}
              placeholder={t(placeholderKey)}
              placeholderTextColor={themeColors.disabled}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              editable={!loading}
            />
            {errors?.[name] && (
              <Text style={{ color: colors.error }}>{String(errors[name]?.message ?? '')}</Text>
            )}
          </View>
          {animateView && <Animated.View style={keyboardPadding} />}
        </>
      )}
    />
  );
};
