import { ReactNode } from 'react';
import { View } from 'react-native';

type Props = {
  children: ReactNode;
};

export const ModalFooter = ({ children }: Props) => {
  return (
    <View className="flex-row px-6 py-4 gap-3 border-t border-neutral-200 bg-neutral-50">
      {children}
    </View>
  );
};

