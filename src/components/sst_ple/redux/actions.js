// actions.js

export const resetAnswers = () => {
    return {
        type: 'RESET_ANSWERS'
    };
};

export const setUserAnswer = (questionId, answer, categoryId, isEitherOr, questionType) => {
    let payload = { questionId, answer, categoryId, isEitherOr, questionType };

    // If the question type is checkbox, convert the answer to an object
    if (questionType === 'check_box') {
        payload.answer = answer.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
    }

    return {
        type: 'SET_USER_ANSWER',
        payload
    };
};

export const setSelectedOption = (questionId, selectedOption, categoryId, isEitherOr) => {
    return {
        type: 'SET_SELECTED_OPTION',
        payload: { questionId, selectedOption, categoryId, isEitherOr }
    };
};
