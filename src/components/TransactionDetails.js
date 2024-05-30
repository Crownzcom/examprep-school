import React, { useState } from 'react';
import { Card, ListGroup, Button, Row, Col, Accordion, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faList, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { getTransactionByUserId } from './admin/transactionService'; // Adjust the import as necessary
import TransactionList from './admin/TransactionList';

const TransactionDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { transaction } = location.state || {};
    const [userTransactions, setUserTransactions] = useState([]);
    const [showTransactions, setShowTransactions] = useState(false);
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    if (!transaction) {
        return <div>No transaction details available</div>;
    }

    const fetchUserTransactions = async () => {
        if (transaction.userId) {
            setLoader(true);
            const transactions = await getTransactionByUserId(transaction.userId);
            setUserTransactions(transactions);
            setShowTransactions(true);
            setLoader(false);
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Card className="shadow-sm mb-4 profile-card">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Transaction Details</span>
                <Button variant="light" onClick={() => navigate('/transactions')}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Transactions
                </Button>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>Transaction ID:</strong> {transaction.txId}</ListGroup.Item>
                            <ListGroup.Item><strong>Transaction Reference:</strong> {transaction.txRef}</ListGroup.Item>
                            <ListGroup.Item><strong>Amount:</strong> {transaction.amount}</ListGroup.Item>
                            <ListGroup.Item><strong>Currency:</strong> {transaction.currency}</ListGroup.Item>
                            <ListGroup.Item><strong>Status:</strong> {transaction.status}</ListGroup.Item>
                            <ListGroup.Item><strong>Description:</strong> {transaction.description}</ListGroup.Item>
                            <ListGroup.Item><strong>User Type:</strong> {transaction.userType}</ListGroup.Item>
                            <ListGroup.Item><strong>Transaction Date:</strong> {new Date(transaction.createdAt).toLocaleString()}</ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={6}>
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>User ID:</strong> {transaction.userId}</ListGroup.Item>
                            <ListGroup.Item><strong>Name:</strong> {transaction.name}</ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>
                <Accordion className="mt-3">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header onClick={fetchUserTransactions}>
                            <FontAwesomeIcon icon={showTransactions ? faChevronUp : faChevronDown} className="me-2" />
                            Other Transactions by {transaction.name}
                        </Accordion.Header>
                        <Accordion.Body>
                            {loader ? (
                                <Spinner animation="border" />
                            ) : (
                                showTransactions && (
                                    <>
                                        {userTransactions.length > 0 ? (
                                            <TransactionList
                                                transactions={userTransactions}
                                                itemsPerPage={itemsPerPage}
                                                currentPage={currentPage}
                                                paginate={paginate}
                                                loader={loader}
                                            />
                                        ) : (
                                            <p>No other transactions found for this user.</p>
                                        )}
                                    </>
                                )
                            )}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Card.Body>
        </Card>
    );
};

export default TransactionDetails;
