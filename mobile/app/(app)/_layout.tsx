import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppSelector } from "@/store/store";
import { Redirect, Stack } from "expo-router";
import { DateTime } from "luxon";
import { CalendarProvider } from "react-native-calendars";

export default function AppLayout() {
  const theme = useAppTheme();
  const { session } = useAppSelector((state) => state.session);

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <CalendarProvider
      date={DateTime.now().toFormat("yyyy-MM-dd")}
      theme={{
        todayButtonTextColor: theme.colors.primary,
      }}
    >
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </CalendarProvider>
  );
}
