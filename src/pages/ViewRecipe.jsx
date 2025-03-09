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
  const [nutritionalInformation, setNutritionalInformation] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  
  
  useEffect(() => {
    if (imageUrl) return;
    if (recipeTitle) {
      async function fetchImage(title) {
        const { data: dataFunc, error: errorFunc } =
          await supabase.functions.invoke("fetch-image", {
            body: JSON.stringify({ title: title.toLowerCase() }),
          });
        if (errorFunc) {
          console.error(
            "Error fetching image from function: " + errorFunc.message
          );
          return;
        } else if (!dataFunc.error) {
          setImageUrl(dataFunc.image_url);
          const { data, error } = await supabase
            .from("Recipes")
            .update({ image_url: dataFunc.image_url })
            .eq("id", id);
          if (error) {
            console.error("Error updating image URL:" + error.message);
          }
          return;
        }
      }
      fetchImage(recipeTitle);
    }
  }, [recipeTitle]);

  useEffect(() => {
    async function fetchRecipe(id) {
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
          await supabase.from("Recipes").select("ingredients").eq("id", id);

        if (ingredientsError) {
          console.error("Error fetching ingredients:" + ingredientsError);
        } else {
          console.log(
            "Fetched ingredients data:",
            ingredientsData[0].ingredients
          );
          setIngredients(ingredientsData[0].ingredients);
        }

        {
          /* Fetch instructions */
        }
        const { data: instructionsData, error: instructionsError } =
          await supabase.from("Recipes").select("instructions").eq("id", id);

        if (ingredientsError) {
          console.error("Error fetching instructions:" + instructionsError);
        } else {
          console.log(
            "Fetched instructions data:",
            instructionsData[0].instructions
          );
          setInstructions(instructionsData[0].instructions);
        }

        {/* Fetch reviews */ }
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("Reviews")
          .select("review_text, created_at, Profiles(username)")
          .eq("recipe_id", id);
        if (reviewsError) {
          console.error("Error fetching reviews:" + reviewsError);
        } else {
          console.log("Fetched reviews data:", reviewsData);

          // format dates
          reviewsData.forEach((review) => {
            review.created_at = new Date(review.created_at).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );
            review.review_text = review.review_text || "No review text";
          });
          setReviews(reviewsData);
        }

        const { data: nutritionalData, error: nutritionalError } =
          await supabase.from("Recipes").select("nutrition").eq("id", id);

        if (nutritionalError) {
          console.error("Error fetching nutritional info:" + nutritionalError);
        }

        if (nutritionalData[0].nutrition) {
          console.log("Fetched nutrition data:", nutritionalData[0].nutrition);
          setNutritionalInformation(nutritionalData[0].nutrition);
        } else if (data.title) {
          const { data: dataFunc, error: errorFunc } =
            await supabase.functions.invoke("fetch-nutrition", {
              body: JSON.stringify({ ingredient: data.title }),
            });

          if (errorFunc) {
            console.error(
              "Error fetching nutritional info from function: " +
                errorFunc.message
            );
          } else if (!dataFunc.error) {
            // Format nutrition data for display
            const nutritionFields = [
              "calories",
              "serving_size_g",
              "fat_total_g",
              "fat_saturated_g",
              "protein_g",
              "sodium_mg",
              "potassium_mg",
              "cholesterol_mg",
              "carbohydrates_total_g",
              "fiber_g",
              "sugar_g",
            ];

            const formattedNutrition = nutritionFields
              .filter((field) => dataFunc[field] !== undefined)
              .map((field) => {
                const displayName = field
                  .replace(/_/g, " ")
                  .replace(/^./, (str) => str.toUpperCase())
                  .split(" ")[0];

                return {
                  nutrient: displayName,
                  amount: `${dataFunc[field]}${
                    field.includes("_g")
                      ? "g"
                      : field.includes("_mg")
                      ? "mg"
                      : ""
                  }`,
                };
              });
            console.log("Formatted Nutrition: ", formattedNutrition);
            setNutritionalInformation(formattedNutrition);
            const { data, error } = await supabase
              .from("Recipes")
              .update({ nutrition: formattedNutrition })
              .eq("id", id);
            if (error) {
              console.error("Error updating nutritional info:" + error.message);
            }
          }
        }
      }
    }

    if (id) {
      fetchRecipe(id);
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
            console.log("Ingredient", ingredient);
            const initialAmount = ingredient.amount;
            const amount =
              ingredient.amount * parseInt(selectedSize.substring(0, 1));
            const nonPluralUnits = ["oz", "tsp", "tbsp", "ml", "g", "kg", "lb"];

            let displayUnit = ingredient.unit || "";
            let displayName = ingredient.name;

            if (amount > 1) {
              if (!ingredient.unit) {
                // No unit, pluralize name
                displayName = displayName.endsWith("s")
                  ? displayName
                  : `${displayName}s`;
              } else if (!nonPluralUnits.includes(ingredient.unit)) {
                // Pluralize unit if applicable
                displayUnit = displayUnit.endsWith("s")
                  ? displayUnit
                  : `${displayUnit}s`;
              }
            }

            return amount > 0 ? (
              <li
                key={index}
                className="text-2xl abhaya-libre-regular text-black-600"
              >
                {amount} {displayUnit} {displayName}
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
              Step {index + 1}
            </h1>
            <p className="text-2xl abhaya-libre-regular text-black-600">
              {instruction}
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
        <div className="relative w-full h-80 overflow-hidden">
          {currentReviews.map((review, index) => (
            <div key={index} className="absolute inset-0 transition-opacity duration-300 ease-in-out">
              <div className="w-full h-60 rounded-2xl bg-[#F3F3F3] mt-4 relative p-4">
                <p className="text-2xl abhaya-libre-regular text-[#555555]">
                  "{review.review_text || 'No review text'}"
                </p>
                <div className="absolute bottom-4 left-4 flex">
                  <img src={img1} alt="profile" className="h-12 w-12 rounded-full object-cover" />
                  <p className="text-2xl abhaya-libre-regular text-[#555555] ml-4">
                    @{review.Profiles?.username || "Anonymous"}
                  </p>
                  <p className="text-2xl abhaya-libre-regular text-[#555555] ml-4">
                    {review.created_at || "No date available."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

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
        {nutritionalInformation.length > 0 && (
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
                {nutritionalInformation.map((info, index) => (
                  <tr key={index} className="border-b border-white">
                    <td className="px-6 py-4 border-r border-white">
                      {info.nutrient}
                    </td>
                    <td className="px-6 py-4">{info.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
