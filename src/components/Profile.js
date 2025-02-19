import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Modal,
  Button,
  Card,
  Table,
  Nav,
  Tab,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSchool, faInfo } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext.js";
import storageUtil from "../utilities/storageUtil";
import HeroHeader from "./HeroHeader";
import "./Home.css";

const Profile = () => {
  //Fetch sessionInfo from localStorage
  // console.log('Localstorage data: ', (storageUtil.getItem("userInfo")));
  const { userInfo, sessionInfo, schoolInfo } = useAuth();
  console.log(userInfo);

  const sessionData = storageUtil.getItem("sessionInfo");
  console.log("Session Data: ", sessionData);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personalDetails");
  //Check user type
  const isStudent = userInfo.userType === "student";

  // Handlers for Tab Navigation
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
  };

  const renderPersonalDetails = () => (
    <Card className="shadow-sm mb-4 profile-card">
      <Card.Header>
        <FontAwesomeIcon icon={faInfo} className="me-2" />
        User Information
      </Card.Header>
      <Card.Body>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <i className="bi me-2"></i>
            <strong>Name: </strong> {userInfo.firstName} {userInfo.lastName}{" "}
            {userInfo.otherName || ""}
          </li>
          {sessionInfo.userId && (
            <>
              <li className="list-group-item">
                <i className="bi bi-building me-2"></i>
                <strong>ID No.:</strong> {sessionInfo.userId}
              </li>
            </>
          )}

          {userInfo.phone !== undefined
            ? userInfo.phone && (
                <>
                  <li className="list-group-item">
                    <i className="bi bi-geo-alt me-2"></i>
                    <strong>Phone:</strong> {userInfo.phone}
                  </li>
                </>
              )
            : null}

          {isStudent && userInfo.gender && (
            <>
              <li className="list-group-item">
                <i className="bi bi-geo-alt me-2"></i>
                <strong>Gender:</strong> {userInfo.gender}
              </li>
            </>
          )}

          {/* Additional student-specific content */}
        </ul>
      </Card.Body>
    </Card>
  );

  const renderSchoolDetails = () => (
    <Card className="shadow-sm mb-4 profile-card">
      <Card.Header>
        <FontAwesomeIcon icon={faInfo} className="me-2" />
        School Information
      </Card.Header>
      <Card.Body>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <i className="bi me-2"></i>
            <strong>Name: </strong> {schoolInfo.name}
          </li>
          <li className="list-group-item">
            <i className="bi bi-building me-2"></i>
            <strong>ID No.:</strong> {schoolInfo.schoolID}
          </li>
          <li className="list-group-item">
            <i className="bi bi-building me-2"></i>
            <strong>Address:</strong> {schoolInfo.address}
          </li>
          <li className="list-group-item">
            <i className="bi bi-building me-2"></i>
            <strong>Email:</strong> {schoolInfo.email} |{" "}
            {schoolInfo.email2 ? schoolInfo.email2 : ""}
          </li>
          <li className="list-group-item">
            <i className="bi bi-building me-2"></i>
            <strong>Phone:</strong> {schoolInfo.phone} |{" "}
            {schoolInfo.phone2 ? schoolInfo.phone2 : ""}
          </li>

          {/* Additional student-specific content */}
        </ul>
      </Card.Body>
    </Card>
  );

  const renderStudentProfile = () => (
    <Card className="shadow-sm mb-4 profile-card">
      <Card.Header>
        <FontAwesomeIcon icon={faSchool} className="me-2" />
        Class Details
      </Card.Header>
      <Card.Body>
        <ul className="list-group list-group-flush">
          {userInfo.studClass ? (
            <>
              <li className="list-group-item">
                <i className="bi bi-building me-2"></i>
                <strong>Class:</strong> {userInfo.studClass}
              </li>
            </>
          ) : null}

          {userInfo.stream ? (
            <>
              <li className="list-group-item">
                <i className="bi bi-geo-alt me-2"></i>
                <strong>Stream:</strong> {userInfo.stream}
              </li>
            </>
          ) : null}

          {/* Additional student-specific content */}
        </ul>
      </Card.Body>
    </Card>
  );

  // Hero Header
  const renderHeroHeader = () => (
    <HeroHeader>
      <div className="text-center">
        <h1 className="display-4">Hello, {userInfo.firstName}!</h1>
        <p className="lead">Welcome to your Profile Dashboard</p>
        {/* <div className="profile-hero-buttons mt-4">
          <Button
            variant="outline-light"
            className="me-2"
            onClick={() => navigate("/edit-profile")}
          >
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </Button>
        </div> */}
      </div>
    </HeroHeader>
  );

  return (
    <>
      {renderHeroHeader()}
      <Container>
        <Nav variant="tabs" activeKey={activeTab} onSelect={handleSelectTab}>
          <Nav.Item>
            <Nav.Link eventKey="personalDetails">Personal Details</Nav.Link>
          </Nav.Item>
          {isStudent && (
            <>
              <Nav.Item>
                <Nav.Link eventKey="educationDetails">
                  Education Details
                </Nav.Link>
              </Nav.Item>
            </>
          )}
          <Nav.Item>
            <Nav.Link eventKey="schoolDetails">School Details</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane
            eventKey="personalDetails"
            active={activeTab === "personalDetails"}
          >
            {renderPersonalDetails()}
          </Tab.Pane>
          {isStudent && (
            <>
              <Tab.Pane
                eventKey="educationDetails"
                active={activeTab === "educationDetails"}
              >
                {renderStudentProfile()}
              </Tab.Pane>
            </>
          )}
          <Tab.Pane
            eventKey="schoolDetails"
            active={activeTab === "schoolDetails"}
          >
            {renderSchoolDetails()}
          </Tab.Pane>
        </Tab.Content>
      </Container>
    </>
  );
};

export default Profile;
