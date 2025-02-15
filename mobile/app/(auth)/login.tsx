import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/store";
import type { Theme } from "@/style/theme";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";
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
  const styles = makeStyle(theme);
  const { loginWithPassword } = useAuth();
  const session = useAppSelector((state) => state.session);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithEmail() {
    await loginWithPassword({
      email: email,
      password: password,
    });

    if (session.error) Alert.alert(session.error.message);
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.container}>
      {session.loading && <Text>Loading...</Text>}
      <Image
        style={styles.logo}
        source={require("../../assets/logo/logo_full_colored.svg")}
        contentFit="contain"
      />
      <Text style={[styles.greetings]}>Welcome back!</Text>
      <View style={styles.input}>
        <Input
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="yamada.taro@email.com"
        />
        <Input
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
        />
      </View>
      <View>
        <Button
          color="primary"
          label="Sign in"
          disabled={session.loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View>
        <Text>
          Don't have an account?&nbsp;
          <Link
            style={styles.signUpText}
            href={"/(auth)/register"}
          >
            Sign Up
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const makeStyle = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 50,
      height: "100%",
      backgroundColor: theme.color.background,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
    },
    input: {
      width: "100%",
    },
    logo: {
      width: "100%",
      height: 60,
    },
    greetings: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.typography.regular,
    },
    signUpText: {
      textDecorationLine: "underline",
    },
  });
