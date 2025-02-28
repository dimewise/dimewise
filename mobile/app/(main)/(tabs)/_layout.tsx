import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.text,
        tabBarStyle: {
          backgroundColor: theme.color.background,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={
                focused
                  ? "file-document-multiple"
                  : "file-document-multiple-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name={focused ? "user" : "user-o"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
