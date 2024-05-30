import React from 'react';
import { useSelector } from 'react-redux';

const SaveButton = ({ selectedQuestions }) => {
    const reduxState = useSelector(state => state.answers);

    const calculateMarks = (question, userAnswer) => {
        const { type, answer, mark, sub_questions } = question;
        const correctAnswer = Array.isArray(answer) ? answer : [answer];
        let score = 0;

        switch (type) {
            case 'multipleChoice':
            case 'text':
                if (userAnswer && correctAnswer.map(a => a.trim().toLowerCase()).includes(userAnswer.trim().toLowerCase())) {
                    score = mark || 1; // Use mark if provided, otherwise default to 1
                }
                break;
            case 'check_box':
                const maxScore = mark || correctAnswer.length;
                if (userAnswer && userAnswer.length <= maxScore) {
                    userAnswer.forEach(userOption => {
                        if (correctAnswer.map(a => a.trim().toLowerCase()).includes(userOption.trim().toLowerCase())) {
                            score += 1;
                        }
                    });
                }
                break;
            default:
                break;
        }

        // Calculate marks for subquestions
        if (sub_questions) {
            sub_questions.forEach(subQ => {
                score += calculateMarks(subQ, subQ.user_answer);
            });
        }

        return score;
    };

    const findUserAnswer = (questionId, categoryId, questionType) => {
        const reduxAnswers = reduxState.filter(answer => answer.id === questionId && answer.category === categoryId);
        if (reduxAnswers.length === 0) return null;

        // Handle different types of questions
        switch (questionType) {
            case 'multipleChoice':
            case 'text':
                // For multiple choice and text questions, return the last user answer
                return reduxAnswers[reduxAnswers.length - 1].user_answer;
            case 'check_box':
                // For checkbox questions, return the options that are checked
                const userAnswer = reduxAnswers[reduxAnswers.length - 1].user_answer;
                const checkedOptions = Object.keys(userAnswer).filter(option => userAnswer[option]);
                return checkedOptions;
            default:
                return null;
        }
    };

    const appendUserAnswersToSubQuestions = (subQuestions, categoryId) => {
        return subQuestions.map(subQ => ({
            ...subQ,
            user_answer: findUserAnswer(subQ.id, categoryId, subQ.type),
        }));
    };

    const formatAnswersForEitherOrQuestion = (questionPart, categoryId) => {
        return {
            ...questionPart,
            user_answer: findUserAnswer(questionPart.id, categoryId, questionPart.type),
            sub_questions: questionPart.sub_questions
                ? appendUserAnswersToSubQuestions(questionPart.sub_questions, categoryId)
                : []
        };
    };

    const formatAnswersForSaving = () => {
        // console.log('Redux stored data:', reduxState);
        let totalMarks = 0;
        const formattedAnswers = selectedQuestions.map(category => ({
            ...category,
            questions: category.questions.flatMap(question => {
                if (question.either && question.or) {
                    // Process each part of the either/or question
                    const updatedEither = formatAnswersForEitherOrQuestion(question.either, category.category);
                    const updatedOr = formatAnswersForEitherOrQuestion(question.or, category.category);

                    // Include the part with a user answer, or both if both are answered
                    const partsToInclude = [];
                    if (updatedEither.user_answer !== null) {
                        partsToInclude.push(updatedEither);
                        totalMarks += calculateMarks(updatedEither, updatedEither.user_answer);
                    }
                    if (updatedOr.user_answer !== null) {
                        partsToInclude.push(updatedOr);
                        totalMarks += calculateMarks(updatedOr, updatedOr.user_answer);
                    }
                    return partsToInclude;
                } else {
                    // Handle normal questions
                    const updatedQuestion = {
                        ...question,
                        user_answer: findUserAnswer(question.id, category.category, question.type),
                        sub_questions: question.sub_questions
                            ? appendUserAnswersToSubQuestions(question.sub_questions, category.category)
                            : [],
                    };
                    totalMarks += calculateMarks(updatedQuestion, updatedQuestion.user_answer);
                    return [updatedQuestion];
                }
            }).flat(),
        }));

        // console.log('Total Marks:', totalMarks);
        return formattedAnswers;
    };

    const handleSave = () => {
        const finalDataToSave = formatAnswersForSaving();
        // console.log('Final Data to Save:', finalDataToSave);
        // Implement the save to backend or other logic here
    };

    return <button onClick={handleSave}>Save Answers</button>;
};

export default SaveButton;
