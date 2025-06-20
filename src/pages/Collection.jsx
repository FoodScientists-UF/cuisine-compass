import React, { useContext, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { AuthContext } from "../AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark } from "react-icons/fa";
import "semantic-ui-css/semantic.min.css";
import { supabase } from "../AuthProvider";
import "./Collection.css";
import ProfileNavBar from "../components/ProfileNavBar";
import SavePopup from "../components/SavePopup";
import { formatTime } from "./Explore";


const Collections = () => {
    const { session } = useContext(AuthContext);
    const navigate = useNavigate();
    const { collectionId } = useParams();

    const [recipes, setRecipes] = useState([]);
    const [allCollections, setAllCollections] = useState([]);
    const [savedCollections, setSavedCollections] = useState([]);
    const [bookmarkPopup, setBookmarkPopup] = useState(null);
    const [collectionName, setCollectionName] = useState("");
    const bookmarkRefs = useRef({});
    const [ownerId, setOwnerId] = useState(null); 
    const isMyCollection = ownerId === session?.user?.id;  

  
    useEffect(() => {
        if (!collectionId || !session?.user?.id) return;
        fetchCollectionName();
        fetchCollections();
    }, [collectionId, session?.user?.id]);

    useEffect(() => {
        if (!collectionId || !ownerId) return;
        fetchRecipesForCollection();
    }, [collectionId, ownerId]);

    const isDefaultCollection = (id) => {
    return ["your-recipes", "likes", "cooked"].includes(id);
    };
      
      
    const fetchCollectionName = async () => {
        if (isDefaultCollection(collectionId)) {
          const nameMap = {
            "your-recipes": "Your Recipes",
            "cooked": "Cooked",
          };
          setCollectionName(nameMap[collectionId]);
          setOwnerId(session.user.id); 
          return;
        }
      
        const { data, error } = await supabase
          .from("saved_collections")
          .select("name, user_id")
          .eq("id", collectionId)
          .single();
      
        if (error) {
          console.error("Error fetching collection name:", error.message);
          return;
        }

        console.log("Collection data:", data);
      
        setCollectionName(data.name);
        setOwnerId(data.user_id);  
      };
      
  
      const fetchRecipesForCollection = async () => {
        let data = [];
        let error;
      
        if (collectionId === "your-recipes") {
          const result = await supabase
            .from("Recipes")
            .select("id, title, image_url, cost, prep_time, cook_time, tags, user_id, created_at")
            .eq("user_id", ownerId ?? session.user.id)
            .order("created_at", { ascending: false });
      
          data = result.data || [];
          error = result.error;
        } 
        else if (collectionId === "cooked") {
          const result = await supabase
            .from("Cooked Recipes")
            .select("recipe_id, Recipes:recipe_id (id, title, image_url, cost, prep_time, cook_time, tags, user_id)")
            .eq("user_id", ownerId ?? session.user.id)
            .eq("have_cooked", true);
      
          if (result.error) {
            console.error("Error fetching cooked recipes:", result.error.message);
            return;
          }
      
          data = (result.data || []).map((entry) => entry.Recipes);
        } 
        else {
          const result = await supabase
            .from("saved_recipes")
            .select("recipe_id, Recipes:recipe_id (id, title, image_url, cost, prep_time, cook_time, tags, user_id)")
            .eq("folder_id", collectionId)
            .eq("user_id", ownerId ?? session.user.id);
      
          if (result.error) {
            console.error("Error fetching saved recipes:", result.error.message);
            return;
          }
      
          data = (result.data || []).map((entry) => entry.Recipes);
        }
      
        if (error) {
          console.error("Error fetching recipes:", error.message);
          return;
        }
      
        if (!data || data.length === 0) {
          setRecipes([]);
          return;
        }
      
        const updatedData = await Promise.all(
          data.map(async (recipe) => {
            if (!recipe.user_id) return recipe;
      
            const { data: profileData, error: profileError } = await supabase
              .from("Profiles")
              .select("username")
              .eq("id", recipe.user_id)
              .single();
      
            if (profileError) {
              console.error(`Error fetching username for user ${recipe.user_id}:`, profileError.message);
              return {
                ...recipe,
                username: "Unknown",
              };
            }
      
            return {
              ...recipe,
              username: profileData?.username || "Unknown",
            };
          })
        );
      
        setRecipes(updatedData);
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
      <Container className="collection-pg-container">
        {isMyCollection && (
            <>
              <ProfileNavBar />
              <div className="vl"></div>
            </>
          )}

        {/* Back button */}
          <button
            onClick={() =>
              navigate(ownerId === session?.user?.id ? "/profile" : `/profile/${ownerId}`)
            }
            className="back">
            <img 
              src="/back_arrow.png" 
              alt="Back" 
              className="w-10 h-10 hover:opacity-60 transition"
            />
          </button>

        <div className="collection-header">
          <h3 className="collection-name">{collectionName}</h3>
          <p className="collection-recipe-count-collection">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          </p>     
        </div>
        {recipes.length === 0 ? (
        <div className="no-recipes-message">
          <p>You have no recipes in this collection. Go save some from your Explore or Following pages!</p>
        </div>
      ) : (
        <div className="pinterest-grid-coll"> 
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
                                  />, document.body)}
                </div>
                <div className="overlay" onClick={() => navigate(`/recipe/${recipe.id}`)}>
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
                    {recipe.cost && <p>${recipe.cost}</p>}
                    <p>🕒 {formatTime(recipe.prep_time+recipe.cook_time)}</p>
                  </div>
                </div>
              </div>
            </div>)
          })}
        </div>
        )}
      </Container>
    );
  };
  
  
  

export default Collections;
