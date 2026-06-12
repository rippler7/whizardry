export class Questions {
    static getQuestions() {
        return [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                answer: "Paris",
                difficulty: 1
            },
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                answer: "4",
                difficulty: 1
            },
            {
                question: "Which planet is closest to the Sun?",
                options: ["Venus", "Earth", "Mars", "Mercury"],
                answer: "Mercury",
                difficulty: 1
            },
            {
                question: "What is the largest mammal?",
                options: ["Elephant", "Blue Whale", "Giraffe", "Shark"],
                answer: "Blue Whale",
                difficulty: 2
            },
            {
                question: "Who wrote Romeo and Juliet?",
                options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
                answer: "William Shakespeare",
                difficulty: 2
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Ag", "Au", "Pb", "Fe"],
                answer: "Au",
                difficulty: 3
            },
            {
                question: "In which year did World War II end?",
                options: ["1945", "1918", "1939", "1960"],
                answer: "1945",
                difficulty: 2
            },
            {
                question: "What is the square root of 64?",
                options: ["6", "7", "8", "9"],
                answer: "8",
                difficulty: 1
            },
            {
                question: "Which ocean is the largest?",
                options: ["Atlantic", "Indian", "Arctic", "Pacific"],
                answer: "Pacific",
                difficulty: 1
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
                answer: "Leonardo da Vinci",
                difficulty: 2
            },
            {
                question: "What is the smallest country in the world?",
                options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
                answer: "Vatican City",
                difficulty: 3
            },
            {
                question: "How many continents are there?",
                options: ["5", "6", "7", "8"],
                answer: "7",
                difficulty: 1
            },
            {
                question: "What is the hardest natural substance?",
                options: ["Gold", "Iron", "Diamond", "Platinum"],
                answer: "Diamond",
                difficulty: 2
            },
            {
                question: "Which gas makes up most of Earth's atmosphere?",
                options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
                answer: "Nitrogen",
                difficulty: 3
            },
            {
                question: "What is the longest river in the world?",
                options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
                answer: "Nile",
                difficulty: 2
            }
        ];
    }

    static getChestQuestions() {
        return [
            {
                question: "What is the sum of 5 + 3?",
                options: ["6", "7", "8", "9"],
                answer: "8",
                difficulty: 1
            },
            {
                question: "What color do you get when you mix red and blue?",
                options: ["Green", "Purple", "Orange", "Yellow"],
                answer: "Purple",
                difficulty: 1
            },
            {
                question: "How many sides does a triangle have?",
                options: ["2", "3", "4", "5"],
                answer: "3",
                difficulty: 1
            },
            {
                question: "What is the capital of Italy?",
                options: ["Venice", "Milan", "Rome", "Naples"],
                answer: "Rome",
                difficulty: 2
            },
            {
                question: "Which animal is known as the King of the Jungle?",
                options: ["Tiger", "Lion", "Elephant", "Bear"],
                answer: "Lion",
                difficulty: 1
            },
            {
                question: "What is 10 x 10?",
                options: ["20", "100", "1000", "200"],
                answer: "100",
                difficulty: 2
            },
            {
                question: "What do bees produce?",
                options: ["Milk", "Silk", "Honey", "Wax"],
                answer: "Honey",
                difficulty: 1
            },
            {
                question: "How many days are in a week?",
                options: ["5", "6", "7", "8"],
                answer: "7",
                difficulty: 1
            }
        ];
    }
}

// Export QUESTIONS array for DungeonGameScene to import directly
export const QUESTIONS = [...Questions.getQuestions(), ...Questions.getChestQuestions()];