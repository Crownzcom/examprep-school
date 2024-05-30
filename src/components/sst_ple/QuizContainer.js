// QuizContainer.js
import React, { useState, useEffect } from 'react';
import SaveButton from './SaveButton';
import QuestionCard from './QuestionCard';
import { selectRandomQuestions } from './utils';

const QuizContainer = ({ questionsData, subjectName }) => {
    // console.log("QuizContainer Subject Name:", subjectName + "\nEnd");
    // Extract category IDs dynamically from questionsData
    const categoriesToInclude = questionsData.map(category => category.category);

    const [selectedQuestions, setSelectedQuestions] = useState([]);

    useEffect(() => {
        const randomQuestions = selectRandomQuestions(questionsData, categoriesToInclude, subjectName);
        randomQuestions.sort((a, b) => a.category - b.category);
        setSelectedQuestions(randomQuestions);
    }, []); // Empty dependency array to run only once

    // console.log("Selected Questions in Quiz Container:\n", selectedQuestions);

    return (
        <div>
            {selectedQuestions.map(category => (
                <div key={category.$id}>
                    <h2>Category {category.category}</h2>
                    <p>{category.instructions}</p>
                    {category.questions.map((question, index) => {
                        // Pass the question as is, with an additional property to indicate "either/or" type
                        const isEitherOr = question.hasOwnProperty('either') && question.hasOwnProperty('or');
                        return (
                            <QuestionCard
                                key={question.id || `${category.$id}_${index}`}
                                question={question}
                                isEitherOr={isEitherOr}
                                categoryId={category.category}
                            />
                        );
                    })}
                </div>
            ))}

            <SaveButton selectedQuestions={selectedQuestions} />
        </div>
    );
};

export default QuizContainer;