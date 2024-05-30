import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Container,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { showToast } from "../utilities/toastUtil.js";
import {
  account,
  databases,
  database_id,
  studentTable_id,
  pointsTable_id
} from "../appwriteConfig.js";
import { serverUrl } from "../config.js"
import EmailSignupFields from "./formComponents/EmailSignupFields";
import PhoneSignupFields from "./formComponents/PhoneSignupFields";
import PersonalDetails from "./formComponents/PersonalDetails.js";
import ConfirmationModal from "./formComponents/ConfirmationModal.js";
import KinModal from "./formComponents/KinModal.js";
import "./Signup.css";

function SignUp() {
  const navigate = useNavigate();

  const [signupMethod, setSignupMethod] = useState("email");
  const [signupLoader, setSignupLoader] = useState(false);

  // kin support states
  const [showKinSignupModal, setShowKinSignupModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [newStudentId, setNewStudentId] = useState(null);

  // State hooks for each input field
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherName, setOtherName] = useState("");
  const [gender, setGender] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const [phoneError, setPhoneError] = useState(false); // Error flag for user's phone

  // Password strength calculation (basic example)
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++; // Length check
    if (/[A-Z]/.test(password)) strength++; // Uppercase letter
    if (/[0-9]/.test(password)) strength++; // Number
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special character
    return strength;
  };

  // Update the password strength whenever the password changes
  const handlePasswordChange = (password) => {
    setPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  // Check if passwords match
  const handleConfirmPasswordChange = (confirmPassword) => {
    setConfirmPassword(confirmPassword);
    setPasswordMatch(password === confirmPassword);
  };

  // Generalized phone number validation function
  const validatePhoneNumber = (phoneNumber) => {
    return phoneNumber && !isValidPhoneNumber(phoneNumber);
  };

  // Handles the change of the signup method (email or phone)
  const handleMethodChange = (e) => {
    setSignupMethod(e.target.value);
  };

  // Handles input changes
  const handleInputChange = (event) => {
    const { id, value } = event.target;

    // Use dynamic key names to update state based on the input id
    const setterMap = {
      email: setEmail,
      phone: (value) => setPhone(value || ""),
      password: setPassword,
      firstName: setFirstName,
      lastName: setLastName,
      otherName: setOtherName,
      schoolName: setSchoolName,
      schoolAddress: setSchoolAddress,
      // ... map other ids to their respective setter functions ...
    };

    const setterFunction = setterMap[id];
    if (setterFunction) {
      setterFunction(value);
    }

    const dropdownSetterMap = {
      gender: setGender,
      classGrade: setClassGrade,
      // ... other dropdown ids ...
    };

    const dropdownSetterFunction = dropdownSetterMap[id];
    if (dropdownSetterFunction) {
      dropdownSetterFunction(value);
    }
  };

  // Handles the form submission
  const handleSubmit = async (event) => {

    event.preventDefault();

    console.log('signup 1')

    // Validate phone numbers
    const isUserPhoneValid = !validatePhoneNumber(phone);
    setPhoneError(!isUserPhoneValid);

    console.log('signup 2')

    if (!isUserPhoneValid) {
      setSignupLoader(false);
      return;
    }

    console.log('signup 3')

    // Check if password is strong enough and matches
    if (signupMethod === 'email' && (passwordStrength < 3 || !passwordMatch)) {
      // Show an error or update the UI to indicate the issue
      showToast("Please ensure your password is strong and matches", "error");
      return;
    }

    console.log('signup 4 ')

    try {
      setSignupLoader(true);

      // Construct the user details object
      const studentDetails = {
        email,
        phone,
        password,
        firstName,
        lastName,
        otherName,
        gender,
        classGrade,
        schoolName,
        schoolAddress,
      };

      let userResponse, labelResponse, studentID, addToStudTable;

      // Perform the signup using Appwrite SDK
      if (signupMethod === "email") {
        const userEmail = studentDetails.email;
        userResponse = await emailSignup(userEmail, password, firstName, phone);
        studentID = userResponse.$id;
      } else {
        const phoneNumber = phone;
        userResponse = await phoneSignup(phoneNumber);

        studentID = userResponse.userId;
      }

      if (!userResponse) {
        setSignupLoader(false);
        return; // Stop execution if signup failed
      }

      //Assigning label to student account
      labelResponse = await studentLabel(studentID);

      //Adding student to student account table
      addToStudTable = await addToStudentTable(studentID);

      // Check if the signup was successful
      if (userResponse && labelResponse && addToStudTable) {
        setNewStudentId(studentID); // Save the new student ID
        setShowConfirmationModal(true); // Show confirmation modal after signup
        showToast("Account Created Successfully", "success");
      } else {
        // Handle signup failure
        showToast("Failed to Creat Account.\nAccount with the same email or phone already exists.", "error");
      }

      setSignupLoader(false);
    } catch (error) {
      setSignupLoader(false);
      showToast("Error Creating Account at Submission", "error");
      console.error("Error Creating Account at Submission:", error);
    }
  };

  async function emailSignup(
    emailAddress,
    userPassword,
    userName,
    phoneNumber
  ) {
    try {
      const payload = {
        email: emailAddress,
        password: userPassword,
        userName: userName,
        phone: phoneNumber || null,
      };

      const response = await fetch(
        `${serverUrl}/create-student`,
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

      return responseData;
    } catch (error) {
      if (!navigator.onLine) {
        showToast(
          "Network error. Please check your internet connection.",
          "error"
        );
      } else {
        console.error("Email Signup failed: ", error.message);
        showToast(
          "Failed to sign up with email address: " + error.message,
          "error"
        );
      }

      return null;
    }
  }

  async function phoneSignup(phoneNumber) {
    // Perform the signup using Appwrite SDK
    try {
      // if (isValidPhoneNumber(phoneNumber))
      return await account.createPhoneSession("unique()", phoneNumber);
      // else return console.error("You Entered a wrong number");
    } catch (error) {
      console.error("Phone Signup failed:", error.code);
      showToast("Faile to signup with phone number", "error");
      return null;
      // Handle errors such as showing an error message to the user
    }
  }

  //Asssign a label to a student account
  async function studentLabel(stud_Id) {
    try {
      const paylaod = {
        userId: stud_Id,
        labels: ["student", "subscriber"],
      };

      const response = await fetch(`${serverUrl}/update-label`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paylaod),
      });


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (!navigator.onLine) {
        showToast(
          "Network error. Please check your internet connection.",
          "error"
        );
      } else {
        showToast("Error applying label.", "error");
        console.error("Error applying label:", error);
      }

      return null;
    }
  }

  //Add student to Student Account table
  async function addToStudentTable(studID) {
    try {
      const userDocResponse = await databases.createDocument(
        database_id,
        studentTable_id, // students collection id
        "unique()", // Generates a unique ID via appwrite
        {
          studID: studID || null,
          kinID: null,
          email: email || null, // Include email if provided
          phone: phone || null, // Include phone if provided
          firstName: firstName,
          lastName: lastName,
          otherName: otherName || null,
          gender: gender,
          educationLevel: classGrade, //userDetails.classGrade
          schoolName: schoolName || null,
          schoolAddress: schoolAddress || null,
          accountStatus: "Active",
          createdDate: new Date()
        }
      );

      //Add student to points table
      if (studID) {
        await addStudentToPointsTable(studID);
      }

      return userDocResponse;
    } catch (error) {
      console.error("Error adding Student Account to Student Table:", error);
      return null;
    }
  }

  //Add student to points table
  async function addStudentToPointsTable(studID) {
    try {
      const userDocResponse = await databases.createDocument(
        database_id,
        pointsTable_id,
        "unique()",
        {
          UserID: studID || null,
          PurchasedTier: classGrade, //userDetails.classGrade
          AcquisitionDate: new Date().toLocaleString(),
          ExpiryDate: new Date().toLocaleString(),
        }
      );

      return userDocResponse;
    } catch (error) {
      console.error("Error adding Student Points Table:", error);
      return null;
    }
  }

  // Function to handle 'Add Next of Kin' option
  const handleAddNextOfKin = () => {
    setShowConfirmationModal(false);
    setShowKinSignupModal(true);
  };

  // Function to handle 'No' option at Kin addition
  const handleNoNextOfKin = () => {
    navigate("/sign-in"); // Redirect to sign-in page
  };

  // Function to close KinSignup modal and redirect
  const closeKinSignupModal = () => {
    setShowKinSignupModal(false);
    navigate("/sign-in"); // Redirect to sign-in page
  };

  return (
    <div className="signup-background signup-container">
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="signup-card">
              <Card
                className="shadow-lg p-4"
                style={{ backgroundColor: "#fbffff" }}
              >
                <Card.Body>
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    size="2x"
                    className="text-primary mb-3"
                  />
                  <h3 className="text-center mb-4">Create Account</h3>
                  <Form id="signupForm" onSubmit={handleSubmit}>
                    {/* Signup Method Selection */}
                    {/* <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="3">
                        Signup Using
                      </Form.Label>
                      <Col sm="9">
                        <Form.Select
                          aria-label="Signup method"
                          value={signupMethod}
                          onChange={handleMethodChange}
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </Form.Select>
                      </Col>
                    </Form.Group> */}

                    {/* Dynamic Fields based on signup method */}
                    {signupMethod === "email" ? (
                      <EmailSignupFields
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={handleConfirmPasswordChange}
                        passwordStrength={passwordStrength}
                        passwordMatch={passwordMatch}
                        handlePasswordChange={handlePasswordChange}
                        handleConfirmPasswordChange={
                          handleConfirmPasswordChange
                        }
                        phone={phone}
                        setPhone={setPhone}
                        phoneError={phoneError}
                      />
                    ) : (
                      <PhoneSignupFields
                        phone={phone}
                        setPhone={setPhone}
                        phoneError={phoneError}
                        email={email}
                        setEmail={setEmail}
                      />
                    )}

                    {/* Personal and School Details Section */}
                    <PersonalDetails
                      firstName={firstName}
                      setFirstName={setFirstName}
                      lastName={lastName}
                      setLastName={setLastName}
                      otherName={otherName}
                      setOtherName={setOtherName}
                      gender={gender}
                      setGender={setGender}
                      classGrade={classGrade}
                      setClassGrade={setClassGrade}
                      schoolName={schoolName}
                      setSchoolName={setSchoolName}
                      schoolAddress={schoolAddress}
                      setSchoolAddress={setSchoolAddress}
                    />

                    {/* Signup Button */}
                    {!signupLoader ? (
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-100 mt-3"
                      >
                        Sign Up
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled
                        className="w-100 mt-3"
                      >
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />{" "}
                        Signing Up...
                      </Button>
                    )}

                    {phoneError && (
                      <Alert variant="danger" className="mt-3">
                        Check for any invalid inputs
                      </Alert>
                    )}

                    <div className="mt-3 text-center">
                      Already have an account?{" "}
                      <Link to="/sign-in">Log in here</Link>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Confirmation Modal */}
        <ConfirmationModal
          show={showConfirmationModal}
          onHide={() => setShowConfirmationModal(false)}
          handleAddNextOfKin={handleAddNextOfKin}
          handleNoNextOfKin={handleNoNextOfKin}
        />

        {/* KinSignup Modal */}
        <KinModal
          show={showKinSignupModal}
          onHide={closeKinSignupModal}
          newStudentId={newStudentId}
          firstName={firstName}
          lastName={lastName}
        />
      </Container>
    </div>
  );
}

export default SignUp;
