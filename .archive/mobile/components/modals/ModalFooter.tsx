import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
};

export const ModalFooter = ({ children }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-neutral-50 border-t border-neutral-200"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View className="flex-row px-6 py-4 gap-3">{children}</View>
    </View>
  );
};
