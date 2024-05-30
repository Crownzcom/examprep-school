import db from '../../db';  // Import your Dexie db instance

/**
 * RETRIEVES ALL THE STUDENTS
 * @returns 
 */
export async function getAllStudents() {
    try {
        const allStudents = await db.students.toArray();
        return allStudents.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)  // Deserialize the Results from JSON string
        }));
    } catch (error) {
        console.error('Error fetching students from IndexedDB:', error);
        return [];
    }
}

/**
 * RETRIEVES A SINGLE STUDENT BY STUDENT ID
 * @param {*} studID 
 * @returns 
 */
export async function getStudentById(studID) {
    try {
        const student = await db.students.get({ studID: studID });
        if (student) {
            return {
                ...student,
                Results: JSON.parse(student.Results)  // Deserialize the Results
            };
        } else {
            // console.log('No student found with studID:', studID);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving student by ID:', error);
        return null;
    }
}

/**
 * RETRIEVES STUDENTS BY EDUCATION LEVEL
 * @param {*} educationLevel 
 * @returns 
 */
export async function getStudentsByEducationLevel(educationLevel) {
    try {
        const students = await db.students.where({ educationLevel }).filter(student => {
            const labels = student.label;
            return labels.includes('student') && !labels.includes('staff') && !labels.includes('admin') && !labels.includes('sales') && !labels.includes('tester');
        }).toArray(); //Returns only student user types

        return students.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)  // Deserialize the Results
        }));
    } catch (error) {
        console.error('Error retrieving students by education level:', error);
        return [];
    }
}

/**
 * RETRIEVES STUDENTS BY FIRST NAME
 */
export async function getStudentsByFirstName(firstName) {
    try {
        const normalizedFirstName = firstName.toLowerCase();
        const students = await db.students.where('firstName').equalsIgnoreCase(normalizedFirstName).toArray();
        return students.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)
        }));
    } catch (error) {
        console.error('Error retrieving students by first name:', error);
        return [];
    }
}

/**
 * RETRIEVES STUDENTS BY LAST NAME
 */
export async function getStudentsByLastName(lastName) {
    try {
        const normalizedLastName = lastName.toLowerCase();
        const students = await db.students.where('lastName').equalsIgnoreCase(normalizedLastName).toArray();
        return students.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)
        }));
    } catch (error) {
        console.error('Error retrieving students by last name:', error);
        return [];
    }
}

/**
 * RETRIEVES STUDENTS BY OTHER NAME
 */
export async function getStudentsByOtherName(otherName) {
    try {
        const normalizedOtherName = otherName.toLowerCase();
        const students = await db.students.where('otherName').equalsIgnoreCase(normalizedOtherName).toArray();
        return students.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)
        }));
    } catch (error) {
        console.error('Error retrieving students by other name:', error);
        return [];
    }
}

/**
 * RETRIEVES STUDENTS BY GENDER
 */
export async function getStudentsByGender(gender) {
    try {
        const normalizedGender = gender.toLowerCase();
        const students = await db.students.where('gender').equalsIgnoreCase(normalizedGender).filter(student => {
            const labels = student.label;
            return labels.includes('student') && !labels.includes('staff') && !labels.includes('admin') && !labels.includes('sales') && !labels.includes('tester');
        }).toArray(); //Returns only student user types

        return students.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)
        }));
    } catch (error) {
        console.error('Error retrieving students by other name:', error);
        return [];
    }
}

/**
 * RETRIEVES STUDENTS BY SCHOOL NAME
 */
export async function getStudentsBySchoolName(schoolName) {
    try {
        const normalizedSchoolName = schoolName.toLowerCase();
        const students = await db.students.where('schoolName').equalsIgnoreCase(normalizedSchoolName).filter(student => {
            const labels = student.label;
            return labels.includes('student') && !labels.includes('staff') && !labels.includes('admin') && !labels.includes('sales') && !labels.includes('tester');
        }).toArray(); //Returns only student user types

        return students.map(student => ({
            ...student,
            Results: student.Results // Already parsed in services
        }));
    } catch (error) {
        console.error('Error retrieving students by school name:', error);
        return [];
    }
}

/**
 * RETRIEVES STUDENTS BY USER-TYPE
 */
export async function getStudentsByUserType(userType) {
    try {
        const students = await db.students
            .filter(student => {
                const labels = student.label;
                if (userType === 'student') {
                    return labels.includes('student') && !labels.includes('staff') && !labels.includes('admin') && !labels.includes('sales') && !labels.includes('tester');
                } else {
                    return labels.includes(userType);
                }
            })
            .toArray();

        return students.map(student => ({
            ...student,
            Results: JSON.parse(student.Results)  // Deserialize the Results from JSON string
        }));
    } catch (error) {
        console.error('Error retrieving students by user type:', error);
        return [];
    }
}

