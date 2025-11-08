import Octicons from '@expo/vector-icons/Octicons';
import { DateTime } from 'luxon';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useUserLocale } from '@/hooks/useUserLocale';

interface Props {
  selectedMonth: number;
  selectedYear: number;
  setOpen: () => void;
}

export const Header = ({ selectedMonth, selectedYear, setOpen }: Props) => {
  const { locale } = useUserLocale();
  const dt = DateTime.local(selectedYear, selectedMonth, 1).setLocale(locale);
  const monthYearLabel =
  locale === 'ja-JP' ? dt.toFormat('M月yyyy年') : dt.toFormat('MMMM yyyy');

  return (
    <View
      style={{
        width: '100%',
        padding: spacing.lg,
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
