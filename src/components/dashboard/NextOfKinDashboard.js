import React, { useState, useEffect } from "react";
import { Badge, Row, Col, Card, Table, Button, ButtonGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import storageUtil from "../../utilities/storageUtil";
import './NextOfKinDashboard.css';

const NextOfKinDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      const linkedStudentsData = storageUtil.getItem("studentData") || [];
      const studentsWithResults = await Promise.all(linkedStudentsData.map(async (student) => {
        const results = await getMostRecentResult(student.Results);
        return { ...student, ...results };
      }));
      console.log('studentsWithResults: ', studentsWithResults);
      setStudents(studentsWithResults);
    };

    fetchStudentData();
  }, []);

  //Calculate Results score as percentage
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
    return `${roundedPercentage} %`;
  };

  // Function to get the most recent result of each student
  const getMostRecentResult = async (results) => {
    if (!results || results.length === 0)
      return { subjectName: "N/A", recentScore: "N/A", lastExamDateTime: "N/A" };

    const mostRecent = results.reduce((latest, current) => {
      return new Date(latest.dateTime) > new Date(current.dateTime) ? latest : current;
    });

    return {
      subjectName: mostRecent.subject,
      resultDetails: mostRecent.resultDetails,
      recentScore: `${calculatePercentageScore(mostRecent.score, mostRecent.totalPossibleMarks)}`,
      score: mostRecent.score ? mostRecent : null, //Sent to the /answers endpoint
      totalPossibleMarks: mostRecent.totalPossibleMarks ? mostRecent.totalPossibleMarks : null,
      lastExamDateTime: new Date(mostRecent.dateTime).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  //To view student results
  function viewResults(resultDetails, subjectName, totalMarks, totalPossibleMarks, attemptDate) {
    // console.log(`total marks: ${totalMarks}, possible marks: ${totalPossibleMarks}`);
    if (subjectName === "English Language") {
      navigate("/exam-results", { state: { results: resultDetails } });
    } else {
      const questionsData = JSON.parse(resultDetails);
      navigate('/answers', { state: { questionsData, subjectName, totalMarks, totalPossibleMarks, attemptDate } }); // questionsData, subjectName, totalMarks, attemptDate, totalPossibleMarks 
    }
  }

  return (
    <Row>
      <Col xs={12}>
        <Card className="shadow-sm">
          <Card.Header>
            <h4>Linked Students Overview</h4>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Student Name</th>
                  <th>Recent Score</th>
                  <th>Subject</th>
                  <th>Last Exam Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.studID}>
                    <td>{index + 1}</td>
                    <td>{student.studName}</td>
                    <td>{student.recentScore}</td>
                    <td>{student.subjectName}</td>
                    <td>{student.lastExamDateTime}</td>
                    <td>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <ButtonGroup style={{ width: '100%' }}>
                          {student.resultDetails ? (
                            <Button
                              className='btn-cancel'
                              variant="dark"
                              onClick={() => viewResults(student.resultDetails, student.subjectName, student.score, student.totalPossibleMarks, student.lastExamDateTime)}
                            >
                              Exam Results
                            </Button>
                          ) : null}
                          <Button
                            variant="secondary"
                            onClick={() =>
                              navigate("/student-details", {
                                state: { student: student },
                              })
                            }
                          >Student Details</Button>
                        </ButtonGroup>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default NextOfKinDashboard;
