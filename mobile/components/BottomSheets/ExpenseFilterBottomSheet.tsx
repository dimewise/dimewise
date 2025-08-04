import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import DropdownBottomSheet, { DropdownOption, DropdownButton } from './DropdownBottomSheet';
import { getCategoriesByUserId } from '../../db/repository/category';
import { useMultipleAsyncData } from '../../hooks/useAsyncData';
import { useUser } from '../contexts/UserContext';
import { useRefreshKey } from '../contexts/RefreshKeyContext';
import { formatDateWithLocale } from '../../utils/datetime';

export interface ExpenseFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  verificationStatus?: 'verified' | 'unverified' | 'all';
  categoryId?: string;
}

interface ExpenseFilterBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onApplyFilters: (filters: ExpenseFilters) => void;
  currentFilters: ExpenseFilters;
}

export default function ExpenseFilterBottomSheet({
  visible,
  onDismiss,
  onApplyFilters,
  currentFilters,
}: ExpenseFilterBottomSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, userSetting } = useUser();
  const { refreshKeys } = useRefreshKey();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Local state for form
  const [startDate, setStartDate] = useState<Date>(
    currentFilters.dateRange?.from ? new Date(currentFilters.dateRange.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    currentFilters.dateRange?.to ? new Date(currentFilters.dateRange.to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)
  );
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unverified' | 'all'>(
    currentFilters.verificationStatus || 'all'
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    currentFilters.categoryId
  );

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Dropdown states
  const [showVerificationDropdown, setShowVerificationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Load categories
  const { data } = useMultipleAsyncData(
    {
      categories: () => (user?.id ? getCategoriesByUserId(user.id) : Promise.resolve([])),
    },
    {
      immediate: !!user?.id,
      deps: [user?.id, refreshKeys.categories],
    },
  );

  // Handle bottom sheet visibility
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  // Reset form when visibility changes
  useFocusEffect(
    useCallback(() => {
      if (visible) {
        setStartDate(
          currentFilters.dateRange?.from ? new Date(currentFilters.dateRange.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        );
        setEndDate(
          currentFilters.dateRange?.to ? new Date(currentFilters.dateRange.to) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999)
        );
        setVerificationStatus(currentFilters.verificationStatus || 'all');
        setSelectedCategoryId(currentFilters.categoryId);
      } else {
        // Close date pickers when bottom sheet is dismissed
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        setShowVerificationDropdown(false);
        setShowCategoryDropdown(false);
      }
    }, [visible, currentFilters]),
  );

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

  const handleStartDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleStartDatePickerToggle = () => {
    setShowStartDatePicker(!showStartDatePicker);
  };

  const handleEndDatePickerToggle = () => {
    setShowEndDatePicker(!showEndDatePicker);
  };

  const handleApplyFilters = () => {
    const filters: ExpenseFilters = {
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      verificationStatus: verificationStatus === 'all' ? undefined : verificationStatus,
      categoryId: selectedCategoryId,
    };

    onApplyFilters(filters);
    onDismiss();
  };

  const handleClearAll = () => {
    setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setEndDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999));
    setVerificationStatus('all');
    setSelectedCategoryId(undefined);
  };

  // Convert categories to dropdown options
  const categoryOptions: DropdownOption[] = [
    { label: t('common.all'), value: '', id: 'all' },
    ...(data?.categories || []).map((category) => ({
      label: category.name,
      value: category.id,
      id: category.id,
    })),
  ];

  // Verification status options
  const verificationOptions: DropdownOption[] = [
    { label: t('expenses.filters.all'), value: 'all', id: 'all' },
    { label: t('expenses.filters.verified'), value: 'verified', id: 'verified' },
    { label: t('expenses.filters.unverified'), value: 'unverified', id: 'unverified' },
  ];

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        onChange={handleSheetChanges}
        enablePanDownToClose
        enableDynamicSizing
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
        maxDynamicContentSize={Dimensions.get('window').height * 0.9}
        backdropComponent={renderBackdrop}
        enableContentPanningGesture
      >
        <BottomSheetScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="never"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={false}
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
                {t('expenses.filters.title')}
              </Text>

              <View style={{ gap: 24 }}>
                {/* Date Range Section */}
                <View>
                  <Text
                    variant="labelLarge"
                    style={{
                      marginBottom: 16,
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '600',
                    }}
                  >
                    {t('expenses.filters.dateRange')}
                  </Text>
                  <View style={{ gap: 12 }}>
                    <View>
                      <Text
                        variant="labelMedium"
                        style={{
                          marginBottom: 8,
                          color: theme.colors.onSurfaceVariant,
                          fontWeight: '500',
                        }}
                      >
                        {t('expenses.filters.startDate')}
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={handleStartDatePickerToggle}
                        contentStyle={{
                          paddingVertical: 4,
                          justifyContent: 'flex-start',
                        }}
                        labelStyle={{
                          fontSize: 16,
                          fontWeight: '500',
                          textAlign: 'left',
                        }}
                        style={{
                          borderRadius: 6,
                          borderColor: theme.colors.outline,
                          backgroundColor: theme.colors.surface,
                        }}
                      >
                        {formatDateWithLocale(startDate, userSetting?.preferredLanguage || 'en')}
                      </Button>
                      {showStartDatePicker && (
                        <DateTimePicker
                          value={startDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleStartDateChange}
                          locale={userSetting?.preferredLanguage || 'en'}
                          maximumDate={endDate}
                        />
                      )}
                    </View>
                    <View>
                      <Text
                        variant="labelMedium"
                        style={{
                          marginBottom: 8,
                          color: theme.colors.onSurfaceVariant,
                          fontWeight: '500',
                        }}
                      >
                        {t('expenses.filters.endDate')}
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={handleEndDatePickerToggle}
                        contentStyle={{
                          paddingVertical: 4,
                          justifyContent: 'flex-start',
                        }}
                        labelStyle={{
                          fontSize: 16,
                          fontWeight: '500',
                          textAlign: 'left',
                        }}
                        style={{
                          borderRadius: 6,
                          borderColor: theme.colors.outline,
                          backgroundColor: theme.colors.surface,
                        }}
                      >
                        {formatDateWithLocale(endDate, userSetting?.preferredLanguage || 'en')}
                      </Button>
                      {showEndDatePicker && (
                        <DateTimePicker
                          value={endDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          locale={userSetting?.preferredLanguage || 'en'}
                          onChange={handleEndDateChange}
                          minimumDate={startDate}
                          maximumDate={new Date()}
                        />
                      )}
                    </View>
                  </View>
                </View>

                {/* Verification Status Section */}
                <View>
                  <Text
                    variant="labelLarge"
                    style={{
                      marginBottom: 16,
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '600',
                    }}
                  >
                    {t('expenses.filters.verificationStatus')}
                  </Text>
                  <DropdownButton
                    onPress={() => setShowVerificationDropdown(true)}
                    selectedValue={verificationStatus}
                    options={verificationOptions}
                    placeholder={t('expenses.filters.selectVerificationStatus')}
                  />
                  <DropdownBottomSheet
                    visible={showVerificationDropdown}
                    onDismiss={() => setShowVerificationDropdown(false)}
                    options={verificationOptions}
                    onSelect={(value) => {
                      setVerificationStatus(value as 'verified' | 'unverified' | 'all');
                      setShowVerificationDropdown(false);
                    }}
                    selectedValue={verificationStatus}
                    title={t('expenses.filters.selectVerificationStatus')}
                  />
                </View>

                {/* Category Section */}
                <View>
                  <Text
                    variant="labelLarge"
                    style={{
                      marginBottom: 16,
                      color: theme.colors.onSurfaceVariant,
                      fontWeight: '600',
                    }}
                  >
                    {t('expenses.filters.category')}
                  </Text>
                  <DropdownButton
                    onPress={() => setShowCategoryDropdown(true)}
                    selectedValue={selectedCategoryId || ''}
                    options={categoryOptions}
                    placeholder={t('expenses.filters.selectCategory')}
                  />
                  <DropdownBottomSheet
                    visible={showCategoryDropdown}
                    onDismiss={() => setShowCategoryDropdown(false)}
                    options={categoryOptions}
                    onSelect={(value) => {
                      setSelectedCategoryId(value || undefined);
                      setShowCategoryDropdown(false);
                    }}
                    selectedValue={selectedCategoryId || ''}
                    title={t('expenses.filters.selectCategory')}
                  />
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
                  <Button
                    mode="outlined"
                    onPress={handleClearAll}
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
                    {t('expenses.filters.clearAll')}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleApplyFilters}
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
                    {t('expenses.filters.applyFilters')}
                  </Button>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
} 