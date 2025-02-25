import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import placeholderImage from "../assets/icon/image.png"; // Ensure this path is correct

const ResponsiveQuizImage = ({ imageURL, maxWidth = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Reset states when imageURL changes
  useEffect(() => {
    setImageLoaded(false);
    setImageLoadFailed(false);
  }, [imageURL]);

  // Get screen dimensions
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = Math.min(screenWidth * 0.86, maxWidth || 450);
  const imageHeight = (imageWidth * 2) / 3; // Maintain 3:2 aspect ratio

  return (
    <View style={styles.imageContainerMain}>
      {/* Show loading indicator while the image is loading */}
      {imageURL && !imageLoaded && !imageLoadFailed && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size="large"
          color="#0000ff"
        />
      )}

      {/* Show the image if available */}
      <View style={[styles.imageContainer, { width: imageWidth, height: imageHeight }]}>  
        <Image
          source={imageLoadFailed || !imageURL ? placeholderImage : { uri: imageURL }}
          style={styles.questionImage}
          contentFit="contain"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoadFailed(true)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainerMain: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  questionImage: {
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
  },
});

export default ResponsiveQuizImage;
