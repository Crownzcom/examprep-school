import React, { useState, useEffect } from "react";
import StudentList from "../StudentList";
import {
  getAllStudents,
  getStudentById,
  getStudentsByEducationLevel,
  getStudentsByFirstName,
  getStudentsByLastName,
  getStudentsByOtherName,
  getStudentsByGender,
  getStudentsBySchoolName,
  getStudentsByUserType,
} from "./studentService";
import {
  Container,
  Form,
  Row,
  Col,
  ButtonGroup,
  Button,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { fetchStudents } from "../../utilities/fetchStudentData";
import { saveAs } from "file-saver"; // You may need to install with `npm install file-saver`
import { useLocation } from "react-router-dom";

async function downloadCSV(students, fileName = "students_data.csv") {
  const headers = [
    "userId",
    "firstName",
    "lastName",
    "otherName",
    "gender",
    "phone",
    "email",
    "studClass",
    "stream",
  ];
  const rows = students.map((student) => [
    `"${student.userId}"`,
    `"${student.firstName}"`,
    `"${student.lastName}"`,
    `"${student.otherName || ""}"`, // Handle null or undefined values
    `"${student.gender}"`,
    `"${student.phone || ""}"`, // Handle null or undefined values
    `"${student.email}"`,
    `"${student.studClass}"`,
    `"${student.stream}"`,
    `"${student.userType}"`,
    `${student.Results ? student.Results.length : 0}`, // No need for quotes, it's a number
  ]);

  // Convert array of arrays into CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, fileName);
}

const StudentContainer = () => {
  const { userInfo } = useAuth();
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [refreshResults, setRefreshResults] = useState(false);
  const [download, setDownload] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // going to work for all, active and inactive students\
  const location = useLocation();

  const itemsPerPage = 10;

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("exams-done")) {
      setActiveTab("active");
    } else if (path.includes("inactive")) {
      setActiveTab("inactive");
    } else {
      setActiveTab("all");
    }
  }, [location]);

  useEffect(() => {
    async function InitialloadStudents() {
      if (userInfo.userType === "admin") {
        try {
          // await fetchStudents();
        } catch (error) {
          console.error("Failed to fetch students:", error);
        }
      }
    }
    InitialloadStudents();
  }, [userInfo]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoader(true);
        let loadedStudents;

        // First get the students based on the filter criteria
        switch (filter) {
          case "id":
            const student = await getStudentById(filterValue);
            loadedStudents = student ? [student] : [];
            break;
          case "firstName":
            loadedStudents = await getStudentsByFirstName(filterValue);
            break;
          case "lastName":
            loadedStudents = await getStudentsByLastName(filterValue);
            break;
          case "otherName":
            loadedStudents = await getStudentsByOtherName(filterValue);
            break;
          case "studClass":
            loadedStudents = await getStudentsBySchoolName(filterValue);
            break;
          case "gender":
            loadedStudents = await getStudentsByGender(filterValue);
            break;
          case "stream":
            loadedStudents = await getStudentsByUserType(filterValue);
            break;
          case "all":
          default:
            loadedStudents = await getAllStudents();
            break;
        }

        // filter based on activeTab
        switch (activeTab) {
          case "active":
            loadedStudents = loadedStudents.filter(
              (student) => student.Results && student.Results.length > 0
            );
            break;
          case "inactive":
            loadedStudents = loadedStudents.filter(
              (student) => !student.Results || student.Results.length === 0
            );
            break;
          case "all":
          default:
            break;
        }

        setStudents(loadedStudents);
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoader(false);
      }
    };

    if (filter !== "all" && filterValue === "") {
      setStudents([]);
      setLoader(false);
    } else {
      loadStudents();
    }
  }, [filter, filterValue, activeTab]);

  const refreshStudentsData = async () => {
    try {
      setRefreshResults(true);
      if (userInfo.userType === "admin") {
        await fetchStudents(true);
      }
    } catch (e) {
      console.error("Failed to fetch students:", e);
    } finally {
      setRefreshResults(false);
    }
  };

  const handleDownload = async () => {
    setDownload(true);
    let studentsToDownload = [];
    try {
      if (filter !== "all" && filterValue !== "") {
        switch (filter) {
          case "id":
            const student = await getStudentById(filterValue);
            if (student) studentsToDownload = [student];
            break;
          case "firstName":
            studentsToDownload = await getStudentsByFirstName(filterValue);
            break;
          case "lastName":
            studentsToDownload = await getStudentsByLastName(filterValue);
            break;
          case "otherName":
            studentsToDownload = await getStudentsByOtherName(filterValue);
            break;
          case "studClass":
            studentsToDownload = await getStudentsBySchoolName(filterValue);
            break;
          case "gender":
            studentsToDownload = await getStudentsByGender(filterValue);
            break;
          // case 'stream':
          //     studentsToDownload = await getStudentsByUserType(filterValue);
          //     break;
          case "all":
          default:
            studentsToDownload = await getAllStudents();
            break;
        }
      } else {
        studentsToDownload = await getAllStudents();
      }

      if (studentsToDownload.length > 0) {
        await downloadCSV(studentsToDownload);
      } else {
        console.log("No data to download for the selected filter.");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
    } finally {
      setDownload(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container style={{ paddingTop: "1.2rem" }}>
      <Form className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter selection"
              className="mb-3"
            >
              <option value="all">All Students</option>
              <option value="id">By Student ID</option>
              <option value="educationLevel">By Education Level</option>
              <option value="firstName">By First Name</option>
              <option value="lastName">By Last Name</option>
              <option value="otherName">By Other Name</option>
              <option value="studClass">By Student Class</option>
              <option value="gender">By Gender</option>
              {/* <option value="stream">By Stream</option> */}
            </Form.Select>
            {filter !== "all" &&
              filter !== "gender" &&
              filter !== "userType" && (
                <Form.Control
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder={`Enter ${filter}`}
                  className="mb-3"
                />
              )}
            {filter === "educationLevel" && (
              <Form.Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                aria-label="Gender selection"
                className="mb-3"
              >
                <option value="">Select Class</option>
                <option value="P1">Primary 1</option>
                <option value="P2">Primary 2</option>
                <option value="P3">Primary 3</option>
              </Form.Select>
            )}
            {filter === "gender" && (
              <Form.Select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                aria-label="Gender selection"
                className="mb-3"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Select>
            )}
          </Col>
          <Col>
            <ButtonGroup>
              <Button
                variant="outline-secondary"
                onClick={handleDownload}
                disabled={download}
              >
                {download ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                )}
                Download CSV
              </Button>
              <Button
                variant="outline-success"
                onClick={refreshStudentsData}
                disabled={refreshResults}
              >
                {refreshResults ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FontAwesomeIcon icon={faRefresh} className="me-2" />
                )}
                Refresh List
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Form>
      <StudentList
        StudentList={students}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        paginate={paginate}
        loader={loader}
      />
    </Container>
  );
};

export default StudentContainer;
