import Octicons from '@expo/vector-icons/Octicons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  title: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  onClose?: () => void;
};

export const ModalHeader = ({ title, leftAction, rightAction, onClose }: Props) => {
  const hasActions = leftAction || rightAction || onClose;

  if (!hasActions) {
    return (
      <View className="items-center justify-center px-6 py-3 border-b border-neutral-200">
        <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-neutral-200">
      <View className="w-10 items-start">
        {onClose ? (
          <Pressable
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
          >
            <Octicons
              name="x"
              size={20}
              color={colors.neutral[600]}
            />
          </Pressable>
        ) : leftAction ? (
          leftAction
        ) : null}
      </View>
      <Text className="text-lg font-semibold text-neutral-900 flex-1 text-center">{title}</Text>
      <View className="w-10 items-end">{rightAction}</View>
    </View>
  );
};
