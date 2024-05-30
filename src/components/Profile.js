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
import {
  faUsers,
  faSchool,
  faUserCircle,
  faEdit,
  faPlusCircle,
  faInfo
} from "@fortawesome/free-solid-svg-icons";
import storageUtil from "../utilities/storageUtil";
import { fetchAndProcessStudentData } from "../utilities/fetchStudentData";
import KinSignup from "./KinSignup";
import HeroHeader from "./HeroHeader";
import StudentList from './StudentList';

import "./Home.css";

const Profile = () => {
  //Fetch sessionInfo from localStorage
  const userInfo = storageUtil.getItem("userInfo");

  const sessionData = storageUtil.getItem("sessionInfo");
  const navigate = useNavigate();
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('personalDetails');

  useEffect(() => {
    const studentData = storageUtil.getItem("studentData");
    if (studentData) {
      setLinkedStudents(studentData);
    }
  }, []);

  //Hook to manage modal visibility
  const [showModal, setShowModal] = useState(false);

  //Function to handle modal toggle
  const toggleModal = () => setShowModal(!showModal);

  //Check user type
  const isStudent = userInfo.labels.includes("student");
  const isNextOfKin = userInfo.labels.includes("kin");

  //Pagination purposes
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = linkedStudents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers for Tab Navigation
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
  };

  // const renderNextOfKinProfile = () => (
  //   <Card className="shadow-sm mb-4 profile-card">
  //     <Card.Header>
  //       <FontAwesomeIcon icon={faUsers} className="me-2" />
  //       Linked Students
  //     </Card.Header>
  //     <Card.Body>
  //       <Card.Title>Linked Students</Card.Title>
  //       {/* <Button onClick={() => { fetchAndProcessStudentData(userInfo.userId) }}>Update Students Data</Button> */}
  //       <Table hover>
  //         <thead>
  //           <tr>
  //             <th>No.</th>
  //             <th>Name</th>
  //             <th>Education Level</th>
  //             {/* <th>Points Available</th> */}
  //             <th>Actions</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {paginatedStudents.map((student, index) => (
  //             <tr key={student.studID}>
  //               <td>{startIndex + index + 1}</td>
  //               <td>{student.studName}</td>
  //               <td>{student.educationLevel}</td>
  //               {/* <td>{student.pointsBalance}</td> */}
  //               <td>
  //                 <Button
  //                   variant="dark"
  //                   onClick={() =>
  //                     navigate("/student-details", { state: { student } })
  //                   }
  //                 >
  //                   View Details
  //                 </Button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </Table>
  //       <Nav aria-label="Page navigation">
  //         <ul className="pagination">
  //           {Array.from(
  //             { length: Math.ceil(linkedStudents.length / itemsPerPage) },
  //             (_, i) => (
  //               <li
  //                 key={i}
  //                 className={`page-item ${currentPage === i + 1 ? "active" : ""
  //                   }`}
  //               >
  //                 <Button variant="link" onClick={() => paginate(i + 1)}>
  //                   {i + 1}
  //                 </Button>
  //               </li>
  //             )
  //           )}
  //         </ul>
  //       </Nav>
  //     </Card.Body>
  //   </Card>
  // );


  const renderNextOfKinProfile = () => (
    <StudentList
      StudentList={linkedStudents}
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      paginate={paginate}
    />
  );

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
            <strong>Name: </strong> {userInfo.firstName} {userInfo.lastName} {userInfo.otherName || ""}
          </li>
          {
            userInfo.email && (
              <>
                <li className="list-group-item">
                  <i className="bi bi-building me-2"></i>
                  <strong>Email:</strong> {userInfo.email}
                </li>
              </>
            )
          }

          {
            userInfo.phone && (
              <>
                <li className="list-group-item">
                  <i className="bi bi-geo-alt me-2"></i>
                  <strong>Phone:</strong> {userInfo.phone}
                </li>
              </>
            )
          }

          {
            isStudent && (
              userInfo.gender && (
                <>
                  <li className="list-group-item">
                    <i className="bi bi-geo-alt me-2"></i>
                    <strong>Gender:</strong> {userInfo.gender}
                  </li>
                </>
              )
            )
          }

          {/* Additional student-specific content */}
        </ul>
      </Card.Body>
    </Card>
  )

  const renderStudentProfile = () => (
    <Card className="shadow-sm mb-4 profile-card">
      <Card.Header>
        <FontAwesomeIcon icon={faSchool} className="me-2" />
        Education & School Details
      </Card.Header>
      <Card.Body>
        <ul className="list-group list-group-flush">
          {userInfo.schoolName ? (
            <>
              <li className="list-group-item">
                <i className="bi bi-building me-2"></i>
                <strong>School Name:</strong> {userInfo.schoolName}
              </li>
            </>
          ) : null}

          {userInfo.schoolAddress ? (
            <>
              <li className="list-group-item">
                <i className="bi bi-geo-alt me-2"></i>
                <strong>School Address:</strong> {userInfo.schoolAddress}
              </li>
            </>
          ) : null}

          <li className="list-group-item">
            <i className="bi bi-bookmark me-2"></i>
            <strong>Exam:</strong> {userInfo.educationLevel}
          </li>

          {/* Additional student-specific content */}
        </ul>
      </Card.Body>
    </Card>
  );

  const renderNextOfKinDetails = () => (
    <Card className="shadow-sm mb-4 profile-card">
      <Card.Header>
        {" "}
        <FontAwesomeIcon icon={faUserCircle} className="me-2" />
        Guardian Details
      </Card.Header>
      <Card.Body>
        <ul className="list-group list-group-flush">
          {userInfo.kinID ? (
            <>
              <li className="list-group-item">
                <i className="bi bi-building me-2"></i>
                <strong>First Name:</strong> {userInfo.kinFirstName}
              </li>
              <li className="list-group-item">
                <i className="bi bi-building me-2"></i>
                <strong>Last Name:</strong> {userInfo.kinLastName}
              </li>

              {userInfo.kinEmail ? (
                <>
                  <li className="list-group-item">
                    <i className="bi bi-geo-alt me-2"></i>
                    <strong>Email Address:</strong> {userInfo.kinEmail}
                  </li>
                </>
              ) : null}

              {userInfo.kinPhone ? (
                <>
                  <li className="list-group-item">
                    <i className="bi bi-bookmark me-2"></i>
                    <strong>Telephone:</strong> {userInfo.kinPhone}
                  </li>
                </>
              ) : null}
            </>
          ) : (
            <Button
              variant="outline-primary"
              className="mt-3"
              onClick={toggleModal}
            >
              <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
              Link to a Guardian
            </Button>
          )}
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
        <div className="profile-hero-buttons mt-4">
          <Button
            variant="outline-light"
            className="me-2"
            onClick={() => navigate("/edit-profile")}
          >
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </Button>
          {isNextOfKin && (
            <Button
              variant="outline-success"
              onClick={() => navigate("/linked-students")}
            >
              <FontAwesomeIcon icon={faUsers} /> Linked Students
            </Button>
          )}
        </div>
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
                <Nav.Link eventKey="educationDetails">Education Details</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="nextOfKinDetails">Guardian Details</Nav.Link>
              </Nav.Item>
            </>
          )}
          {isNextOfKin && (
            <Nav.Item>
              <Nav.Link eventKey="linkedStudents">Linked Students</Nav.Link>
            </Nav.Item>
          )}
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="personalDetails" active={activeTab === 'personalDetails'}>
            {renderPersonalDetails()}
          </Tab.Pane>
          {isStudent && (
            <>
              <Tab.Pane eventKey="educationDetails" active={activeTab === 'educationDetails'}>
                {renderStudentProfile()}
              </Tab.Pane>
              <Tab.Pane eventKey="nextOfKinDetails" active={activeTab === 'nextOfKinDetails'}>
                {renderNextOfKinDetails()}
              </Tab.Pane>
            </>
          )}
          {isNextOfKin && (
            <Tab.Pane eventKey="linkedStudents" active={activeTab === 'linkedStudents'}>
              {renderNextOfKinProfile()}
            </Tab.Pane>
          )}
        </Tab.Content>
      </Container>
      <Modal show={showModal} onHide={toggleModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Guardian</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <KinSignup />
        </Modal.Body>
      </Modal>
    </>
  );
};


export default Profile;
