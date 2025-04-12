import { ProfileOptionsList } from "@/components/ProfileOptionsList";
import type { OptionListItem } from "@/components/types";
import { useTheme } from "@/contexts/ThemeContext";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import type { Theme } from "@/style/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);

  const profileOptions: OptionListItem[] = [
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Edit Profile (WIP)",
    },
  ];
  const preferencesOptions: OptionListItem[] = [
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Theme Selection (WIP)",
    },
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Language (WIP)",
    },
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Notification (WIP)",
    },
  ];
  const supportOptions: OptionListItem[] = [
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Help Center (WIP)",
    },
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Terms & Privacy Policy (WIP)",
    },
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Contact Support (WIP)",
    },
  ];

  const logoutOption: OptionListItem[] = [
    {
      startIcon: (
        <FontAwesome
          name={"user"}
          color={"#000000"}
          size={24}
        />
      ),
      title: "Logout",
    },
  ];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView>
        <View style={[gstyles.container, styles.containerOverride]}>
          <Image
            style={styles.profilePicture}
            source={require("@/assets/images/background-image.png")}
          />
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>Dimewise</Text>
            <Text style={styles.email}>no-reply@dimewise.com</Text>
          </View>
          <ProfileOptionsList
            title="Profile"
            optionListItems={profileOptions}
          />
          <ProfileOptionsList
            title="Preferences"
            optionListItems={preferencesOptions}
          />
          <ProfileOptionsList
            title="Support"
            optionListItems={supportOptions}
          />
          <ProfileOptionsList
            title="Support"
            optionListItems={logoutOption}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyle = (theme: Theme) =>
  StyleSheet.create({
    containerOverride: {
      justifyContent: "flex-start",
      paddingTop: 24,
    },
    button: {
      color: theme.color.text,
      textDecorationLine: "underline",
    },
    profilePicture: {
      width: 150,
      height: 150,
      borderRadius: "100%",
      marginBottom: 10,
    },
    userInfoContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 5,
      marginBottom: 24,
    },
    username: {
      fontSize: theme.fontSizes.xl,
    },
    email: {
      fontSize: theme.fontSizes.sm,
      color: theme.color.secondaryText,
    },
  });
