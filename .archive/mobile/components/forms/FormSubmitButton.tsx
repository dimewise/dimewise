import {
  ActivityIndicator,
  type StyleProp,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  loading: boolean;
  onPress: () => void;
  title: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const FormSubmitButton = ({ loading, onPress, title, style, disabled = false }: Props) => {
  return (
    <TouchableOpacity
      className={`w-full mt-4 py-3.5 px-6 rounded-lg items-center justify-center ${loading || disabled ? 'bg-neutral-400' : 'bg-primary'}`}
      style={style}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text className="text-base font-semibold text-neutral-950">{title}</Text>
      )}
    </TouchableOpacity>
  );
};
