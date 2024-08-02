import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, ButtonGroup, ListGroup, Container, Row, Col, Alert, Card, Spinner, Tooltip, OverlayTrigger, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus, faCheck, faDownload, faUserGraduate, faReceipt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { capitalizeFirstLetter } from '../../utilities/otherUtils.js';
import { getSubCodeDetails } from './utils.js';
import { serverUrl } from "../../config.js";
import db from '../../db';
import './SingleAccount.css';

const url = `${serverUrl}/create-account/create-users`;

const SingleAccount = () => {
  const navigate = useNavigate();

  const initializeFormData = (userType) => ({
    userType: userType,
    firstName: '',
    lastName: '',
    otherName: '',
    gender: '',
    studClass: '',
    stream: '',
    subCode: '',
    label: userType === 'admin' ? ['admin'] : ['student'],
  });

  const [userCred, setUserCred] = useState([]);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState(initializeFormData(''));
  const [responseMessage, setResponseMessage] = useState('');
  const [pdfReady, setPdfReady] = useState(false);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [accountCreated, setAccountCreated] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
    });
  };

  const validateName = (name) => /^[a-zA-Z\s]+$/.test(name);
  const validateSubCode = (code) => /^[a-zA-Z0-9]+$/.test(code);

  const validateForm = () => {
    const errors = {};

    if (!validateName(formData.firstName)) {
      errors.firstName = 'First name must contain only alphabetical characters and spaces.';
    }
    if (!validateName(formData.lastName)) {
      errors.lastName = 'Last name must contain only alphabetical characters and spaces.';
    }
    if (formData.otherName && !validateName(formData.otherName)) {
      errors.otherName = 'Other name must contain only alphabetical characters and spaces.';
    }
    if (formData.subCode && !validateSubCode(formData.subCode)) {
      errors.subCode = 'Subscription code must contain only letters and numbers.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('User Credentials', 14, 20);
    const tableColumn = ['UserID', 'First Name', 'Last Name', 'Email', 'Password'];
    const tableRows = [];

    userCred.forEach((user) => {
      const userData = [user.userID, user.firstName, user.lastName, user.email, user.password];
      tableRows.push(userData);
    });

    // Updated autoTable initiation
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('Single_user_credential.pdf');
  };

  const createNewAccount = () => {
    setResponseMessage('');
    setAccountCreated(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoader(true);
      setResponseMessage('');

      //Check Subscription Code validation
      const subCodeResponse = userType === 'student' ? await getSubCodeDetails(formData.subCode, 'ple003') : null;
      console.log('subCodeResponse: ', subCodeResponse);
      if (!subCodeResponse.valid) {
        setResponseMessage('The provided subscription code is invalid or expired. Please try again, or contact support for help.')
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([formData]),
      });

      if (!response.ok) {
        console.log("code failed ", response)
        throw new Error('Network response not ok');
      }
      const data = await response.json();

      setAccountCreated(true);
      setResponseMessage('User created successfully');
      setUserCred(data);
      setPdfReady(true);
      setFormData(initializeFormData(userType)); // Reset the form only if the submission is successful
      setLoader(false);
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage(`${error} ... Failed to create an Account`);
      setLoader(false);
    }
  };

  const renderTooltip = (msg) => (
    <Tooltip>{msg}</Tooltip>
  );

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          {accountCreated ?
            <Card>
              <Card.Header className="text-center">
                <h3><FontAwesomeIcon icon={faUserPlus} />{capitalizeFirstLetter(userType)} Account Created Successfully</h3>
              </Card.Header>
              <Card.Body>
                {responseMessage && <Alert variant={responseMessage.includes('successfully') ? 'success' : 'danger'}>{responseMessage}</Alert>}
                <ListGroup variant="flush">
                  <ListGroup.Item><b>Name: </b>{userCred[0].firstName}</ListGroup.Item>
                  <ListGroup.Item><b>ID: </b>{userCred[0].userID}</ListGroup.Item>
                  <ListGroup.Item><b>Password: </b>{userCred[0].password}</ListGroup.Item>
                </ListGroup>
                {pdfReady && (
                  <Button variant="outline-success" className="w-100 mt-3" onClick={generatePDF}>
                    <FontAwesomeIcon icon={faDownload} /> Download and Save Account Credentials
                  </Button>
                )}
              </Card.Body>
              <Card.Footer>
                <ButtonGroup style={{ width: '100%' }}>
                  <Button className='btn-back' variant="dark" onClick={createNewAccount}>
                    Create New Account
                  </Button>
                  <Button className='btn-home' variant="primary" onClick={() => navigate('/')}>
                    Back Home
                  </Button>
                </ButtonGroup>
              </Card.Footer>
            </Card>
            :
            <Card className="signup-card">
              <Card.Header className="text-center">
                <h3><FontAwesomeIcon icon={faUserPlus} /> Create User Account</h3>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="selectUserType">
                    <Form.Label>
                      <FontAwesomeIcon icon={faUser} /> User Type
                      <OverlayTrigger
                        placement="right"
                        overlay={renderTooltip('Select the type of user to create.')}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control as="select" value={userType} onChange={handleUserTypeChange} required>
                      <option value="">Select User Type</option>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </Form.Control>
                  </Form.Group>
                  {userType && (
                    <>
                      <Form.Group controlId="firstName" className="position-relative">
                        <Form.Label>
                          <FontAwesomeIcon icon={faUser} /> First Name
                          <OverlayTrigger
                            placement="right"
                            overlay={renderTooltip('Enter the first name of the user. Only alphabetical characters and spaces are allowed.')}
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                          </OverlayTrigger>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.firstName}
                          required
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {validationErrors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="lastName" className="position-relative">
                        <Form.Label>
                          <FontAwesomeIcon icon={faUser} /> Last Name
                          <OverlayTrigger
                            placement="right"
                            overlay={renderTooltip('Enter the last name of the user. Only alphabetical characters and spaces are allowed.')}
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                          </OverlayTrigger>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.lastName}
                          required
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {validationErrors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="otherName" className="position-relative">
                        <Form.Label>
                          <FontAwesomeIcon icon={faUser} /> Other Name
                          <OverlayTrigger
                            placement="right"
                            overlay={renderTooltip('Enter any other names of the user. Only alphabetical characters and spaces are allowed.')}
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                          </OverlayTrigger>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="otherName"
                          value={formData.otherName}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.otherName}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {validationErrors.otherName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group controlId="gender">
                        <Form.Label>
                          <FontAwesomeIcon icon={faUser} /> Gender
                          <OverlayTrigger
                            placement="right"
                            overlay={renderTooltip('Select the gender of the user.')}
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                          </OverlayTrigger>
                        </Form.Label>
                        <Form.Control as="select" name="gender" value={formData.gender} onChange={handleInputChange} required>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </Form.Control>
                      </Form.Group>
                      {userType === 'student' && (
                        <>
                          <Form.Group controlId="studClass">
                            <Form.Label>
                              <FontAwesomeIcon icon={faUserGraduate} /> Class
                              <OverlayTrigger
                                placement="right"
                                overlay={renderTooltip('Select the class for the student.')}
                              >
                                <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control as="select" name="studClass" value={formData.studClass} onChange={handleClassChange} required>
                              <option value="">Select Class</option>
                              {classes.map(cls => (
                                <option key={cls.id} value={cls.classID}>{cls.classID}</option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                          <Form.Group controlId="stream">
                            <Form.Label>
                              <FontAwesomeIcon icon={faUserGraduate} /> Stream
                              <OverlayTrigger
                                placement="right"
                                overlay={renderTooltip('Select the stream for the student.')}
                              >
                                <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control as="select" name="stream" value={formData.stream} onChange={handleInputChange} required>
                              <option value="">Select Stream</option>
                              {streams.map((stream, index) => (
                                <option key={index} value={stream}>{stream}</option>
                              ))}
                            </Form.Control>
                          </Form.Group>
                          <Form.Group controlId="subCode" className="position-relative">
                            <Form.Label>
                              <FontAwesomeIcon icon={faReceipt} /> Subscription Code
                              <OverlayTrigger
                                placement="right"
                                overlay={renderTooltip('Enter the subscription code. Only letters and numbers are allowed.')}
                              >
                                <FontAwesomeIcon icon={faInfoCircle} className="ml-2" />
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="subCode"
                              value={formData.subCode}
                              onChange={handleInputChange}
                              isInvalid={!!validationErrors.subCode}
                            />
                            <Form.Control.Feedback type="invalid" tooltip>
                              {validationErrors.subCode}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </>
                      )}
                      {responseMessage && <Alert variant={responseMessage.includes('successfully') ? 'success' : 'danger'}>{responseMessage}</Alert>}
                      <Button variant="primary" type="submit" className="w-100 mt-3" disabled={loader}>
                        {loader ?
                          <>
                            <Spinner animation="border" variant="primary" />
                            <Spinner animation="border" variant="secondary" />
                            <Spinner animation="border" variant="success" />
                          </>
                          :
                          <>
                            <FontAwesomeIcon icon={faCheck} /> Submit
                          </>
                        }
                      </Button>
                    </>
                  )}
                </Form>
              </Card.Body>
            </Card>
          }
        </Col>
      </Row>

      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide animation>
        <Toast.Header>
          <strong className="mr-auto">Information</strong>
        </Toast.Header>
        <Toast.Body>Select the type of user to create. Fill in the required information and submit.</Toast.Body>
      </Toast>
    </Container>
  );
};

export default SingleAccount;
