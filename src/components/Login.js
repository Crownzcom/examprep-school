import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Use Link from react-router-dom for navigation
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faEnvelope,
  faLock,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { showToast } from "../utilities/toastUtil.js";
import { useAuth } from "../context/AuthContext.js";
import { fetchAndUpdateResults } from "../utilities/resultsUtil";
import { fetchAndProcessStudentData, fetchStudents, fetchTransactions, initiateIndexDB } from "../utilities/fetchStudentData";
import {
  account,
  databases,
  database_id,
  studentTable_id,
  nextOfKinTable_id,
  subjectsTable_id,
  Query,
} from "../appwriteConfig.js";
import { serverUrl } from "../config.js"
import "./Login.css";

function Login() {
  const { handleLogin, handleLogout, fetchUserPoints } = useAuth();
  const navigate = useNavigate();

  // State for form inputs
  const [formInputs, setFormInputs] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [loginMethod, setLoginMethod] = useState("email");


  // Logout user in case they are already logged in on component mount
  useEffect(() => {
    const clearSession = async () => {
      await handleLogout();
    };
    clearSession();

    // Clear session storage
    sessionStorage.clear();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password, phone, otp } = formInputs;

    // Reset error messages
    setEmailError("");

    let userDetails

    try {
      if (loginMethod === "email") {
        setEmailLoginLoader(true);
        const session = await account.createEmailSession(email, password);

        //Fetch Account Data/Info from server-side
        const userInfo = await userData(session.userId);
        userDetails = userInfo

        handleLogin(session, userInfo); // Pass the session data to App.js


        if (userInfo.labels.includes("student")) {

          //Fetch student(s) results
          await fetchAndUpdateResults(session.userId);

        }

        //Check if admin and fetch the required data
        if (userInfo.labels.includes("admin")) {
          try {
            console.log("Is admin");

            //FETCH ALL STUDENTS DATA
            // await fetchAllStudentsData();

          } catch (e) { console.error('Failed to retrieve student data', e); }
        }

        //Fetch all students' results linked to the next-of-kin and save to local storage
        if (userInfo.labels.includes("kin")) {
          await fetchAndProcessStudentData(session.userId);
        }



        // Redirect to home page
        window.location.href = '/';
        // navigate("/");

      } else {
        console.error("Email must be used for login.");
        throw new Error("Email must be used for login.");
      }

    } catch (error) {
      console.error("Login failed:", error.message);
      if (loginMethod === "email") {
        setEmailError(error.message);
      }
      // TODO: Handle errors such as showing an error message to the user
    } finally {
      setEmailLoginLoader(false);
    }
  };

  async function userData(accountId) {
    try {
      //ACCOUNT DATA RETURNED DURING LOGIN WHILE RETRIEVING EMAIL
      return // Return data
    } catch (error) {
      return null;
    }
  }

  return (
    <div className="login-background login-container">
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow">
              <Card.Body>
                <h3 className="text-center text-primary mb-4">
                  <FontAwesomeIcon icon={faSignInAlt} /> Sign In
                </h3>
                <Form id="loginForm" onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FontAwesomeIcon icon={faEnvelope} /> Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      value={formInputs.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FontAwesomeIcon icon={faLock} /> Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter password"
                      value={formInputs.password}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  {emailError && (
                    <Alert variant="danger">{emailError}</Alert>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={emailLoginLoader || loginMethod === "phone"}
                  >
                    {emailLoginLoader ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </Form>
                {loginMethod === "email" && (
                  <Row className="mt-4 justify-content-center">
                    <Col xs={6} className="text-start">
                      <Link to="/sign-up">Signup</Link>
                    </Col>
                    <Col xs={6} className="text-end">
                      <Link to="/forget-password">Forgot password?</Link>
                    </Col>
                  </Row>

                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InfoCard
            educationLevel={infoModalContent.educationLevel}
            title={infoModalContent.title}
            message={infoModalContent.message}
            buttonText={infoModalContent.buttonText}
            onButtonClick={() => {
              setShowInfoModal(false);
              navigate("/sign-in");  // Navigate back to login or another page
            }}
          />
        </Modal.Body>
      </Modal>

    </div>
  );
}

export default Login;
