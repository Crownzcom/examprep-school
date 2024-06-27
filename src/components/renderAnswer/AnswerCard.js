// AnswerCard.js
import React, { useState } from 'react';
import { Row, Col, Card, ListGroup, Badge, ButtonGroup, Button, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { setUserAnswer, setSelectedOption } from '../../redux/actions';
import { isImageUrl } from './utils';

/**
 * Renders an answer card component.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.resultsData - The data for rendering the answer card.
 * @returns {JSX.Element} The rendered answer card component.
 */
const AnswerCard = ({ resultsData, questionIndex, category_Id }) => {

    const renderValue = (value, questionType) => {
        if (questionType === 'dragAndDrop' && Array.isArray(value)) {
            // console.log('Is Drag and Drop: ', value);
            return value.join(' ');
        } else if (Array.isArray(value)) {
            return (
                <ul>
                    {value.map((answer, index) => (
                        <li key={index}>{<Card.Text dangerouslySetInnerHTML={{ __html: answer }}></Card.Text>}</li>
                    ))}
                </ul>
            );
        } else if (isImageUrl(value)) {
            return (
                <Card>
                    <Card.Img variant="top" src={value} style={{ maxWidth: '20rem', maxHeight: '10rem', margin: 'auto' }} />
                </Card>
            );
        } else {
            return (
                <>
                    <Card.Text dangerouslySetInnerHTML={{ __html: value }}></Card.Text>
                </>
            );
        }
    };

    // Define renderQuestionText function here
    const renderQuestionText = (data, questionText, questionImage, explanation, answer, user_answer, questionType, mark) => {

        /**
       * Checking Answer, and Scoring.
       * Normalization to answers (both user-answers and given answer options) before comparison.
       * Removes special characters (all question types) and extra spaces (only text-type).
       */
        const checkAnswer = (answer, user_answer, questionType, mark = 1) => {
            const normalize = (value, isText = false) => {
                if (typeof value !== 'string') return value;
                let normalizedValue = value.trim().toLowerCase();
                if (isText) {
                    normalizedValue = normalizedValue.replace(/[\s\.,\-_!@#$%^&*()=+{}[\]\\;:'"<>/?|`~]+/g, '').replace(/\s+/g, ' ');
                }
                return normalizedValue;
            };

            const normalizeArray = (arr, isText) => arr.map(value => normalize(value, isText));

            if (questionType === 'text') {
                user_answer = Array.isArray(user_answer) ? normalizeArray(user_answer, true) : normalize(user_answer, true);
                answer = Array.isArray(answer) ? normalizeArray(answer, true) : normalize(answer, true);
            } else {
                user_answer = Array.isArray(user_answer) ? normalizeArray(user_answer) : normalize(user_answer);
                answer = Array.isArray(answer) ? normalizeArray(answer) : normalize(answer);
            }

            let score = 0;
            let maxScore = mark;

            switch (questionType) {
                case 'multipleChoice':
                    if (answer === user_answer || (Array.isArray(answer) && answer.includes(user_answer))) {
                        score = mark;
                    }
                    break;

                case 'text':
                    if (answer === user_answer || (Array.isArray(answer) && answer.includes(user_answer))) {
                        score = mark;
                    }
                    break;

                case 'check_box':
                    maxScore = Array.isArray(answer) ? answer.length : mark;
                    if (Array.isArray(user_answer)) {
                        score = user_answer.reduce((acc, val) => acc + (answer.includes(val) ? 1 : 0), 0);
                        score = Math.min(score, maxScore);
                    }
                    break;

                case 'dragAndDrop':
                    if (Array.isArray(user_answer) && Array.isArray(answer) && user_answer.length === answer.length) {
                        const isCorrect = user_answer.every((val, index) => normalize(val) === normalize(answer[index]));
                        if (isCorrect) {
                            score = mark;
                        }
                    }
                    break;

                default:
                    break;
            }

            return { score, maxScore };
        };

        // Example usage
        const { score, maxScore } = checkAnswer(answer, user_answer, questionType, mark);

        return (
            <>
                <p>
                    {/* {questionIndex + category_Id}.  */}
                    {
                        questionType === 'dragAndDrop' ?
                            <>
                                <span>{questionText.join(' ')}</span>
                            </>
                            :
                            <>
                                <span dangerouslySetInnerHTML={{ __html: questionText }}></span>
                            </>
                    }
                </p>
                {questionImage && isImageUrl(questionImage) && (
                    <Card.Img src={questionImage} alt="Question" style={{ maxWidth: '25rem', maxHeight: '15rem' }} />
                )}

                {data.hasOwnProperty("answer") && (
                    <ListGroup>
                        <ListGroup.Item
                            as="li"
                            className="d-flex justify-content-between align-items-start"
                        >
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Your Answer</div>
                                {user_answer ? renderValue(user_answer, questionType) : "Not Answered"}
                            </div>

                            {
                                score === maxScore ?
                                    (
                                        <Badge pill bg="success">
                                            Correct
                                        </Badge>
                                    )
                                    :
                                    (
                                        score > 0 && score < maxScore ?
                                            (
                                                <Badge pill bg="warning">
                                                    Partial
                                                </Badge>
                                            )
                                            :
                                            (
                                                <Badge pill bg="danger">
                                                    Fail
                                                </Badge>
                                            )
                                    )
                            }
                        </ListGroup.Item>
                        <ListGroup.Item
                            as="li"
                            className="d-flex justify-content-between align-items-start"
                        >
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">Correct Answer</div>
                                {renderValue(answer, questionType)}
                            </div>
                        </ListGroup.Item>
                        {explanation && (
                            <ListGroup.Item
                                as="li"
                                className="d-flex justify-content-between align-items-start"
                            >
                                <div className="ms-2 me-auto">
                                    <Card.Text className="fw-bold">Explanation</Card.Text>
                                    <Card.Text
                                        // dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }}
                                        dangerouslySetInnerHTML={{ __html: explanation }}
                                    ></Card.Text>
                                </div>
                            </ListGroup.Item>
                        )}
                        <ListGroup.Item
                            as="li"
                            className="d-flex justify-content-between align-items-start"
                        >
                            <Alert className="ms-2">
                                <Card.Text className="fw-bold">Score</Card.Text>
                                <Card.Text>{score}/{maxScore}</Card.Text>
                            </Alert>
                        </ListGroup.Item>
                    </ListGroup>
                )}
            </>
        );
    };

    const renderQuestion = (question) => {
        const questionType = question.type; // Get the question type
        const mark = question.mark; // Get the mark if available
        return (
            <>
                {renderQuestionText(question, question.question, question.image, question.explanation, question.answer, question.user_answer, questionType, mark)}
                {question.sub_questions && question.sub_questions.map((subQ, index) => (
                    <div key={index}>
                        {renderQuestionText(subQ, subQ.question, subQ.image, subQ.explanation, subQ.answer, subQ.user_answer, subQ.type, subQ.mark)}
                    </div>
                ))}
            </>
        );
    };

    return (
        <Card>
            <Card.Body>
                {
                    renderQuestion(resultsData, false)// Here, 'either' is used to handle non-either/or questions
                }
            </Card.Body>
        </Card>
    );
};

export default AnswerCard;