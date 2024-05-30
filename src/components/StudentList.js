import React from 'react';
import { Spinner, Button, Card, Table, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import Loader from './Loader'

const StudentList = ({ StudentList, itemsPerPage, currentPage, paginate, loader }) => {
  const navigate = useNavigate();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = StudentList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="shadow-sm mb-4 profile-card">
      <Card.Header>
        <FontAwesomeIcon icon={faUsers} className="me-2" />
        Students
      </Card.Header>
      <Card.Body>
        {
          loader ?
            <>
              <Spinner animation="grow" variant="primary" />
              <Spinner animation="grow" variant="success" />
              <Spinner animation="grow" variant="danger" />
              <Spinner animation="grow" variant="warning" />
              <Spinner animation="grow" variant="info" />
            </>

            :
            <Table hover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Name</th>
                  <th>Education Level</th>
                  <th>Exams Finished</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedStudents.map((student, index) => (
                  <tr key={student.studID}>
                    <td>{startIndex + index + 1}</td>
                    <td>{student.studName}</td>
                    <td>{student.educationLevel}</td>
                    <td>{student.Results.length}</td>
                    <td>
                      <Button
                        variant="dark"
                        onClick={() =>
                          navigate("/student-details", { state: { student } })
                        }
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        }
        <Nav aria-label="Page navigation">
          <ul className="pagination">
            {Array.from(
              { length: Math.ceil(StudentList.length / itemsPerPage) },
              (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}
                    `}
                >
                  <Button variant="link" onClick={() => paginate(i + 1)}>
                    {i + 1}
                  </Button>
                </li>
              )
            )}
          </ul>
        </Nav>
      </Card.Body>
    </Card>
  );
};

export default StudentList;
