import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

export default function User() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        navigate("/login");
      }
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
