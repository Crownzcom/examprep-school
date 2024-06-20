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
const database_id = "6672ac400013d6d9b661";
const studentTable_id = "6672ac5e001a8956108d";
const nextOfKinTable_id = "";
const studentMarksTable_id = "6672ac8f002b446168f7";
const couponTable_id = ""
const transactionTable_id = ""
const pointsTable_id = ''
const pointsBatchTable_id = ''
const subjectsTable_id = '6672acc7000add6b2499'
const couponUsagesTable_id = ''
const updatedAttemptedQtnsTable_id = ''
const examsTable_id = '6672ac9f0003f9f10bf3'
const classesTable_id = '6672acb400276c693d17'

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
  Permission,
  Role,
  Query,
  ID
};
