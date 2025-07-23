import type { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
import BottomSheetTextInput from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
import type { StyleProp, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type Props = BottomSheetTextInputProps & { style?: StyleProp<TextStyle> };

export const BSTextInput = (props: Props) => {
  const theme = useTheme();

  const defaultStyle: StyleProp<TextStyle> = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outline,
    borderWidth: 1,
    borderRadius: 6,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
  };

  return (
    <BottomSheetTextInput
      clearButtonMode="while-editing"
      {...props}
      style={[defaultStyle, props.style]}
    />
  );
};
