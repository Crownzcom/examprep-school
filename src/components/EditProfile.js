import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Modal,
  Alert,
  ButtonGroup,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { showToast } from "../utilities/toastUtil.js";
import { useAuth } from '../context/AuthContext';
import { serverUrl } from '../config';

// EditProfile functional component for handling user profile edits
const EditProfile = () => {
  const navigate = useNavigate();
  const { userInfo, sessionInfo, handleLogout } = useAuth();
  const isStudent = userInfo.labels.includes("student");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [userInfoToUpdate, setUserInfoToUpdate] = useState({});
  const [spinner, setSpinner] = useState(true);
  const [showModalBody, setShowModalBody] = useState(false);
  const [showButtonGroup, setShowButtonGroup] = useState(false);

  // State hooks for managing form input values
  // Default values are fetched from userInfo obtained from local storage
  const [firstName, setFirstName] = useState(userInfo.firstName || "");
  const [lastName, setLastName] = useState(userInfo.lastName || "");
  const [otherName, setOtherName] = useState(userInfo.otherName || "");
  const [gender, setGender] = useState(userInfo.gender || "");
  const [phone, setPhone] = useState(userInfo.phone || "");
  const [email, setEmail] = useState(userInfo.email || "");
  const [schoolName, setSchoolName] = useState(userInfo.schoolName || "");
  const [schoolAddress, setSchoolAddress] = useState(
    userInfo.schoolAddress || ""
  );

  // State to store the original data for comparison during update
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    // Reset phone error when phone number changes
    setPhoneError(false);
  }, [phone]);

  useEffect(() => {
    // Set the original data when the component mounts
    setOriginalData({
      firstName: userInfo.firstName || "",
      lastName: userInfo.lastName || "",
      otherName: userInfo.otherName || "",
      gender: userInfo.gender || "",
      phone: userInfo.phone || "",
      email: userInfo.email || "",
      schoolName: userInfo.schoolName || "",
      schoolAddress: userInfo.schoolAddress || "",
    });
  }, []); // Empty dependency array to run only once on mount\

  // handleUpdate function to process the form submission
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Object to store the updated fields that will be sent to the server
    let updatedFields = {};

    try {
      // Label type is determined based on user roles (student or kin)
      if (userInfo.labels.includes("student")) {
        updatedFields.label = "student";
      } else if (userInfo.labels.includes("kin")) {
        updatedFields.label = "kin";
      }

      //Pass the userId
      updatedFields.userId = userInfo.userId;

      // User collection document ID is required for updating the user profile
      updatedFields.userDocId = userInfo.userDocId;

      // checkForChange function to trim values and check for changes against original data
      const checkForChange = (field, value) => {
        // Special handling for phone field to validate the phone number
        if (field === "phone") {
          if (
            originalData[field] === "" ||
            originalData[field] === null ||
            originalData[field] === undefined
          ) {
            if (value === undefined || value === null || value === "") {
              value = originalData[field];
            }
          }
          if (value !== undefined && value !== null && value !== "") {
            // Phone number validation using isValidPhoneNumber from 'react-phone-number-input'
            const isValid = isValidPhoneNumber(value);
            if (!isValid) {
              showToast("Invalid phone number", "error");
              const errorMessage = "Invalid phone number format";
              setPhoneError(true);
              throw new Error(errorMessage);
            }
          }
        }

        const trimmedValue =
          value !== undefined && value !== null ? value.trim() : null;

        // Check if the original value is not set (undefined or empty string) and the new value is not empty
        if (
          (originalData[field] === undefined || originalData[field] === "") &&
          trimmedValue !== ""
        ) {
          return trimmedValue;
        }
        // Check if the original value is not set and the new value is not empty
        else if (trimmedValue !== originalData[field]) {
          return trimmedValue || null; // Assign null if field is cleared
        }

        return undefined;
      };

      // Check if there is a change from the original value
      const potentialUpdates = {
        firstName: checkForChange("firstName", firstName),
        lastName: checkForChange("lastName", lastName),
        otherName: isStudent
          ? checkForChange("otherName", otherName)
          : undefined,
        gender: isStudent ? checkForChange("gender", gender) : undefined,
        email: checkForChange("email", email),
        phone: checkForChange("phone", phone),
        schoolName: isStudent
          ? checkForChange("schoolName", schoolName)
          : undefined,
        schoolAddress: isStudent
          ? checkForChange("schoolAddress", schoolAddress)
          : undefined,
      };

      Object.keys(potentialUpdates).forEach((key) => {
        if (potentialUpdates[key] !== undefined) {
          updatedFields[key] = potentialUpdates[key];
        }
      });

      if (Object.keys(updatedFields).length > 3) {
        // More than just 'label', 'userDocId' and 'userId'
        setUserInfoToUpdate(updatedFields); // Update the state
        setShowLogoutModal(true); // Show the modal
      } else {
        showToast("No information to be updated", "info");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function updateUserProfile() {
    try {
      const url = `${serverUrl}/update-account`;
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfoToUpdate),
      };

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      if (response.ok) {
        showToast("Profile Updated Successfully", "success");

        // User is logged out
        await handleLogout();
        navigate('/sign-in');;
      } else {
        // Handle server-side errors
        console.error("Update failed in updateUserProfile function:", data);
        throw new Error("Update failed in updateUserProfile function", data);
      }
    } catch (error) {
      // Handle network or other unexpected errors
      console.error("Error:", error);
      throw error;
    }
  }

  function closeModal() {
    setShowLogoutModal(false);
  }

  const handleProceedUpdate = async () => {
    // Implement the logic to update the user profile
    try {
      setShowModalBody(true);
      setShowButtonGroup(true);
      setSpinner(false);

      await updateUserProfile();

      showToast("Profile Updated Successfully", "success");
      setShowModalBody(false);
      setShowButtonGroup(false);
      setSpinner(true);
    } catch (error) {
      showToast(
        "Failed to update profile.\n If the problem persists, contact the Support Team for help",
        "error"
      );
      setShowModalBody(false);
      setShowButtonGroup(false);
      setSpinner(true);
    }
  };

  return (
    <Container className="mt-4" style={{ marginTop: "100px" }} >
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow">
            <Card.Header as="h5" className="text-center">
              <FontAwesomeIcon icon={faUserEdit} className="me-2" />
              Edit Profile
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdate}>
                {/* Common Fields */}
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>
                {/* Conditional Fields */}
                {isStudent && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Other Names</Form.Label>
                      <Form.Control
                        type="text"
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Control
                        as="select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value={gender}>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>School Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required={userInfo.educationLevel === "PLE"}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>School Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={schoolAddress}
                        onChange={(e) => setSchoolAddress(e.target.value)}
                        required={userInfo.educationLevel === "PLE"}
                      />
                    </Form.Group>
                  </>
                )}
                {/* Common Fields */}
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={sessionInfo.authMethod === "email"}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <PhoneInput
                    international
                    // defaultCountry="UG"
                    value={phone}
                    onChange={setPhone}
                    required={sessionInfo.authMethod === "phone"}
                  />
                  {phoneError ? (
                    <Alert className="mt-1" variant="danger">
                      Invalid Phone number. Please check your phone number and
                      try again.
                    </Alert>
                  ) : null}
                </Form.Group>

                <Button variant="primary" type="submit">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Logout Modal */}
      <Modal show={showLogoutModal} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton={false}>
          <Modal.Title>Profile Update</Modal.Title>
        </Modal.Header>

        {/* Conditional rendering for spinner */}
        {!spinner ? (
          <div className="text-center my-4">
            <Spinner animation="grow" variant="info" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <Spinner animation="grow" variant="warning" role="status"></Spinner>
            <Spinner animation="grow" variant="success" role="status"></Spinner>
          </div>
        ) : null}

        {/* Modal Body */}
        {!showModalBody ? (
          <Modal.Body>
            Information to be updated has been captured. You'll be logged out
            after the update is complete. Would you like to proceed with the
            update?
          </Modal.Body>
        ) : null}

        {/* Modal Footer */}
        {!showButtonGroup ? (
          <Modal.Footer>
            <ButtonGroup style={{ width: "100%" }}>
              <Button
                variant="primary"
                onClick={handleProceedUpdate}
                style={{ marginRight: "10px" }}
              >
                Proceed
              </Button>
              <Button
                variant="secondary"
                onClick={closeModal}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Modal.Footer>
        ) : null}
      </Modal>
    </Container>
  );
};

export default EditProfile;
