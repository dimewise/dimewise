import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';

export const CoverGradient = () => {
  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="absolute inset-0 h-full"
    />
  );
};
