import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker'; // or any wheel picker
import { DateTime } from 'luxon';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  ref: React.RefObject<BottomSheetModal>;
  onChange: (month: number, year: number) => void;
  initialMonth: number;
  initialYear: number;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthYearPicker = forwardRef<BottomSheetModal, Props>(
  ({ onChange, initialMonth, initialYear }, ref) => {
    const [month, setMonth] = useState(initialMonth);
    const [year, setYear] = useState(initialYear);

    /* keep local state in sync when sheet re-opens */
    useEffect(() => {
      setMonth(initialMonth);
      setYear(initialYear);
    }, [initialMonth, initialYear]);

    const snapPoints = useMemo(() => ['50%'], []);

    const close = () => (ref as React.RefObject<BottomSheetModal>).current?.dismiss();

    const done = () => {
      onChange(month, year);
      close();
    };

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.primary }}
        backgroundStyle={{ backgroundColor: colors.backgroundSurface }}
        enableDismissOnClose
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, gap: 24 }}>
          <Text
            style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.textPrimary }}
          >
            Select month & year
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {/* Month */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: colors.disabled, marginBottom: 4 }}>Month</Text>
              <Picker
                selectedValue={month}
                onValueChange={setMonth}
                style={{ height: 120 }}
              >
                {MONTHS.map((m, idx) => (
                  <Picker.Item
                    key={m}
                    label={m}
                    value={idx + 1} // TODO: fix oapi to accept correct value
                  />
                ))}
              </Picker>
            </View>

            {/* Year */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: colors.disabled, marginBottom: 4 }}>Year</Text>
              <Picker
                selectedValue={year}
                onValueChange={(val) => setYear(val)}
                style={{ height: 120 }}
              >
                {Array.from({ length: 11 }, (_, i) => {
                  const y = DateTime.now().year - 5 + i;
                  return (
                    <Picker.Item
                      key={y}
                      label={String(y)}
                      value={y}
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          <Pressable
            onPress={done}
            style={{
              marginBottom: 48,
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
