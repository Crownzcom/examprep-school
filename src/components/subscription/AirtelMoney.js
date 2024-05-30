import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { serverUrl, rootUrl } from '../../config.js';
import './AirtelMoney.css'

function AirtelMoney({ propPrice, propPaymentFor, propStudentInfo }) {
    const { userInfo } = useAuth();
    const isStudent = userInfo.labels.includes("student");
    const isNextOfKin = userInfo.labels.includes("kin");

    const navigate = useNavigate();
    const location = useLocation();
    const { price, paymentFor, points, studentInfo } = location.state || { price: null, paymentFor: 'points', points: 0, studentInfo: { userId: '', name: '', educationLevel: '' } }; // Set default values accordingly

    //Destructuring student information
    // const { userId: studentId, name: studentName, educationLevel } = studentInfo;
    let studentId = isNextOfKin ? studentInfo.userId : '';
    let studentName = isNextOfKin ? studentInfo.name : '';
    let educationLevel = isNextOfKin ? studentInfo.educationLevel : '';

    // console.log('Student Information: ', JSON.stringify(studentInfo))

    useEffect(() => {
        // console.log('Price passed to MTN: ', price)
        if (!price) {
            navigate(-1);
        }
    }, []);

    const [phone, setPhone] = useState(userInfo.phone || '');
    // const [email, setEmail] = useState(userInfo.email || 'crownzcom@gmail.com');
    const [email, setEmail] = useState('crownzcom@gmail.com');
    const [message, setMessage] = useState('A page will load shortly after requesting you to enter an OTP. The OTP is 123456');
    const [phoneError, setPhoneError] = useState(false); // Error flag for user's phone
    const [amount, setAmount] = useState(price ? price : '2000');
    const [submit, setSubmit] = useState(false);

    // Extract the root URL (protocol + hostname + port)
    var rootURL = rootUrl;

    const [formData, setFormData] = useState({
        phone_number: phone,
        network: 'AIRTEL',
        amount: amount,
        currency: 'UGX',
        email: email,
        redirect_url: `${rootURL}/payment/verification`,
        meta: {
            userId: `${userInfo.userId}`,
            description: `Payment for exam/quiz Points${isStudent ? '.' : ` for ${studentName}`}`,
            service: `${paymentFor}`,
            points: `${points}`,
            ...(isStudent ? {} : { studentName: studentName, studentId: studentId, educationLevel: educationLevel }), // Conditional spread operator for adding studentInfo
        }
    });
    const [paymentStatus, setPaymentStatus] = useState(null);

    // Phone number validation function
    const validatePhoneNumber = (phoneNumber) => {
        return phoneNumber && !isValidPhoneNumber(phoneNumber);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPaymentStatus(null);

        setSubmit(true);

        setFormData({ ...formData, phone_number: phone });
        // setFormData({ ...formData, phone_number: '256121212121' });


        if (!formData.phone_number) {
            setMessage('Please enter phone number.');
            setSubmit(false);
            return;
        }

        // Validate phone numbers
        const isUserPhoneValid = !validatePhoneNumber(phone);

        if (!isUserPhoneValid) {
            setPhoneError(!isUserPhoneValid);
            setSubmit(false);
            return;

        }

        try {

            const response = await fetch(`${serverUrl}/flutterwave/mobile-money-pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            // console.log('Pay response Data:\n', data);
            if (data.response.status === 'success' && data.response.meta.authorization.mode === 'redirect') {
                window.location.href = data.response.meta.authorization.redirect;
                setPaymentStatus('A page will load shortly requesting you to enter OTP received on your phone')
                alert('A page will load shortly requesting you to enter OTP. OTP is 123456');
            } else {
                setPaymentStatus(data.response.message);
                setSubmit(false);
            }
        } catch (error) {
            console.error('Error making payment:', error);
            setPaymentStatus('Error making payment. Please try again.');
            setSubmit(false);
        }
    };

    return (
        <div className='mt-4' style={{ marginTop: "100px", backgroundColor: ' background-color: hsl(236, 72%, 79%), hsl(237, 63%, 64%)' }}>
            <Form onSubmit={handleSubmit}>
                <Card className="payment-card">
                    <Card.Header className="payment-card-header">
                        <h3>Airtel Money Payment</h3>
                        <p>Securely complete your payment via Airtel Money.</p>
                    </Card.Header>

                    <Card.Body>

                        <Form.Group className='mb-3'>
                            <Card.Subtitle>
                                <Form.Label>Phone Number*</Form.Label>
                            </Card.Subtitle>
                            <PhoneInput
                                className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                                placeholder='Enter phone number'
                                international
                                defaultCountry='UG'
                                value={phone}
                                onChange={setPhone}
                                required
                            />
                            {phoneError && (
                                <Form.Control.Feedback type='invalid'>
                                    Invalid phone number
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {paymentStatus && (
                            <Alert className='mt-3' variant='info'>{paymentStatus}</Alert>
                        )}

                        <Button
                            variant='primary'
                            type='submit'
                            className="w-100 mt-3 payment-submit-btn"
                            disabled={!phone || submit}
                        >
                            {submit ? 'Processing...' : 'Pay with Mobile Money'}
                        </Button>

                    </Card.Body>

                    <Card.Footer>
                        {message && <p className="payment-message">{message}</p>}
                    </Card.Footer>
                </Card>
            </Form>
        </div>
    );
}

AirtelMoney.propTypes = {
    price: PropTypes.number
};

AirtelMoney.defaultProps = {
    price: 2000
};

export default AirtelMoney;
