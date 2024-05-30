// AnswerInput.js
import React from 'react';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import CheckboxQuestion from './CheckboxQuestion';
import TextInputQuestion from './TextInputQuestion';

const AnswerInput = ({ question, onChange, disabled, getUserAnswer, displayQuestionText }) => {

    const userAnswer = getUserAnswer(question.id);

    switch (question.type) {
        case 'multipleChoice':
            return (
                <MultipleChoiceQuestion
                    question={question}
                    onChange={onChange}
                    disabled={disabled}
                    userAnswer={userAnswer}
                    displayQuestionText={displayQuestionText}
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
                />
            );
        default:
            return null;
    }
};

export default AnswerInput;
