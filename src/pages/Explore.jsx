import React, { useContext, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import SavePopup from "../components/SavePopup";
import "semantic-ui-css/semantic.min.css";
import { supabase } from "../AuthProvider";
import "./Explore.css";

const ExplorePage = () => {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [savedCollections, setSavedCollections] = useState([]);
  const [bookmarkPopup, setBookmarkPopup] = useState(null);
  const bookmarkRefs = useRef({});

  useEffect(() => {
    fetchRecipes();
    fetchCollections();
  }, [session?.user?.id]);

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

  const createCollection = async (newCollection) => {
    setAllCollections((prev) => [...prev, newCollection]);
  };

  const fetchCollections = async () => {
    if (!session?.user?.id) return;
    const [savedCollections, allCollections] = await Promise.all([
      session && session.user && session.user.id
      ? supabase
          .from("saved_recipes")
          .select(
            "recipe_id, folder_id, collection:saved_collections!saved_recipes_folder_id_fkey (name)"
          )
          .eq("user_id", session.user.id)
      : null,
    session && session.user && session.user.id
      ? supabase
          .from("saved_collections")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("")
      : null,]);

      if (savedCollections.error) throw savedCollections.error; 
      setSavedCollections(savedCollections.data);
      if (allCollections.error) throw allCollections.error;
      setAllCollections(allCollections.data);
  }

  const toggleBookmark = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    bookmarkPopup === id ? setBookmarkPopup(null) : setBookmarkPopup(id);
  };

  async function handleSave(collection, checked, recipeId) {
    if (!session?.user?.id) return;
    console.log("Saving to collection:", collection);
    console.log("Checked:", checked);
    setSavedCollections(
      checked
        ? savedCollections.filter((c) => c.folder_id !== collection.id)
        : [
            ...savedCollections,
            {
              folder_id: collection.id,
              recipe_id: recipeId,
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
          .eq("recipe_id", recipeId)
          .eq("folder_id", collection.id)
          .eq("user_id", session.user.id)
      : await supabase.from("saved_recipes").upsert({
          user_id: session.user.id,
          recipe_id: recipeId,
          folder_id: collection.id,
        });

    if (error) {
      console.error("Error updating saved recipes:" + error.message);
    } else {
      console.log("Saved recipes updated:", data);
    }
  }

  return (
    <Container>
      <div className="pinterest-grid">
        {recipes.map((recipe) => {
          // Instead of creating a new ref for each recipe, use the refs map
          return (<div key={recipe.id} className="pinterest-card">
            <div className="image-wrapper">
              <Image src={recipe.image_url} className="pinterest-image" onClick={() => navigate(`/recipe/${recipe.id}`)}/>
              <div 
                className="bookmark-icon" 
                ref={el => bookmarkRefs.current[recipe.id] = el}
              >
                <FaRegBookmark size={20} color="white" onClick={(e) => toggleBookmark(recipe.id, e)}/>
                {bookmarkPopup === recipe.id && ReactDOM.createPortal(<SavePopup
                                  collections={allCollections}
                                  savedCollections={savedCollections.filter(c => c.recipe_id === recipe.id)}
                                  recipeId={recipe.id}
                                  callback={handleSave}
                                  style={{ 
                                    position: "absolute", 
                                    top: bookmarkRefs.current[recipe.id]?.getBoundingClientRect().bottom + window.scrollY, 
                                    left: (bookmarkRefs.current[recipe.id]?.getBoundingClientRect().left + window.scrollX) - 200
                                  }}
                                  onCollectionCreated={createCollection}
                                />, document.body)}
              </div>
              <div className="overlay" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.username}</p>
                  <p>${recipe.cost}</p>
                  <p>❤ {recipe.likes}</p>
                  <p>🕒 {recipe.prep_time + recipe.cook_time}</p>
                </div>
              </div>
            </div>
          </div>)
        })}
      </div>
    </Container>
  );
};

export default ExplorePage;