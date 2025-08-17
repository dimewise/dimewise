import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/UserContext';
import DropdownBottomSheet, { DropdownButton, type DropdownOption } from './DropdownBottomSheet';

interface DateSelectorBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (month: number, year: number) => void;
  selectedMonth: number;
  selectedYear: number;
}

export default function DateSelectorBottomSheet({
  visible,
  onDismiss,
  onApply,
  selectedMonth,
  selectedYear,
}: DateSelectorBottomSheetProps) {
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const theme = useTheme();
  const { t } = useTranslation();
  const { userSetting } = useUser();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Reset temp values when props change
  useEffect(() => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onDismiss}
      />
    ),
    [onDismiss],
  );

  const handleApply = useCallback(() => {
    onApply(tempMonth, tempYear);
    onDismiss();
  }, [onApply, tempMonth, tempYear, onDismiss]);

  const handleCurrentMonth = useCallback(() => {
    const now = new Date();
    setTempMonth(now.getMonth());
    setTempYear(now.getFullYear());
  }, []);

  const handleReset = useCallback(() => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    onDismiss();
  }, [selectedMonth, selectedYear, onDismiss]);

  // Generate month options (0-11 for JavaScript Date months)
  const monthOptions: DropdownOption[] = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1); // Use 2024 as base year for month names
      months.push({
        label: date.toLocaleDateString(
          userSetting?.preferredLanguage === 'ja' ? 'ja-JP' : 'en-US',
          { month: 'long' },
        ),
        value: i.toString(),
        id: i.toString(),
      });
    }
    return months;
  }, [userSetting?.preferredLanguage]);

  // Generate year options (current year -10 to +3)
  const yearOptions: DropdownOption[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 3; year++) {
      years.push({
        label: year.toString(),
        value: year.toString(),
        id: year.toString(),
      });
    }
    return years;
  }, []);

  const selectedMonthLabel = monthOptions.find((m) => m.value === tempMonth.toString())?.label;
  const selectedYearLabel = yearOptions.find((y) => y.value === tempYear.toString())?.label;

  const renderMonthDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowMonthDropdown(true)}
        selectedValue={tempMonth.toString()}
        options={monthOptions}
        placeholder={t('home.selectMonth')}
        label={t('home.selectMonth')}
      />
      <DropdownBottomSheet
        visible={showMonthDropdown}
        onDismiss={() => setShowMonthDropdown(false)}
        options={monthOptions}
        onSelect={(value) => {
          setTempMonth(parseInt(value));
          setShowMonthDropdown(false);
        }}
        selectedValue={tempMonth.toString()}
        title={t('home.selectMonth')}
      />
    </>
  );

  const renderYearDropdown = () => (
    <>
      <DropdownButton
        onPress={() => setShowYearDropdown(true)}
        selectedValue={tempYear.toString()}
        options={yearOptions}
        placeholder={t('home.selectYear')}
        label={t('home.selectYear')}
      />
      <DropdownBottomSheet
        visible={showYearDropdown}
        onDismiss={() => setShowYearDropdown(false)}
        options={yearOptions}
        onSelect={(value) => {
          setTempYear(parseInt(value));
          setShowYearDropdown(false);
        }}
        selectedValue={tempYear.toString()}
        title={t('home.selectYear')}
      />
    </>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
      backdropComponent={renderBackdrop}
      maxDynamicContentSize={Dimensions.get('window').height * 0.9}
      enableContentPanningGesture
    >
      <BottomSheetScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView
          edges={['bottom']}
          style={{ flex: 1 }}
        >
          <View
            style={{
              padding: 8,
              backgroundColor: theme.colors.surface,
            }}
          >
            <Text
              variant="headlineMedium"
              style={{
                marginBottom: 32,
                fontWeight: '700',
                color: theme.colors.onSurface,
                textAlign: 'center',
              }}
            >
              {t('home.selectPeriod')}
            </Text>
            <View
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                padding: 16,
                borderRadius: 8,
                marginBottom: 24,
                alignItems: 'center',
              }}
            >
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginBottom: 4,
                }}
              >
                {t('home.selectedPeriod')}
              </Text>
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}
              >
                {selectedMonthLabel} {selectedYearLabel}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={handleCurrentMonth}
              style={{
                marginBottom: 24,
                borderRadius: 6,
              }}
              icon="calendar-today"
            >
              {t('home.currentMonth')}
            </Button>
            <View style={{ marginBottom: 16 }}>{renderMonthDropdown()}</View>
            <View style={{ marginBottom: 32 }}>{renderYearDropdown()}</View>
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <Button
                mode="outlined"
                onPress={handleReset}
                contentStyle={{
                  paddingVertical: 4,
                }}
                labelStyle={{
                  fontSize: 16,
                  fontWeight: '600',
                  letterSpacing: 0.25,
                }}
                style={{
                  flex: 1,
                  borderRadius: 6,
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleApply}
                contentStyle={{
                  paddingVertical: 4,
                }}
                labelStyle={{
                  fontSize: 16,
                  fontWeight: '600',
                  letterSpacing: 0.25,
                }}
                style={{
                  flex: 1,
                  borderRadius: 6,
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {t('common.apply')}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
