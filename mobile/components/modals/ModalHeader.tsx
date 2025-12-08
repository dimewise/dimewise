import { ReactNode } from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  rightAction?: ReactNode;
};

export const ModalHeader = ({ title, rightAction }: Props) => {
  if (!rightAction) {
    return (
      <View className="items-center justify-center px-6 py-4 border-b border-neutral-200">
        <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-200">
      <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
      <View>{rightAction}</View>
    </View>
  );
};

