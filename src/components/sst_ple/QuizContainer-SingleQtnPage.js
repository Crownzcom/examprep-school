// QuizContainer.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import SaveButton from '../renderQuiz/SaveButton';
import QuestionCard from '../renderQuiz/QuestionCard';
import { selectRandomQuestions } from '../renderQuiz/utils';
import { Container, Row, Col, Card, ProgressBar, Tooltip, OverlayTrigger, Modal, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheck, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const QuizContainer = ({ questionsData, subjectName }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
        navigate("/exam-page");
    };
    //===END EXIT/CANCEL EXAM MODAL==============

    // ===TIMER =================================
    const timerStyles = {
        timerContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0',
        },
        timerText: {
            marginLeft: '10px',
            fontWeight: 'bold',
        },
    };

    const [timeLeft, setTimeLeft] = useState(90 * 60); // 1 hour 30 minutes in seconds
    const [isSubmitted, setIsSubmitted] = useState(false);

    const saveButtonRef = useRef(null); // Reference to the SaveButton

    // Timer countdown logic
    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !isSubmitted) {
            setIsSubmitted(true);
            saveButtonRef.current.click(); // Trigger click on the SaveButton
            setShowTimeUpModal(true); // Show the time up modal
        }
    }, [timeLeft, isSubmitted]);

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    const initialTime = 90 * 60; // 1 hour 30 minutes in seconds

    // Convert timeLeft to a percentage
    const timePercentage = (timeLeft / initialTime) * 100;

    // ===END TIMER ==============================

    // Extract category IDs dynamically from questionsData
    const categoriesToInclude = React.useMemo(() => questionsData.map(category => category.category), [questionsData]);

    useEffect(() => {
        const randomQuestions = selectRandomQuestions(questionsData, categoriesToInclude, subjectName);
        randomQuestions.sort((a, b) => a.category - b.category);
        setSelectedQuestions(randomQuestions);
    }, [questionsData, categoriesToInclude, subjectName]); // Dependencies are now stable

    return (
        <Container fluid>
            <div style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <Row>
                    <Col xs={12} className="d-md-none bg-light">
                        <div style={timerStyles.timerContainer}>
                            <FontAwesomeIcon icon={faClock} size="2x" />
                            <ProgressBar now={timePercentage} style={{ width: '50%' }} />
                            <span style={timerStyles.timerText}>
                                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </span>
                        </div>
                    </Col>
                </Row>
            </div>
            <Row>
                <Col xs={12} md={2} className="d-none d-md-block position-fixed bg-light" style={{ height: '100vh', overflowY: 'auto' }}>
                    <div style={timerStyles.timerContainer}>
                        <FontAwesomeIcon icon={faClock} size="2x" />
                        <ProgressBar now={timePercentage} style={{ width: '50%' }} />
                        <span style={timerStyles.timerText}>
                            Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </span>
                    </div>
                    <ButtonGroup>
                        <Button
                            variant="success"
                            onClick={handleOpenModal}
                            className="w-25"
                        >
                            Submit Quiz
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
                        index === currentQuestionIndex && (
                            <Row key={category.$id} className="mb-4">
                                <Col>
                                    <Card style={{ minHeight: 'auto', maxHeight: '100%' }}>
                                        <Card.Header as="h5">Question {category.category}.</Card.Header>
                                        <Card.Body>
                                            <Card.Title>{category.instructions}</Card.Title>
                                            {category.questions.map((question, index) => {
                                                let questionProps = question.hasOwnProperty('either') && question.hasOwnProperty('or')
                                                    ? question
                                                    : { either: question };
                                                questionProps = { ...questionProps, categoryId: category.category };
                                                return (
                                                    <Card key={question.id || `${category.$id}_${index}`} style={{ marginBottom: '10px' }}>
                                                        <QuestionCard key={question.id || `${category.$id}_${index}`} selectedQuestions={questionProps} subjectName={subjectName} />
                                                    </Card>);
                                            })}
                                        </Card.Body>
                                        <Card.Footer className="text-muted">
                                            <ButtonGroup className="w-75" aria-label="Question navigation buttons">
                                                <Button variant="outline-primary" onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                                                    <FontAwesomeIcon icon={faArrowLeft} /> Previous Question
                                                </Button>
                                                <Button variant="outline-primary" onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={currentQuestionIndex === selectedQuestions.length - 1}>
                                                    Next Question <FontAwesomeIcon icon={faArrowRight} />
                                                </Button>
                                            </ButtonGroup>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            </Row>
                        )
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
                                Submit Quiz
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
                    Are you sure you want to submit?
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
                    <Button variant="secondary" onClick={handleCloseModal}>
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
                    Your time is up and your quiz has been automatically submitted.
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
