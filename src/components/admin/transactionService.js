import db from '../../db';  // Import your Dexie db instance

/**
 * RETRIEVES ALL TRANSACTIONS
 * @returns 
 */
export async function getAllTransactions() {
    try {
        const allTransactions = await db.transactions.toArray();
        return allTransactions;
    } catch (error) {
        console.error('Error fetching transactions from IndexedDB:', error);
        return [];
    }
}

/**
 * RETRIEVES A TRANSACTION BY USER ID
 * @param {*} userId 
 * @returns 
 */
export async function getTransactionById(userId) {
    try {
        const transaction = await db.transactions.get({ userId });
        return transaction || null;
    } catch (error) {
        console.error('Error retrieving transaction by user ID:', error);
        return null;
    }
}

/**
 * RETRIEVES TRANSACTIONS BY USER TYPE
 * @param {*} userType 
 * @returns 
 */
export async function getTransactionByUserType(userType) {
    try {
        const transactions = await db.transactions.where({ userType }).toArray();
        return transactions;
    } catch (error) {
        console.error('Error retrieving transactions by user type:', error);
        return [];
    }
}

/**
 * RETRIEVES TRANSACTIONS BY FIRST NAME
 */
export async function getTransactionsByFirstName(firstName) {
    try {
        const normalizedFirstName = firstName.toLowerCase();
        const transactions = await db.transactions.where('name').startsWithIgnoreCase(normalizedFirstName).toArray();
        return transactions;
    } catch (error) {
        console.error('Error retrieving transactions by customer first name:', error);
        return [];
    }
}

/**
 * RETRIEVES TRANSACTIONS BY LAST NAME
 */
export async function getTransactionsByLastName(lastName) {
    try {
        const normalizedLastName = lastName.toLowerCase();
        const transactions = await db.transactions.where('name').startsWithIgnoreCase(normalizedLastName).toArray();
        return transactions;
    } catch (error) {
        console.error('Error retrieving transactions by customer last name:', error);
        return [];
    }
}

/**
 * RETRIEVES TRANSACTIONS BY OTHER NAME
 */
export async function getTransactionByOtherName(otherName) {
    try {
        const normalizedOtherName = otherName.toLowerCase();
        const transactions = await db.transactions.where('name').startsWithIgnoreCase(normalizedOtherName).toArray();
        return transactions;
    } catch (error) {
        console.error('Error retrieving transactions by customer other name:', error);
        return [];
    }
}

/**
 * RETRIEVES TRANSACTIONS BY NAME
 */
export async function getTransactionByName(name) {
    try {
        const normalizedName = name.toLowerCase();
        const transactions = await db.transactions.where('name').startsWithIgnoreCase(normalizedName).toArray();
        return transactions;
    } catch (error) {
        console.error('Error retrieving transactions by customer name:', error);
        return [];
    }
}

/**
 * RETRIEVES TRANSACTIONS BY USER ID
 */
export async function getTransactionByUserId(userId) {
    try {
        const normalizedUserId = userId.toLowerCase();
        const transactions = await db.transactions.where('userId').startsWithIgnoreCase(normalizedUserId).toArray();
        return transactions;
    } catch (error) {
        console.error('Error retrieving transactions by customer id:', error);
        return [];
    }
}