import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from 'react-bootstrap';

const Timer = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            onTimeUp();
        }
    }, [timeLeft, onTimeUp]);

    const timePercentage = (timeLeft / initialTime) * 100;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
            <FontAwesomeIcon icon={faClock} size="2x" />
            <ProgressBar now={timePercentage} style={{ width: '50%' }} />
            <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
        </div>
    );
};

export default React.memo(Timer);
