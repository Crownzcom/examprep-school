// PersonalDetails.js
import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const PersonalDetails = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  otherName,
  setOtherName,
  gender,
  setGender,
  classGrade,
  setClassGrade,
  schoolName,
  setSchoolName,
  schoolAddress,
  setSchoolAddress,
}) => (
  <>
    {/* Personal Details */}
    <Row>
      <Col md={6} className="mb-3">
        <Form.Label>First Name*</Form.Label>
        <Form.Control
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </Col>
      <Col md={6} className="mb-3">
        <Form.Label>Last Name*</Form.Label>
        <Form.Control
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </Col>
      <Col md={6} className="mb-3">
        <Form.Label>Other Names</Form.Label>
        <Form.Control
          type="text"
          value={otherName}
          onChange={(e) => setOtherName(e.target.value)}
        />
      </Col>
    </Row>
    <Row>
      <Col md={6} className="mb-3">
        <Form.Label>Gender*</Form.Label>
        <Form.Select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Form.Select>
      </Col>
      <Col md={6} className="mb-3">
        <Form.Label>Education Level*</Form.Label>
        <Form.Select
          value={classGrade}
          onChange={(e) => setClassGrade(e.target.value)}
          required
        >
          <option value="">Select Education Level</option>
          <option value="PLE">Primary Leaving Examination (PLE)</option>
          {/* <option value="UCE">Uganda Certificate of Education (UCE)</option>
          <option value="UACE">
            Uganda Advanced Certificate of Education (UACE)
          </option> */}
          {/* Add other options as needed */}
        </Form.Select>
      </Col>
    </Row>
    {/* School Details */}
    <Row>
      <Col md={6} className="mb-3">
        <Form.Label>School Name{classGrade === "PLE" ? "*" : null}</Form.Label>
        <Form.Control
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          required={classGrade === "PLE"}
        />
      </Col>
      <Col md={6} className="mb-3">
        <Form.Label>
          School Address{classGrade === "PLE" ? "*" : null}
        </Form.Label>
        <Form.Control
          type="text"
          value={schoolAddress}
          onChange={(e) => setSchoolAddress(e.target.value)}
          required={classGrade === "PLE"}
        />
      </Col>
    </Row>
  </>
);

export default PersonalDetails;
