import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ApiForm = ({ onBack, onSubmit }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        onSubmit(data);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="endpointUrl">
                <Form.Label>Endpoint URL</Form.Label>
                <Form.Control type="url" name="endpointUrl" required />
            </Form.Group>

            <Form.Group controlId="projectId">
                <Form.Label>Project ID</Form.Label>
                <Form.Control type="text" name="projectId" required />
            </Form.Group>

            <Form.Group controlId="apiKey">
                <Form.Label>API Key</Form.Label>
                <Form.Control type="text" name="apiKey" required />
            </Form.Group>

            <Button variant="secondary" onClick={onBack}>
                Back
            </Button>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    );
};

export default ApiForm;
