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
  Modal,
  ScrollView,
} from "react-native";
import { Input, Text, Icon } from "react-native-elements";
import { useRouter } from "expo-router";
import trafficSigns from "./assets/traffic_signs/traffic_signs.json";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { resources } from "./assets/translations";
import { lightblueColor, blueColor } from "./assets/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale,
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
  const [visibleSigns, setVisibleSigns] = useState<TrafficSign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastIndex, setLastIndex] = useState<number>(0);
  const [selectedSign, setSelectedSign] = useState<TrafficSign | null>(null); // Track the selected sign for the modal
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Control modal visibility
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const storage = getStorage();
  const screenWidth = Dimensions.get("window").width;
  const SIGNS_BATCH_SIZE = 10;

  // Fetch image URLs for the given batch of signs
  const fetchImageUrls = async (startIndex: number, batchSize: number) => {
    const assets: { [key: string]: string } = {};
    const endIndex = Math.min(startIndex + batchSize, trafficSigns.length);

    for (let i = startIndex; i < endIndex; i++) {
      const sign = trafficSigns[i];
      try {
        const imageRef = ref(storage, `traffic_signs/${sign.filename}`);
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
      setVisibleSigns(trafficSigns.slice(0, SIGNS_BATCH_SIZE));
      setLastIndex(SIGNS_BATCH_SIZE);
      setIsLoading(false);
    };

    loadInitialSigns();
  }, []);

  // Handle loading more signs when reaching the end of the list
  const loadMoreSigns = async () => {
    if (isLoading || lastIndex >= trafficSigns.length) return;

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

  // Handle opening a traffic sign in a modal
  const handleOpenTrafficSign = (sign: TrafficSign) => {
    setSelectedSign(sign); // Set the selected sign
    setIsModalVisible(true); // Show the modal
  };

  // Handle navigating to the next sign
  const handleNextSign = () => {
    if (!selectedSign) return;

    const currentIndex = visibleSigns.findIndex(
      (sign) => sign.filename === selectedSign.filename
    );
    if (currentIndex < visibleSigns.length - 1) {
      setSelectedSign(visibleSigns[currentIndex + 1]);
    }
  };

  // Handle navigating to the previous sign
  const handlePreviousSign = () => {
    if (!selectedSign) return;

    const currentIndex = visibleSigns.findIndex(
      (sign) => sign.filename === selectedSign.filename
    );
    if (currentIndex > 0) {
      setSelectedSign(visibleSigns[currentIndex - 1]);
    }
  };

  // Render a traffic sign item
  const renderTrafficSign = useCallback(
    ({ item }: { item: TrafficSign }) => {
      const imageUri = imageAssets[item.filename];

      return (
        <TouchableOpacity
          style={styles.signContainer}
          onPress={() => handleOpenTrafficSign(item)}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.signImage} />
          ) : (
            <ActivityIndicator size="small" color={blueColor} />
          )}
          <View style={styles.signTitleContainer}>
            <Text style={styles.signTitle}>{item.title.split(":")[1]}</Text>
            <Text style={styles.signTitleFa}>{item.title_fa.split(":")[1]}</Text>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={blueColor} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <CustomHeader title="Traffic Signs" showBackButton={true} />
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
        data={filteredSigns}
        keyExtractor={(item) => item.title}
        renderItem={renderTrafficSign}
        onEndReached={loadMoreSigns}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading ? loadingIcon : null}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal for displaying the selected traffic sign */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedSign && (
              <>
                <Image
                  source={{ uri: imageAssets[selectedSign.filename] }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>
                  {selectedSign.title.split(":")[1]}
                </Text>
                <Text style={styles.modalTitleFa}>
                  {selectedSign.title_fa.split(":")[1]}
                </Text>
                <View style={styles.navigationButtons}>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={handlePreviousSign}
                    disabled={
                      visibleSigns.findIndex(
                        (sign) => sign.filename === selectedSign.filename
                      ) === 0
                    }
                  >
                    <Text style={styles.navButtonText}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={handleNextSign}
                    disabled={
                      visibleSigns.findIndex(
                        (sign) => sign.filename === selectedSign.filename
                      ) === visibleSigns.length - 1
                    }
                  >
                    <Text style={styles.navButtonText}>Next</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  signContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 8,
  },
  signTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  signTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  signTitleFa: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalTitleFa: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  navButton: {
    padding: 10,
    backgroundColor: blueColor,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: blueColor,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TrafficSignsScreen;