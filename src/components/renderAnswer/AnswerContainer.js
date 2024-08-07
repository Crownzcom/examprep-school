import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Alert } from 'react-bootstrap';
import AnswerCard from './AnswerCard';

const AnswerContainer = ({ questionsData, subjectName, totalMarks, totalPossibleMarks, attemptDate }) => {
    let subject_Name = subjectName;

    const [percentageScore, setPercentageScore] = useState('');

    // console.log(`Total Score: ${totalMarks}, Possible Score: ${totalPossibleMarks}`);

    useEffect(() => {
        const calculatePercentageScore = async () => {
            let totalScore = parseFloat(totalMarks);
            let totalPossibleScore = parseFloat(totalPossibleMarks);

            if (isNaN(totalScore)) {
                // console.log('Invalid score values');
                return null;
            }

            if (totalPossibleScore === 0 || isNaN(totalPossibleScore)) {
                // console.log('Total possible score is 0, cannot calculate percentage');
                return totalScore;
            }

            let percentage = (totalScore / totalPossibleScore) * 100;
            let roundedPercentage = Math.round(percentage * 10) / 10;
            // console.log('Percentage calculated: ' + roundedPercentage + '%');
            return `${roundedPercentage} %`;
        };

        if (totalMarks !== null && totalMarks !== undefined && totalPossibleMarks !== null && totalPossibleMarks !== undefined) {
            calculatePercentageScore().then((result) => {
                setPercentageScore(result);
            });
        }
    }, [totalMarks, totalPossibleMarks]);

    return (
        <Container>
            <Card className="my-4">
                <Card.Header>Exam Results</Card.Header>
                <Card.Body>
                    <Card.Subtitle>
                        <ListGroup as="ol">
                            {subject_Name && (
                                <ListGroup.Item as="li">Subject: <span>{subject_Name}</span></ListGroup.Item>
                            )}
                            {percentageScore && (
                                <ListGroup.Item as="li">Score: <span>{percentageScore}</span></ListGroup.Item>
                            )}
                            {attemptDate && (
                                <ListGroup.Item as="li">Date of Exam Submission: <span>{attemptDate}</span></ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card.Subtitle>
                </Card.Body>
            </Card>
            {questionsData.map((category, index) => (
                <Card key={index} style={{ margin: "5px" }}>
                    <h3>{category.instructions}</h3>
                    {category.questions.length === 0 ? (
                        <Alert>No questions attempted</Alert>
                    ) : (
                        category.questions.map((question, questionIndex) => (
                            <React.Fragment key={questionIndex}>
                                <div>{category.category + questionIndex}</div>
                                <AnswerCard
                                    key={question.id || `${category.$id}_${questionIndex}`}
                                    category_Id={category.category}
                                    questionIndex={questionIndex}
                                    resultsData={question}
                                />
                            </React.Fragment>
                        ))
                    )}
                </Card>
            ))}
        </Container>
    );
};

export default AnswerContainer;
