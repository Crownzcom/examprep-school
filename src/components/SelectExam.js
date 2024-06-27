import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faWarning, faRefresh } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import db from '../db';
import { fetchSetExams } from '../utilities/fetchStudentData';
import './ExamPage.css'; // Import custom CSS

function SelectExam() {
  const { userInfo } = useAuth();

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshExams, setRefreshExams] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchExamsAndResults = async () => {
      try {
        const [examsData, resultsData] = await Promise.all([
          db.exams.toArray(),
          db.results.toArray()
        ]);

        const doneExamIDs = resultsData.map(result => result.examID);

        // Filter out the exams that have already been done
        const filteredExams = examsData.filter(exam => !doneExamIDs.includes(exam.examID));

        // Convert dates to ISO 8601 format
        const formattedExams = filteredExams.map(exam => ({
          ...exam,
          openingDate: moment(exam.openingDate, 'MM/DD/YYYY, HH:mm:ss').toISOString(),
          closingDate: moment(exam.closingDate, 'MM/DD/YYYY, HH:mm:ss').toISOString()
        }));

        setExams(formattedExams);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch exams and results:", error);
        setLoading(false);
      }
    };

    fetchExamsAndResults();
  }, []);

  const navigate = useNavigate();

  const handleCardClick = (exam) => {
    const now = moment();
    const openingDate = moment(exam.openingDate);
    const closingDate = moment(exam.closingDate);
    const sevenDaysAgo = moment().subtract(7, 'days');

    if (now.isBefore(openingDate)) {
      setModalMessage("This exam is not yet active.");
    } else if (now.isAfter(closingDate)) {
      if (closingDate.isAfter(sevenDaysAgo)) {
        setModalMessage("This exam is closed and no longer accepting attempts.");
      } else {
        return;
      }
    } else {
      setSelectedExam(exam);
      return;
    }
    setSelectedExam(exam);
  };

  const handleStartExam = () => {
    const examID = selectedExam.examID;
    navigate(`/exam/${examID}`);
  };

  const refreshExams = async () => {
    try {
      setRefreshExams(true);
      await fetchSetExams(userInfo);
      const examsData = await db.exams.toArray();
      const resultsData = await db.results.toArray();

      const doneExamIDs = resultsData.map(result => result.examID);

      // Filter out the exams that have already been done
      const filteredExams = examsData.filter(exam => !doneExamIDs.includes(exam.examID));

      const formattedExams = filteredExams.map(exam => ({
        ...exam,
        openingDate: moment(exam.openingDate, 'MM/DD/YYYY, HH:mm:ss').toISOString(),
        closingDate: moment(exam.closingDate, 'MM/DD/YYYY, HH:mm:ss').toISOString()
      }));
      setExams(formattedExams);
    } catch (e) {
      console.error('Failed to refresh exams:', e);
    } finally {
      setRefreshExams(false);
    }
  }

  const renderExamCard = (exam, index, onClick) => (
    <Col key={index} md={6} lg={4} className="mb-4">
      <Card
        className="exam-card"
        onClick={() => onClick(exam)}
      >
        <Card.Body className="text-center">
          <FontAwesomeIcon size="4x" icon={faBookOpen} />
          <Card.Title className="mt-3">{exam.subjectName.toUpperCase()}</Card.Title>
          <Card.Text>
            <strong>Exam ID:</strong> {exam.examID} <br />
            <strong>Opening Date:</strong> {moment(exam.openingDate).format('MM/DD/YYYY, HH:mm:ss')} <br />
            <strong>Closing Date:</strong> {moment(exam.closingDate).format('MM/DD/YYYY, HH:mm:ss')} <br />
            <strong>Duration:</strong> {exam.durationMINS} mins
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );

  const examsNotAvailableNotification = () => (
    <>
      <Card className="text-center" border="warning">
        <Card.Header as="h5" className="bg-warning text-white">
          <FontAwesomeIcon icon={faWarning} className="me-2" />
          Exams Status
        </Card.Header>
        <Card.Body>
          <Card.Title>Exams not Available</Card.Title>
          <Card.Text>
            It looks like you have no exam today. Continue reading your books for your future exams to come. Good luck!
          </Card.Text>
        </Card.Body>
        <Card.Footer className="text-muted">Need help? Talk with your class teacher or computer lab teacher.</Card.Footer>
      </Card>
      <Button variant="outline-success" onClick={refreshExams} disabled={isRefreshExams}>
        {isRefreshExams ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
        Refresh Exams
      </Button>
    </>
  );

  const categorizeExams = () => {
    const now = moment();
    const sevenDaysAgo = moment().subtract(7, 'days');

    const activeAndOpen = [];
    const notYetActive = [];
    const closedExams = [];

    exams.forEach(exam => {
      const openingDate = moment(exam.openingDate);
      const closingDate = moment(exam.closingDate);

      if (now.isBetween(openingDate, closingDate)) {
        activeAndOpen.push(exam);
      } else if (now.isBefore(openingDate)) {
        notYetActive.push(exam);
      } else if (now.isAfter(closingDate) && closingDate.isAfter(sevenDaysAgo)) {
        closedExams.push(exam);
      }
    });

    return { activeAndOpen, notYetActive, closedExams };
  };

  const { activeAndOpen, notYetActive, closedExams } = categorizeExams();

  return (
    <div className="exam-page-bg">
      <Container className="py-5 my-3">
        {loading ? (
          <Loader />
        ) : (
          <>
            <Button variant="outline-success" onClick={refreshExams} disabled={isRefreshExams}>
              {isRefreshExams ? <Spinner animation="border" size="m" /> : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
              Refresh Exams
            </Button>

            <Card className="my-3">
              <Card.Body>
                <h4 className="text-center mb-4">Active and Open Exams</h4>
                {
                  activeAndOpen.length > 0 ?
                    (
                      <>
                        <Row className="subject-row">
                          {activeAndOpen.map((exam, index) => renderExamCard(exam, index, handleCardClick))}
                        </Row>
                      </>
                    )
                    :
                    <>
                      <Alert variant='info'>
                        No Open and Active Exams Currently.
                      </Alert>
                    </>
                }
              </Card.Body>
            </Card>

            <Card className="my-3">
              <Card.Body>

                <h4 className="text-center mb-4">Future Exams</h4>
                {notYetActive.length > 0 ?
                  (
                    <>
                      <Row className="subject-row">
                        {notYetActive.map((exam, index) => renderExamCard(exam, index, handleCardClick))}
                      </Row>
                    </>
                  )
                  :
                  <>
                    <Alert variant='info'>
                      No Future Exams Available.
                    </Alert>
                  </>}
              </Card.Body>
            </Card>

            {/* <Card className="my-3">
              <Card.Body>

                {closedExams.length > 0 && (
                  <>
                    <h4 className="text-center mb-4">Recently Closed Exams</h4>
                    <Row className="subject-row">
                      {closedExams.map((exam, index) => renderExamCard(exam, index, handleCardClick))}
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card> */}

            {activeAndOpen.length === 0 && notYetActive.length === 0 && closedExams.length === 0 && (
              <>{examsNotAvailableNotification()}</>
            )}

            <Modal
              show={selectedExam !== null && modalMessage !== ""}
              onHide={() => {
                setSelectedExam(null);
                setModalMessage("");
              }}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Exam Status</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>{modalMessage}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedExam(null);
                    setModalMessage("");
                  }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal
              show={selectedExam !== null && modalMessage === ""}
              onHide={() => setSelectedExam(null)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>{selectedExam?.subjectName.toUpperCase()} Exam</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p><strong>Exam ID:</strong> {selectedExam?.examID}</p>
                {selectedExam?.description && (<p><strong>Description:</strong> {selectedExam?.description}</p>)}
                <p><strong>Opening Date:</strong> {moment(selectedExam?.openingDate).format('MM/DD/YYYY, HH:mm:ss')}</p>
                <p><strong>Closing Date:</strong> {moment(selectedExam?.closingDate).format('MM/DD/YYYY, HH:mm:ss')}</p>
                <p><strong>Duration:</strong> {selectedExam?.durationMINS} mins</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedExam(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleStartExam}
                  style={{
                    backgroundColor: "rgb(6, 63, 90)"
                  }}
                >
                  Start Exam
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </Container>
    </div>
  );
}

export default SelectExam;
