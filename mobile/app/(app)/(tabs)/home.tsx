import type { ImageSource } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { Button } from "@/components/Button";
import { CircleButton } from "@/components/CircleButton";
import { EmojiList } from "@/components/EmojiList";
import { EmojiPicker } from "@/components/EmojiPicker";
import { EmojiSticker } from "@/components/EmojiSticker";
import { IconButton } from "@/components/IconButton";
import { ImageViewer } from "@/components/ImageViewer";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useMakeGlobalStyles } from "@/hooks/useMakeGlobalStyles";
import { useAppSelector } from "@/store/store";
import type { Theme } from "@/style/theme";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const theme = useTheme();
  const gstyles = useMakeGlobalStyles(theme);
  const styles = makeStyle(theme);
  const { logout } = useAuth();
  const session = useAppSelector((state) => state.session);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined,
  );
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSource | undefined>(
    undefined,
  );

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert("You did not select any image.");
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    // we will implement this later
  };

  const onSignout = async () => {
    const { error: logoutErr } = await logout();

    if (logoutErr) Alert.alert(logoutErr.message);
    router.replace("/login");
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={gstyles.safeAreaContainer}
    >
      <View style={gstyles.container}>
        <Button
          onPress={onSignout}
          label="Sign Out"
          color="primary"
        />
        <View style={styles.imageContainer}>
          <ImageViewer
            imgSource={require("@/assets/images/background-image.png")}
            selectedImage={selectedImage}
          />
          {pickedEmoji && (
            <EmojiSticker
              imageSize={40}
              stickerSource={pickedEmoji}
            />
          )}
        </View>
        {showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton
                icon="refresh"
                label="Reset"
                onPress={onReset}
              />
              <CircleButton onPress={onAddSticker} />
              <IconButton
                icon="save-alt"
                label="Save"
                onPress={onSaveImageAsync}
              />
            </View>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button
              color="primary"
              label="Choose a photo"
              onPress={pickImageAsync}
            />
            <Button
              label="Use this photo"
              onPress={() => setShowAppOptions(true)}
            />
          </View>
        )}
        <EmojiPicker
          isVisible={isModalVisible}
          onClose={onModalClose}
        >
          <EmojiList
            onSelect={setPickedEmoji}
            onCloseModal={onModalClose}
          />
        </EmojiPicker>
      </View>
    </SafeAreaView>
  );
}

const makeStyle = (_: Theme) =>
  StyleSheet.create({
    imageContainer: {
      flex: 1,
    },
    footerContainer: {
      flex: 1 / 3,
      alignItems: "center",
    },
    optionsContainer: {
      position: "absolute",
      bottom: 80,
    },
    optionsRow: {
      alignItems: "center",
      flexDirection: "row",
    },
  });
