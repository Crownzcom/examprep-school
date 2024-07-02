// fetchStudentData.js
import {
  databases,
  database_id,
  studentTable_id,
  studentMarksTable_id,
  subjectsTable_id,
  examsTable_id,
  classesTable_id,
  Query,
} from "../appwriteConfig.js";
import { serverUrl } from "../config.js"
import db from '../db.js';
import storageUtil from "./storageUtil"; // Import storageUtil


/*Helper functions*/

export const getDocs = async (colID, query = []) => {
  try {
    const response = await databases.listDocuments(database_id, colID, query)

    return response.documents

  } catch (err) {
    console.error('Failed to retrieve docs for: ', colID);
    throw new Error(`Failed to retrieve docs for: ${colID} ... ${err}`);
  }
}

//Updates exams set in index db
const updateExamData = async (examData) => {
  try {
    if (!db.isOpen()) {
      await db.open();
    }

    await db.transaction('rw', db.exams, async () => {
      // Clear the existing entries in the exams table
      await db.exams.clear();

      // console.log('Saving to IndexDB ... ');
      // Bulk put the new data after clearing the table
      const savingToIndexDB = await db.exams.bulkPut(examData.map(exam => ({
        ...exam,
        examID: exam.examID,
        subjectName: exam.subjectName,
        className: exam.classID,
        stream: JSON.stringify(exam.stream),
        durationMINS: exam.durationMINS.toString(),
        openingDate: new Date(exam.openingDate).toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        closingDate: new Date(exam.closingDate).toLocaleString("en-US", {
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
    console.error('Error updating exams:', error);
    throw new Error('Error updating exams table:', error);
  }
};

//Updates subjects in index db
export const updateSubjectsData = async () => {
  try {

    // Fetch Subjects
    const subjects = await getDocs(subjectsTable_id, [])
    // console.log('Subjects found: ', subjects)

    if (!db.isOpen()) {
      await db.open();
    }

    await db.transaction('rw', db.subjects, async () => {
      // Clear the existing entries in the exams table
      await db.subjects.clear();

      // console.log('Saving to Subjects IndexDB ... ');
      // Bulk put the new data after clearing the table
      const savingToIndexDB = await db.subjects.bulkPut(subjects.map(subject => ({
        ...subject,
        subjectName: subject.subjectName,
        examTableId: subject.examTableId,
      })));

      // console.log('IndexDB response: ', savingToIndexDB);
    });
  } catch (error) {
    console.error('Error updating subjects index db table:', error);
    throw new Error('Error updating subjects index db table:', error);
  }
};

//Updates exams done in index db
export const updateResultsData = async (studID) => {
  try {

    // Fetch Results
    const results = await getDocs(studentMarksTable_id, [Query.equal("studID", [studID]), Query.limit(500)])
    // console.log('Results found: ', results)

    results.forEach((obj) => {
      // obj.questions = obj.questions.map((q) => JSON.parse(q));
      delete obj.results;
      delete obj.$createdAt;
      delete obj.$updatedAt;
      delete obj.$permissions;
      delete obj.$databaseId;
      delete obj.$collectionId;
    });

    if (!db.isOpen()) {
      await db.open();
    }

    await db.transaction('rw', db.results, async () => {
      // Clear the existing entries in the results table
      await db.results.clear();

      // console.log('Saving to results IndexDB ... ');
      // Bulk put the new data after clearing the table
      const savingToIndexDB = await db.results.bulkPut(results.map(result => ({
        // ...result,
        examID: result.examID,
        resultsID: result.$id,
        subjectName: result.subjectName,
        marks: result.marks,
        finalPossibleMarks: result.finalPossibleMarks,
        durationMINS: result.durationMINS != undefined || result.durationMINS != null ? result.durationMINS : null,
        dateTime: new Date(result.dateTime).toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      })));

      // console.log('IndexDB response: ', savingToIndexDB);

      //only reload if the current open window is '/all-results'
      if (window.location.pathname === '/all-results') {
        window.location.reload();
      }
    });
  } catch (error) {
    console.error('Error updating results index db table:', error);
    throw new Error('Error updating results index db table:', error);
  }
};

//Updates classes in index db
export const updateClassData = async () => {
  try {

    // Fetch Classes
    const classes = await getDocs(classesTable_id, [])

    if (!db.isOpen()) {
      await db.open();
    }

    await db.transaction('rw', db.classes, async () => {
      // Clear the existing entries in the exams table
      await db.classes.clear();

      // console.log('Saving to Subjects IndexDB ... ');
      // Bulk put the new data after clearing the table
      const savingToIndexDB = await db.classes.bulkPut(classes.map(class_ => ({
        ...class_,
        classID: class_.classID,
        streams: JSON.stringify(class_.streams),
      })));

      // console.log('IndexDB response: ', savingToIndexDB);
    });
  } catch (error) {
    console.error('Error updating classes index db table:', error);
    throw new Error('Error updating classes index db table:', error);
  }
};

/**
 * @param {boolean} refresh - refresh state
*/
export const fetchStudents = async (refresh = false) => {
  try {
    // console.log('Initiating students data fetch process, refresh:', refresh);

    if (refresh) {
      // console.log('Fetching students data from database due to refresh flag.');
      const response = await fetch(`http://localhost:3001/students/fetch-students`);
      const data = await response.json();
      if (response.ok) {
        await updateStudentsLocalDatabase(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Error fetching students data from the database');
      }
    } else {
      // console.log('Fetching students data from local file.');
      const response = await fetch(`${serverUrl}/students/fetch-students`);
      const data = await response.json();
      if (response.ok) {
        // console.log('Students Data fetched successfully: ', data);
        await updateStudentsLocalDatabase(data);
        // console.log('Students Data fetched from file and saved to local database.');
        return data;
      } else {
        console.warn('Failed to fetch students data from local file, trying the database refresh.');
        return fetchStudents(true); // Recursive call with refresh true
      }
    }
  } catch (error) {
    console.error('Error fetching students data:', error);
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
        class: toTitleCase(student.class),
        stream: toTitleCase(student.stream),
        // label: JSON.stringify(student.label),
        label: student.label || null,
        Results: JSON.stringify(student.Results.map(result => ({
          subject: result.subject,
          score: result.score,
          resultDetails: result.resultDetails,
          dateTime: result.dateTime
        }))),
        accountCreationDate: new Date(student.accountCreationDate).toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        userType: student.userType
      })));

      // console.log('IndexDB response: ', savingToIndexDB);
    });
  } catch (error) {
    console.error('Error updating, error:', error);
  }
}

//Fetch exams from database and pass to index db
export const fetchSetExams = async (userInfo) => {
  try {
    if (userInfo === undefined || userInfo === null) {
      throw new Error('No user information passed')
    }

    let examsTable;

    //fetch subject details
    // const subjects = await getDocs(subjectsTable_id)

    let examData = []
    if (userInfo.userType === 'student') {
      //fetch exams
      // console.log('fetch exam data for: class: ', userInfo.studClass, ' stream: ', userInfo.stream)
      examData = await getDocs(examsTable_id, [Query.and([
        Query.equal('classID', userInfo.studClass),
        Query.contains('stream', [userInfo.stream])
      ])])
      // console.log('Stud exam found: ', examData)
    }
    else if (userInfo.userType === 'admin') {
      //fetch exams
      examData = await getDocs(examsTable_id, [])
      // console.log('admin exam found: ', examData)
    }
    else {
      throw new Error('Invalid user type or user type is not provided or supported: ', userInfo.userType);
    }

    //Save exam data to index DB
    await updateExamData(examData);

    return true;

  } catch (err) {
    throw new Error('Error fetching exam: ', err)
  }
}

function toTitleCase(text) {
  if (!text) return '';
  return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Fetches and processes student and their results data.
 * @param {string} null - The ID of the next-of-kin.
 */
export const fetchAndProcessStudentData = async () => {
  try {
    await fetch('http://localhost:3001/students/fetch-students')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // console.log(data); // This logs the data retrieved from the server

        // console.log('Processed Data: ', data.data)

        // Step 3: Save the processed data to local storage using storageUtil
        storageUtil.setItem("studentData", data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  } catch (error) {
    console.error("Error fetching and processing student data:", error);
    throw new Error("Error fetching and processing student data:", error)
  }
};

/**
 * Fetches students linked to a specific next-of-kin.
 * @param {string} kinID - The ID of the next-of-kin.
 * @returns {Promise<Array>} - A promise that resolves to an array of students.
 */
const fetchStudentsLinkedToKin = async (query = []) => {
  try {
    const response = await databases.listDocuments(database_id, studentTable_id, query);
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
export const initiateIndexDB = async (userInfo) => {
  //Fetch all students data
  // console.log("Checking whether user is an admin or staff");
  if (userInfo.userType === "admin" || userInfo.userType === "staff") {
    // console.log('Fetching student data');
    await fetchStudents(true).then(data => {
      // console.log('Students data Fetch successfully');
    }).catch(error => {
      console.error('Failed to fetch students');
    });
  }
  else if (userInfo.userType === 'student') {
    await fetchSetExams(userInfo.studClass, userInfo.stream).then(data => {
      // console.log('Student exam Fetch successfully');
    }).catch(error => {
      console.error('Failed to fetch student exams');
    });
  }
}
