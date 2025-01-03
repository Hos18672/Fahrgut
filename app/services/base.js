import BQuestions from "../assets/Questions/B.json";
import GWQuestions from "../assets/Questions/GW.json";
import React, { useState, useEffect, useCallback } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
export const allQuestions = [...BQuestions, ...GWQuestions];

export const GetRandomQuestions = () => {
  const categories = {};
  allQuestions.forEach((question) => {
    if (!categories[question.category]) {
      categories[question.category] = [];
    }
    categories[question.category].push(question);
  });

  const selectedQuestions = Object.values(categories).map(
    (categoryQuestions) => {
      const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
      return categoryQuestions[randomIndex];
    }
  );

  const remainingQuestions = allQuestions.filter(
    (question) => !selectedQuestions.includes(question)
  );
  const remainingCount = Math.min( 30 - selectedQuestions.length, remainingQuestions.length);

  return [
    ...selectedQuestions,
    ...remainingQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount),
  ];
};



export const downloadImage = async (questionNumber) => {
    const storage = getStorage();
    if (!questionNumber) return null; // Return null if no question number
    try {
      const imageRef = ref(storage, `question_images/${questionNumber}.jpg`);
      const url = await getDownloadURL(imageRef); // Retrieve the URL
      return url; // Return the URL
    } catch (error) {
      console.error('Error downloading image:', error);
      return null; // Return null if an error occurs
    }
  };


  export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };


  export const getKeyCat = (name) => {
    if (name) {
      // Split the name into words using spaces, hyphens, commas, or slashes as delimiters
      let words = name.split(/[-,/ ]+/);
      // Capitalize the first letter of each word and join them together
      let value = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
      return value.trim();
    }
  };

  // Language options for the dropdown
  export const languageOptions = [
    { label: "English", value: "en", flag: require("../assets/us.png") },
    { label: "Deutsch", value: "de", flag: require("../assets/at.png") },
    { label: "Persisch", value: "fa", flag: require("../assets/ir.png") },
  ];