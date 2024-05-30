import React, { useState } from 'react';
import { Container, Form, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { serverUrl } from "../config.js"

const AdminSignup = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [signupMethod, setSignupMethod] = useState('email');
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const adminData = { email, firstName, lastName, phone, signupMethod };

        try {
            const response = await fetch(`${serverUrl}/create-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adminData),
            });

            const data = await response.json();
            if (response.ok) {
                setShowModal(true);
            } else {
                console.error('Signup failed:', data.message);
            }
        } catch (error) {
            console.error('Failed to connect to the server:', error);
        }
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <h1><FontAwesomeIcon icon={faUserPlus} /> Signup Admin</h1>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPhone">
                    <Form.Label>Phone Number</Form.Label>
                    <PhoneInput
                        international
                        defaultCountry="UG"
                        value={phone}
                        onChange={setPhone}
                    // required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicSignupMethod">
                    <Form.Label>Signup Method</Form.Label>
                    <Form.Control as="select" value={signupMethod} onChange={e => setSignupMethod(e.target.value)} required>
                        <option value="">Select Method</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Sign Up
                </Button>
            </Form>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Signup Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    The admin has been successfully registered. Please navigate to the login page to login.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminSignup;
