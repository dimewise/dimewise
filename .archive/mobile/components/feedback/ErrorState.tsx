import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
  className?: string;
}

export const ErrorState = memo(function ErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  fullScreen = true,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <View
      className={cn('items-center justify-center p-6', fullScreen && 'flex-1 bg-white', className)}
    >
      <View className="mb-4 p-4 rounded-full bg-red-50">
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.error}
        />
      </View>
      <Text className="text-xl font-semibold text-neutral-900 text-center mb-2">
        {title || t('error_generic_title')}
      </Text>
      <Text className="text-base text-neutral-500 text-center mb-6 max-w-xs">
        {message || t('error_generic_message')}
      </Text>
      {onRetry && (
        <Button
          title={retryLabel || t('common_retry')}
          onPress={onRetry}
          variant="secondary"
        />
      )}
    </View>
  );
});
