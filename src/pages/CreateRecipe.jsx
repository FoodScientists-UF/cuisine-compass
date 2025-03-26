import React from "react";
import { FaTrash } from "react-icons/fa";
import { supabase, AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import {useContext, useState} from "react";
import ProfileNavBar from "../components/ProfileNavBar";
import "./Profile.css";

//Send everything to the backend
// Save the created recipe to the "Created" collection on Profile page. Redirect there? 
//Also will need to check if one has not been created already then create one. 
 const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     const title = e.target.title.value;

    //     const {data: upsertData} = await supabase
    //       .from("Recipes")
    //       .upsert({ id: data.user.id, title})
    //       .select(); 
    // Redirect to the profile page when clicked
    navigate("/about"); 
};

// Handle recipe picture selection
const handleRecipePicChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setRecipePic(URL.createObjectURL(selectedFile));
    }
  };

export default function CreateRecipe() {

    const [ingredients, setIngredients] = useState([{ id: 1, amount: "", unit: "", name: "" }]);
    const [steps, setSteps] = useState([{ id: 1, description: ""}]);
    const [recipePic, setRecipePic] = useState(null);

    // Add a new ingredient
    const addIngredient = () => {
        setIngredients((prevIngredients) => [
            ...prevIngredients,
            { id: prevIngredients.length + 1, amount: "", unit: "", name: "" }
        ]);
    };

    // Delete an ingredient by id
    const deleteIngredient = (id) => {
        setIngredients((prevIngredients) =>
            prevIngredients.filter((ingredient) => ingredient.id !== id)
        );
    };

    //Add a new step
    const addSteps = () => {
        setSteps((prevSteps) => [
            ...prevSteps,
            { id: prevSteps.length + 1, description: ""}
        ]);
    };

    //Dele†e a step by id
    const deleteStep = (id) => {
        setSteps((prevSteps) =>
            prevSteps.filter((step) => step.id !== id)
        );
    };

    return (
    
        <div className="mt-6 w-[600px] ml-auto">
            {/* Profile Nav Bar */}
            <ProfileNavBar />
            <div className="vl"></div>
            {/* Page heading. Might need to adjust position later */}
            <h1 className="abhaya-libre-medium text-2xl text-left mb-15"  style={{ color: '#D75600', marginLeft: '-405px' }}>Create a New Recipe</h1>

            {/* Inputting recipe title */}
           <span className="abhaya-libre-extrabold text-lg text-left block">
                Title
                <input
                 type="text"
                 placeholder="e.g. Butter Chicken"
                 name="recipeTitle"
                 className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-left"
                 style={{ borderColor: '#999999' , borderWidth: '1.5px'}}
                />
            </span>
            
            <div className="mt-6 flex space-x-4">
                {/* Inputting prep time in hours */}
                <span className="flex flex-col w-1/6 abhaya-libre-extrabold text-lg text-left block">
                    Prep Time
                    <input
                        type="text"
                        placeholder="hrs"
                        name="prepTimeHours"
                        className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-right"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px'}}
                    />
                </span>
                {/* Inputting prep time in minutes */}        
                <span className="flex flex-col w-1/6 mt-7">
                    <input
                        type="text"
                        placeholder="min"
                        name="prepTimeMinutes"
                        className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-right"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px'}}
                    />
                </span>

                {/* Inputting cook time in hours */}
                <span className="flex flex-col w-1/10 abhaya-libre-extrabold text-lg text-left block" style={{ paddingLeft: '10%'}}>
                    Cook Time
                    <input
                        type="text"
                        placeholder="hrs"
                        name="cookTimeHours"
                        className="abhaya-libre-regular p-3.5 rounded-lg h-12 mt-2 text-right"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px', width: '100px'}}
                    />
                </span>

                {/* Inputting cook time in minutes */}    
                <span className="flex flex-col w-1/6 mt-7 ml-4">
                    <input
                        type="text"
                        placeholder="min"
                        name="cookTimeMinutes"
                        className="abhaya-libre-regular p-3.5 rounded-lg h-12 mt-2 text-right"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px', width: '100px'}}
                    />
                </span>
            </div>

            {/* Inputting recipe description */}
            <span className="flex flex-col w-[600px] mt-6 abhaya-libre-extrabold text-lg text-left">
                    Description
                    <input
                        type="text"
                        placeholder="Tell us about your recipe!"
                        name="cookTimeHours"
                        className="abhaya-libre-regular p-3.5 rounded-lg mt-2 text-left h-32"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px', paddingBottom: '70px'}}
                    />
            </span>

            {/* Ingredients Section */}
            <div className="mt-6">
                <span className="abhaya-libre-extrabold text-lg text-left block">Ingredients</span>
                {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="flex space-x-4 mt-2 items-center">
                    {/* Numbering (1., 2., 3., ...) */}
                    <span className="flex items-center justify-center w-1/12">
                    <span>{index + 1}.</span>
                    </span>

                    {/* Amount input */}
                    <span className="flex flex-col">
                <input
                    type="text"
                    placeholder="amt"
                    value={ingredient.amount}
                    onChange={(e) => {
                    const updatedIngredients = [...ingredients];
                    updatedIngredients[index].amount = e.target.value;
                    setIngredients(updatedIngredients);
                    }}
                    className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-left"
                    style={{ borderColor: '#999999', borderWidth: '1.5px', width: '80px' }}
                />
                    </span>

                    {/* Unit input */}
                    <span className="flex flex-col">
                <input
                    type="text"
                    placeholder="unit"
                    value={ingredient.unit}
                    onChange={(e) => {
                    const updatedIngredients = [...ingredients];
                    updatedIngredients[index].unit = e.target.value;
                    setIngredients(updatedIngredients);
                    }}
                    className="abhaya-libre-regular p-3.5 rounded-lg h-12 mt-2 text-left"
                    style={{ borderColor: '#999999', borderWidth: '1.5px', width: '80px' }}
                />
                    </span>

                    {/* Name input */}
                    <span className="flex flex-col w-1/4">
                <input
                    type="text"
                    placeholder="name"
                    value={ingredient.name}
                    onChange={(e) => {
                    const updatedIngredients = [...ingredients];
                    updatedIngredients[index].name = e.target.value;
                    setIngredients(updatedIngredients);
                    }}
                    className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-left"
                    style={{ borderColor: '#999999', borderWidth: '1.5px', width: '150px' }}
                />
                    </span>

                    {/* Trash icon */}
                    <span className="flex items-center justify-center w-1/10">
                <FaTrash
                    onClick={() => deleteIngredient(ingredient.id)}
                    className="text-red-500 cursor-pointer"
                    size={20}
                    style={{ color: "#999999" }}
                />
                    </span>
                </div>
                ))}
            </div>

            {/* Add Ingredient Button */}
            <div className="mt-4 flex">
                <button
                    onClick={addIngredient}
                    className="abhaya-libre-extrabold px-4 py-3 rounded-3xl w-full ml-auto hover:scale-105 transition-all duration-200 ease-in-out"
                    style={{ backgroundColor: "#D75600", color: "#ffffff", width: '150px', marginLeft: 'auto', marginRight: '195px' }}
                >
                Add Ingredient
                </button>
            </div>

            {/* Steps Section */}
            <div className="mt-6">
                <span className="abhaya-libre-extrabold text-lg text-left block">Steps</span>
                {steps.map((step, index) => (
                <div key={step.id} className="flex space-x-4 mt-2 items-center">
                    {/* Numbering (1., 2., 3., ...) */}
                    <span className="flex items-center justify-center w-1/12">
                    <span>{index + 1}.</span>
                    </span>

                    {/* Description input */}
                    <span className="flex flex-col">
                        <input
                            type="text"
                            value={step.amount}
                            onChange={(e) => {
                            const updatedSteps = [...steps];
                            updatedSteps[index].amount = e.target.value;
                            setSteps(updatedSteps);
                            }}
                        className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-left"
                        style={{ borderColor: '#999999', borderWidth: '1.5px', width: '338px' }}
                        />
                    </span>

                    {/* Trash icon */}
                    <span className="flex items-center justify-center w-1/10">
                    <FaTrash
                        onClick={() => deleteStep(step.id)}
                        className="text-red-500 cursor-pointer"
                        size={20}
                        style={{ color: "#999999" }}
                    />
                     </span>
                </div>
                 ))}
            </div>

            {/* Add Step Button */}
            <div className="mt-4 flex">
                <button
                    onClick={addSteps}
                    className="abhaya-libre-extrabold px-4 py-3 rounded-3xl w-full ml-auto hover:scale-105 transition-all duration-200 ease-in-out"
                    style={{ backgroundColor: "#D75600", color: "#ffffff", width: '150px', marginLeft: 'auto', marginRight: '195px' }}
                >
                Add Step
                </button>
            </div>


            {/* Create button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSubmit} // On click, navigate to profile page
                    className="abhaya-libre-extrabold text-lg py-2 rounded-3xl mb-8 hover:scale-105 transition-all duration-200 ease-in-out"
                    style={{ backgroundColor: "#D3D3D3", color: "#ffffff", width: '150px', marginLeft: 'auto', marginRight: '195px', marginTop: '100px' }}
                
                    onMouseOver={(e) => e.target.style.backgroundColor = '#D75600'} // Hover color
                    onMouseOut={(e) => e.target.style.backgroundColor = '#D3D3D3'} // Back to default
                >
                    Create
                </button>
            </div>


        {/* Recipe Picture*/}
        <label htmlFor="recipePicInput" className="relative">
            <div
                className="w-[300px] h-[300px] rounded-3xl bg-[#D9D9D9] flex justify-center items-center absolute"
                style={{
                backgroundImage: `url(${recipePic})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                top: '-794px', // Move it up
                left: '-405px', // Move it to the left
                 }}
             >
            {!recipePic && (
                <img src="/camera.png" alt="Camera Icon" className="w-20 h-20" />
            )}
            </div>
            <input
                type="file"
                id="recipePicInput"
                onChange={handleRecipePicChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
      </label>

        {/*gray dividing line*/}
        <div className="w-[300px] border-t-2 border-gray-300 absolute top-[650px] left-[288px]"></div>

    </div>

    );
};
   