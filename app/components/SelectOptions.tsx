import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Image,
  ImageSourcePropType,
} from "react-native";

// Define the type for an option
interface Option {
  value: string;
  label: string;
  flag: ImageSourcePropType;
}

// Define the props for the SelectOption component
interface SelectOptionProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

// Define the type for the flags object
interface Flags {
  [key: string]: { name: string; url: ImageSourcePropType };
}

const SelectOption: React.FC<SelectOptionProps> = ({
  options,
  selectedValue,
  onValueChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectOption = (item: Option) => {
    onValueChange(item.value);
    setIsModalVisible(false);
  };

  const flags: Flags = {
    de: { name: "At", url: require("../assets/at.png") },
    en: { name: "En", url: require("../assets/us.png") },
    fa: { name: "Fa", url: require("../assets/ir.png") },
  };

  return (
    <View style={styles.container}>
      {/* Selected Option Button */}
      <TouchableOpacity
        style={styles.selectedButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Image source={flags[selectedValue].url} style={styles.flag} />
      </TouchableOpacity>

      {/* Modal for displaying options */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={options}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelectOption(item)}
                >
                  <Image source={item.flag} style={styles.flag} />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    padding: 5,
    marginRight: 10,
    borderRadius: 5,
  },
  selectedText: {
    display: "flex",
    alignItems: "center",
    color: "#000",
    fontSize: 16,
    gap: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: 300,
    padding: 20,
    borderRadius: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  flag: {
    width: 35,
    height: 20,
    marginRight: 10,
    borderRadius: 2,
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#FF0000",
    borderRadius: 5,
    marginTop: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default SelectOption;