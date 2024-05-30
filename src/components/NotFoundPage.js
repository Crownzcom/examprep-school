import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFrownOpen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <Container className="not-found-container">
            <Row>
                <Col className="text-center">
                    <FontAwesomeIcon icon={faFrownOpen} size="6x" className="not-found-icon" />
                    <h1>Oops!</h1>
                    <h2>404 - Page Not Found</h2>
                    <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                    <Button variant="dark" onClick={handleGoHome}>
                        Go to Homepage
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;
