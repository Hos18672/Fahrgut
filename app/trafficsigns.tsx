import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { Input, Text, Icon } from "react-native-elements";
import trafficSigns from "./assets/traffic_signs/traffic_signs.json";
import i18n from "i18next";
import { blueColor, bgColor } from "./assets/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import { TrafficSign } from "./types";
import { initI18n } from "./services/initI18n";
initI18n();

const TrafficSignsScreen = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [imageAssets, setImageAssets] = useState<{ [key: string]: string }>({});
  const [visibleSigns, setVisibleSigns] = useState<TrafficSign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSign, setSelectedSign] = useState<TrafficSign | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const fetchImageUrls = async (signs: TrafficSign[]) => {
    const assets: { [key: string]: string } = {};
    try {
      for (const sign of signs) {
        let imagUrl = `https://osfxlrmxaifoehvxztqv.supabase.co/storage/v1/object/public/traffic_signs/${sign.filename}`;
        assets[sign.filename] = imagUrl;
        console.log("Signed URL:", imagUrl);
      }
    } catch (error) {
      console.error("Error fetching image URLs:", error);
      setError("Failed to load images. Please check your internet connection.");
    }
    return assets;
  };

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
  }, []);

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
  }, [searchValue]);

  const handleOpenTrafficSign = (sign: TrafficSign) => {
    setSelectedSign(sign);
    setIsModalVisible(true);
  };

  const handlePreviousSign = () => {
    if (selectedSign) {
      const currentIndex = visibleSigns.findIndex(
        (sign) => sign.filename === selectedSign.filename
      );
      if (currentIndex > 0) {
        setSelectedSign(visibleSigns[currentIndex - 1]);
      }
    }
  };

  const handleNextSign = () => {
    if (selectedSign) {
      const currentIndex = visibleSigns.findIndex(
        (sign) => sign.filename === selectedSign.filename
      );
      if (currentIndex < visibleSigns.length - 1) {
        setSelectedSign(visibleSigns[currentIndex + 1]);
      }
    }
  };

  const renderTrafficSign = useCallback(
    ({ item }: { item: TrafficSign }) => {
      const imageUri = imageAssets[item.filename];

      return (
        <TouchableOpacity
          style={styles.signContainer}
          onPress={() => handleOpenTrafficSign(item)}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.signImage}
              onError={() => console.error("Error loading image:", imageUri)}
            />
          ) : (
            <ActivityIndicator size="small" color={blueColor} />
          )}
          <View style={styles.signTitleContainer}>
            <Text style={styles.signTitle}>
              {item.title ? item.title.split(":")[1] : "No Title"}
            </Text>
            <Text style={styles.signTitleFa}>
              {item.title_fa ? item.title_fa.split(":")[1] : "No Title (FA)"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [imageAssets]
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && (
        <CustomHeader title="Traffic Signs" showBackButton={true} />
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
          <Text style={styles.errorText}>No traffic signs found.</Text>
        </View>
      )}

      <FlatList
        data={visibleSigns}
        keyExtractor={(item) => item.title}
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
                <Text style={styles.modalTitle}>
                  {selectedSign.title
                    ? selectedSign.title.split(":")[1]
                    : "No Title"}
                </Text>
                <Text style={styles.modalTitleFa}>
                  {selectedSign.title_fa
                    ? selectedSign.title_fa.split(":")[1]
                    : "No Title (FA)"}
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
                      ) ===
                      visibleSigns.length - 1
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
    backgroundColor: bgColor,
  },
  searchContainer: {
    marginBottom: 0,
    height: 50,
  },
  searchInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderBottomWidth: 0,
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
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: Platform.OS !== "web" ? "30%" : 20,
  },
  signContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    height: "80%",
    width: "80%",
    maxWidth: Math.min(Platform.OS == "web" ? "60%" : "95%"),
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalImage: {
    height: "50%",
    width: "50%",
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
    width: Math.min(Platform.OS == "web" ? 400 : "95%"),
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
    width: Platform.OS == "web" ? 400 : "95%",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
});

export default TrafficSignsScreen;
