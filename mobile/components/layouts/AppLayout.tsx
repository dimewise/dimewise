import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

export const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <View style={[sharedStyles.layout, { backgroundColor: colors.backgroundDefault }]}>
      {children}
    </View>
  );
};
