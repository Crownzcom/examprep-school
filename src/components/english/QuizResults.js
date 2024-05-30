import React, { useState, useEffect } from "react";
import { Row, Col, Modal, Button, ButtonGroup, Card, ListGroup } from "react-bootstrap";
import "./iframes.css";
import { useLocation, useNavigate } from "react-router-dom";

const QuizResults = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  let results = location.state?.results;
  if (typeof results === "string") {
    results = JSON.parse(results);
  }

  useEffect(() => {
    if (!results) {
      setShowModal(true);
    }
  }, [results]);

  const handleClose = () => {
    navigate(-1); // Navigate back to the previous page
  };

  if (!results) {
    // Handle the case where results are not passed
    return (
      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>No Data Available</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Unfortunately, the quiz results data is not available. Please try
          accessing the quiz again.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  let numbering = 1;

  const createMarkup = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    doc.querySelectorAll("input").forEach((input) => {
      input.setAttribute("disabled", "disabled");
    });
    return { __html: doc.body.innerHTML };
  };

  const renderQuizQuestions = (categoryResult) => (
    <Card key={categoryResult.category} className="mb-4">
      <Card.Body>
        <Card.Title className="mb-3">{categoryResult.instruction}</Card.Title>
        <ListGroup variant="flush">
          {categoryResult.questions.map((questionResult, qIndex) => (
            <ListGroup.Item
              key={`${categoryResult.category}_${qIndex}`}
              className="card-body"
            >
              <Card.Subtitle className="mb-2">
                {numbering++}:{" "}
                <span
                  dangerouslySetInnerHTML={createMarkup(
                    questionResult.question
                  )}
                />
              </Card.Subtitle>
              <Card.Text>
                <p
                  className={`mb-1 ${questionResult.userAnswer.toLowerCase() ===
                    questionResult.correctAnswer.toLowerCase()
                    ? "text-success"
                    : "text-danger"
                    }`}
                >
                  Your answer: {questionResult.userAnswer}
                </p>
                {questionResult.userAnswer.toLowerCase() !==
                  questionResult.correctAnswer.toLowerCase() && (
                    <p className="text-success mb-1">
                      Correct answer: {questionResult.correctAnswer}
                    </p>
                  )}
                <p className="mb-0">
                  Marks:{" "}
                  <span
                    className={`badge ${questionResult.marks > 0 ? "bg-success" : "bg-danger"
                      }`}
                  >
                    {questionResult.marks}
                  </span>
                </p>
              </Card.Text>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  const renderIframeResults = (iframeResults) => (
    <div className="mb-4">
      {iframeResults.map((iframeResult, index) => (
        <div key={index} className="card mb-2">
          <div className="card-body">
            <div dangerouslySetInnerHTML={createMarkup(iframeResult.story)} />
            <p className="mb-0">
              Marks:{" "}
              <span
                className={`badge ${iframeResult.totalMarks > 0 ? "bg-success" : "bg-danger"
                  }`}
              >
                {iframeResult.totalMarks}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  // Calculate the total marks including iframe marks
  const finalMarks = results.find((result) => result.type === "finalMarks") || {
    totalMarks: 0,
    marksObtained: 0,
  };

  const iframeResults = results.filter(
    (result) => result.type === "iframeQuestion"
  );

  const totalMarks = finalMarks.totalMarks;
  const marksObtained = finalMarks.marksObtained;
  const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;

  return (
    <div className="container my-4" style={{}} >
      <div className="card text-center mb-4">
        <div className="card-header">Exam Results</div>
        <div className="card-body">
          <h5 className="card-title">
            Score: {marksObtained}/{totalMarks}
          </h5>
          <p className="card-text">Percentage: {percentage.toFixed(2)}%</p>
        </div>
      </div>

      {results
        .filter(
          (result) =>
            result.type !== "iframeQuestion" && result.type !== "finalMarks"
        )
        .map((categoryResult) => renderQuizQuestions(categoryResult))}

      {renderIframeResults(iframeResults)}

      {/* Navigation Buttons */}
      {/* <Container fluid style={{}}> */}
      <Row >
        <Col xs={12} className="" style={{ marginBottom: '1.8rem' }}>
          <div className="d-flex justify-content-center">
            <ButtonGroup className="w-75">
              <Button
                variant="success"
                onClick={() => { navigate('/exam-page') }}
              >
                Attempt another Exam
              </Button>
              <Button
                variant="info"
                onClick={() => { navigate('/') }}
              >
                Back to Dashboard
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
      {/* </Container> */}
    </div>
  );
};

export default QuizResults;
