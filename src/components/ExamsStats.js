import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import db from "../db";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { fetchStudents } from "../utilities/fetchStudentData";
import "../components/ExamsStats.css";

const ExamsStats = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [averageMarks, setAverageMarks] = useState(null);
  const [overallAverageMarks, setOverallAverageMarks] = useState(null);
  const [bestStudentInClass, setBestStudentInClass] = useState(null);
  const [averageMarksPerSubject, setAverageMarksPerSubject] = useState({});
  const [bestStudentPerSubject, setBestStudentPerSubject] = useState({});
  const [bestStudentInStream, setBestStudentInStream] = useState(null);
  const [classData, setClassData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStudents(await fetchStudents());
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };
    fetchData();
  }, []);

  // console.log("Students for statistics: ", students);

  useEffect(() => {
    const uniqueClasses = [
      ...new Set(students.map((student) => student.studClass)),
    ];
    setClasses(uniqueClasses);
  }, [students]);

  useEffect(() => {
    if (selectedClass) {
      const uniqueStreams = [
        ...new Set(
          students
            .filter((student) => student.studClass === selectedClass)
            .map((student) => student.stream)
        ),
      ];
      setStreams(uniqueStreams);
      calculateOverallAverageMarks(selectedClass);
      findBestStudentInClass(selectedClass);
    } else {
      setStreams([]);
      setOverallAverageMarks(null);
    }
  }, [students, selectedClass]);

  useEffect(() => {
    if (selectedStream) {
      calculateAverageMarks(selectedClass, selectedStream);
      findBestStudentInStream(selectedClass, selectedStream);
      generateClassData(selectedClass);
      calculateAverageMarksPerSubject(selectedClass, selectedStream);
      findBestStudentPerSubject(selectedClass, selectedStream);
    } else {
      setAverageMarks(null);
    }
  }, [selectedStream]);

  const handleGoBack = () => {
    navigate("/");
  };

  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    setSelectedClass(selectedClass);
    setSelectedStream("");
    setBestStudentInStream(null);
    setBestStudentInClass(null);
    setClassData([]);
    setAverageMarksPerSubject({});
    setBestStudentPerSubject({});
  };

  const handleStreamChange = (e) => {
    const selectedStream = e.target.value;
    setSelectedStream(selectedStream);
  };

  const calculateAverageMarks = (cls, stream) => {
    const streamStudents = students.filter(
      (student) => student.studClass === cls && student.stream === stream
    );
    const totalMarks = streamStudents.reduce((acc, student) => {
      const studentTotalMarks = student.Results.reduce(
        (sum, result) => sum + result.marks,
        0
      );
      return acc + studentTotalMarks;
    }, 0);
    const totalSubjects = streamStudents.reduce(
      (acc, student) => acc + student.Results.length,
      0
    );
    const average = totalSubjects ? (totalMarks / totalSubjects).toFixed(2) : 0;
    setAverageMarks(average);
  };

  const calculateOverallAverageMarks = (cls) => {
    const classStudents = students.filter(
      (student) => student.studClass === cls
    );
    const totalMarks = classStudents.reduce((acc, student) => {
      const studentTotalMarks = student.Results.reduce(
        (sum, result) => sum + result.marks,
        0
      );
      return acc + studentTotalMarks;
    }, 0);
    const totalSubjects = classStudents.reduce(
      (acc, student) => acc + student.Results.length,
      0
    );
    const average = totalSubjects ? (totalMarks / totalSubjects).toFixed(2) : 0;
    setOverallAverageMarks(average);
  };

  const findBestStudentInClass = (cls) => {
    const classStudents = students.filter(
      (student) => student.studClass === cls
    );
    const bestStudent = classStudents.reduce(
      (best, student) => {
        const studentTotalMarks = student.Results.reduce(
          (sum, result) => sum + result.marks,
          0
        );
        return studentTotalMarks > best.totalMarks
          ? { ...student, totalMarks: studentTotalMarks }
          : best;
      },
      { totalMarks: 0 }
    );
    setBestStudentInClass(bestStudent.userID ? bestStudent : null);
  };

  const findBestStudentInStream = (cls, stream) => {
    const streamStudents = students.filter(
      (student) => student.studClass === cls && student.stream === stream
    );
    const bestStudent = streamStudents.reduce(
      (best, student) => {
        const studentTotalMarks = student.Results.reduce(
          (sum, result) => sum + result.marks,
          0
        );
        return studentTotalMarks > best.totalMarks
          ? { ...student, totalMarks: studentTotalMarks }
          : best;
      },
      { totalMarks: 0 }
    );
    setBestStudentInStream(bestStudent.userID ? bestStudent : null);
  };

  const generateClassData = (cls) => {
    const data = streams.map((stream) => {
      const streamStudents = students.filter(
        (student) => student.studClass === cls && student.stream === stream
      );
      const totalMarks = streamStudents.reduce((acc, student) => {
        const studentTotalMarks = student.Results.reduce(
          (sum, result) => sum + result.marks,
          0
        );
        return acc + studentTotalMarks;
      }, 0);
      const totalSubjects = streamStudents.reduce(
        (acc, student) => acc + student.Results.length,
        0
      );
      const average = totalSubjects
        ? (totalMarks / totalSubjects).toFixed(2)
        : 0;
      return { name: stream, average: parseFloat(average) };
    });
    setClassData(data);
  };

  const calculateAverageMarksPerSubject = (cls, stream) => {
    const streamStudents = students.filter(
      (student) => student.studClass === cls && student.stream === stream
    );

    const subjectMarks = streamStudents.reduce((acc, student) => {
      student.Results.forEach((result) => {
        if (!acc[result.subjectName]) {
          acc[result.subjectName] = { totalMarks: 0, count: 0 };
        }
        acc[result.subjectName].totalMarks += result.marks;
        acc[result.subjectName].count += 1;
      });
      return acc;
    }, {});

    const averages = Object.keys(subjectMarks).reduce((acc, subject) => {
      acc[subject] = (
        subjectMarks[subject].totalMarks / subjectMarks[subject].count
      ).toFixed(2);
      return acc;
    }, {});

    setAverageMarksPerSubject(averages);
  };

  const findBestStudentPerSubject = (cls, stream) => {
    const streamStudents = students.filter(
      (student) => student.studClass === cls && student.stream === stream
    );

    const bestStudents = streamStudents.reduce((acc, student) => {
      student.Results.forEach((result) => {
        if (
          !acc[result.subjectName] ||
          result.marks > acc[result.subjectName].marks
        ) {
          acc[result.subjectName] = { ...student, marks: result.marks };
        }
      });
      return acc;
    }, {});

    setBestStudentPerSubject(bestStudents);
  };

  console.log(classData);
  return (
    <div className="exams-stats-container">
      <div className="w-100">
        <h4
          className="d-flex align-items-center gap-2 p-4"
          style={{ margin: "0" }}
        >
          <Icon icon="game-icons:network-bars" /> Exams Analysis
        </h4>
        <div className="selector-container">
          <label htmlFor="select-class">Select Class: </label>
          <select
            id="select-class"
            value={selectedClass}
            onChange={handleClassChange}
          >
            <option value="">-- select class --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
        {selectedClass && (
          <div className="selector-container">
            <label htmlFor="select-stream">Select Stream: </label>
            <select
              id="select-stream"
              value={selectedStream}
              onChange={handleStreamChange}
            >
              <option value="">-- select stream --</option>
              {streams.map((stream) => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              ))}
            </select>
          </div>
        )}
        {averageMarks !== null && (
          <div style={{ width: "60%" }} className="graph-container">
            <h5 className="graph-title">
              Average Marks for Stream {selectedStream}: {averageMarks}
            </h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {overallAverageMarks !== null && (
          <div style={{ width: "60%" }} className="graph-container">
            <h5 className="graph-title">
              Overall Average Marks for Class {selectedClass}:{" "}
              {overallAverageMarks}
            </h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {bestStudentInClass && (
          <div className="graph-container">
            <h5 className="graph-title">
              Best Student in Class {selectedClass}:
            </h5>
            <p>
              Name: {bestStudentInClass.firstName} {bestStudentInClass.lastName}
              <br />
              Total Marks: {bestStudentInClass.totalMarks}
            </p>
          </div>
        )}

        {bestStudentInStream && (
          <div className="graph-container ">
            <h5 className="graph-title">
              Best Student in Stream {selectedStream}:
            </h5>
            <p>
              Name: {bestStudentInStream.firstName}{" "}
              {bestStudentInStream.lastName}
              <br />
              Total Marks: {bestStudentInStream.totalMarks}
            </p>
          </div>
        )}
        {Object.keys(averageMarksPerSubject).length > 0 && (
          <div className="mt-4">
            <h5 className="table-title">
              Average Marks per Subject for Stream {selectedStream}:
            </h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Average Marks</th>
                  <th>Best Student</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(averageMarksPerSubject).map((subject) => (
                  <tr key={subject}>
                    <td>{subject}</td>
                    <td>{averageMarksPerSubject[subject]}</td>
                    <td>
                      {bestStudentPerSubject[subject].firstName}{" "}
                      {bestStudentPerSubject[subject].lastName}
                    </td>
                    <td>{bestStudentPerSubject[subject].marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamsStats;
