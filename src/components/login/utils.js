import {
    databases,
    database_id,
    studentTable_id,
    studentMarksTable_id,
    classesTable_id,
    subjectsTable_id,
    examsTable_id,
    Query,
} from "../../appwriteConfig.js";
import { serverUrl } from "../../config.js"
import db from '../../db'

/* Helper Funtions */

/* EXPORTED FUNCTIOMS */
export const clearAllTables = async () => {
    try {
        await db.transaction('rw', db.subjects, db.exams, db.examAnswers, db.students, db.classes, db.schoolData, async () => {
            await db.subjects.clear();
            await db.exams.clear();
            await db.examAnswers.clear();
            await db.students.clear();
            await db.classes.clear();
            await db.schoolData.clear();
        });
        console.log("All tables cleared successfully");
    } catch (error) {
        console.error("Error clearing all tables:", error);
        throw error;
    }
};
