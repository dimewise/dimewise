import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

export const AppLayout = ({ children }: PropsWithChildren) => {
  return <View className="flex-1 bg-white">{children}</View>;
};
