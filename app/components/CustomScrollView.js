import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const CustomScrollView = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true} // Set to true to show the scrollbar
        scrollIndicatorInsets={{ right: 1 }} // Optional: Control padding for the scrollbar
      >
        {/* Your content goes here */}
        {Array.from({ length: 30 }, (_, index) => (
          <Text
            key={index}
            style={[
              styles.text,
              index === 0 && styles.firstItemMargin, // Apply margin only to the first item
            ]}
          >
            Item {index + 1}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the parent container takes up the full screen
  },
  contentContainer: {
    paddingHorizontal: 20, // Only horizontal padding to avoid interference with marginTop
  },
  text: {
    fontSize: 18,
    marginVertical: 10, // Default margin for all items
  },
  firstItemMargin: {
    marginLeft: 30, // Add a top margin only for the first item
  },
});

export default CustomScrollView;