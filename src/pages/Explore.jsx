import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { AuthContext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import { Container, Card, Image } from "semantic-ui-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import SavePopup from "../components/SavePopup";
import "semantic-ui-css/semantic.min.css";
import { supabase } from "../AuthProvider";
import "./Explore.css";
import { BsBookmarkFill } from "react-icons/bs";

const ExplorePage = ({ following = false }) => {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [savedCollections, setSavedCollections] = useState([]);
  const [bookmarkPopup, setBookmarkPopup] = useState(null);
  const bookmarkRefs = useRef({});
  const pinterestGridRef = useRef(null);
  const imagesLoadedCount = useRef(0);
  const totalImagesCount = useRef(0);

  const resizeGridItems = () => {
    const grid = pinterestGridRef.current;
    if (!grid) return;

    const style = window.getComputedStyle(grid);
    const rowGap = parseInt(style.getPropertyValue("gap"));
    const rowHeight = parseInt(style.getPropertyValue("grid-auto-rows"));

    const items = grid.querySelectorAll(".pinterest-card");
    
    Array.from(items).forEach((item) => {
      const image = item.querySelector("img");
      if (!image || !image.complete) return;
      
      const content = item.querySelector(".image-wrapper");
      if (!content) return;
      
      const contentHeight = content.getBoundingClientRect().height;
      
      const rowSpan = Math.max(1, Math.floor((contentHeight + rowGap) / (rowHeight + rowGap)));
      
      item.style.gridRowEnd = `span ${rowSpan}`;
    });
  };

  useLayoutEffect(() => {
    const grid = pinterestGridRef.current;
    if (!grid || recipes.length === 0) return;

    const handleImageLoad = () => {
      imagesLoadedCount.current += 1;
      
      if (imagesLoadedCount.current === totalImagesCount.current || 
          imagesLoadedCount.current % 3 === 0) {
        requestAnimationFrame(resizeGridItems);
      }
    };

    const images = grid.querySelectorAll(".pinterest-image");
    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    return () => {
      const images = grid.querySelectorAll(".pinterest-image");
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [recipes]);

  useEffect(() => {
    fetchRecipes();
    fetchCollections();
  }, [session?.user?.id, following]);

  const fetchLikes = async (recipeId) => {
    const { data: count, error } = await supabase
      .from("recipe_unique_savers")
      .select("count")
      .eq("recipe_id", recipeId);

    if (error) throw error;

    return { count: count[0]?.count || 0, error };
  };

  const fetchRecipes = async () => {
    if (!session?.user?.id) {
      setRecipes([]);
      return;
    }

    let recipesQuery = supabase
      .from("Recipes")
      .select("id, title, image_url, cost, prep_time, cook_time, user_id");
    
    if (following) {
      const { data: followingData, error: followingError } = await supabase
        .from("Following")
        .select("following_id")
        .eq("follower_id", session.user.id);

      if (followingError) {
        console.error("Error fetching following users:", followingError.message);
        return;
      }
      
      const followingIds = followingData.map(item => item.following_id);
      
      if (followingIds.length === 0) {
        setRecipes([]);
        return;
      }
      
      recipesQuery = recipesQuery.in("user_id", followingIds);
    }
    
    const { data: recipesData, error: recipesError } = await recipesQuery;

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError.message);
      return;
    }

    const updatedRecipes = await Promise.all(
      recipesData.map(async (recipe) => {
        const { count: likesCount, error: likesError } = await fetchLikes(recipe.id);

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
      ? savedCollections.filter((c) => !(c.folder_id === collection.id && c.recipe_id === recipeId))
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
    }

    const { count, error: likesError } = await fetchLikes(recipeId);
    if (likesError) {
      console.error("Error fetching likes:", likesError.message);
    } else {
      const recipe = recipes.find((recipe) => recipe.id === recipeId);
      if (recipe) {
        recipe.likes = count;
        setRecipes([...recipes]);
      }
    }

  }

  return (
    <Container>
      <div className="pinterest-grid" ref={pinterestGridRef}>
        {recipes.map((recipe) => {
          return (<div key={recipe.id} className="pinterest-card">
            <div className="image-wrapper">
              <Image src={recipe.image_url} className="pinterest-image" onClick={() => navigate(`/recipe/${recipe.id}`)}/>
              <div 
                className="bookmark-icon" 
                ref={el => bookmarkRefs.current[recipe.id] = el} 
                onClick={(e) => toggleBookmark(recipe.id, e)}
              >
                {savedCollections.some(c => c.recipe_id === recipe.id) ? (
                  <FaBookmark size={20} color="white" />
                ) : (
                  <FaRegBookmark size={20} color="white" />
                )}
                {bookmarkPopup === recipe.id && ReactDOM.createPortal(
                  <SavePopup
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
                  />, 
                  document.body
                )}
              </div>


              <div className="overlay" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                <div className="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.username}</p>
                  <p>${recipe.cost}</p>
                  <p className="flex flex-row items-center gap-x-1"><BsBookmarkFill /> {recipe.likes}</p>
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