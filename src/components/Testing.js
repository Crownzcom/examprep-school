import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import SchoolForm from './initiate/SchoolForm';
import ApiForm from './initiate/ApiForm';
// import StatusUpdates from './initiate/StatusUpdates';

const Testing = () => {
  const [step, setStep] = useState(1);
  const [schoolData, setSchoolData] = useState({});
  const [eventSource, setEventSource] = useState(null);

  const handleNext = (data) => {
    setSchoolData(data);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (apiData) => {
    let finalData = { ...schoolData, ...apiData };
    // Send data to server
    console.log(finalData);
    console.log('first class element: ', finalData.classes[0].class)

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
          finalData = null;
        } else {
          return response.json().then(data => {
            throw new Error(data.message);
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        finalData = null;
      });
  };

  const handleEventSourceClose = () => {
    if (eventSource) {
      eventSource.close();
    }
    console.log('EventSource closed');
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <Container>
      <div hidden={step !== 1}>
        <SchoolForm onNext={handleNext} initialData={schoolData} />
      </div>
      <div hidden={step !== 2}>
        <ApiForm onBack={handleBack} onSubmit={handleSubmit} />
      </div>
      <div hidden={step !== 3}>
        {/* <StatusUpdates eventSource={eventSource} onClose={handleEventSourceClose} /> */}
        <Button variant="secondary" onClick={() => setStep(1)}>Back to Forms</Button>
      </div>
    </Container>
  );
};

export default Testing;
