// src/db.js
import Dexie from 'dexie';

const dbVersion = 6.6;

// Initialize the database with the exams store
const db = new Dexie('examAppDB');

db.version(dbVersion).stores({

    exams: '++id, className, stream, examID, subjectName, examQuestions, examData, openingDate, closingDate, durationMINS', // will save only exams for a particular class and stream a student belongs to. Will return all the exams if user is an admin
    examAnswers: '++id, studID,	studInfo, subject, marks, dateTime, results, totalPossibleMarks', // Student's exam answers'.If user is admin, all student results are returned
    students: "++id, userId, studName, firstName, lastName, otherName, gender, email, class, stream, userType, label, Results, accountCreationDate", //List of all students if user is admin, else will contain only a single data entry for the student
    schoolData: "++id, schoolID, educationLevel, shollName, address, email, phone1, phone2, accountCreationDate"
});

export default db;
