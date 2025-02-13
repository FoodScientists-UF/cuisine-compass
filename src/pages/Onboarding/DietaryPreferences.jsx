import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DietaryPreferences() {
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();

    const preferences = [
        "Gluten Free",
        "Dairy Free",
        "Vegetarian",
        "Pescatarian",
        "Vegan",
        "Kosher",
        "Halal"
    ];

    const toggleSelection = (preference) => {
        if (selected.includes(preference)) {
            setSelected(selected.filter(item => item !== preference));
        } else {
            setSelected([...selected, preference]);
        }
    }
    
    return (
        <div className="h-screen flex justify-center items-center flex-col gap-y-5">
            <span className="abhaya-libre-extrabold text-3xl">
                Dietary Preferences
            </span>

            <span className="abhaya-libre-regular text-lg">
                Select your dietary preferences
            </span>

            
            {preferences.map((preference) => (
                <button
                key={preference}
                onClick={() => toggleSelection(preference)}
                className={`shadow-lg rounded-2xl p-4 w-[400px] text-center text-lg abhaya-libre-medium transition ${
                    selected.includes(preference)
                    ? "bg-[#D75600] text-white"
                    : "bg-white text-black"
                }`}
                >
                {preference}
                </button>
            ))}
            
            {/* Continue Button */}
            <button 
                onClick={() => navigate("/onboarding/allergies")}
                className="p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg w-96 hover:opacity-80 transition">
                    Continue
            </button>

            {/* Skip For Now Button */}
            <button
                onClick={() => navigate("/onboarding/allergies")}
                className="abhaya-libre-extrabold text-[#7A7A7A]"
            >
                Skip for now
            </button>
        </div>
    );
}