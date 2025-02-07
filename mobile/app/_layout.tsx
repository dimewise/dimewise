import { SessionProvider } from "@/contexts/SessionContext";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
