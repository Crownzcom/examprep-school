import React, { useEffect, useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import NavigationCard from "./NavigationCard"; // Import the NavigationCard component
import {
  faUsers,
  faUserCheck,
  faUserSlash,
  faBarChart,
} from "@fortawesome/free-solid-svg-icons";
import db from "../../db"; // Import the database configuration

const AdminDashboard = () => {
  const [key, setKey] = useState("students");

  const [registeredCount, setRegisteredCount] = useState(0);
  const [examsDone, setExamsDone] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total number of students
        const totalStudents = await db.students.count();

        // Get number of students who have taken exams
        const studentsWithExams = await db.students
          .filter((student) => {
            try {
              const results = JSON.parse(student.Results);
              return Array.isArray(results) && results.length > 0;
            } catch (e) {
              return false;
            }
          })
          .count();

        const inactiveStudents = totalStudents - studentsWithExams;

        setRegisteredCount(totalStudents);
        setExamsDone(studentsWithExams);
        setInactiveCount(inactiveStudents);
      } catch (e) {
        console.error("Error fetching data from index db on component load", e);
      }
    };

    fetchData();
  }, []);

  return (
    <Container fluid>
      {/* Move activeKey and onSelect to the Tabs component */}
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        variant="pills"
      >
        <Tab eventKey="students" title="Students">
          <h5 className="title-2">Metrics: Students & Exams</h5>
          <Row
            className="justify-content-md-center"
            style={{ marginTop: "20px", gap: "20px" }}
          >
            {[
              {
                title: "Registered Students",
                icon: faUsers,
                borderColor: "#FF6347",
                link: "/registered-students",
                number: registeredCount,
                gradient: "linear-gradient(135deg, #FF7889 0%, #8A5082 100%)",
              },
              {
                title: "Exams",
                icon: faUserCheck,
                borderColor: "#FF4500",
                link: "/exams-done",
                number: examsDone,
                gradient: "linear-gradient(135deg, #FF4500 0%, #C9D787 100%)",
              },
              {
                title: "Inactive Students",
                icon: faUserSlash,
                borderColor: "#20B2AA",
                link: "/inactive",
                number: inactiveCount,
                gradient: "linear-gradient(135deg, #20B2AA 0%, #8A5082 100%)",
              },
              {
                title: "Examination Analysis",
                icon: faBarChart,
                borderColor: "#008080",
                link: "/exams-stats",
                gradient: "linear-gradient(135deg, #008080 0%, #C9D787 100%)",
              },
            ].map((card) => (
              <Col md={3} key={card.title}>
                <NavigationCard {...card} />
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
