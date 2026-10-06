import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export const Dashboard: React.FC = () => {
  const handleLogout = () => {
    signOut(auth);
  };

  const user = auth.currentUser;

  return React.createElement(
    "div",
    { style: { maxWidth: "600px", margin: "40px auto", padding: "20px", textAlign: "center" } },
    React.createElement("h1", null, "Welkom op het Dashboard!"),
    React.createElement("p", null, `Ingelogd als: ${user?.email || "Onbekend"}`),
    React.createElement(
      "button",
      {
        onClick: handleLogout,
        style: {
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px"
        }
      },
      "Uitloggen"
    )
  );
};