import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { ModalButton } from '@/components/modals/ModalButton';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import { type CurrencyType, useGetUsersMeQuery, usePutUsersMeMutation } from '@/generated/api/api';
import { colors } from '@/theme/colors';
import { CURRENCIES } from '@/utils/constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CurrencySelectorModal = ({ visible, onClose, onSuccess }: Props) => {
  const { t } = useTranslation();
  const { data: user } = useGetUsersMeQuery(undefined);
  const [updateUser, { isLoading }] = usePutUsersMeMutation();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(user?.currency ?? 'USD');

  // Reset selected currency when modal opens
  useEffect(() => {
    if (visible && user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [visible, user?.currency]);

  const onSave = async () => {
    if (!user) return;

    // Show destructive action alert if currency is changing
    if (selectedCurrency !== user.currency) {
      Alert.alert(t('currency_change_title'), t('currency_change_message'), [
        { text: t('currency_change_cancel'), style: 'cancel' },
        {
          text: t('currency_change_continue'),
          style: 'destructive',
          onPress: async () => {
            await performCurrencyUpdate();
          },
        },
      ]);
    } else {
      // No change, just close
      onClose();
    }
  };

  const performCurrencyUpdate = async () => {
    if (!user) return;

    try {
      await updateUser({
        userUpdate: {
          currency: selectedCurrency,
          preferred_language: user.preferred_language,
        },
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalHeader title={t('settings_select_currency')} />

        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5">
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-500">{t('form_currency')}</Text>
              <View className="bg-neutral-100 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                  style={{ height: 200 }}
                  itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                >
                  {CURRENCIES.map((currency) => (
                    <Picker.Item
                      key={currency}
                      label={currency}
                      value={currency}
                      color={colors.neutral[900]}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </ScrollView>

        <ModalFooter>
          <ModalButton
            onPress={onClose}
            variant="cancel"
            disabled={isLoading}
          >
            {t('form_cancel')}
          </ModalButton>
          <ModalButton
            onPress={onSave}
            variant="primary"
            loading={isLoading}
          >
            {t('form_save')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Modal>
  );
};
