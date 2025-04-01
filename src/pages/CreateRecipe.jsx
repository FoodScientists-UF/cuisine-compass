import React from "react";
import { FaTrash } from "react-icons/fa";
import { AiOutlineClose } from 'react-icons/ai';
import { supabase, AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import {useContext, useState} from "react";
import ProfileNavBar from "../components/ProfileNavBar";
import "./Profile.css";


export default function CreateRecipe() {
    const [recipeTitle, setRecipeTitle] = useState("");
    const [recipeDescription, setRecipeDescription] = useState("");
    const [prepTime, setPrepTime] = useState("");
    const [cookTime, setCookTime] = useState("");
    const [ingredients, setIngredients] = useState([{ id: 1, amount: "", unit: "", name: "" }]);
    const [steps, setSteps] = useState([{ id: 1, description: ""}]);
    const [tags, setTags] = useState([]);
    const { session } = useContext(AuthContext);

    const [recipePic, setRecipePic] = useState(null);

    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!recipeTitle.trim()){
            alert("Please enter a title for your recipe");
            return;
        }

        if(!recipeDescription.trim()){
            alert("Please enter a description for your recipe");
            return;
        }

        //Convert text time to an integer 
        const parsedPrepTime = parseInt(prepTime, 10);
        const parsedCookTime = parseInt(cookTime, 10);

        if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
         alert("Please enter a valid prep time for your recipe");
         return;
        }

        if (isNaN(parsedCookTime) || parsedCookTime <= 0) {
            alert("Please enter a valid cook time for your recipe");
            return;
        }

        if(!ingredients.length){
            alert("Please enter at least 1 ingredient for your recipe");
            return;
        }

        if(!steps.length){
            alert("Please enter at least 1 step for your recipe");
            return;
        }


        const recipeUUID = crypto.randomUUID();

        try {
            const { data, error } = await supabase
            //this is what needs to match with supabase
            .from("Recipes")
            .upsert([
            { 
            id: recipeUUID, // Generate a unique ID
            image_url: recipePic ? 'https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/recipe_pictures/' + recipeUUID : null, // Placeholder URL, replace with actual image URL after upload
            title: recipeTitle.trim(), 
            description: recipeDescription.trim(), 
            prep_time: parsedPrepTime,
            cook_time: parsedCookTime,
            //not sure if this is right with an array
            ingredients: ingredients,    
            instructions: steps,
            tags: tags,
            user_id: session.user.id, 
        }
            ])
            .select(); // Select to get the newly inserted/updated row
        
            if (error) {
                throw new Error(error.message);
            }
            
            alert("Recipe created successfully!");
            
        } catch (error) {
            alert("Error creating collection: " + error.message);
        }

        if (recipePic) {
            console.log("Uploading recipe picture:", recipePic);
            const { data, error } = await supabase.storage
            .from("recipe_pictures")
            .upload(`${recipeUUID}`, recipePic, {
                cacheControl: "3600",
                upsert: false,
            });
            if (error) {
                alert("Error uploading recipe picture: " + error.message);
                return;
            }
        }

            
            //how do I send the recipe to the Created collection?
        navigate("/profile"); 
    };

    // Handle recipe picture selection
    const handleRecipePicChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setRecipePic(selectedFile);
        }
    };

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
    
        <div className="mt-6 mx-auto">

            {/* Recipe Picture*/}
            <div className="flex absolute transform -translate-y-1/2 justify-center items-center -mt-[-200px] -ml-[405px]">
                <label htmlFor="recipePicInput" className="relative">
                <div
                className="w-[280px] h-[280px] rounded-3xl bg-[#D9D9D9] flex justify-center items-center overflow-hidden"
                style={{
                    backgroundImage: recipePic ? `url(${URL.createObjectURL(recipePic)})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    }}
                >
                {!recipePic && (
                    <img src="/camera.png" alt="Camera Icon" className="w-20 h-20" />
                )}
                <hr className="absolute bottom-[-40px] w-full border-t border-[#D9D9D9] " />
                </div>
                <input
                    type="file"
                    id="recipePicInput"
                    onChange={handleRecipePicChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                </label>

            {/* Tags Section */}
            <div className="ml-[-280px] mt-[500px] w-[300px] flex flex-col relative">
                <div className="flex items-center">
                    <span className="abhaya-libre-extrabold text-lg text-left">Tags</span>
                    <span className="ml-2 tooltip mt-[-2px]" data-tooltip="Example: Vegan, Gluten Free, etc.">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full border border-black text-black cursor-pointer text-sm">i</span>
                    </span>
                </div>

                {/* Input Field for Tags */}
                <input
                    type="text"
                    placeholder="Type and press Enter..."
                    className="abhaya-libre-regular p-3.5 rounded-lg w-[280px] h-12 mt-2 text-left"
                    style={{ borderColor: '#999999', borderWidth: '1.5px' }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                            setTags([...tags, e.target.value.trim()]);
                            e.target.value = "";
                        }
                    }}
                />
            
                {/* Tags */}
                <div className="absolute top-full left-0 w-full mt-2 flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-[#D75600] text-white px-3 py-1 rounded-full">
                            <span>{tag}</span>
                            <AiOutlineClose
                                onClick={() => setTags(tags.filter((_, i) => i !== index))}
                                className="ml-2 cursor-pointer"
                                size={14}
                            />
                        </div>
                    ))}
                </div>
            </div>


        </div>


            {/* Profile Nav Bar */}
            <ProfileNavBar />
            <div className="vl"></div>

            {/* Page heading */}
            <h1 className="abhaya-libre-medium text-2xl text-left mb-15"  style={{ color: '#D75600', marginLeft: '-405px' }}>Create a New Recipe</h1>


            {/* Inputting recipe title */}
           <span className="abhaya-libre-extrabold text-lg text-left block">
                Title
                <input
                 type="text"
                 placeholder="e.g. Butter Chicken"
                 name="recipeTitle"
                 value={recipeTitle}
                 onChange={(e) => setRecipeTitle(e.target.value)}
                 className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-left"
                 style={{ borderColor: '#999999' , borderWidth: '1.5px'}}
                />
            </span>


            {/* Inputting times */}
            <div className="mt-6 flex space-x-12">
                {/* Inputting prep time in minutes */}
                <span className="flex flex-col w-1/4 abhaya-libre-extrabold text-lg text-left block">
                <div className="flex items-center"> 
                    Prep Time
                    {/* Tooltip Icon (next to Prep Time title) */}
                        <span className="ml-2 tooltip" data-tooltip="Time required for preparing the recipe in minutes. Ex. 2 hours = 120 minutes">
                            <span className="w-5 h-5 mt-[-2px] flex items-center justify-center rounded-full border border-black text-black cursor-pointer text-sm" style={{lineHeight: '1'}}>i</span> {/* Tooltip trigger (the "i" icon) */}
                        </span>
                    </div>

                    <div className="flex items-end gap-2 mt-2">
                    <input
                        type="text"
                        name="prepTime"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-center"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px'}}
                    />
                    <span className="text-lg abhaya-libre-regular ml-2 whitespace-nowrap">minutes</span>
                    </div>
                </span>
       
               {/* Inputting cook time in minutes */}
               <span className="flex flex-col w-1/4 abhaya-libre-extrabold text-lg text-left block">
                    <div className="flex items-center"> 
                    Cook Time
                    {/* Tooltip Icon (next to Prep Time title) */}
                        <span className="ml-2 tooltip" data-tooltip="Time required for cooking the recipe in minutes. Ex. 2 hours = 120 minutes">
                            <span className="w-5 h-5 mt-[-2px] flex items-center justify-center rounded-full border border-black text-black cursor-pointer text-sm" style={{lineHeight: '1'}}>i</span> {/* Tooltip trigger (the "i" icon) */}
                        </span>
                    </div>
                    <div className="flex items-end gap-2 mt-2">
                    <input
                        type="text"
                        name="cookTime"
                        value={cookTime}
                        onChange={(e) => setCookTime(e.target.value)}
                        className="abhaya-libre-regular p-3.5 rounded-lg w-full h-12 mt-2 text-center"
                        style={{ borderColor: '#999999' , borderWidth: '1.5px'}}
                    />
                    <span className="text-lg abhaya-libre-regular ml-2 whitespace-nowrap">minutes</span>
                    </div>
                </span>
            </div>

            {/* Inputting recipe description */}
            <span className="flex flex-col w-[600px] mt-6 abhaya-libre-extrabold text-lg text-left">
                    Description
                    <input
                        type="text"
                        placeholder="Tell us about your recipe!"
                        name="cookTimeHours"
                        onChange={(e) => setRecipeDescription(e.target.value)}
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


    </div>

    );
};