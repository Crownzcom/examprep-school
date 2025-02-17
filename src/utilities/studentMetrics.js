// function to calculate the total points of a student
export const calculateTotalPoints = (student) => {
  if (!student.Results || student.Results.length === 0) return 0;

  return student.Results.reduce((total, result) => total + result.marks, 0);
};

// function to calculate the exam mean mark of a student
export const calculateMeanMark = (student) => {
  if (!student.Results || student.Results.length === 0) return 0;

  const totalPoints = calculateTotalPoints(student);
  return (totalPoints / student.Results.length).toFixed(2);
};

// function to calculate the average mark of a student

// function to calculate the overall position of a student

// function to calculate the position of a student in a stream
