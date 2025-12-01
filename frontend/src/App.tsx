
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SigninPage from "./pages/SigninPage";
import "./App.css";
import HomePage from "./pages/HomePage";
function App() {
  return (
    
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
    

  );
}

export default App;
