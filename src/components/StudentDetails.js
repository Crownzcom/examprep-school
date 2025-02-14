import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  ListGroup,
  Container,
  Row,
  Col,
  Tabs,
  Tab,
  Button,
  Badge,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faBookOpen,
  faClock,
  faPercentage,
  faSchool,
  faVenusMars,
  faPhone,
  faEnvelope,
  faGraduationCap,
  faMapMarkerAlt,
  faPaperPlane,
  faCoins,
  faPen,
  faCircleArrowUp,
  faEquals,
  faChartBar,
  faUser,
  faPercent,
  faMedal,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";

const StudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;
  const [key, setKey] = useState("details"); // State to manage active tab key

  if (!student) {
    return (
      <Container className="mt-5">
        <h4>No student details available.</h4>
      </Container>
    );
  }

  // Helper function to display a value or a placeholder if it's null
  const displayValue = (value) => value || "Not provided";

  //To view student results
  function viewResults(resultDetails, subjectName, totalMarks) {
    if (subjectName === "English Language") {
      navigate("/exam-results", { state: { results: resultDetails } });
    } else {
      const questionsData = JSON.parse(resultDetails);
      navigate("/answers", {
        state: { questionsData, subjectName, totalMarks },
      });
    }
  }

  return (
    <Container className="mt-5" style={{ marginTop: "100px" }}>
      <Row>
        <Col md={12}>
          <Tabs
            id="student-details-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3"
          >
            <Tab eventKey="details" title="Student Details">
              <Card className="mb-4" bg="light">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faUserGraduate} className="me-2" />
                    {student.studName}'s Details
                  </Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faUserGraduate} className="me-2" />
                      <strong>Name:</strong> {displayValue(student.studName)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faVenusMars} className="me-2" />
                      <strong>Gender:</strong> {displayValue(student.gender)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      <strong>ID No.:</strong> {displayValue(student.userID)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faPhone} className="me-2" />
                      <strong>Class:</strong> {displayValue(student.studClass)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="me-2"
                      />
                      <strong>Stream:</strong> {displayValue(student.stream)}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="results" title="Exam Results">
              <h3>
                <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                Exam Results
              </h3>
              <Table striped bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th>
                      <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                      Subject
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faPercentage} className="me-2" />
                      Score
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faClock} className="me-2" />
                      Date & Time
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {student.Results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.subject}</td>
                      <td>{result.score}%</td>
                      <td>{result.dateTime}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            viewResults(
                              result.resultDetails,
                              result.subject,
                              result.score
                            )
                          }
                        >
                          Exam Results
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="report" title="Report Card">
              <Card className="mb-4" bg="light">
                <Card.Body>
                  <Card.Title>
                    <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                    {student.studName}'s Data Analysis
                  </Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      <strong>Name:</strong> {displayValue(student.studName)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faEquals} className="me-2" />
                      <strong>Points:</strong> {displayValue(student.gender)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faPercent} className="me-2" />
                      <strong>Exam Mean Mark:</strong>{" "}
                      {displayValue(student.userID)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faChartBar} className="me-2" />
                      <strong>Exam Average Points</strong>{" "}
                      {displayValue(student.studClass)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faTrophy} className="me-2" />
                      <strong>Overall Position</strong>{" "}
                      {displayValue(student.stream)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faMedal} className="me-2" />
                      <strong>Stream Position</strong>{" "}
                      {displayValue(student.stream)}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDetails;
