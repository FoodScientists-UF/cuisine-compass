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

        {/* First Name and Last Name Inputs */}
        <div className="flex space-x-4">
          <span className="flex flex-col space-y-0.5 w-1/2">
            <p className="abhaya-libre-regular text-xl">First Name</p>
            <input
              type="text"
              placeholder="Johnny"
              className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
              required
            />
          </span>

          <span className="flex flex-col space-y-0.5 w-1/2">
            <p className="abhaya-libre-regular text-xl">Last Name</p>
            <input
              type="text"
              placeholder="Appleseed"
              className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
              required
            />
          </span>
        </div>

        {/* Email Input */}
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl">Email</p>
          <input
            type="text"
            placeholder="johnnyapple@gmail.com"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            required
          />
        </span>

        {/* Username Input */}
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl">Create Username</p>
          <input
            type="text"
            placeholder="johnnyappleseed234"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            required
          />
        </span>

        {/* Password Input */}
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl">Create Password</p>
          <input
            type="password"
            placeholder="Appleseed0!"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            required
          />
        </span>

        <button
          type="submit"
          className="p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg hover:opacity-80 transition"
        >
          Create Account
        </button>
        <span className="abhaya-libre-regular flex flex-row gap-x-1 justify-center">
          Already have an account?
          <a className="abhaya-libre-regular text-blue-500 underline" href="/login">
            Log In!
          </a>
        </span>
      </form>
    </div>
  );
}
