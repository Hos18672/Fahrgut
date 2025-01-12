import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

const CustomScrollView = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true} // Show the scrollbar
        scrollIndicatorInsets={{ right: 1 }} // Optional: Control padding for the scrollbar
      >
        {Array.from({ length: 30 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.itemContainer,
              index === 0 && styles.firstItemMargin, // Apply margin only to the first item
            ]}
          >
            <Text style={styles.text}>
              Item {index + 1}
            </Text>
          </View>
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
    paddingHorizontal: 20, // Horizontal padding for the ScrollView content
  },
  itemContainer: {
    marginVertical: 10, // Default vertical margin for all items
  },
  firstItemMargin: {
    marginLeft: 10, // Add a left margin only for the first item
  },
  text: {
    fontSize: 18,
  },
});

export default CustomScrollView;