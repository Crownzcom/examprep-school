// utils.js
import {
    databases,
    database_id,
    updatedAttemptedQtnsTable_id,
    Query,
} from "../../appwriteConfig.js"; //Data from appwrite database
import {
    databasesQ,
    database_idQ,
    sstTablePLE_id,
    mathPLE_id,
    engTbalePLE_id,
    sciTablePLE_id,
    QueryQ,
} from "./examsAppwriteConfig"; //Data from appwrite database
import { serverUrl } from '../../config.js';
import db from '../../db';  // Import your Dexie database

/**
 * Retrieve a random exam for a given subject from the database
 * @param {string} subjectName - The name of the subject
 * @returns {Promise<object | string>} - The exam data or a message if not found
 */

// export const getRandomExamBySubject = async (subjectName) => {
//     try {
//         // Query the 'exams' table for exams with the specified subject name
//         const exams = await db.exams.where({ subjectName }).toArray();

//         if (exams.length === 0) {
//             // If no exams are found, return a message
//             return 'Exam data does not exist yet for this subject';
//         }

//         // Randomly select one exam from the list
//         const randomIndex = Math.floor(Math.random() * exams.length);
//         const randomExam = exams[randomIndex];

//         // Delete the exam from the database
//         await db.exams.delete(randomExam.id);

//         return randomExam;  // Return the deleted exam's data

//     } catch (error) {
//         console.error('Error retrieving or deleting exam:', error);
//         throw new Error('Error retrieving or deleting exam data');  // Handle errors appropriately
//     }
// };

export const getRandomExamBySubject = async (subjectName, userInfo) => {
    try {
        // Query the 'exams' table for exams with the specified subject name
        const exams = await db.exams.where({ subjectName }).toArray();

        if (exams.length === 0) {
            // If no exams are found, send a message to the service worker to fetch new exams
            try {
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    registration.active.postMessage({
                        type: 'FETCH_EXAMS',  // Custom event for the service worker
                        subjects: [subjectName],  // Array of subjects to fetch
                        userId: userInfo.userId,  // ID of the logged-in user
                        educationLevel: userInfo.educationLevel,  // User's education level
                    });
                }
            } catch (error) {
                console.error('Error sending message to service worker:', error);
            }

            // Polling mechanism to check if the exam data has been added
            const startTime = Date.now();
            const timeout = 15000;  // 15 seconds timeout

            while (Date.now() - startTime < timeout) {
                const newExams = await db.exams.where({ subjectName }).toArray();
                if (newExams.length > 0) {
                    // If new exam data is found, return it
                    const randomIndex = Math.floor(Math.random() * newExams.length);
                    return newExams[randomIndex];
                }
                // Wait a bit before checking again
                await new Promise((resolve) => setTimeout(resolve, 500));  // 500ms delay
            }

            // If no exam data is found after the timeout, return a message
            return 'Exam data does not exist yet for this subject';
        }

        // Randomly select one exam from the list
        const randomIndex = Math.floor(Math.random() * exams.length);
        const randomExam = exams[randomIndex];

        // Delete the retrieved exam from the database
        await db.exams.delete(randomExam.id);

        return randomExam;  // Return the randomly selected exam

    } catch (error) {
        console.error('Error retrieving or deleting exam:', error);
        throw new Error('Error retrieving or deleting exam data');  // Handle errors appropriately
    }
};

/**
 * Fetch Questions for a particular subject
 * @param {*} subject
 * @returns 
 */
