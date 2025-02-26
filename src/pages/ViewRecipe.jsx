import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import img1 from "../layouts/images/Img1.jpg";
import { supabase } from "../AuthProvider";

export default function ViewRecipe() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("1X");
  const sizes = ["1X", "2X", "3X"];

  const [recipeTitle, setRecipeTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");

  useEffect(() => {
    async function fetchRecipe() {
      const { data, error } = await supabase
        .from("Recipes")
        .select("title, description, cook_time")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching recipe:" + error);
      } else {
        console.log("Fetched data:", data);
        setRecipeTitle(data.title);
        setDescription(data.description);
        setCookTime(data.cook_time);
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
          src={img1}
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
            @username
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
                15 min
              </p>
            </div>

            {/* Prep Time */}
            <div>
              <p className="text-3xl abhaya-libre-semibold text-black-600">
                Cook Time
              </p>
              <p className="text-3xl abhaya-libre-regular text-black-600">
                {cookTime}
              </p>
            </div>

            {/* Servings */}
            <div>
              <p className="text-3xl abhaya-libre-semibold text-black-600">
                Servings
              </p>
              <p className="text-3xl abhaya-libre-regular text-black-600">4</p>
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
          Original recipe (1X) yields 1 serving
        </h1>

        {/* List of Ingredients */}
        <ul style={{ listStyleType: "disc", paddingLeft: "2rem" }}>
          <li className="text-2xl abhaya-libre-regular text-black-600 mt-8">
            1 lb. spaghetti
          </li>
          <li className="text-2xl abhaya-libre-regular text-black-600">
            2 large eggs
          </li>
          <li className="text-2xl abhaya-libre-regular text-black-600">
            1 cup grated Pecorino Romano cheese
          </li>
          <li className="text-2xl abhaya-libre-regular text-black-600">
            1 cup grated Parmesan cheese
          </li>
          <li className="text-2xl abhaya-libre-regular text-black-600">
            Freshly ground black pepper
          </li>
          <li className="text-2xl abhaya-libre-regular text-black-600">
            8 slices bacon
          </li>
          <li className="text-2xl abhaya-libre-regular text-black-600">
            2 cloves garlic, minced
          </li>
        </ul>

        {/* Directions */}
        <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
          Directions
        </h1>
        <h1 className="text-3xl abhaya-libre-extrabold text-black leading-none">
          Step 1
        </h1>
        <p className="text-2xl abhaya-libre-regular text-black-600">
          Lorem ipsum odor amet, consectetuer adipiscing elit.
        </p>
        <h1 className="text-3xl abhaya-libre-extrabold text-black leading-none">
          Step 2
        </h1>
        <p className="text-2xl abhaya-libre-regular text-black-600">
          Tristique quis cubilia penatibus senectus dapibus placerat at sem.
        </p>

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
