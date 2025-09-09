import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions, Modal, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const ResponsiveQuizImage = ({ imageURL, maxWidth = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Animation values for pinch-to-zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    setImageLoaded(false);
    setImageLoadFailed(false);
    // Reset zoom when image changes
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [imageURL]);

  // Pinch gesture handler
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture handler for moving the image when zoomed
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX / scale.value;
        translateY.value = savedTranslateY.value + event.translationY / scale.value;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Reset zoom on double tap
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Combine gestures
  const composedGestures = Gesture.Simultaneous(pinchGesture, panGesture);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const imageWidth = Math.min(screenWidth * 0.86, maxWidth || 450);
  const imageHeight = (imageWidth * 2) / 3;

  // Early return after all hooks are called
  if (!imageURL || imageLoadFailed) {
    return <View style={styles.emptyContainer} />;
  }

  return (
    <View style={styles.imageContainerMain}>
      {!imageLoaded && (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
      )}
      <TouchableOpacity
        onPress={() => setIsZoomed(true)}
        style={[styles.imageContainer, { width: imageWidth, height: imageHeight }]}
      >
        <Image
          source={{ uri: imageURL }}
          style={styles.questionImage}
          contentFit="contain"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoadFailed(true)}
        />
      </TouchableOpacity>

      {/* Full-screen zoom modal */}
      <Modal
        visible={isZoomed}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsZoomed(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsZoomed(false)}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <GestureDetector gesture={Gesture.Race(composedGestures, doubleTap)}>
            <Animated.View
              style={[
                styles.zoomedImageContainer,
                { width: screenWidth * 0.95, height: screenHeight * 0.8 },
                animatedStyle,
              ]}
            >
              <Image
                source={{ uri: imageURL }}
                style={styles.zoomedImage}
                contentFit="contain"
                enableLiveTextInteraction={false} // Ensure no interference with gestures
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
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
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12, // Rounded corners for the normal image
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
    backgroundColor: "rgba(0, 0, 0, 0.85)", // Dark background for modal
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  zoomedImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensure rounded corners are clipped
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16, // Rounded corners for zoomed image
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
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "bold",
    lineHeight: 44, // Center vertically
    textAlign: "center",
  },
});

export default ResponsiveQuizImage;