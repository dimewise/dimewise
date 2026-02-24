import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

export const AuthLayout = ({ children }: PropsWithChildren) => {
  return <View className="flex-1">{children}</View>;
};
