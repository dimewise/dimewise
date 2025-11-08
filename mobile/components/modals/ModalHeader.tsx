import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  title: string;
  rightAction?: ReactNode;
};

export const ModalHeader = ({ title, rightAction }: Props) => {
  if (!rightAction) {
    return (
      <View style={styles.headerCentered}>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View>{rightAction}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSurface,
  },
  headerCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSurface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

