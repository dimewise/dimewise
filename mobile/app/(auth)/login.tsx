import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/store";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, AppState, StyleSheet, Text, View } from "react-native";

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
  const { loginWithPassword, register } = useAuth();
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

  async function signUpWithEmail() {
    await register({
      email: email,
      password: password,
    });

    if (session.error) Alert.alert(session.error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
  }

  return (
    <View style={styles.container}>
      {session.loading && <Text>Loading...</Text>}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          theme="primary"
          label="Sign in"
          disabled={session.loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          theme="primary"
          label="Sign up"
          disabled={session.loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
