// appwriteConfig.js
import { Client, Account, Databases, Permission, Role, Query, ID } from "appwrite";
import db from './db.js';

/**
 * =================================================================
 * FETCHING APPWRITE DATA FROM INDEX DB
 * =================================================================
 */
const appwriteDataArray = await db.appwriteData.toArray(); // Fetch all entries from the appwriteData table

// Handle the case where appwriteData might be null or undefined
if (appwriteDataArray.length === 0) {
  console.error("Appwrite data not found in IndexedDB.");
}

const data = appwriteDataArray[0]; // Assuming there's only one entry in the table

const appwriteData = {
  APPWRITE_ENDPOINT: data?.endpoint ?? '',
  APPWRITE_PROJECT_ID: data?.project_Id ?? '',
  DATABASE_ID: data?.database_id ?? '',
  STUDENT_TABLE_ID: data?.studentTable_id ?? '',
  STUDENT_RESULTS_TABLE_ID: data?.studentMarksTable_id ?? '',
  SET_EXAMS_TABLE_ID: data?.examsTable_id ?? '',
  CLASSES_TABLE_ID: data?.classesTable_id ?? '',
  SUBJECTS_TABLE_ID: data?.subjectsTable_id ?? '',
  SCHOOL_TABLE_ID: data?.schoolTable_id ?? '',
  // Add the other fields as necessary
};

const appwriteDataDestructured = appwriteData;

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  DATABASE_ID,
  STUDENT_TABLE_ID,
  STUDENT_RESULTS_TABLE_ID,
  SET_EXAMS_TABLE_ID,
  CLASSES_TABLE_ID,
  SUBJECTS_TABLE_ID,
  SCHOOL_TABLE_ID,
  // Add the other fields as necessary
} = appwriteDataDestructured


/**
 * =================================================================
 * SETTING UP APPWRITE CONFIGURATION
 * =================================================================
 */
// const client = new Client()
//   .setEndpoint(APPWRITE_ENDPOINT)
//   .setProject(APPWRITE_PROJECT_ID)

const client = new Client()
  .setEndpoint('https://appwrite.exampreptutor.com/v1')
  .setProject('66ac8ccd001f073c0692')

const account = new Account(client);
const databases = new Databases(client);

const database_id = DATABASE_ID;
const studentTable_id = STUDENT_TABLE_ID;
const studentMarksTable_id = STUDENT_RESULTS_TABLE_ID;
const subjectsTable_id = SUBJECTS_TABLE_ID
const examsTable_id = SET_EXAMS_TABLE_ID
const classesTable_id = CLASSES_TABLE_ID
const schoolTable_id = SCHOOL_TABLE_ID
const couponTable_id = ""
const transactionTable_id = ""
const pointsTable_id = ''
const pointsBatchTable_id = ''
const couponUsagesTable_id = ''
const updatedAttemptedQtnsTable_id = ''
const nextOfKinTable_id = "";

// Export the required parts
export {
  client,
  account,
  databases,
  database_id,
  studentTable_id,
  nextOfKinTable_id,
  studentMarksTable_id,
  couponTable_id,
  transactionTable_id,
  pointsTable_id,
  pointsBatchTable_id,
  subjectsTable_id,
  couponUsagesTable_id,
  updatedAttemptedQtnsTable_id,
  examsTable_id,
  classesTable_id,
  schoolTable_id,
  Permission,
  Role,
  Query,
  ID
};
