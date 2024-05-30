// resultsUtil.js
/*=========FETCH DATA FROM DB TO UPDATE LOCALSTORAGE=========*/
import {
  databases,
  database_id,
  studentMarksTable_id,
  Query,
} from "../appwriteConfig";
import storageUtil from "./storageUtil";

export async function fetchAndUpdateResults(userId) {
  try {
    const response = await databases.listDocuments(
      database_id,
      studentMarksTable_id,
      [Query.equal("studID", userId), Query.limit(500)]
    );
    // Update local storage with new results
    storageUtil.setItem("examResults", "");
    storageUtil.setItem("examResults", response.documents);
    return response.documents;
  } catch (error) {
    console.error("Failed to retrieve student results:", error);
    return null;
  }
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

export const getTransformedResults = (studentId) => {
  const userResults = storageUtil.getItem("examResults") || [];
  const resultsMap = new Map();

  userResults.forEach((doc) => {
    const subject = doc.subject;
    const dateTime = formatDate(doc.$createdAt);
    const score = doc.marks;
    const totalPossibleMarks = doc.totalPossibleMarks;

    if (!resultsMap.has(subject)) {
      resultsMap.set(subject, { subject, attempts: [] });
    }

    resultsMap.get(subject).attempts.push({
      dateTime,
      score,
      totalPossibleMarks,
      subject,
      resultDetails: doc.results,
    });
  });

  // Sort each subject's attempts by date in descending order
  resultsMap.forEach((subjectData) => {
    subjectData.attempts.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  });

  return Array.from(resultsMap.values());
};

/*=========END TRANSFORMS THE RESULTS=========*/
