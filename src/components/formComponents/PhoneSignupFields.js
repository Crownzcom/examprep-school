// PhoneSignupFields.js
import React from "react";
import Form from "react-bootstrap/Form";
import PhoneInput from "react-phone-number-input";
import "./PhoneSignupFields.css";

const PhoneSignupFields = ({
  phone,
  setPhone,
  phoneError,
  email,
  setEmail,
}) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label>Phone Number*</Form.Label>
      <div className="phone-input-container">
        <PhoneInput
          className={`form-control ${phoneError ? "is-invalid" : "custom-phone-input "
            }`}
          placeholder="Enter phone number"
          international
          countryCallingCodeEditable={false}
          value={phone}
          onChange={setPhone}
          required
        />
      </div>
      {phoneError && (
        <Form.Control.Feedback type="invalid">
          Invalid phone number
        </Form.Control.Feedback>
      )}
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Email Address (Optional)</Form.Label>
      <Form.Control
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
    </Form.Group>
  </>
);

export default PhoneSignupFields;
