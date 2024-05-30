// SaveButton.js
import React, { useState, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetAnswers } from './redux/actions';
import { Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";
import moment from 'moment';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import {
    databases,
    database_id,
    studentMarksTable_id,
} from "../../appwriteConfig.js";
import useNetworkStatus from '../../hooks/useNetworkStatus.js'; // Custom hook to check network status
import {
    fetchAndUpdateResults, formatDate
} from "../../utilities/resultsUtil";
import { sendEmailToNextOfKin } from "../../utilities/otherUtils.js";
import { useAuth } from '../../context/AuthContext';
import db from '../../db.js';

const SaveButton = forwardRef(({ selectedQuestions, onSubmit, disabled, buttonDisplay, subject_Name }, ref) => {

    const [modifiedSelectedQuestions, setModifiedSelectedQuestions] = useState(selectedQuestions);

    const isOffline = !useNetworkStatus(); // Using custom hook to check network status

    // Assigning IDs to the subquestions of the selected questions
    useEffect(() => {
        const assignIds = async () => {
            await assignSubQuestionIds(selectedQuestions);
            setModifiedSelectedQuestions(selectedQuestions);
        };

        assignIds();
    }, [selectedQuestions]);

    const dispatch = useDispatch();

    const { userInfo, updateUserPoints, fetchUserPoints } = useAuth();
    let studentID = userInfo.userId;

    let subjectName;
    if (userInfo.educationLevel === 'PLE') {
        subjectName = subject_Name === 'sst_ple' ? 'Social Studies' : (subject_Name === 'math_ple' ? 'Mathematics' : (subject_Name === 'sci_ple' ? 'Science' : 'English Language'));
    } else {
        subjectName = subject_Name;
    }

    const navigate = useNavigate();

    const reduxState = useSelector(state => state.answers);

    const [isLoading, setIsLoading] = useState(false);

    // Function to assign ids to subquestions without ids
    const assignSubQuestionIds = async (questions) => {
        questions.forEach(question => {
            if (question.questions) {
                question.questions.forEach(mainQuestion => {
                    // Assign IDs only to subquestions of questions that are not in 'either' or 'or' structure
                    if (mainQuestion.sub_questions && !mainQuestion.either && !mainQuestion.or) {
                        mainQuestion.sub_questions.forEach((subQuestion, subIndex) => {
                            if (!subQuestion.id) {
                                subQuestion.id = `${mainQuestion.id}_sub_${subIndex}`;
                            }
                        });
                    }
                });
            }
        });
    };

    // Function to submit data to the database
    const createDocument = async (data) => {
        try {
            setIsLoading(true); // Start loading
            const result = await databases.createDocument(
                database_id,
                studentMarksTable_id,
                "unique()",
                data
            );
        } catch (error) {
            console.error("Error creating document:", error);
        } finally {
            setIsLoading(false); // Stop loading regardless of success or error
        }
    };

    /**
     * Calculating marks.
     * Normalization to answers (both user-answers and given answer options) before comparison
     * Removes special characters (all question types) and extra spaces (only text-type).
     */
    const calculateMarks = (question, userAnswer) => {
        const { type, answer, mark, sub_questions } = question;
        const correctAnswer = Array.isArray(answer) ? answer : [answer];

        // General normalize function for non-text questions
        const normalizeGeneral = value => value.trim().toLowerCase();

        // Specialized normalize function for text questions
        const normalizeText = value => value
            .replace(/[\s\.,\-_!@#$%^&*()=+{}[\]\\;:'"<>/?|`~]+/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .trim()
            .toLowerCase();

        let score = 0;
        let maxScore = 0;

        switch (type) {
            case 'multipleChoice':
                maxScore = mark || 1;
                if (userAnswer && correctAnswer.map(normalizeGeneral).includes(normalizeGeneral(userAnswer))) {
                    score = mark || 1;
                }
                break;
            case 'text':
                maxScore = mark || 1;
                if (userAnswer && correctAnswer.map(normalizeText).includes(normalizeText(userAnswer))) {
                    score = mark || 1;
                }
                break;
            case 'check_box':
                maxScore = mark || correctAnswer.length;
                if (userAnswer && userAnswer.length <= maxScore) {
                    userAnswer.forEach(userOption => {
                        if (correctAnswer.map(normalizeGeneral).includes(normalizeGeneral(userOption))) {
                            score += 1;
                        }
                    });
                }
                break;
            case 'dragAndDrop':
                maxScore = mark || 1; // Assign the max score to mark if available, otherwise 1
                if (Array.isArray(userAnswer) && Array.isArray(correctAnswer) && userAnswer.length === correctAnswer.length) {
                    let isCorrect = true;
                    for (let i = 0; i < correctAnswer.length; i++) {
                        if (normalizeGeneral(userAnswer[i]) !== normalizeGeneral(correctAnswer[i])) {
                            isCorrect = false;
                            break;
                        }
                    }
                    if (isCorrect) {
                        score = mark || 1;
                    }
                }
                break;
            default:
                break;
        }

        // Calculate marks for subquestions
        if (sub_questions) {
            sub_questions.forEach(subQ => {
                const subResult = calculateMarks(subQ, subQ.user_answer);
                score += subResult.score;
                maxScore += subResult.maxScore;
            });
        }

        return { score, maxScore };
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
            case 'dragAndDrop':
                // For drag and drop questions, return the array of dropped items
                return reduxAnswers[reduxAnswers.length - 1].user_answer;
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
        let totalMarks = 0;
        let totalPossibleMarks = 0;

        const formattedAnswers = modifiedSelectedQuestions.map(category => ({
            ...category,
            questions: category.questions.flatMap(question => {
                if (question.either && question.or) {
                    const updatedEither = formatAnswersForEitherOrQuestion(question.either, category.category);
                    const updatedOr = formatAnswersForEitherOrQuestion(question.or, category.category);

                    const partsToInclude = [];
                    if (updatedEither.user_answer !== null) {
                        const eitherResult = calculateMarks(updatedEither, updatedEither.user_answer);
                        partsToInclude.push(updatedEither);
                        totalMarks += eitherResult.score;
                        totalPossibleMarks += eitherResult.maxScore;
                    }
                    if (updatedOr.user_answer !== null) {
                        const orResult = calculateMarks(updatedOr, updatedOr.user_answer);
                        partsToInclude.push(updatedOr);
                        totalMarks += orResult.score;
                        totalPossibleMarks += orResult.maxScore;
                    }
                    return partsToInclude;
                } else {
                    const updatedQuestion = {
                        ...question,
                        user_answer: findUserAnswer(question.id, category.category, question.type),
                        sub_questions: question.sub_questions
                            ? appendUserAnswersToSubQuestions(question.sub_questions, category.category)
                            : [],
                    };
                    const result = calculateMarks(updatedQuestion, updatedQuestion.user_answer);
                    totalMarks += result.score;
                    totalPossibleMarks += result.maxScore;
                    return [updatedQuestion];
                }
            }).flat(),
        }));

        return { formattedAnswers, totalMarks, totalPossibleMarks };
    };

    const handleSave = async () => {
        let { formattedAnswers, totalMarks, totalPossibleMarks } = formatAnswersForSaving();

        onSubmit();

        // Create a document in Appwrite Collection
        const resultsString = JSON.stringify(formattedAnswers);

        const userResultsData = {
            studID: studentID,
            marks: totalMarks,
            subject: subjectName,
            results: resultsString,
            totalPossibleMarks: totalPossibleMarks,
            dateTime: moment().format('MMMM Do YYYY, h:mm:ss a'),
        };

        if (isOffline) {
            try {
                console.log("Offline!");
                let data = {
                    studID: userInfo.userId,
                    studInfo: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        otherName: userInfo.otherName,
                        educationLevel: userInfo.educationLevel,
                        kinFirstName: userInfo.kinFirstName,
                        kinLastName: userInfo.kinLastName,
                        kinEmail: userInfo.kinEmail
                    },
                    subject: subjectName,
                    marks: totalMarks,
                    results: resultsString,
                    totalPossibleMarks: totalPossibleMarks ? totalPossibleMarks : null,
                    dateTime: moment().format('MMMM Do YYYY, h:mm:ss a'),
                    kinEmail: userInfo.kinEmail ? userInfo.kinEmail : null,
                };

                await db.examAnswers.add(data);
            } catch (e) {
                console.error('Error saving ANSWERS to index db: ', e);
            }
        } else {
            try {
                await createDocument(userResultsData);

                if (userInfo.kinEmail) {
                    await sendEmailToNextOfKin(userInfo, subjectName, totalMarks, formatDate(new Date()));
                }

                await updateUserPoints(1, userInfo.userId);
                let userFetchedResults = await fetchAndUpdateResults(userInfo.userId);
            } catch (e) {
                console.error('Error saving ANSWERS to cloud db');
            }
        }

        const questionsData = formattedAnswers;

        dispatch(resetAnswers());

        let attemptDate = formatDate(new Date());

        if (totalMarks === 0) { totalMarks = '0'; }
        navigate('/answers', { state: { questionsData, subjectName, totalMarks, totalPossibleMarks, attemptDate } });
    };

    return (
        <>
            {
                !disabled ?
                    <Button ref={ref} onClick={handleSave} disabled={disabled} variant="primary" style={{ display: buttonDisplay ? buttonDisplay : 'false' }}>
                        <FontAwesomeIcon icon={faSave} /> Submit Exam
                    </Button>
                    :
                    <>
                        <Spinner animation="grow" variant="primary" />
                        <Spinner animation="grow" variant="secondary" />
                        <Spinner animation="grow" variant="success" />
                    </>
            }
        </>
    );
});

export default SaveButton;
