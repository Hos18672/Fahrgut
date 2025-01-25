import React from 'react';
import { View, Text, Switch, StyleSheet,Platform } from 'react-native';
import {fontSizeSmall } from "../assets/base/styles_assets";
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
    alignSelf: 'right',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 5,
    gap: 10
  },
  label: {
    width: Platform.OS === 'web' ? 200 : 150,
    fontSize: fontSizeSmall,
    color: '#333',
  },
});

export default ToggleSwitch;
