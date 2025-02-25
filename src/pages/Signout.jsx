import { supabase } from "../AuthProvider";
import { useState, useEffect } from "react";

export default function Signout() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage(`Error signing out: ${error.message}`);
      } else {
        setMessage("Sign out successful!");
      }
    };

    signOut();
  }, []);

  return <div>{message}</div>;
}
