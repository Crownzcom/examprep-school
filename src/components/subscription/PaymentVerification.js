//This component is only meant to run after a transaction is made for ONLY FLUTTERWAVE transactions
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, ButtonGroup, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { printPDF } from "./print/index";
import {
    databases,
    database_id,
    transactionTable_id,
    pointsBatchTable_id,
    pointsTable_id,
    Query
} from "../../appwriteConfig.js";
import { updatePointsTable, couponTrackerUpdate } from '../../utilities/otherUtils'
import { updateStudentDataInLocalStorage } from '../../utilities/fetchStudentData'
import './PaymentResult.css'; // Path to your custom CSS file
import moment from 'moment';
import { serverUrl } from '../../config.js';

const PaymentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    //Extract response from url
    const queryParams = new URLSearchParams(location.search);

    const [transactionData, setTransactionData] = useState({});
    const [paymentStatus, setPaymentStatus] = useState('Verifying...');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responseData, setResponseData] = useState(null);

    const { userInfo, fetchUserPoints } = useAuth();
    const isStudent = userInfo.labels.includes("student");
    const isNextOfKin = userInfo.labels.includes("kin");

    const transactionId = queryParams.get('transaction_id') || parseTransactionIdFromResp(queryParams.get('resp'));
    // console.log('Transaction ID: ' + transactionId);
    const statusForPayment = queryParams.get('status');
    const tx_ref = queryParams.get('tx_ref');
    const statusMessage = parseMessageFromResp(queryParams.get('resp'))


    useEffect(() => {
        const verifyPayment = async () => {
            setMessage(statusMessage)
            setPaymentStatus(statusForPayment);

            // console.log('Verifying payment status: ', statusForPayment);
            if (statusForPayment === 'cancelled') {
                setMessage('Transaction cancelled')
                setPaymentStatus('Transaction is canceled.');
                setLoading(false);
            }
            else if (transactionId) {
                try {

                    const response = await fetch(`${serverUrl}/flutterwave/verify-payment/${transactionId}`);
                    const data = await response.json();

                    // console.log('Verified Data from Flutterwave: ', data);

                    //Saving to database
                    const saveTransaction = await saveTransactionData(data.transactionData);
                    // console.log('Saved to database in transaction Table: ', saveTransaction);


                    // console.log('Transaction data - Client side: ', data);
                    setPaymentStatus(data.status);
                    // console.log('Payment status - Client side: ', paymentStatus);


                    //Checking for coupon usage and update
                    if (data.transactionData.meta.couponCode) {
                        try {
                            const couponCode = data.transactionData.meta.couponCode
                            // console.log('Meta data: ', data.transactionData.meta.studentId);
                            await couponTrackerUpdate({ userId: isNextOfKin ? data.transactionData.meta.studentId : userInfo.userId, couponCode: couponCode });
                            // console.log('FLW-Coupon--UPDATE');
                        } catch (e) { console.error('Failed to update coupon table:', e) }
                    } else {
                        // console.log('No coupon provided');
                    }

                    try {
                        // Data to send to receipt
                        const receiptData = {
                            tx_ref: data.transactionData.tx_ref,
                            id: data.transactionData.id,
                            charged_amount: data.transactionData.amount,
                            currency: data.transactionData.currency,
                            payment_type: data.transactionData.payment_type,
                            name: data.transactionData.customer.name,
                            email: data.transactionData.customer.email,
                            phone: data.transactionData.customer.phone_number,
                            created_at: data.transactionData.customer.created_at,
                            card: data.transactionData.card || {},
                            description: data.transactionData.meta.description,
                            paymentFor: data.transactionData.meta.service,
                            points: data.transactionData.meta.points,
                            duration: data.transactionData.meta.duration,

                            //RECEIPT DATA
                            addressSender: {
                                person: "Crownzcom LTD",
                                building: "101, Block C, Swan Residency",
                                street: "Heritage Road, Kireka",
                                city: "Kampala, Uganda",
                                email: "crownzom@gmail.com",
                                phone: "+123-456-7890"
                            },
                            address: {
                                company: "",
                                person: `${userInfo.firstName} ${userInfo.lastName}`,
                                street: "",
                                city: "",
                            },
                            personalInfo: {
                                website: '',
                                bank: {
                                    person: "Crownzcom LTD",
                                    name: "Flutterwave Inc.",
                                    paymentMethod: `${data.transactionData.payment_type}`,
                                    cardOrPhoneNumber: `${data.transactionData.payment_type === 'card' ? '****' + data.transactionData.card.last_4digits : data.transactionData.customer.phone_number}`,
                                    IBAN: `UG1234***9ABC36`
                                },
                                taxoffice: {
                                    name: '',
                                    number: ''
                                }
                            },
                            label: {
                                invoicenumber: `Transaction Number`,
                                invoice: `Receipt`,
                                tableItems: "Item",
                                tableDescription: "Description",
                                tableQty: "Qty",
                                tableSinglePrice: "Unit Price",
                                tableSingleTotal: "Total Price",
                                totalGrand: "Grand Total",
                                contact: "Contact Information",
                                bank: "Payment Gateway Information",
                                taxinfo: "TAX Information"
                            },
                            invoice: {
                                number: `${data.transactionData.id}`,
                                date: `${data.transactionData.customer.created_at}`,
                                subject: "Exam Prep Tutor Payment Transaction",
                                total: `${data.transactionData.currency}. ${data.transactionData.amount}`,
                                text: "Payment rendered in March 2024."
                            },
                            items: {
                                1: {
                                    title: "Examination",
                                    // description: `${data.transactionData.meta.points} Points Purchased ${isStudent ? `by ${userInfo.firstName} ${userInfo.lastName}` : ` for ${data.transactionData.customer.name}`}`,
                                    description: `Payment transaction made by ${isStudent ? `by ${userInfo.firstName} ${userInfo.lastName}` : ` for ${data.transactionData.customer.name}`}`,
                                    amount: `${data.transactionData.currency}. ${data.transactionData.amount}`,
                                    // qty: `${data.transactionData.meta.points}`,
                                    qty: `-`,
                                    total: `${data.transactionData.currency}. ${data.transactionData.amount}`,
                                }
                            }
                        }

                        setTransactionData(receiptData);

                    }
                    catch (e) {
                        // console.log("error in recepit ..", e)
                        setMessage('Failed to generate receipt')
                        throw new Error
                    }

                } catch (error) {
                    setMessage(statusMessage)
                    setPaymentStatus('Verification failed. Please contact support.');
                } finally {
                    setLoading(false);
                }
            } else {
                setMessage(statusMessage)
                setPaymentStatus('Transaction Failed.');
                setLoading(false);
            }
        };

        verifyPayment();
    }, []);

    // Function to parse and extract transactionId from 'resp'
    function parseTransactionIdFromResp(resp) {
        if (!resp) return null;
        try {
            const decodedResp = JSON.parse(decodeURIComponent(resp));
            return decodedResp?.data?.id || null;
        } catch (error) {
            console.error('Error parsing resp:', error);
            return null;
        }
    }

    // Function to parse and extract message from 'resp'
    function parseMessageFromResp(resp) {
        if (!resp) return null;
        try {
            const decodedResp = JSON.parse(decodeURIComponent(resp));
            // console.log('message respo: ', decodedResp)
            return JSON.stringify(decodedResp?.message) || null;
        } catch (error) {
            console.error('Error parsing resp:', error);
            return null;
        }
    }


    //Function to save transaction data to transaction table snf points to points table
    const saveTransactionData = async (data) => {
        try {
            // console.log('Saving transaction data: ', data);
            const existingTransaction = await databases.listDocuments(database_id, transactionTable_id, [Query.equal('transactionId', [`${data.id}`])]);

            // console.log('Checking existing transaction: ', existingTransaction)

            if (existingTransaction.documents.length > 0) {
                return;
            }

            // console.log('transaction status: ', data.status);
            // console.log('Points purchased: ', data.meta.points);

            // console.log('original date: ', data.created_at)

            const created_at_formattedDate = moment(data.created_at, 'DD/MM/YYYY, HH:mm:ss').toDate();
            // console.log('formattedDate - moment: ', created_at_formattedDate);

            // console.log('Transaction Table - Flutterwave - Purchased points on: ', created_at_formattedDate);

            try {

                const response = await databases.createDocument(database_id, transactionTable_id, "unique()",
                    {
                        userID: userInfo.userId,
                        transactionDate: new Date(data.created_at),
                        transactionAmount: data.amount,
                        currency: data.currency,
                        paymentMethod: data.payment_type,
                        paymentGateway: 'Flutterwave Gateway',
                        paymentSatus: data.status === 'successful' ? 'success' : 'failed',
                        transactionReference: data.tx_ref,
                        transactionId: `${data.id}`,
                        paymentFor: data.meta.service,
                        description: data.meta.description,
                        points: parseInt(data.meta.points, 10)
                    }
                )

            } catch (e) {
                console.error('Update Transaction table error: ', e); throw e;
            }

            /*** ----------- Update Points tables ----------- ***/
            if (data.status === 'successful') {
                setMessage('Payment Successful!');
                //Update the points table in the database
                try {
                    await updatePointsTable({
                        created_at: new Date(data.created_at),
                        paymentFor: data.meta.service,
                        transactionID: data.tx_ref, //USED tx_ref because it's unique for all, but transactionId in transaction table can be duplicated
                        userId: isStudent ? userInfo.userId : data.meta.studentId,
                        points: data.meta.points,
                        duration: data.meta.duration,
                        educationLevel: isStudent ? userInfo.educationLevel : data.meta.educationLevel,
                        message: `Points Purchase with Flutterwave Gateway - PaymentVerification`
                    })
                } catch (e) { console.error('Update Points table error: ', e); throw e; }

                //Update student side points
                if (isStudent) {
                    await fetchUserPoints(userInfo.userId, userInfo.educationLevel);
                }
                else { //Update next-of-kin side points
                    let newPointsBalance
                    //Query a Appwrite Database Table for user
                    try {

                        const response = await databases.listDocuments(database_id, pointsTable_id, [Query.equal('UserID', data.meta.studentId)]);

                        // console.log('Checking points table: ', response)

                        if (response.documents.length > 0) {

                            newPointsBalance = response.documents[0].PointsBalance

                            //update Student Points via local storage
                            await updateStudentDataInLocalStorage(data.meta.studentId, { pointsBalance: newPointsBalance });

                        }
                    } catch (err) {
                        console.error('Failed to Fetch points from Database for update after Payment verification: ', err);
                    }

                }
            }
            /*** ----------- END: Update Points tables ----------- ***/

        } catch (error) {
            console.error('Error saving transaction data:', error);
        }
    };

    const exitPage = () => {
        navigate(`/`);
    };

    return (
        <Container className="mt-4" style={{ backgroundColor: ' background-color: hsl(236, 72%, 79%), hsl(237, 63%, 64%)' }}>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Header className="payment-card-header">
                            <Card.Title className="text-center mb-4">Exam Prep Tutor Online Payment</Card.Title>
                            <Card.Text className="text-center">
                                Transaction Verification Status.
                            </Card.Text>
                        </Card.Header>
                        <Card.Body>
                            {
                                loading ? (
                                    <div className="text-center">
                                        <Spinner animation="grow" variant="primary" className="sr-only" />
                                        <Spinner animation="grow" variant="secondary" className="sr-only" />
                                        <Spinner animation="grow" variant="success" className="sr-only" />
                                        <p className="sr-only">Loading...</p>
                                    </div>
                                )
                                    :
                                    <>
                                        {/* {message && (
                                            <Alert
                                                variant={paymentStatus === "success" ? 'success' : statusForPayment === 'cancelled' ? 'warning' : 'danger'}
                                                className="mt-3 text-center"
                                            >
                                                {paymentStatus === 'success' ? 'Payment Processing Successful' : message}
                                            </Alert>
                                        )} */}

                                        {paymentStatus === "success" ? (
                                            <div className="text-center mt-4">
                                                <Alert variant='success'>
                                                    <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success" />
                                                    <p className="mt-2"><b>Payment Successful!</b></p>
                                                    {/* <p className="mt-2"><b>Service:</b> {transactionData.points} points</p> */}
                                                    <p className="mt-2"><b>Service:</b> Payment for exams</p>
                                                    <p className="mt-2"><b>Price:</b> {transactionData.currency + '. ' + transactionData.charged_amount}</p>
                                                </Alert>
                                                <Button variant="dark" onClick={() => { printPDF(transactionData) }}>Print Receipt as PDF</Button>
                                            </div>
                                        ) :
                                            statusForPayment === "cancelled" ? (
                                                <div className="text-center mt-4">
                                                    <Alert variant='warning'>
                                                        <FontAwesomeIcon icon={faWarning} size="3x" className="text-danger" />
                                                        <p className="mt-2"><b>Transaction cancelled!</b></p>
                                                    </Alert>
                                                    <Button variant="dark" onClick={() => exitPage()}>Exit</Button>
                                                </div>
                                            ) : (
                                                <div className="text-center mt-4">
                                                    <Alert variant={paymentStatus === 'success' ? 'success' : '-primary'}>
                                                        <FontAwesomeIcon icon={faTimesCircle} size="3x" className='text-danger' />
                                                        <p className="mt-2"><b>{message}</b></p>
                                                        <p className="mt-2">
                                                            {paymentStatus}
                                                        </p>
                                                    </Alert>
                                                    <Button variant="dark" onClick={() => exitPage()}>Exit</Button>
                                                </div>
                                            )
                                        }
                                    </>
                            }
                        </Card.Body>
                        <Card.Footer>
                            <Button
                                variant="primary"
                                onClick={() => { navigate('/') }}
                                disabled={paymentStatus === "success" ? false : true}
                                hidden={paymentStatus === "success" ? false : true}
                                className="w-100 mt-3 payment-submit-btn"
                            >
                                Back To Dahsboard
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PaymentResult;
