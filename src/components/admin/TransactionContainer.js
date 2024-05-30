import React, { useState, useEffect } from 'react';
import TransactionList from './TransactionList';
import {
    getAllTransactions,
    getTransactionById,
    getTransactionByUserType,
    getTransactionsByFirstName,
    getTransactionsByLastName,
    getTransactionByOtherName,
    getTransactionByName
} from './transactionService';
import { Container, Form, Row, Col, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { fetchTransactions } from '../../utilities/fetchStudentData';
import { saveAs } from 'file-saver'; // You may need to install with `npm install file-saver`

// await fetchTransactions();

async function downloadCSV(transactions, fileName = "transactions_data.csv") {
    const headers = [
        "createdAt", "userId", "name", "txId", "txRef", "amount", "currency", "status", "description", "userType"
    ];
    const rows = transactions.map(transaction => [
        `"${transaction.createdAt}"`,
        `"${transaction.userId}"`,
        `"${transaction.name}"`,
        `"${transaction.txId}"`,
        `"${transaction.txRef}"`,
        `"${transaction.amount}"`,
        `"${transaction.currency}"`,
        `"${transaction.status}"`,
        `"${transaction.description}"`,
        `"${transaction.userType}"`,
    ]);

    // Convert array of arrays into CSV string
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
}

const TransactionContainer = () => {
    const { userInfo } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [filterValue, setFilterValue] = useState('');
    const [loader, setLoader] = useState(false);
    const [refreshResults, setRefreshResults] = useState(false);
    const [download, setDownload] = useState(false);

    const itemsPerPage = 10;

    useEffect(() => {
        async function InitialloadTransactions() {
            if (userInfo.labels.includes("admin") || userInfo.labels.includes("staff")) {
                try {
                    // await fetchTransactions();
                } catch (error) {
                    console.error('Failed to fetch transaction data:', error);
                }
            }
        }

        InitialloadTransactions();
    }, [userInfo]);

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setLoader(true);
                let loadedTransactions;
                switch (filter) {
                    case 'userId':
                        const transaction = await getTransactionById(filterValue);
                        loadedTransactions = transaction ? [transaction] : [];
                        break;
                    case 'userType':
                        loadedTransactions = await getTransactionByUserType(filterValue);
                        break;
                    case 'firstName':
                        loadedTransactions = await getTransactionsByFirstName(filterValue);
                        break;
                    case 'lastName':
                        loadedTransactions = await getTransactionsByLastName(filterValue);
                        break;
                    case 'otherName':
                        loadedTransactions = await getTransactionByOtherName(filterValue);
                        break;
                    case 'name':
                        loadedTransactions = await getTransactionByName(filterValue);
                        break;
                    case 'all':
                    default:
                        loadedTransactions = await getAllTransactions();
                        break;
                }
                setTransactions(loadedTransactions);
            } catch (err) {
                console.error('Error loading transactions:', err);
            } finally {
                setLoader(false);
            }
        };

        if (filter !== 'all' && filterValue === '') {
            setTransactions([]);
            setLoader(false);
        } else {
            loadTransactions();
        }
    }, [filter, filterValue]);

    const refreshTransactionsData = async () => {
        try {
            setRefreshResults(true);
            if (userInfo.labels.includes("admin") || userInfo.labels.includes("staff")) {
                await fetchTransactions(true);
            }
        } catch (e) {
            console.error('Failed to fetch transaction data:', e);
        } finally {
            setRefreshResults(false);
        }
    }

    const handleDownload = async () => {
        setDownload(true);
        let transactionsToDownload = [];
        try {
            if (filter !== 'all' && filterValue !== '') {
                switch (filter) {
                    case 'userId':
                        const transaction = await getTransactionById(filterValue);
                        if (transaction) transactionsToDownload = [transaction];
                        break;
                    case 'userType':
                        transactionsToDownload = await getTransactionByUserType(filterValue);
                        break;
                    case 'firstName':
                        transactionsToDownload = await getTransactionsByFirstName(filterValue);
                        break;
                    case 'lastName':
                        transactionsToDownload = await getTransactionsByLastName(filterValue);
                        break;
                    case 'otherName':
                        transactionsToDownload = await getTransactionByOtherName(filterValue);
                        break;
                    case 'name':
                        transactionsToDownload = await getTransactionByName(filterValue);
                        break;
                    default:
                        break;
                }
            } else {
                transactionsToDownload = await getAllTransactions();
            }

            if (transactionsToDownload.length > 0) {
                await downloadCSV(transactionsToDownload);
            } else {
                // console.log('No data to download for the selected filter.');
            }
        } catch (error) {
            console.error('Error downloading CSV:', error);
        } finally {
            setDownload(false);
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Container style={{ paddingTop: '1.2rem' }}>
            <Form className="mb-4">
                <Row>
                    <Col md={6}>
                        <Form.Select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            aria-label="Filter selection"
                            className="mb-3"
                        >
                            <option value="all">All Transactions</option>
                            <option value="userId">By User ID</option>
                            <option value="userType">By User Type</option>
                            <option value="firstName">By First Name</option>
                            <option value="lastName">By Last Name</option>
                            <option value="otherName">By Other Name</option>
                            <option value="name">By Name</option>
                        </Form.Select>
                        {(filter !== 'all' && filter !== 'userType') && (
                            <Form.Control
                                type="text"
                                value={filterValue}
                                onChange={e => setFilterValue(e.target.value)}
                                placeholder={`Enter ${filter}`}
                                className="mb-3"
                            />
                        )}
                        {filter === 'userType' && (
                            <Form.Select
                                value={filterValue}
                                onChange={e => setFilterValue(e.target.value)}
                                aria-label="User Type selection"
                                className="mb-3"
                            >
                                <option value="">Select User Type</option>
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="subscriber">Subscriber</option>
                            </Form.Select>
                        )}
                    </Col>
                    <Col>
                        <ButtonGroup>
                            <Button variant="outline-secondary" onClick={handleDownload} disabled={download}>
                                {download ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faDownload} className="me-2" />}
                                Download CSV
                            </Button>
                            <Button variant="outline-success" onClick={refreshTransactionsData} disabled={refreshResults}>
                                {refreshResults ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faRefresh} className="me-2" />}
                                Refresh Transactions
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            </Form>
            <TransactionList
                transactions={transactions}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                paginate={paginate}
                loader={loader}
            />
        </Container>
    );
};

export default TransactionContainer;
