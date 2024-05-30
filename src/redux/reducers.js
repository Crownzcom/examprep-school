// reducers.js

const initialState = {
    answers: []
};

const quizReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER_ANSWER':
            const { categoryId, questionId, answer, isEitherOr } = action.payload;
            const answerIndex = state.answers.findIndex(ans =>
                ans.categoryId === categoryId && ans.questionId === questionId
            );

            let newAnswers = [...state.answers];
            if (answerIndex !== -1) {
                // Update existing answer
                newAnswers[answerIndex] = { ...newAnswers[answerIndex], user_answer: answer };
            } else {
                // Add new answer
                newAnswers.push({
                    id: questionId,
                    user_answer: answer,
                    isEitherOr: !!isEitherOr, // Convert to boolean
                    category: categoryId
                });
            }

            return {
                ...state,
                answers: newAnswers
            };

        // Handle SET_SELECTED_OPTION if needed

        default:
            return state;
    }
};

export default quizReducer;
