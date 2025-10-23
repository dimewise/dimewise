import { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery, useGetPaymentMethodsQuery } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { useUserLocale } from '@/hooks/useUserLocale';
import type { Filter } from '@/app/(app)/(tabs)/transactions';

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
    const category = categories?.find(cat => cat.id === tempFilters.categoryId);
    return category?.title || t('transactions_filter_all');
  };

  const getSelectedPaymentMethodTitle = () => {
    const method = paymentMethods?.find(method => method.id === tempFilters.paymentMethodId);
    return method?.title || t('transactions_filter_all');
  };

  const getVerificationStatusTitle = () => {
    if (!tempFilters.verificationStatus) return t('transactions_filter_all');
    return tempFilters.verificationStatus === 'verified' 
      ? t('transactions_filter_verified') 
      : t('transactions_filter_unverified');
  };

  const onDateFromChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const isoDate = DateTime.fromJSDate(selectedDate).toISODate();
      setTempFilters(prev => ({ ...prev, dateFrom: isoDate || undefined }));
    }
  };

  const onDateToChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const isoDate = DateTime.fromJSDate(selectedDate).toISODate();
      setTempFilters(prev => ({ ...prev, dateTo: isoDate || undefined }));
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('transactions_filter_title')}</Text>
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>{t('transactions_filter_clear')}</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Category Filter */}
            <View style={styles.collapsibleContainer}>
              <Pressable
                style={styles.collapsibleHeader}
                onPress={() => toggleField('category')}
              >
                <Text style={styles.collapsibleLabel}>{t('transactions_filter_category')}</Text>
                <Text style={styles.collapsibleValue}>{getSelectedCategoryTitle()}</Text>
              </Pressable>
              {expandedField === 'category' && (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={tempFilters.categoryId || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ ...prev, categoryId: value || undefined }))}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label={t('transactions_filter_all')} value="" color={colors.disabled} />
                    {categories?.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={category.title}
                        value={category.id}
                        color={colors.textPrimary}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Payment Method Filter */}
            <View style={styles.collapsibleContainer}>
              <Pressable
                style={styles.collapsibleHeader}
                onPress={() => toggleField('payment_method')}
              >
                <Text style={styles.collapsibleLabel}>{t('transactions_filter_payment_method')}</Text>
                <Text style={styles.collapsibleValue}>{getSelectedPaymentMethodTitle()}</Text>
              </Pressable>
              {expandedField === 'payment_method' && (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={tempFilters.paymentMethodId || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ ...prev, paymentMethodId: value || undefined }))}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label={t('transactions_filter_all')} value="" color={colors.disabled} />
                    {paymentMethods?.map((method) => (
                      <Picker.Item
                        key={method.id}
                        label={method.title}
                        value={method.id}
                        color={colors.textPrimary}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Date From Filter */}
            <View style={styles.collapsibleContainer}>
              <Pressable
                style={styles.collapsibleHeader}
                onPress={() => toggleField('date_from')}
              >
                <Text style={styles.collapsibleLabel}>{t('transactions_filter_date_from')}</Text>
                <Text style={styles.collapsibleValue}>{formatDate(tempFilters.dateFrom)}</Text>
              </Pressable>
              {expandedField === 'date_from' && (
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={tempFilters.dateFrom ? DateTime.fromISO(tempFilters.dateFrom).toJSDate() : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onDateFromChange}
                    style={styles.datePicker}
                    textColor={colors.textPrimary}
                    themeVariant="dark"
                    locale={locale}
                  />
                </View>
              )}
            </View>

            {/* Date To Filter */}
            <View style={styles.collapsibleContainer}>
              <Pressable
                style={styles.collapsibleHeader}
                onPress={() => toggleField('date_to')}
              >
                <Text style={styles.collapsibleLabel}>{t('transactions_filter_date_to')}</Text>
                <Text style={styles.collapsibleValue}>{formatDate(tempFilters.dateTo)}</Text>
              </Pressable>
              {expandedField === 'date_to' && (
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={tempFilters.dateTo ? DateTime.fromISO(tempFilters.dateTo).toJSDate() : new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onDateToChange}
                    style={styles.datePicker}
                    textColor={colors.textPrimary}
                    themeVariant="dark"
                    locale={locale}
                  />
                </View>
              )}
            </View>

            {/* Verification Status Filter */}
            <View style={styles.collapsibleContainer}>
              <Pressable
                style={styles.collapsibleHeader}
                onPress={() => toggleField('verification_status')}
              >
                <Text style={styles.collapsibleLabel}>{t('transactions_filter_verification_status')}</Text>
                <Text style={styles.collapsibleValue}>{getVerificationStatusTitle()}</Text>
              </Pressable>
              {expandedField === 'verification_status' && (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={tempFilters.verificationStatus || ''}
                    onValueChange={(value) => setTempFilters(prev => ({ ...prev, verificationStatus: value === 'verified' || value === 'unverified' ? value : undefined }))}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label={t('transactions_filter_all')} value="" color={colors.disabled} />
                    <Picker.Item label={t('transactions_filter_verified')} value="verified" color={colors.textPrimary} />
                    <Picker.Item label={t('transactions_filter_unverified')} value="unverified" color={colors.textPrimary} />
                  </Picker>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable 
            onPress={handleClose} 
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>{t('form_cancel')}</Text>
          </Pressable>
          <Pressable 
            onPress={handleApply} 
            style={styles.applyButton}
          >
            <Text style={styles.applyButtonText}>{t('transactions_filter_apply')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDefault,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSurface,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 20,
  },
  collapsibleContainer: {
    gap: 8,
  },
  collapsibleHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  collapsibleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  collapsibleValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right' as const,
  },
  pickerWrapper: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    overflow: 'hidden',
    minHeight: 200,
  },
  picker: {
    height: 50,
    color: colors.textPrimary,
  },
  pickerItem: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  datePicker: {
    height: 200,
    backgroundColor: colors.backgroundSurface,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.textPrimary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.backgroundDefault,
  },
});
