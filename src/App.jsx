import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { supabase } from "./supabaseClient.js";

function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <>
      {user ? (
        <h1>Welcome {user.email}</h1>
      ) : (
        <a className="text-4xl underline text-blue-500" href="/login">
          Please log in{" "}
        </a>
      )}
    </>
  );
}

export default App;
