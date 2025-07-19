export interface Question {
  id: number;
  question: string;
  correctAnswer: string;
  options: string[];
  difficulty: number;
  category: string;
}

export const QUESTIONS: Question[] = [
  // Basic Math Questions (Difficulty 1-3)
  {
    id: 1,
    question: "What is 2 + 2?",
    correctAnswer: "4",
    options: ["3", "4", "5", "6"],
    difficulty: 1,
    category: "math"
  },
  {
    id: 2,
    question: "What is 10 - 3?",
    correctAnswer: "7",
    options: ["6", "7", "8", "9"],
    difficulty: 1,
    category: "math"
  },
  {
    id: 3,
    question: "What is 5 × 3?",
    correctAnswer: "15",
    options: ["12", "15", "18", "20"],
    difficulty: 2,
    category: "math"
  },
  {
    id: 4,
    question: "What is 24 ÷ 6?",
    correctAnswer: "4",
    options: ["3", "4", "5", "6"],
    difficulty: 2,
    category: "math"
  },
  {
    id: 5,
    question: "What is 8²?",
    correctAnswer: "64",
    options: ["56", "64", "72", "81"],
    difficulty: 3,
    category: "math"
  },

  // Science Questions (Difficulty 1-4)
  {
    id: 6,
    question: "What color is the sky on a clear day?",
    correctAnswer: "Blue",
    options: ["Red", "Green", "Blue", "Yellow"],
    difficulty: 1,
    category: "science"
  },
  {
    id: 7,
    question: "How many legs does a spider have?",
    correctAnswer: "8",
    options: ["6", "7", "8", "9"],
    difficulty: 1,
    category: "science"
  },
  {
    id: 8,
    question: "What gas do plants produce during photosynthesis?",
    correctAnswer: "Oxygen",
    options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
    difficulty: 2,
    category: "science"
  },
  {
    id: 9,
    question: "What is the chemical symbol for water?",
    correctAnswer: "H2O",
    options: ["H2O", "CO2", "O2", "NaCl"],
    difficulty: 3,
    category: "science"
  },
  {
    id: 10,
    question: "What is the speed of light in vacuum?",
    correctAnswer: "299,792,458 m/s",
    options: ["299,792,458 m/s", "300,000,000 m/s", "250,000,000 m/s", "350,000,000 m/s"],
    difficulty: 4,
    category: "science"
  },

  // Geography Questions (Difficulty 1-4)
  {
    id: 11,
    question: "What is the capital of France?",
    correctAnswer: "Paris",
    options: ["London", "Berlin", "Paris", "Madrid"],
    difficulty: 1,
    category: "geography"
  },
  {
    id: 12,
    question: "Which continent is Egypt in?",
    correctAnswer: "Africa",
    options: ["Asia", "Africa", "Europe", "South America"],
    difficulty: 1,
    category: "geography"
  },
  {
    id: 13,
    question: "What is the largest ocean on Earth?",
    correctAnswer: "Pacific Ocean",
    options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"],
    difficulty: 2,
    category: "geography"
  },
  {
    id: 14,
    question: "Which mountain range contains Mount Everest?",
    correctAnswer: "Himalayas",
    options: ["Andes", "Rocky Mountains", "Himalayas", "Alps"],
    difficulty: 3,
    category: "geography"
  },
  {
    id: 15,
    question: "What is the smallest country in the world?",
    correctAnswer: "Vatican City",
    options: ["Monaco", "San Marino", "Vatican City", "Luxembourg"],
    difficulty: 4,
    category: "geography"
  },

  // History Questions (Difficulty 2-5)
  {
    id: 16,
    question: "In which year did World War II end?",
    correctAnswer: "1945",
    options: ["1944", "1945", "1946", "1947"],
    difficulty: 2,
    category: "history"
  },
  {
    id: 17,
    question: "Who was the first person to walk on the moon?",
    correctAnswer: "Neil Armstrong",
    options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
    difficulty: 2,
    category: "history"
  },
  {
    id: 18,
    question: "Which ancient wonder was located in Alexandria?",
    correctAnswer: "Lighthouse of Alexandria",
    options: ["Colossus of Rhodes", "Lighthouse of Alexandria", "Hanging Gardens", "Mausoleum at Halicarnassus"],
    difficulty: 3,
    category: "history"
  },
  {
    id: 19,
    question: "Who founded the Mongol Empire?",
    correctAnswer: "Genghis Khan",
    options: ["Kublai Khan", "Genghis Khan", "Ogedei Khan", "Tolui Khan"],
    difficulty: 4,
    category: "history"
  },
  {
    id: 20,
    question: "In which century did the Byzantine Empire fall?",
    correctAnswer: "15th century",
    options: ["13th century", "14th century", "15th century", "16th century"],
    difficulty: 5,
    category: "history"
  }
];

export function getQuestionsByDifficulty(difficulty: number): Question[] {
  return QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getRandomQuestion(difficulty?: number): Question {
  const availableQuestions = difficulty 
    ? getQuestionsByDifficulty(difficulty)
    : QUESTIONS;
  
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

export function getQuestionById(id: number): Question | undefined {
  return QUESTIONS.find(q => q.id === id);
}