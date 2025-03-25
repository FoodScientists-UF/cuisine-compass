import React, { useState, useEffect } from "react";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import "semantic-ui-css/semantic.min.css";
import { supabase } from "../AuthProvider";
import "./Explore.css";

const ExplorePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [bookmarked, setBookmarked] = useState({});
  const [likes, setLikes] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data: recipesData, error: recipesError } = await supabase
      .from("Recipes")
      .select("id, title, image_url, cost, prep_time, cook_time, user_id");
  
    if (recipesError) {
      console.error("Error fetching recipes:", recipesError.message);
      return;
    }
  
    const updatedRecipes = await Promise.all(
      recipesData.map(async (recipe) => {

        const { count: likesCount, error: likesError } = await supabase
          .from("Likes")
          .select("*", { count: "exact" })
          .eq("recipe_id", recipe.id);
  
        if (likesError) {
          console.error(`Error fetching likes for recipe ${recipe.id}:`, likesError.message);
        }
  
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("username")
          .eq("id", recipe.user_id)
          .single();
  
        if (profileError) {
          console.error(`Error fetching username for user ${recipe.user_id}:`, profileError.message);
        }
  
        return {
          ...recipe,
          likes: likesCount || 0,
          username: profileData?.username || "Unknown",
        };
      })
    );
  
    setRecipes(updatedRecipes);
  };
  

  const toggleBookmark = (id) => {
    setBookmarked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Container>
      <div className="pinterest-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="pinterest-card">
            <div className="image-wrapper">
              <Image src={recipe.image_url} className="pinterest-image" />
              <div
                className="bookmark-icon"
                onClick={() => toggleBookmark(recipe.id)}
              >
                {bookmarked[recipe.id] ? (
                  <FaBookmark size={20} color="white" />
                ) : (
                  <FaRegBookmark size={20} color="white" />
                )}
              </div>
              <div className="overlay">
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.username}</p>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="tags">
                      {recipe.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p>${recipe.cost}</p>
                  <p>❤ {recipe.likes}</p>
                  <p>🕒 {recipe.prep_time+recipe.cook_time}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ExplorePage;
