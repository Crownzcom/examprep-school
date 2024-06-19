import React, { useState, useEffect } from 'react';
import { ListGroup, Spinner, Fade, Alert, Button } from 'react-bootstrap';

const StatusUpdates = ({ eventSource, onClose, onNextStep }) => {
    const [updates, setUpdates] = useState([]);
    const [finalTables, setFinalTables] = useState(null);
    const [subjects, setSubjects] = useState(null);
    const [databaseID, setDatabaseID] = useState(null);

    useEffect(() => {
        if (eventSource) {
            eventSource.onmessage = (event) => {
                const newUpdate = JSON.parse(event.data);
                setUpdates((prevUpdates) => [...prevUpdates, newUpdate]);

                // Check if this is the final status update with tables data
                if (newUpdate.tables) {
                    setFinalTables(newUpdate.tables);
                    setDatabaseID(newUpdate.databaseID);
                    setSubjects(newUpdate.subjectExamTables);
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                onClose();
            };

            return () => {
                eventSource.close();
            };
        }
    }, [eventSource, onClose]);

    return (
        <div>
            {updates.length === 0 && (
                <div className="d-flex justify-content-center mb-3">
                    <Spinner animation="border" variant="primary" className="mr-2" />
                    <Spinner animation="border" variant="secondary" className="mr-2" />
                    <Spinner animation="border" variant="success" />
                </div>
            )}
            <ListGroup>
                {updates.map((update, index) => (
                    <Fade in={true} key={index}>
                        <ListGroup.Item>
                            <Alert variant={update.status ? "info" : "danger"}>
                                {update.status || update.message}
                            </Alert>
                        </ListGroup.Item>
                    </Fade>
                ))}
            </ListGroup>
            {finalTables && (
                <div className="mt-3">
                    <Button variant="primary" onClick={() => onNextStep(finalTables, databaseID, subjects)}>
                        Proceed to Next Step
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StatusUpdates;
