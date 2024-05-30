import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Container, Row, Col, Card, Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicroscope,
  faCalculator,
  faGlobeAmericas,
  faBookOpen,
  faDna,
  faMountain,
  faLandmark,
  faChartLine,
  faFlask,
  faPalette,
  faSeedling,
  faPray,
  faBookReader,
  faLanguage,
  faComputer,
  faRunning,
  faBible,
  faLightbulb,
  faSpellCheck,
  faMusic,
  faFootballBall,
  faSquareRootAlt,
  faPencilRuler,
  faAtom,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import "./ExamPage.css"; // Import custom CSS

// Map the icon string from JSON to the actual FontAwesomeIcon component
const iconMapping = {
  faMicroscope: faMicroscope,
  faCalculator: faCalculator,
  faGlobeAmericas: faGlobeAmericas,
  faBookOpen: faBookOpen,
  faDna: faDna,
  faMountain: faMountain,
  faLandmark: faLandmark,
  faChartLine: faChartLine,
  faFlask: faFlask,
  faPalette: faPalette,
  faSeedling: faSeedling,
  faPray: faPray,
  faBookReader: faBookReader,
  faLanguage: faLanguage,
  faComputer: faComputer,
  faRunning: faRunning,
  faBible: faBible,
  faLightbulb: faLightbulb,
  faSpellCheck: faSpellCheck,
  faMusic: faMusic,
  faFootballBall: faFootballBall,
  faSquareRootAlt: faSquareRootAlt,
  faPencilRuler: faPencilRuler,
  faAtom: faAtom,
};

