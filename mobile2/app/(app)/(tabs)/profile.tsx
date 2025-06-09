import { ProfileOptionsList } from "@/components/profile/ProfileOptionsList";
import type { OptionListItem } from "@/components/types";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { useApiV1UsersMeDetailGetMeDetailQuery } from "@/store/api/rtk/server/v1";
import { router } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const theme = useAppTheme();
  const { logout } = useAuth();
  const gstyles = useMakeGlobalStyles(theme);

  const {
    data: meData,
    isLoading: meIsLoading,
    error: meError,
  } = useApiV1UsersMeDetailGetMeDetailQuery();

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

  if (!meData || meIsLoading || meError) {
    return <></>;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <ScrollView style={{ flex: 1 }}>
        <View
          style={[
            gstyles.container,
            {
              paddingTop: 24,
            },
          ]}
        >
          {meData.avatar_url ? (
            <Avatar.Image
              size={160}
              source={{ uri: meData.avatar_url }}
            />
          ) : (
            <Avatar.Text
              size={160}
              label={
                meData?.name
                  ? meData.name.trim().slice(0, 2).toUpperCase()
                  : meData?.email?.slice(0, 2).toUpperCase()
              }
            />
          )}
          <View
            style={{
              flex: 1,
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
              {meData?.name ?? "Dimewise"}
            </Text>
            <Text
              style={{
                fontSize: theme.fonts.bodyMedium.fontSize,
              }}
            >
              {meData?.email}
            </Text>
          </View>
          <View style={{ flex: 1, width: "100%" }}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
