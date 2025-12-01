
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import "./App.css";
function App() {
  return (
    
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* add more routes later here */}
    </Routes>
    

  );
}

export default App;
