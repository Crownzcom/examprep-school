import { serverUrl, mainServerUrl } from "../../config.js";

export const getSubCodeDetails = async (subCode, schoolId) => {
    try {
        const response = await fetch(`${mainServerUrl}/subscription/retrieve-code/retrieve?code=${subCode}&schoolID=${schoolId}`);
        if (!response.ok) {
            throw new Error('Network response error: ', response)
        }
        const data = await response.json();
        console.log('Data received about subscription code: ', data);
        return data;
    } catch (e) {
        console.error("Couldn't get subscription code details: ", e);
        throw new Error('The provided subscription code is invalid or expired. Please try again, or contact support for help. ', e);
    }
}

export const updateSubCodeAtCrownzcom = async (data) => {
    try {
        const updateSubCodeInfo = await fetch(`${mainServerUrl}/subscription/retrieve-code/subCode-update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subCode: data.subCode,
                remainingStudents: data.remainingStudents
            }),
        });

        console.log('Updated subcode information: ', updateSubCodeInfo)

    } catch (e) {
        console.error('Failed to update sub-code on Crownzcom side: ', e);
    }
}