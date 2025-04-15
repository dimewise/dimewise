import { ProfileOptionsList } from "@/components/profile/ProfileOptionsList";
import type { OptionListItem } from "@/components/types";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const theme = useTheme();
  const { logout } = useAuth();
  const gstyles = useMakeGlobalStyles(theme);

  /* User Profile */
  const profileOptions: OptionListItem[] = [
    {
      startIcon: (
        <MaterialCommunityIcons
          name="account-edit"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Edit Profile (WIP)",
    },
  ];

  /* User Preference */
  const preferencesOptions: OptionListItem[] = [
    {
      startIcon: (
        <MaterialCommunityIcons
          name="palette"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Theme Selection (WIP)",
    },
    {
      startIcon: (
        <Ionicons
          name="language"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Language (WIP)",
    },
    {
      startIcon: (
        <Ionicons
          name="notifications"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Notification (WIP)",
    },
  ];

  /* Customer Support/Legal */
  const supportOptions: OptionListItem[] = [
    {
      startIcon: (
        <Ionicons
          name="help-circle"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Help Center (WIP)",
    },
    {
      startIcon: (
        <Ionicons
          name="chatbox-ellipses"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Contact Support (WIP)",
    },
    {
      startIcon: (
        <Ionicons
          name="lock-closed"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Privacy Policy (WIP)",
    },
    {
      startIcon: (
        <Ionicons
          name="document-text"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Terms of Service (WIP)",
    },
  ];

  /* Authentication */
  const handleLogout = async () => {
    const { error: logoutErr } = await logout();

    if (logoutErr) Alert.alert(logoutErr.message);
    router.replace("/login");
  };
  const logoutOption: OptionListItem[] = [
    {
      startIcon: (
        <MaterialCommunityIcons
          name="logout"
          color={"#000000"}
          size={24}
        />
      ),
      title: "Logout",
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView>
        <View
          style={[
            gstyles.container,
            {
              justifyContent: "flex-start",
              paddingTop: 24,
            },
          ]}
        >
          <View
            style={{
              width: 150,
              height: 150,
              overflow: "hidden",
              borderRadius: "100%",
            }}
          >
            <Image
              style={{
                width: 150,
                height: 150,
                overflow: "hidden",
                borderRadius: "100%",
              }}
              source={require("@/assets/images/background-image.png")}
            />
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 5,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: theme.fonts.headlineLarge.fontSize,
              }}
            >
              Dimewise
            </Text>
            <Text
              style={{
                fontSize: theme.fonts.bodyMedium.fontSize,
                color: theme.colors.secondary,
              }}
            >
              no-reply@dimewise.com
            </Text>
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
            title="Authentication"
            optionListItems={logoutOption}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
