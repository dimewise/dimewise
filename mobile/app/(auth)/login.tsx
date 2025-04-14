import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/store";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons"; // Social login icons
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, AppState, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Login() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const { loginWithPassword } = useAuth();
  const session = useAppSelector((state) => state.session);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithEmail() {
    const { error: loginErr } = await loginWithPassword({
      email: email,
      password: password,
    });

    if (loginErr) Alert.alert(loginErr.message);
    router.replace("/(app)/(tabs)/home");
  }

  return (
    <SafeAreaView style={gstyles.container}>
      {session.loading && <Text>Loading...</Text>}
      <Image
        style={{
          width: "80%",
          height: 80,
          marginBottom: 10,
        }}
        source={require("../../assets/logo/logo_full_colored.svg")}
        contentFit="contain"
      />
      <Text
        variant="headlineLarge"
        style={{
          marginBottom: 24, // Space between greetings and inputs
        }}
      >
        Welcome back!
      </Text>

      {/* Input Fields */}
      <View
        style={{
          width: "100%",
          gap: 5,
        }}
      >
        <TextInput
          mode="outlined"
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="yamada.taro@email.com"
        />
        <TextInput
          mode="outlined"
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
        />
      </View>

      {/* Sign In Button */}
      <Button
        mode="contained"
        disabled={session.loading}
        onPress={() => signInWithEmail()}
        style={{ width: "100%", maxWidth: 150 }}
      >
        Sign In
      </Button>

      {/* Horizontal line and social login options */}
      <View
        style={{
          width: "100%",
          alignItems: "center",
          gap: 24,
          marginTop: 24,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            width: "100%",
          }}
        >
          <View
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.primary,
              marginBottom: 16, // Space after divider
            }}
          />
          <Text
            variant="bodyMedium"
            style={{
              flex: 0,
              color: theme.colors.primary,
              marginBottom: 16,
            }}
          >
            Or sign in with
          </Text>
          <View
            style={{
              flex: 1,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.primary,
              marginBottom: 16, // Space after divider
            }}
          />
        </View>

        {/* TODO: Add socials login, on Press */}
        <View
          style={{
            flexDirection: "row",
            gap: 32,
          }}
        >
          <Ionicons
            name="logo-google"
            size={30}
            color={theme.colors.primary}
          />
          <FontAwesome
            name="facebook"
            size={30}
            color={theme.colors.primary}
          />
          <AntDesign
            name="twitter"
            size={30}
            color={theme.colors.primary}
          />
        </View>
      </View>

      {/* Sign Up Link */}
      <View
        style={{
          marginTop: 20,
        }}
      >
        <Text variant="bodyMedium">
          Don't have an account?&nbsp;
          <Link
            style={{
              textDecorationLine: "underline",
              color: theme.colors.primary,
            }}
            href={"/(auth)/register"}
          >
            Sign Up
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
