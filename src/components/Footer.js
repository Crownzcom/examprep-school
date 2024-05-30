import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css'; // Import custom CSS

function Footer() {
    return (
        <footer className="footer">
            <Container>
                <Row className="align-items-center justify-content-between">
                    <Col md={12} className="text-md-right">
                        <p className="footer-text mb-0">© {new Date().getFullYear()}  <a href="https://crownzcom.net">Crownzcom Limited</a>, All rights reserved.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
