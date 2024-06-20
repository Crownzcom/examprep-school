import React, { useState, useEffect } from "react";
import IframeComponent from "./IframeComponent";
// import QuizContainer from "./sst_ple/QuizContainer";
import QuizContainer from "./renderQuiz/QuizContainer";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  databasesQ,
  database_idQ,
  sstTablePLE_id,
  mathPLE_id,
  engTbalePLE_id,
  sciTablePLE_id,
  QueryQ,
} from "./renderQuiz/examsAppwriteConfig"; //Data from appwrite database
import { useAuth } from "../context/AuthContext.js"
import { getSelectedExam } from "./renderQuiz/utils"
import { sst_ple, math_ple, eng_ple } from '../otherFiles/questionsData'; //Static data from local files

/**
 * Represents an Exam component.
 * @param {Object} props - The component props.
 * @param {string} props.subject - The subject of the exam.
 * @returns {JSX.Element} The Exam component.
 */
function Exam({ examID }) {
  const [showInstructionsModal, setShowInstructionsModal] = useState(true);
  const [showUnavailableModal, setshowUnavailableModal] = useState(true);
  const [data, setData] = useState(null); // Variable to store the fetched questions data
  const [subject, setSubject] = useState('')

  const { userInfo } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from your cloud Appwrite database
    const fetchData = async () => {
      try {

        const test = await databasesQ.listDocuments(database_idQ, engTbalePLE_id)
        console.log(test)
        let questionData = []
        questionData = await getSelectedExam(examID);
        console.log('Retrieved Exam Information: ', questionData[0].examQuestions);

        // if (JSON.stringify(questionData[0].examQuestions.length < 0)) {
        //   // navigate(-1);
        //   console.log('no exam found');
        // }


        setSubject(questionData[0].subJectName)
        setData(JSON.parse(questionData[0].examQuestions)); // Assign the fetched data to the variable

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetchData function to fetch the data

    // Cleanup function
    return () => {
    };
  }, []); // Empty dependency array ensures the code runs only once


  const handleProceed = () => {
    if (subject === 'social-studies_ple' || subject === 'mathematics_ple' || subject === 'english-language_ple' || subject === 'science_ple') {
      setShowInstructionsModal(false);
    }
    else {
      setShowInstructionsModal(false);
      // setshowUnavailableModal(false); // Set the subject validity to false
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const renderQuizContent = () => {
    return <QuizContainer questionsData={data} subjectName={'subject'} />;
  };

  const subjectInstructions = () => {
    // console.log('Subject Name: ', subject);
    return (
      subject === ('mathematics_ple' || 'mathematics_uce' || 'mathematics_uace') ?
        <>
          <li>Have a piece of paper, pen/pencil, and calculator ready for calculations. </li>
        </>
        : <></>
    )
  }

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

      {!showUnavailableModal &&
        <Modal show={true} onHide={() => { }} centered styles={{ width: '40%', height: '40%' }}>
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
      }
    </>
  );
}

export default Exam;