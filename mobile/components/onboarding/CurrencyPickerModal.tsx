import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { ModalButton } from '@/components/modals/ModalButton';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ModalFooter } from '@/components/modals/ModalFooter';
import { ModalHeader } from '@/components/modals/ModalHeader';
import { colors } from '@/theme/colors';
import { CURRENCIES } from '@/utils/constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  selected: string;
  onChange: (val: string) => void;
};

export const CurrencyPickerModal = ({ visible, onClose, selected, onChange }: Props) => {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalHeader title={t('finish_select_currency')} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={inner}
              onValueChange={setInner}
              style={styles.picker}
            >
              {CURRENCIES.map((currency) => (
                <Picker.Item
                  key={currency}
                  label={currency}
                  value={currency}
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: colors.backgroundSurface,
    borderRadius: 12,
    borderWidth: 0,
    overflow: 'hidden',
    margin: 24,
  },
  picker: {
    height: 200,
    color: colors.textPrimary,
  },
});
