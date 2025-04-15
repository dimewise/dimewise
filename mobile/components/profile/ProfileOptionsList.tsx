import { useAppTheme } from "@/hooks/useAppTheme";
import { View } from "react-native";
import { Button, Divider, Icon, Text } from "react-native-paper";
import type { OptionListItem } from "../types";

interface Props {
  title: string;
  optionListItems: OptionListItem[];
}

export const ProfileOptionsList = ({ title, optionListItems }: Props) => {
  const theme = useAppTheme();

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
        variant="bodySmall"
        style={{
          fontWeight: "bold",
          color: theme.colors.textMuted,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          width: "100%",
          borderRadius: 12,
          backgroundColor: theme.colors.backgroundMuted,
        }}
      >
        {optionListItems.map((o, i) => (
          <View key={o.title}>
            <Button
              mode="contained"
              icon={() =>
                o.startIcon ? (
                  <Icon
                    source={o.startIcon}
                    size={20}
                  />
                ) : undefined
              }
              style={[
                {
                  paddingVertical: 8,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                },
              ]}
              buttonColor={theme.colors.backgroundMuted}
              textColor={theme.colors.text}
              onPress={o.onPress}
            >
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.text }}
              >
                {o.title}
              </Text>
            </Button>
            {i !== optionListItems.length - 1 && (
              <Divider
                bold
                style={{ marginHorizontal: 16 }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};
