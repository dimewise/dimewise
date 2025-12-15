import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { Filter } from '@/app/(app)/(tabs)/transactions';
import { useGetCategoriesQuery, useGetPaymentMethodsQuery } from '@/generated/api/api';
import { useUserLocale } from '@/hooks/useUserLocale';
import { colors } from '@/theme/colors';
import { ModalButton } from './ModalButton';
import { ModalContainer } from './ModalContainer';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Filter) => void;
  currentFilters: Filter;
};

export const FilterModal = ({ visible, onClose, onApply, currentFilters }: Props) => {
  const { t } = useTranslation();
  const { locale } = useUserLocale();
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [tempFilters, setTempFilters] = useState<Filter>(currentFilters);

  // Reset expanded field and sync temp filters when modal opens/closes
  useEffect(() => {
    if (visible) {
      setExpandedField(null);
      setTempFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  // Fetch categories and payment methods
  const { data: categories } = useGetCategoriesQuery({ includeDeleted: false });
  const { data: paymentMethods } = useGetPaymentMethodsQuery({ includeDeleted: false });

  const toggleField = (fieldName: string) => {
    setExpandedField(expandedField === fieldName ? null : fieldName);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('transactions_filter_all');
    return DateTime.fromISO(dateString).setLocale(locale).toLocaleString(DateTime.DATE_MED);
  };

  const getSelectedCategoryTitle = () => {
    const category = categories?.find((cat) => cat.id === tempFilters.categoryId);
    return category?.title || t('transactions_filter_all');
  };

  const getSelectedPaymentMethodTitle = () => {
    const method = paymentMethods?.find((method) => method.id === tempFilters.paymentMethodId);
    return method?.title || t('transactions_filter_all');
  };

  const getVerificationStatusTitle = () => {
    if (!tempFilters.verificationStatus) return t('transactions_filter_all');
    return tempFilters.verificationStatus === 'verified'
      ? t('transactions_filter_verified')
      : t('transactions_filter_unverified');
  };

  const onDateFromChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      const isoDate = DateTime.fromJSDate(selectedDate).toISODate();
      setTempFilters((prev) => ({ ...prev, dateFrom: isoDate || undefined }));
    }
  };

  const onDateToChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      const isoDate = DateTime.fromJSDate(selectedDate).toISODate();
      setTempFilters((prev) => ({ ...prev, dateTo: isoDate || undefined }));
    }
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters({});
  };

  const handleClose = () => {
    setTempFilters(currentFilters); // Reset to current filters
    onClose();
  };

  const hasActiveFilters = Object.keys(tempFilters).length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ModalContainer>
        <ModalHeader title={t('transactions_filter_title')} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6 gap-5">
            {/* Clear All - only show if filters are applied */}
            {hasActiveFilters && (
              <Pressable
                onPress={handleClear}
                className="self-end"
              >
                <Text className="text-sm text-red-500 font-medium">
                  {t('transactions_filter_clear')}
                </Text>
              </Pressable>
            )}

            {/* Category Filter */}
            <View className="gap-2">
              <Pressable
                className="flex-row justify-between items-center py-4 px-4 bg-neutral-50 rounded-xl border border-neutral-200"
                onPress={() => toggleField('category')}
              >
                <Text className="text-base font-semibold text-neutral-900">
                  {t('transactions_filter_category')}
                </Text>
                <Text className="text-base text-neutral-500 flex-1 text-right">
                  {getSelectedCategoryTitle()}
                </Text>
              </Pressable>
              {expandedField === 'category' && (
                <View className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden min-h-[200px]">
                  <Picker
                    selectedValue={tempFilters.categoryId || ''}
                    onValueChange={(value) =>
                      setTempFilters((prev) => ({ ...prev, categoryId: value || undefined }))
                    }
                    style={{ height: 50 }}
                    itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                  >
                    <Picker.Item
                      label={t('transactions_filter_all')}
                      value=""
                      color={colors.neutral[400]}
                    />
                    {categories?.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.title}
                        value={category.id}
                        color={colors.neutral[900]}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Payment Method Filter */}
            <View className="gap-2">
              <Pressable
                className="flex-row justify-between items-center py-4 px-4 bg-neutral-50 rounded-xl border border-neutral-200"
                onPress={() => toggleField('payment_method')}
              >
                <Text className="text-base font-semibold text-neutral-900">
                  {t('transactions_filter_payment_method')}
                </Text>
                <Text className="text-base text-neutral-500 flex-1 text-right">
                  {getSelectedPaymentMethodTitle()}
                </Text>
              </Pressable>
              {expandedField === 'payment_method' && (
                <View className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden min-h-[200px]">
                  <Picker
                    selectedValue={tempFilters.paymentMethodId || ''}
                    onValueChange={(value) =>
                      setTempFilters((prev) => ({ ...prev, paymentMethodId: value || undefined }))
                    }
                    style={{ height: 50 }}
                    itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                  >
                    <Picker.Item
                      label={t('transactions_filter_all')}
                      value=""
                      color={colors.neutral[400]}
                    />
                    {paymentMethods?.map((method) => (
                      <Picker.Item
                        key={method.id}
                        label={method.title}
                        value={method.id}
                        color={colors.neutral[900]}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Date From Filter */}
            <View className="gap-2">
              <Pressable
                className="flex-row justify-between items-center py-4 px-4 bg-neutral-50 rounded-xl border border-neutral-200"
                onPress={() => toggleField('date_from')}
              >
                <Text className="text-base font-semibold text-neutral-900">
                  {t('transactions_filter_date_from')}
                </Text>
                <Text className="text-base text-neutral-500 flex-1 text-right">
                  {formatDate(tempFilters.dateFrom)}
                </Text>
              </Pressable>
              {expandedField === 'date_from' && (
                <View className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden min-h-[200px]">
                  <DateTimePicker
                    value={
                      tempFilters.dateFrom
                        ? DateTime.fromISO(tempFilters.dateFrom).toJSDate()
                        : new Date()
                    }
                    mode="date"
                    display="spinner"
                    onChange={onDateFromChange}
                    style={{ height: 200, backgroundColor: colors.neutral[50] }}
                    textColor={colors.textPrimary}
                    themeVariant="dark"
                    locale={locale}
                  />
                </View>
              )}
            </View>

            {/* Date To Filter */}
            <View className="gap-2">
              <Pressable
                className="flex-row justify-between items-center py-4 px-4 bg-neutral-50 rounded-xl border border-neutral-200"
                onPress={() => toggleField('date_to')}
              >
                <Text className="text-base font-semibold text-neutral-900">
                  {t('transactions_filter_date_to')}
                </Text>
                <Text className="text-base text-neutral-500 flex-1 text-right">
                  {formatDate(tempFilters.dateTo)}
                </Text>
              </Pressable>
              {expandedField === 'date_to' && (
                <View className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden min-h-[200px]">
                  <DateTimePicker
                    value={
                      tempFilters.dateTo
                        ? DateTime.fromISO(tempFilters.dateTo).toJSDate()
                        : new Date()
                    }
                    mode="date"
                    display="spinner"
                    onChange={onDateToChange}
                    style={{ height: 200, backgroundColor: colors.neutral[50] }}
                    textColor={colors.textPrimary}
                    themeVariant="dark"
                    locale={locale}
                  />
                </View>
              )}
            </View>

            {/* Verification Status Filter */}
            <View className="gap-2">
              <Pressable
                className="flex-row justify-between items-center py-4 px-4 bg-neutral-50 rounded-xl border border-neutral-200"
                onPress={() => toggleField('verification_status')}
              >
                <Text className="text-base font-semibold text-neutral-900">
                  {t('transactions_filter_verification_status')}
                </Text>
                <Text className="text-base text-neutral-500 flex-1 text-right">
                  {getVerificationStatusTitle()}
                </Text>
              </Pressable>
              {expandedField === 'verification_status' && (
                <View className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden min-h-[200px]">
                  <Picker
                    selectedValue={tempFilters.verificationStatus || ''}
                    onValueChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        verificationStatus:
                          value === 'verified' || value === 'unverified' ? value : undefined,
                      }))
                    }
                    style={{ height: 50 }}
                    itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                  >
                    <Picker.Item
                      label={t('transactions_filter_all')}
                      value=""
                      color={colors.disabled}
                    />
                    <Picker.Item
                      label={t('transactions_filter_verified')}
                      value="verified"
                      color={colors.neutral[900]}
                    />
                    <Picker.Item
                      label={t('transactions_filter_unverified')}
                      value="unverified"
                      color={colors.neutral[900]}
                    />
                  </Picker>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <ModalFooter>
          <ModalButton
            onPress={handleClose}
            variant="cancel"
          >
            {t('form_cancel')}
          </ModalButton>
          <ModalButton
            onPress={handleApply}
            variant="primary"
          >
            {t('transactions_filter_apply')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
