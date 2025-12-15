import { Picker } from '@react-native-picker/picker';
import { DateTime, Info } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, Text, View } from 'react-native';
import { useUserLocale } from '@/hooks/useUserLocale';
import { colors } from '@/theme/colors';
import { ModalButton } from './ModalButton';
import { ModalContainer } from './ModalContainer';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';

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
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row px-6 py-6 gap-4">
            {/* Month */}
            <View className="flex-1">
              <Text className="text-xs text-neutral-400 mb-2">{t('common_month') || 'Month'}</Text>
              <Picker
                selectedValue={month}
                onValueChange={setMonth}
                style={{ height: 200 }}
                itemStyle={{ color: colors.textPrimary }}
              >
                {months.map((monthName, idx) => (
                  <Picker.Item
                    key={monthName}
                    label={monthName}
                    value={idx + 1}
                    color={colors.textPrimary}
                  />
                ))}
              </Picker>
            </View>

            {/* Year */}
            <View className="flex-1">
              <Text className="text-xs text-neutral-400 mb-2">{t('common_year') || 'Year'}</Text>
              <Picker
                selectedValue={year}
                onValueChange={setYear}
                style={{ height: 200 }}
                itemStyle={{ color: colors.textPrimary }}
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
          <ModalButton
            onPress={onClose}
            variant="cancel"
          >
            {t('form_cancel')}
          </ModalButton>
          <ModalButton
            onPress={handleDone}
            variant="primary"
          >
            {t('common_done')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
