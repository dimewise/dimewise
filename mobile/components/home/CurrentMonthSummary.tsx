import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

export const CurrentMonthSummary = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fonts.headlineLarge.fontFamily,
          fontSize: theme.fonts.headlineLarge.fontSize,
        }}
      >
        April
      </Text>
      <View
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.headlineLarge.fontFamily,
            fontSize: theme.fonts.headlineLarge.fontSize,
          }}
        >
          JPY 120,000
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              fontFamily: theme.fonts.headlineLarge.fontFamily,
              fontSize: theme.fonts.headlineLarge.fontSize,
            }}
          >
            /&nbsp;
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.headlineLarge.fontFamily,
              fontSize: theme.fonts.headlineLarge.fontSize,
            }}
          >
            JPY 120,000
          </Text>
        </View>
        <View />
      </View>
    </View>
  );
};
