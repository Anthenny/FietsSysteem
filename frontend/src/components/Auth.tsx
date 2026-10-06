import React, { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "../firebase";

export const Auth: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Fout bij authenticatie.");
    }
  };

  return React.createElement(
    "div",
    { style: { maxWidth: "360px", margin: "60px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" } },
    React.createElement("h2", null, isRegister ? "Account Aanmaken" : "Inloggen"),
    error && React.createElement("p", { style: { color: "red", fontSize: "14px" } }, error),
    React.createElement(
      "form",
      { onSubmit: handleSubmit },
      React.createElement(
        "div",
        { style: { marginBottom: "12px" } },
        React.createElement("label", null, "E-mailadres"),
        React.createElement("input", {
          type: "email",
          value: email,
          onChange: (e: any) => setEmail(e.target.value),
          required: true,
          style: { width: "100%", padding: "8px", marginTop: "4px", boxSizing: "border-box" }
        })
      ),
      React.createElement(
        "div",
        { style: { marginBottom: "16px" } },
        React.createElement("label", null, "Wachtwoord"),
        React.createElement("input", {
          type: "password",
          value: password,
          onChange: (e: any) => setPassword(e.target.value),
          required: true,
          style: { width: "100%", padding: "8px", marginTop: "4px", boxSizing: "border-box" }
        })
      ),
      React.createElement(
        "button",
        {
          type: "submit",
          style: { width: "100%", padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }
        },
        isRegister ? "Registreren" : "Inloggen"
      )
    ),
    React.createElement(
      "p",
      {
        style: { marginTop: "15px", cursor: "pointer", color: "#007bff", fontSize: "14px", textAlign: "center" },
        onClick: () => setIsRegister(!isRegister)
      },
      isRegister ? "Al een account? Log hier in." : "Nog geen account? Registreer hier."
    )
  );
};