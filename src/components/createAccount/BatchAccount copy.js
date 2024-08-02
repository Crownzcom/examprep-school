import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faCheck, faFileCsv, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { serverUrl } from "../../config.js"
import db from '../../db';
import './BatchAccount.css';

const url = `${serverUrl}/create-account/create-users`;

const BatchAccount = () => {
  const [users, setUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [pdfReady, setPdfReady] = useState(false);
  const [classes, setClasses] = useState([]);
  const [invalidEntries, setInvalidEntries] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const fetchedClasses = await db.classes.toArray();
      setClasses(fetchedClasses);
    };

    fetchClasses();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const expectedHeaders = [
    'userType',
    'firstName',
    'lastName',
    'otherName',
    'gender',
    'studClass',
    'stream'
  ];

  const validateHeaders = (headers) => {
    return headers.length === expectedHeaders.length && expectedHeaders.every((header, index) => header === headers[index]);
  };

  const validateUsers = async (data) => {
    const invalidEntries = [];
    const validEntries = [];

    for (const row of data) {
      const user = {
        userType: row.userType,
        firstName: row.firstName,
        lastName: row.lastName,
        otherName: row.otherName || null,
        gender: row.gender,
        label: row.userType === 'admin' ? ['admin'] : ['student'],
      };

      if (row.userType === 'student') {
        const classObj = classes.find(cls => cls.classID === row.studClass);
        if (!classObj) {
          invalidEntries.push({ ...user, studClass: row.studClass, stream: row.stream, error: 'Invalid class' });
          continue;
        }
        const streams = JSON.parse(classObj.streams);
        if (!streams.includes(row.stream)) {
          invalidEntries.push({ ...user, studClass: row.studClass, stream: row.stream, error: 'Invalid stream' });
          continue;
        }
        user.studClass = row.studClass;
        user.stream = row.stream;
      }

      if (row.userType === 'student') {
        if (user.userType && user.firstName && user.lastName && user.gender && user.studClass && user.stream) {
          validEntries.push(user);
        } else {
          invalidEntries.push({ ...user, error: 'Missing fields' });
        }
      } else {
        if (user.userType && user.firstName && user.lastName && user.gender) {
          validEntries.push(user);
        } else {
          invalidEntries.push({ ...user, error: 'Missing fields' });
        }
      }
    }

    setInvalidEntries(invalidEntries);
    return validEntries;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('User Credentials', 14, 20);
    const tableColumn = ['UserID', 'First Name', 'Last Name', 'Class', 'Stream', 'Password'];
    const tableRows = [];

    users.forEach((user) => {
      const userData = [
        user.userID,
        user.firstName,
        user.lastName,
        user.studClass ?? 'N/A',
        user.stream ?? 'N/A',
        user.password,
      ];
      tableRows.push(userData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save('user_credentials.pdf');
  };

  const generateTemplate = (type) => {
    const templateData = [expectedHeaders];
    if (type === 'csv') {
      const csvContent = Papa.unparse(templateData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'user_template.csv');
    } else {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'user_template.xlsx');
    }
  };

  const uploadUsers = async (formattedUsers) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedUsers),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setConfirmation('Users uploaded successfully');
      setUsers(data);
      setPdfReady(true);
    } catch (error) {
      setConfirmation('Error uploading users');
    } finally {
      setIsUploading(false);
      setTimeout(() => setConfirmation(''), 5000);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    if (!selectedFile) {
      setConfirmation('No file selected');
      setIsUploading(false);
      setTimeout(() => setConfirmation(''), 3000);
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    const handleValidation = async (data) => {
      const validEntries = await validateUsers(data);

      if (invalidEntries.length > 0) {
        setConfirmation(`Invalid entries found: ${invalidEntries.map(entry => `${entry.firstName} ${entry.lastName} (${entry.error})`).join(', ')}`);
        setIsUploading(false);
        setTimeout(() => setConfirmation(''), 6000);
        return;
      }

      uploadUsers(validEntries);
    };

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        complete: async (result) => {
          if (!validateHeaders(result.meta.fields)) {
            setConfirmation('Invalid CSV headers. Please check your file.');
            setIsUploading(false);
            setTimeout(() => setConfirmation(''), 6000);
            return;
          }
          await handleValidation(result.data);
        },
      });
    } else if (['xls', 'xlsx', 'xlsm'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        if (!validateHeaders(sheet[0])) {
          setConfirmation('Invalid Excel headers. Please check your file.');
          setIsUploading(false);
          setTimeout(() => setConfirmation(''), 6000);
          return;
        }

        const dataRows = sheet.slice(1).map((row) => {
          const rowData = {};
          sheet[0].forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        await handleValidation(dataRows);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setConfirmation('Unsupported file type');
      setIsUploading(false);
      setTimeout(() => setConfirmation(''), 6000);
    }
  };

  return (
    <Container className="signup-container">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="file-upload-card">
            <Card.Header className="text-center">
              <h3><FontAwesomeIcon icon={faFileUpload} /> Import Users</h3>
            </Card.Header>
            <Card.Body>
              {confirmation && (
                <Alert variant={confirmation.includes('successfully') ? 'success' : 'danger'}>
                  {confirmation}
                </Alert>
              )}
              <Form onSubmit={handleFileUpload}>
                <Form.Group>
                  <Form.Label>Accepted File Types:</Form.Label>
                  <ul>
                    <li>
                      CSV (.csv)
                      <Button variant="info" size="sm" className="ml-2" onClick={() => generateTemplate('csv')}>
                        <FontAwesomeIcon icon={faFileCsv} /> Download csv template
                      </Button>
                    </li>
                    <li>
                      Excel (.xls, .xlsx, .xlsm)
                      <Button variant="info" size="sm" className="ml-2" onClick={() => generateTemplate('xlsx')}>
                        <FontAwesomeIcon icon={faFileExcel} /> Download excel template
                      </Button>
                    </li>
                  </ul>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Choose file</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv, .xls, .xlsx, .xlsm"
                  />
                </Form.Group>
                {selectedFile && (
                  <Button variant="success" type="submit" disabled={isUploading} className="w-100 mt-3">
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                )}
              </Form>
              {pdfReady && (
                <Button variant="primary" className="w-100 mt-3" onClick={generatePDF}>
                  <FontAwesomeIcon icon={faCheck} /> Download PDF
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BatchAccount;
