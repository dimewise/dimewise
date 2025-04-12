import { useAppSelector } from "@/store/store";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AppLayout() {
  const { session } = useAppSelector((state) => state.session);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        animated={true}
        backgroundColor="#FFFFFF"
      />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
