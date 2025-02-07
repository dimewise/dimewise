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
import { useSession } from "@/contexts/SessionContext";
import { router } from "expo-router";

const PlaceholderImage = require("@/assets/images/background-image.png");

export default function Index() {
  const { signOut } = useSession();
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
    const { error } = await signOut();

    if (error) Alert.alert(error.message);
    router.replace("/sign-in");
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={onSignout}
        label="Sign Out"
        theme="primary"
      />
      <View style={styles.imageContainer}>
        <ImageViewer
          imgSource={PlaceholderImage}
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
            theme="primary"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
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
