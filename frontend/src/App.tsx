
import { Routes, Route } from "react-router-dom";
import SigninPage from "./pages/login";
import "./App.css";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
function App() {
  return (
    
    <Routes>
      <Route path="/Register" element={<Register />} />
      <Route path="/login" element={<SigninPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
    

  );
}

export default App;
