import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus, faCheck, faDownload, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import db from '../../db';
import './SingleAccount.css';

const url = 'http://localhost:3001/create-account/create-users';

const SingleAccount = () => {
  const initializeFormData = (userType) => ({
    firstName: '',
    lastName: '',
    otherName: '',
    gender: '',
    studClass: '',
    stream: '',
    label: userType === 'admin' ? ['admin'] : ['student'],
  });

  const [userCred, setUserCred] = useState('');
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState(initializeFormData(''));
  const [responseMessage, setResponseMessage] = useState('');
  const [pdfReady, setPdfReady] = useState(false);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const classes = await db.classes.toArray();
      setClasses(classes);
    };

    fetchClasses();
  }, []);

  const handleUserTypeChange = (event) => {
    const selectedUser = event.target.value;
    setUserType(selectedUser);
    setFormData(initializeFormData(selectedUser));
  };

  const handleClassChange = (event) => {
    const classID = event.target.value;
    setFormData({
      ...formData,
      studClass: classID,
    });

    const selectedClassObj = classes.find(cls => cls.classID === classID);
    if (selectedClassObj) {
      setStreams(JSON.parse(selectedClassObj.streams));
    } else {
      setStreams([]);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
      userType: userType === 'admin' ? 'admin' : 'student',
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('User Credentials', 14, 20);
    const tableColumn = [
      'UserID',
      'First Name',
      'Last Name',
      'Email',
      'Password',
    ];
    const tableRows = [];

    userCred.forEach((user) => {
      const userData = [
        user.userID,
        user.firstName,
        user.lastName,
        user.email,
        user.password,
      ];
      tableRows.push(userData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 30 });
    doc.save('Single_user_credential.pdf');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([formData]),
      });

      if (!response.ok) {
        throw new Error('Network response not ok');
      }
      const data = await response.json();

      setResponseMessage('User created successfully');
      setUserCred(data);
      setPdfReady(true);
      setFormData(initializeFormData(userType));

      setTimeout(() => {
        setResponseMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      setFormData(initializeFormData(userType));
      setResponseMessage('Error while creating an Account, Please try again');
      setTimeout(() => {
        setResponseMessage('');
      }, 5000);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="signup-card">
            <Card.Header className="text-center">
              <h3><FontAwesomeIcon icon={faUserPlus} /> Create User Account</h3>
            </Card.Header>
            <Card.Body>
              {responseMessage && <Alert variant={responseMessage.includes('successfully') ? 'success' : 'danger'}>{responseMessage}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="selectUserType">
                  <Form.Label><FontAwesomeIcon icon={faUser} /> User Type</Form.Label>
                  <Form.Control as="select" value={userType} onChange={handleUserTypeChange} required>
                    <option value="">Select User Type</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </Form.Control>
                </Form.Group>
                {userType && (
                  <>
                    <Form.Group controlId="firstName">
                      <Form.Label><FontAwesomeIcon icon={faUser} /> First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="lastName">
                      <Form.Label><FontAwesomeIcon icon={faUser} /> Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="otherName">
                      <Form.Label><FontAwesomeIcon icon={faUser} /> Other Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="otherName"
                        value={formData.otherName}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="gender">
                      <Form.Label><FontAwesomeIcon icon={faUser} /> Gender</Form.Label>
                      <Form.Control as="select" name="gender" value={formData.gender} onChange={handleInputChange} required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Form.Control>
                    </Form.Group>
                    {userType === 'student' && (
                      <>
                        <Form.Group controlId="studClass">
                          <Form.Label><FontAwesomeIcon icon={faUserGraduate} /> Class</Form.Label>
                          <Form.Control as="select" name="studClass" value={formData.studClass} onChange={handleClassChange} required>
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                              <option key={cls.id} value={cls.classID}>{cls.classID}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="stream">
                          <Form.Label><FontAwesomeIcon icon={faUserGraduate} /> Stream</Form.Label>
                          <Form.Control as="select" name="stream" value={formData.stream} onChange={handleInputChange} required>
                            <option value="">Select Stream</option>
                            {streams.map((stream, index) => (
                              <option key={index} value={stream}>{stream}</option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </>
                    )}
                    <Button variant="primary" type="submit" className="w-100 mt-3">
                      <FontAwesomeIcon icon={faCheck} /> Submit
                    </Button>
                  </>
                )}
              </Form>
              {pdfReady && (
                <Button variant="secondary" className="w-100 mt-3" onClick={generatePDF}>
                  <FontAwesomeIcon icon={faDownload} /> Download File
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SingleAccount;
