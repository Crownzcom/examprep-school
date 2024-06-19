import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import SchoolForm from './SchoolForm';
import ApiForm from './ApiForm';
import StatusUpdates from './StatusUpdates';
// import moment from 'moment';
import moment from 'moment-timezone';

const Initiate = () => {
    const [step, setStep] = useState(1);
    const [schoolData, setSchoolData] = useState({});
    const [eventSource, setEventSource] = useState(null);
    const [finalTables, setFinalTables] = useState(null);
    const [subjects, setSubjects] = useState(null);
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

    const handleNextStep = (tables, databaseID, subjects) => {
        setFinalTables(tables);
        setDatabaseID(databaseID);
        setSubjects(subjects);
        setStep(4);
    };

    const handleCreateAdditionalTables = () => {
        let schooltableId;
        let classTableId;
        let subjectTableId;

        console.log('Final tables: ', finalTables)

        //Assigning IDs
        finalTables.forEach(item => {
            if (item.tableName === "school") {
                schooltableId = item.tableId;
            } else if (item.tableName === "classes") {
                classTableId = item.tableId;
            }
            else if (item.tableName === "subjects") {
                subjectTableId = item.tableId;
            }
        });

        //SCHOOL INFO
        const schoolInfo = [
            {
                "schoolName": schoolData.schoolName,
                "educationLevel": schoolData.educationLevel.toLowerCase(),
                "address": schoolData.address,
                "phone": schoolData.phone,
                "email": schoolData.email,
                "accountCreationDate": moment().tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss.SSSZ')
            },
        ];

        //CLASS INFO
        const classInfo = schoolData.classes;
        // Iterate over each object in the classes array and rename `class` key to `classID`
        classInfo.forEach(obj => {
            obj.classID = obj.class;
            delete obj.class;
        });
        console.log("classInfo", classInfo)

        //SUBJECT INFO
        const subjectinfo = subjects
        // Iterate over each object in the subjects array and rename `tableName` key to `subjectName`, and `tableId` key to `examTableId`
        subjectinfo.forEach(obj => {
            obj.subjectName = obj.tableName;
            delete obj.tableName;

            obj.examTableId = obj.tableId;
            delete obj.tableId;
        })
        console.log('subjectInfo', subjectinfo);

        const tables = [
            {
                "databaseId": databaseID,
                "collectionId": schooltableId,
                "documents": schoolInfo
            },
            {
                "databaseId": databaseID,
                "collectionId": classTableId,
                "documents": classInfo
            },
            {
                "databaseId": databaseID,
                "collectionId": subjectTableId,
                "documents": subjectinfo
            }
        ];

        console.log("School Table ID:", schooltableId);
        console.log("Class Table ID:", classTableId);

        fetch('http://localhost:3001/appwrite/insert-docs', { // Adjusted the URL to match the API endpoint
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
