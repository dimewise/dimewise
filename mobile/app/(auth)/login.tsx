import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/store";
import type { Theme } from "@/style/theme";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons"; // Social login icons
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
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);
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
    router.replace("/(main)/(tabs)/home");
  }

  return (
    <SafeAreaView style={gstyles.container}>
      {session.loading && <Text>Loading...</Text>}
      <Image
        style={styles.logo}
        source={require("../../assets/logo/logo_full_colored.svg")}
        contentFit="contain"
      />
      <Text style={styles.greetings}>Welcome back!</Text>

      {/* Input Fields */}
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

      {/* Sign In Button */}
      <Button
        color="primary"
        label="Sign in"
        fullWidth
        disabled={session.loading}
        onPress={() => signInWithEmail()}
      />

      {/* Horizontal line and social login options */}
      <View style={styles.socialLoginWrapper}>
        <View style={styles.dividerWrapper}>
          <View style={styles.divider}></View>
          <Text style={styles.orText}>Or sign in with</Text>
          <View style={styles.divider}></View>
        </View>

        {/* TODO: Add socials login, on Press */}
        <View style={styles.socialIcons}>
          <Ionicons
            name="logo-google"
            size={30}
            color={theme.color.primary}
          />
          <FontAwesome
            name="facebook"
            size={30}
            color={theme.color.primary}
          />
          <AntDesign
            name="twitter"
            size={30}
            color={theme.color.primary}
          />
        </View>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpLink}>
        <Text>
          Don't have an account?{" "}
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
    input: {
      width: "100%",
      gap: 5,
    },
    logo: {
      width: "80%",
      height: 80,
      marginBottom: 10,
    },
    greetings: {
      fontSize: theme.fontSizes.xl,
      fontFamily: theme.typography.regular,
      marginBottom: 24, // Space between greetings and inputs
    },
    signUpLink: {
      marginTop: 20,
    },
    signUpText: {
      textDecorationLine: "underline",
      color: theme.color.primary,
    },
    socialLoginWrapper: {
      width: "100%",
      marginTop: 32,
      alignItems: "center",
    },
    divider: {
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: theme.color.primary,
      marginBottom: 16, // Space after divider
    },
    dividerWrapper: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      width: "100%",
    },
    orText: {
      flex: 0,
      fontSize: theme.fontSizes.sm,
      color: theme.color.text,
      marginBottom: 16,
    },
    socialIcons: {
      flexDirection: "row",
      gap: 32,
    },
  });
