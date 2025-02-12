import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";

export default function User() {
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
    <div>
      {user ? <h1>Welcome {user.email}</h1> : <h1>Please log in</h1>}
      <div className="flex flex-row justify-center gap-x-5 text-xl">
        <a className="text-blue-500 underline" href="/signup">
          Sign up
        </a>
        <a className="text-blue-500 underline" href="/login">
          Log in
        </a>
      </div>
    </div>
  );
}
