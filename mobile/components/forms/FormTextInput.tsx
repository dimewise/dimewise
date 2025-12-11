import {
  type Control,
  Controller,
  type FieldErrors,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { type KeyboardTypeOptions, Text, TextInput, View } from 'react-native';

interface Props<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  labelKey: string;
  placeholderKey: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  loading?: boolean;
  errors?: FieldErrors<TFieldValues>;
  t: (key: string) => string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
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
  t,
  secureTextEntry,
  multiline,
  numberOfLines,
}: Props<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="gap-2">
          <Text className="text-sm font-medium text-neutral-500">{t(labelKey)}</Text>
          <TextInput
            className={`bg-neutral-100 rounded-xl px-4 text-base text-neutral-900 ${
              multiline ? 'min-h-[100px] py-3' : 'h-12'
            } ${errors?.[name] ? 'border border-red-500' : ''}`}
            style={multiline ? { textAlignVertical: 'top' } : undefined}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            placeholder={t(placeholderKey)}
            placeholderTextColor="#A3A3A3"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            editable={!loading}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
          {errors?.[name] && (
            <Text className="text-sm text-red-500">{String(errors[name]?.message ?? '')}</Text>
          )}
        </View>
      )}
    />
  );
};
