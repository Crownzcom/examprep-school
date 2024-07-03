import React, { useState } from 'react';
import {
    Container,
    Nav,
    Tab
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext.js";
import SingleAccount from './SingleAccount';
import BatchAccount from './BatchAccount';
import HeroHeader from "../HeroHeader";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import './CreateAccount.css';

const CreateAccount = () => {
    const { userInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('singleAccount');

    // Handlers for Tab Navigation
    const handleSelectTab = (tab) => {
        setActiveTab(tab);
    };

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
            <Container>
                <Nav variant="tabs" activeKey={activeTab} onSelect={handleSelectTab} className="nav-tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="singleAccount">
                            <FontAwesomeIcon icon={faUser} /> Single Account Creation
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="batchAccount">
                            <FontAwesomeIcon icon={faUsers} /> Batch Account Creation
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="singleAccount" active={activeTab === 'singleAccount'}>
                        <SingleAccount />
                    </Tab.Pane>
                    <Tab.Pane eventKey="batchAccount" active={activeTab === 'batchAccount'}>
                        <BatchAccount />
                    </Tab.Pane>
                </Tab.Content>
            </Container>
        </>
    );
};

export default CreateAccount;
