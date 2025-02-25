import React, { useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  ButtonGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileCsv,
  faFileExcel,
  faDownload,
  faCheckCircle,
  faExclamationTriangle,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getSubCodeDetails, updateSubCodeAtCrownzcom } from "./utils.js";
import { useAuth } from "../../context/AuthContext";
import db from "../../db";
import { serverUrl, mainServerUrl } from "../../config.js";

const BatchAccount = () => {
  const { schoolInfo } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [createdUsers, setCreatedUsers] = useState([]);
  const [usersCreated, setUsersCreated] = useState(false);
  const [subscriptionCode, setSubscriptionCode] = useState("");
  const [codeValid, setCodeValid] = useState(false);
  const [subCodeInfo, setSubCodeInfo] = useState({});
  const [remainingStudents, setRemainingStudents] = useState(0);
  const [codeMessage, setCodeMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
    setUploadMessage("");
  };

  const handleSubscriptionCodeChange = (e) => {
    setSubscriptionCode(e.target.value || "");
    setCodeMessage("");
  };

  const validateSubscriptionCode = async () => {
    try {
      const result = await getSubCodeDetails(
        subscriptionCode,
        schoolInfo.schoolID
      );
      console.log("Sub code details: ", result);

      if (result.codeInfo.remainingStudents === 0 || !result.valid) {
        setCodeMessage(
          "The provided subscription code is invalid or expired. Please try again, or contact support for help."
        );
        throw new Error(
          "The provided subscription code is invalid or expired. Please try again, or contact support for help."
        );
      }

      setCodeValid(true);
      setRemainingStudents(result.codeInfo.remainingStudents);
      setCodeMessage("Subscription code is valid.");
      setSubCodeInfo(result.codeInfo);
    } catch (error) {
      console.error(
        "The provided subscription code is invalid or expired. Please try again, or contact support for help... ",
        error
      );
      setCodeMessage(
        "The provided subscription code is invalid or expired. Please try again, or contact support for help."
      );
    }
  };

  const downloadTemplate = (type) => {
    const headers = [
      "firstName",
      "lastName",
      "otherName",
      "gender",
      "studClass",
      "stream",
    ];
    let data = [headers];

    if (type === "csv") {
      const csvData = Papa.unparse(data);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "template.csv");
    } else {
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "template.xlsx");
    }
  };

  const validateData = async (data) => {
    // Fetch class data from the database
    const classData = await db.classes.toArray();
    console.log("Class Data from DB:", classData);

    const validClasses = classData.map((cls) => cls.classID);
    console.log("Valid Classes:", validClasses);

    const errors = [];
    const validData = data.filter((row, index) => {
      if (row.length !== 6) {
        errors.push(`Row ${index + 1}: Incorrect number of fields`);
        return false;
      }
      const [firstName, lastName, otherName, gender, studClass, stream] = row;
      console.log(`Row ${index + 1} - Class: ${studClass}, Stream: ${stream}`);

      // Check if the class exists
      const classInfo = classData.find((cls) => cls.classID === studClass);
      if (!classInfo) {
        errors.push(`Row ${index + 1}: Invalid class ${studClass}`);
        return false;
      }

      // Check if the stream exists within the class
      const streams = JSON.parse(classInfo.streams);
      console.log(`Class ${studClass} - Streams: ${streams}`);
      if (!streams.includes(stream)) {
        errors.push(
          `Row ${index + 1}: Invalid stream ${stream} for class ${studClass}`
        );
        return false;
      }

      return true;
    });

    console.log("Valid Data:", validData);
    console.log("Errors:", errors);

    return { validData, errors };
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    let data = [];
    if (file.name.endsWith(".csv")) {
      const csv = await file.text();
      data = Papa.parse(csv, { skipEmptyLines: true }).data;
    } else if (file.name.endsWith(".xlsx")) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        raw: false,
        blankrows: false,
      });
    }

    console.log("Uploaded Data:", data);

    // Remove header row
    const header = data.shift();
    console.log("Header:", header);

    const { validData, errors } = await validateData(data);

    if (errors.length > 0) {
      setUploadMessage(`Errors found:\n${errors.join("\n")}`);
      setIsUploading(false);
      return;
    }

    if (validData.length > remainingStudents) {
      setUploadMessage(
        `The number of students in the file exceeds the remaining allowed students. Maximum allowed is ${remainingStudents}.`
      );
      setIsUploading(false);
      return;
    }

    const userPayload = validData.map(
      ([firstName, lastName, otherName, gender, studClass, stream]) => ({
        userType: "student",
        firstName,
        lastName,
        otherName: otherName || null,
        gender,
        studClass,
        stream,
        label: ["student"],
      })
    );

    try {
      const response = await fetch(`${serverUrl}/create-account/create-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedUsers(result);
        setUploadMessage("Users created successfully!");

        if (result.createdUsers.length === 0) {
          console.log("no user created");
          throw new Error("No account was created from the server-side.");
        }

        //Update Crownzcom database with the used subscription code
        await updateSubCodeAtCrownzcom({
          subCode: subCodeInfo.subCode,
          remainingStudents:
            subCodeInfo.remainingStudents - result.noOfCreatedUsers,
        });

        setUsersCreated(true);
      } else {
        setUploadMessage("Failed to create users.");
      }
    } catch (error) {
      setUploadMessage("Error uploading users.");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "UserID",
      "First Name",
      "Last Name",
      "Other Name",
      "Email",
      "Class",
      "Stream",
      "Password",
    ];

    const UserArray =
      createdUsers.createdUsers && Array.isArray(createdUsers.createdUsers)
        ? createdUsers.createdUsers
        : [];

    console.log("Checking Created Users: ", createdUsers);

    const tableRows = UserArray.map((user) => [
      user.userID,
      user.firstName,
      user.lastName,
      user.otherName,
      user.email,
      user.studClass,
      user.stream,
      user.password,
    ]);

    doc.text("User Credentials", 14, 15);

    // Updated autoTable initiation
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("user_credentials.pdf");
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white text-center">
              <h4>
                <FontAwesomeIcon icon={faUpload} /> Batch Accounts Registration
              </h4>
            </Card.Header>
            <Card.Body>
              {!codeValid ? (
                <>
                  <Form>
                    <Form.Group>
                      <Form.Label>Enter Subscription Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter code"
                        value={subscriptionCode}
                        onChange={handleSubscriptionCodeChange}
                      />
                    </Form.Group>
                    <Button
                      onClick={validateSubscriptionCode}
                      className="w-100 mt-3"
                      variant="primary"
                    >
                      Validate Code
                    </Button>
                  </Form>
                  {codeMessage && (
                    <Alert
                      variant={
                        codeMessage === "Subscription code is valid."
                          ? "success"
                          : "danger"
                      }
                      className="mt-3"
                    >
                      {codeMessage}
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <Form>
                    <Form.Group>
                      <Form.Label>Select CSV or Excel File</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        key={file || ""} // Add a key to ensure re-render
                      />
                    </Form.Group>
                    <Button
                      onClick={handleFileUpload}
                      disabled={!file || isUploading}
                      className="w-100 mt-3"
                      variant="primary"
                    >
                      {isUploading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Upload"
                      )}
                    </Button>
                  </Form>
                  <hr />
                  <h5 className="text-center mt-4">Download Templates</h5>
                  <ButtonGroup className="w-100">
                    <Button
                      variant="outline-primary"
                      onClick={() => downloadTemplate("csv")}
                    >
                      <FontAwesomeIcon icon={faFileCsv} /> CSV Template
                    </Button>
                    <Button
                      variant="outline-success"
                      onClick={() => downloadTemplate("xlsx")}
                    >
                      <FontAwesomeIcon icon={faFileExcel} /> Excel Template
                    </Button>
                  </ButtonGroup>
                  {/* if users created then download pdf */}
                  {usersCreated && (
                    <Button
                      variant="success"
                      onClick={generatePDF}
                      className="w-100 mt-4"
                    >
                      <FontAwesomeIcon icon={faDownload} /> Download Credentials
                    </Button>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {uploadMessage && (
        <Row className="my-4">
          <Col>
            <Alert
              variant={uploadMessage.startsWith("Error") ? "danger" : "success"}
            >
              {uploadMessage.startsWith("Error") ? (
                <FontAwesomeIcon icon={faExclamationTriangle} />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} />
              )}{" "}
              {uploadMessage}
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default BatchAccount;
