import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { printPDF } from "./print/index";
import { formatDate } from '../../utilities/resultsUtil'
import './Receipt.css'; // Import your custom CSS

const Receipt = ({ propReceiptData }) => {
    const location = useLocation();
    const { receiptData } = location.state || { price: 2000, paymentFor: 'points' }; // Set defaultReceiptData
    // console.log('Receipt Data: ', receiptData)
    const isCardPayment = receiptData.payment_type === 'card';

    const downloadPdf = () => {
        const doc = new jsPDF();

        // Set the font for the entire document
        doc.setFont('Helvetica');

        // Title 'Receipt'
        doc.setFontSize(18);
        // doc.setFontStyle('bold');
        doc.text("Receipt", 105, 20, null, null, 'center');

        // Invoice and receipt numbers, date paid, and payment method
        doc.setFontSize(11);
        // doc.setFontStyle('normal');
        doc.text(`Invoice number: ${receiptData.id}`, 20, 40);
        doc.text(`Receipt number: ${receiptData.tx_ref}`, 20, 50);
        doc.text(`Date paid: ${formatDate(receiptData.created_at)}`, 20, 60);
        doc.text(`Payment method: ${receiptData.payment_type}`, 20, 70);

        // Seller's address
        doc.setFontSize(10);
        doc.text("OpenAI LLC", 20, 90);
        doc.text("548 Market Street", 20, 100);
        doc.text("PMB 97273", 20, 110);
        doc.text("San Francisco, California 94104-5401", 20, 120);
        doc.text("United States", 20, 130);

        // Billing details
        doc.setFontSize(10);
        doc.text(`Bill to:`, 20, 150);
        doc.text(`${receiptData.name}`, 20, 160);
        doc.text(`Kirinya - Namataba`, 20, 170);
        doc.text(`Kampala, Uganda`, 20, 180);
        doc.text(`${receiptData.email}`, 20, 190);

        // Payment summary
        doc.setFontSize(12);
        // doc.setFontStyle('bold');
        doc.text("$20.00 paid on February 16, 2024", 105, 210, null, null, 'center');

        // Description and subscription period
        doc.setFontSize(11);
        // doc.setFontStyle('normal');
        doc.text("Description", 20, 230);
        doc.text("ChatGPT Plus Subscription", 20, 240);
        doc.text("Feb 16 – Mar 16, 2024", 20, 250);

        // Amount details
        doc.setFontSize(11);
        doc.text("Subtotal", 20, 270);
        doc.text("Total", 20, 280);
        doc.text("Amount paid", 20, 290);
        doc.text("$20.00", 160, 270, null, null, 'right');
        doc.text("$20.00", 160, 280, null, null, 'right');
        doc.text("$20.00", 160, 290, null, null, 'right');

        // Footer
        doc.setFontSize(11);
        // doc.setFontStyle('normal');
        doc.text(`2086-2420 · $20.00 paid on February 16, 2024`, 105, 297, null, null, 'center');

        // Save the PDF
        doc.save(`receipt-${receiptData.id}.pdf`);
    };

    return (
        <Container className="my-4">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card>
                        <Card.Header as="h1" className="text-center">Payment Summary</Card.Header>
                        <Card.Body>
                            <Card.Title>Transaction Details</Card.Title>
                            <Card.Text>
                                <strong>Invoice number:</strong> {receiptData.invoice.number}<br />
                                <strong>Receipt number:</strong> {receiptData.id}<br />
                                <strong>Date paid:</strong> {formatDate(receiptData.created_at)}<br />
                                <strong>Payment method:</strong> {receiptData.payment_type}
                            </Card.Text>

                            <Card.Title>Bill To</Card.Title>
                            <Card.Text>
                                {receiptData.addressSender.person}<br />
                                {receiptData.addressSender.building}<br />
                                {receiptData.addressSender.street}, {receiptData.addressSender.city}<br />
                                {receiptData.addressSender.email}<br />
                                {receiptData.addressSender.phone}
                            </Card.Text>

                            <Card.Title>Item Details</Card.Title>
                            {Object.values(receiptData.items).map((item, index) => (
                                <Card.Text key={index}>
                                    <strong>{item.title}:</strong> {item.description}<br />
                                    Quantity: {item.qty}, Unit Price: {item.amount}, Total: {item.total}
                                </Card.Text>
                            ))}

                            <Card.Text>
                                <strong>Amount Paid:</strong> {receiptData.currency} {receiptData.charged_amount}<br />
                                <strong>Date:</strong> {formatDate(receiptData.created_at)}
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer className="text-muted">
                            <Button variant="primary" onClick={downloadPdf}>Download Receipt as PDF</Button>
                            <Button variant="dark" onClick={() => { printPDF(receiptData) }} className="ms-2">Print Receipt as PDF</Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Receipt;
