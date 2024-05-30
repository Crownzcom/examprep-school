import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./HeroHeader.css";

const HeroHeader = ({ children }) => (
  <div className="hero-header bg-primary text-white text-center py-5 mb-4">
    <Container>
      <Row>
        <Col>{children}</Col>
      </Row>
    </Container>
  </div>
);

export default HeroHeader;
