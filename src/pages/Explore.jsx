import React, { useState, useEffect } from "react";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import SavePopup from "../components/SavePopup";
import "semantic-ui-css/semantic.min.css";
import { supabase } from "../AuthProvider";
import "./Explore.css";

const ExplorePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [bookmarked, setBookmarked] = useState({});
  const [showSavePopup, setShowSavePopup] = useState({});
  const [savedCollections, setSavedCollections] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
      } else {
        setSession(data.session);
      }
    };
  
    fetchSession();
    fetchRecipes();
  }, []);
  
  useEffect(() => {
    if (session && session.user) {
      fetchCollections();
    }
  }, [session]);

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

  const createCollection = async (collectionName) => {
    if (!session || !session.user) return;
  
    const { data, error } = await supabase
      .from("saved_collections")
      .insert([{ name: collectionName, user_id: session.user.id }]);
  
    if (error) {
      console.error("Error creating collection:", error.message);
      return;
    }
  
    fetchCollections();
  };

  const fetchCollections = async () => {
    if (!session || !session.user) return;
    const { data, error } = await supabase
      .from("saved_collections")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error fetching collections:", error.message);
    } else {
      setAllCollections(data);
    }
  };

  const toggleSavePopup = (id) => {
    setShowSavePopup((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async (collection, isSaved, recipeId) => {
    if (!recipeId) {
      console.error("Error: recipeId is undefined or null!");
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from("saved_recipes")
        .insert([{ recipe_id: recipeId, folder_id: collection.id }]);
  
      if (error) {
        throw error;
      }
  
      console.log("Recipe saved successfully:", data);
      setShowSavePopup((prev) => ({ ...prev, [recipeId]: false }));
    } catch (err) {
      console.error("Error saving recipe:", err.message);
    }
  };

  const handleCollectionCreated = (newCollection) => {
    setAllCollections((prevCollections) => [...prevCollections, newCollection]);
  };

  return (
    <Container>
      <div className="pinterest-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="pinterest-card">
            <div className="image-wrapper">
              <Image src={recipe.image_url} className="pinterest-image" />
              <div className="bookmark-icon" onClick={() => toggleSavePopup(recipe.id)}>
    {showSavePopup[recipe.id] && (
        <SavePopup 
            collections={allCollections}
            savedCollections={savedCollections}
            callback={(collection, isSaved) => handleSave(collection, isSaved, recipe.id)}
            session={session}
            onCollectionCreated={handleCollectionCreated} 
        />
    )}

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
                  <p>${recipe.cost}</p>
                  <p>❤ {recipe.likes}</p>
                  <p>🕒 {recipe.prep_time + recipe.cook_time}</p>
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