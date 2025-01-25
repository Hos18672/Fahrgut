import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StatusBar,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input, Text, Icon } from "react-native-elements";
import trafficSigns from "./assets/traffic_signs/traffic_signs.json";
import i18n from "i18next";
import { blueColor, bgColor, fontSizeNormal, fontSizeSmall } from "./assets/base/styles_assets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import { TrafficSign } from "./types";
import { initI18n } from "./services/initI18n";
initI18n();

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const TrafficSignsScreen = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [imageAssets, setImageAssets] = useState<{ [key: string]: string }>({});
  const [visibleSigns, setVisibleSigns] = useState<TrafficSign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSign, setSelectedSign] = useState<TrafficSign | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const fetchImageUrls = useCallback(async (signs: TrafficSign[]) => {
    const assets: { [key: string]: string } = {};
    try {
      for (const sign of signs) {
        let cleanedName = sign.filename
          .replace(/[Ää]/g, (match) => (match === "Ä" ? "Ae" : "ae"))
          .replace(/[Öö]/g, (match) => (match === "Ö" ? "Oe" : "oe"))
          .replace(/[Üü]/g, (match) => (match === "Ü" ? "Ue" : "ue"))
          .replace(/ß/g, "ss")
          .replace(/[:–\-_,.]/g, "")
          .replace("png", "")
          .replace(/\s+/g, "")
          .trim();
        let imageUrl = `https://osfxlrmxaifoehvxztqv.supabase.co/storage/v1/object/public/traffic_signs/${cleanedName}.png`.replace(/­/g, "");
        assets[sign.filename] = imageUrl;
      }
    } catch (error) {
      setError("Failed to load images. Please check your internet connection.");
    }
    return assets;
  }, []);

  useEffect(() => {
    const loadInitialSigns = async () => {
      setIsLoading(true);
      try {
        setVisibleSigns(trafficSigns);
        const assets = await fetchImageUrls(trafficSigns);
        setImageAssets(assets);
      } catch (error) {
        console.error("Error loading initial signs: ", error);
        setError("Failed to load traffic signs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialSigns();
  }, [fetchImageUrls]);

  useEffect(() => {
    const filterSigns = async () => {
      setIsLoading(true);
      try {
        const filteredSigns = trafficSigns.filter(
          (sign) =>
            (sign.title &&
              sign.title.toLowerCase().includes(searchValue.toLowerCase())) ||
            (sign.title_fa &&
              sign.title_fa.toLowerCase().includes(searchValue.toLowerCase()))
        );
        setVisibleSigns(filteredSigns);
        const assets = await fetchImageUrls(filteredSigns);
        setImageAssets((prevAssets) => ({ ...prevAssets, ...assets }));
      } catch (error) {
        console.error("Error filtering signs: ", error);
        setError("Failed to filter traffic signs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (searchValue) {
      filterSigns();
    } else {
      setVisibleSigns(trafficSigns);
    }
  }, [searchValue, fetchImageUrls]);

  const handleOpenTrafficSign = useCallback((sign: TrafficSign) => {
    setSelectedSign(sign);
    setIsModalVisible(true);
  }, []);

  const handlePreviousSign = useCallback(() => {
    if (selectedSign) {
      const currentIndex = visibleSigns.findIndex(
        (sign) => sign.filename === selectedSign.filename
      );
      if (currentIndex > 0) {
        setSelectedSign(visibleSigns[currentIndex - 1]);
      }
    }
  }, [selectedSign, visibleSigns]);

  const handleNextSign = useCallback(() => {
    if (selectedSign) {
      const currentIndex = visibleSigns.findIndex(
        (sign) => sign.filename === selectedSign.filename
      );
      if (currentIndex < visibleSigns.length - 1) {
        setSelectedSign(visibleSigns[currentIndex + 1]);
      }
    }
  }, [selectedSign, visibleSigns]);

  const isPreviousDisabled = useMemo(() => {
    if (!selectedSign) return true;
    const currentIndex = visibleSigns.findIndex(
      (sign) => sign.filename === selectedSign.filename
    );
    return currentIndex === 0;
  }, [selectedSign, visibleSigns]);

  const isNextDisabled = useMemo(() => {
    if (!selectedSign) return true;
    const currentIndex = visibleSigns.findIndex(
      (sign) => sign.filename === selectedSign.filename
    );
    return currentIndex === visibleSigns.length - 1;
  }, [selectedSign, visibleSigns]);

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
            <Text style={styles.signTitle}>
              {item.title ? item.title : "No Title"}
            </Text>
            <Text style={styles.signTitleFa}>
              {item.title_fa ? item.title_fa : "No Title (FA)"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [imageAssets, handleOpenTrafficSign]
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && (
        <CustomHeader title={i18n.t("trafficSigns")} showBackButton={true} />
      )}
      <View style={styles.searchContainer}>
        <Input
          placeholder={i18n.t("Suchen")}
          value={searchValue}
          onChangeText={setSearchValue}
          inputContainerStyle={styles.searchInputContainer}
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {visibleSigns.length === 0 && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{i18n.t("noTrafficSignsFound")}</Text>
        </View>
      )}

      <FlatList
        data={visibleSigns}
        keyExtractor={(item) => item.filename}
        renderItem={renderTrafficSign}
        contentContainerStyle={styles.listContainer}
      />

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
                <View>
                  <Text style={styles.modalTitle}>
                    {selectedSign.title ? selectedSign.title : i18n.t("noTitle")}
                  </Text>
                  <Text style={styles.modalTitleFa}>
                    {selectedSign.title_fa ? selectedSign.title_fa : i18n.t("noTitleFA")}
                  </Text>
                </View>
                <View>
                  <View style={styles.navigationButtons}>
                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={handlePreviousSign}
                      disabled={isPreviousDisabled}
                    >
                      <Ionicons
                        name={"arrow-back"}
                        size={20}
                        color={isPreviousDisabled ? "#ccc" : blueColor}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={handleNextSign}
                      disabled={isNextDisabled}
                    >
                      <Ionicons
                        name={"arrow-forward"}
                        size={20}
                        color={isNextDisabled ? "#ccc" : blueColor}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>{i18n.t('close')}</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: bgColor,
  },
  searchContainer: {
    marginTop: 10,
    marginBottom: 0,
    paddingHorizontal: width > 950 ? "19%" : 0,
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
    paddingHorizontal: width > 950 ? "20%" : width > 768 ? 15 : 12, // Adjusted for small screens
    paddingTop: 5,
    paddingBottom: Platform.OS !== "web" ? "30%" : 20,
  },
  signContainer: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: width > 768 ? 10 : 8, // Adjusted for small screens
    marginLeft: width > 950 ? 10 : 0,
    marginBottom: width > 768 ? 12 : 8, // Adjusted for small screens
  },
  signImage: {
    width: width > 768 ? 80 : 60, // Smaller image for small screens
    height: width > 768 ? 80 : 60, // Smaller image for small screens
    resizeMode: "contain",
    borderRadius: 8,
  },
  signTitleContainer: {
    flex: 1,
    marginLeft: width > 768 ? 16 : 12, // Adjusted for small screens
  },
  signTitle: {
    fontSize: fontSizeSmall, // Smaller font size for small screens
    fontWeight: "600",
    color: "#333",
    marginBottom: width > 768 ? 4 : 2, // Adjusted for small screens
  },
  signTitleFa: {
    fontSize: fontSizeSmall, // Smaller font size for small screens
    color: "#666",
  },
  modalContainer: {
    width: "100%",
    padding: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    display: "flex",
    justifyContent: "space-between",
    height: Platform.OS === "web" ? (width > 768 ? "80%" : "90%") : "80%", // Adjusted for small screens
    width: Platform.OS === "web" ? (width > 768 ? "70%" : "90%") : "95%", // Adjusted for small screens
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: width > 768 ? 20 : 12, // Adjusted for small screens
    alignItems: "center",
  },
  modalImage: {
    height: width > 768 ? "50%" : "40%", // Smaller image for small screens
    width: width > 768 ? "50%" : "80%", // Smaller image for small screens
    resizeMode: "contain",
    marginBottom: width > 768 ? 10 : 5, // Adjusted for small screens
    marginTop: width > 768 ? 10 : 5, // Adjusted for small screens
  },
  modalTitle: {
    fontSize: width > 768 ? 20 : 18, // Smaller font size for small screens
    fontWeight: "600",
    color: "#333",
    marginBottom: width > 768 ? 8 : 4, // Adjusted for small screens
    textAlign: "center",
  },
  modalTitleFa: {
    fontSize: fontSizeSmall, // Smaller font size for small screens
    color: "#666",
    textAlign: "center",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: Platform.OS === "web" ? (width > 768 ? 400 : "90%") : "95%", // Adjusted for small screens
    marginTop: width > 768 ? 16 : 12, // Adjusted for small screens
    gap: width > 768 ? 40 : 20, // Adjusted for small screens
  },
  navButton: {
    padding: width > 768 ? 15 : 10, // Increased padding for small screens
    backgroundColor: "white",
    borderRadius: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: blueColor,
    marginHorizontal: 0,
    alignItems: "center",
    minWidth: width > 768 ? 0 : 100, // Ensure buttons have a minimum width on small screens
  },
  navButtonText: {
    fontSize: fontSizeSmall, // Adjusted font size for small screens
    fontWeight: "600",
    color: blueColor,
  },
  closeButton: {
    marginTop: width > 768 ? 20 : 16, // Adjusted for small screens
    marginBottom: width > 768 ? 10 : 8, // Adjusted for small screens
    padding: 13, // Adjusted for small screens
    backgroundColor: blueColor,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: fontSizeSmall, // Smaller font size for small screens
    fontWeight: "600",
    color: "#fff",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: width > 768 ? 10 : 8, // Adjusted for small screens
    borderRadius: 8,
    marginTop: 10,
    marginBottom: width > 768 ? 16 : 12, // Adjusted for small screens
    marginHorizontal: width > 768 ? 16 : 12, // Adjusted for small screens
  },
  errorText: {
    color: "#c62828",
    fontSize:fontSizeSmall, // Smaller font size for small screens
    textAlign: "center",
  },
});

export default TrafficSignsScreen;