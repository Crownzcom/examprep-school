// utils.js
import {
    databases,
    database_id,
    updatedAttemptedQtnsTable_id,
    examsTable_id,
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
 * @param {string} examID - The name of the subject
 * @returns {Promise<object | string>} - The exam data or a message if not found
 */
export const getSelectedExam = async (examID) => {
    try {
        // Query the 'exams' table for exams with the specified examID
        const examInformation = await databases.listDocuments(database_id, examsTable_id, [
            Query.equal("examID", examID),
        ]);

        // console.log("Exams retrieved: ", examInformation.documents);

        // Return the selected exam data, or an empty array if no record is found
        return examInformation.documents.length > 0 ? examInformation.documents[0] : {};

    } catch (error) {
        console.error("Error retrieving exam:", error);
        throw new Error("Error retrieving exam data"); // Handle errors appropriately
    }
};

//TODO: SET STUDENT AS HAS DONE EXAM AT THE END OF THE EXAM


export const isImageUrl = (url) => {
    return (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(url);
    // return url
};
