import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Error signing up: ", error.message);
    } else {
      alert("Sign up successful!");
      navigate("/onboarding");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col gap-y-10">
      <img src="/logo.png" alt="Logo" className="w-32 h-32" />
      <div className="flex justify-center flex-col items-center gap-y-3 text-[#D75600]">
        <h1 className="text-5xl bevan-regular">Cuisine Compass</h1>
        <span className="text-md abhaya-libre-extrabold">
          Follow the flavor
        </span>
      </div>
      <form
        className="flex flex-col space-y-5 w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl">Email</p>
          <input
            type="text"
            className="p-2 border-2 rounded-lg border-black"
            required
          />
        </span>
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl">Password</p>
          <input
            type="password"
            className="p-2 border-2 rounded-lg border-black"
            required
          />
        </span>
        <button
          type="submit"
          className="p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg hover:opacity-80 transition"
        >
          Sign Up
        </button>
        <span className="flex flex-row gap-x-1 justify-center">
          Already have an account?
          <a className="text-blue-500 underline" href="/login">
            Log In!
          </a>
        </span>
      </form>
    </div>
  );
}
