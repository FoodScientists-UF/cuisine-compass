import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Allergies() {
    const [selected, setSelected] = useState([]);
    const [customAllergies, setCustomAllergies] = useState([]); 
    const [customInput, setCustomInput] = useState("");
    const navigate = useNavigate();

    const allergies = [
        "Tree Nuts", "Soy", "Fish", "Fruit", "Peanuts", 
        "Shellfish", "Eggs", "Wheat", "Dairy"
    ];

    const toggleSelection = (allergy) => {
        setSelected(prev =>
            prev.includes(allergy) ? prev.filter(item => item !== allergy) : [...prev, allergy]
        );
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && customInput.trim() !== "") {
            setCustomAllergies([...customAllergies, customInput.trim()]); // Save the allergy
            setCustomInput(""); // Clear input field
        }
    };

    const removeCustomAllergy = (index) => {
        setCustomAllergies(customAllergies.filter((_, i) => i !== index));
    };

    return (
        
        <div className="h-screen flex flex-col justify-start items-center gap-y-3 pt-6">
            <span className="abhaya-libre-extrabold text-3xl">Allergies</span>
            <span className="abhaya-libre-regular text-lg">Select your allergies</span>

         {/* <button 
            onClick={() => navigate("/onboarding/dietary")} 
            className="absolute top-26 left-8 px-3 py-1 border abhaya-libre-regular border-gray-400 rounded-lg text-black text-sm hover:bg-gray-100 transition">
            Back
         </button> */}
            {/* Predefined Allergies */}
            <div className="flex flex-col gap-y-2 w-[400px]">
                {allergies.map((allergy) => (
                    <button
                        key={allergy}
                        onClick={() => toggleSelection(allergy)}
                        className={`shadow-lg rounded-2xl p-4 w-full text-center text-lg abhaya-libre-medium transition ${
                            selected.includes(allergy) ? "bg-[#D75600] text-white" : "bg-white text-black"
                        }`}
                    >
                        {allergy}
                    </button>
                ))}

            {/* Custom Allergies (User-Defined) */}
                {customAllergies.map((allergy, index) => (
                    <div 
                        key={index} 
                        className="relative text-center text-lg abhaya-libre-medium shadow-lg rounded-2xl p-4 w-full bg-[#D75600] text-white"
                    >
                        <span>{allergy}</span>
                        <button 
                            onClick={() => removeCustomAllergy(index)} 
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                ))}

            {/* Add Other Allergy Input Field */}
                <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleKeyPress} 
                    placeholder="Other"
                    className="shadow-lg rounded-2xl p-4 w-full text-center text-lg abhaya-libre-medium transition text-black border  mt-2"
                />
            </div>

            {/* Continue Button */}
            <button 
                onClick={() => navigate("/onboarding/goals")}
                className="mt-4 pb-2 p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg w-96 hover:opacity-80 transition">
                Continue
            </button>

            {/* Skip For Now Button */}
            <button
                onClick={() => navigate("/onboarding/goals")}
                className="abhaya-libre-extrabold text-[#7A7A7A] pb-12"
            >
                Skip for now
            </button>
        </div>
    );
}
