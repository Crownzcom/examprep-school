// appwriteConfig.js
import { Client, Account, Databases, Permission, Role, Query, ID } from "appwrite";

/* DERRICKML - Cloud*/
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("651413f38aee140189c2");

/* LOCALHOST - DERRICKML */
// const client = new Client()
//   .setEndpoint('APPWRITE_ENDPOINT')
//   .setProject('APPWRITE_PROJECT_ID')

/* EXAM_PREP - SERVER LOCAL INSTANCE */
// const client = new Client()
//   .setEndpoint('https://appwrite.exampreptutor.com/v1')
//   .setProject('664ba6da0021d91d5a40')

/* .ENV SETUP - If the above values are set in the .ENV file */
// const client = new Client()
// .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint from env var
// .setProject(process.env.APPWRITE_PROJECT_ID); // Your project ID from env var

const account = new Account(client);
const databases = new Databases(client);

//DERRICK Cloud - Appwrite
const database_id = "655f5a677fcf3b1d8b79";
const studentTable_id = "657065f7dddd996bf19b";
const nextOfKinTable_id = "65706739032c0962d0a9";
const studentMarksTable_id = "6598050dbb628ae2216f";
const couponTable_id = "65d74fb70f64c0e46f36"
const transactionTable_id = "65f05f7989ddbc1b06b7"
const pointsTable_id = 'UserID'
const pointsBatchTable_id = '65f2c212c16fa9abe971'
const subjectsTable_id = '660bb2f8d5d40ba2c2b5'
const couponUsagesTable_id = '65dc4317b1e6e5bebdb9'
const updatedAttemptedQtnsTable_id = '66279de7702be42c9910'

//ExamPrep - Appwrite Self-Hosted Instance
// const database_id = "655f5a677fcf3b1d8b79";
// const studentTable_id = "657065f7dddd996bf19b";
// const nextOfKinTable_id = "65706739032c0962d0a9";
// const studentMarksTable_id = "6598050dbb628ae2216f";
// const couponTable_id = "65d74fb70f64c0e46f36"
// const transactionTable_id = "65f05f7989ddbc1b06b7"
// const pointsTable_id = 'UserID'
// const pointsBatchTable_id = '65f2c212c16fa9abe971'
// const subjectsTable_id = '660bb2f8d5d40ba2c2b5'
// const couponUsagesTable_id = '65dc4317b1e6e5bebdb9'
// const updatedAttemptedQtnsTable_id = '66279de7702be42c9910'

//Localhost - Appwrite
/*
 *Add localhost tables here 
 */

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
  Permission,
  Role,
  Query,
  ID
};
