import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, View } from 'react-native';
import { ModalButton } from '@/components/modals/ModalButton';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import { colors } from '@/theme/colors';
import { LANGUAGES } from '@/utils/constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: string;
  onChange: (val: string) => void;
};

export const LanguagePickerModal = ({ visible, onClose, selected, onChange }: Props) => {
  const { t } = useTranslation();
  const [inner, setInner] = useState(selected);

  /* keep inner in sync when modal re-opens */
  useEffect(() => {
    if (visible) {
      setInner(selected);
    }
  }, [visible, selected]);

  const handleDone = () => {
    onChange(inner);
    onClose();
  };

  const getLanguageLabel = (code: string) => {
    return code === 'en' ? 'English' : code === 'ja' ? '日本語' : code;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalHeader title={t('finish_select_language')} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="m-6 bg-neutral-100 rounded-xl overflow-hidden">
            <Picker
              selectedValue={inner}
              onValueChange={setInner}
              style={{ height: 200 }}
              itemStyle={{ color: colors.textPrimary }}
            >
              {LANGUAGES.map((language) => (
                <Picker.Item
                  key={language}
                  label={getLanguageLabel(language)}
                  value={language}
                  color={colors.textPrimary}
                />
              ))}
            </Picker>
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
