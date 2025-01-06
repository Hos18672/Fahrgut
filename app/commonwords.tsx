import React, { useState, useEffect } from "react";
import {
  StatusBar,
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
import CustomHeader from "./components/CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { WordItem } from "./types";
import CustomBottomNav from "./components/CustomNavBar";
import { bgColor } from "./assets/colors";
initI18n();

const WordsScreen: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredWords, setFilteredWords] = useState<WordItem[]>([]);
  const router = useRouter(); // Expo Router's navigation hook
  const screenWidth = Dimensions.get("window").width;
  const insets = useSafeAreaInsets();

  // Load words into an array when component mounts
  useEffect(() => {
    const wordsArray = Object.keys(wordsData).reduce<WordItem[]>(
      (result, key) => {
        if (!key.endsWith("_fa")) {
          result.push({
            word: wordsData[key],
            translation: wordsData[`${key}_fa`],
          });
        }
        return result;
      },
      []
    );
    setFilteredWords(wordsArray);
  }, []);

  // Function to filter words based on the search value
  const handleSearch = (text: string) => {
    const seenWords = new Set<string>(); // Use a Set to track processed words and prevent duplicates

    const filtered = Object.keys(wordsData).reduce<WordItem[]>(
      (result, key) => {
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
      },
      []
    );

    setFilteredWords(filtered);
  };

  // Call handleSearch whenever searchValue changes
  useEffect(() => {
    handleSearch(searchValue);
  }, [searchValue]);

  // Render each word and its translation
  const renderWord: ListRenderItem<WordItem> = ({ item }) => (
    <View style={styles.wordContainer}>
      <Text style={styles.word}>{item.word}</Text>
      <Text style={styles.translation}>{item.translation}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && <CustomHeader title="Words" showBackButton={true} />}
      <View style={styles.searchContainer}>
        <Input
          placeholder={i18n.t("Suchen")}
          value={searchValue}
          onChangeText={setSearchValue}
          inputContainerStyle={styles.searchInputContainer}
          leftIcon={<Icon name="search" type="material" color="#999" />}
        />
      </View>

      <FlatList
        data={filteredWords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderWord}
        contentContainerStyle={
          screenWidth >= 768 ? styles.listContainer : styles.smListContainer
        }
      />
        {Platform.OS !== "web" && <CustomBottomNav screenName={"commonwords"} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 10 : 5,
    backgroundColor: bgColor,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 20,
  },
  searchContainer: {
    marginTop: 10,
    marginBottom: 0,
    height: 50,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderBottomWidth: 0, // Remove the default underline
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
      },
    }),
  },
  listContainer: {
    alignSelf: "center",
    width: "98%",
    paddingTop: 5,
  },
  smListContainer: {
    alignSelf: "center",
    width: "95%",
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
