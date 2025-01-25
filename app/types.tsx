// Define the type for a traffic sign
export interface TrafficSign {
  filename: string;
  title: string;
  title_fa: string;
}

export interface WordItem {
  word: string;
  translation: string;
}

// Define types for the component props
export interface ExamResultScreenProps {
  examAnsweredQuestions: Array<{
    question: {
      question_text: string;
      question_text_fa: string;
      category:string;
      question_number: string;
      correct_answers: string[];
      correct_answers_fa: string[];
    };
    userAnswers: string[];
  }>;
}

// Define types for the component state
export interface WrongAnswer {
  question_text: string;
  question_number: string;
  correctAnswers: string[];
}
export interface CorrectAnswer {
  question_text: string;
  question_number: string;
  correctAnswers: string[];
}


export interface CustomTabProps {
  title: string;
  active: boolean;
  onPress: () => void;
}


export  interface SubCategoryItemProps {
  item: { category: string; questions: any[] };
  onPress: () => void;
}


// Define types for route parameters
export interface QuizScreenParams {
  isExam?: boolean;
  category?: string;
  subCategoryQuestions?: any[];
  BookmarkedQuestions?: any[];
}

// Define types for the component state
export interface Question {
  question_number: string;
  question_text: string;
  question_text_fa: string;
  answers: string[];
  answers_fa: string[];
  correct_answers: string[];
}