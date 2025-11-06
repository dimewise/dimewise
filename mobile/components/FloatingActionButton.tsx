import Octicons from '@expo/vector-icons/Octicons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  onPress: () => void;
};

export const FloatingActionButton = ({ onPress }: Props) => {
  return (
    <Pressable
      style={styles.fab}
      onPress={onPress}
      android_ripple={{ color: colors.primaryLight, radius: 30 }}
    >
      <Octicons
        name="plus"
        size={24}
        color={colors.backgroundDefault}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24, // Above tab bar
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Android shadow
    shadowColor: colors.black, // iOS shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
