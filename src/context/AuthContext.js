// AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import {
    account
} from "../appwriteConfig.js";
import { serverUrl } from "../config.js"
import db from '../db.js';
import storageUtil from '../utilities/storageUtil.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [sessionInfo, setSessionInfo] = useState(storageUtil.getItem("sessionInfo"));
    const [userInfo, setUserInfo] = useState(storageUtil.getItem("userInfo"));

    //LOGOUT FUNCTION
    const handleLogout = async () => {
        if (sessionInfo && sessionInfo.$id) {
            try {
                const response = await account.deleteSession(sessionInfo.$id); //Clears the session on Client's and Appwrite's side
                console.log('session deleted: ', response);
            } catch (error) {
                console.error("Logout failed", error);
            }
        } else {
            console.error("No session to logout");

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
    }

    //LOGIN FUNCTION
    const handleLogin = async (sessionData, userData) => {

        console.log('Auth - HandleLogin--userDAsessionData: ', sessionData)

        console.log('Auth - HandleLogin--userDATA: ', userData)
        const sessionDetails = {
            $id: sessionData.$id,
            userId: sessionData.userId,
            expire: sessionData.expire,
            authMethod: sessionData.provider,
        };
        setSessionInfo(sessionDetails);
        storageUtil.setItem("sessionInfo", sessionDetails);

        const userDetails = {
            userID: userData.userID,
            userDocId: userData.$id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            otherName: userData.otherName,
            phone: userData.phone === undefined || userData.phone === null ? null : userData.phone,
            email: userData.email,
            gender: userData.gender,
            studClass: userData.studClass,
            stream: userData.stream,
            userType: userData.userType,
        };

        setUserInfo(userDetails);
        console.log('user info set: ', userInfo)
        storageUtil.setItem("userInfo", userDetails);

        if (userDetails.userType === "student") {

            //ANYTHING TO DO RELATED TO STUDENT


        }

    };

    return (
        <AuthContext.Provider value={{
            sessionInfo,
            userInfo,
            handleLogin,
            handleLogout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
    ;
