// SaveButton.js
import React, { useState, useEffect, forwardRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { resetAnswers } from "./redux/actions";
import { Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../utilities/resultsUtil";
import { updateResultsData } from "../../utilities/fetchStudentData";
import { useAuth } from "../../context/AuthContext";
import { serverUrl } from "../../config.js";

const SaveButton = forwardRef(
  (
    {
      selectedQuestions,
      onSubmit,
      disabled,
      buttonDisplay,
      subject_Name,
      examID,
    },
    ref
  ) => {
    const [modifiedSelectedQuestions, setModifiedSelectedQuestions] =
      useState(selectedQuestions);

    // Assigning IDs to the subquestions of the selected questions
    useEffect(() => {
      const assignIds = async () => {
        await assignSubQuestionIds(selectedQuestions);
        setModifiedSelectedQuestions(selectedQuestions);
      };

      assignIds();
    }, [selectedQuestions]);

    const dispatch = useDispatch();
    const { userInfo } = useAuth();
    let studentID = userInfo.userID;

    let subjectName;
    if (subject_Name) {
      subjectName =
        subject_Name === "social_studies"
          ? "Social Studies"
          : subject_Name === "mathematics"
          ? "Mathematics"
          : subject_Name === "science"
          ? "Science"
          : "English Language";
    } else {
      subjectName = subject_Name;
    }

    const navigate = useNavigate();

    const results = useSelector((state) => state.answers);
    // console.log('redux results: ', results);

    const transformAndRemoveDuplicates = (answers) => {
      const transformedAnswers = answers.map((answer) => {
        // Transform user_answer to array if it's an object
        if (
          typeof answer.user_answer === "object" &&
          !Array.isArray(answer.user_answer)
        ) {
          answer.user_answer = Object.keys(answer.user_answer);
        } else if (typeof answer.user_answer === "string") {
          // Ensure the user_answer is in array format
          answer.user_answer = [answer.user_answer];
        }
        return answer;
      });

      // Create a map to keep only the last occurrence of each ID
      const answerMap = new Map();
      transformedAnswers.forEach((answer) => {
        answerMap.set(answer.id, answer);
      });

      // Convert the map back to an array
      const uniqueAnswers = Array.from(answerMap.values());

      return uniqueAnswers;
    };

    const reduxState = transformAndRemoveDuplicates(results);
    // console.log('transformed results:', results)

    const assignSubQuestionIds = async (questions) => {
      questions.forEach((question) => {
        if (question.questions) {
          question.questions.forEach((mainQuestion) => {
            if (
              mainQuestion.sub_questions &&
              !mainQuestion.either &&
              !mainQuestion.or
            ) {
              mainQuestion.sub_questions.forEach((subQuestion, subIndex) => {
                if (!subQuestion.id) {
                  subQuestion.id = `${mainQuestion.id}_sub_${subIndex}`;
                }
              });
            }
          });
        }
      });
    };

    const submitExamResults = async (data) => {
      try {
        const response = await fetch(`${serverUrl}/exam/submit-exam`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error submitting exam results:", error);
        throw error;
      }
    };

    const calculateMarks = (question, userAnswer) => {
      const { type, answer, mark, sub_questions } = question;
      const correctAnswer = Array.isArray(answer) ? answer : [answer];

      const normalizeGeneral = (value) => {
        if (typeof value === "string") {
          return value.trim().toLowerCase();
        } else if (typeof value === "object") {
          return JSON.stringify(value).toLowerCase();
        } else if (Array.isArray(value)) {
          return value.map((val) => normalizeGeneral(val));
        }
        return value;
      };

      const normalizeText = (value) =>
        value
          .replace(/[\s\.,\-_!@#$%^&*()=+{}[\]\\;:'"<>/?|`~]+/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

      let score = 0;
      let maxScore = 0;

      switch (type) {
        case "multipleChoice":
          maxScore = mark || 1;
          if (
            userAnswer &&
            correctAnswer
              .map(normalizeGeneral)
              .includes(normalizeGeneral(userAnswer))
          ) {
            score = mark || 1;
          }
          break;
        case "text":
          maxScore = mark || 1;
          if (
            userAnswer &&
            correctAnswer.map(normalizeText).includes(normalizeText(userAnswer))
          ) {
            score = mark || 1;
          }
          break;
        case "check_box":
          maxScore = mark || correctAnswer.length;
          if (userAnswer && userAnswer.length <= maxScore) {
            userAnswer.forEach((userOption) => {
              if (
                correctAnswer
                  .map(normalizeGeneral)
                  .includes(normalizeGeneral(userOption))
              ) {
                score += 1;
              }
            });
          }
          break;
        case "dragAndDrop":
          maxScore = mark || 1;
          if (
            Array.isArray(userAnswer) &&
            Array.isArray(correctAnswer) &&
            userAnswer.length === correctAnswer.length
          ) {
            let isCorrect = true;
            for (let i = 0; i < correctAnswer.length; i++) {
              if (
                normalizeGeneral(userAnswer[i]) !==
                normalizeGeneral(correctAnswer[i])
              ) {
                isCorrect = false;
                break;
              }
            }
            if (isCorrect) {
              score = mark || 1;
            }
          }
          break;
        default:
          break;
      }

      if (sub_questions) {
        sub_questions.forEach((subQ) => {
          const subResult = calculateMarks(subQ, subQ.user_answer);
          score += subResult.score;
          maxScore += subResult.maxScore;
        });
      }

      return { score, maxScore };
    };

    const findUserAnswer = (questionId, categoryId, questionType) => {
      const reduxAnswers = reduxState.filter(
        (answer) => answer.id === questionId && answer.category === categoryId
      );
      if (reduxAnswers.length === 0) return null;

      switch (questionType) {
        case "multipleChoice":
        case "text":
          return reduxAnswers[reduxAnswers.length - 1].user_answer[0];
        case "check_box":
        case "dragAndDrop":
          return reduxAnswers[reduxAnswers.length - 1].user_answer;
        default:
          return null;
      }
    };

    const appendUserAnswersToSubQuestions = (subQuestions, categoryId) => {
      return subQuestions.map((subQ) => ({
        ...subQ,
        user_answer: findUserAnswer(subQ.id, categoryId, subQ.type),
      }));
    };

    const formatAnswersForEitherOrQuestion = (questionPart, categoryId) => {
      return {
        ...questionPart,
        user_answer: findUserAnswer(
          questionPart.id,
          categoryId,
          questionPart.type
        ),
        sub_questions: questionPart.sub_questions
          ? appendUserAnswersToSubQuestions(
              questionPart.sub_questions,
              categoryId
            )
          : [],
      };
    };

    const formatAnswersForSaving = () => {
      let totalMarks = 0;
      let totalPossibleMarks = 0;

      const formattedAnswers = modifiedSelectedQuestions.map((category) => ({
        ...category,
        questions: category.questions
          .flatMap((question) => {
            if (question.either && question.or) {
              const updatedEither = formatAnswersForEitherOrQuestion(
                question.either,
                category.category
              );
              const updatedOr = formatAnswersForEitherOrQuestion(
                question.or,
                category.category
              );

              const partsToInclude = [];
              if (updatedEither.user_answer !== null) {
                const eitherResult = calculateMarks(
                  updatedEither,
                  updatedEither.user_answer
                );
                partsToInclude.push(updatedEither);
                totalMarks += eitherResult.score;
                totalPossibleMarks += eitherResult.maxScore;
              }
              if (updatedOr.user_answer !== null) {
                const orResult = calculateMarks(
                  updatedOr,
                  updatedOr.user_answer
                );
                partsToInclude.push(updatedOr);
                totalMarks += orResult.score;
                totalPossibleMarks += orResult.maxScore;
              }
              return partsToInclude;
            } else {
              const updatedQuestion = {
                ...question,
                user_answer: findUserAnswer(
                  question.id,
                  category.category,
                  question.type
                ),
                sub_questions: question.sub_questions
                  ? appendUserAnswersToSubQuestions(
                      question.sub_questions,
                      category.category
                    )
                  : [],
              };
              const result = calculateMarks(
                updatedQuestion,
                updatedQuestion.user_answer
              );
              totalMarks += result.score;
              totalPossibleMarks += result.maxScore;
              return [updatedQuestion];
            }
          })
          .flat(),
      }));

      return { formattedAnswers, totalMarks, totalPossibleMarks };
    };

    const handleSave = async () => {
      let { formattedAnswers, totalMarks, totalPossibleMarks } =
        formatAnswersForSaving();

      onSubmit();

      const resultsString = JSON.stringify(formattedAnswers);

      const userResultsData = {
        examID: examID,
        studID: studentID,
        marks: totalMarks,
        subjectName: subjectName,
        results: resultsString,
        finalPossibleMarks: totalPossibleMarks,
        dateTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
      };

      try {
        await submitExamResults(userResultsData);
      } catch (e) {
        console.error("Error saving ANSWERS to cloud db");
      }

      await updateResultsData(studentID);

      const questionsData = formattedAnswers;

      dispatch(resetAnswers());

      let attemptDate = formatDate(new Date());

      if (totalMarks === 0) {
        totalMarks = "0";
      }
      navigate("/answers", {
        state: {
          questionsData,
          subjectName,
          totalMarks,
          totalPossibleMarks,
          attemptDate,
        },
      });
    };

    return (
      <>
        {!disabled ? (
          <Button
            ref={ref}
            onClick={handleSave}
            disabled={disabled}
            variant="primary"
            style={{ display: buttonDisplay ? buttonDisplay : "false" }}
          >
            <FontAwesomeIcon icon={faSave} /> Submit Exam
          </Button>
        ) : (
          <>
            <Spinner animation="grow" variant="primary" />
            <Spinner animation="grow" variant="secondary" />
            <Spinner animation="grow" variant="success" />
          </>
        )}
      </>
    );
  }
);

export default SaveButton;
