import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import useNetworkStatus from "./hooks/useNetworkStatus";
import { showToast } from "./utilities/toastUtil.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContent from "./components/navbar/AppContent";
import Footer from "./components/Footer";
import Initiate from "./components/initiate/Initiate.js";
import Login from "./components/login/Login";
import SignUp from "./components/Signup";
import ForgetPassword from "./components/ForgetPassword";
import Testing from "./components/Testing";
import Home from "./components/Home";
import Profile from "./components/Profile";
import AllResults from "./components/AllResults";
import Exam from "./components/Exam";
import ExamPage from "./components/ExamPage";
import QuizResults from "./components/english/QuizResults";
import PasswordReset from "./components/PasswordReset";
import StudentDetails from "./components/StudentDetails";
import LinkedStudents from "./components/LinkedStudents";
import EditProfile from "./components/EditProfile";
import Answers from "./components/renderAnswer/Answers";
import RegisteredStudents from "./pages/RegisteredStudents";
import ScheduleExam from "./components/scheduleExam/ScheduleExam.js"
import NotFoundPage from './components/NotFoundPage';
import { AuthProvider, useAuth } from './context/AuthContext';
// import './serviceWorkerListener.js';  // Service worker listener script
import "./App.css";

function PrivateRoute({ children }) {
  const { userInfo, sessionInfo } = useAuth();
  // console.log('APP.JS session info: ', sessionInfo);
  if (!userInfo || !sessionInfo) {
    // window.location.reload();
    return <Navigate to="/login" />;
  } else if (window.location.pathname === '/login') {
    window.location.reload();
  }
  return children;
}

function ExamWithSubject(props) {
  let { examID } = useParams();
  return <Exam examID={examID} {...props} />;
}

function App() {
  const isOnline = useNetworkStatus();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (!isOnline) {
      showToast("You are offline. Check your internet connection.", "warning");
    } else {
      showToast("You are back online.", "success");
    }
  }, [isOnline]);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
          <div>
            <Routes>
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/all-results" element={<PrivateRoute><AllResults /></PrivateRoute>} />
              <Route path="/exam/:examID" element={<PrivateRoute><ExamWithSubject /></PrivateRoute>} />
              <Route path="/exam-page" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
              <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
              <Route path="/exam-results" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
              <Route path="/student-details" element={<PrivateRoute><StudentDetails /></PrivateRoute>} />
              <Route path="/linked-students" element={<PrivateRoute><LinkedStudents /></PrivateRoute>} />
              <Route path="/answers" element={<PrivateRoute><Answers /></PrivateRoute>} />
              <Route path="/registered-students" element={<PrivateRoute><RegisteredStudents /></PrivateRoute>} />
              <Route path="/schedule-exam" element={<PrivateRoute><ScheduleExam /></PrivateRoute>} />
              <Route path="/initiate" element={<Initiate />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/testing" element={<Testing />} />
            </Routes>
          </div>
        </div>
        <ToastContainer position="top-center" />
      </AuthProvider>
    </Router>
  );
}

export default App;
