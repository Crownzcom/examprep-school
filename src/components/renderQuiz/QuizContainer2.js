// QuizContainer.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { resetAnswers } from './redux/actions';
import SaveButton from './SaveButton';
import QuestionCard from './QuestionCard';
import { getAttemptedQuestions, updateQuestionHistory, selectRandomQuestions, generateRandomExam } from './utils';
import { Container, Row, Col, Modal, ButtonGroup, Button, Spinner, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import Timer from './Timer';

const QuizContainer = ({ questionsData, subjectName }) => {
    // console.log('All questions data: ', questionsData);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { userInfo } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //===SUBMISSION MODAL========================
    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    //===END SUBMISSION MODAL====================

    //===EXIT/CANCEL EXAM MODAL==================
    const handleExitExam = () => {
        setShowExitModal(true);
    };

    const confirmExit = () => {
        dispatch(resetAnswers()); // Dispatch the action
        navigate("/exam-page");
    };
    //===END EXIT/CANCEL EXAM MODAL==============

    // ===TIMER =================================
    const [isSubmitted, setIsSubmitted] = useState(false);
    const initialTime = 90 * 60; // 1 hour 30 minutes in seconds
    const saveButtonRef = useRef(null); // Reference to the SaveButton

    const handleTimeUp = () => {
        setIsSubmitted(true);
        saveButtonRef.current.click();
        setShowTimeUpModal(true);
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    // ===END TIMER ==============================

    // Extract category IDs dynamically from questionsData
    const categoriesToInclude = useMemo(() => questionsData ? questionsData.map(category => category.category) : [], [questionsData]);
    // const categoriesToInclude = questionsData.map(category => category.category);

    useEffect(() => {
        const fetchUserHistoryAndSelectQuestions = async () => {
            if (questionsData) {
                setIsLoading(true);
                try {

                    const userHistory = await getAttemptedQuestions(userInfo.userId, subjectName, userInfo.educationLevel);

                    const randomQuestions = selectRandomQuestions(
                        questionsData,
                        categoriesToInclude,
                        subjectName,
                        userHistory,
                        userInfo.userId,
                        userInfo.educationLevel
                    );

                    randomQuestions.categoriesWithQuestions.sort((a, b) => a.category - b.category);
                    // console.log("Selected questions2: " + randomQuestions.categoriesWithQuestions);
                    setSelectedQuestions(randomQuestions.categoriesWithQuestions);

                    await updateQuestionHistory(randomQuestions.updatedUserHistory);

                } catch (error) {
                    console.error('Error fetching user history:', error);
                    // Handle error as needed
                }
                setIsLoading(false);
            }

        };

        fetchUserHistoryAndSelectQuestions();
    }, [questionsData, categoriesToInclude, subjectName, userInfo.userId, userInfo.educationLevel]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spinner animation="grow" variant="primary" />
                <Spinner animation="grow" variant="success" />
                <Spinner animation="grow" variant="danger" />
                <Spinner animation="grow" variant="warning" />
                <Spinner animation="grow" variant="info" />
            </div>
        );
    }

    return (
        <Container fluid style={{ marginTop: "" }}>
            <div style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <Row>
                    <Col xs={12} className="d-md-none bg-light" >
                        {/* Timer */}
                        <Timer initialTime={initialTime} onTimeUp={handleTimeUp} />
                    </Col>
                </Row>
            </div>
            {isSubmitted ?
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spinner animation="grow" variant="primary" />
                    <Spinner animation="grow" variant="success" />
                    <Spinner animation="grow" variant="danger" />
                    <Spinner animation="grow" variant="warning" />
                    <Spinner animation="grow" variant="info" />
                </div>
                :
                <>
                    <Row>
                        <Col xs={12} md={2} className="d-none d-md-block position-fixed bg-light" style={{ height: '50vh', overflowY: 'auto' }}>
                            {/* Timer */}
                            <Timer initialTime={initialTime} onTimeUp={handleTimeUp} />
                            <ButtonGroup>
                                <Button
                                    variant="success"
                                    onClick={handleOpenModal}
                                    className="w-25"
                                >
                                    Submit Exam
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleExitExam}
                                    className="w-25"
                                >
                                    Exit Exam
                                </Button>
                            </ButtonGroup>
                        </Col>
                        <Col xs={12} md={{ span: 9, offset: 3 }}>
                            {selectedQuestions.map((category, index) => (
                                <div key={category.$id}>
                                    {/* <h2>Question {category.category}</h2> */}
                                    {subjectName === 'sst_ple' && category.category === 36 || category.category === 51 ? (<Card.Title style={{ marginTop: '20px', border: '2px solid #000', borderColor: 'red' }}>{category.instructions}</Card.Title>) : null}
                                    {category.questions.map((question, index) => {
                                        // Pass the question as is, with an additional property to indicate "either/or" type
                                        const isEitherOr = question.hasOwnProperty('either') && question.hasOwnProperty('or');
                                        return (
                                            <QuestionCard
                                                key={question.id || `${category.$id}_${index}`}
                                                questionIndex={index}
                                                question={question}
                                                isEitherOr={isEitherOr}
                                                categoryId={category.category}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </Col>
                    </Row>
                    <Row >
                        <Col xs={12} className="d-md-none bg-light fixed-bottom">
                            <div className="d-flex justify-content-center">
                                <ButtonGroup className="w-75">
                                    <Button
                                        variant="success"
                                        onClick={handleOpenModal}
                                    >
                                        Submit Exam
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={handleExitExam}
                                    >
                                        Exit Exam
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </Col>
                    </Row>
                </>}
            {/* Modal for exit confirmation */}
            <Modal
                show={showExitModal}
                onHide={() => setShowExitModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Exit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to exit the exam? Your progress may not be
                    saved.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowExitModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmExit}>
                        Confirm Exit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for submit confirmation */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div hidden={isSubmitted}>Are you sure you want to submit?</div>
                    <SaveButton
                        ref={saveButtonRef}
                        selectedQuestions={selectedQuestions}
                        onSubmit={handleSubmit}
                        disabled={isSubmitted}
                        style={{ backgroundColor: 'blue', color: 'white', fontSize: '20px' }}
                        subject_Name={subjectName}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal} hidden={isSubmitted}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal displayed to the user when time is up */}
            <Modal show={showTimeUpModal} onHide={() => setShowTimeUpModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Time's Up!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your time is up and your Exam has been automatically submitted.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTimeUpModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Activated by the automatic saving when the timer countdown is finished */}
            <SaveButton
                ref={saveButtonRef}
                selectedQuestions={selectedQuestions}
                onSubmit={handleSubmit}
                disabled={isSubmitted}
                style={{ display: 'none' }}
                buttonDisplay={'none'}
                subject_Name={subjectName}
            />
        </Container>
    );
};

export default QuizContainer;
