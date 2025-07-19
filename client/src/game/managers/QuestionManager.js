import { QUESTIONS } from '../data/Questions.js';

export class QuestionManager {
    constructor(scene) {
        this.scene = scene;
        this.questions = [...QUESTIONS];
        this.currentQuestion = null;
        this.usedQuestions = [];
        this.onQuestionAnswered = null;
    }

    getRandomQuestion(difficulty = null) {
        let availableQuestions = this.questions.filter(q => 
            !this.usedQuestions.includes(q.id) &&
            (difficulty ? q.difficulty === difficulty : true)
        );

        if (availableQuestions.length === 0) {
            // Reset used questions if we've used them all
            this.usedQuestions = [];
            availableQuestions = this.questions.filter(q => 
                difficulty ? q.difficulty === difficulty : true
            );
        }

        if (availableQuestions.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const question = availableQuestions[randomIndex];
        
        this.currentQuestion = question;
        this.usedQuestions.push(question.id);
        
        return question;
    }

    showQuestion(question, callback) {
        this.currentQuestion = question;
        this.onQuestionAnswered = callback;
        
        // Pause the game
        this.scene.gameStateManager.setState('question');
        
        // Create question UI
        this.createQuestionUI(question);
    }

    createQuestionUI(question) {
        const { width, height } = this.scene.sys.game.config;
        
        // Create modal background
        this.questionModal = this.scene.add.rectangle(
            width / 2, 
            height / 2, 
            width * 0.8, 
            height * 0.6, 
            0x000000, 
            0.8
        );
        this.questionModal.setDepth(1000);
        
        // Create question text
        this.questionText = this.scene.add.text(
            width / 2,
            height / 2 - 100,
            question.question,
            {
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: width * 0.7 }
            }
        );
        this.questionText.setOrigin(0.5);
        this.questionText.setDepth(1001);
        
        // Create answer buttons
        this.answerButtons = [];
        question.answers.forEach((answer, index) => {
            const button = this.createAnswerButton(
                width / 2,
                height / 2 - 20 + (index * 50),
                answer,
                index,
                question.correct === index
            );
            this.answerButtons.push(button);
        });
    }

    createAnswerButton(x, y, text, index, isCorrect) {
        const button = this.scene.add.rectangle(x, y, 400, 40, 0x444444);
        button.setDepth(1001);
        button.setInteractive();
        
        const buttonText = this.scene.add.text(x, y, `${index + 1}. ${text}`, {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(1002);
        
        // Add hover effects
        button.on('pointerover', () => {
            button.setFillStyle(0x666666);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x444444);
        });
        
        // Handle click
        button.on('pointerdown', () => {
            this.answerQuestion(index, isCorrect);
        });
        
        return { button, text: buttonText, isCorrect };
    }

    answerQuestion(selectedIndex, isCorrect) {
        console.log(`Question answered: ${selectedIndex}, Correct: ${isCorrect}`);
        
        // Visual feedback
        this.answerButtons.forEach((btn, index) => {
            if (index === selectedIndex) {
                btn.button.setFillStyle(isCorrect ? 0x00cc00 : 0xcc0000);
            } else if (btn.isCorrect) {
                btn.button.setFillStyle(0x00cc00);
            }
        });
        
        // Wait a moment then continue
        this.scene.time.delayedCall(1500, () => {
            this.closeQuestionUI();
            
            // Notify callback
            if (this.onQuestionAnswered) {
                this.onQuestionAnswered(isCorrect, this.currentQuestion);
            }
            
            // Update game state
            this.scene.gameStateManager.questionAnswered(isCorrect);
            this.scene.gameStateManager.resumeGameplay();
        });
    }

    closeQuestionUI() {
        if (this.questionModal) {
            this.questionModal.destroy();
        }
        
        if (this.questionText) {
            this.questionText.destroy();
        }
        
        if (this.answerButtons) {
            this.answerButtons.forEach(btn => {
                btn.button.destroy();
                btn.text.destroy();
            });
            this.answerButtons = [];
        }
    }

    getQuestionByDifficulty(difficulty) {
        return this.getRandomQuestion(difficulty);
    }

    getCurrentQuestion() {
        return this.currentQuestion;
    }

    getStats() {
        return {
            totalQuestions: this.questions.length,
            usedQuestions: this.usedQuestions.length,
            remainingQuestions: this.questions.length - this.usedQuestions.length
        };
    }
}