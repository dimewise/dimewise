import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AuthLayout() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        animated={true}
        backgroundColor="#000000"
      />
      <Stack initialRouteName="login">
        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="register"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}
