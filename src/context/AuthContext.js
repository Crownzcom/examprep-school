// AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import moment from 'moment';
import {
    account,
    databases,
    database_id,
    studentTable_id,
    pointsTable_id,
    Query,
} from "../appwriteConfig.js";
import { serverUrl } from "../config.js"
import db from '../db.js';
import storageUtil from '../utilities/storageUtil.js';
import { studentSubjectsData } from "../utilities/fetchStudentData";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [sessionInfo, setSessionInfo] = useState(storageUtil.getItem("sessionInfo"));
    const [userInfo, setUserInfo] = useState(storageUtil.getItem("userInfo"));
    const [userPoints, setUserPoints] = useState(storageUtil.getItem("userPoints") || 0);
    const [userSubjectData, setUserSubjectData] = useState(storageUtil.getItem("userSubjectData") || [])

    //LOGOUT FUNCTION
    const handleLogout = async () => {
        if (sessionInfo && sessionInfo.$id) {
            try {
                await account.deleteSession(sessionInfo.$id); //Clears the session on Client's and Appwrite's side
            } catch (error) {
                console.error("Logout failed", error);
            }
        } else {
            console.error("No session to logout");
        }

        // Clear userPoints from context and storage
        setUserPoints('');
        storageUtil.removeItem("userPoints");

        // Clear IndexedDB
        try {
            await db.delete();  // Clears all data from the Dexie database
            // console.log("IndexedDB cleared successfully");
        } catch (error) {
            console.error("Error clearing IndexedDB:", error);
        }

        // Clear rest of stored data
        setSessionInfo(null);
        setUserInfo(null);
        storageUtil.clear();

        // Clear session storage
        sessionStorage.clear();
    };

    //LOGIN FUNCTION
    const handleLogin = async (sessionData, userData) => {
        const sessionDetails = {
            $id: sessionData.$id,
            userId: sessionData.userId,
            expire: sessionData.expire,
            authMethod: sessionData.provider,
        };
        setSessionInfo(sessionDetails);
        storageUtil.setItem("sessionInfo", sessionDetails);

        const userDetails = {
            userId: sessionData.userId,
            userDocId: userData.userDocId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            otherName: userData.otherName,
            phone: userData.phone,
            email: userData.email,
            gender: userData.gender,
            schoolName: userData.schoolName,
            schoolAddress: userData.schoolAddress,
            educationLevel: userData.educationLevel,
            subjects: userData.subjects,
            labels: userData.labels,
            kinID: userData.kinID,
            kinFirstName: userData.kinFirstName,
            kinLastName: userData.kinLastName,
            kinEmail: userData.kinEmail,
            kinPhone: userData.kinPhone,
        };

        setUserInfo(userDetails);
        storageUtil.setItem("userInfo", userDetails);

        if (userDetails.labels.includes("student")) {

            //Setting up subjects data
            await updateUserSubjectData(userDetails.subjects, userDetails.educationLevel);

            // Fetch userPoints from the database after login
            // const fetchingPoints = await fetchUserPoints(userDetails.userId, userDetails.educationLevel);
            // console.log('Fetching points: ', fetchingPoints)


            //=======================SERVIVSE WORKER - FETCH EXAMS/=======================
            // After successful login, trigger the service worker to fetch exams
            // if ('serviceWorker' in navigator) {
            //     const registration = await navigator.serviceWorker.ready;
            //     registration.active.postMessage({
            //         type: 'FETCH_EXAMS', // Custom event for the service worker
            //         subjects: userDetails.subjects, // Array of subjects
            //         userId: userDetails.userId, // ID of the logged-in user
            //         educationLevel: userDetails.educationLevel, // User's education level
            //     });
            // }

            //Without Service Worker
            try {
                // console.log('Fetching exams and saving to index db');
                // await updateQuestionSubjectData(userDetails.subjects, userDetails.userId, userDetails.educationLevel); // subjects, userId, educationLevel 
                // console.log('Finished fetching exams and saving to index db');
            } catch (err) {
                console.error('NON-SERVICE WORKER: Failed to fetch exams: ', err);
            }
            // ==============================================


        }

    };

    // Update userPoints in local storage and database
    const updateUserPoints = async (PointsToDeduct, userId) => {
        // Update points in the database and then in the context and storage
        await saveUserPointsToDatabase(PointsToDeduct, userId);
    };

    // Fetch userPoints function (example)
    const fetchUserPoints = async (userId, educationLevel) => {
        try {
            // console.log('Fetching userPoints: ', userId + ' ' + educationLevel);
            let pointsData
            const pointsResponse = await databases.listDocuments(database_id, pointsTable_id, [Query.equal('UserID', userId)])
            //Create a new document if user has no document assigned
            if (pointsResponse.documents.length !== 0) {
                pointsData = pointsResponse.documents[0].PointsBalance

            }
            else {
                console.log('No user document assigned, creating a new one for the user')

                var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');

                // console.log('CURRENT DATE: ' + currentDateTime)

                let docId = `PT-${userId}`
                // console.log('Unique ID: ', docId)

                const userDocResponse = await databases.createDocument(
                    database_id,
                    pointsTable_id,
                    'unique()',
                    {
                        UserID: JSON.stringify(userId) || null,
                        PurchasedTier: educationLevel,
                        AcquisitionDate: currentDateTime,
                        ExpiryDate: currentDateTime,
                    }
                );
                pointsData = 0
            }

            setUserPoints(pointsData);
            storageUtil.setItem("userPoints", pointsData);
            // console.log('Fetched points: ', pointsData)
        } catch (error) {
            console.error("Error fetching user points:", error);
        }
    };

    // Save userPoints function (example)
    const saveUserPointsToDatabase = async (points, userId) => {
        // Update points in the database
        try {
            let updatedPoints
            const response = await databases.listDocuments(database_id, pointsTable_id, [
                Query.equal("UserID", userId),
            ]);
            // console.log('Checking points table: ', response)
            if (response.documents.length > 0) { //TODO: If table user points doesn't exist, create new document
                const documentId = response.documents[0].$id //Points document id to be updated
                let currentPoints = response.documents[0].PointsBalance
                updatedPoints = currentPoints - points
                if (updatedPoints >= 0) {
                    // console.log('points document id: ', documentId)

                    //update Points table
                    const updateResponse = await databases.updateDocument(database_id, pointsTable_id, documentId, { PointsBalance: updatedPoints })
                    // console.log('update points balance: ', updateResponse)

                    // Update points in context and localStorage
                    setUserPoints(updatedPoints);
                    storageUtil.setItem("userPoints", updatedPoints);
                }
            }

        } catch (error) {
            console.error("Error updating user points:", error);
        }
    };

    /**
     * Formats the date string into a more readable format.
     * @param {string} userDocId - Document id string.
     * @param {string} subject - Subject string passed.
     * @returns {string || null} - return sting or nothing.
     */
    const studentEnrollSubject = async (userDocId, newSubject) => {
        // Ensure 'subjects' is an array
        const subjects = Array.isArray(userInfo.subjects) ? userInfo.subjects : [];

        // Add new subject if it doesn't exist in the array
        if (!subjects.includes(newSubject)) {
            subjects.push(newSubject);

            // Update the userInfo with the updated 'subjects'
            const updatedUserInfo = { ...userInfo, subjects };

            // Save to local storage and update the state
            storageUtil.setItem('userInfo', updatedUserInfo);
            setUserInfo(updatedUserInfo);

            // Update the database
            await databases.getDocument(database_id, studentTable_id, userDocId)
                .then((document) => {
                    // Update the 'subjects' field in the document
                    const updatedSubjects = [...document.subjects, newSubject];
                    return databases.updateDocument(database_id, studentTable_id, userDocId, {
                        subjects: updatedSubjects,
                    });
                }).then(updatedDocument => {
                    // console.log('Enrolled Subject Item appended successfully: ', updatedDocument.subjects);
                    updateUserSubjectData(updatedDocument.subjects, updatedDocument.educationLevel) //Update user subject data on localStorage
                })
                .catch((error) => {
                    console.error('Error updating subjects in the database:', error);
                });

            // //SERVICE WORKER
            // try {
            //     if ('serviceWorker' in navigator) {
            //         const registration = await navigator.serviceWorker.ready;
            //         registration.active.postMessage({
            //             type: 'FETCH_EXAMS', // Custom event for the service worker
            //             subjects: [newSubject], // Array of subjects
            //             userId: userInfo.userId, // ID of the logged-in user
            //             educationLevel: userInfo.educationLevel, // User's education level
            //         });
            //     }
            // } catch (error) {
            //     console.error('Error fetching questions:', error);
            // }
        }
    };

    //Update user subject data on localStorage
    const updateUserSubjectData = async (subjectsData, educationLevel) => {
        try {
            let enrolledSubjectsData = subjectsData || [];
            const response = await studentSubjectsData(enrolledSubjectsData, educationLevel)
            setUserSubjectData(response)
            storageUtil.setItem("userSubjectData", response);

        } catch (error) {
            // console.log('Subjects Data Error: ', error);
        };
    }

    //Fetch questions and save in localStorage
    // const updateQuestionSubjectData = async (subjects, userId, educationLevel) => {
    //     for (const subject of subjects) {
    //         try {
    //             for (let i = 0; i < 5; i++) {
    //                 try {
    //                     const url = `${serverUrl}/exam/fetch-exam?subjectName=${subject}&userId=${userId}&educationLevel=${educationLevel}`;
    //                     const response = await fetch(url);

    //                     if (!response.ok) {
    //                         throw new Error(`HTTP error! status: ${response.status}`);
    //                     }

    //                     const data = await response.json();

    //                     const exam = {
    //                         userId,
    //                         educationLevel,
    //                         subjectName: subject,
    //                         examData: data.questions,
    //                     };

    //                     // Store the exam immediately and await completion
    //                     await db.exams.add(exam);

    //                     // console.log(`Exam - ${i} for subject ${subject} stored successfully`);

    //                 } catch (error) {
    //                     console.error(`Error fetching exam data for subject ${subject}:`, error);
    //                     break;  // Exit loop on error
    //                 }
    //             }
    //         } catch (error) {
    //             console.error(`Error processing subject ${subject}:`, error);
    //         }
    //     }
    // }
    const updateQuestionSubjectData = async (subjects, userId, educationLevel) => {
        for (const subject of subjects) {
            try {
                // Check if there are already exams for the given subject
                const existingExams = await db.exams.where({ userId, subjectName: subject, educationLevel }).count();

                // If exams exist for the subject, skip fetching
                if (existingExams > 0) {
                    console.log(`Exams for subject ${subject} already exist, skipping fetch.`);
                    continue;
                }

                // If no exams exist for the subject, fetch up to 5 exams
                for (let i = 0; i < 5; i++) {
                    try {
                        const url = `${serverUrl}/exam/fetch-exam?subjectName=${subject}&userId=${userId}&educationLevel=${educationLevel}`;
                        const response = await fetch(url);

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const data = await response.json();

                        const exam = {
                            userId,
                            educationLevel,
                            subjectName: subject,
                            examData: data.questions,
                        };

                        // Store the exam immediately and await completion
                        await db.exams.add(exam);

                        // console.log(`Exam - ${i} for subject ${subject} stored successfully`);

                    } catch (error) {
                        console.error(`Error fetching exam data for subject ${subject}:`, error);
                        break;  // Exit loop on error
                    }
                }
            } catch (error) {
                console.error(`Error processing subject ${subject}:`, error);
            }
        }
    }

    return (
        <AuthContext.Provider value={{
            sessionInfo,
            userInfo,
            userPoints,
            userSubjectData,
            handleLogin,
            handleLogout,
            fetchUserPoints,
            updateUserPoints,
            studentEnrollSubject,
            updateQuestionSubjectData
        }}>
            {children}
        </AuthContext.Provider>
    );
};
