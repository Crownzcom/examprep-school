// actions.js

export const setUserAnswer = (questionId, answer, categoryId, isEitherOr) => {
    return {
        type: 'SET_USER_ANSWER',
        payload: { questionId, answer, categoryId, isEitherOr }
    };
};

export const setSelectedOption = (questionId, selectedOption, categoryId, isEitherOr) => {
    return {
        type: 'SET_SELECTED_OPTION',
        payload: { questionId, selectedOption, categoryId, isEitherOr }
    };
};
