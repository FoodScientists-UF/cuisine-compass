import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import img1 from "../layouts/images/Img1.jpg";
import { supabase, AuthContext } from "../AuthProvider";
import { FaRegHeart, FaChevronDown} from "react-icons/fa";
import SavePopup from "../components/SavePopup";
import WriteReviewPopup from "../components/WriteReviewPopup";

export default function ViewRecipe() {
  const { id } = useParams();
  const { session } = useContext(AuthContext);
  const [selectedSize, setSelectedSize] = useState("1X");
  const sizes = ["1X", "2X", "3X"];
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showWriteReviewPopup, setShowWriteReviewPopup] = useState(false);

  const [haveCooked, setHaveCooked] = useState(false);
  /* Saved collections contains all collections the recipe has been saved to
  allCollections contains all collections the user has created */
  const [savedCollections, setSavedCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([]);

  const [recipeTitle, setRecipeTitle] = useState("");
  const [likes, setLikes] = useState(0);
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
  const reviewsPerPage = 2;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

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
      const { data: recipeData, error: recipeError } = await supabase
        .from("Recipes")
        .select(
          "title, user_id, description, cook_time, prep_time, serving_size, image_url, ingredients, instructions"
        )
        .eq("id", id)
        .single();

      if (recipeError) throw recipeError;
      else {
        console.log("Recipe:", recipeData);
        if (recipeData.image_url) setImageUrl(recipeData.image_url);
        setRecipeTitle(recipeData.title);
        setDescription(recipeData.description);
        setCookTime(recipeData.cook_time);
        setPrepTime(recipeData.prep_time);
        setServingSize(recipeData.serving_size);
        setIngredients(recipeData.ingredients);
        setInstructions(recipeData.instructions);
      }

      const [
        likes,
        profile,
        cooked,
        savedCollections,
        allCollections,
        reviews,
        nutritional,
      ] = await Promise.all([
        supabase
          .from("Likes")
          .select("*", { count: "exact" })
          .eq("recipe_id", id),
        supabase
          .from("Profiles")
          .select("username")
          .eq("id", recipeData.user_id)
          .single(),
        session && session.user && session.user.id
          ? supabase
              .from("Cooked Recipes")
              .select("*")
              .eq("recipe_id", id)
              .eq("user_id", session.user.id)
              .limit(1)
              .maybeSingle()
          : null,
        session && session.user && session.user.id
          ? supabase
              .from("saved_recipes")
              .select(
                "folder_id, collection:saved_collections!saved_recipes_folder_id_fkey (name)"
              )
              .eq("user_id", session.user.id)
          : null,
        session && session.user && session.user.id
          ? supabase
              .from("saved_collections")
              .select("*")
              .eq("user_id", session.user.id)
          : null,
        supabase
          .from("Reviews")
          .select("review_text, created_at, Profiles(username)")
          .eq("recipe_id", id),
        supabase.from("Recipes").select("nutrition").eq("id", id),
      ]);

      if (likes.error) throw likes.error;
      else setLikes(likes.count);

      if (profile.error) throw profile.error;
      else setUsername(profile.data.username);

      if (cooked) {
        if (cooked.data && cooked.data.have_cooked != null)
          setHaveCooked(cooked.data.have_cooked);
        else if (cooked.error) throw cooked.error;
      }

      if (savedCollections) {
        if (savedCollections.error) throw savedCollections.error;
        else {
          console.log("Fetched saved collections data:", savedCollections.data);
          setSavedCollections(savedCollections.data);
        }
      }

      if (allCollections) {
        if (allCollections.error) throw allCollections.error;
        else {
          console.log("Fetched all collections data:", allCollections.data);
          setAllCollections(allCollections.data);
        }
      }

      if (reviews.error) throw reviews.error;
      else {
        console.log("Fetched reviews data:", reviews.data);
        reviews.data.forEach((review) => {
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
        setReviews(reviews.data);
      }

      if (nutritional.error) throw nutritional.error;
      else if (nutritional.data.nutrition) {
        console.log("Fetched nutrition data:", nutritional.data.nutrition);
        setNutritionalInformation(nutritional.data.nutrition);
      } else {
        const { data: dataFunc, error: errorFunc } =
          await supabase.functions.invoke("fetch-nutrition", {
            body: JSON.stringify({ ingredient: recipeData.title }),
          });

        if (errorFunc) throw errorFunc;
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
                field.includes("_g") ? "g" : field.includes("_mg") ? "mg" : ""
              }`,
            };
          });
        setNutritionalInformation(formattedNutrition);
      }
    }

    if (id) {
      fetchRecipe(id);
    }
  }, [id, session?.user?.id]);

  async function setCooked() {
    if (!session.user.id) return;
    setHaveCooked(!haveCooked);
    const { data, error } = await supabase
      .from("Cooked Recipes")
      .upsert({
        recipe_id: id,
        user_id: session.user.id,
        have_cooked: !haveCooked,
      })
      .select();
    if (error) {
      console.error("Error updating have_cooked:" + error.message);
    } else setHaveCooked(data[0].have_cooked);
  }

  async function handleSave(collection, checked) {
    if (!session || !session.user || !session.user.id) return;
    console.log("Saving to collection:", collection);
    console.log("Checked:", checked);
    setSavedCollections(
      checked
        ? savedCollections.filter((c) => c.folder_id != collection.id)
        : [
            ...savedCollections,
            {
              folder_id: collection.id,
              collection: {
                name: collection.name,
              },
            },
          ]
    );

    const { data, error } = checked
      ? await supabase
          .from("saved_recipes")
          .delete()
          .eq("recipe_id", id)
          .eq("folder_id", collection.id)
          .eq("user_id", session.user.id)
      : await supabase.from("saved_recipes").upsert({
          user_id: session.user.id,
          recipe_id: id,
          folder_id: collection.id,
        });

    if (error) {
      console.error("Error updating saved recipes:" + error.message);
    } else {
      console.log("Saved recipes updated:", data);
    }
  }

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
            <div className="relative">
              <button
                className="bg-[#D75600] flex flex-row items-center gap-x-2 text-white px-6 py-2 rounded-full text-lg abhaya-libre-semibold hover:opacity-80 transition"
                onClick={() => setShowSavePopup(!showSavePopup)}
              >
                Save <FaChevronDown />
              </button>
              {showSavePopup && (
                <SavePopup
                  collections={allCollections}
                  savedCollections={savedCollections}
                  callback={handleSave}
                />
              )}
            </div>
          </div>

          {/* Likes Button */}
          <div className="flex items-center space-x-2">
            <FaRegHeart className="text-3xl text-black" />
            <span className="text-3xl abhaya-libre-regular text-black-600">
              {likes}
            </span>
          </div>

          {/* Username */}
          <p className="text-2xl abhaya-libre-semibold text-black-600 mt-4">
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
        <div className="flex justify-between items-center w-full">
          <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
            Ingredients
          </h1>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={haveCooked}
              onChange={setCooked}
              className="sr-only peer"
            />
            <div className="w-16 h-10 bg-gray-300 rounded-full peer-checked:bg-[#D75600] peer transition-colors"></div>
            <div className="absolute left-1 top-1 w-8 h-8 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
            <div className="ml-3 text-2xl abhaya-libre-regular text-black-600">
              I cooked this recipe
            </div>
          </label>
        </div>

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
        <div className="flex justify-between items-center w-full mt-4">
          <h1 className="text-5xl abhaya-libre-extrabold text-black leading-none">
            Reviews
          </h1>
          {haveCooked && (
            <>
              <button 
                className="text-2xl abhaya-libre-semibold text-[#D75600] cursor-pointer hover:opacity-80 transition"
                onClick={() => setShowWriteReviewPopup(!showWriteReviewPopup)}>
                + Write a Review
              </button>
              {showWriteReviewPopup && (
                <WriteReviewPopup onClose={() => setShowWriteReviewPopup(false)} />
              )}
            </>
          )}
        </div>

        {/* Review Boxes */}
        <div className="w-full space-y-4">
          {/* No reviews message */}
          {!reviews.length && 
            <p className="text-2xl abhaya-libre-regular text-[#555555]">
              No reviews yet.
            </p>
          }
          {reviews
            .slice(
              (currentPage - 1) * reviewsPerPage,
              currentPage * reviewsPerPage
            )
            .map((review, index) => (
              <div key={index} className="w-full rounded-2xl bg-[#F3F3F3] p-4">
                <div className="w-full h-40 rounded-2xl bg-[#F3F3F3] mt-4 relative p-4">
                  <p className="text-2xl abhaya-libre-regular text-[#555555]">
                    "{review.review_text || "No review text"}"
                  </p>
                  <div className="absolute bottom-4 left-4 flex">
                    <img
                      src={img1}
                      alt="profile"
                      className="h-12 w-12 rounded-full object-cover"
                    />
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
        {reviews.length > reviewsPerPage && (
          <div className="flex flex-row space-x-4 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A] disabled:opacity-50"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-12 h-12 flex items-center justify-center rounded-full abhaya-libre-extrabold text-[#7A7A7A] 
                  ${
                    currentPage === index + 1
                      ? "border-2 border-black bg-[#F3F3F3]"
                      : "bg-[#F3F3F3]"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-12 h-12 flex items-center justify-center bg-[#F3F3F3] rounded-full abhaya-libre-extrabold text-[#7A7A7A] disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}

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
