import React, { useState } from 'react';
import {
    Container,
    Card,
    ButtonGroup,
    Button,
    Modal
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.js";
import SingleAccount from './SingleAccount.js';
import BatchAccount from './BatchAccount.js'; // Make sure the path is correct
import HeroHeader from "../HeroHeader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import './CreateAccount.css';

const CreateAccount = () => {
    const { userInfo } = useAuth();
    const [showSingleAccountModal, setShowSingleAccountModal] = useState(false);
    const [showBatchAccountModal, setShowBatchAccountModal] = useState(false);

    const handleShowSingleAccountModal = () => setShowSingleAccountModal(true);
    const handleCloseSingleAccountModal = () => setShowSingleAccountModal(false);

    const handleShowBatchAccountModal = () => setShowBatchAccountModal(true);
    const handleCloseBatchAccountModal = () => setShowBatchAccountModal(false);

    // Hero Header
    const renderHeroHeader = () => (
        <HeroHeader>
            <div className="text-center">
                <h1 className="display-4">Hello, {userInfo.firstName}!</h1>
                <p className="lead">You're on the User Account Creation Page</p>
            </div>
        </HeroHeader>
    );

    return (
        <>
            {renderHeroHeader()}
            <Container className="d-flex flex-column align-items-center justify-content-center my-5">
                <Card className="w-100" style={{ maxWidth: '' }}>
                    <Card.Header className="text-center">
                        <h3>User Account Creation</h3>
                    </Card.Header>
                    <Card.Body className="text-center">
                        <p>Welcome to the user account creation page. Here you can create single or multiple user accounts effortlessly. Click on the appropriate button below to get started.</p>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-center">
                        <ButtonGroup>
                            <Button
                                variant="primary"
                                onClick={handleShowSingleAccountModal}
                                className="m-2 custom-button"
                            >
                                <FontAwesomeIcon icon={faUser} /> Single Account Creation
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleShowBatchAccountModal}
                                className="m-2 custom-button"
                            >
                                <FontAwesomeIcon icon={faUsers} /> Batch Account Creation
                            </Button>
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            </Container>

            <Modal
                show={showSingleAccountModal}
                backdrop='static'
                aria-labelledby="example-custom-modal-styling-title"
                fullscreen={true}
                keyboard={false}
                onHide={handleCloseSingleAccountModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Single Account Creation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SingleAccount />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSingleAccountModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showBatchAccountModal}
                backdrop='static'
                aria-labelledby="example-custom-modal-styling-title"
                fullscreen={true}
                keyboard={false}
                onHide={handleCloseBatchAccountModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Batch Account Creation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BatchAccount />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseBatchAccountModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CreateAccount;
