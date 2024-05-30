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
         * Normalization to answers (bothe user-answers and given answer options) before comparison
         * Removes special characters (all question types) and extra spaces (only text-type).)
        */
        const checkAnswer = (answer, user_answer, questionType, mark) => {
            // General normalize function for non-text questions
            const normalizeGeneral = value => typeof value === 'string' ? value.trim().toLowerCase() : value;

            // Specialized normalize function for text questions
            const normalizeText = value => typeof value === 'string' ?
                value.replace(/[\s\.,\-_!@#$%^&*()=+{}[\]\\;:'"<>/?|`~]+/g, '') // Remove special characters
                    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
                    .trim() // Remove leading and trailing spaces
                    .toLowerCase() // Convert to lowercase to make comparison case-insensitive
                : value;

            // Decide which normalization to use based on question type
            if (questionType === 'text') {
                user_answer = Array.isArray(user_answer) ? user_answer.map(normalizeText) : normalizeText(user_answer);
                answer = Array.isArray(answer) ? answer.map(normalizeText) : normalizeText(answer);
            } else {
                user_answer = Array.isArray(user_answer) ? user_answer.map(normalizeGeneral) : normalizeGeneral(user_answer);
                answer = Array.isArray(answer) ? answer.map(normalizeGeneral) : normalizeGeneral(answer);
            }

            let score = 0;
            let maxScore = 0;

            if (questionType === 'multipleChoice') {
                maxScore = mark || 1; // Assign the max score to mark if available, otherwise 1
                if (answer === user_answer || (Array.isArray(answer) && answer.includes(user_answer))) {
                    score = mark || 1; // Use provided mark or default to 1
                }
            } else if (questionType === 'text') {
                maxScore = mark || 1; // Assign the max score to mark if available, otherwise 1
                // Single mark for text, check if answer matches
                if (answer === user_answer || (Array.isArray(answer) && answer.includes(user_answer))) {
                    score = mark || 1; // Use provided mark or default to 1
                }
            } else if (questionType === 'check_box') {
                maxScore = mark || (Array.isArray(answer) ? answer.length : 1);
                if (Array.isArray(user_answer)) {
                    user_answer.forEach(val => {
                        if (answer.includes(val)) {
                            score++;
                        }
                    });
                    score = Math.min(score, maxScore); // Limit score to maxScore
                }
            } else if (questionType === 'dragAndDrop') {
                maxScore = mark || 1; // Assign the max score to mark if available, otherwise 1
                if (Array.isArray(user_answer) && Array.isArray(answer) && user_answer.length === answer.length) {
                    let isCorrect = true;
                    for (let i = 0; i < answer.length; i++) {
                        if (normalizeGeneral(user_answer[i]) !== normalizeGeneral(answer[i])) {
                            isCorrect = false;
                            break;
                        }
                    }
                    if (isCorrect) {
                        score = mark || 1;
                    }
                }
            }

            return { score, maxScore };
        };

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