// KinModal.js
import React from "react";
import { Modal } from "react-bootstrap";
import KinSignup from "../KinSignup";

const KinModal = ({ show, onHide, newStudentId, firstName, lastName }) => (
  <Modal show={show} onHide={onHide} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Guardian Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <KinSignup
        userInfoProp={{ userId: newStudentId, firstName, lastName }}
        onCompletion={onHide}
        studSignUp={true}
      />
    </Modal.Body>
  </Modal>
);

export default KinModal;
