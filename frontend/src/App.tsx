import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";

export const App: React.FC = () => {
  // Door  toe te voegen achter useState accepteert setUser wél een User object
  const [user, setUser] = useState(null as any);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return React.createElement("div", { style: { textAlign: "center", marginTop: "50px" } }, "Laden...");
  }

  return user ? React.createElement(Dashboard) : React.createElement(Auth);
};

export default App;