export const fetchQuestionsForSubject = async (subject) => {
    try {
        let collection_id;
        switch (subject) {
            case "social-studies_ple":
                collection_id = sstTablePLE_id;
                break;
            case "mathematics_ple":
                collection_id = mathPLE_id;
                break;
            case "english-language_ple":
                collection_id = engTbalePLE_id;
                break;
            case "science_ple":
                collection_id = sciTablePLE_id;
                break;
            default:
                // collection_id = null;
                return;
        }

        const response = await databasesQ.listDocuments(
            database_idQ,
            collection_id,
            [QueryQ.limit(80), QueryQ.orderAsc("$id")]
        );

        const questions = response.documents;
        const questionData = questions;
        // Convert questions from JSON strings to JSON objects
        questionData.forEach((obj) => {
            obj.questions = obj.questions.map((q) => JSON.parse(q));
            // delete obj.$id
            delete obj.$createdAt
            delete obj.$updatedAt
            delete obj.$permissions
            delete obj.$databaseId
            delete obj.$collectionId
        });
        return questionData;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/**
 * Genrate random exam
 * @param {*} questionsData 
 * @param {*} subjectName 
 * @param {*} userId 
 * @param {*} educationLevel 
 * @returns 
*/
export const generateRandomExam = async (questionsData, subjectName, userId, educationLevel) => {

    // console.log(`userId: ${userId}, educationLevel: ${educationLevel}`);

    if (!questionsData) {
        console.error('questionsData is required');
        return;
    }

    try {
        // Extract category IDs dynamically from questionsData
        const categoriesToInclude = questionsData.map(category => category.category);

        // Fetch the user's question history
        const userHistory = await getAttemptedQuestions(userId, subjectName, educationLevel);

        // Select random questions based on various parameters
        const randomQuestions = selectRandomQuestions(
            questionsData,
            categoriesToInclude,
            subjectName,
            userHistory,
            userId,
            educationLevel
        );

        // Sort questions by category
        randomQuestions.categoriesWithQuestions.sort((a, b) => a.category - b.category);

        // Update the question history with the new random questions
        // await updateQuestionHistory(randomQuestions.updatedUserHistory);

        // Return the sorted random questions
        return randomQuestions.categoriesWithQuestions;

    } catch (error) {
        console.error('Error fetching user history:', error);
        throw error; // Rethrow the error for further handling
    }
};

/**
 * 
 * Check if is `EITHER` or `OR` type question
 */
export const isEitherOrFormat = (question) => {
    return question.hasOwnProperty('either') && question.hasOwnProperty('or');
};

/*
- Checks if a question was previously attempted
*/
export const selectRandomQuestions = (questionsData, categoryIds, subjectName, userHistory, userId, educationLevel) => {

    let updatedUserHistory = {
        userId: userId,
        subjectName: subjectName,
        questionsJSON: { ...userHistory?.questionsJSON }, // Clone the existing history
        educationLevel: educationLevel
    };

    let categoriesWithQuestions = categoryIds.map(categoryId => {
        const category = questionsData.find(cat => cat.category === categoryId);
        if (!category) {
            console.warn(`Category ${categoryId} not found`);
            return null;
        }
        // console.log(`Category ${categoryId} found`);

        // Retrieve attempted question IDs for this category from userHistory
        let attemptedQuestionIds = userHistory?.questionsJSON?.[categoryId] || [];
        let allQuestionIds = category.questions.map(question => question.id);
        let isCategoryExhausted = attemptedQuestionIds.length === allQuestionIds.length;

        // Reset the history for the category if all questions have been attempted
        if (isCategoryExhausted) {
            attemptedQuestionIds = [];
        }

        // Filter available questions that haven't been attempted yet
        let availableQuestions = category.questions.filter((question, index) => {
            let questionId = isEitherOrFormat(question) ? `${category.questions.indexOf(question)}` : question.id;
            return !attemptedQuestionIds.includes(questionId);
        });

        let numQuestions = 1; // Default number of questions
        if (subjectName === 'sst_ple') {
            if (categoryId === 36 || categoryId === 51) {
                numQuestions = 5;
            }
        }

        if (subjectName === 'eng_ple') {
            if (categoryId === 31) {
                numQuestions = 20;
            }
            if (categoryId === 1 || categoryId === 6) {
                numQuestions = 5;
            }
            if (categoryId === 18) {
                numQuestions = 3;
            }
            if (categoryId === 6 || categoryId === 16 || categoryId === 21 || categoryId === 23 || categoryId === 25 || categoryId === 27 || categoryId === 29) {
                numQuestions = 2;
            }
            if (categoryId === 51 || categoryId === 52 || categoryId === 53 || categoryId === 54 || categoryId === 55) {
                numQuestions = 0;
            }
        }

        // Randomly select questions
        let selectedQuestions = [...availableQuestions].sort(() => 0.5 - Math.random()).slice(0, numQuestions);

        // Handle insufficient new questions
        if (selectedQuestions.length < numQuestions) {
            let questionsNeeded = numQuestions - selectedQuestions.length;
            let additionalQuestions = [];

            for (let i = 0; i < questionsNeeded; i++) {
                if (attemptedQuestionIds.length > 0) {
                    let oldQuestionId = attemptedQuestionIds.shift(); // Remove the oldest question
                    let oldQuestion = category.questions.find(q => q.id === oldQuestionId);
                    if (oldQuestion) {
                        additionalQuestions.push(oldQuestion);
                    }
                }
            }

            selectedQuestions = selectedQuestions.concat(additionalQuestions);

            // Clear the history for this category since all questions have now been used
            if (attemptedQuestionIds.length === 0) {
                updatedUserHistory.questionsJSON[categoryId] = [];
            }
        }

        // Update questions with additional details
        const updatedQuestions = selectedQuestions.map(question => {
            const updatedQuestion = { ...question };

            if (isEitherOrFormat(question)) {
                updatedQuestion.id = `${categoryId}_${category.questions.indexOf(question)}`;
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

        // Append the IDs of newly selected questions to updatedUserHistory
        const newQuestionIds = updatedQuestions.map(question => question.id);
        updatedUserHistory.questionsJSON[categoryId] = [...new Set([...attemptedQuestionIds, ...newQuestionIds])];

        return { ...category, questions: updatedQuestions };
    }).filter(cat => cat !== null);

    return {
        updatedUserHistory,
        categoriesWithQuestions
    };
};

/*
- Retrieves previously attempted questions by the user
*/
export const getAttemptedQuestions = async (userId, subjectName, educationLevel) => {
    const url = `${serverUrl}/query/getQtnHistory/${userId}/${subjectName}/${educationLevel}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user history:', error);
        return null; // or handle the error as you see fit
    }
}

/*
- Updates the previously attempted questions list with the current questions
*/
export const updateQuestionHistory = async (selectedQuestionsJSON) => {
    // console.log('Selected Questions to Update: ', selectedQuestionsJSON)
    const url = `${serverUrl}/query/updateQtnHistory/`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedQuestionsJSON)
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // console.log('Response after updating question history: ', response);
        return await response.json(); // or just return true if the response doesn't include any data
    } catch (error) {
        console.error('Error updating question history:', error);
        return null; // or handle the error as you see fit
    }
}

/**
 * Update the question history in the database
 * @param {} data 
 * @returns 
 */
export const updateQtnHistoryDb = async (data) => {
    try {
        // console.log('Updating question in DB...', data);

        //First check if student exists in the database
        const response = await databases.listDocuments(database_id, updatedAttemptedQtnsTable_id,
            [
                Query.equal("userID", data.userId),
                Query.equal("subjectName", data.subjectName)
            ]
        )

        // console.log('Retrieving DB history', response)

        if (response.documents.length > 0) {
            // update the history
            const updateResponse = await databases.updateDocument(database_id, updatedAttemptedQtnsTable_id, response.documents[0].$id, {
                questionsAttempted: [JSON.parse(data.questionsJSON)]
            })
        }
        else {
            // create a tracking record for the student
            const createNewTrackingRecord = await databases.createDocument(database_id, updatedAttemptedQtnsTable_id, 'unique()',
                {
                    userID: data.userId,
                    educationLevel: data.educationLevel,
                    subjectName: data.subjectName,
                    questionsAttempted: [JSON.stringify(data.questionsJSON)],
                }
            )

            // console.log('Creating tracking record:', createNewTrackingRecord);
        }
    } catch (error) {
        console.error('Error updating question history: ', error);
    }
}

/**
 * Retrieve the subject attempted questions history
 * @param {} data 
 * @returns 
 */
export const retreiveQtnHistoryDb = async (data) => {
    try {
        let qtnData;
        //First check if student and subject exists in the database
        const response = await databases.listDocuments(database_id, updatedAttemptedQtnsTable_id,
            [
                Query.equal("userID", data.userId),
                Query.equal("subjectName", data.subjectName)
            ]
        )

        // console.log('Retrieving DB history', data)

        if (response.documents.length > 0) {
            // update the history
            qtnData = response.documents[0].questionsAttempted
        }
        else {
            qtnData = {}
            // create a tracking record for the student
            const createNewTrackingRecord = await databases.createDocument(database_id, updatedAttemptedQtnsTable_id, 'unique()',
                {
                    userID: data.userId,
                    educationLevel: data.educationLevel,
                    subjectName: data.subjectName,
                    questionsAttempted: null,
                }
            )

            // console.log('Creating tracking record:', createNewTrackingRecord);
        }

        //Return questionsJSON
        return { questionsJSON: qtnData }
    } catch (error) {
        console.error('Error retrieving questions history: ', error);
    }

}

export const isImageUrl = (url) => {
    return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(url);
    // return url
};
