import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider";
import { Dialog } from "@headlessui/react"; 
import { BsThreeDotsVertical } from "react-icons/bs";
import ProfileNavBar from "../components/ProfileNavBar";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);

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


  //Diaglog for Edit Profile
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(firstName);
  const [editedLastName, setEditedLastName] = useState(lastName);
  const [editedUserName, setEditedUserName] = useState(userName);
  const [editedBio, setEditedBio] = useState(bio);


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

  const handleCreateCollection = async (e) => {
    e.preventDefault(); // Prevent default form submission (if applicable)
  
    let uploadedImageUrl = null;
    if (imageFile) {
      const fileName = `${session.user.id}-${crypto.randomUUID()}`;
      const { data: imageData, error: uploadError } = await supabase.storage
        .from("collection-picture")
        .upload(fileName, imageFile, { upsert: true });
    
      if (uploadError) {
        alert("Error uploading collection image: " + uploadError.message);
        return;
      }
    
      const { data: urlData } = supabase.storage
        .from("collection-picture")
        .getPublicUrl(fileName);
    
      uploadedImageUrl = urlData.publicUrl;
    }
    
    if (!collectionName.trim()) {
      alert("Please enter a collection name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("saved_collections")
        .upsert([
          { 
            id: crypto.randomUUID(),
            name: collectionName.trim(), 
            user_id: session.user.id, 
            is_private: isPrivate ,
            cover_img: uploadedImageUrl
          }
        ])
        .select(); // Select to get the newly inserted/updated row
  
      if (error) {
        throw new Error(error.message);
      }
  
      alert("Collection created successfully!");

      
      const newCollection = { ...data[0], recipeCount: 0 };

      // Update UI with the new collection
      setFolders((prevFolders) => [...prevFolders, newCollection]);
  
      // Close the dialog
      closeCollectionDialog();
    } catch (error) {
      alert("Error creating collection: " + error.message);
    }
  };
  
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

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
         const userId = session.user.id;
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
            .eq("user_id", session.user.id);
      
          if (collectionsError) throw collectionsError;
      
          const { data: savedRecipes, error: savedRecipesError } = await supabase
            .from("saved_recipes")
            .select("folder_id, recipe_id")
            .eq("user_id", session.user.id);
      
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
        .eq("user_id", session.user.id)
        .eq("have_cooked", true);

       if (error) {
        console.error("Error fetching cooked recipes:", error.message);
        return;
      }

      setCookedRecipes(data);
    };

    Promise.all([
      fetchUserPicture(),
      fetchCookedRecipes(),
      fetchCollections(),
      fetchRecipeCount(),
      fetchUserProfile(),
      fetchFollowersCount(),
      fetchFollowingCount()
    ]);
    

  }, [session?.user?.id, recipeCount, cookedRecipes.length]);

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
    <div className="profile-container">
      {/* Sidebar */}
      <ProfileNavBar />
      <div className="vl"></div>
      <div className="edit-profile-wrapper">
      <button
        className="edit-profile-btn"
        onClick={() => {
          setEditedFirstName(firstName);
          setEditedLastName(lastName);
          setEditedUserName(userName);
          setEditedBio(bio);
          setShowEditDialog(true);
        }}
      >
        Edit Profile
      </button>
    </div>

        
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
   
          <div className="create-container">
            <button onClick={toggleCreateDropdown} className="create-btn">+ Create</button>

            {showCreateDropdown && (
              <div className="create-dropdown">
                <p className="create-option" onClick={() => navigate("/createrecipe")}>Recipe</p>
                <p className="create-option" onClick={openCollectionDialog}>Collection</p>
              </div>
            )}
          </div>
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
      {!col.isDefault && (
        <div className="collection-options">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdownForId((prev) => (prev === col.id ? null : col.id));
            }}
          >
            <BsThreeDotsVertical />
          </button>

          {showDropdownForId === col.id && (
            <div className="collection-actions-dropdown">
              <div
                className="dropdown-option"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCollection(col);
                  setCollectionName(col.name);
                  setCollectionImage(col.cover_img || null);
                  setIsPrivate(col.is_private);
                  setShowDropdownForId(null);
                  setIsDialogOpen(true);
                }}
              >
                Edit
              </div>
              <div
                className="dropdown-option"
                onClick={async (e) => {
                  e.stopPropagation();
                  const { error } = await supabase
                    .from("saved_collections")
                    .delete()
                    .eq("id", col.id);
                  if (!error) {
                    setFolders((prev) => prev.filter((f) => f.id !== col.id));
                  }
                  setShowDropdownForId(null);
                }}
              >
                Delete
              </div>
            </div>
          )}
        </div>
      )}

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

      <Dialog open={isDialogOpen} onClose={closeCollectionDialog} className="dialog-overlay">
        <div className="dialog-container">
          <Dialog.Panel className="dialog-box">              
            <button className="close-btn" onClick={closeCollectionDialog}>×</button>
            <Dialog.Title className="dialog-title">Create Collection</Dialog.Title>

            <label className="dialog-title">Title</label>
          
            <input 
              type="text" 
              placeholder="Name your collection"
              className="dialog-input"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
            ...
            <button className="dialog-create-btn" onClick={handleCreateCollection}>Create</button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={isDialogOpen} onClose={closeCollectionDialog} className="dialog-overlay">
        <div className="dialog-container">
          <Dialog.Panel className="dialog-box">              
            <button className="close-btn" onClick={closeCollectionDialog}>×</button>
            <Dialog.Title className="dialog-title">Create Collection</Dialog.Title>

            <label className="dialog-title">Title</label>
           
            <input 
              type="text" 
              placeholder="Name your collection"
              className="dialog-input"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
            <label className="dialog-label-two">Keep this collection between us?</label>
            <div className="dialog-private">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="privateCollection"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
                className="w-4 h-4 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="dialog-label">I want this collection to be private</span>
            </label>
          </div>

          {/* Upload Image Section */}
              <label htmlFor="collectionImageInput" className="upload-placeholder cursor-pointer">
                {collectionImage ? (
                  <img
                    src={collectionImage}
                    alt="Collection Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                    <span className="text-center text-sm font-semibold">
                      Upload a cover image (optional)
                    </span>
                  </div>
                )}
                <input
                  id="collectionImageInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setCollectionImage(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>

            <button className="dialog-create-btn" onClick={handleCreateCollection}>Create</button>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} className="dialog-overlay">
  <div className="dialog-container">
    <Dialog.Panel className="dialog-box">
      <button className="close-btn" onClick={() => setShowEditDialog(false)}>×</button>
      <Dialog.Title className="dialog-title">Edit Profile</Dialog.Title>

      <label className="dialog-title">First Name</label>
      <input className="dialog-input" value={editedFirstName} onChange={(e) => setEditedFirstName(e.target.value)} />

      <label className="dialog-title">Last Name</label>
      <input className="dialog-input" value={editedLastName} onChange={(e) => setEditedLastName(e.target.value)} />

      <label className="dialog-title">Username</label>
      <input className="dialog-input" value={editedUserName} onChange={(e) => setEditedUserName(e.target.value)} />

      <label className="dialog-title">Bio</label>
      <textarea className="dialog-input" value={editedBio} onChange={(e) => setEditedBio(e.target.value)} />

      <button className="dialog-create-btn" onClick={async () => {
        const { error } = await supabase
          .from("Profiles")
          .update({
            first_name: editedFirstName,
            last_name: editedLastName,
            username: editedUserName,
            biography: editedBio
          })
          .eq("id", session.user.id);

        if (error) {
          alert("Error updating profile: " + error.message);
        } else {
          setFirstName(editedFirstName);
          setLastName(editedLastName);
          setUsername(editedUserName);
          setBio(editedBio);
          setShowEditDialog(false);
        }
      }}>
        Save Changes
      </button>
    </Dialog.Panel>
  </div>
</Dialog>

 

    </div>
  );
}
