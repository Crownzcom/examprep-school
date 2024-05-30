// src/components/Testing.js
import React, { useState } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
  Nav,
  Tab,
} from "react-bootstrap";
import { account } from '../appwriteConfig';

function Testing() {
  const [email, setEmail] = useState("");

  // Appwrite Email Verification API
  const verifyEmail = async () => {
    try {
      const response = await account.createVerification(
        'https://exampreptutor.com' // url
      );

      console.log(response);
    } catch (err) {
      console.log('Failed to verify: ', err.message);
      console.error('Failed to verify: ', err);
    }
  };

  // Appwrite Password Reset API
  const resetPassword = async () => {
    try {
      const response = await account.createRecovery(
        email,
        'https://exampreptutor.com' // url
      );

      console.log(response);
    } catch (err) {
      console.log('Failed to verify: ', err.message);
      console.error('Failed to verify: ', err);
    }
  };

  return (
    <Container>
      <Tab.Container id="left-tabs-example" defaultActiveKey="verifyEmail">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="verifyEmail">Verify Email</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="resetPassword">Reset Password</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="verifyEmail">
                <Card>
                  <Card.Body>
                    <Card.Title>Email Verification</Card.Title>
                    <Form>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={verifyEmail}>
                        Verify Email
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="resetPassword">
                <Card>
                  <Card.Body>
                    <Card.Title>Reset Password</Card.Title>
                    <Form>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={resetPassword}>
                        Reset Password
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}

export default Testing;
