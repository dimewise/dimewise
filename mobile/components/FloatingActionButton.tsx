import Octicons from '@expo/vector-icons/Octicons';
import { Pressable } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  onPress: () => void;
};

export const FloatingActionButton = ({ onPress }: Props) => {
  return (
    <Pressable
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 items-center justify-center shadow-lg active:bg-primary-600"
      onPress={onPress}
      android_ripple={{ color: colors.primary[400], radius: 28 }}
      style={{
        elevation: 8,
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      <Octicons
        name="plus"
        size={24}
        color={colors.neutral[0]}
      />
    </Pressable>
  );
};
