import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCheck,
  faTimes,
  faClock,
  faStream,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import {
  account,
  databases,
  database_id,
  examsTable_id,
  ID,
} from "../../appwriteConfig.js";
import { useAuth } from "../../context/AuthContext";
import db from "../../db";
import moment from "moment-timezone";
import { serverUrl } from "../../config.js";
import "./ScheduleExam.css"; // Import custom CSS
import { useNavigate } from "react-router-dom";

const ScheduleExam = () => {
  const { userInfo } = useAuth();
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      const classes = await db.classes.toArray();
      setClasses(classes);
    };

    const fetchSubjects = async () => {
      const subjects = await db.subjects.toArray();
      setSubjects(subjects);
    };

    fetchClasses();
    fetchSubjects();
  }, []);

  const handleClassChange = (e) => {
    const classID = e.target.value;
    setSelectedClass(classID);

    const selectedClassObj = classes.find((cls) => cls.classID === classID);
    if (selectedClassObj) {
      setStreams(JSON.parse(selectedClassObj.streams));
    } else {
      setStreams([]);
    }
  };

  const handleStreamChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;

    setSelectedStreams((prev) =>
      checked ? [...prev, value] : prev.filter((stream) => stream !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (startDate && endDate && moment(endDate).isSameOrBefore(startDate)) {
      setError("End date and time must be after the start date and time.");
      alert("End date and time must be after the start date and time.");
      return;
    }

    const selectedSubjectObj = subjects.find(
      (sub) => sub.examTableId === selectedSubject
    );

    const examData = {
      className: selectedClass,
      streams: selectedStreams,
      subjectName: selectedSubjectObj ? selectedSubjectObj.subjectName : "",
      examTableId: selectedSubject,
      openingDate: moment(startDate).tz("Africa/Nairobi").format(),
      closingDate: moment(endDate).tz("Africa/Nairobi").format(),
      durationMINS: parseInt(duration, 10),
    };

    try {
      const response = await fetch(
        `${serverUrl}/exam/fetch-exam?collection_id=${examData.examTableId}&subjectName=${examData.subjectName}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const fetchedExamData = await response.json();

      console.log("Fetched exam data: ", fetchedExamData);

      const completeExamData = {
        ...examData,
        examID: fetchedExamData.examID,
        examQuestions: JSON.stringify(fetchedExamData.questions), // Convert to string
      };

      console.log("Scheduled Exam Data:", completeExamData);
      // Save Exam Set Data to Appwrite Database Collection
      try {
        const examSetData = {
          examID: completeExamData.examID,
          subjectName: completeExamData.subjectName,
          userID: userInfo.userID,
          classID: completeExamData.className,
          stream: completeExamData.streams,
          openingDate: completeExamData.openingDate,
          closingDate: completeExamData.closingDate,
          durationMINS: completeExamData.durationMINS,
          examQuestions: completeExamData.examQuestions, // Already a string
        };
        console.log("SET EXAM DATA: ", examSetData);
        const saveResponse = await databases.createDocument(
          database_id,
          examsTable_id,
          ID.unique(),
          examSetData
        );
        console.log("exam saved successfully", saveResponse);
        alert("Exam scheduled successfully");
        navigate("/");
      } catch (e) {
        console.log(
          "Failed to save Exam Set Data to Appwrite Database Collection: ",
          e
        );
        setError(
          "Failed to save Exam Set Data to Appwrite Database Collection"
        );
        // navigate("/");
      }
    } catch (error) {
      setError("Failed to fetch exam data from server");
      alert("Failed to fetch exam data from server");
      console.error("Failed to fetch exam data:", error);
      navigate("/");
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="schedule-card">
            <Card.Header className="text-center">
              <h3>Schedule Exam</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="classSelect">
                  <Form.Label>
                    <FontAwesomeIcon icon={faStream} /> Select Class
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedClass}
                    onChange={handleClassChange}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.classID}>
                        {cls.classID}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                {streams.length > 0 && (
                  <Form.Group controlId="streamSelect">
                    <Form.Label>
                      <FontAwesomeIcon icon={faStream} /> Select Stream
                    </Form.Label>
                    {streams.map((stream, index) => (
                      <Form.Check
                        key={index}
                        type="checkbox"
                        label={stream}
                        value={stream}
                        onChange={handleStreamChange}
                      />
                    ))}
                  </Form.Group>
                )}

                <Form.Group controlId="subjectSelect">
                  <Form.Label>
                    <FontAwesomeIcon icon={faBook} /> Select Subject
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.examTableId}>
                        {sub.subjectName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="startDate">
                  <Form.Label>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Select Start Date
                    and Time
                  </Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp"
                    className="form-control"
                    placeholderText="Select Start Date and Time"
                  />
                </Form.Group>

                <Form.Group controlId="endDate">
                  <Form.Label>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Select End Date and
                    Time
                  </Form.Label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="Pp"
                    className="form-control"
                    placeholderText="Select End Date and Time"
                  />
                </Form.Group>

                <Form.Group controlId="duration">
                  <Form.Label>
                    <FontAwesomeIcon icon={faClock} /> Set Duration (in minutes)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    placeholder="Enter duration in minutes"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-3">
                  <FontAwesomeIcon icon={faCheck} /> Schedule Exam
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ScheduleExam;
