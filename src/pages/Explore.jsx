import React, { useState, useEffect } from "react";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import "semantic-ui-css/semantic.min.css";
import { supabase } from "../AuthProvider";
import "./Explore.css";

const ExplorePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("Recipes")
      .select("id, title, image_url, cost, prep_time, cook_time");

    if (error) {
      console.error("Error fetching recipes:", error.message);
    } else {
      setRecipes(data);
    }
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
                  <p>{recipe.id}</p>
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
                  {/* <p>❤ {recipe.likes}</p> */}
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
