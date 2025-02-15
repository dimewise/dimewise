import { useTheme } from "@/contexts/ThemeContext";
import type { Theme } from "@/style/theme";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
};

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}: Props) => {
  const theme = useTheme();
  const styles = makeStyle(theme);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor="#aaa"
        />
      </View>
    </View>
  );
};

const makeStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 4,
      color: "#25292e",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: theme.color.primary,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      backgroundColor: "#fff",
    },
    icon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 40,
    },
  });
