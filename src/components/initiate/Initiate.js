import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from "react-router-dom"; // Use Link from react-router-dom for navigation
import SchoolForm from './SchoolForm';
import ApiForm from './ApiForm';
import StatusUpdates from './StatusUpdates';
import moment from 'moment-timezone';
import { serverUrl, mainServerUrl } from '../../config.js'

const Initiate = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [schoolData, setSchoolData] = useState({});
    const [eventSource, setEventSource] = useState(null);
    const [finalTables, setFinalTables] = useState(null);
    const [subjects, setSubjects] = useState(null);
    const [databaseID, setDatabaseID] = useState(null);
    const [status, setStatus] = useState('secondary');
    const [message, setMessage] = useState('')
    const [step3Status, setStep3Status] = useState(false);
    const [step4Status, setStep4Status] = useState(false);

    const handleNext = (data) => {
        setSchoolData(data);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = (apiData) => {
        const finalData = { ...schoolData, ...apiData };
        try {
            setStep3Status(true)

            // Send data to server
            fetch(`http://localhost:3008/initiate/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalData)
            })
                .then(response => {
                    if (response.ok) {
                        setStep(3); // Move to status update step
                        const es = new EventSource(`${serverUrl}/initiate/status-updates`);
                        setEventSource(es);
                    } else {
                        return response.json().then(data => {
                            throw new Error(data.message);
                        });
                    }


                    setMessage('Ensure to restart the server before proceeding to the next step.');
                })
                .catch((error) => {
                    console.error('Error:', error);
                    setStep3Status(false)
                });
        } catch (error) {
            console.error('An Error occured: ', error);
            setMessage('An Error occured at submission');
            setStep3Status(false)
        }
    };

    const handleEventSourceClose = () => {
        if (eventSource) {
            eventSource.close();
        }
        console.log('EventSource closed');
    };

    const handleNextStep = (tables, databaseID, subjects) => {
        setFinalTables(tables);
        setDatabaseID(databaseID);
        setSubjects(subjects);
        setStep(4);
    };

    const handleCreateAdditionalTables = async () => {
        try {
            setStep4Status(true);
            setMessage('Creating Additional Tables.');

            let schooltableId;
            let classTableId;
            let subjectTableId;

            console.log('Final tables: ', finalTables);

            // Assign IDs for the tables
            finalTables.forEach(item => {
                if (item.tableName === "school") {
                    schooltableId = item.tableId;
                } else if (item.tableName === "classes") {
                    classTableId = item.tableId;
                } else if (item.tableName === "subjects") {
                    subjectTableId = item.tableId;
                }
            });

            // Prepare the school data to be saved
            const schoolDataToSave = {
                name: schoolData.schoolName,
                educationLevel: schoolData.educationLevel.toLowerCase(),
                address: schoolData.address,
                phone: schoolData.phone,
                phone2: schoolData.phone2 || null,
                email: schoolData.email,
                email2: schoolData.email2 || null,
                classes: schoolData.classes,
                subjects: [] // This seems to be an empty array initially
            };

            console.log('Saving school data to CROWNZCOM system:', schoolDataToSave);

            // Save school data to CROWNZCOM system
            let schoolID;
            try {
                const response = await fetch(`${mainServerUrl}/school/info/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(schoolDataToSave)
                });

                const data = await response.json();
                console.log('Data after adding school to main server:', data);

                if (data.success && data.schoolID) {
                    schoolID = data.schoolID;
                }

                setStatus('success');
                setMessage('Added school successfully to CROWNZCOM System.');
                console.log('Added school successfully:', data);

                navigate('/create-admin')
            } catch (error) {
                setStatus('danger');
                setMessage('Failed to add school to CROWNZCOM system');
                console.error('Failed to add school to CROWNZCOM system:', error);
                return;
            }

            console.log('Saving school info to school system with school ID:', schoolID);

            // Create school info for saving in the school system by removing 'classes' and 'subjects'
            const { classes, subjects, ...schoolInfo } = {
                ...schoolDataToSave,
                schoolID,
                creationDate: moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss.SSSZ')
            };

            console.log('School information:', schoolInfo);

            // Transform class info
            const classInfo = classes.map(obj => ({
                ...obj,
                classID: obj.class,
                class: undefined // Remove the original 'class' key
            }));

            console.log('Class information:', classInfo);

            // Transform subject info
            const subjectInfo = subjects.map(obj => ({
                subjectName: obj.tableName,
                examTableId: obj.tableId
            }));

            console.log('Subject information:', subjectInfo);

            const tables = [
                {
                    databaseId: databaseID,
                    collectionId: schooltableId,
                    documents: [schoolInfo] // Wrap schoolInfo in an array
                },
                {
                    databaseId: databaseID,
                    collectionId: classTableId,
                    documents: classInfo
                },
                {
                    databaseId: databaseID,
                    collectionId: subjectTableId,
                    documents: subjectInfo
                }
            ];

            console.log('School Table ID:', schooltableId);
            console.log('Class Table ID:', classTableId);
            console.log('Subject Table ID:', subjectTableId);

            // Send data to create additional tables
            try {
                const response = await fetch(`${serverUrl}/appwrite/insert-docs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tables)
                });

                const data = await response.json();
                console.log('Additional tables created:', data);
            } catch (error) {
                console.error('Error creating additional tables:', error);
            }
        } catch (error) {
            setStatus('danger');
            console.error('Error occurred while creating additional tables:', error);
            setMessage('Error occurred while creating additional tables');
        } finally {
            setStep4Status(false);
        }
    };


    return (
        <Container>
            <div hidden={step !== 1}>
                <SchoolForm onNext={handleNext} initialData={schoolData} />
            </div>
            <div hidden={step !== 2}>
                <ApiForm onBack={handleBack} onSubmit={handleSubmit} />
            </div>
            <div hidden={step !== 3}>
                <StatusUpdates eventSource={eventSource} onClose={handleEventSourceClose} onNextStep={handleNextStep} disabled={step3Status} />
                <Button variant="secondary" onClick={() => setStep(1)}>Back to Forms</Button>
            </div>
            <div hidden={step !== 4}>
                <Button variant="primary" onClick={handleCreateAdditionalTables} disabled={step4Status}>
                    {!step4Status ? 'Create Additional Tables' :
                        <div className="d-flex justify-content-center mb-3">
                            <Spinner animation="border" variant="primary" className="mr-2" />
                            <Spinner animation="border" variant="secondary" className="mr-2" />
                            <Spinner animation="border" variant="success" />
                        </div>
                    }
                </Button>
            </div>
            <br />
            <Alert variant={status}>
                <b>{message}</b>
            </Alert>
        </Container>
    );
};

export default Initiate;
