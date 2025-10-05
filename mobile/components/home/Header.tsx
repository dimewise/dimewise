import Octicons from '@expo/vector-icons/Octicons';
import { DateTime } from 'luxon';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  selectedMonth: number;
  selectedYear: number;
  setOpen: () => void;
}

export const Header = ({ selectedMonth, selectedYear, setOpen }: Props) => {
  const monthYearLabel = DateTime.local(selectedYear, selectedMonth).toFormat('MMMM yyyy');

  return (
    <View
      style={{
        width: '100%',
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Pressable
        onPress={() => setOpen()}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
      >
        <Text style={{ fontSize: 16, color: colors.textPrimary }}>{monthYearLabel}</Text>
        <Octicons
          name="chevron-down"
          size={16}
          color={colors.textPrimary}
        />
      </Pressable>
    </View>
  );
};
