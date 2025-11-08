import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  children: ReactNode;
};

export const ModalFooter = ({ children }: Props) => {
  return <View style={styles.footer}>{children}</View>;
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSurface,
  },
});

