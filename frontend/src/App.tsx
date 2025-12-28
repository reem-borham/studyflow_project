
import { Routes, Route, Navigate } from "react-router-dom";
import SigninPage from "./pages/login";
import "./App.css";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";  // Smart router
import StudentDashboard from "./pages/student/Dashboard";
import InstructorDashboard from "./pages/instructor/Dashboard";
import Explore from "./pages/Explore";
import QuestionDetail from "./pages/QuestionDetail";

function App() {
  return (

    <Routes>
      {/* Redirect root to Register page */}
      <Route path="/" element={<Navigate to="/Register" replace />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/login" element={<SigninPage />} />
      <Route path="/home" element={<HomePage />} />

      {/* Smart router - shows student or instructor dashboard based on role */}
      <Route path="/user" element={<UserPage />} />

      {/* Direct routes for testing/navigation */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/instructor" element={<InstructorDashboard />} />

      <Route path="/explore" element={<Explore />} />
      <Route path="/question/:id" element={<QuestionDetail />} />
    </Routes>


  );
}

export default App;
