// reducers.js

const initialState = {
    answers: []
};

const quizReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'RESET_ANSWERS':
            return {
                ...state,
                answers: {} // Reset the answers
            };
        case 'SET_USER_ANSWER':
            const { categoryId, questionId, answer, isEitherOr, questionType } = action.payload;
            const answerIndex = state.answers.findIndex(ans =>
                ans.categoryId === categoryId && ans.questionId === questionId
            );

            let newAnswers = [...state.answers];
            if (answerIndex !== -1) {
                // Update existing answer
                if (questionType === 'check_box') {
                    // If the question type is checkbox, merge the existing and new answers
                    newAnswers[answerIndex] = {
                        ...newAnswers[answerIndex],
                        user_answer: { ...newAnswers[answerIndex].user_answer, ...answer },
                        type: questionType
                    };
                } else if (questionType === 'dragAndDrop') {
                    newAnswers[answerIndex] = {
                        ...newAnswers[answerIndex],
                        user_answer: answer, // Store as an array
                        type: questionType
                    };
                } else {
                    newAnswers[answerIndex] = { ...newAnswers[answerIndex], user_answer: answer, type: questionType };
                }
            } else {
                // Add new answer
                newAnswers.push({
                    id: questionId,
                    user_answer: answer,
                    isEitherOr: !!isEitherOr, // Convert to boolean
                    category: categoryId,
                    type: questionType // Store question type
                });
            }

            return {
                ...state,
                answers: newAnswers
            };

        //TODO: Handle SET_SELECTED_OPTION if needed

        default:
            return state;
    }
};

export default quizReducer;
