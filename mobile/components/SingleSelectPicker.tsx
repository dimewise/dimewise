import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { forwardRef, type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

export interface SingleSelectPickerRef {
  open: () => void;
  close: () => void;
}

type Props<T> = {
  items: { label: string; value: T }[];
  selected: T;
  onChange: (value: T) => void;
  title: string;
  loading: boolean;
};

const SingleSelectPickerInner = <T extends string | number>(
  { items, selected, onChange, title, loading }: Props<T>,
  ref: Ref<SingleSelectPickerRef>,
) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { t } = useTranslation();
  const [inner, setInner] = useState(selected);

  useEffect(() => setInner(selected), [selected]);

  useImperativeHandle(ref, () => ({
    open: () => {
      setInner(selected); // reset to last committed value
      sheetRef.current?.present();
    },
    close: () => sheetRef.current?.dismiss(),
  }));

  const done = () => {
    onChange(inner); // commit to parent

    setTimeout(() => sheetRef.current?.dismiss(), 300);
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
      ref={sheetRef}
      snapPoints={['50%']}
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
                key={String(i.value)}
                label={i.label}
                value={i.value}
              />
            ))}
          </Picker>
          <Pressable
            onPress={done}
            style={{
              marginBottom: 48,
              backgroundColor: loading ? colors.disabled : colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                {t('common_done')}
              </Text>
            )}
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export const SingleSelectPicker = forwardRef(SingleSelectPickerInner) as <
  T extends string | number,
>(
  p: Props<T> & { ref?: React.Ref<SingleSelectPickerRef> },
) => React.ReactElement;
