import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SigninPage from "./pages/SigninPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import QuestionsPage from "./pages/QuestionsPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<SigninPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/questions/:id" element={<QuestionDetailPage />} />
      <Route path="/ask-question" element={<AskQuestionPage />} />
      <Route path="*" element={
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
        </div>
      } />
    </Routes>
  );
}

export default App;
