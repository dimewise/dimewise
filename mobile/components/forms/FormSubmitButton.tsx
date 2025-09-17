import {
  ActivityIndicator,
  type StyleProp,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { sharedStyles } from '@/theme/stylesheets';

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
      style={[
        sharedStyles.buttonContained,
        { width: '100%', marginTop: 16 },
        style,
        (loading || disabled) && { backgroundColor: colors.disabled },
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={sharedStyles.buttonContainedText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
