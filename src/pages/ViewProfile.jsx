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
  const [folders, setFolders] = useState([]);
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

      const fetchCollections = async () => {
        try {
          const { data: collections, error: collectionsError } = await supabase
            .from("saved_collections")
            .select("id, name, cover_img")
            .eq("user_id", userId);
      
          if (collectionsError) throw collectionsError;
      
          const { data: savedRecipes, error: savedRecipesError } = await supabase
            .from("saved_recipes")
            .select("folder_id, recipe_id")
            .eq("user_id", userId);
      
          if (savedRecipesError) throw savedRecipesError;
      
          const recipeCounts = {};
          const folderToRecipeId = {}; // for most recent recipe
      
          savedRecipes.forEach((row) => {
            const folderId = row.folder_id;
            recipeCounts[folderId] = (recipeCounts[folderId] || 0) + 1;
      
            // Only store the most recent for each folder
            if (!folderToRecipeId[folderId]) {
              folderToRecipeId[folderId] = row.recipe_id;
            }
          });
      
          const foldersWithCountsAndImages = await Promise.all(
            collections.map(async (folder) => {
              let finalImage = folder.cover_img;
      
              if (!finalImage) {
                const recentRecipeId = folderToRecipeId[folder.id];
                if (recentRecipeId) {
                  const { data: recipeData, error: recipeError } = await supabase
                    .from("Recipes")
                    .select("image_url")
                    .eq("id", recentRecipeId)
                    .single();
      
                  if (!recipeError && recipeData?.image_url) {
                    finalImage = recipeData.image_url;
                  }
                }
              }
      
              if (!finalImage) {
                finalImage = DEFAULT_IMAGE_URL;
              }
      
              return {
                ...folder,
                recipeCount: recipeCounts[folder.id] || 0,
                cover_img: finalImage,
              };
            })
          );
      
          setFolders(foldersWithCountsAndImages);
        } catch (err) {
          console.error("Error fetching collections:", err.message);
        }
      };
      


    const fetchCookedRecipes = async () => {
      const {data, error} = await supabase  
        .from("Cooked Recipes")
        .select("recipe_id")
        .eq("user_id", userId)
        .eq("have_cooked", true);

       if (error) {
        console.error("Error fetching cooked recipes:", error.message);
        return;
      }

      setCookedRecipes(data);
    };

    const fetchLikedRecipes = async () => {
      const {data, error} = await supabase  
        .from("Likes")
        .select("recipe_id")
        .eq("user_id", userId);

       if (error) {
        console.error("Error fetching liked recipes:", error.message);
        return;
      }

      setLikedRecipes(data);
    };

    Promise.all([
      fetchUserPicture(),
      fetchLikedRecipes(),
      fetchCookedRecipes(),
      fetchCollections(),
      fetchRecipeCount(),
      fetchUserProfile(),
      fetchFollowersCount(),
      fetchFollowingCount()
    ]);

  }, [userId, recipeCount, cookedRecipes.length, likedRecipes.length]);

  const DEFAULT_COLLECTIONS = [
    {
      id: "your-recipes",
      name: "Your Recipes",
      recipeCount: recipeCount,
      cover_img: DEFAULT_IMAGE_URL,
      isDefault: true,
    },
    {
      id: "cooked",
      name: "Cooked Recipes",
      recipeCount: cookedRecipes.length,
      cover_img: DEFAULT_IMAGE_URL,
      isDefault: true,
    },
  ];
  
  const collectionsToShow = [...DEFAULT_COLLECTIONS, ...folders];

  
  return (
    <div className="view-profile-container">
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
        <div className="bio"> 
          {bio}
        </div>
        
                {/* Collections Header & Create Button */}
                <div className="collections-header">
                  <h2 className="collection-title">Collections</h2>
                  <div className="collections-grid">
    
                </div>
              </div>
              <div className="collections-grid">
          {collectionsToShow.map((col) => (
            <div
              key={col.id}
              className="collection-card cursor-pointer"
              onClick={() => navigate(`/collection/${col.id}`)}
            >
              {/* 3‑dot menu only for user collections */}
        
              {/* Cover image */}
              <img
                src={col.cover_img}
                alt={col.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
        
              {/* Title + count */}
              <div className="collection-info">
                <h3 className="collection-title">{col.name}</h3>
                <p className="collection-recipe-count">
                  {col.recipeCount} {col.recipeCount === 1 ? "recipe" : "recipes"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
