import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { colors } from '@/theme/colors';
import { Button } from '@/components/ui/Button';

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
      className={cn(
        'items-center justify-center p-6',
        fullScreen && 'flex-1 bg-white',
        className
      )}
    >
      <View className="mb-4 p-4 rounded-full bg-red-50">
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      </View>
      <Text className="text-xl font-semibold text-neutral-900 text-center mb-2">
        {title || t('error.generic.title', 'Something went wrong')}
      </Text>
      <Text className="text-base text-neutral-500 text-center mb-6 max-w-xs">
        {message || t('error.generic.message', 'Please try again later')}
      </Text>
      {onRetry && (
        <Button
          title={retryLabel || t('common.retry', 'Try Again')}
          onPress={onRetry}
          variant="secondary"
        />
      )}
    </View>
  );
});
