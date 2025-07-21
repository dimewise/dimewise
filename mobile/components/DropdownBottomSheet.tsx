import { ScrollView, View } from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';

export interface DropdownOption {
  label: string;
  value: string;
  id?: string;
}

interface DropdownDialogProps {
  visible: boolean;
  onDismiss: () => void;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  title: string;
  placeholder?: string;
  label?: string;
}

interface DropdownButtonProps {
  onPress: () => void;
  selectedValue?: string;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
}

// The button component that triggers the dropdown
export function DropdownButton({
  onPress,
  selectedValue,
  options,
  placeholder = 'Select an option', // TODO: This should be translated by parent component
  label,
}: DropdownButtonProps) {
  const theme = useTheme();
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <View>
      {label && (
        <Text
          variant="bodySmall"
          style={{
            marginBottom: 4,
            color: theme.colors.onSurfaceVariant,
            fontSize: 12,
          }}
        >
          {label}
        </Text>
      )}
      <Button
        mode="outlined"
        onPress={onPress}
        contentStyle={{
          paddingVertical: 4,
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
        }}
        style={{
          borderRadius: 6,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
        }}
        icon="chevron-down"
      >
        {selectedOption ? selectedOption.label : placeholder}
      </Button>
    </View>
  );
}

// The dialog component for selection
export default function DropdownBottomSheet({
  visible,
  onDismiss,
  options,
  onSelect,
  selectedValue,
  title,
}: DropdownDialogProps) {
  const theme = useTheme();

  const handleSelect = (value: string) => {
    onSelect(value);
    onDismiss();
  };

  const renderItem = ({ item }: { item: DropdownOption }) => (
    <List.Item
      title={item.label}
      onPress={() => handleSelect(item.value)}
      style={{
        padding: 8,
      }}
      titleStyle={{
        color: selectedValue === item.value ? theme.colors.primary : theme.colors.onSurface,
      }}
      right={() => (
        <View
          style={{
            width: 40,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {selectedValue === item.value && (
            <IconButton
              icon="check"
              iconColor={theme.colors.primary}
              size={20}
            />
          )}
        </View>
      )}
    />
  );

  const renderSeparator = () => <Divider style={{ marginHorizontal: 16 }} />;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          padding: 16,
          margin: 32,
          borderRadius: 8,
        }}
      >
        <Text
          variant="titleMedium"
          style={{
            fontWeight: '600',
            color: theme.colors.onSurface,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        <Divider style={{ marginVertical: 12 }} />

        <ScrollView
          showsVerticalScrollIndicator={options.length > 7} // Only show scrollbar if needed
          nestedScrollEnabled={true}
        >
          {options.map((item, index) => (
            <View key={item.value}>
              {renderItem({ item })}
              {index < options.length - 1 && renderSeparator()}
            </View>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );
}
