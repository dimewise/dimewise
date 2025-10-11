import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  ref: React.RefObject<BottomSheetModal>;
  items: string[]; // CURRENCIES or LANGUAGES
  selected: string;
  onChange: (val: string) => void;
  title: string;
};

export const CurrencyLanguagePicker = forwardRef<BottomSheetModal, Props>(
  ({ items, selected, onChange, title }, ref) => {
    const [inner, setInner] = useState(selected);

    /* keep inner in sync when sheet re-opens */
    useEffect(() => setInner(selected), [selected]);

    const snapPoints = useMemo(() => ['50%'], []);

    const close = () => (ref as React.RefObject<BottomSheetModal>).current?.dismiss();

    const done = () => {
      onChange(inner);
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
            {title}
          </Text>

          <View style={{ backgroundColor: colors.backgroundSurface, borderRadius: 8 }}>
            <Picker
              selectedValue={inner}
              onValueChange={setInner}
              style={{ height: 200 }}
            >
              {items.map((i) => (
                <Picker.Item
                  key={i}
                  label={i === 'en' ? 'English' : i === 'ja' ? '日本語' : i}
                  value={i}
                />
              ))}
            </Picker>
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
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Done</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
