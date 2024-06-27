// StudentDashboard.js
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faEdit } from "@fortawesome/free-solid-svg-icons";
import RecentResults from "../RecentResults";
import { useNavigate } from "react-router-dom";
import {
  getTransformedResults,
  fetchResults,
} from "../../utilities/resultsUtil";
import { useAuth } from "../../context/AuthContext";


const StudentDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [results, setResults] = useState([]);
  const [resultsId, setResultsId] = useState('')
  const [noResultsData, setNoResultsData] = useState(false);

  //To view student results
  const viewResults = async (resultsID, subjectName, totalMarks, attemptDate, totalPossibleMarks) => {
    try {
      setResultsId(resultsID);
      console.log(`fecthing results..resultsID: ${totalPossibleMarks}`)
      const results = await fetchResults(resultsID, userInfo.userID);
      // console.log('Finsihed fetching', results);

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

  useEffect(() => {
    const userID = userInfo?.userID;
    const results = async () => {
      if (userID) {
        const transformedData = await getTransformedResults(userID);
        // if (JSON.stringify(transformedData) !== JSON.stringify(results)) {
        //   setResults(transformedData);
        // }
        setResults(transformedData);
      }
    };

    results();

  }, [userInfo]); // Only re-run the effect if userInfo or results change

  const attemptExam = () => {
    navigate("/exam-page");
  };

  return (
    <>
      <Row>
        <RecentResults results={results} onViewResults={viewResults} />
        <Col lg={6}>
          <Card className="mb-4 shadow">
            <Card.Body>
              <Card.Title>Actions</Card.Title>
              <Button
                variant="success"
                className="me-2"
                onClick={() => navigate("/all-results")}
              >
                <FontAwesomeIcon icon={faChartLine} /> View All Results
              </Button>
              <Button variant="warning" onClick={attemptExam}>
                <FontAwesomeIcon icon={faEdit} /> Attempt Exam
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default StudentDashboard;
