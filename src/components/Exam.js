import React, { useState, useEffect } from "react";
import QuizContainer from "./renderQuiz/QuizContainer";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  databases,
  database_id,
  examsTable_id,
  Query,
} from "../appwriteConfig.js"; // Data from appwrite database
import { getSelectedExam } from "./renderQuiz/utils.js"
import { useAuth } from "../context/AuthContext";

/**
 * Represents an Exam component.
 * @param {Object} props - The component props.
 * @param {string} props.examID - The ID of the exam.
 * @returns {JSX.Element} The Exam component.
 */
function Exam({ examID }) {
  const [showInstructionsModal, setShowInstructionsModal] = useState(true);
  const [showUnavailableModal, setShowUnavailableModal] = useState(true);
  const [data, setData] = useState(null); // Variable to store the fetched questions data
  const [subject, setSubject] = useState("");

  const navigate = useNavigate();

  // Get Exam by ID
  // const getSelectedExam = async (examID) => {
  //   try {
  //     // Query the 'exams' table for exams with the specified examID
  //     const examInformation = await databases.listDocuments(database_id, examsTable_id, [
  //       Query.equal("examID", examID),
  //     ]);

  //     console.log("Exams retrieved: ", examInformation.documents);

  //     // Return the selected exam data, or an empty array if no record is found
  //     return examInformation.documents.length > 0 ? examInformation.documents[0] : {};

  //   } catch (error) {
  //     console.error("Error retrieving exam:", error);
  //     throw new Error("Error retrieving exam data"); // Handle errors appropriately
  //   }
  // };

  useEffect(() => {
    // Fetch data from your cloud Appwrite database
    const fetchData = async () => {
      try {
        let questionData = await getSelectedExam(examID);

        setSubject(questionData.subjectName);
        console.log("Subject: ", questionData.subjectName);

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

    // Cleanup function
    return () => { };
  }, [examID, navigate]); // Dependency array ensures the code runs only once when examID changes

  const handleProceed = () => {
    if (subject === "social_studies" || subject === "mathematics" || subject === "english_language" || subject === "science") {
      setShowInstructionsModal(false);
    } else {
      setShowInstructionsModal(false);
      setShowUnavailableModal(false); // Set the subject validity to false
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const renderQuizContent = () => {
    return <QuizContainer questionsData={data} subjectName={subject} />;
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

  return (
    <>
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

      {!showInstructionsModal && showUnavailableModal && renderQuizContent()}

      {!showUnavailableModal && (
        <Modal show={true} onHide={() => { }} centered styles={{ width: "40%", height: "40%" }}>
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
    </>
  );
}

export default Exam;
