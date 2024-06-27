import React, { useState, useEffect } from "react";
import {
  Table,
  Container,
  Row,
  Col,
  Card,
  Modal,
  Button,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faBan,
  faGraduationCap,
  faChartLine,
  faBookOpen,
  faCaretDown,
  faCaretUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  databases,
  database_id,
  studentMarksTable_id,
  Query,
} from "../appwriteConfig";
import "./AllResults.css";
import { useAuth } from "../context/AuthContext";
import {
  fetchAndUpdateResults,
  getTransformedResults,
  fetchResults,
} from "../utilities/resultsUtil";
import SelectExam from "./SelectExam";
import HeroHeader from "./HeroHeader";

const AllResults = () => {
  const [openSubjects, setOpenSubjects] = useState({}); // State to track the open state of each subject
  const [results, setResults] = useState([]);
  const [resultsId, setResultsId] = useState('')
  const [refreshResults, setRefreshResults] = useState(false);
  const [noResultsData, setNoResultsData] = useState(false);
  const [currentPage, setCurrentPage] = useState({});

  const handleClose = () => setNoResultsData(false); //Close modal

  const itemsPerPage = 5; // Number of results per page
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const viewResults = async (resultsID, subjectName, totalMarks, attemptDate, totalPossibleMarks) => {
    try {
      setResultsId(resultsID);
      // console.log(`fecthing results..resultsID: ${resultsID}`)
      const results = await fetchResults(resultsID, userInfo.userID);
      // console.log('Finsihed fetching');
      const questionsData = JSON.parse(results);

      if (Array.isArray(questionsData)) {
        if (questionsData.length < 1) {
          // console.log('No results found');
          setNoResultsData(true);
          return
        }
        setNoResultsData(false);
        //questionsData, subjectName, totalMarks, attemptDate, totalPossibleMarks
        navigate('/answers', { state: { questionsData, subjectName, totalMarks, attemptDate, totalPossibleMarks } });
        // navigate('/answers', { state: { questionsData, subjectName, totalMarks, attemptDate } });
      }
      else {
        // console.log('No results to render: ', questionsData);
        setNoResultsData(true);
      }

    } catch (err) {
      console.error('Failed to either fetch results data, or navigate to answers page', err);
      throw new Error('Failed to navigate to answers page: ', err);
    }
  };

  const calculatePercentageScore = (totalMarks, totalPossibleMarks) => {
    let totalScore = parseFloat(totalMarks);
    let totalPossibleScore = parseFloat(totalPossibleMarks);
    // console.log(`Total Score: ${totalScore}, Possible Score: ${totalPossibleScore}`);

    if (isNaN(totalScore)) {
      // console.log('Invalid score values');
      return null;
    }

    if (totalPossibleScore === 0 || isNaN(totalPossibleScore)) {
      // console.log('Total possible score is 0, cannot calculate percentage');
      return totalScore;
    }

    let percentage = (totalScore / totalPossibleScore) * 100;
    let roundedPercentage = Math.round(percentage * 10) / 10;
    // console.log('Percentage calculated: ' + roundedPercentage + '%');
    return `${roundedPercentage}`;
  };

  useEffect(() => {
    const fetchResults = async () => {
      const userID = userInfo?.userID;
      if (userID) {
        const transformedData = await getTransformedResults(userID);
        setResults(transformedData);
      }
    };

    fetchResults();
  }, [userInfo]); // Only re-run the effect if userInfo changes

  // Toggle the open state of a subject and reset its pagination
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

  // Pagination for a specific subject
  const paginate = (subject, pageNumber) => {
    setCurrentPage((prevCurrentPage) => ({
      ...prevCurrentPage,
      [subject]: pageNumber,
    }));
  };

  // Render pagination for a specific subject
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

  async function updateResults() {
    setRefreshResults(true);
    await fetchAndUpdateResults(userInfo.userID);
    setRefreshResults(false);
    navigate("/all-results");
  }

  //Function to render the Hero-Header
  const renderHeroHeader = () => (
    <HeroHeader>
      <h1 className="display-4">
        <FontAwesomeIcon icon={faGraduationCap} className="me-2" /> Your Exam
        Dashboard
      </h1>
      <p className="lead">
        Ready to ace your exams? Track your progress and take on new challenges!
      </p>
      <Row className="justify-content-center">
        <Col xs="auto">
          <Button variant="light" onClick={() => navigate("/exam-page")}>
            <FontAwesomeIcon icon={faBookOpen} className="me-2" />
            Attempt an Exam
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="secondary"
            hidden
          // onClick={() => navigate("/exam-page")} //Navigate to chart page
          >
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            View Statistics
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="dark"
            onClick={updateResults}
            disabled={refreshResults === true}
          >
            {refreshResults ? (
              <Spinner animation="grow" variant="light" />
            ) : (
              "Refresh Results"
            )}
          </Button>
        </Col>
      </Row>
    </HeroHeader>
  );

  // Function to render results for each subject
  const renderResultsForSubject = (subjectResults) => {
    const totalResults = subjectResults.attempts.length;
    const indexOfLastResult =
      (currentPage[subjectResults.subject] || 1) * itemsPerPage;
    const indexOfFirstResult = indexOfLastResult - itemsPerPage;
    const currentSubjectResults = subjectResults.attempts.slice(
      indexOfFirstResult,
      indexOfLastResult
    );

    return (
      <Card className="mb-4" key={subjectResults.subject}>
        <Card.Header
          onClick={() => toggleSubject(subjectResults.subject)}
          style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>
            {subjectResults.subject === "sst_ple"
              ? "Social Studies"
              : subjectResults.subject === "math_ple"
                ? "Mathematics"
                : subjectResults.subject === "sci_ple"
                  ? "Science"
                  : subjectResults.subject}
          </span>
          <span>
            {openSubjects[subjectResults.subject] ? (
              <FontAwesomeIcon icon={faCaretUp} />
            ) : (
              <FontAwesomeIcon icon={faCaretDown} />
            )}
          </span>
        </Card.Header>
        {openSubjects[subjectResults.subject] && (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Date</th>
                  <th>Score (%)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentSubjectResults.map((attempt, idx) => {
                  // Calculate the absolute number based on the current page and items per page
                  const absoluteNumber = indexOfFirstResult + idx + 1;
                  return (
                    <tr key={idx}>
                      <td>{absoluteNumber}</td>
                      <td>{attempt.dateTime}</td>
                      <td>{calculatePercentageScore(attempt.score, attempt.totalPossibleMarks)}</td>
                      <td>
                        {attempt.resultsID ? (
                          <Button
                            // className='btn-cancel'
                            variant="dark"
                            onClick={async () => { await viewResults(attempt.resultsID, subjectResults.subject, attempt.score, attempt.dateTime, attempt.totalPossibleMarks) }}
                          >
                            <FontAwesomeIcon icon={faEye} className="me-2" />
                            Exam Results
                          </Button>
                        ) : (
                          <span className="text-muted">
                            <FontAwesomeIcon icon={faBan} className="me-2" />
                            No data
                          </span>
                        )}
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
  };

  // Check if there are no results
  const noResultsAvailable = results.length === 0;

  return (
    <>
      {renderHeroHeader()}
      <Container fluid>
        <Row>
          {noResultsAvailable ? (
            <>
              <Alert variant="info">
                <Alert.Heading>No Results Available</Alert.Heading>
                <p>
                  It looks like you haven't completed any exams yet.Select any
                  of the exams below to seat for.
                </p>
                <hr />
                <div className="d-flex justify-content-center"></div>
              </Alert>
              <Card>
                <SelectExam />
              </Card>
            </>
          ) : (
            <>
              <Col>
                {
                  results
                    .filter((_, index) => index % 2 === 0)
                    .map(renderResultsForSubject) // Render even indexed items
                }
              </Col>
              <Col lg={6} md={12}>
                {" "}
                {/* Right Column for larger screens, full width for smaller screens */}
                {
                  !noResultsAvailable &&
                  results
                    .filter((_, index) => index % 2 !== 0)
                    .map(renderResultsForSubject) // Render odd indexed items
                }
              </Col>
            </>
          )}
        </Row>
      </Container>

      {/* MODAL TO SHOW RESULTS DATA NOT AVAILABLE TO RENDER */}
      <Modal show={noResultsData} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Results Unvailable!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <b>Results ID: {resultsId}</b>
          <p>
            The results for this exam can not be displayed. They are either missing or not supported to be displayed.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AllResults;

