// fetchStudentData.js
import {
  databases,
  database_id,
  studentTable_id,
  studentMarksTable_id,
  pointsTable_id,
  subjectsTable_id,
  Query,
} from "../appwriteConfig.js";
import { serverUrl } from "../config.js"
import db from '../db.js';
import storageUtil from "./storageUtil"; // Import storageUtil


/**
 * @param {boolean} refresh - refresh state
*/
export const fetchStudents = async (refresh = false) => {
  try {
    // console.log('Initiating students data fetch process, refresh:', refresh);

    if (refresh) {
      // console.log('Fetching students data from database due to refresh flag.');
      const response = await fetch(`${serverUrl}/db/fetch-students`);
      const data = await response.json();
      if (response.ok) {
        await updateStudentsLocalDatabase(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error fetching students data from the database');
      }
    } else {
      // console.log('Fetching students data from local file.');
      const response = await fetch(`${serverUrl}/query/students`);
      const data = await response.json();
      if (response.ok) {
        // console.log('Students Data fetched successfully: ', data);
        await updateStudentsLocalDatabase(data);
        // console.log('Students Data fetched from file and saved to local database.');
        return data;
      } else {
        console.warn('Failed to fetch students datas from local file, trying the database refresh.');
        return fetchStudents(true); // Recursive call with refresh true
      }
    }
  } catch (error) {
    console.error('Error fetching students data:', error);
    throw error;
  }
};

//Fetch transactions
export const fetchTransactions = async () => {
  try {
    // console.log('Initiating transaction fetch process, refresh:');

    const response = await fetch(`${serverUrl}/flutterwave/transactions`);

    const data = await response.json();
    if (response.ok) {
      // console.log('Transaction Data fetched successfully: ', data);
      await updateTransactionsLocalDatabase(data.data);
      // console.log('Transaction Data fetched from database and updated locally.');
      return data.data;
    } else {
      throw new Error(data.message || 'Error  transaction data from the database');
    }
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    throw error;
  }
};

//Update students data in Index DB in local database
async function updateStudentsLocalDatabase(studentData) {
  try {
    await db.transaction('rw', db.students, async () => {
      // Clear the existing entries in the students table
      await db.students.clear();

      // console.log('Saving to IndexDB ... ');
      // Bulk put the new data after clearing the table
      const savingToIndexDB = await db.students.bulkPut(studentData.map(student => ({
        ...student,
        gender: student.gender.toLowerCase(),
        firstName: student.firstName.toLowerCase(),
        lastName: student.lastName.toLowerCase(),
        otherName: student.otherName ? student.otherName.toLowerCase() : '',
        studName: toTitleCase(student.studName),
        schoolName: toTitleCase(student.schoolName),
        schoolAddress: toTitleCase(student.schoolAddress),
        // label: JSON.stringify(student.label),
        label: student.label,
        Results: JSON.stringify(student.Results.map(result => ({
          subject: result.subject,
          score: result.score,
          resultDetails: result.resultDetails,
          dateTime: result.dateTime
        }))),
        accountCreatedDate: new Date(student.accountCreatedDate).toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        accountStatus: student.accountStatus
      })));

      // console.log('IndexDB response: ', savingToIndexDB);
    });
  } catch (error) {
    console.error('Error updating, error:', error);
  }
}

//Update transactions data in Index DB in local database
async function updateTransactionsLocalDatabase(transactionData) {
  try {
    await db.transaction('rw', db.transactions, async () => {
      // Clear the existing entries in the students table
      await db.transactions.clear();

      // console.log('Saving to IndexDB ... ');
      // Bulk put the new data after clearing the table
      const savingToIndexDB = await db.transactions.bulkPut(transactionData.map(transaction => ({
        ...transaction,
        createdAt: new Date(transaction.createdAt).toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      })));

      // console.log('IndexDB response: ', savingToIndexDB);
    });
  } catch (error) {
    console.error('Error updating, error:', error);
  }
}

function toTitleCase(text) {
  if (!text) return '';
  return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Fetches and processes student and their results data.
 * @param {string} kinID - The ID of the next-of-kin.
 */
export const fetchAndProcessStudentData = async (kinID) => {
  try {
    // console.log('Fetching and processing student data ...')
    // Step 1: Fetch students linked to the next-of-kin
    const students = await fetchStudentsLinkedToKin(kinID);

    // Step 2: Fetch results and points for each student and process data
    const processedData = await Promise.all(
      students.map(async (student) => {
        // Fetch results
        const results = await fetchStudentResults(student.studID);

        // Fetch points
        const points = await fetchStudentPoints(student.studID);
        const pointsBalance = points.length > 0 ? points[0].PointsBalance : 0; // Assuming each student has only one points document

        // Construct processed student data object
        return {
          studID: student.studID,
          studName: `${student.firstName} ${student.lastName} ${student.otherName || ""}`,
          gender: student.gender,
          phone: student.phone,
          email: student.email,
          educationLevel: student.educationLevel,
          schoolName: student.schoolName,
          schoolAddress: student.schoolAddress,
          pointsBalance: pointsBalance,
          Results: results.map((result) => ({
            subject: result.subject,
            score: result.marks,
            totalPossibleMarks: result.totalPossibleMarks,
            resultDetails: result.results,
            dateTime: formatDate(result.$createdAt),
          })),
        };

      })
    );


    // Step 3: Save the processed data to local storage using storageUtil
    storageUtil.setItem("studentData", processedData);
  } catch (error) {
    console.error("Error fetching and processing student data:", error);
  }
};

/**
 * Fetches students linked to a specific next-of-kin.
 * @param {string} kinID - The ID of the next-of-kin.
 * @returns {Promise<Array>} - A promise that resolves to an array of students.
 */
const fetchStudentsLinkedToKin = async (kinID) => {
  try {
    const response = await databases.listDocuments(database_id, studentTable_id, [
      Query.equal("kinID", [kinID]),
    ]);
    return response.documents;
  } catch (err) {
    console.error('Failed to fecth students LINKED to next-of-kin. ' + err);
  }
};

/**
 * Fetches results for a specific student.
 * @param {string} studID - The ID of the student.
 * @returns {Promise<Array>} - A promise that resolves to an array of results.
 */
const fetchStudentResults = async (studID) => {
  try {
    const response = await databases.listDocuments(
      database_id,
      studentMarksTable_id,
      [Query.equal("studID", [studID])]
    );
    return response.documents;
  } catch (err) {
    console.error('Failed to fecth Students RESULTS linked to next-of-kin. ' + err);
  }
};

/**
 * Fetches student points for a specific student.
 * @param {string} studID - The ID of the student.
 * @returns {Promise<Array>} - A promise that resolves to an array of results.
 */
const fetchStudentPoints = async (studID) => {
  try {
    const response = await databases.listDocuments(
      database_id,
      pointsTable_id,
      [Query.equal("UserID", [studID])]
    );
    return response.documents;
  } catch (err) {
    console.error('Failed to fecth Students POINTS linked to next-of-kin. ' + err);
  }

};

/**
 * Updates data for a single student in local storage.
 * @param {string} studID - The ID of the student to update.
 * @param {object} updatedData - The updated data for the student.
 * // Example usage:
 * updateStudentDataInLocalStorage(studentID, { pointsBalance: newPointsBalance });
 */
export const updateStudentDataInLocalStorage = async (studID, updatedData) => {
  try {
    // Retrieve the existing array of student data from local storage
    const storedData = storageUtil.getItem("studentData");
    if (!storedData || !Array.isArray(storedData)) {
      throw new Error("No student data found in local storage.");
    }

    // Find the index of the student to update
    const studentIndex = storedData.findIndex(student => student.studID === studID);
    if (studentIndex === -1) {
      throw new Error(`Student with ID ${studID} not found in local storage.`);
    }

    // Update the specific student's data
    storedData[studentIndex] = {
      ...storedData[studentIndex],
      ...updatedData
    };

    // Save the modified array back to local storage
    storageUtil.setItem("studentData", storedData);
  } catch (error) {
    console.error("Error updating student data in local storage:", error);
  }
};

/**
 * Fetch All Subjects Data for a particular education-level.
 * @param {string} educationLevel - The education-level to fetch
 */
export const fetchAllSubjectsData = async (educationLevel) => {
  try {
    const response = await databases.listDocuments(database_id, subjectsTable_id, [
      Query.equal("educationLevel", educationLevel),
    ]);
    if (response.documents.length > 0) {
      // console.log('Checking points table: ', response.documents);
      return response.documents
    }
  } catch (error) {
    // console.log('All Subjects Data Error: ', error);
    throw new Error(`ALL Subjects Data Error: ${error}`);
  };
};

export const studentSubjectsData = async (enrolledSubjectsData, educationLevel) => {
  try {
    // console.log('Enrolled Subjects Data: ', enrolledSubjectsData);

    let allSubjectsData = await fetchAllSubjectsData(educationLevel);

    //Iterate over all subjects to add enrolled keys to all subjects which is either truthy or falsy
    allSubjectsData.forEach(subject => {
      subject.enrolled = enrolledSubjectsData.includes(subject.$id);
    });

    // console.log('Updated Subjects Data with Enroll key: ', allSubjectsData)

    //Save to local storage
    return allSubjectsData;

  } catch (error) {
    // console.log('Student Subjects Data Error: ', error);
    console.error('Student Subjects Data Error: ', error)
  }
}

/**
    * Handles student enrollment.
    * @param {string} userDocId - Document id string.
    * @param {string} subject - Subject string passed.
    * @returns {string || null} - return sting or nothing.
    */
// export const studentEnrollSubject = async (userDocId, subject) => {
//   console.log("Student Enroll Subject: ", subject);
//   console.log("Student DocuID: ", userDocId)
//   if (!subject) {
//     console.log('Subject is required');
//     return
//   }

//   databases.getDocument(database_id, studentTable_id, userDocId)
//     .then(document => {
//       const updatedArray = [...document.subjects, subject];

//       return databases.updateDocument(database_id, studentTable_id, userDocId, {
//         subjects: updatedArray
//       });
//     })
//     .then(updatedDocument => {
//       console.log('Item appended successfully: ', updatedDocument);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
// };

/**
 * Formats the date string into a more readable format.
 * @param {string} dateTime - The original date-time string.
 * @returns {string} - The formatted date-time string.
 */
const formatDate = (dateTime) => {
  try {
    const date = new Date(dateTime);
    return `${date.toLocaleString("en-US", {
      dateStyle: "long",
    })} ${date.toLocaleTimeString()}`;
  } catch (err) {
    console.error('Failed to format DATE. ' + err);
  }
};

/**
 * Retrive data from index database
 */
export const initiateIndexDB = async (labels) => {
  //Fetch all students data
  // console.log("Checking whether user is an admin or staff");
  if (labels.includes("admin") || labels.includes("staff")) {
    // console.log('Fetching student data');
    await fetchStudents(true).then(data => {
      // console.log('Students data Fetch successfully');
    }).catch(error => {
      console.error('Failed to fetch students');
    });

    await fetchTransactions().then(data => { }).catch(error => {
      console.error('Failed to fetch transactions');
    });
  }
}
