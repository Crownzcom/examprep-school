import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import NavigationCard from './NavigationCard'; // Import the NavigationCard component
import { faUsers, faUserCheck, faUserPlus, faUserSlash, faMoneyCheckAlt, faCheckCircle, faTimesCircle, faBan } from '@fortawesome/free-solid-svg-icons';
import db from '../../db'; // Import the database configuration

const AdminDashboard = () => {
    const [key, setKey] = useState('students');

    const [registeredCount, setRegisteredCount] = useState(0);
    const [subscribedCount, setSubscribedCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);
    const [allTxnCount, setAllTxnCount] = useState(0);
    const [successfulTxnCount, setSuccessfulTxnCount] = useState(0);
    const [failedTxnCount, setFailedTxnCount] = useState(0);
    const [canceledTxnCount, setCanceledTxnCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch student counts
                setRegisteredCount(await db.students.count());
                setSubscribedCount(await db.students.where('pointsBalance').belowOrEqual(1).count());
                setActiveCount(await db.students.where('accountStatus').equals('Active').count());
                setInactiveCount(await db.students.where('accountStatus').equals('Inactive').count());

                // Fetch transaction counts
                setAllTxnCount(await db.transactions.count());
                setSuccessfulTxnCount(await db.transactions.where('status').equals('successful').count());
                setFailedTxnCount(await db.transactions.where('status').equals('failed').count());
                setCanceledTxnCount(await db.transactions.where('status').equals('canceled').count());
            } catch (e) {
                console.error('Error fetching data from index db on component load', e);
            }
        };

        fetchData();
    }, []);

    return (
        <Container fluid>
            <Tabs
                id="controlled-tab-example"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
                variant="pills"
            >
                <Tab eventKey="students" title="Students">
                    <Row className="justify-content-md-center" style={{ marginTop: '20px', gap: '20px' }}>
                        {/* Student Cards */}
                        {[
                            { title: "Registered Students", icon: faUsers, borderColor: "#FF6347", link: "/registered-students", number: registeredCount },
                            { title: "Subscribed Students", icon: faUserCheck, borderColor: "#FF4500", link: "/subscribed", number: subscribedCount },
                            { title: "Active Students", icon: faUserPlus, borderColor: "#32CD32", link: "/active", number: activeCount },
                            { title: "Inactive Students", icon: faUserSlash, borderColor: "#20B2AA", link: "/inactive", number: inactiveCount }
                        ].map(card => (
                            <Col md={3} key={card.title}>
                                <NavigationCard {...card} gradient={`linear-gradient(135deg, ${card.borderColor} 0%, #008080 100%)`} />
                            </Col>
                        ))}
                    </Row>
                </Tab>
                <Tab eventKey="transactions" title="Transactions">
                    <Row className="justify-content-md-center" style={{ marginTop: '20px', gap: '20px' }}>
                        {/* Transaction Cards */}
                        {[
                            { title: "All Transactions", icon: faMoneyCheckAlt, borderColor: "#FF6347", link: "/transactions", number: allTxnCount },
                            { title: "Successful Transactions", icon: faCheckCircle, borderColor: "#32CD32", link: "/successful-transactions", number: successfulTxnCount },
                            { title: "Canceled Transactions", icon: faBan, borderColor: "#FF4500", link: "/canceled-transactions", number: canceledTxnCount },
                            { title: "Failed Transactions", icon: faTimesCircle, borderColor: "#20B2AA", link: "/failed-transactions", number: failedTxnCount }
                        ].map(card => (
                            <Col md={3} key={card.title}>
                                <NavigationCard {...card} gradient={`linear-gradient(135deg, ${card.borderColor} 0%, #008080 100%)`} />
                            </Col>
                        ))}
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default AdminDashboard;
