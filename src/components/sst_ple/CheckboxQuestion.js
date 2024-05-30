import React, { useState, useEffect } from 'react';
import { Form, Card } from 'react-bootstrap';
import { isImageUrl } from './utils';

const CheckboxQuestion = ({ question, onChange, disabled, userAnswer, displayQuestionText }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        if (userAnswer) {
            setSelectedOptions(userAnswer);
        }
    }, [userAnswer]);

    const handleOptionChange = (option) => {
        const updatedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter(opt => opt !== option)
            : [...selectedOptions, option];
        setSelectedOptions(updatedOptions);
        onChange(updatedOptions);
    };

    const renderOptionLabel = (option) => {
        return isImageUrl(option) ? (
            <Card>
                <Card.Img variant="top" src={option} style={{ width: '300px', height: 'auto', margin: 'auto' }} />
            </Card>
        ) : (
            <>
                <div dangerouslySetInnerHTML={{ __html: option }}></div >
            </>
        );
    };

    return (
        <Form.Group>
            {displayQuestionText && <Form.Label dangerouslySetInnerHTML={{ __html: question.question }} />}
            {question.options && question.options.map((option, index) => (
                <Form.Check
                    type="checkbox"
                    label={renderOptionLabel(option)}
                    onChange={() => handleOptionChange(option)}
                    checked={selectedOptions.includes(option)}
                    disabled={disabled}
                    key={`${question.id}-${index}`}
                    id={`${question.id}-option-${index}`}
                />
            ))}
        </Form.Group>
    );
};

export default CheckboxQuestion;
