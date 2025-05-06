import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import {
  type UserCreate,
  useApiV1UsersRegisterCreateUserMutation,
} from "@/store/api/rtk/server/v1";
import { useAppSelector } from "@/store/store";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  const theme = useAppTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const { register } = useAuth();
  const session = useAppSelector((state) => state.session);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupComplete, setSignupComplete] = useState(false);
  const [registerUser] = useApiV1UsersRegisterCreateUserMutation();

  const signUpWithEmail = async () => {
    if (password === confirmPassword) {
      const { data, error: registerErr } = await register({
        email: email,
        password: password,
      });

      // on error, show an alert
      if (registerErr) Alert.alert(registerErr.message);
      // on success, show success message and redirect button
      if (data) {
        // create the user in our db as well for reference
        const supaUser = data.data.user;
        const userCreateForm: UserCreate = {
          id: supaUser?.id ?? "",
          email: supaUser?.email ?? "",
          default_currency: "JPY",
        };
        registerUser({ userCreate: userCreateForm })
          .then(() => {
            setSignupComplete(true);
          })
          .catch((err) => {
            console.error("error creating user in db", err);
          });
      }
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
        Sign Up
      </Text>

      {session.loading ? (
        <Text variant="bodyMedium">Loading...</Text>
      ) : signupComplete ? (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <Text variant="bodyLarge">
            Please check your inbox for email verification!
          </Text>
          <Button
            mode="contained"
            onPress={handleComplete}
            style={{ width: "100%", maxWidth: 150 }}
          >
            Go to Login
          </Button>
        </View>
      ) : (
        <>
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
            <TextInput
              mode="outlined"
              label="Confirm Password"
              onChangeText={(text) => setConfirmPassword(text)}
              value={confirmPassword}
              secureTextEntry={true}
              placeholder="Confirm Password"
            />
          </View>
          <Button
            mode="contained"
            disabled={session.loading}
            onPress={() => signUpWithEmail()}
            style={{ width: "100%", maxWidth: 150 }}
          >
            Sign Up
          </Button>
          <View>
            <Text variant="bodyMedium">
              Already have an account?&nbsp;
              <Link
                style={{
                  textDecorationLine: "underline",
                }}
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
