
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { supabase } from "./supabase"; // Import Supabase client

export const AllQuestions = async () => {
  try {
    // Fetch all questions from Supabase
    const { data: allQuestions, error } = await supabase
      .from("question")
      .select("*");

    if (error) throw error;

    // Shuffle the questions array to return them in a random order
    const shuffledQuestions = shuffleArray(allQuestions);

    return shuffledQuestions;
  } catch (err) {
    console.error("Error fetching all questions:", err.message);
    return []; // Return an empty array in case of error
  }
};
// Helper function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};


export const GetRandomQuestions = async (selectedTypes) => {
  try {
    console.log(selectedTypes)
    // Fetch all questions from Supabase
    const { data: allQuestions, error } = await supabase
      .from("question")
      .select("*").in("type", selectedTypes);

    if (error) throw error;

    // Group questions by category
    const categories = {};
    allQuestions.forEach((question) => {
      if (!categories[question.category]) {
        categories[question.category] = [];
      }
      categories[question.category].push(question);
    });

    // Select one random question from each category
    const selectedQuestions = Object.values(categories).map(
      (categoryQuestions) => {
        const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
        return categoryQuestions[randomIndex];
      }
    );

    // Filter out the selected questions to get the remaining questions
    const remainingQuestions = allQuestions.filter(
      (question) => !selectedQuestions.includes(question)
    );

    // Calculate how many more questions are needed to reach 30
    const remainingCount = Math.min(
      30 - selectedQuestions.length,
      remainingQuestions.length
    );

    // Select random questions from the remaining pool
    const additionalQuestions = remainingQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, remainingCount);

    // Combine the selected and additional questions
    return [...selectedQuestions, ...additionalQuestions];
  } catch (err) {
    console.error("Error fetching random questions:", err.message);
    return []; // Return an empty array in case of error
  }
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
   // { label: "English", value: "en", flag: require("../assets/us.png") },
    { label: "Deutsch", value: "de", flag: require("../assets/icon/at.png") },
    { label: "Persisch", value: "fa", flag: require("../assets/icon/ir.png") },
  ];


  


