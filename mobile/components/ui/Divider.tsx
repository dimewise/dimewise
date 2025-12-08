import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/utils/cn';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider = memo(function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <View className={cn('flex-row items-center my-4', className)}>
        <View className="flex-1 h-px bg-zinc-800" />
        <Text className="mx-4 text-zinc-500 text-sm">{label}</Text>
        <View className="flex-1 h-px bg-zinc-800" />
      </View>
    );
  }

  return <View className={cn('h-px bg-zinc-800 my-4', className)} />;
});
