import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../../AuthProvider";

export default function Goals() {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("User is not signed in");
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("Profiles")
      .upsert({
        id: session.user.id,
        goals: selected,
      })
      .select();
    if (error) {
      alert("Error updating goals: " + error.message);
      return;
    }
    alert("Goals updated successfully!");
    navigate("/onboarding/summary");
  };

  const goals = [
    "I want to gain weight",
    "I want to lose weight",
    "I want to build muscle",
    "I want to improve my diet",
    "I want to find new recipes",
    "I want to start tracking my nutrients",
  ];

  const toggleSelection = (goal) => {
    if (selected.includes(goal)) {
      setSelected(selected.filter((item) => item !== goal));
    } else {
      setSelected([...selected, goal]);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-start items-center gap-y-3 pt-6">
      <span className="abhaya-libre-extrabold text-3xl">Goals</span>
      <span className="abhaya-libre-regular text-lg">Select at least one</span>

      <button
        onClick={() => navigate("/onboarding/allergies")}
        className="absolute top-26 left-8 px-3 py-1 border abhaya-libre-regular border-gray-400 rounded-lg text-black text-sm hover:bg-gray-100 transition"
      >
        Back
      </button>
      <div className="flex flex-col gap-y-2 w-[400px]">
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleSelection(goal)}
            className={`shadow-lg rounded-2xl p-4 w-full text-center text-lg abhaya-libre-medium transition ${
              selected.includes(goal)
                ? "bg-[#D75600] text-white"
                : "bg-white text-black"
            }`}
          >
            {goal}
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={() => navigate("/onboarding/friends")}
        className="mt-4 pb-2 p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg w-96 hover:opacity-80 transition"
      >
        Continue
      </button>

      {/* Skip For Now Button */}
      <button
        onClick={() => navigate("/onboarding/friends")}
        className="abhaya-libre-extrabold text-[#7A7A7A] pb-12"
      >
        Skip for now
      </button>
    </div>
  );
}
