// utils.js
export const isEitherOrFormat = (question) => {
    return question.hasOwnProperty('either') && question.hasOwnProperty('or');
};

// utils.js
export const selectRandomQuestions = (questionsData, categoryIds, subjectName) => {
    console.log("Subject Name:", subjectName + "\nEnd");
    return categoryIds.map(categoryId => {
        const category = questionsData.find(cat => cat.category === categoryId);
        if (!category) {
            console.warn(`Category ${categoryId} not found`);
            return null;
        }

        let numQuestions = 1;
        if (subjectName === 'sst_ple') {
            if (categoryId === 36 || categoryId === 51) {
                numQuestions = 5;
            }
        }

        const shuffledQuestions = [...category.questions].sort(() => 0.5 - Math.random()).slice(0, numQuestions);

        const updatedQuestions = shuffledQuestions.map(question => {
            const updatedQuestion = { ...question };

            if (question.sub_questions) {
                updatedQuestion.sub_questions = question.sub_questions.map((subQ, index) => ({
                    ...subQ,
                    id: `${question.id}_sub_${index}`
                }));
            }

            // Handling 'either' and 'or' questions
            if (question.either && question.either.sub_questions) {
                updatedQuestion.either.sub_questions = question.either.sub_questions.map((subQ, index) => ({
                    ...subQ,
                    id: `${question.either.id}_sub_${index}`
                }));
            }

            if (question.or && question.or.sub_questions) {
                updatedQuestion.or.sub_questions = question.or.sub_questions.map((subQ, index) => ({
                    ...subQ,
                    id: `${question.or.id}_sub_${index}`
                }));
            }

            return updatedQuestion;
        });

        return { ...category, questions: updatedQuestions };
    }).filter(cat => cat !== null);
};


export const isImageUrl = (url) => {
    return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(url);
};
