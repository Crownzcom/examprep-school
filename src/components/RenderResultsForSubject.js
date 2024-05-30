// RenderResultsForSubject.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Pagination } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faBan } from "@fortawesome/free-solid-svg-icons";

const RenderResultsForSubject = ({ results = [] }) => {
  const [openSubjects, setOpenSubjects] = useState({});
  const [currentPage, setCurrentPage] = useState({});
  const navigate = useNavigate();

  // Assuming 10 items per page
  const itemsPerPage = 10;

  // Toggle the open state of a subject
  const toggleSubject = (subject) => {
    setOpenSubjects((prevOpenSubjects) => ({
      ...prevOpenSubjects,
      [subject]: !prevOpenSubjects[subject],
    }));
    setCurrentPage((prevCurrentPage) => ({
      ...prevCurrentPage,
      [subject]: 1, // Reset to first page
    }));
  };

  // Pagination logic for a specific subject
  const paginate = (subject, pageNumber) => {
    setCurrentPage((prevCurrentPage) => ({
      ...prevCurrentPage,
      [subject]: pageNumber,
    }));
  };

  // Function to render pagination
  const renderPagination = (subject, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage[subject]}
          onClick={() => paginate(subject, number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  const viewResults = (resultDetails) => {
    navigate("/exam-results", { state: { results: resultDetails } });
  };

  return (
    <>
      {results.map((subjectResults) => {
        const totalResults = subjectResults.attempts.length;
        const currentPageNumber = currentPage[subjectResults.subject] || 1;
        const indexOfLastResult = currentPageNumber * itemsPerPage;
        const indexOfFirstResult = indexOfLastResult - itemsPerPage;
        const currentSubjectResults = subjectResults.attempts.slice(
          indexOfFirstResult,
          indexOfLastResult
        );

        return (
          <Card className="mb-4" key={subjectResults.subject}>
            <Card.Header
              onClick={() => toggleSubject(subjectResults.subject)}
              style={{ cursor: "pointer" }}
            >
              {subjectResults.subject}
            </Card.Header>
            {openSubjects[subjectResults.subject] && (
              <>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubjectResults.map((attempt, idx) => {
                      const absoluteNumber = indexOfFirstResult + idx + 1;
                      return (
                        <tr key={idx}>
                          <td>{absoluteNumber}</td>
                          <td>{attempt.date}</td>
                          <td>{attempt.score}</td>
                          <td>
                            {/* Assuming viewResults logic is inside RenderResultsForSubject */}
                            <Button
                              variant="primary"
                              onClick={() => viewResults(attempt.resultDetails)}
                            >
                              <FontAwesomeIcon icon={faEye} /> View Exam
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {renderPagination(subjectResults.subject, totalResults)}
              </>
            )}
          </Card>
        );
      })}
    </>
  );
};

export default RenderResultsForSubject;
