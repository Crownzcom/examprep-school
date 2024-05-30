import {
    client,
    account,
    databases,
    database_id,
    studentTable_id,
    nextOfKinTable_id,
    studentMarksTable_id,
    sstTablePLE_id,
    couponTable_id,
    transactionTable_id,
    pointsTable_id,
    pointsBatchTable_id,
    couponUsagesTable_id,
    Permission,
    Role,
    Query,
    ID
} from "../appwriteConfig.js";
import moment from 'moment';
import { serverUrl } from "../config.js";

export const sendEmailToNextOfKin = async (userInfo, subjectName, examScore, examDateTime) => {
    const studentName = `${userInfo.firstName} ${userInfo.lastName}${userInfo.otherName ? ` ${userInfo.otherName}` : ''}`;
    const educationLevel = userInfo.educationLevel;
    const kinNames = `${userInfo.kinFirstName} ${userInfo.kinLastName}`;
    const kinEmail = userInfo.kinEmail;

    // Send the information to the backend
    fetch(`${serverUrl}/alert-guardian`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentName,
            educationLevel,
            kinNames,
            kinEmail,
            subjectName,
            examScore,
            examDateTime,
        }),
    })
        .then(response => {
            // Handle the response from the backend
            // ...
        })
        .catch(error => {
            console.error('Failed to send email notification', error);
        });
};

export const updateLabels = async (userId, labels) => {
    const paylaod = {
        userId: userId,
        labels: labels,
    };
    // Send the information to the backend
    fetch(`${serverUrl}/update-labels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paylaod),
    })
        .then(response => {
            return response.json();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
* Formats the date string into a more readable format.
* @param {string} dateTime - The original date-time string.
* @returns {string} - The formatted date-time string.
*/
export const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return `${date.toLocaleString("en-US", {
        dateStyle: "long",
    })} ${date.toLocaleTimeString()}`;
};

/**
* APPWRITE FUNCTIONS
*/

/*** ----------- Create a document ----------- ***/
export const createDocument = async (databaseId, tableId, data, tableUse) => {
    try {
        const response = await databases.createDocument(databaseId, tableId, 'unique()', data)
        return response;
    } catch (error) {
        console.error(`Error Creating Document - (${tableUse}):`, error);
        return null;
    }
}

/* ----------- Coupon Usage tracking ----------- ***/
export const couponTrackerUpdate = async (data) => {
    try {
        var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a z');
        await createDocument(database_id, couponUsagesTable_id, {
            UserID: data.userId,
            CouponCode: data.couponCode,
            UsageDate: currentDateTime,
        }, data.message)
    } catch (e) {
        console.error('Failed to update coupon usage table: ', e);
    }
}

/*** ----------- Update Points Tables ----------- ***/
/*
data = {
created_at: receiptDetails.created_at, 
paymentFor: paymentFor, 
transactionID: data.externalId, 
userId: userInfo.userId, 
points: receiptDetails.points, 
educationLevel: educationLevel, 
message: message-`createDocument() function`,
duration: duration
}
*/
export const updatePointsTable = async (data) => {
    try {
        let points = parseInt(data.points);

        // Define both expected formats
        const customFormats = ['MMMM Do YYYY, h:mm:ss a', 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ [(]ZZZ[)]', moment.ISO_8601];

        // Parse the date using Moment.js with custom and expected formats
        let createdDate = moment(data.created_at, customFormats, true);

        // let createdDate = moment(); //NOW

        //===
        // // Check if the parsed date is valid
        // if (!createdDate.isValid()) {
        //     throw new Error('Invalid date format');
        // }

        // // Convert to JavaScript Date object
        // createdDate = createdDate.toDate();

        // // Creating a new Date object for expiryDate to avoid modifying createdDate
        // let expiryDate = new Date(createdDate);
        // expiryDate.setDate(createdDate.getDate() + data.duration); // Adding the days to the expiryDate
        //===

        // Add days to the createdDate
        let expiryDate = createdDate.add(data.duration, 'days');

        // Format the expiryDate in the specified format 'YYYY-MM-DD HH:mm:ss Z'
        expiryDate = expiryDate.format('YYYY-MM-DD HH:mm:ss Z');

        // console.log(expiryDate);

        if (data.paymentFor === 'points') {
            //Points Batch Table
            await createDocument(database_id, pointsBatchTable_id, {
                transactionID: data.transactionID,
                userID: data.userId,
                points: points,
                purchaseDate: createdDate,
                expiryDate: expiryDate,
            }, data.message)

            //Points Table
            let currentPoints = 0;
            let updateResponse;

            //Check if user has document assigned to them
            const responseCheck = await databases.listDocuments(database_id, pointsTable_id, [Query.equal('UserID', data.userId)]);

            //Create a new document if user has no document assigned
            if (responseCheck.documents.length === 0) {
                updateResponse = await databases.createDocument(
                    database_id,
                    pointsTable_id,
                    data.userId,
                    {
                        UserID: data.userId || null,
                        PurchasedTier: data.educationLevel,
                        AcquisitionDate: createdDate,
                        ExpiryDate: expiryDate,
                        PointsBalance: (currentPoints + points)
                    }
                );
            }
            else {
                //================================================================
                //Check expiry date and either increment the current value or replace it with the new value

                // Convert ExpiryDate to a moment object
                let currentExpiryDate = moment(responseCheck.documents[0].ExpiryDate);

                // console.log('Current existing date: ', currentExpiryDate);

                // Only add days if the current ExpiryDate is not older than the current date
                if (currentExpiryDate.isSameOrAfter(moment())) {
                    // Add days to the expiryDate
                    currentExpiryDate.add(data.duration, 'days');
                    // Update the ExpiryDate in the object
                    expiryDate = currentExpiryDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                }

                // console.log('Expiry date to use: ', expiryDate);
                //================================================================

                currentPoints = responseCheck.documents[0].PointsBalance;
                // console.log('Doc data: ', responseCheck.documents[0].$id + ' \n Doc ID: ' + pointsTable_id)
                //Proceed to update the points tables
                updateResponse = await databases.updateDocument(database_id, pointsTable_id, responseCheck.documents[0].$id, { PointsBalance: (currentPoints + points), ExpiryDate: expiryDate })
            }
            // console.log('Points Table Updated', updateResponse);
        }
    } catch (err) {
        console.error('Error updating points table: ', err)
    }
}

export const kinPurchasePoints = async (navigate, studentInfo) => {
    navigate(`/select-package/`, { state: { studentInfo: studentInfo } });
}