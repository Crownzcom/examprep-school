// QuestionCard.js
import React, { useState } from 'react';
import { Card, ButtonGroup, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import AnswerInput from './AnswerInput';
import { setUserAnswer, setSelectedOption } from './redux/actions';
import { isImageUrl } from './utils';

const QuestionCard = ({ question, isEitherOr, categoryId, setUserAnswer, setSelectedOption, answers }) => {
    const [selectedOption, setSelectedOptionState] = useState('');

    // Adjusted to handle the new structure
    const getUserAnswer = (questionId) => {
        const key = `${categoryId}-${questionId}`;
        return answers[key];
    };

    const handleAnswerChange = (questionId, answer, questionType, subQuestionIndex = null) => {
        let uniqueId = subQuestionIndex !== null ? `${questionId}_sub_${subQuestionIndex}` : questionId;
        setUserAnswer(uniqueId, answer, categoryId, isEitherOr, questionType);
    };

    const handleOptionSelection = (option) => {
        setSelectedOptionState(option);

        let id;
        if (isEitherOr) {
            id = option === 'either' ? question.either.id : question.or.id;
            // For either/or questions, update the selected option with the isEitherOr flag
            setSelectedOption(`${id}-selectedOption`, option, categoryId, true);
        } else {
            id = question.id; // For standard questions
            setSelectedOption(`${id}-selectedOption`, option, categoryId, false);
        }
    };

    const renderQuestionText = (questionText, questionImage) => (
        <>
            <p dangerouslySetInnerHTML={{ __html: questionText }}></p>
            {questionImage && isImageUrl(questionImage) && (
                <Card style={{ alignItems: 'flex-start', textAlign: 'center', margin: '10px 0' }}>
                    <Card.Img src={questionImage} alt="Question" style={{ maxWidth: '20rem', height: 'auto' }} />
                </Card>
            )}
        </>
    );

    const renderQuestion = (currentQuestion, disabled) => (
        <>
            {renderQuestionText(currentQuestion.question, currentQuestion.image)}
            <AnswerInput
                question={currentQuestion}
                onChange={(answer) => handleAnswerChange(currentQuestion.id, answer, currentQuestion.type)}
                getUserAnswer={getUserAnswer}
                disabled={disabled}
                displayQuestionText={false}
            />
            {currentQuestion.sub_questions && currentQuestion.sub_questions.map((subQ, index) => (
                <AnswerInput
                    key={`${currentQuestion.id}_sub_${index}`}
                    question={subQ}
                    onChange={(answer) => handleAnswerChange(currentQuestion.id, answer, subQ.type, index)}
                    getUserAnswer={() => getUserAnswer(`${currentQuestion.id}_sub_${index}`)}
                    disabled={false}
                    displayQuestionText={true}
                />
            ))}
        </>
    );

    return (
        <Card>
            <Card.Body>
                {isEitherOr ? (
                    <>
                        <ButtonGroup>
                            <Button variant={selectedOption === 'either' ? "success" : "secondary"} onClick={() => handleOptionSelection('either')}>Either</Button>
                            <Button variant={selectedOption === 'or' ? "warning" : "secondary"} onClick={() => handleOptionSelection('or')}>Or</Button>
                        </ButtonGroup>
                        {selectedOption === 'either' ? renderQuestion(question.either, selectedOption !== 'either') : renderQuestion(question.or, selectedOption !== 'or')}
                    </>
                ) : (
                    renderQuestion(question, false) // Non either/or question
                )}
            </Card.Body>
        </Card>
    );
};

const mapStateToProps = (state) => ({
    answers: state.answers
});

const mapDispatchToProps = {
    setUserAnswer,
    setSelectedOption
};

export default connect(mapStateToProps, mapDispatchToProps)(QuestionCard);
