//  AnswerContainer.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ButtonGroup, } from 'react-bootstrap';
import { useAuth } from "../../context/AuthContext";
import AnswerContainer from './AnswerContainer';

const Answers = () => {

    const location = useLocation();
    const { userInfo } = useAuth();
    // const userInfo = storageUtil.getItem("userInfo");
    const isStudent = userInfo.labels.includes("student");
    const isAdmin = userInfo.labels.includes("admin");
    const isNextOfKin = userInfo.labels.includes("kin");
    const navigate = useNavigate();
    const { questionsData, subjectName, totalMarks, attemptDate, totalPossibleMarks } = location.state || { questionsData: [], subjectName: '', totalMarks: 0, totalPossibleMarks: null, attemptDate: '' };

    // console.log(`subjectName: ${subjectName}\ntotalMarks: ${totalMarks}\ntotalPossibleMarks: ${totalPossibleMarks}\nattemptDate: ${attemptDate}`);

    return (
        <Container fluid style={{}}>
            <AnswerContainer questionsData={questionsData} subjectName={subjectName} totalMarks={totalMarks} attemptDate={attemptDate} totalPossibleMarks={totalPossibleMarks} />
            <Row >
                <Col xs={12} className="" style={{ marginBottom: '1.8rem' }}>
                    <div className="d-flex justify-content-center">
                        {
                            isStudent ?
                                <ButtonGroup className="w-75">
                                    <Button
                                        variant="success"
                                        onClick={() => { navigate('/exam-page') }}
                                    >
                                        Attempt another Exam
                                    </Button>
                                    <Button
                                        variant="info"
                                        onClick={() => { navigate('/') }}
                                    >
                                        Back to Dashboard
                                    </Button>
                                </ButtonGroup>
                                :
                                <ButtonGroup className="w-75">
                                    <Button
                                        variant="success"
                                        onClick={() => { navigate(-1) }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="info"
                                        onClick={() => { navigate('/') }}
                                    >
                                        Dashboard
                                    </Button>
                                </ButtonGroup>
                        }
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Answers;
