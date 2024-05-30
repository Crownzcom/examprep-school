// TextInputQuestion.js
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './TextInputQuestion.module.css';

const TextInputQuestion = ({ question, onChange, disabled, userAnswer, displayQuestionText, questionNumber }) => {
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
            {displayQuestionText &&
                <Form.Label>
                    {questionNumber}. <span dangerouslySetInnerHTML={{ __html: question.question }} />
                </Form.Label>
            }
            <div className='bottomBorder'>
                <Form.Control
                    type="text"
                    value={localUserAnswer}
                    onChange={handleLocalChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                />
            </div>
        </Form.Group>
    );
};

export default TextInputQuestion;