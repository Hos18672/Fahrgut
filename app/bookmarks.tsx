import React, { useEffect, useState } from "react";
import {
  StatusBar,
  Text,
  View,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the trash icon
import { bgColor } from "./assets/colors";
import { createClient } from "@supabase/supabase-js";
import CustomHeader from "./components/CustomHeader";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(`${supabaseUrl}`, `${supabaseKey}`);

const BookmarksScreen = () => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase.from("bookmarks").select("*");
    if (error) {
      console.error("Error fetching bookmarks:", error);
    } else {
      setBookmarks(data);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("bookmarks").delete().match({ id });

    if (error) {
      console.error("Error deleting bookmark:", error);
    } else {
      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    }
  };

  const renderRightActions = (progress, dragX, id) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.deleteContainer,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleDelete(id)}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
        {Platform.OS === "web" && (
          <CustomHeader title="Bookmarks" showBackButton={true} />
        )}
        <ScrollView style={styles.list}>
          {bookmarks.map((bookmark) => (
            <Swipeable
              key={bookmark.id}
              renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, bookmark.id)
              }
              onSwipeableWillOpen={() => handleDelete(bookmark.id)} // Delete on full swipe
              overshootRight={false}
            >
              <View style={styles.item}>
                <Text style={styles.title}>{bookmark.question_nr}</Text>
                <Ionicons name="bookmark-outline" size={24} color="gray" />
              </View>
            </Swipeable>
          ))}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    flex: 1,
  },
  list: {
    marginTop: 30,
    marginBottom: "20%",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
  },
  title: {
    fontSize: 18,
    color: "#333",
  },
  deleteContainer: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "76%",
    marginHorizontal: 10,
    borderRadius: 12,
    marginVertical: 8,
  },
});

export default BookmarksScreen;