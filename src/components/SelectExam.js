import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Modal, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faWarning, faRefresh } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import db from '../db';
import { fetchSetExams } from "../utilities/fetchStudentData";
import "./ExamPage.css"; // Import custom CSS

function SelectExam() {
  const { userInfo } = useAuth();

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshExams, setRefreshExams] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsData = await db.exams.toArray();
        setExams(examsData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const navigate = useNavigate();

  const handleCardClick = (exam) => {
    setSelectedExam(exam);
  };

  const handleStartExam = () => {
    const examID = selectedExam.examID;
    navigate(`/exam/${examID}`);
  };

  function renderExamCard(exam, index, onClick) {
    return (
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
              <strong>Opening Date:</strong> {exam.openingDate} <br />
              <strong>Closing Date:</strong> {exam.closingDate} <br />
              <strong>Duration:</strong> {exam.durationMINS} mins
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    );
  }

  const examsNotAvailableNotification = () => {
    return (
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
  }

  const refreshExams = async () => {
    try {
      setRefreshExams(true);
      await fetchSetExams(userInfo.studClass, userInfo.stream);
      const examsData = await db.exams.toArray();
      setExams(examsData);
    } catch (e) {
      console.error('Failed to fetch students:', e);
    } finally {
      setRefreshExams(false);
    }
  }

  return (
    <div className="exam-page-bg">
      <Container className="py-5">
        {loading ? (
          <Loader />
        ) : exams.length === 0 ? (
          <>{examsNotAvailableNotification()}</>
        ) : (
          <>
            <Button variant="outline-success" onClick={refreshExams} disabled={isRefreshExams}>
              {isRefreshExams ? <Spinner animation="border" size="m" /> : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
              Refresh Exams
            </Button>

            <h3 className="text-center mb-4 subject-header">Available Exams</h3>

            <Row className="subject-row">
              {exams.map((exam, index) => renderExamCard(exam, index, handleCardClick))}
            </Row>

            <Modal
              show={selectedExam !== null}
              onHide={() => setSelectedExam(null)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>{selectedExam?.subjectName.toUpperCase()} Exam</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p><strong>Exam ID:</strong> {selectedExam?.examID}</p>
                {selectedExam?.description && (<p><strong>Description:</strong> {selectedExam?.description}</p>)}
                <p><strong>Opening Date:</strong> {selectedExam?.openingDate}</p>
                <p><strong>Closing Date:</strong> {selectedExam?.closingDate}</p>
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