function SelectExam() {
  const { userInfo, userPoints, userSubjectData, studentEnrollSubject } = useAuth();

  // console.log(`${userPoints}`);

  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrollSubject, setEnrollSubject] = useState(null);
  const [enroll, setEnroll] = useState(false);

  // Get the subjects for the user's education level
  const subjects = userSubjectData || [];

  const isEnrolled = subjects.some(subject => subject.enrolled === true);

  if (!subjects || !Array.isArray(subjects)) {
    throw new Error("No subjects data found in local storage.");
  }

  const handleCardClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleEnroll = (subject) => {
    setEnrollSubject(subject);
  }

  const handleStartExam = () => {
    const subjectSlug = selectedSubject.name.toLowerCase().replace(/\s+/g, "-"); // Replaces spaces with hyphens
    const levelSlug = userInfo.educationLevel.toLowerCase();
    navigate(`/exam/${subjectSlug}_${levelSlug}`);
  };

  const handleEnrollment = async (subject) => {
    try {
      setEnroll(true);
      setEnrollSubject(null)
      await studentEnrollSubject(userInfo.userDocId, subject.$id);
    } catch (e) { console.error('Failed to enroll: ', e); } finally {
      setEnroll(false);
    }
  };

  const purchasePoints = () => {
    //Navigate to payment page
    navigate(`/select-package`)
  };

  function renderSubjectCard(subject, index, onClick) {
    const cardStyle = subject.enrolled
      ? { borderColor: subject.color || "#000", color: subject.color || "#000" }
      : { borderColor: "#d3d3d3", color: "#000" }; // Grey and black color for not enrolled

    return (
      <Col key={index} md={6} lg={4} className="mb-4">
        <Card
          className="subject-card"
          onClick={() => onClick(subject)}
          style={cardStyle}
        >
          <Card.Body className="text-center">
            <FontAwesomeIcon
              icon={iconMapping[subject.icon]}
              size="4x"
              style={{ color: cardStyle.color }}
            />
            <Card.Title className="mt-3">{subject.name}</Card.Title>
          </Card.Body>
        </Card>
      </Col>
    );
  }

  const subscriptionNotification = () => {
    return (
      <Card className="text-center" border="warning">
        <Card.Header as="h5" className="bg-warning text-white">
          <FontAwesomeIcon icon={faWarning} className="me-2" />
          Subscription Status
        </Card.Header>
        <Card.Body>
          <Card.Title>Access Restricted</Card.Title>
          <Card.Text>
            It looks like your subscription has expired or you haven't subscribed yet. Subscribe now to regain access to all exams and continue enhancing your skills.
          </Card.Text>
          <Button variant="success" onClick={() => { navigate('/select-package') }}>
            Subscribe Now
          </Button>
        </Card.Body>
        <Card.Footer className="text-muted">Need help? Contact our support team.</Card.Footer>
      </Card>

    );
  }

  return (
    <div className="exam-page-bg">
      <Container className="py-5">
        {
          userPoints < 1 ?
            <>{subscriptionNotification()}</>
            :
            <>
              <h2 className="text-center mb-4">Select Your Exam Subject</h2>

              {/* Enrolled Subjects */}
              <h3 className="text-center mb-4 subject-header">Enrolled</h3>
              <Row className="subject-row">
                {isEnrolled ?
                  <>
                    {subjects.map((subject, index) => (
                      subject.enrolled && renderSubjectCard(subject, index, handleCardClick)
                    ))}
                  </> :
                  <Card>
                    <Card.Body>
                      <div className="text-center">
                        <FontAwesomeIcon
                          icon={faBookOpen}
                          size="3x"
                          className="text-muted"
                        />
                        <h5 className="mt-3">No Subject Enrolled for</h5>
                        <p>
                          Looks like you haven't enrolled for any subject. Ready to
                          challenge yourself?
                          Enroll for a subject
                        </p>
                      </div>
                    </Card.Body>
                  </Card>
                }
              </Row>

              {/* Not Enrolled Subjects */}
              {enroll ?
                <>
                  <h3 className="text-center mb-4 subject-header">Enrolling ...</h3>
                  <Loader />
                </>
                :
                <>
                  <h3 className="text-center mb-4 subject-header">Select and Enroll</h3>
                  <Row className="subject-row">
                    {subjects.map((subject, index) => (
                      !subject.enrolled && renderSubjectCard(subject, index, handleEnroll)
                    ))}
                  </Row>
                </>}

              {/* Modal to start an exam */}
              <Modal
                show={selectedSubject !== null}
                onHide={() => setSelectedSubject(null)}
                centered
                style={{
                  borderColor: selectedSubject?.color || "rgb(6, 63, 90) ",
                }}
              >
                <Modal.Header closeButton>
                  <Modal.Title>{selectedSubject?.name} Exam</Modal.Title>
                </Modal.Header>
                {
                  userPoints < 1 ?
                    <>
                      <Modal.Body>
                        <p>"Oops! Your access has expired. Renew your subscription to unlock this exam.</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedSubject(null)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={purchasePoints}
                          style={{
                            backgroundColor: selectedSubject?.color || "rgb(6, 63, 90) ",
                          }}
                        >
                          Subscibe to Exams
                        </Button>
                      </Modal.Footer>
                    </>
                    :
                    <>
                      <Modal.Body>
                        <p>{selectedSubject?.description}</p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedSubject(null)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={handleStartExam}
                          style={{
                            backgroundColor: selectedSubject?.color || "rgb(6, 63, 90) ",
                          }}
                        >
                          Start Exam
                        </Button>
                      </Modal.Footer>
                    </>
                }
              </Modal>

              {/* Modal to enroll for a subject */}
              <Modal
                show={enrollSubject !== null}
                onHide={() => setEnrollSubject(null)}
                centered
                style={{
                  borderColor: enrollSubject?.color || "rgb(6, 63, 90) ",
                }}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Enroll for  {enrollSubject?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>{enrollSubject?.description}</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setEnrollSubject(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleEnrollment(enrollSubject) && setEnrollSubject(null)}
                    style={{
                      backgroundColor: enrollSubject?.color || "rgb(6, 63, 90) ",
                    }}
                  >
                    Enroll
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
        }
      </Container>
    </div>
  );

}

export default SelectExam;
