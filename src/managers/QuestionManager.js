import { Questions } from '../data/Questions.js';

const shuffleArray = (items) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export class QuestionManager {
    constructor(scene) {
        this.scene = scene;
        this.questions = Questions.getQuestions();
        this.chestQuestions = Questions.getChestQuestions();
        this.shuffledSet = [];
        this.choiceSets = [];
        this.masterChestQuestions = [];
        this.gateLocations = [];
        this.keyLocations = [];
        this.initialize();
    }

    initialize() {
        try {
            this.setupQuestionSets();
            this.setupGateLocations();
            this.setupChestQuestions();
        } catch (error) {
            console.error('Error initializing questions:', error);
            this.createFallbackQuestions();
        }
    }

    setupQuestionSets() {
        // Shuffle the full question pool so each level starts with a fresh set.
        this.shuffledSet = shuffleArray(this.questions);
        
        // Create choice sets for each question
        for (let n = 0; n < this.shuffledSet.length; n++) {
            const question = this.shuffledSet[n];
            const choices = this.generateChoices(question.answer, n);
            this.choiceSets[n] = Phaser.Utils.Array.Shuffle(choices);
        }
    }

    generateChoices(correctAnswer, questionIndex) {
        const choices = [correctAnswer];
        
        // Generate 3 incorrect choices
        for (let k = 0; k < 3; k++) {
            let randomAnswer;
            let attempts = 0;
            do {
                const randomQuestion = this.shuffledSet[Math.floor(Math.random() * this.shuffledSet.length)];
                randomAnswer = randomQuestion.answer;
                attempts++;
            } while (choices.includes(randomAnswer) && attempts < 10);
            
            if (!choices.includes(randomAnswer)) {
                choices.push(randomAnswer);
            } else {
                // Fallback choice if we can't find a unique answer
                choices.push(`Option ${String.fromCharCode(65 + choices.length)}`);
            }
        }
        
        return choices;
    }

    setupGateLocations() {
        // Define gate positions and their associated questions
        const positions = [
            [381, 848], [318, 1844], [608, 1844], [944, 940], [1392, 160],
            [1361, 1338], [1118, 1833], [1710, 2328], [1810, 1880], [2574, 2330],
            [3134, 2279], [2625, 1702], [2942, 901], [2352, 56], [1534, 806]
        ];

        this.gateLocations = positions.map((pos, index) => ({
            x: pos[0],
            y: pos[1],
            id: index + 1,
            unlocked: false,
            choices: this.choiceSets[index] || this.getDefaultChoices(),
            correctAnswer: this.shuffledSet[index]?.answer || 'Default Answer',
            question: this.shuffledSet[index]?.question || 'What is 2 + 2?',
            level: index + 1
        }));

        // Set up key locations (where players need to go after answering questions)
        this.keyLocations = [
            [200, 300], [400, 500], [600, 700], [800, 900], [1000, 1100],
            [1200, 1300], [1400, 1500], [1600, 1700], [1800, 1900], [2000, 2100],
            [2200, 2300], [2400, 2500], [2600, 2700], [2800, 2900]
        ];
    }

    setupChestQuestions() {
        // Shuffle chest questions on every scene init so new levels feel fresh.
        this.masterChestQuestions = shuffleArray(this.chestQuestions);
        
        // Generate choice sets for chest questions
        for (let n = 0; n < this.masterChestQuestions.length; n++) {
            const question = this.masterChestQuestions[n];
            const choices = this.generateChoices(question.answer, n);
            this.masterChestQuestions[n].choices = choices;
        }
    }

    getDefaultChoices() {
        return ['Option A', 'Option B', 'Option C', 'Option D'];
    }

    createFallbackQuestions() {
        // Create basic fallback questions if loading fails
        const fallbackQuestions = [
            { question: 'What is 2 + 2?', answer: '4' },
            { question: 'What color is the sky?', answer: 'Blue' },
            { question: 'How many legs does a spider have?', answer: '8' },
            { question: 'What is the capital of France?', answer: 'Paris' },
            { question: 'What is 10 - 3?', answer: '7' }
        ];

        this.questions = fallbackQuestions;
        this.shuffledSet = [...fallbackQuestions];
        this.setupQuestionSets();
        this.setupGateLocations();

        console.warn('Using fallback questions due to loading error');
    }

    getQuestion(index) {
        return this.shuffledSet[index] || this.shuffledSet[0];
    }

    getGateQuestion(gateId) {
        return this.gateLocations.find(gate => gate.id === gateId);
    }

    getChestQuestion(chestIndex) {
        return this.masterChestQuestions[chestIndex] || this.masterChestQuestions[0];
    }

    checkAnswer(questionId, selectedChoice) {
        const question = this.getQuestion(questionId);
        return selectedChoice === question.answer;
    }

    checkGateAnswer(gateId, selectedChoice) {
        const gate = this.gateLocations.find(g => g.id === gateId);
        if (gate) {
            return selectedChoice === gate.correctAnswer;
        }
        return false;
    }

    checkChestAnswer(chestIndex, selectedChoice) {
        const question = this.getChestQuestion(chestIndex);
        return selectedChoice === question.answer;
    }

    unlockGate(gateId) {
        const gate = this.gateLocations.find(g => g.id === gateId);
        if (gate) {
            gate.unlocked = true;
        }
    }

    isGateUnlocked(gateId) {
        const gate = this.gateLocations.find(g => g.id === gateId);
        return gate ? gate.unlocked : false;
    }

    getKeyLocation(level) {
        return this.keyLocations[level - 1] || this.keyLocations[0];
    }
}
