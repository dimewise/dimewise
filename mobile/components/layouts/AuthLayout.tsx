import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { sharedStyles } from '@/theme/stylesheets';

export const AuthLayout = ({ children }: PropsWithChildren) => {
  return <View style={sharedStyles.layout}>{children}</View>;
};
