import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './InfoCard.css';  // Custom CSS for styling

const InfoCard = ({ educationLevel, title, message, buttonText, onButtonClick }) => {
    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="text-center shadow-lg p-3 mb-5 bg-white rounded" style={{ maxWidth: '600px' }}>
                <Card.Header as="h5" className="bg-warning text-white">
                    {title}
                </Card.Header>
                <Card.Body>
                    <FontAwesomeIcon icon={faInfoCircle} size="3x" className="text-warning mb-3" />
                    <Card.Title>{educationLevel} Content Unavailable</Card.Title>
                    <Card.Text>{message}</Card.Text>
                    <Button variant="primary" onClick={onButtonClick}>
                        {buttonText}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default InfoCard;
