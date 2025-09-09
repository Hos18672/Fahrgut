import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  TouchableOpacity,
  Text,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import ImageViewer from "react-native-image-zoom-viewer";

const ResponsiveQuizImage = ({ imageURL, maxWidth = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const imageContainerRef = useRef(null);
  const [imageLayout, setImageLayout] = useState(null);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const targetWidth = screenWidth * 0.95;
  const targetHeight = screenHeight * 0.8;

  const handleImageLayout = () => {
    if (imageContainerRef.current && imageContainerRef.current.measure) {
      imageContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setImageLayout({ x: pageX, y: pageY, width, height });
      });
    }
  };

  const handleOpen = () => {
    if (!imageLayout) return;
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const imageWidth = Math.min(screenWidth * 0.86, maxWidth || 450);
  const imageHeight = (imageWidth * 2) / 3;

  if (!imageURL || imageLoadFailed) {
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.imageContainerMain}>
      {!imageLoaded && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="large"
          color="#0000ff"
        />
      )}

      <TouchableOpacity
        onPress={handleOpen}
        onLayout={handleImageLayout}
        style={[styles.imageContainer, { width: imageWidth, height: imageHeight }]}
        ref={imageContainerRef}
      >
        <Image
          source={{ uri: imageURL }}
          style={styles.questionImage}
          contentFit="contain"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoadFailed(true)}
        />
      </TouchableOpacity>

      {modalVisible && (
        <Modal transparent animationType="fade" onRequestClose={handleClose}>
          <View style={styles.modalContainer}>
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <ImageViewer
              imageUrls={[{ url: imageURL }]}
              enableSwipeDown
              isPinchEnabled
              onSwipeDown={handleClose}
              style={{ width: targetWidth, height: targetHeight }}
              backgroundColor="transparent"
              renderIndicator={() => null} // Hide default indicators
            />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainerMain: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  loadingIndicator: {
    position: "absolute",
  },
  emptyContainer: {
    height: 10,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "bold",
    lineHeight: 44,
    textAlign: "center",
  },
});

export default ResponsiveQuizImage;