import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { CategoryCreate } from '@/generated/api/api';
import { postCategoryBody } from '@/generated/types/categories/categories.zod';
import { colors } from '@/theme/colors';
import { FormSubmitButton } from '../forms/FormSubmitButton';
import { FormTextInput } from '../forms/FormTextInput';
import type { createCategoryData } from '../forms/schemas/settings';

export interface CreateCategorySheetRef {
  open: () => void;
  close: () => void;
}

type Props = {
  onSubmit: (values: CategoryCreate) => void | Promise<void>;
};

function CreateCategorySheetInner({ onSubmit }: Props, ref: React.Ref<CreateCategorySheetRef>) {
  const { t } = useTranslation();
  const sheetRef = useRef<BottomSheetModal>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<createCategoryData>({
    resolver: zodResolver(postCategoryBody),
    defaultValues: { title: '', amount: 0 },
  });

  useImperativeHandle(ref, () => ({
    open: () => {
      reset();
      sheetRef.current?.present();
    },
    close: () => sheetRef.current?.dismiss(),
  }));

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);

    setTimeout(() => sheetRef.current?.dismiss(), 300);
  });

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
      snapPoints={['80%']}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}
      backgroundStyle={{ backgroundColor: colors.backgroundSurface }}
      enableDismissOnClose
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Add category</Text>
        <BottomSheetTextInput />
        <FormTextInput
          control={control}
          name="title"
          labelKey="common_category_name"
          placeholderKey="common_category_name_prompt"
          colors={colors}
          t={t}
          errors={errors}
          animateView
        />
        <FormTextInput
          control={control}
          name="amount"
          labelKey="common_budget_amount"
          placeholderKey="common_budget_amount_prompt"
          colors={colors}
          t={t}
          errors={errors}
          animateView
        />
        <FormSubmitButton
          loading={false}
          onPress={submit}
          title="Save"
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export const CreateCategorySheet = forwardRef(CreateCategorySheetInner);

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.textPrimary },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4, color: colors.textSecondary },
  pickerWrap: {
    backgroundColor: colors.backgroundDefault,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: { color: colors.textPrimary },
});
