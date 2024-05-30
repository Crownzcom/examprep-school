import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { InputGroup, Container, Row, Col, ButtonGroup, Button, Form, Alert, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import {
    databases,
    database_id,
    pointsTable_id,
    Query,
    ID
} from "../../appwriteConfig.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import { updateStudentDataInLocalStorage } from '../../utilities/fetchStudentData.js'
import { useAuth } from '../../context/AuthContext.js';
import { updatePointsTable, couponTrackerUpdate } from '../../utilities/otherUtils.js'
import { serverUrl } from '../../config.js'
// import OrderSummery2 from './OrderSummery2';

import './PaymentMethods.css';

function PaymentMethods({ initialCoupon, price, paymentFor, points, tier, studentInfo, duration }) {
    const { userInfo, fetchUserPoints } = useAuth();
    const isStudent = userInfo.labels.includes("student");
    const isNextOfKin = userInfo.labels.includes("kin");
    const navigate = useNavigate();
    const originalPrice = price;
    const originalPoints = points;

    const [stage, setStage] = useState('coupon'); // 'coupon', 'summary', or 'payment'
    const [coupon, setCoupon] = useState(initialCoupon || '');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoader, setCouponLoader] = useState(false)
    const [finalPrice, setFinalPrice] = useState(originalPrice);
    const [finalPoints, setFinalPoints] = useState(originalPoints)
    const [paymentMadeFor, setPaymentMadeFor] = useState(paymentFor)
    const [loader, setLoader] = useState(false);

    const handleApplyCoupon = async () => {
        try {
            // Make an API call to validate the coupon
            setCouponLoader(true);
            const response = await fetch(`${serverUrl}/query/validate-coupon?code=${coupon}&userId=${isStudent ? userInfo.userId : studentInfo.userId}&userLabel=${userInfo.labels}`);
            const data = await response.json();

            if (response.ok && data.couponDetails) {
                setDiscountInfo(data.couponDetails); // Set discount info from response
                setCouponError('');
            } else {
                // Reset discount info and final price to original when the coupon is invalid
                setDiscountInfo(null);
                setFinalPrice(originalPrice);
                setCouponError(data.message || 'Invalid coupon code');
            }
            setCouponLoader(false);
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError('Error validating coupon. Please try again.');
            setCouponLoader(false);
        }
    };

    const calculatePrice = () => {
        if (!discountInfo) return originalPrice;
        if (discountInfo.DiscountType === 'points') return originalPrice; // No price change if discount is on points
        const discountValue = parseFloat(discountInfo.DiscountValue);
        switch (discountInfo.DiscountType) {
            case 'fixed':
                return Math.max(originalPrice - discountValue, 0);
            case 'percentage':
                return originalPrice * (1 - discountValue / 100);
            default:
                return originalPrice; // No discount applied
        }
    };

    const calculatePoints = () => {
        if (!discountInfo || discountInfo.DiscountType !== 'points') return originalPoints;

        const discountValue = parseFloat(discountInfo.DiscountValue);
        return Math.max(originalPoints + discountValue, 0); // Subtract discountValue from points if applicable
    };

    // useEffect to update finalPrice and finalPoints when discountInfo changes
    useEffect(() => {
        setFinalPrice(calculatePrice());
        setFinalPoints(calculatePoints()); // Assuming 'setPoints' updates the state for points
    }, [discountInfo]);

    const handleNext = async () => {
        calculatePoints(); //Calculate final points

        if (stage === 'coupon' && finalPrice > 0) {
            setStage('payment');
        }
        if (finalPrice === 0) {
            try {
                setLoader(true);
                // console.log('Student Information: ' + JSON.stringify(studentInfo))
                var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                let data = {
                    created_at: currentDateTime,
                    paymentFor: paymentMadeFor,
                    transactionID: 'DISCOUNT-0000',
                    userId: isStudent ? userInfo.userId : studentInfo.userId,
                    points: finalPoints,
                    educationLevel: isStudent ? userInfo.educationLevel : studentInfo.educationLevel,
                    message: `Points Purchase on discount.`,
                    duration: duration
                }
                await updatePointsTable(data)

                //UPDATE POINTS
                //Update student side points
                if (isStudent) {
                    await fetchUserPoints(userInfo.userId, userInfo.educationLevel);
                }
                else { //Update next-of-kin side points
                    let newPointsBalance
                    //Query a Appwrite Database Table for user
                    try {

                        const response = await databases.listDocuments(database_id, pointsTable_id, [Query.equal('UserID', studentInfo.userId)]);

                        // console.log('Checking points table: ', response)

                        if (response.documents.length > 0) {

                            newPointsBalance = response.documents[0].PointsBalance

                            //update Student Points via local storage
                            await updateStudentDataInLocalStorage(studentInfo.userId, { pointsBalance: newPointsBalance });

                        }
                    } catch (err) {
                        console.error('Failed to Fetch points from Database for update after Payment verification: ', err);
                    }

                }

                //Update the points usage table
                await couponTrackerUpdate({ userId: data.userId, couponCode: coupon });

            } catch (err) {
                console.error('Failed to top-up points: ', err);
            } finally {
                setLoader(false);
                navigate(-1)
            }
        }
    };

    const handlePaymentSelection = (method, network) => {
        navigate(`/payment/${method.toLowerCase()}`, { state: { price: finalPrice, paymentFor: paymentMadeFor, points: finalPoints, studentInfo: studentInfo, network: network, couponCode: coupon, duration: duration } });
    };

    return (
        <div>
            {/* Stage 1: Order Summery and Apply Coupon */}
            {stage === 'coupon' && (
                <Row className="justify-content-md-center order-summary">
                    <Col md={8} lg={9} className='justify-content-md-center'>
                        <Card className="content-center" >
                            <Card.Header as="h2">Order Summary</Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {/* You have selected the {tier} package. */}
                                    <br />
                                    <strong>Package:</strong> {tier}
                                    <br />
                                    <strong>Price: UGX.</strong>{finalPrice}
                                </Card.Text>
                                <Card.Title>Do you have a coupon?</Card.Title>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formCouponCode">
                                        <Form.Label>Apply Coupon/Token Code</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                value={coupon}
                                                onChange={(e) => setCoupon(e.target.value)}
                                                placeholder="Enter coupon code"
                                                aria-describedby="button-apply-coupon"
                                            />
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                id="button-apply-coupon"
                                                onClick={handleApplyCoupon}
                                                disabled={!coupon || couponLoader}  // Disable button when input is empty or loading
                                            >
                                                {couponLoader ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="visually-hidden">Applying...</span>
                                                    </>
                                                ) : "Apply"}
                                            </Button>
                                        </InputGroup>
                                        {couponLoader && (
                                            <div className="mt-2">
                                                <Spinner animation="grow" variant="primary" size="sm" />
                                                <Spinner animation="grow" variant="secondary" size="sm" />
                                                <Spinner animation="grow" variant="success" size="sm" />
                                            </div>
                                        )}
                                    </Form.Group>
                                    {couponError && <Alert variant="danger">{couponError}</Alert>}
                                </Form>
                                {discountInfo && (
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <i className="bi bi-building me-2"></i>
                                            <strong>Original Price:</strong> UGX. {originalPrice}
                                        </li>
                                        <li className="list-group-item">
                                            <i className="bi bi-building me-2"></i>
                                            <strong>Description:</strong> {discountInfo.Description}
                                        </li>
                                        <li className="list-group-item">
                                            <i className="bi bi-building me-2"></i>
                                            <strong>Discount:</strong>
                                            {' '}
                                            {(discountInfo.DiscountType === 'fixed') && 'UGX. '}
                                            {(discountInfo.DiscountType === 'fixed' || discountInfo.DiscountType === 'percentage') ? discountInfo.DiscountValue : (discountInfo.DiscountType === 'points' ? 'Exam discount' : 0)}
                                            {' '}
                                            {discountInfo.DiscountType === 'percentage' ? '%' : (discountInfo.DiscountType === 'points' ? null : null)}
                                        </li>
                                        <li className="list-group-item">
                                            <i className="bi bi-building me-2"></i>
                                            <strong>Final Price:</strong> {finalPrice}
                                        </li>
                                    </ul>

                                )}

                            </Card.Body>
                            <Card.Footer className="text-muted">

                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Stage 2: Select Payment Method */}
            {stage === 'payment' && (
                <Row className="justify-content-center my-5">
                    <h2 className="text-center mb-4 w-100">Select Payment Method</h2>

                    {/* MTN-MoMo */}
                    {/* <Col lg={4} className="d-flex justify-content-center">
                        <Card border="warning" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('mtn-momo', 'MTN')}>
                            <Card.Header style={{ backgroundColor: 'orange', color: 'white' }}>
                                MTN Mobile Money
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={img/images/mtnmomo.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col> */}

                    {/* Flutterwave: MTN-MoMo */}
                    <Col lg={4} className="d-flex justify-content-center">
                        <Card border="warning" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('mobile-money', 'MTN')}>
                            <Card.Header style={{ backgroundColor: 'orange', color: 'white' }}>
                                MTN Mobile Money
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/mtnmomo.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Flutterwave: Airtel-MoMo */}
                    <Col lg={4} className="d-flex justify-content-center">
                        {/* <Card border="danger" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('airtel-money', 'AIRTEL')}> */}
                        <Card border="danger" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('mobile-money', 'AIRTEL')}>
                            <Card.Header style={{ backgroundColor: 'red', color: 'white' }}>
                                Airtel Money
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/airtel-money.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Flutterwave: Card-MoMo */}
                    <Col lg={4} className="d-flex justify-content-center">
                        <Card border="info" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('card-payment', 'card')}>
                            <Card.Header style={{ backgroundColor: '#2a9d8f', color: 'white' }}>
                                Card
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/credit-card.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={8} style={{ paddingTop: '15px' }}>
                    </Col>
                </Row>

            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ButtonGroup style={{ width: '75%' }}>
                    <Button className='btn-cancel' variant="dark" onClick={() => navigate('/')}>
                        Cancel
                    </Button>

                    {stage === 'payment' && (
                        <Button variant="secondary" onClick={() => setStage('coupon')}>Back to Order Summary</Button>
                    )}

                    {stage === 'coupon' && (
                        !loader ?
                            <Button variant="success" onClick={handleNext}>{finalPrice === 0 ? 'Complete Purchase' : 'Proceed to Payment'}</Button>
                            :
                            <Button variant="success" disabled>
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Processing...
                            </Button>
                    )}
                </ButtonGroup>
            </div>

        </div>
    );
}

export default PaymentMethods;