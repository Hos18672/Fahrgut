import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { Image } from "expo-image";

const ResponsiveQuizImage = ({ imageURL, maxWidth = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageLoadFailed(false);
  }, [imageURL]);

  if (!imageURL || imageLoadFailed) {
    return <View style={styles.emptyContainer} />;
  }

  const screenWidth = Dimensions.get("window").width;
  const imageWidth = Math.min(screenWidth * 0.86, maxWidth || 450);
  const imageHeight = (imageWidth * 2) / 3;

  return (
    <View style={styles.imageContainerMain}>
      {!imageLoaded && (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#0000ff" />
      )}
      <View style={[styles.imageContainer, { width: imageWidth, height: imageHeight }]}>  
        <Image
          source={{ uri: imageURL }}
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
  emptyContainer: {
    height: 10,
    width: "100%",
  },
});

export default ResponsiveQuizImage;