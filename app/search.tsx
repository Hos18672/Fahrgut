import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Icon, Input } from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { Question } from "./types";
import QeustionDetails from "./questionDetails";

initI18n();

const SearchComponent = () => {
  const [searchValue, setSearchValue] = useState("");
  const [filteredItems, setFilteredItems] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('questions');
        if (storedData) {
          setAllQuestions(JSON.parse(storedData));
        }
      } catch (err) {
        console.log(err);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if(searchValue.length < 1){
      setFilteredItems([])
    }
  }, [searchValue]);

  const handleSearch = (text: string) => {
    setSearchValue(text);
    if (text.trim().length > 0) {
      const results = allQuestions.filter((q) => q?.question_text.toLowerCase().includes(text.toLowerCase()) ||  q?.question_number == text
      ).map(q => q);
      setFilteredItems(results);
      setShowResults(results.length > 0);
    } else {
      setFilteredItems([]);
      setShowResults(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder={i18n.t("Suchen")}
          value={searchValue}
          onChangeText={handleSearch}
          inputContainerStyle={[styles.searchInputContainer, filteredItems.length ? styles.searchContainerActive : {}]}
          leftIcon={<Icon name="search" type="material" color="#999" />}
          rightIcon={
            searchValue ? (
              <TouchableOpacity onPress={() => setSearchValue("")}>
                <Icon name="close" type="material" color="#999" />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
      {showResults && searchValue.length > 0 && (
          <View style={styles.overlay}>
            <FlatList
              data={filteredItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <QeustionDetails question={item}/>
              )}
            />
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "98%",
    alignSelf: "center",
    zIndex: 10,
    marginTop: 15,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    height: 40,
    paddingVertical: 5,
  },
  searchContainerActive: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInputContainer: {
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderBottomWidth: 0, 
  },
  overlay: {
    position: "absolute",
    top: 50,
    left: 0,
    alignSelf: "center",
    width: "98%",
    marginLeft: "1%",
    height: "100%",
    minHeight: "65vh",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
});

export default SearchComponent;