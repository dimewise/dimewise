import { useSession } from "@/contexts/SessionContext";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { session } = useSession();

  if (!session) {
    return <Redirect href="/sign-in" />
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
