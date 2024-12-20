interface QuizPaper{
    quizId: string,
    quizScore: number,
    questions: Question[]
}

interface Question {
    questionId: string;
    question: string;
    options: { text: string; is_correct: boolean;index: number }[];
    explanation: string;
    userAnswer: number;
}

export {QuizPaper, Question}