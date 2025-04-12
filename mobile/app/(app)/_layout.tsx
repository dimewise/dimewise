import { useAppSelector } from "@/store/store";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { session } = useAppSelector((state) => state.session);

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
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
