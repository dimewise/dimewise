import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { useAppSelector } from "@/store/store";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { type MD3Theme, useTheme } from "react-native-paper";
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
  const [signupComplete, setSignupComplete] = useState(false);

  const signUpWithEmail = async () => {
    if (password === confirmPassword) {
      const { data, error: registerErr } = await register({
        email: email,
        password: password,
      });

      // on error, show an alert
      if (registerErr) Alert.alert(registerErr.message);
      // on success, show success message and redirect button
      if (data) setSignupComplete(true);
    } else {
      Alert.alert("Password does not match");
    }
  };

  const handleComplete = () => {
    router.navigate("/login");

    setTimeout(() => setSignupComplete(false), 500);
  };

  return (
    <SafeAreaView style={gstyles.container}>
      <Image
        style={styles.logo}
        source={require("../../assets/logo/logo_full_colored.svg")}
        contentFit="contain"
      />
      <Text style={styles.greetings}>Sign Up</Text>
      {session.loading ? (
        <Text>Loading...</Text>
      ) : signupComplete ? (
        <>
          <Text>Please check your inbox for email verification!</Text>
          <Button
            color="primary"
            label="Go to Login"
            onPress={handleComplete}
          />
        </>
      ) : (
        <>
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
                href={"/login"}
              >
                Sign In
              </Link>
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyle = (theme: MD3Theme) =>
  StyleSheet.create({
    input: {
      width: "100%",
    },
    logo: {
      width: "100%",
      height: 60,
    },
    greetings: {
      fontSize: theme.fonts.headlineLarge.fontSize,
    },
    signUpText: {
      textDecorationLine: "underline",
    },
  });
