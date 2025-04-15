import { Pressable, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import type { OptionListItem } from "../types";

interface Props {
  title: string;
  optionListItems: OptionListItem[];
}

export const ProfileOptionsList = ({ title, optionListItems }: Props) => {
  const theme = useTheme();

  return (
    <View
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontSize: theme.fonts.bodyMedium.fontSize,
          color: theme.colors.secondary,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          width: "100%",
          paddingHorizontal: 16,
          borderRadius: 12,
        }}
      >
        {optionListItems.map((o, i) => (
          <Pressable
            key={o.title}
            style={[
              {
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outline,
                paddingVertical: 16,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 16,
              },
              i === optionListItems.length - 1 && {
                borderBottomWidth: 0,
              },
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
