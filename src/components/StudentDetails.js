import React, { useEffect, useState } from "react";
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
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faBookOpen,
  faClock,
  faPercentage,
  faArrowLeft,
  faVenusMars,
  faPhone,
  faEnvelope,
  faGraduationCap,
  faPaperPlane,
  faEquals,
  faChartBar,
  faUser,
  faPercent,
  faAward,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

import {
  calculateAveragePoints,
  calculateExamMeanMark,
  calculateOverallPosition,
  calculateStreamPosition,
  calculateTotalPoints,
} from "../utilities/studentMetrics";
import "./../components/StudentDetails.css";
import db from "../db";

const StudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;
  const [key, setKey] = useState("details"); // State to manage active tab key
  const [students, setStudents] = useState([]);

  // Fetch all students data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setStudents(await db.students.toArray());
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };

    fetchData();
  }, []);

  console.log("Students details data: ", students);

  // Get updated rankings for all students in the same class
  const studentsWithOverall = calculateOverallPosition(
    students,
    student.studClass
  );
  const studentsWithStream = calculateStreamPosition(
    students,
    student.studClass,
    student.stream
  );

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

  console.log("Student details: ", student);

  return (
    <Container className="mt-5" style={{ marginTop: "100px" }}>
      <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
        Back
      </button>

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
                    {student.studName}'s Metrics
                  </Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      <strong>Name:</strong> {displayValue(student.studName)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faEquals} className="me-2" />
                      <strong>Points:</strong> {calculateTotalPoints(student)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faPercent} className="me-2" />
                      <strong>Exam Mean Mark (%):</strong>{" "}
                      {calculateExamMeanMark(student)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faChartBar} className="me-2" />
                      <strong>Exam Average Points</strong>{" "}
                      {calculateAveragePoints(student)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faChartLine} className="me-2" />
                      <strong>Overall Position</strong>{" "}
                      {
                        studentsWithOverall.find(
                          (s) => s.userID === student.userID
                        )?.overallPosition
                      }
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FontAwesomeIcon icon={faAward} className="me-2" />
                      <strong>Stream Position</strong>{" "}
                      {
                        studentsWithStream.find(
                          (s) => s.userID === student.userID
                        )?.streamPosition
                      }
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
