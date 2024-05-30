import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../utilities/toastUtil.js";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { account } from "../appwriteConfig.js";
import PasswordStrengthIndicator from "./formComponents/PasswordStrengthIndicator";

import "./PasswordReset.css";

function PasswordReset() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setPasswordsMatch(false);
      return;
    }

    if (passwordStrength < 3) {
      showToast("Please ensure your password is strong enough", "error");
      return;
    }

    setPasswordsMatch(true);

    try {
      if (password !== repeatPassword) {
        setPasswordsMatch(false);
        return;
      }
      setPasswordsMatch(true);
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");
      const secret = urlParams.get("secret");

      // Handle password reset logic here
      const promise = account.updateRecovery(
        userId,
        secret,
        password,
        password
      );
      showToast("Password has been successfully reset", "success");
      setSuccess(true);
    } catch (error) {
      console.error(error); // Failure
      setSuccess(false);
      throw error;
    }
  };

  return (
    <Container className="mt-5 resetPassword">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Reset Your Password</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              <PasswordStrengthIndicator strength={passwordStrength} />
              <Form.Text className="text-muted">
                Use 8 or more characters with a mix of letters, numbers &
                symbols.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicRepeatPassword">
              <Form.Label>Repeat New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repeat Password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                isInvalid={!passwordsMatch}
                required
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match.
              </Form.Control.Feedback>
            </Form.Group>

            {!passwordsMatch && (
              <Alert variant="danger">
                The passwords you entered do not match.
              </Alert>
            )}

            {success ? (
              <Alert variant="success">
                <div className="text-center mt-3">
                  Password has been successfully set.{" "}
                  <p>
                    <Link to="/sign-in">Login here</Link>
                  </p>
                </div>
              </Alert>
            ) : null}

            <Button variant="primary" type="submit">
              Reset Password
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default PasswordReset;
