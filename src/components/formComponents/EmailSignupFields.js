// EmailSignupFields.js
import React from "react";
import Form from "react-bootstrap/Form";
import PhoneInput from "react-phone-number-input";
import ProgressBar from "react-bootstrap/ProgressBar";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

const EmailSignupFields = ({
  email,
  setEmail,
  password,
  handlePasswordChange,
  confirmPassword,
  handleConfirmPasswordChange,
  passwordStrength,
  passwordMatch,
  phone,
  setPhone,
  phoneError,
}) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label>Email Address*</Form.Label>
      <Form.Control
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        required
      />
    </Form.Group>
    {/* Password Fields */}
    <Form.Group className="mb-3">
      <Form.Label>Password*</Form.Label>
      <Form.Control
        type="password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)} // Updated
        placeholder="Provide a Strong Password"
        required
        isInvalid={passwordStrength < 3}
      />
      <PasswordStrengthIndicator strength={passwordStrength} />
      <Form.Text className="text-muted">
        Use 8 or more characters with a mix of letters, numbers & symbols.
      </Form.Text>
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Confirm Password*</Form.Label>
      <Form.Control
        type="password"
        value={confirmPassword}
        onChange={(e) => handleConfirmPasswordChange(e.target.value)} // Updated
        placeholder="Confirm Password"
        required
        isInvalid={!passwordMatch}
      />
      {!passwordMatch && (
        <Form.Control.Feedback type="invalid">
          Passwords do not match
        </Form.Control.Feedback>
      )}
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Phone Number (Optional)</Form.Label>
      <PhoneInput
        className={`form-control ${phoneError ? "is-invalid" : ""}`}
        value={phone}
        onChange={setPhone}
        placeholder="Enter phone number"
      />
      {phoneError && (
        <Form.Control.Feedback type="invalid">
          Invalid phone number
        </Form.Control.Feedback>
      )}
    </Form.Group>
  </>
);

export default EmailSignupFields;
