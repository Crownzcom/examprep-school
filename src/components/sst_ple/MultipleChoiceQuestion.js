// MultipleChoiceQuestion.js
import React, { useState, useEffect } from 'react';
import { Form, Card } from 'react-bootstrap';
import { isImageUrl } from './utils';

const MultipleChoiceQuestion = ({ question, onChange, disabled, userAnswer, displayQuestionText }) => {
    const options = question.options || [];
    const [localUserAnswer, setLocalUserAnswer] = useState(userAnswer || '');

    useEffect(() => {
        setLocalUserAnswer(userAnswer || '');
    }, [userAnswer]);

    const handleOptionChange = (e) => {
        setLocalUserAnswer(e.target.value);
    };

    const handleBlur = () => {
        onChange(localUserAnswer);
    };

    const renderOptionLabel = (option) => {
        return isImageUrl(option) ? (
            <Card>
                <Card.Img variant="top" src={option} style={{ width: '15rem', margin: 'auto' }} />
            </Card>
        ) : (
            <>
                <div dangerouslySetInnerHTML={{ __html: option.replace(/\n/g, '<br/>') }}></div >
            </>
        );
    };

    return (
        <Form.Group>
            {displayQuestionText && <Form.Label dangerouslySetInnerHTML={{ __html: question.question }} />}
            {options.map((option, index) => (
                <Form.Check
                    type="radio"
                    label={renderOptionLabel(option)}
                    name={question.id}
                    value={option}
                    onChange={handleOptionChange}
                    onBlur={handleBlur}
                    checked={localUserAnswer === option}
                    disabled={disabled}
                    key={`${question.id}-${index}`}
                    id={`${question.id}-option-${index}`}
                />
            ))}
        </Form.Group>
    );
};

export default MultipleChoiceQuestion;