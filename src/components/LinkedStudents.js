// LinkedStudents.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  ButtonGroup,
  Container,
  Row,
  Col,
  Table,
  Pagination,
  Badge,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faTable,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import storageUtil from "../utilities/storageUtil";
import "./LinkedStudents.css"; // Custom CSS for additional styling

const LinkedStudents = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  const linkedStudents = storageUtil.getItem("studentData") || [];
  const totalItems = linkedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = linkedStudents.slice(startIndex, endIndex);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to navigate to student details
  const navigateToStudentDetails = (student) => {
    navigate("/student-details", { state: { student } });
  };

  const renderStudentsAsCards = () => (
    <Row>
      {currentStudents.map((student, index) => (
        <Col md={4} key={index}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>{student.studName}</Card.Title>
              <Card.Text>
                Education Level: {student.educationLevel || "N/A"}
              </Card.Text>

              {/* EXAM CREDITS/POINTS LEFT */}
              {/* <Card.Text>
                Points Left:  <Badge bg={student.pointsBalance < 20 ? 'danger' : 'success'} style={{ fontSize: '0.9em' }}>
                  {student.pointsBalance}
                </Badge>
              </Card.Text> */}

              <ButtonGroup>
                <Button
                  variant="outline-dark"
                  onClick={() => navigateToStudentDetails(student)}
                  style={{ fontSize: '0.8rem' }}
                >
                  View Details
                </Button>

                {/* EXAM CREDITS/POINTS LEFT */}
                {/* <Button
                  variant={`outline-${student.pointsBalance < 20 ? 'danger' : 'success'}`}
                  onClick={() => navigateToStudentDetails(student)}
                  style={{ fontSize: '0.8rem' }}
                >
                  Top Up Points
                </Button> */}
              </ButtonGroup>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderStudentsAsTable = () => (
    <Table striped bordered hover >
      <thead>
        <tr>
          <th>Name</th>
          <th>Education Level</th>
          {/* <th>Points Left</th> */}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {currentStudents.map((student, index) => (
          <tr key={index}>
            <td>{student.studName}</td>
            <td>{student.educationLevel || "N/A"}</td>
            {/* <td>{student.pointsBalance}</td> */}
            <td>
              <ButtonGroup >
                <Button
                  variant="outline-dark"
                  onClick={() => navigateToStudentDetails(student)}
                  style={{ fontSize: '0.8rem' }}
                >
                  View Details
                </Button>

                {/* EXAM CREDITS/POINTS LEFT */}
                {/* <Button
                  variant={`outline-${student.pointsBalance < 20 ? 'danger' : 'success'}`}
                  onClick={() => navigateToStudentDetails(student)}
                  style={{ fontSize: '0.8rem' }}
                >
                  Top Up Points
                </Button> */}
              </ButtonGroup>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  // Pagination component
  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  return (
    <Container className="my-5" style={{ marginTop: "100px" }} >
      <h1>Linked Students</h1>
      <div className="view-mode-selector mb-3">
        <ButtonGroup>
          <Button
            variant="outline-secondary"
            onClick={() => setViewMode("cards")}
          >
            <FontAwesomeIcon icon={faThLarge} /> Cards View
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setViewMode("table")}
          >
            <FontAwesomeIcon icon={faTable} /> Table View
          </Button>
        </ButtonGroup>
      </div>
      {viewMode === "cards" ? renderStudentsAsCards() : renderStudentsAsTable()}
      <div className="pagination-wrapper">{renderPagination()}</div>
    </Container>
  );
};

export default LinkedStudents;
