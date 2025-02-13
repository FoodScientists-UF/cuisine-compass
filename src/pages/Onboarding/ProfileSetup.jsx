import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const [biography, setBiography] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  const isFormComplete = biography.trim() !== "" && profilePic !== null;

  const navigate = useNavigate();

  // Handle profile picture selection
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  return (
    <div className="h-screen flex justify-center items-center flex-col gap-y-5">
      <span className="abhaya-libre-extrabold text-3xl">
        Tell us more about yourself!
      </span>

      <span className="abhaya-libre-regular text-lg">
        Add a profile picture
      </span>

      {/* Profile Picture*/}
      <label htmlFor="profilePicInput" className="relative">
        <div
          className="w-[300px] h-[300px] rounded-full bg-[#D9D9D9] flex justify-center items-center"
          style={{ backgroundImage: `url(${profilePic})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {!profilePic && (
            <img src="/camera.png" alt="Camera Icon" className="w-20 h-20" />
          )}
        </div>
        <input
          type="file"
          id="profilePicInput"
          onChange={handleProfilePicChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>

      {/* Biography Input */}
      <div className="mt-6 w-[600px]">
        <span className="abhaya-libre-regular text-lg text-left block">Biography</span>
        <textarea
          placeholder="Tell us about yourself..."
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          className="abhaya-libre-regular p-4 border-2 rounded-lg border-black w-full h-48 mt-2 text-left"
        />
      </div>

      {/* Continue Button */}
      <button
        onClick={() => navigate("/onboarding/dietary")}
        disabled={!isFormComplete}
        className={`abhaya-libre-extrabold p-2 rounded-xl text-lg w-96 ${isFormComplete
          ? "bg-[#D75600] text-white hover:opacity-80 transition"
          : "bg-[#D9D9D9] cursor-not-allowed text-[#7A7A7A]"
        }`}
      >
        Continue
      </button>

      {/* Skip For Now Button */}
      <button
        onClick={() => navigate("/onboarding/dietary")}
        className="abhaya-libre-extrabold text-[#7A7A7A]"
      >
        Skip for now
      </button>
    </div>
  );
}s