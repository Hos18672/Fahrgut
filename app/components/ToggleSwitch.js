import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const ToggleSwitch = ({ label, value, onValueChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? '#f4f3f4' : '#f4f3f4'} // iOS default
        trackColor={{ false: '#767577', true: '#81b0ff' }} // Customize colors
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 10
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});

export default ToggleSwitch;
