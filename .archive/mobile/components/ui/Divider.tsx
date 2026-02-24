import { memo } from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/utils/cn';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider = memo(function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <View className={cn('flex-row items-center my-4', className)}>
        <View className="flex-1 h-px bg-neutral-200" />
        <Text className="mx-4 text-neutral-500 text-sm">{label}</Text>
        <View className="flex-1 h-px bg-neutral-200" />
      </View>
    );
  }

  return <View className={cn('h-px bg-neutral-200 my-4', className)} />;
});
