import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

export const CoverGradient = () => {
  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={sharedStyles.authLinearGradient}
    />
  );
};
