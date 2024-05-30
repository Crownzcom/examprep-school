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
import InfoCard from './InfoCard';
import { serverUrl } from "../config.js"
import "./Login.css";

function Login() {
  const { handleLogin, handleLogout, fetchUserPoints } = useAuth();
  const navigate = useNavigate();

  //User ID
  const [userId, setUserId] = useState(null);

  // State for form inputs
  const [formInputs, setFormInputs] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [loginMethod, setLoginMethod] = useState("email");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(10); //Adjust time accordingly in seconds
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailLoginLoader, setEmailLoginLoader] = useState(false);
  const [otpSubmitLoader, setOtpSubmitLoader] = useState(false);
  const [phoneError, setPhoneError] = useState(false); // Error flag for user's phone
  const [emailError, setEmailError] = useState(""); // New state for email login error
  const [accountCheck, setAccountCheck] = useState(false);

  // Modal control and information display
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({
    educationLevel: '',
    title: '',
    message: '',
    buttonText: 'Close'
  });

  // Logout user in case they are already logged in on component mount
  useEffect(() => {
    const clearSession = async () => {
      await handleLogout();
    };
    clearSession();

    // Clear session storage
    sessionStorage.clear();
  }, []);

  //Funstion to check for phone number validity
  const validatePhoneNumber = (phoneNumber) => {
    return phoneNumber && !isValidPhoneNumber(phoneNumber);
  };

  // Generic input change handler
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMethodChange = (e) => {
    setLoginMethod(e.target.value);
    setShowOtpInput(false); // Reset OTP input visibility
    // setIsOtpSent(false); // Reset OTP sent status
    setOtpCountdown(10); // Reset OTP countdown
    setAccountCheck(false); // Reset account check status
    setPhoneError(false); // Reset phone error
    // Reset form inputs if needed
    setFormInputs({ email: "", password: "", phone: "", otp: "" });
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();

    const { phone } = formInputs;
    const isUserPhoneValid = !validatePhoneNumber(phone);
    setPhoneError(!isUserPhoneValid);

    if (!isUserPhoneValid) {
      return; // Exit the function if the phone number is invalid
    }

    setIsOtpSent(true); // Disable the button

    if ((await searchForExistingAccount(phone)) === false) {
      setAccountCheck(true);
      setIsOtpSent(false); // Re-enable the button if account doesn't exist
      return;
    } else {
      setAccountCheck(false);
    }

    try {
      const createSession = await account.createPhoneSession("unique()", phone);
      setUserId(createSession.userId); // Save the userId in state

      setShowOtpInput(true); // Show the OTP input field

      // Start countdown
      let counter = otpCountdown;
      const interval = setInterval(() => {
        counter -= 1;
        setOtpCountdown(counter);
        if (counter <= 0) {
          clearInterval(interval);
          setIsOtpSent(false); // Re-enable the button after countdown
          setOtpCountdown(10); // Reset countdown
        }
      }, 1000);
    } catch (error) {
      console.error("OTP sending failed:", error);
      setIsOtpSent(false); // Re-enable the button in case of error
    }
  };

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

          //Fetch user points
          await fetchUserPoints(session.userId, userInfo.educationLevel);

        }

        //Check if admin and fetch the required data
        if (userInfo.labels.includes("admin")) {
          try {
            console.log("Is admin");
            await fetchTransactions();
          } catch (e) { console.error('Failed to retrieve transaction data', e); }
        }

        //Fetch all students' results linked to the next-of-kin and save to local storage
        if (userInfo.labels.includes("kin")) {
          await fetchAndProcessStudentData(session.userId);
        }

        // Check education Level data availability
        handleLoginSuccess(userInfo);

      } else if (loginMethod === "phone") {
        setOtpSubmitLoader(true);
        if (!userId) {
          console.error("User ID is not available for OTP verification.");
          return;
        }
        const session = await account.updatePhoneSession(userId, otp);

        //Fetch Account Data/Info from server-side
        const userInfo = await userData(session.userId);

        userDetails = userInfo

        handleLogin(session, userInfo); // Pass the session data to App.js
      }

      //Initiate index db and populate with data
      // await initiateIndexDB(userDetails.labels);

      // Redirect to home page
      window.location.href = '/';
      // navigate("/");

    } catch (error) {
      console.error("Login failed:", error.message);
      if (loginMethod === "email") {
        setEmailError(error.message);
      }
      // TODO: Handle errors such as showing an error message to the user
    } finally {
      setEmailLoginLoader(false);
      setOtpSubmitLoader(false);
    }
  };

  const handleLoginSuccess = async (userInfo) => {
    const unavailableEducationLevels = ['UCE', 'UACE']; // Education levels
    // console.log('UnavailableEducationLevels', unavailableEducationLevels)
    if (unavailableEducationLevels.includes(userInfo.educationLevel)) {
      setInfoModalContent({
        educationLevel: userInfo.educationLevel,
        title: 'Content Coming Soon',
        message: `The course material for ${userInfo.educationLevel} is currently being developed. We appreciate your patience and will notify you as soon as it becomes available.`,
        buttonText: 'Close'
      });
      setShowInfoModal(true);
      await handleLogout();
    }
  };


  // Checking for existing account
  async function searchForExistingAccount(value) {
    const phoneNumber = value;

    if (!phoneNumber) {
      console.error("Phone number is required");
    }

    try {
      // Check in the student table
      const existsInStudentTable = await checkPhoneNumberInTable(
        studentTable_id,
        phoneNumber
      );

      if (existsInStudentTable) {
        return true;
      }

      // Check in the kin table
      const existsInKinTable = await checkPhoneNumberInTable(
        nextOfKinTable_id,
        phoneNumber
      );

      if (existsInKinTable) {
        return true;
      }

      // Phone number does not exist in any table
      return false;
    } catch (error) {
      console.error("Error checking phone number:", error);
    }
  }

  async function userData(accountId) {
    try {
      const payload = {
        userId: accountId,
      };

      const response = await fetch(
        `${serverUrl}/get-user-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorDetails}`
        );
      }

      const responseData = await response.json();
      // console.log('User Data: ' + JSON.stringify(responseData));
      return responseData;
    } catch (error) {
      if (!navigator.onLine) {
        showToast(
          "Network error. Please check your internet connection.",
          "error"
        );
      } else {
        console.error("Failed to fetch Account Data: ", error);
        showToast(
          "Failed to fetch account data. Try logging in again:\n" + error,
          "error"
        );
      }

      return null;
    }
  }

  // Function to check if a phone number exists in a given table
  async function checkPhoneNumberInTable(tableId, phoneNumber) {
    try {
      const response = await databases.listDocuments(database_id, tableId, [
        Query.equal("phone", phoneNumber),
      ]);
      return response.documents.length > 0;
    } catch (error) {
      console.error("Error querying table:", error);
      throw error;
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
                  {/* Login Method Selection */}
                  <Form.Group className="mb-3">
                    <Form.Label>Login Using</Form.Label>
                    {/* <Form.Select
                      id="loginMethod"
                      value={loginMethod}
                      onChange={handleMethodChange}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </Form.Select> */}
                  </Form.Group>

                  {/* Dynamic Email or Phone Input */}
                  {loginMethod === "email" ? (
                    <>
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
                    </>
                  ) : (
                    loginMethod === "phone" && (
                      <>
                        {/* <Form.Group className="mb-3">
                          <Form.Label>
                            <FontAwesomeIcon icon={faMobileAlt} /> Phone Number
                          </Form.Label>
                          <PhoneInput
                            className="form-control"
                            id="phone"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formInputs.phone}
                            onChange={(value) =>
                              setFormInputs((prevState) => ({
                                ...prevState,
                                phone: value,
                              }))
                            }
                            required
                          />
                        </Form.Group>
                        {phoneError && (
                          <Alert variant="danger">Invalid phone number</Alert>
                        )}
                        {accountCheck && (
                          <Alert variant="warning">
                            No account found with this phone number. Please
                            check your number or{" "}
                            <Link to="/sign-up">sign up</Link> for an account.
                          </Alert>
                        )}
                        <Button
                          variant="primary"
                          onClick={handleSendOtp}
                          disabled={isOtpSent}
                        >
                          {isOtpSent && otpCountdown > 0
                            ? `Resend OTP in ${otpCountdown}s`
                            : "Send OTP"}
                        </Button>
                        {showOtpInput && (
                          <>
                            <Form.Group className="mb-3">
                              <Form.Label>Enter OTP</Form.Label>
                              <Form.Control
                                type="text"
                                id="otpInput"
                                name="otp"
                                placeholder="Enter OTP"
                                value={formInputs.otp}
                                onChange={handleInputChange}
                                required
                              />
                            </Form.Group>
                            <Button
                              variant="primary"
                              type="submit"
                              disabled={
                                otpSubmitLoader || loginMethod === "email"
                              }
                            >
                              {otpSubmitLoader ? (
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                />
                              ) : (
                                "Login"
                              )}
                            </Button>
                          </>
                        )} */}
                      </>
                    )
                  )}
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
