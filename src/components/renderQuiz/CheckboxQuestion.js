// CheckboxQuestion.js
import React, { useState, useEffect } from 'react';
import { Form, Card } from 'react-bootstrap';
import { isImageUrl } from './utils';
import './CheckboxQuestion.css';

const CheckboxQuestion = ({ question, onChange, disabled, userAnswer, displayQuestionText, questionNumber }) => {
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
                <Card.Img variant="top" src={option} style={{ maxWidth: '25rem', maxHeight: '15em', margin: 'auto' }} />
            </Card>
        ) : (
            <>
                <div dangerouslySetInnerHTML={{ __html: option }}></div >
            </>
        );
    };

    return (
        <Form.Group>
            {displayQuestionText &&
                <Form.Label>
                    {questionNumber}. <span dangerouslySetInnerHTML={{ __html: question.question }} />
                </Form.Label>
            }
            {question.options && question.options.map((option, index) => (
                <Form.Check
                    className="custom-checkbox" //Giving the button a standout design
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
