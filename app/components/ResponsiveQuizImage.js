import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, Dimensions, Platform } from "react-native";

const ResponsiveQuizImage = ({ imageURL }) => {
  // Calculate image container width based on screen size, with maxWidth of 500
  const imageContainerStyle = {
    width: Math.min(
      Platform.OS == "web" ? 600 : 250
    ), // Max width of 500px, with padding
    aspectRatio: 3 / 2, // Maintain 3:2 aspect ratio for the image
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 15,
  };

  return (
    <View style={styles.imageContainerMain}>
      <View style={imageURL ? imageContainerStyle : styles.noImageContainer}>
        {imageURL ? (
          <Image
            source={{ uri: imageURL }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require("../assets/image.png")}
            style={styles.placeholderImage} // Fixed placeholder image style
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainerMain: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  noImageContainer: {
    width: Math.min(Platform.OS == "web" ? 600 : 250), // Same width calculation for placeholder
    aspectRatio: 3 / 2, // Same aspect ratio as image container
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  questionImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "50%", // Adjust size of placeholder image
    height: "50%", // Maintain a smaller size for placeholder image
  },
});

export default ResponsiveQuizImage;
