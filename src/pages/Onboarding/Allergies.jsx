import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Allergies() {
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();

    const allergies = [
        "Nuts",
        "Fruit",
        "Dairy",
        "Other"
    ];

    const toggleSelection = (allergy) => {
        if (selected.includes(allergy)) {
            setSelected(selected.filter(item => item !== allergy));
        } else {
            setSelected([...selected, allergy]);
        }
    }
    
    return (
        <div className="h-screen flex justify-center items-center flex-col gap-y-5">
            <span className="abhaya-libre-extrabold text-3xl">
                Allergies
            </span>

            <span className="abhaya-libre-regular text-lg">
                Select your allergies
            </span>

            
            {allergies.map((allergy) => (
                <button
                key={allergy}
                onClick={() => toggleSelection(allergy)}
                className={`shadow-lg rounded-2xl p-4 w-[400px] text-center text-lg abhaya-libre-medium transition ${
                    selected.includes(allergy)
                    ? "bg-[#D75600] text-white"
                    : "bg-white text-black"
                }`}
                >
                {allergy}
                </button>
            ))}
            
            {/* Continue Button */}
            <button 
                onClick={() => navigate("/onboarding/goals")}
                className="p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg w-96 hover:opacity-80 transition">
                    Continue
            </button>

            {/* Skip For Now Button */}
            <button
                onClick={() => navigate("/onboarding/goals")}
                className="abhaya-libre-extrabold text-[#7A7A7A]"
            >
                Skip for now
            </button>
        </div>
    );
}