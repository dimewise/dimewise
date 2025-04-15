import { ProfileOptionsList } from "@/components/profile/ProfileOptionsList";
import type { OptionListItem } from "@/components/types";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { router } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const theme = useAppTheme();
  const { logout } = useAuth();
  const gstyles = useMakeGlobalStyles(theme);

  /* User Profile */
  const profileOptions: OptionListItem[] = [
    {
      startIcon: "account-edit",
      title: "Edit Profile (WIP)",
    },
  ];

  /* User Preference */
  const preferencesOptions: OptionListItem[] = [
    {
      startIcon: "palette",
      title: "Theme Selection (WIP)",
    },
    {
      startIcon: "translate",
      title: "Language (WIP)",
    },
    {
      startIcon: "bell-ring",
      title: "Notification (WIP)",
    },
  ];

  /* Customer Support/Legal */
  const supportOptions: OptionListItem[] = [
    {
      startIcon: "help-circle",
      title: "Help Center (WIP)",
    },
    {
      startIcon: "chat-question",
      title: "Contact Support (WIP)",
    },
    {
      startIcon: "lock-check",
      title: "Privacy Policy (WIP)",
    },
    {
      startIcon: "file-certificate",
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
      startIcon: "logout",
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
          <Avatar.Image
            size={160}
            source={require("@/assets/images/background-image.png")}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 3,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: theme.fonts.displaySmall.fontSize,
                fontWeight: "bold",
              }}
            >
              Dimewise
            </Text>
            <Text
              style={{
                fontSize: theme.fonts.bodyMedium.fontSize,
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
