import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, Text, View } from 'react-native';
import { ModalButton } from '@/components/modals/ModalButton';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import {
  type SupportedLanguage,
  useGetUsersMeQuery,
  usePutUsersMeMutation,
} from '@/generated/api/api';
import { colors } from '@/theme/colors';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const LanguageSelectorModal = ({ visible, onClose, onSuccess }: Props) => {
  const { t } = useTranslation();
  const { data: user } = useGetUsersMeQuery(undefined);
  const [updateUser, { isLoading }] = usePutUsersMeMutation();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    user?.preferred_language ?? 'en',
  );

  // Reset selected language when modal opens
  useEffect(() => {
    if (visible && user?.preferred_language) {
      setSelectedLanguage(user.preferred_language);
    }
  }, [visible, user?.preferred_language]);

  const onSave = async () => {
    if (!user) return;

    try {
      await updateUser({
        userUpdate: {
          currency: user.currency,
          preferred_language: selectedLanguage,
        },
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert('Error', 'Failed to update language. Please try again.');
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
        <ModalHeader title={t('settings_select_language')} />

        <ScrollView
          className="flex-1"
          contentContainerClassName="p-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-5">
            <View className="gap-2">
              <Text className="text-sm font-medium text-neutral-500">{t('form_language')}</Text>
              <View className="bg-neutral-100 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                  style={{ height: 200 }}
                  itemStyle={{ color: colors.neutral[900], fontSize: 16 }}
                >
                  {LANGUAGES.map((language) => (
                    <Picker.Item
                      key={language.code}
                      label={language.name}
                      value={language.code}
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
