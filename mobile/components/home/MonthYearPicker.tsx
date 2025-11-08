import { Picker } from '@react-native-picker/picker';
import { DateTime, Info } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { useUserLocale } from '@/hooks/useUserLocale';

type Props = {
  visible: boolean;
  onClose: () => void;
  onChange: (month: number, year: number) => void;
  initialMonth: number;
  initialYear: number;
};

export const MonthYearPicker = ({
  visible,
  onClose,
  onChange,
  initialMonth,
  initialYear,
}: Props) => {
  const { t } = useTranslation();
  const { locale } = useUserLocale();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  // Keep local state in sync when modal re-opens
  useEffect(() => {
    if (visible) {
      setMonth(initialMonth);
      setYear(initialYear);
    }
  }, [visible, initialMonth, initialYear]);

  // Generate localized month names
  const months = useMemo(() => {
    return Info.months('long', { locale });
  }, [locale]);

  const handleDone = () => {
    onChange(month, year);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('common_select_month_year') || 'Select month & year'}</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pickerContainer}>
            {/* Month */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>{t('common_month') || 'Month'}</Text>
              <Picker
                selectedValue={month}
                onValueChange={setMonth}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {months.map((monthName, idx) => (
                  <Picker.Item
                    key={idx}
                    label={monthName}
                    value={idx + 1}
                    color={colors.textPrimary}
                  />
                ))}
              </Picker>
            </View>

            {/* Year */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.label}>{t('common_year') || 'Year'}</Text>
              <Picker
                selectedValue={year}
                onValueChange={setYear}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {Array.from({ length: 11 }, (_, i) => {
                  const y = DateTime.now().year - 5 + i;
                  return (
                    <Picker.Item
                      key={y}
                      label={String(y)}
                      value={y}
                      color={colors.textPrimary}
                    />
                  );
                })}
              </Picker>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={onClose}
            style={[styles.button, styles.cancelButton]}
          >
            <Text style={styles.cancelButtonText}>{t('form_cancel')}</Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            style={[styles.button, styles.doneButton]}
          >
            <Text style={styles.doneButtonText}>{t('common_done')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDefault,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSurface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  pickerWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.disabled,
    marginBottom: 8,
  },
  picker: {
    height: 200,
  },
  pickerItem: {
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSurface,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSurface,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: colors.primary,
  },
  doneButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
