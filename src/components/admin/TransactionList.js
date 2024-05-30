import React from 'react';
import { Spinner, Button, Card, Table, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBills } from '@fortawesome/free-solid-svg-icons';

const TransactionList = ({ transactions, itemsPerPage, currentPage, paginate, loader }) => {
    const navigate = useNavigate();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Card className="shadow-sm mb-4 profile-card">
            <Card.Header>
                <FontAwesomeIcon icon={faMoneyBills} className="me-2" />
                Transactions
            </Card.Header>
            <Card.Body>
                {loader ? (
                    <div className="d-flex justify-content-center">
                        <Spinner animation="grow" variant="primary" />
                        <Spinner animation="grow" variant="success" />
                        <Spinner animation="grow" variant="danger" />
                        <Spinner animation="grow" variant="warning" />
                        <Spinner animation="grow" variant="info" />
                    </div>
                ) : (
                    <Table hover>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Txn Date</th>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>Currency</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th>User Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransactions.map((transaction, index) => (
                                <tr key={transaction.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                                    <td>{transaction.name}</td>
                                    <td>{transaction.amount}</td>
                                    <td>{transaction.currency}</td>
                                    <td>{transaction.status}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.userType}</td>
                                    <td>
                                        <Button
                                            variant="dark"
                                            onClick={() =>
                                                navigate("/transaction-details", { state: { transaction } })
                                            }
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                <Nav aria-label="Page navigation">
                    <ul className="pagination">
                        {Array.from(
                            { length: Math.ceil(transactions.length / itemsPerPage) },
                            (_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                >
                                    <Button variant="link" onClick={() => paginate(i + 1)}>
                                        {i + 1}
                                    </Button>
                                </li>
                            )
                        )}
                    </ul>
                </Nav>
            </Card.Body>
        </Card>
    );
};

export default TransactionList;
