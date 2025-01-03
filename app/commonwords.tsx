import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  Dimensions,
  ListRenderItem,
} from "react-native";
import { Input, Icon } from "react-native-elements";
import { useRouter } from "expo-router"; // Expo Router's navigation hook
import wordsData from "./assets/words.json"; // Ensure the path is correct
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization"; // Replace react-native-localize
import CustomHeader from "./components/CustomHeader";
import { resources } from "./assets/translations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale, // Use expo-localization
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

interface WordItem {
  word: string;
  translation: string;
}

const WordsScreen: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredWords, setFilteredWords] = useState<WordItem[]>([]);
  const router = useRouter(); // Expo Router's navigation hook
  const screenWidth = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();
  // Load words into an array when component mounts
  useEffect(() => {
    const wordsArray = Object.keys(wordsData).reduce<WordItem[]>((result, key) => {
      if (!key.endsWith("_fa")) {
        result.push({
          word: wordsData[key],
          translation: wordsData[`${key}_fa`],
        });
      }
      return result;
    }, []);
    setFilteredWords(wordsArray);
  }, []);

  // Function to filter words based on the search value
  const handleSearch = (text: string) => {
    setSearchValue(text);

    const seenWords = new Set<string>(); // Use a Set to track processed words and prevent duplicates

    const filtered = Object.keys(wordsData).reduce<WordItem[]>((result, key) => {
      const isFaKey = key.endsWith("_fa");
      const originalKey = isFaKey ? key.replace("_fa", "") : key;
      const originalWord = wordsData[originalKey];
      const translation = wordsData[`${originalKey}_fa`];

      if (
        !seenWords.has(originalKey) &&
        (originalWord.toLowerCase().includes(text.toLowerCase()) ||
          translation?.toLowerCase().includes(text.toLowerCase()))
      ) {
        result.push({
          word: originalWord,
          translation: translation,
        });
        seenWords.add(originalKey); // Mark this word as processed
      }

      return result;
    }, []);

    setFilteredWords(filtered);
  };

  // Render each word and its translation
  const renderWord: ListRenderItem<WordItem> = ({ item }) => (
    <View style={styles.wordContainer}>
      <Text style={styles.word}>{item.word}</Text>
      <Text style={styles.translation}>{item.translation}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <CustomHeader title="Words" showBackButton={true} />
      <View style={screenWidth >= 768 ? styles.searchContainer : styles.smSearchContainer}>
        <Input
          placeholder={i18n.t("Suchen")}
          value={searchValue}
          onChangeText={handleSearch}
          leftIcon={<Icon name="search" type="material" color="#517fa4" />}
          inputContainerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredWords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderWord}
        contentContainerStyle={screenWidth >= 768 ? styles.listContainer : styles.smListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "web" ? 10 : 5,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderBottomWidth: 0, // Remove the default underline
    paddingHorizontal: 10,
  },
  listContainer: {
    alignSelf: "center",
    width: "73%",
    paddingTop: 1,
  },
  smListContainer: {
    alignSelf: "center",
    width: "90%",
    padding: 5,
  },
  wordContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  word: {
    fontSize: 18,
    color: "#333",
  },
  translation: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
});

export default WordsScreen; // Ensure the component is exported as default