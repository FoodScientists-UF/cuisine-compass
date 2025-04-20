import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider";
import { Dialog } from "@headlessui/react"; 
import "./Profile.css";

export default function ViewProfile() {
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const { userId } = useParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pic, setPic] = useState("");
  const [userName, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [userRecipes, setUserRecipes] = useState([]);

  const [recipeCount, setRecipeCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [collectionImage, setCollectionImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDropdownForId, setShowDropdownForId] = useState(null);
  

  const DEFAULT_IMAGE_URL = "https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/collection-picture//default.png";
  
  // Dropdown & Dialog States
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);


  // Toggle Dropdown
  const toggleCreateDropdown = () => {
    setShowCreateDropdown(!showCreateDropdown);
  };

  // Open & Close Dialog
  const openCollectionDialog = () => {
    setShowCreateDropdown(false); // Close dropdown before opening dialog
    setIsDialogOpen(true);
  };
  const closeCollectionDialog = () => {
    setIsDialogOpen(false);
    setCollectionName("");
    setIsPrivate(false);
  };
  
  useEffect(() => {
    if (!userId) return;
    console.log(userId);

    const fetchUserPicture = async () => {
      const { data, error } = await supabase.storage.from("profile_pictures").getPublicUrl(userId);
      if (error) {
        console.error("Error downloading profile picture:", error.message);
        return;
      }
      setPic(data.publicUrl);
    }


    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("Profiles")
        .select("first_name, last_name, avatar_url, username, biography")
        .eq("id", userId)
        .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }
        setFirstName(data.first_name);
      setLastName(data.last_name);
      //setPic(data.avatar_url);
      setUsername(data.username);
      setBio(data.biography);
    };
    const fetchRecipeCount = async () => {
         const { count: createdCount, error: createdError } = await supabase
          .from("Recipes")
          .select("*", { count: "exact" })
          .eq("user_id", userId);
    
        if (createdError) {
          console.error("Error fetching recipe count:", createdError.message);
          return;
        }
    
        setRecipeCount(createdCount); 
      };

      const fetchFollowersCount = async () => {
        const { count, error } = await supabase
          .from("Following") 
          .select("*", { count: "exact" })
          .eq("following_id", userId);
    
        if (error) {
          console.error("Error fetching followers count:", error.message);
          return;
        }
    
        setFollowersCount(count);
      };
    
      const fetchFollowingCount = async () => {
        const { count, error } = await supabase
          .from("Following") 
          .select("*", { count: "exact" })
          .eq("follower_id", userId); 
    
        if (error) {
          console.error("Error fetching following count:", error.message);
          return;
        }
    
        setFollowingCount(count);
      };

      const fetchUserRecipes = async () => {
        const { data, error } = await supabase
          .from("Recipes")
          .select("id, title, image_url, cost, prep_time, cook_time")
          .eq("user_id", userId);
      
        if (error) {
          console.error("Error fetching user recipes:", error.message);
          return;
        }
      
        setUserRecipes(data);
      };
    
    Promise.all([
      fetchUserPicture(),
      fetchRecipeCount(),
      fetchUserProfile(),
      fetchFollowersCount(),
      fetchFollowingCount(),
      fetchUserRecipes()
    ]);

  }, [userId, recipeCount, cookedRecipes.length, likedRecipes.length]);

  return (
    <div className="view-profile-container">
      {/* Back button */}
      <button
        onClick={() =>
          navigate("/explore")
        }
        className="back">
        <img 
          src="/back_arrow.png" 
          alt="Back" 
          className="w-10 h-10 hover:opacity-60 transition"
        />
      </button>

      {/* Main Content */}
      <div className="profile-content">
        <img src={pic} className="profile-pic" />
        <h1 className="name">{firstName} {lastName}</h1>
        <h1 className="username">@{userName}</h1>

        <p className="stats">
          <span>{recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}  </span>
        <span> {followersCount} {followersCount === 1 ? "follower" : "followers"}  </span>
          <span> {followingCount} following</span>
        </p>
        <div className = "follow-btn">
          <button>
            Follow
          </button>
        </div>
        <div className="bio"> 
          {bio}
        </div>
        
        {/* Collections Header & Create Button */}
        <div className="collections-header">
          <h2 className="collection-title">Recipes</h2>
        </div>

        <div className="pinterest-grid">
          {userRecipes.map((recipe) => (
            <div key={recipe.id} className="pinterest-card">
              <div className="image-wrapper" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                <img src={recipe.image_url} alt={recipe.title} className="pinterest-image" />
                <div className="overlay">
                  <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    <p>${recipe.cost}</p>
                    <p>🕒 {recipe.prep_time + recipe.cook_time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
