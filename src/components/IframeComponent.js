import React, { useState, useEffect, useRef } from "react";
import Iframe from "react-iframe";
import {
  Container,
  Button,
  ButtonGroup,
  Spinner,
  Card,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import moment from 'moment';
import {
  databases,
  database_id,
  studentMarksTable_id,
} from "../appwriteConfig.js";
import { fetchAndUpdateResults } from "../utilities/resultsUtil";
import { sendEmailToNextOfKin } from "../utilities/otherUtils.js";
import { showToast } from "../utilities/toastUtil.js";
import { useAuth } from '../context/AuthContext';
// import db from '../db.js'
import useNetworkStatus from '../hooks/useNetworkStatus.js';
import "./IframeComponent.css";

const IframeComponent = ({ url }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // State for tracking completion
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [timer, setTimer] = useState(5400); // 1 hour & 30 mins in seconds for example --This will be a prop passed
  const [capturedTime, setCapturedTime] = useState(null);
  const timerIntervalRef = useRef(); // Ref for the timer interval
  const navigate = useNavigate();
  const isOffline = !useNetworkStatus();

  const urlWhitelist = [
    window.location.origin,
    "http://localhost:5173/",
    "http://192.168.100.12:5173/",
    "https://derrickml.com",
    "http://127.0.0.1:5500/",
    "http://127.0.0.1:5501/",
    "http://127.0.0.1:5500/english_ple/",
    "https://moodle.servers.crownzcom.tech/english_ple_section_B",
    "https://exampreptutor.com/english_ple_section_B/",
    "https://www.exampreptutor.com/english_ple_section_B"
    // Add other URLs here
  ];

  const { userInfo, updateUserPoints } = useAuth();
  let studentID = userInfo.userId;

  const canDisplayUrl = urlWhitelist.includes(url);

  //sendMessageToIframe to only send message after confirmation
  const sendMessageToIframe = () => {
    try { } catch (e) { }
    stopAndCaptureTimer();
    const iframe = document.getElementById("myIframe");
    if (iframe && iframe.contentWindow) {
      setButtonClicked(true);
      console.log("Sending message to iframe");
      iframe.contentWindow.postMessage("callEvaluateAllAnswers", "*");
    } else {
      console.log("Iframe or its contentWindow is not accessible");
    }
  };

  const createDocument = async (data) => {
    try {
      setIsLoading(true);
      const result = await databases.createDocument(
        database_id,
        studentMarksTable_id,
        "unique()",
        data
      );
      setIsCompleted(true);
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const receiveMessage = async (event) => {
      try {
        if (buttonClicked && event.data && typeof event.data === "object") {
          const { marksObtained, results } = event.data;

          console.log("Received message. Marks obtained: ", marksObtained);

          const resultsString = JSON.stringify(results);

          if (resultsString && resultsString !== "{}") {
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
                  subject: 'English Language',
                  marks: marksObtained,
                  results: resultsString,
                  dateTime: moment().format('MMMM Do YYYY, h:mm:ss a'),
                  kinEmail: userInfo.kinEmail ? userInfo.kinEmail : null,
                }

                // await db.examAnswers.add(data);

                console.log('Successfully saved ANSWERS to IndexDB')
              } catch (e) {
                console.error('Error saving ANSWERS to index db: ', e)
              }
            } else {
              try {
                await createDocument({
                  studID: studentID,
                  marks: marksObtained,
                  subject: "English Language",
                  results: resultsString,
                });

                await updateUserPoints(1, userInfo.userId);

                showToast("Results submitted successfully!", "success");
                if (userInfo.kinEmail) {
                  await sendEmailToNextOfKin(userInfo, "English Language", marksObtained, new Date());
                }
                await fetchAndUpdateResults(studentID);
              } catch (e) {
                showToast("Failed to save results. Contact the support team for guidance", "error")
                throw e;
              }
            }
          }
          setButtonClicked(false);
        } else {
          console.log("No response from iFrame or button not clicked");
        }
      } catch (e) {
        console.log("Error encountered while communicating with iFrame");
        console.error("Error encountered while communicating with iFrame\n", e);
      }
    };

    window.addEventListener("message", receiveMessage);

    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, [buttonClicked]);

  const handleExitExam = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate("/exam-page");
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    console.log("Submit confirmed");
    sendMessageToIframe();
    setShowSubmitModal(false);
  };

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      showToast(
        "Time's up! The exam is being submitted automatically.",
        "info"
      );
      stopAndCaptureTimer();
      confirmSubmit();
    } else if (timer < 0) {
      setTimer(0);
    }
  }, [timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const stopAndCaptureTimer = () => {
    clearInterval(timerIntervalRef.current);
    setCapturedTime(timer);
  };

  return (
    <Container fluid="true" className="iframe-container" >
      {canDisplayUrl ? (
        <>
          <Row className="justify-content-center my-1">
            <Col md={4} lg={2}>
              <Card className="text-center timer-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faClock} className="timer-icon" />
                  <span className="timer-text">{formatTime()}</span>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Card className="iframe-card">
            <Iframe src={url} id="myIframe" className="iframe-content" />
          </Card>

          {!isCompleted ?
            (
              <div className="exam-controls bg-dark">
                <Button
                  variant="success"
                  onClick={handleConfirmSubmit}
                  disabled={isLoading}
                  className="w-25"
                >
                  {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    "Submit Exam"
                  )}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleExitExam}
                  className="w-25"
                  disabled={isLoading}
                >
                  Exit Exam
                </Button>
              </div>
            )
            :
            <div className="exam-controls bg-dark">
              <Button
                variant="success"
                onClick={() => { navigate('/exam-page') }}
                disabled={isLoading}
                className="w-25"
              >
                Attempt Another Exam
              </Button>
              <Button
                variant="danger"
                onClick={() => { navigate('/') }}
                className="w-25"
              >
                Back to Dashboard
              </Button>
            </div>}

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
          <Modal
            show={showSubmitModal}
            onHide={() => setShowSubmitModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Submission</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to submit your answers? You cannot change
              them after submission.
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmSubmit}>
                Confirm Submit
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <p>URL not allowed for embedding.</p>
      )}
    </Container>
  );
};

export default IframeComponent;
