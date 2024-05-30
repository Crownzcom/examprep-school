import React from 'react';
import { render, screen } from '@testing-library/react';
import AnswerCard from './AnswerCard';

describe('AnswerCard', () => {
    const resultsData = {
        question: 'What is the capital of France?',
        image: 'https://example.com/image.jpg',
        explanation: 'Paris is the capital of France.',
        answer: 'Paris',
        user_answer: 'Paris',
        type: 'multipleChoice',
        mark: 1,
        sub_questions: [
            {
                question: 'What is the currency of France?',
                image: 'https://example.com/currency.jpg',
                explanation: 'The currency of France is Euro.',
                answer: 'Euro',
                user_answer: 'Euro',
                type: 'text',
                mark: 1,
            },
        ],
    };

    it('renders the question text', () => {
        render(<AnswerCard resultsData={resultsData} />);
        const questions = screen.getAllByText('What is the capital of France?');
        expect(questions.length).toBeGreaterThan(0);
        questions.forEach(question => {
            expect(question).toBeInTheDocument();
        });
    });


    it('renders the question image', () => {
        render(<AnswerCard resultsData={resultsData} />);
        expect(screen.getByAltText('Question')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('renders the user answer', () => {
        render(<AnswerCard resultsData={resultsData} />);
        const userAnswers = screen.getAllByText('Paris');
        expect(userAnswers.length).toBeGreaterThan(0);
        userAnswers.forEach(userAnswer => {
            expect(userAnswer).toBeInTheDocument();
        });
    });

    it('renders the correct answer', () => {
        render(<AnswerCard resultsData={resultsData} />);
        const correctAnswers = screen.getAllByText('Paris');
        expect(correctAnswers.length).toBeGreaterThan(0);
        correctAnswers.forEach(correctAnswer => {
            expect(correctAnswer).toBeInTheDocument();
        });
    });

    it('renders the explanation', () => {
        render(<AnswerCard resultsData={resultsData} />);
        const explanations = screen.getAllByText('Paris is the capital of France.');
        expect(explanations.length).toBeGreaterThan(0);
        explanations.forEach(explanation => {
            expect(explanation).toBeInTheDocument();
        });
    });

    it('renders the score', () => {
        render(<AnswerCard resultsData={resultsData} />);
        expect(screen.getByText('Score')).toBeInTheDocument();
        expect(screen.getByText('1/1')).toBeInTheDocument();
    });

    it('renders sub-questions', () => {
        render(<AnswerCard resultsData={resultsData} />);
        const subQuestions = screen.getAllByText('What is the currency of France?');
        expect(subQuestions.length).toBeGreaterThan(0);
        subQuestions.forEach(subQuestion => {
            expect(subQuestion).toBeInTheDocument();
        });
    });
});