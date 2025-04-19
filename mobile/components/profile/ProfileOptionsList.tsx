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
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "flex-start",
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
          flex: 1,
          width: "100%",
          borderRadius: 12,
          backgroundColor: theme.colors.backgroundMuted,
        }}
      >
        {optionListItems.map((o, i) => (
          <View
            key={o.title}
            style={{ flex: 1, width: "100%" }}
          >
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
              contentStyle={{
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "100%",
                paddingVertical: 8,
              }}
              style={{
                width: "100%",
                borderRadius: 12,
              }}
              labelStyle={{
                flex: 1,
                textAlign: "left",
              }}
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
