import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppSelector } from "@/store/store";
import { Redirect, Stack, usePathname } from "expo-router";
import { DateTime } from "luxon";
import { CalendarProvider } from "react-native-calendars";

export default function AppLayout() {
  const theme = useAppTheme();
  const { session } = useAppSelector((state) => state.session);
  const pathname = usePathname();
  const isCalendarSelectable = pathname === "/transactions";

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <CalendarProvider
      date={DateTime.now().toFormat("yyyy-MM-dd")}
      showTodayButton={isCalendarSelectable}
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
