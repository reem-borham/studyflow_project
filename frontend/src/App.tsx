
import { Routes, Route } from "react-router-dom";
import SigninPage from "./pages/login";
import "./App.css";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import User from "./pages/user";
import Explore from "./pages/Explore";
import QuestionDetail from "./pages/QuestionDetail";

function App() {
  return (

    <Routes>
      <Route path="/Register" element={<Register />} />
      <Route path="/login" element={<SigninPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/user" element={<User />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/question/:id" element={<QuestionDetail />} />
    </Routes>


  );
}

export default App;
