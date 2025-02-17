// function to calculate the total points of a student
export const calculateTotalPoints = (student) => {
  if (!student.Results || student.Results.length === 0) return 0;

  return student.Results.reduce((total, result) => total + result.marks, 0);
};

// Calculate Mean Mark in Percentage (Total Marks / Total Possible Marks * 100)
export const calculateExamMeanMark = (student) => {
  if (!student.Results || student.Results.length === 0) return 0;

  const totalMarks = student.Results.reduce(
    (sum, exam) => sum + (exam.marks || 0),
    0
  );
  const totalPossibleMarks = student.Results.reduce(
    (sum, exam) => sum + (exam.finalPossibleMarks || 0),
    0
  );

  return totalPossibleMarks > 0
    ? ((totalMarks / totalPossibleMarks) * 100).toFixed(2)
    : 0;
};

// Calculate Average Points (Sum of Marks / Number of Subjects)
export const calculateAveragePoints = (student) => {
  if (!student.Results || student.Results.length === 0) return 0;

  const totalMarks = student.Results.reduce(
    (sum, exam) => sum + (exam.marks || 0),
    0
  );
  return (totalMarks / student.Results.length).toFixed(2);
};

// Calculate Overall Position in Class (All Streams Combined)
export const calculateOverallPosition = (students, studClass) => {
  // Filter students by class
  const studentsInClass = students.filter(
    (student) => student.studClass === studClass
  );

  // Sort by total points in descending order
  const sortedStudents = [...studentsInClass].sort(
    (a, b) => calculateTotalPoints(b) - calculateTotalPoints(a)
  );

  return students.map((student) => ({
    ...student,
    overallPosition:
      student.studClass === studClass
        ? sortedStudents.findIndex((s) => s.userID === student.userID) + 1
        : null,
  }));
};
// function to calculate the position of a student in a stream
