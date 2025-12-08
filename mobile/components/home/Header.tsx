import Octicons from '@expo/vector-icons/Octicons';
import { DateTime } from 'luxon';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
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
    <View className="w-full p-4 flex-row justify-end items-center">
      <Pressable
        onPress={() => setOpen()}
        className="flex-row items-center gap-1 px-3 py-2 rounded-lg active:bg-neutral-100"
      >
        <Text className="text-base font-medium text-neutral-900">
          {monthYearLabel}
        </Text>
        <Octicons
          name="chevron-down"
          size={16}
          color={colors.text.primary}
        />
      </Pressable>
    </View>
  );
};
