import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { type MD3Theme, useTheme } from "react-native-paper";

type Props = {
  label: string;
  color?: "primary";
  disabled?: boolean;
  startIcon?: string;
  iconFamily?: "font-awesome";
  fullWidth?: boolean;
  onPress?: () => void;
};

export const Button = ({
  label,
  color,
  disabled,
  startIcon,
  iconFamily,
  fullWidth,
  onPress,
}: Props) => {
  const theme = useTheme();
  const styles = makeStyle(theme);

  if (color === "primary") {
    return (
      <View style={[styles.buttonContainer, fullWidth && { width: "100%" }]}>
        <Pressable
          disabled={disabled}
          style={styles.button}
          onPress={onPress}
        >
          {startIcon && iconFamily && (
            <FontAwesome
              name="picture-o"
              size={18}
              color="#25292e"
              style={styles.buttonIcon}
            />
          )}
          <Text style={[styles.buttonLabel]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={styles.button}
        onPress={onPress}
      >
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
};

const makeStyle = (theme: MD3Theme) =>
  StyleSheet.create({
    buttonContainer: {
      width: 320,
      height: 60,
      marginHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
    },
    button: {
      borderRadius: 10,
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    buttonIcon: {
      paddingRight: 8,
    },
    buttonLabel: {
      color: "#FFFFFF",
      fontSize: 16,
    },
  });
