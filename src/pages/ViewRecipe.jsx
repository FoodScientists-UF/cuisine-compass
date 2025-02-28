import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import img1 from "../layouts/images/Img1.jpg";
import { supabase } from "../AuthProvider";

export default function ViewRecipe() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("1X");
  const sizes = ["1X", "2X", "3X"];

  const [recipeTitle, setRecipeTitle] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (imageUrl) return;
    if (recipeTitle) {
      async function fetchImage(title) {
        const searchUrl = new URL("https://api.unsplash.com/search/photos");
        searchUrl.search = new URLSearchParams({
          client_id: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
          page: 1,
          per_page: 1,
          query: title.toLowerCase(),
        });
        console.log(searchUrl);
        const response = await fetch(searchUrl);
        const data = await response.json();
        console.log(data);
        const imageResult = Object.values(data.results)[0];
        if (imageResult && imageResult.urls && imageResult.urls.full) {
          setImageUrl(imageResult.urls.full);
          const { data, error } = await supabase
            .from("Recipes")
            .update({ image_url: imageResult.urls.full })
            .eq("id", id);
          if (error) {
            console.error("Error updating image URL:" + error.message);
          }
        }
      }
      fetchImage(recipeTitle);
    }
  }, [recipeTitle]);

  useEffect(() => {
    async function fetchRecipe() {
      const { data, error } = await supabase
        .from("Recipes")
        .select(
          "title, user_id, description, cook_time, prep_time, serving_size, image_url"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching recipe:" + error);
      } else {
        console.log("Fetched data:", data);
        if (data.image_url) setImageUrl(data.image_url);
        setRecipeTitle(data.title);
        setDescription(data.description);
        setCookTime(data.cook_time);
        setPrepTime(data.prep_time);
        setServingSize(data.serving_size);

        {
          /* Fetch username */
        }
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("username")
          .eq("id", data.user_id)
          .single();

        if (profileError) {
          console.error("Error fetching username:" + profileError.message);
        } else {
          setUsername(profileData.username);
        }

        {
          /* Fetch ingredients */
        }
        const { data: ingredientsData, error: ingredientsError } =
          await supabase
            .from("Ingredients")
            .select("name, unit, amount")
            .eq("recipe_id", id);

        if (ingredientsError) {
          console.error("Error fetching ingredients:" + ingredientsError);
        } else {
          console.log("Fetched data:", ingredientsData);
          setIngredients(ingredientsData);
        }

        {
          /* Fetch instructions */
        }
        const { data: instructionsData, error: instructionsError } =
          await supabase
            .from("Instructions")
            .select("step_number, content")
            .eq("recipe_id", id);

        if (ingredientsError) {
          console.error("Error fetching instructions:" + instructionsError);
        } else {
          console.log("Fetched data:", instructionsData);
          setInstructions(instructionsData);
        }
      }
    }

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col p-10 space-y-8 py-20">
      {/* Page Wrapper */}
      <div className="w-full flex flex-row items-start space-x-8">
        {/* Recipe Image */}
        <img
          src={imageUrl}
          alt="recipe"
          className="h-[600px] w-[500px] rounded-2xl object-cover"
        />

        {/* Recipe Info (to the right of the image) */}
        <div className="flex flex-col w-full">
          {/* Recipe Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
              {recipeTitle}
            </h1>
            <button className="bg-[#D75600] text-white px-6 py-2 rounded-full text-lg abhaya-libre-semibold hover:opacity-80 transition">
              Save
            </button>
          </div>

          {/* Username */}
          <p className="text-2xl abhaya-libre-semibold text-black-600">
            @{username}
          </p>

          {/* Recipe Description */}
          <p className="text-3xl abhaya-libre-regular text-black-600 mt-8">
            {description || "No description available"}
          </p>

          {/* Cooking Details */}
          <div className="flex flex-row mt-8 space-x-16">
            {/* Cook Time */}
            <div>
              <p className="text-3xl abhaya-libre-semibold text-black-600">
                Prep Time
              </p>
              <p className="text-3xl abhaya-libre-regular text-black-600">
                {prepTime} min
              </p>
            </div>

            {/* Prep Time */}
            <div>
              <p className="text-3xl abhaya-libre-semibold text-black-600">
                Cook Time
              </p>
              <p className="text-3xl abhaya-libre-regular text-black-600">
                {cookTime} min
              </p>
            </div>

            {/* Servings */}
            <div>
              <p className="text-3xl abhaya-libre-semibold text-black-600">
                Servings
              </p>
              <p className="text-3xl abhaya-libre-regular text-black-600">
                {servingSize}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <hr className="w-full border-t-2 border-gray-300" />

      {/* Additional Recipe Content (Below the divider) */}
      <div className="w-full">
        {/* Ingredients */}
        <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
          Ingredients
        </h1>

        {/* Serving Size */}
        <div className="flex border-2 border-[#D75600] rounded-full overflow-hidden w-64">
          {sizes.map((size, index) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`flex-1 ${
                selectedSize === size
                  ? "bg-[#D75600] text-white"
                  : "bg-white text-[#D75600]"
              } abhaya-libre-extrabold text-lg text-center p-4 ${
                index !== 0 && "border-l border-[#D75600]"
              } focus:outline-none`}
            >
              {size}
            </button>
          ))}
        </div>

        <h1 className="text-xl abhaya-libre-extrabold text-[#7A7A7A] leading-none">
          This will yield {servingSize * parseInt(selectedSize.substring(0, 1))}{" "}
          {servingSize > 1 ? "servings" : "serving"}
        </h1>

        {/* List of Ingredients */}
        <ul style={{ listStyleType: "disc", paddingLeft: "2rem" }}>
          {ingredients.map((ingredient, index) => {
            const amount =
              ingredient.amount * parseInt(selectedSize.substring(0, 1));

            return amount > 0 ? (
              <li
                key={index}
                className="text-2xl abhaya-libre-regular text-black-600"
              >
                {amount} {ingredient.unit} {ingredient.name}
              </li>
            ) : (
              <li
                key={index}
                className="text-2xl abhaya-libre-regular text-black-600"
              >
                {ingredient.name}
              </li>
            );
          })}
        </ul>

        {/* Directions */}
        <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
          Directions
        </h1>

        {/* List of Instructions */}
        {instructions.map((instruction, index) => (
          <div key={index} className="mb-6">
            <h1 className="text-3xl abhaya-libre-extrabold text-black leading-none">
              Step {instruction.step_number}
            </h1>
            <p className="text-2xl abhaya-libre-regular text-black-600">
              {instruction.content}
            </p>
          </div>
        ))}

        {/* Divider Line */}
        <hr className="w-full border-t-2 border-gray-300 mt-4" />

        {/* Reviews */}
        <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
          Reviews
        </h1>

        {/* Review Boxes */}
        <div className="w-full h-60 rounded-2xl bg-[#F3F3F3] mt-4 relative p-4">
          {/* Comment */}
          <p className="text-2xl abhaya-libre-regular text-[#555555]">
            "Lorem ipsum odor amet, consectetuer adipiscing elit."
          </p>

          {/* Fixed Bottom Section */}
          <div className="absolute bottom-4 left-4 flex">
            <img
              src={img1}
              alt="profile"
              className="h-12 w-12 rounded-full object-cover"
            />
            <p className="text-2xl abhaya-libre-regular text-[#555555] ml-4">
              @username
            </p>
            <p className="text-2xl abhaya-libre-regular text-[#555555] ml-4">
              Feb 23, 2025
            </p>
          </div>
        </div>

        <div className="w-full h-60 rounded-2xl bg-[#F3F3F3] mt-4"></div>
        <div className="w-full h-60 rounded-2xl bg-[#F3F3F3] mt-4"></div>
        <div className="w-full h-60 rounded-2xl bg-[#F3F3F3] mt-4"></div>

        {/* Pages */}
        <div className="flex flex-row space-x-4 mt-4">
          <button className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A]">
            ←
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A]">
            1
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A]">
            2
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A]">
            3
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A]">
            4
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A]">
            →
          </button>
        </div>

        {/* Divider Line */}
        <hr className="w-full border-t-2 border-gray-300 mt-4" />

        {/* Nutritional Info */}
        <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
          Nutritional Information
        </h1>

        {/* Nutritional Info Table */}
        {/* https://flowbite.com/docs/components/tables/ */}
        <div className="relative overflow-x-auto flex">
          <table className="w-[500px] text-lg text-left abhaya-libre-extrabold text-white bg-[#D75600] rounded-2xl overflow-hidden">
            <thead className="text-lg uppercase bg-[#bf4c00]">
              <tr>
                <th scope="col" className="px-6 py-3 border-r border-white">
                  Nutrient
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white">
                <td className="px-6 py-4 border-r border-white">Calories</td>
                <td className="px-6 py-4">500g</td>
              </tr>
              <tr className="border-b border-white">
                <td className="px-6 py-4 border-r border-white">Protein</td>
                <td className="px-6 py-4">20g</td>
              </tr>
              <tr className="border-b border-white">
                <td className="px-6 py-4 border-r border-white">Carbs</td>
                <td className="px-6 py-4">60g</td>
              </tr>
              <tr>
                <td className="px-6 py-4 border-r border-white">Fat</td>
                <td className="px-6 py-4">15g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
