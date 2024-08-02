import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import './SchoolForm.css';

const SchoolForm = ({ onNext, initialData }) => {
    const [educationLevel, setEducationLevel] = useState(initialData.educationLevel || '');
    const [classes, setClasses] = useState(initialData.classes || []);
    const [streams, setStreams] = useState(initialData.streams || ['']);

    useEffect(() => {
        if (initialData.classes) {
            setClasses(initialData.classes);
        }
        if (initialData.streams) {
            setStreams(initialData.streams);
        }
    }, [initialData.classes, initialData.streams]);

    const handleAddStream = () => {
        setStreams([...streams, '']);
    };

    const handleStreamChange = (index, value) => {
        const newStreams = [...streams];
        newStreams[index] = value;
        setStreams(newStreams);
    };

    const handleDeleteStream = (index) => {
        setStreams(streams.filter((_, i) => i !== index));
    };

    const handleClassSelection = (value) => {
        setClasses((prevClasses) =>
            prevClasses.some((cls) => cls.class === value)
                ? prevClasses.filter((cls) => cls.class !== value)
                : [...prevClasses, { class: value, streams: [] }]
        );
    };

    const handleClassStreamChange = (classValue, streamValue) => {
        setClasses((prevClasses) => {
            const updatedClasses = prevClasses.map((cls) => {
                if (cls.class === classValue) {
                    const updatedStreams = cls.streams.includes(streamValue)
                        ? cls.streams.filter((stream) => stream !== streamValue)
                        : [...cls.streams, streamValue];
                    return { ...cls, streams: updatedStreams };
                }
                return cls;
            });
            return updatedClasses;
        });
    };

    const handleEducationLevelChange = (value) => {
        setEducationLevel(value);
        setClasses([]);
        setStreams(['']);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.classes = classes;
        data.streams = streams;
        onNext(data);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="schoolName">
                <Form.Label>School Name</Form.Label>
                <Form.Control type="text" name="schoolName" defaultValue={initialData.schoolName} required />
            </Form.Group>

            <br />

            <Form.Group controlId="educationLevel">
                <Form.Label>Education Level</Form.Label>
                <Form.Control
                    as="select"
                    name="educationLevel"
                    value={educationLevel}
                    required
                    onChange={(e) => handleEducationLevelChange(e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                </Form.Control>
            </Form.Group>

            <br />

            <Form.Group controlId="address">
                <Form.Label>Address</Form.Label>
                <Form.Control type="text" name="address" defaultValue={initialData.address} required />
            </Form.Group>

            <br />

            <Form.Group controlId="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control type="text" name="phone" defaultValue={initialData.phone} required />
            </Form.Group>

            <Form.Group controlId="phone2">
                <Form.Label>Phone 2 (Optional)</Form.Label>
                <Form.Control type="text" name="phone2" defaultValue={initialData.phone2} />
            </Form.Group>

            <br />

            <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" defaultValue={initialData.email} required />
            </Form.Group>

            <Form.Group controlId="email2">
                <Form.Label>Email 2 (Optional)</Form.Label>
                <Form.Control type="email" name="email2" defaultValue={initialData.email2} />
            </Form.Group>

            <br />

            <Form.Group controlId="streams">
                <Form.Label>Streams</Form.Label>
                {streams.map((stream, index) => (
                    <Row key={index} className="mb-2">
                        <Col>
                            <Form.Control
                                type="text"
                                value={stream}
                                onChange={(e) => handleStreamChange(index, e.target.value)}
                                required
                            />
                        </Col>
                        <Col xs="auto">
                            <Button variant="danger" onClick={() => handleDeleteStream(index)}>
                                Delete
                            </Button>
                        </Col>
                    </Row>
                ))}
                <Button variant="link" onClick={handleAddStream}>
                    Add another stream
                </Button>
            </Form.Group>

            <br />

            {educationLevel === 'Primary' && (
                <Form.Group>
                    <Form.Label>Classes</Form.Label>
                    {[...Array(7).keys()].map((i) => (
                        <div key={i + 1}>
                            <Form.Check
                                type="checkbox"
                                label={`Primary ${i + 1}`}
                                name="classes"
                                value={`P${i + 1}`}
                                checked={classes.some((cls) => cls.class === `P${i + 1}`)}
                                onChange={(e) => handleClassSelection(e.target.value)}
                            />
                            {classes.some((cls) => cls.class === `P${i + 1}`) && (
                                <div className="ml-3">
                                    <Card>
                                        <Card.Header>Select Streams</Card.Header>
                                        <Card.Body>
                                            {streams.map((stream, index) => (
                                                <Form.Check
                                                    key={index}
                                                    type="checkbox"
                                                    label={stream}
                                                    value={stream}
                                                    checked={classes.find((cls) => cls.class === `P${i + 1}`).streams.includes(stream)}
                                                    onChange={(e) => handleClassStreamChange(`P${i + 1}`, e.target.value)}
                                                />

                                            ))}

                                        </Card.Body>
                                    </Card>
                                </div>
                            )}
                        </div>
                    ))}
                </Form.Group>
            )}

            {educationLevel === 'Secondary' && (
                <Form.Group>
                    <Form.Label>Classes</Form.Label>
                    {[...Array(6).keys()].map((i) => (
                        <div key={i + 1}>
                            <Form.Check
                                type="checkbox"
                                label={`Senior ${i + 1}`}
                                name="classes"
                                value={`S${i + 1}`}
                                checked={classes.some((cls) => cls.class === `S${i + 1}`)}
                                onChange={(e) => handleClassSelection(e.target.value)}
                            />
                            {classes.some((cls) => cls.class === `S${i + 1}`) && (
                                <div className="ml-3">
                                    {streams.map((stream, index) => (
                                        <Form.Check
                                            key={index}
                                            type="checkbox"
                                            label={stream}
                                            value={stream}
                                            checked={classes.find((cls) => cls.class === `S${i + 1}`).streams.includes(stream)}
                                            onChange={(e) => handleClassStreamChange(`S${i + 1}`, e.target.value)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </Form.Group>
            )}

            <Button variant="primary" type="submit">
                Next
            </Button>
        </Form>
    );
};

export default SchoolForm;
