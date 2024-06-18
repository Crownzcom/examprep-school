import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import SchoolForm from './SchoolForm';
import ApiForm from './ApiForm';
import StatusUpdates from './StatusUpdates';
import moment from 'moment';

const Initiate = () => {
    const [step, setStep] = useState(1);
    const [schoolData, setSchoolData] = useState({});
    const [eventSource, setEventSource] = useState(null);
    const [finalTables, setFinalTables] = useState(null);
    const [databaseID, setDatabaseID] = useState(null);

    const handleNext = (data) => {
        setSchoolData(data);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = (apiData) => {
        const finalData = { ...schoolData, ...apiData };

        // Send data to server
        console.log(finalData);

        fetch('http://localhost:3001/initiate/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalData)
        })
            .then(response => {
                if (response.ok) {
                    setStep(3); // Move to status update step
                    const es = new EventSource('http://localhost:3001/initiate/status-updates');
                    setEventSource(es);
                } else {
                    return response.json().then(data => {
                        throw new Error(data.message);
                    });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const handleEventSourceClose = () => {
        if (eventSource) {
            eventSource.close();
        }
        console.log('EventSource closed');
    };

    const handleNextStep = (tables, databaseID) => {
        setFinalTables(tables);
        setDatabaseID(databaseID);
        setStep(4);
    };

    const handleCreateAdditionalTables = () => {
        let schooltableId;
        let classTableId;

        finalTables.forEach(item => {
            if (item.tableName === "school") {
                schooltableId = item.tableId;
            } else if (item.tableName === "classes") {
                classTableId = item.tableId;
            }
        });

        const schoolInfo = [{
            "schoolName": schoolData.schoolName,
            "educationLevel": schoolData.educationLevel,
            "address": schoolData.address,
            "phone": schoolData.phone,
            "accountCreationDate": moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss.SSSZ')
        }];

        const classInfo = schoolData.classes;

        const tables = [
            {
                "databaseId": databaseID,
                "collectionId": schooltableId, // Correcting the key name to `collectionId`
                "documents": schoolInfo
            },
            {
                "databaseId": databaseID,
                "collectionId": classTableId, // Correcting the key name to `collectionId`
                "documents": classInfo
            }
        ];

        console.log("School Table ID:", schooltableId);
        console.log("Class Table ID:", classTableId);

        fetch('http://localhost:3001/api/insert-docs', { // Adjusted the URL to match the API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tables)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Additional tables created:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
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
                <StatusUpdates eventSource={eventSource} onClose={handleEventSourceClose} onNextStep={handleNextStep} />
                <Button variant="secondary" onClick={() => setStep(1)}>Back to Forms</Button>
            </div>
            <div hidden={step !== 4}>
                <Button variant="primary" onClick={handleCreateAdditionalTables}>
                    Create Additional Tables
                </Button>
            </div>
        </Container>
    );
};

export default Initiate;
