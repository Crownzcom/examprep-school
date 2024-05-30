// src/db.js
import Dexie from 'dexie';

const dbVersion = 5.8;

// Initialize the database with the exams store
const db = new Dexie('examAppDB');

db.version(dbVersion).stores({

    exams: '++id, userId, educationLevel, subjectName, examData', // Define the schema for 'exams'
    examAnswers: '++id, studID,	studInfo, subject, marks, dateTime, results, totalPossibleMarks, kinEmail', // Define the schema for 'examAnswers' submission when offline
    students: "++id, userId, studName, firstName, lastName, otherName, gender, phone, email, educationLevel, schoolName, schoolAddress, pointsBalance, Results, accountCreatedDate, accountStatus, label",
    transactions: "++id, userId, name, txId, txRef, amount, currency, status, createdAt, description, userType"
});

export default db;
