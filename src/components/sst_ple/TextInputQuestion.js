// TextInputQuestion.js
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const TextInputQuestion = ({ question, onChange, disabled, userAnswer, displayQuestionText }) => {
    const [localUserAnswer, setLocalUserAnswer] = useState(userAnswer || '');

    useEffect(() => {
        setLocalUserAnswer(userAnswer || '');
    }, [userAnswer]);

    const handleBlur = () => {
        onChange(localUserAnswer);
    };

    const handleLocalChange = (e) => {
        setLocalUserAnswer(e.target.value);
    };

    return (
        <Form.Group>
            {displayQuestionText && <Form.Label dangerouslySetInnerHTML={{ __html: question.question }} />}
            <Form.Control
                type="text"
                value={localUserAnswer}
                onChange={handleLocalChange}
                onBlur={handleBlur}
                disabled={disabled}
            />
        </Form.Group>
    );
};

export default TextInputQuestion;