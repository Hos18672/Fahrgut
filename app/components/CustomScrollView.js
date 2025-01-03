import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

const CustomScrollView = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true} // Set to true to show the scrollbar
      scrollIndicatorInsets={{ right: 1 }} // Optional: Control padding for the scrollbar
    >
      {/* Your content goes here */}
      {Array.from({ length: 30 }, (_, index) => (
        <Text key={index} style={styles.text}>
          Item {index + 1}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default CustomScrollView;
