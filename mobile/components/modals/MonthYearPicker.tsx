import { Picker } from '@react-native-picker/picker';
import { DateTime, Info } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/colors';
import { useUserLocale } from '@/hooks/useUserLocale';
import { ModalContainer } from './ModalContainer';
import { ModalHeader } from './ModalHeader';
import { ModalFooter } from './ModalFooter';
import { ModalButton } from './ModalButton';

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
      <ModalContainer>
        <ModalHeader title={t('common_select_month_year') || 'Select month & year'} />

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

        <ModalFooter>
          <ModalButton onPress={onClose} variant="cancel">
            {t('form_cancel')}
          </ModalButton>
          <ModalButton onPress={handleDone} variant="primary">
            {t('common_done')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

