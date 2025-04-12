import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { useAppSelector } from "@/store/store";
import type { Theme } from "@/style/theme";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);
  const { register } = useAuth();
  const session = useAppSelector((state) => state.session);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function signUpWithEmail() {
    if (password === confirmPassword) {
      await register({
        email: email,
        password: password,
      });

      if (session.error) Alert.alert(session.error.message);
      if (!session)
        Alert.alert("Please check your inbox for email verification!");
    } else {
      Alert.alert("Password does not match");
    }
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
        <Input
          label="Confirm Password"
          onChangeText={(text) => setConfirmPassword(text)}
          value={confirmPassword}
          secureTextEntry={true}
          placeholder="Confirm Password"
        />
      </View>
      <View>
        <Button
          color="primary"
          label="Sign Up"
          disabled={session.loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
      <View>
        <Text>
          Already have an account?&nbsp;
          <Link
            style={styles.signUpText}
            href={"/(auth)/login"}
          >
            Sign In
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
    },
    logo: {
      width: "100%",
      height: 60,
    },
    greetings: {
      fontSize: theme.fontSizes.xl,
    },
    signUpText: {
      textDecorationLine: "underline",
    },
  });
