// AnswerInput.js
import React from 'react';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import CheckboxQuestion from './CheckboxQuestion';
import TextInputQuestion from './TextInputQuestion';
import DragAndDropQuestion from './DragAndDropQuestion';

const AnswerInput = ({ question, onChange, disabled, getUserAnswer, displayQuestionText, questionNumber }) => {
    const userAnswer = getUserAnswer(question.id);

    //Case to display different question types
    switch (question.type) {
        case 'multipleChoice':
            return (
                <MultipleChoiceQuestion
                    question={question}
                    onChange={onChange}
                    disabled={disabled}
                    userAnswer={userAnswer}
                    displayQuestionText={displayQuestionText}
                    questionNumber={questionNumber}
                />
            );
        case 'check_box':
            return (
                <CheckboxQuestion
                    question={question}
                    onChange={onChange}
                    disabled={disabled}
                    userAnswer={userAnswer}
                    displayQuestionText={displayQuestionText}
                    questionNumber={questionNumber}
                />
            );
        case 'text':
            return (
                <TextInputQuestion
                    question={question}
                    onChange={onChange}
                    disabled={disabled}
                    userAnswer={userAnswer}
                    displayQuestionText={displayQuestionText}
                    questionNumber={questionNumber}
                />
            );
        case 'dragAndDrop':
            return (
                <DragAndDropQuestion
                    question={question}
                    onChange={onChange}
                    userAnswer={userAnswer}
                    displayQuestionText={displayQuestionText}
                    questionNumber={questionNumber}
                />
            );
        default:
            return null;
    }
};

export default AnswerInput;
