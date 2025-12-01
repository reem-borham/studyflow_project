import React from "react";
import Form from "../components/FormSign";
import "./SIgninPage.css"; 

const SigninPage: React.FC = () => {
  return (

    <div className="background">
      {/* Floating circles */}
      <div className="circle" style={{ top: "10%", left: "15%", width: "100px", height: "100px", animationDuration: "6s" }}></div>
      <div className="circle" style={{ top: "30%", left: "70%", width: "80px", height: "80px", animationDuration: "8s" }}></div>
      <div className="circle" style={{ top: "60%", left: "40%", width: "50px", height: "50px", animationDuration: "5s" }}></div>
      <div className="circle" style={{ top: "80%", left: "20%", width: "120px", height: "120px", animationDuration: "7s" }}></div>

      {/* Login content */}
      <div className="form-container">
        <h1>Login</h1>
        <Form />
      </div>
    </div>
  );
};

export default SigninPage;