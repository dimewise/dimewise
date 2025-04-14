import { Pressable, StyleSheet, Text, View } from "react-native";
import { type MD3Theme, useTheme } from "react-native-paper";
import type { OptionListItem } from "../types";

interface Props {
  title: string;
  optionListItems: OptionListItem[];
}

export const ProfileOptionsList = ({ title, optionListItems }: Props) => {
  const theme = useTheme();
  const styles = makeStyle(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      <View style={styles.optionsContainer}>
        {optionListItems.map((o, i) => (
          <Pressable
            key={o.title}
            style={[
              styles.optionItem,
              i === optionListItems.length - 1 && styles.optionItemLast,
            ]}
            onPress={o.onPress}
          >
            {o.startIcon}
            <Text>{o.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const makeStyle = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      marginBottom: 16,
    },
    optionsContainer: {
      width: "100%",
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    sectionTitleText: {
      fontSize: theme.fonts.bodyMedium.fontSize,
      color: theme.colors.secondary,
      marginBottom: 8,
    },
    optionItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      paddingVertical: 16,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 16,
    },
    optionItemLast: {
      borderBottomWidth: 0,
    },
  });
