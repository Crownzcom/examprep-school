import React, { useState, useEffect } from "react";
import QuizContainer from "./renderQuiz/QuizContainer";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getSelectedExam, checkExamIfDone } from "./renderQuiz/utils.js";
import { useAuth } from "../context/AuthContext";

function Exam({ examID }) {
  const [showInstructionsModal, setShowInstructionsModal] = useState(true);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showExamDoneModal, setShowExamDoneModal] = useState(false); // New state for exam done modal
  const [examDone, setExamDone] = useState(false);
  const [data, setData] = useState(null); // Variable to store the fetched questions data
  const [subject, setSubject] = useState("");

  const navigate = useNavigate();

  // Check if exam was done
  useEffect(() => {
    const checkExam = async () => {
      const isDone = await checkExamIfDone(examID);
      console.log("Exam done:", isDone); // Log the result to ensure it is correct
      if (isDone) {
        setExamDone(true);
        setShowInstructionsModal(false);
        setShowExamDoneModal(true);
      }
    };

    checkExam();
  }, [examID]);

  useEffect(() => {
    if (!examDone) {
      const fetchData = async () => {
        try {
          let questionData = await getSelectedExam(examID);

          setSubject(questionData.subjectName);
          if (!questionData.examQuestions || JSON.parse(questionData.examQuestions).length < 1) {
            navigate(-1);
            console.log("no exam found");
            return;
          }

          setData(JSON.parse(questionData.examQuestions));
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData(); // Call the fetchData function to fetch the data
    }

    // Cleanup function
    return () => { };
  }, [examID, navigate, examDone]); // Dependency array ensures the code runs only once when examID changes

  const handleProceed = () => {
    if (["social_studies", "mathematics", "english_language", "science"].includes(subject)) {
      setShowInstructionsModal(false);
    } else {
      setShowInstructionsModal(false);
      setShowUnavailableModal(true); // Set the subject validity to false
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const renderQuizContent = () => {
    return <QuizContainer questionsData={data} subjectName={subject} examID={examID} />;
  };

  const subjectInstructions = () => {
    return subject === "mathematics" ? (
      <>
        <li>Have a piece of paper, pen/pencil, and calculator ready for calculations.</li>
      </>
    ) : (
      <></>
    );
  };

  const handleCloseExamDoneModal = () => {
    setShowExamDoneModal(false);
    navigate('/exam-page');
  };

  return (
    <>
      {/* Render the exam if all the consitions are fullfiled */}
      {!examDone && !showInstructionsModal && !showUnavailableModal && renderQuizContent()}

      {/* Modal to display the exam instructions */}
      <Modal show={showInstructionsModal} onHide={() => { }} centered>
        <Modal.Header>
          <Modal.Title>Exam Instructions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Here are the instructions for your exam:</p>
          <ul>
            {/* Subject based instructions as needed */}
            {subjectInstructions()}
            {/* Other General instructions as needed */}
            <li>Read each question carefully.</li>
            <li>Ensure you answer all questions.</li>
            <li>Answer multiple-choice questions by selecting the best option.</li>
            <li>Enter text responses for text entry questions in the provided text box.</li>
            <li>Keep track of the time limit and pace yourself accordingly.</li>
            <li>Do not refresh the page during the exam.</li>
            <li>Upon completion, submit the exam and await feedback on your performance.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProceed}>
            Proceed to Exam
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal to show exam is unavailable */}
      {showUnavailableModal && (
        <Modal show={true} onHide={() => { }} centered>
          <Modal.Header>
            <Modal.Title>Exam Unavailable</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Currently, the exam for the selected subject is not available. Please check back later.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCancel}>
              Go Back
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Exam Done Modal */}
      <Modal show={showExamDoneModal} onHide={handleCloseExamDoneModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Exam Already Done</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have already completed this exam. You cannot retake it.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseExamDoneModal}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Exam;
