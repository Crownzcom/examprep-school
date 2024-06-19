// appwriteConfig.js
import { Client, Account, Databases, Permission, Role, Query, ID } from "appwrite";
import db from './db.js';

/* LOCALHOST - DERRICKML */
const client = new Client()
  .setEndpoint('http://localhost/v1')
  .setProject('6666c877a1b3d17050ad')

const account = new Account(client);
const databases = new Databases(client);

//Localhost - Appwrite
const database_id = "66729451003946e90d29";
const studentTable_id = "6672947000012ba91d5e";
const nextOfKinTable_id = "";
const studentMarksTable_id = "667294a1000e9f723e3c";
const couponTable_id = ""
const transactionTable_id = ""
const pointsTable_id = ''
const pointsBatchTable_id = ''
const subjectsTable_id = ''
const couponUsagesTable_id = ''
const updatedAttemptedQtnsTable_id = ''
const examsTable_id = '667294b00028f4dd74b5'

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
  Permission,
  Role,
  Query,
  ID
};
