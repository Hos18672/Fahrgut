import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { Input, Text, Icon } from "react-native-elements"; // Correct import
import { useRouter } from "expo-router"; // Use Expo Router
import trafficSigns from "./assets/traffic_signs/traffic_signs.json";
import { getStorage, ref, getDownloadURL } from "firebase/storage"; // Firebase Storage imports
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization"; // Use expo-localization
import { resources } from "./assets/translations";
import { lightblueColor, blueColor } from "./assets/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale, // Use expo-localization
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Define the type for a traffic sign
interface TrafficSign {
  filename: string;
  title: string;
  title_fa: string;
}

const TrafficSignsScreen = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [imageAssets, setImageAssets] = useState<{ [key: string]: string }>({});
  const [visibleSigns, setVisibleSigns] = useState<TrafficSign[]>([]); // For visible signs
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for image fetching
  const [lastIndex, setLastIndex] = useState<number>(0); // Index of the last loaded image
  const { width } = useWindowDimensions();
  const router = useRouter(); // Use Expo Router
  const insets = useSafeAreaInsets();
  const storage = getStorage(); // Initialize Firebase Storage
  const screenWidth = Dimensions.get("window").width;
  const SIGNS_BATCH_SIZE = 10; // Number of signs to load in each batch

  // Fetch image URLs for the given batch of signs
  const fetchImageUrls = async (startIndex: number, batchSize: number) => {
    const assets: { [key: string]: string } = {};
    const endIndex = Math.min(startIndex + batchSize, trafficSigns.length); // Ensure we don't exceed the list

    for (let i = startIndex; i < endIndex; i++) {
      const sign = trafficSigns[i];
      try {
        // Reference to the image in Firebase Storage
        const imageRef = ref(storage, `traffic_signs/${sign.filename}`);
        // Get the download URL
        const imageUrl = await getDownloadURL(imageRef);
        assets[sign.filename] = imageUrl;
      } catch (error) {
        console.error("Error fetching image URL: ", error);
      }
    }
    return assets;
  };

  // Load the first 10 signs when the component mounts
  useEffect(() => {
    const loadInitialSigns = async () => {
      setIsLoading(true);
      const initialAssets = await fetchImageUrls(0, SIGNS_BATCH_SIZE);
      setImageAssets(initialAssets);
      setVisibleSigns(trafficSigns.slice(0, SIGNS_BATCH_SIZE)); // Show the first batch of signs
      setLastIndex(SIGNS_BATCH_SIZE);
      setIsLoading(false);
    };

    loadInitialSigns();
  }, []);

  // Handle loading more signs when reaching the end of the list
  const loadMoreSigns = async () => {
    if (isLoading || lastIndex >= trafficSigns.length) return; // Don't load if already loading or no more signs

    setIsLoading(true);
    const nextBatchAssets = await fetchImageUrls(lastIndex, SIGNS_BATCH_SIZE);
    setImageAssets((prevAssets) => ({ ...prevAssets, ...nextBatchAssets }));
    setVisibleSigns((prevSigns) => [
      ...prevSigns,
      ...trafficSigns.slice(lastIndex, lastIndex + SIGNS_BATCH_SIZE),
    ]);
    setLastIndex(lastIndex + SIGNS_BATCH_SIZE);
    setIsLoading(false);
  };

  // Handle opening a traffic sign
  const handleOpenTrafficSign = (sign: TrafficSign) => {
    router.push({
      pathname: "/traffic_sign_detail",
      params: { sign: JSON.stringify(sign) },
    });
  };

  // Render a traffic sign item
  const renderTrafficSign = useCallback(
    ({ item }: { item: TrafficSign }) => {
      const imageUri = imageAssets[item.filename]; // Get image URL from Firebase Storage

      return (
        <TouchableOpacity
          style={styles.signContainer}
          onPress={() => handleOpenTrafficSign(item)}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.signImage} />
          ) : (
            <Text>Loading image...</Text> // Placeholder while the image loads
          )}
          <View style={styles.signTitleContainer}>
            <Text style={styles.signTitle}>{item.title.split(":")[1]}</Text>
            <Text style={styles.signTitle}>{item.title_fa.split(":")[1]}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [imageAssets]
  );

  // Filter signs based on search value
  const filteredSigns = visibleSigns.filter((sign) =>
    sign.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Loading icon component
  const loadingIcon = () => {
    return (
      <View
        style={{
          display: "flex",
          alignContent: "center",
          alignItems: "center",
          gap: 5,
        }}
      >
        <ActivityIndicator size="large" color={blueColor} />
      </View>
    );
  };

  return (
   <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <CustomHeader title="Traffic Signs" showBackButton={true} />
      <Input
        placeholder={i18n.t("Suchen")}
        value={searchValue}
        onChangeText={setSearchValue}
        leftIcon={<Icon name="search" type="material" color="#517fa4" />}
        containerStyle={styles.searchContainer}
        inputContainerStyle={
          screenWidth >= 768 ? styles.searchInputContainer : styles.smSearchInputContainer
        }
      />

      <FlatList
        data={filteredSigns}
        keyExtractor={(item) => item.title}
        renderItem={renderTrafficSign}
        onEndReached={loadMoreSigns} // Trigger when reaching the end of the list
        onEndReachedThreshold={0.5} // Trigger when 50% of the list is scrolled
        ListFooterComponent={isLoading ? loadingIcon : null} // Show loader
        contentContainerStyle={
          screenWidth >= 768 ? styles.listContainer : styles.smListContainer
        }
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
  searchContainer: {
    paddingHorizontal: 0,
    alignSelf: "center",
    width: "95%",
    height: 55,
    marginTop: 5
  },
  searchInputContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    width: "75%",
    alignSelf: "center",
  },
  smSearchInputContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    width: "95%",
    alignSelf: "center",
  },
  listContainer: {
    alignSelf: "center",
    width: "70%",
    paddingTop: 1,
  },
  smListContainer: {
    alignSelf: "center",
    width: "90%",
    paddingTop: 1,
  },
  signContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 5,
    padding: 10,
    gap: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  signTitleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  signTitle: {
    fontSize: 16,
    textAlign: "left",
    maxWidth: "100%",
    overflow: "hidden",
    numberOfLines: 2, // Ensures truncation for long text
    ellipsizeMode: "tail", // Adds ellipses for overflow text
  },
});

export default TrafficSignsScreen;