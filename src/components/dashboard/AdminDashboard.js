import React, { useEffect, useState } from "react";
import { Container, Row, Col, Tabs, Tab } from "react-bootstrap";
import NavigationCard from "./NavigationCard"; // Import the NavigationCard component
import {
  faUsers,
  faUserCheck,
  faUserPlus,
  faUserSlash,
  faMoneyCheckAlt,
  faCheckCircle,
  faTimesCircle,
  faBan,
  faBarChart,
} from "@fortawesome/free-solid-svg-icons";
import db from "../../db"; // Import the database configuration
import { icon } from "@fortawesome/fontawesome-svg-core";

const AdminDashboard = () => {
  const [key, setKey] = useState("students");

  const [registeredCount, setRegisteredCount] = useState(0);
  const [examsDone, setExamsDone] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student counts
        setRegisteredCount(await db.students.count());
        setExamsDone(
          await db.students
            .filter((student) => {
              try {
                const results = JSON.parse(student.Results);
                return Array.isArray(results) && results.length > 0;
              } catch (e) {
                // Handle case where parsing fails, possibly due to malformed JSON
                return false;
              }
            })
            .count()
        );
        // setInactiveCount(await db.students.where('accountStatus').equals('Inactive').count());
      } catch (e) {
        console.error("Error fetching data from index db on component load", e);
      }
    };

    fetchData();
  }, []);

  return (
    <Container fluid>
      <div
        className="mb-4"
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        variant="pills"
      >
        <div eventKey="students" title="Students">
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
              },
              {
                title: "Exams",
                icon: faUserCheck,
                borderColor: "#FF4500",
                link: "/exams-done",
                number: examsDone,
              },
              {
                title: "Inactive Students",
                icon: faUserSlash,
                borderColor: "#20B2AA",
                link: "/inactive",
                number: inactiveCount,
              },
              {
                title: "Examination Analysis",
                icon: faBarChart,
                borderColor: "#008080",
                link: "/exams-stats",
              },
            ].map((card) => (
              <Col md={3} key={card.title}>
                <NavigationCard
                  {...card}
                  gradient={`linear-gradient(135deg, ${card.borderColor} 0%, #008080 100%)`}
                />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </Container>
  );
};

export default AdminDashboard;
