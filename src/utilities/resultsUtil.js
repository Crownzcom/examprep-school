// resultsUtil.js
/*=========FETCH DATA FROM DB TO UPDATE LOCALSTORAGE=========*/
import {
  databases,
  database_id,
  studentMarksTable_id,
  Query,
} from "../appwriteConfig";
import db from "../db";
import { updateResultsData } from "./fetchStudentData"
import storageUtil from "./storageUtil";

export async function fetchAndUpdateResults(studID) {
  await updateResultsData(studID)
}
/*=========END FETCH DATA FROM DB TO UPDATE LOCALSTORAGE=========*/

/*=========TRANSFORMS THE RESULTS=========*/
export const formatDate = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const getTransformedResults = async (studentId) => {
  // Fetch results from the Dexie database
  const userResults = await db.results.toArray();
  // console.log('user results: ', userResults)
  const resultsMap = new Map();

  userResults.forEach((doc) => {
    const resultsID = doc.resultsID;
    const subject = doc.subjectName;
    const dateTime = formatDate(doc.dateTime);
    const score = doc.marks;
    const totalPossibleMarks = doc.finalPossibleMarks;

    if (!resultsMap.has(subject)) {
      resultsMap.set(subject, { subject, attempts: [] });
    }

    resultsMap.get(subject).attempts.push({
      resultsID,
      dateTime,
      score,
      totalPossibleMarks,
      subject,
    });
  });

  // console.log('returned results: ', Array.from(resultsMap.values()))

  return Array.from(resultsMap.values());
};

/*=========END TRANSFORMS THE RESULTS=========*/

/*=========FETCH RESULTS FOR A PARTICULAR RESULTS ID================*/
export const fetchResults = async (resultID, studID) => {
  try {
    const results = await databases.listDocuments(database_id, studentMarksTable_id, [Query.equal('$id', resultID)]);
    // console.log('Finsihed fetching: ', results.documents[0].results);
    return results.documents[0].results;
  } catch (err) {
    console.error(`Failed to fetch results for ${resultID}. studentID: ${studID}\n${err}`)
    throw new Error(`Failed to fetch results for ${resultID}. studentID: ${studID}\n${err}`)
  }
}
