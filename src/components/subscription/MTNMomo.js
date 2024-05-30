/* TODO:
- Coupon usage tracking: Passing coupon data (couponCode) to enable update via the couponusage table for coupons not giving 100% discount

*/
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Row, Col, Card, Form, Button, Container, Spinner, Alert } from 'react-bootstrap';
import 'react-phone-number-input/style.css';
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { printPDF } from "./print/index";
import { serverUrl } from '../../config.js';
// import PropTypes from 'prop-types';
import {
    databases,
    database_id,
    transactionTable_id,
    pointsTable_id,
    Query,
    ID
} from "../../appwriteConfig.js";
import { updateStudentDataInLocalStorage } from '../../utilities/fetchStudentData'
import { updatePointsTable } from '../../utilities/otherUtils'
import { useAuth } from '../../context/AuthContext';
import './MTNMomo.css'

const MTNMomo = ({ propPrice, propPaymentFor, propStudentInfo }) => {
    const { userInfo, fetchUserPoints } = useAuth();
    const isStudent = userInfo.labels.includes("student");
    const isNextOfKin = userInfo.labels.includes("kin");

    const navigate = useNavigate();
    const location = useLocation();
    const { price, paymentFor, points, studentInfo, couponCode } = location.state || { price: null, paymentFor: 'points', points: 0, studentInfo: { userId: '', name: '', educationLevel: '' }, couponCode: null }; // Set default values accordingly

    //Destructuring student information
    // const { userId: studentId, name: studentName, educationLevel } = studentInfo;
    let studentId = isNextOfKin ? studentInfo.userId : '';
    let studentName = isNextOfKin ? studentInfo.name : '';
    let educationLevel = isNextOfKin ? studentInfo.educationLevel : '';

    //Check if price is not null, or else navigate back
    useEffect(() => {
        // console.log('Price passed to MTN: ', price)
        if (!price) {
            navigate(-1);
        }
    }, []);

    const serverMomoRoute = `${serverUrl}/mtnMomo`

    const [phone, setPhone] = useState(userInfo.phone || '');
    const [amount, setAmount] = useState(price);
    const [message, setMessage] = useState('');
    const [phoneError, setPhoneError] = useState(false); // Error flag for user's phone
    const [receiptInfo, setReceiptInfo] = useState({});
    const [paymentStatus, setPaymentStatus] = useState('');
    const [submit, setSubmit] = useState(false);
    const [loaders, setLoaders] = useState(false);

    // Create a new MTN MoMo API user
    const createApiUser = async () => {
        // console.log('Creating API user...');
        const response = await fetch(`${serverMomoRoute}/create-api-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    };

    // Returns created user details if exists
    const getCreatedUser = async (userId) => {
        // console.log('Retrieving created user...');
        const response = await fetch(`${serverMomoRoute}/get-created-user/${userId}`);
        return response.json();
    };

    // Retrieve API key for the user used to generate a token
    const retrieveApiKey = async (userId) => {
        // console.log('Retrieving API key...');
        const response = await fetch(`${serverMomoRoute}/retrieve-api-key/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    };

    //Generates a token required for transaction
    const generateApiToken = async (userId, apiKey) => {
        // console.log('Generating MoMo token...');
        const response = await fetch(`${serverMomoRoute}/generate-api-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, apiKey })
        });
        return response.json();
    }

    // Request to make a payment using the generated token
    const requestToPay = async (phone, amount, momoTokenId) => {
        // console.log('Making payment request...');
        const response = await fetch(`${serverMomoRoute}/request-to-pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${momoTokenId}`
            },
            body: JSON.stringify({ phone, total: amount, momoTokenId })
        });
        return response.json();
    };

    // Verify payment status
    const verifyPaymentStatus = async (transactionId, momoTokenId) => {
        try {
            const response = await fetch(`${serverMomoRoute}/payment-status/${transactionId}/${momoTokenId}`);
            const data = await response.json();
            if (data.status === "SUCCESSFUL") {
                var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                const receiptDetails = {
                    id: data.financialTransactionId,
                    tx_ref: data.externalId,
                    payment_type: 'MTN Mobile Money Uganda',
                    charged_amount: data.amount,
                    currency: data.currency,
                    phone: data.payer.partyId,
                    transactionStatus: 'success',
                    description: `Points Purchase${isStudent ? '.' : ` for ${studentName}`}`,
                    created_at: currentDateTime, // or extract date from the response if available
                    points: points,

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
                        city: ""
                    },
                    personalInfo: {
                        website: '',
                        bank: {
                            person: "Crownzcom LTD",
                            name: "MTN Uganda",
                            IBAN: `+123-456-7890`
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
                        number: `${data.financialTransactionId}`,
                        date: `${currentDateTime}`,
                        subject: "Points Purchase",
                        total: `${data.currency}. ${data.amount}`,
                        text: "Payment for Points rendered in March 2024."
                    },
                    items: {
                        1: {
                            title: "Points",
                            description: `${points} Points Purchased ${isStudent ? `by ${userInfo.firstName} ${userInfo.lastName}` : ` for ${studentName}`}`,
                            amount: `${data.currency}. ${data.amount}`,
                            qty: `${points}`,
                            total: `${data.currency}. ${data.amount}`,
                        }
                    }
                };

                //Save to database
                await saveTransactionData(receiptDetails);

                /*** ----------- Update Points tables ----------- ***/
                //Update the points table in the database
                await updatePointsTable({
                    created_at: receiptDetails.created_at,
                    paymentFor: paymentFor,
                    transactionID: data.externalId,
                    userId: isStudent ? userInfo.userId : studentId,
                    points: points,
                    educationLevel: isStudent ? userInfo.educationLevel : educationLevel,
                    message: `Points Purchase with MTN MoMo`
                })

                //Update student side points
                if (isStudent) {
                    await fetchUserPoints(userInfo.userId, userInfo.educationLevel);
                }
                else { //Update next-of-kin side points
                    let newPointsBalance
                    //Query a Appwrite Database Table for user
                    try {

                        const response = await databases.listDocuments(database_id, pointsTable_id, [Query.equal('UserID', studentId)]);

                        // console.log('Checking points table: ', response)

                        if (response.documents.length > 0) {

                            newPointsBalance = response.documents[0].PointsBalance

                            //update Student Points via local storage
                            await updateStudentDataInLocalStorage(studentId, { pointsBalance: newPointsBalance });

                        }
                    } catch (err) {
                        console.error('Failed to Fetch points from Database for update after Payment verification: ', err);
                    }

                }
                /*** ----------- END: Update Points tables ----------- ***/

                setPaymentStatus('success');
                setReceiptInfo(receiptDetails);

                return receiptDetails;
            } else {
                // Handle unsuccessful transaction
                console.error("Payment Unsuccessful:", data);
                return
            }
        } catch (error) {
            console.error("Error verifying payment status:", error);
            throw error;
        }
    };

    // Phone number validation function
    const validatePhoneNumber = (phoneNumber) => {
        return phoneNumber && !isValidPhoneNumber(phoneNumber);
    };

    //Function to save transaction data to transaction database table
    const saveTransactionData = async (data) => {
        try {
            // console.log('Transaction Table - MTNMoMo - Purchased points on: ', data.created_at);

            // Custom parser for the format 'March 25th 2024, 8:46:48 am'
            let createdDate = moment(data.created_at, 'MMMM Do YYYY, h:mm:ss a', true);

            // Fallback to standard formats if custom parsing fails
            if (!createdDate.isValid()) {
                createdDate = moment(data.created_at, ['DD/MM/YYYY, HH:mm:ss', moment.ISO_8601], true);
            }

            // Final check if the date is valid
            if (!createdDate.isValid()) {
                // console.log('ERROR: Created Date: ', createdDate);
                throw new Error('Invalid date format');
            }

            // Convert to JavaScript Date object
            createdDate = createdDate.toDate();

            // console.log('CONVERTED CREATED-DATE: ', createdDate);

            const response = await databases.createDocument(database_id, transactionTable_id, 'unique()',
                {
                    userID: userInfo.userId,
                    transactionDate: createdDate,
                    transactionAmount: data.charged_amount,
                    currency: data.currency,
                    paymentMethod: data.payment_type,
                    paymentGateway: 'MTN Mobile Money Payment Gateway',
                    paymentSatus: data.transactionStatus,
                    transactionReference: data.tx_ref,
                    transactionId: `${data.id}`,
                    paymentFor: paymentFor,
                    description: 'Points Purchase',
                    points: parseInt(points, 10)
                }
            )
        } catch (error) {
            console.error('Error saving transaction data:', error);
        }
    };

    const handlePayment = async () => {
        setMessage('');
        setSubmit(true);
        setLoaders(true);
        if (!phone || !amount) {
            setMessage('Please enter both phone number and amount.');
            setLoaders(false);
            return;
        }

        // Validate phone numbers
        const isUserPhoneValid = !validatePhoneNumber(phone);

        if (!isUserPhoneValid) {
            setPhoneError(!isUserPhoneValid);
            setLoaders(false);
            return;
        }

        try {
            const userCreationResponse = await createApiUser();
            const userId = userCreationResponse.userId;
            // console.log('User ID: ', userId);

            // await getCreatedUser(userId);

            const apiKeyResponse = await retrieveApiKey(userId);
            const apiKey = apiKeyResponse.apiKey;
            // console.log('API key: ' + apiKey)

            const tokenResponse = await generateApiToken(userId, apiKey);
            const momoTokenId = tokenResponse.access_token;
            // console.log('API token: ' + momoTokenId)

            const paymentResponse = await requestToPay(phone, amount, momoTokenId);

            if (paymentResponse.success) {
                // console.log('Finshed to make payment...', paymentResponse);

                // Verify payment status
                // console.log('Verification ID:', paymentResponse.paymentRefId);
                const verificatioStatusResponse = await verifyPaymentStatus(paymentResponse.paymentRefId, paymentResponse.momoTokenId);
                // console.log('Verification status:', verificatioStatusResponse);
                setMessage(`Payment successful!`);
            } else {
                setMessage('Payment failed.');
            }
        } catch (error) {
            setSubmit(false);
            console.error('An error occurred:', error);
            setMessage('An error occurred while processing the payment.');
        }
        setLoaders(false);
    };

    const viewReceipt = () => {
        navigate(`/payment/receipt`, { state: { receiptData: receiptInfo } });
    };

    return (
        <Container className="mt-4" style={{ backgroundColor: ' background-color: hsl(236, 72%, 79%), hsl(237, 63%, 64%)' }}>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Header className="payment-card-header">
                            <Card.Title className="text-center mb-4">MTN Mobile Money Payment</Card.Title>
                            <Card.Text className="text-center">
                                Securely complete your payment with MTN Mobile Money.
                            </Card.Text>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Card.Subtitle>
                                    <Form.Label>Phone Number*</Form.Label>
                                </Card.Subtitle>
                                <PhoneInput
                                    className={`form-control ${phoneError ? "is-invalid" : ""}`}
                                    placeholder="Enter phone number"
                                    international
                                    defaultCountry="UG"
                                    value={phone}
                                    onChange={setPhone}
                                    required
                                />
                                {phoneError && (
                                    <Form.Control.Feedback type="invalid">
                                        Invalid phone number
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>

                            {message && (
                                <Alert
                                    variant={paymentStatus === "success" ? 'success' : 'danger'}
                                    className="mt-3 text-center"
                                >
                                    {message}
                                </Alert>
                            )}

                            {paymentStatus === "success" && (
                                <div className="text-center mt-4">
                                    <Alert variant='success'>
                                        <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success" />
                                        <p className="mt-2"><b>Service:</b> {points} points</p>
                                        <p className="mt-2"><b>Price:</b> {receiptInfo.currency + '. ' + price}</p>
                                    </Alert>
                                    <Button variant="dark" onClick={() => { printPDF(receiptInfo) }}>Print Receipt as PDF</Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => { navigate('/') }}
                                        disabled={paymentStatus === "success" ? false : true}
                                        hidden={paymentStatus === "success" ? false : true}
                                        className="w-100 mt-3 payment-submit-btn"
                                    >
                                        Back To Dahsboard
                                    </Button>
                                </div>
                            )}

                        </Card.Body>
                        <Card.Footer>
                            <Button
                                variant="primary"
                                onClick={handlePayment}
                                disabled={!phone || loaders}
                                hidden={paymentStatus === "success" ? true : false}
                                className="w-100 mt-3 payment-submit-btn"
                            >
                                {loaders ? 'Processing...' : 'Pay UGX. ' + price}
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

// MTNMomo.propTypes = {
//     price: PropTypes.number
// };

// MTNMomo.defaultProps = {
//     price: 2000
// };

export default MTNMomo;