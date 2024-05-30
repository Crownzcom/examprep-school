import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

const NavigationCard = ({ title, icon, borderColor, link, number, action, gradient }) => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        if (action) {
            action();
        }
        navigate(link);
    };

    return (
        <Card
            style={{
                background: gradient,
                borderWidth: '0',
                color: '#fff',
                marginBottom: '20px',
                borderRadius: '20px',
                boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer'
            }}
            className="text-center h-100 p-4"
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0px 10px 20px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0px 5px 15px rgba(0,0,0,0.2)';
            }}
        >
            <Card.Body>
                <FontAwesomeIcon icon={icon} size="3x" style={{ color: '#fff', marginBottom: '10px' }} />
                <Card.Title className="mt-3">{title}</Card.Title>
                <Card.Text>
                    <strong>{number}</strong> Entries
                </Card.Text>
                <Button variant="light" onClick={handleButtonClick}>View Details</Button>
            </Card.Body>
        </Card>
    );
};

export default NavigationCard;
