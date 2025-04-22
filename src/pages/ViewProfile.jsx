import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider";
import FollowDialog from "../components/FollowDialog";
import "./Profile.css";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BsBookmarkFill } from "react-icons/bs";
import { TbBowlSpoonFilled } from "react-icons/tb";

export default function ViewProfile() {
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const { userId: profileUserId } = useParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pic, setPic] = useState("");
  const [userName, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [userRecipes, setUserRecipes] = useState([]);
  const [publicCollections, setPublicCollections] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRecipes, setShowRecipes] = useState(true);

  const [recipeCount, setRecipeCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);

  const [showFollowerDialog, setShowFollowerDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);

  const DEFAULT_AVATAR_URL = "https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/profile_pictures//default-avatar.png";
  const DEFAULT_COLLECTION_IMAGE_URL = "https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/collection-picture//default.png";

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    console.log("showRecipes:", showRecipes);
    console.log("Dropdown toggled:", !showDropdown);
  };

  const handleFollowStateUpdate = (didFollow) => {
    if (didFollow) {
      setFollowersCount((prev) => prev + 1);
      if (session?.user?.id) setIsFollowing(true);
    } else {
      setFollowersCount((prev) => Math.max(0, prev - 1));
      if (session?.user?.id) setIsFollowing(false);
    }
  };

  const handleProfileFollowToggle = async () => {
    if (!session?.user?.id || !profileUserId || session.user.id === profileUserId) return;

    try {
      const { data, error } = await supabase
        .from("Following")
        .upsert({ follower_id: session.user.id, following_id: profileUserId, is_following: !isFollowing })
        .select();

      await Promise.all([
        fetchFollowerUsers(),
        fetchFollowingUsers()]);

      if (error) throw error;
      setIsFollowing(data[0]?.is_following || false);
      setFollowersCount((prev) => (data[0]?.is_following ? prev + 1 : Math.max(0, prev - 1)));
    } catch (error) {
      console.error("Error toggling profile follow:", error.message);
      alert("Failed to update follow status.");
    }


  };

  useEffect(() => {
    if (!profileUserId) {
      console.error("No profile user ID provided.");
      return;
    }

    if (session?.user?.id === profileUserId) {
      navigate("/profile");
      return;
    }

    const fetchUserPicture = async () => {
      const { data: exists } = await supabase.storage.from("profile_pictures").exists(profileUserId);
      if (!exists) {
        console.error("Profile picture does not exist for user ID:", profileUserId);
        setPic(DEFAULT_AVATAR_URL);
        return;
      }
      const { data, error } = await supabase.storage.from("profile_pictures").getPublicUrl(profileUserId);
      if (error || !data?.publicUrl) {
        console.error("Error fetching profile picture or URL is null:", error?.message);
        setPic(DEFAULT_AVATAR_URL);
      } else {
        console.log("Fetched profile picture URL:", data.publicUrl);
        setPic(data.publicUrl);
      }
    };

    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("Profiles")
        .select("first_name, last_name, username, biography")
        .eq("id", profileUserId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        navigate("/explore", { replace: true, state: { error: "Profile not found" } });
        return;
      }
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setUsername(data.username);
      setBio(data.biography);
    };

    const fetchRecipeCount = async () => {
      const { count, error } = await supabase
        .from("Recipes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileUserId);

      if (error) console.error("Error fetching recipe count:", error.message);
      else setRecipeCount(count || 0);
    };

    const fetchFollowersCount = async () => {
      const { count, error } = await supabase
        .from("Following")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileUserId)
        .eq("is_following", true);

      if (error) console.error("Error fetching followers count:", error.message);
      else setFollowersCount(count || 0);
    };

    const fetchFollowingCount = async () => {
      const { count, error } = await supabase
        .from("Following")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileUserId)
        .eq("is_following", true);

      if (error) console.error("Error fetching following count:", error.message);
      else setFollowingCount(count || 0);
    };

    const fetchUserRecipes = async () => {
      const { data, error } = await supabase
        .from("Recipes")
        .select("id, title, image_url, cost, prep_time, cook_time")
        .eq("user_id", profileUserId);


      console.log("Fetched user recipes:", data);
      if (error) console.error("Error fetching user recipes:", error.message);
      else setUserRecipes(data || []);
    };

    const fetchPublicCollections = async () => {
      try {
        const { data: collections, error: collectionsError } = await supabase
          .from("saved_collections")
          .select("id, name")
          .eq("user_id", profileUserId)
          .eq("is_private", false);
    
        if (collectionsError) throw collectionsError;
    
        const collectionIds = collections.map((c) => c.id);
        if (collectionIds.length === 0) {
          setPublicCollections([]);
          return;
        }
    
        // Get the first recipe for each collection, including image_url
        const { data: savedRecipes, error: savedError } = await supabase
          .from("saved_recipes")
          .select("folder_id, recipe_id, Recipes(image_url)")
          .in("folder_id", collectionIds)
          .eq("user_id", profileUserId)
          .order("folder_id", { ascending: true })
          .order("id", { ascending: true }); // Get first recipe per folder
    
        if (savedError) throw savedError;
    
        const coverImages = {};
        for (const recipe of savedRecipes) {
          if (!coverImages[recipe.folder_id] && recipe.Recipes?.image_url) {
            coverImages[recipe.folder_id] = recipe.Recipes.image_url;
          }
        }
    
        const { data: recipeCountsData, error: countsError } = await supabase
          .from("saved_recipes")
          .select("folder_id", { count: "exact" })
          .in("folder_id", collectionIds)
          .eq("user_id", profileUserId);
    
        if (countsError) throw countsError;
    
        const recipeCounts = recipeCountsData.reduce((acc, { folder_id }) => {
          acc[folder_id] = (acc[folder_id] || 0) + 1;
          return acc;
        }, {});
    
        const collectionsWithMeta = collections.map((folder) => ({
          ...folder,
          recipeCount: recipeCounts[folder.id] || 0,
          cover_img: coverImages[folder.id],
        }));
    
        setPublicCollections(collectionsWithMeta);
      } catch (err) {
        console.error("Error fetching public collections:", err.message);
      }
    };
    

    console.log("showRecipes is", showRecipes);
    
  const fetchFollowerUsers = async () => {
    const { data: followers, error } = await supabase
      .from("Following")
      .select("follower_id")
      .eq("following_id", profileUserId)
      .eq("is_following", true);

    if (error) return console.error("Error fetching follower IDs:", error.message);

    const ids = followers.map((f) => f.follower_id);
    if (ids.length === 0) return setFollowerUsers([]);

    const { data: profiles, error: profileError } = await supabase
      .from("Profiles")
      .select("id, first_name, last_name, username")
      .in("id", ids);

    if (profileError) return console.error("Error fetching follower profiles:", profileError.message);
    setFollowerUsers(profiles || []);
    setIsFollowing(ids.includes(session?.user?.id));
  };

  const fetchFollowingUsers = async () => {
    const { data: following, error } = await supabase
      .from("Following")
      .select("following_id")
      .eq("follower_id", profileUserId)
      .eq("is_following", true);

    if (error) return console.error("Error fetching following IDs:", error.message);

    const ids = following.map((f) => f.following_id);
    if (ids.length === 0) return setFollowingUsers([]);

    const { data: profiles, error: profileError } = await supabase
      .from("Profiles")
      .select("id, first_name, last_name, username")
      .in("id", ids);

    if (profileError) return console.error("Error fetching following profiles:", profileError.message);
    setFollowingUsers(profiles || []);
  };
    Promise.all([
      fetchUserPicture(),
      fetchUserProfile(),
      fetchRecipeCount(),
      fetchFollowersCount(),
      fetchFollowingCount(),
      fetchUserRecipes(),
      fetchPublicCollections(),
      fetchFollowerUsers(),
      fetchFollowingUsers(),
    ]);
  }, [profileUserId, session?.user?.id, navigate, showRecipes]);




  return (
    <div className="view-profile-container pt-16">
      <button
        onClick={() => navigate(-1)}
        className="back absolute top-60 left-5 z-10"
      >
        <img
          src="/back_arrow.png"
          alt="Back"
          className="w-10 h-10 hover:opacity-60 transition"
        />
      </button>

      <div className="profile-content text-center">
        <img src={pic} alt={`${userName}'s profile`} className="profile-pic mx-auto" />
        <h1 className="name">{firstName} {lastName}</h1>
        <h1 className="username">@{userName}</h1>

        <p className="stats justify-center">
          <span>{recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}</span>
          <span onClick={() => setShowFollowerDialog(true)} className="cursor-pointer hover:underline">
            {followersCount} {followersCount === 1 ? "follower" : "followers"}
          </span>
          <span onClick={() => setShowFollowingDialog(true)} className="cursor-pointer hover:underline">
            {followingCount} following
          </span>
        </p>

        {session?.user?.id && session.user.id !== profileUserId && (
          <div className="follow-btn-container mt-2 mb-4">
            <button
              onClick={handleProfileFollowToggle}
              className={`follow-btn ${isFollowing ? "following-active" : ""}`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        )}

        <div className="bio max-w-xl mx-auto">
          {bio || "User hasn't added a bio yet."}
        </div>

        <div className="collections-header mt-8">
          <button onClick={toggleDropdown} className="collection-title">
            {showRecipes ? "Recipes" : "Public Collections"}
            <RiArrowDropDownLine />
          </button>
          {showDropdown && (
            <div className="recipe-collection-toggle">
              <p
                className="create-option"
                onClick={() => {
                  setShowRecipes(true);
                  setShowDropdown(false);
                }}
              >
                Recipes
              </p>
              <p className="create-option"
              onClick={() => {
                setShowRecipes(false);
                setShowDropdown(false);
              }}
              >
                Public Collections
              </p>
            </div>
          )}
        </div>
        
        {/*<div className="collections-header mt-8">
          <h2 className="collection-title">Recipes</h2>
        </div>*/}

          
        {showRecipes ? (
          userRecipes.length > 0 ? (
            <div className="pinterest-grid-profile">
              {userRecipes.map((recipe) => (
                <div key={recipe.id} className="pinterest-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                  <div className="image-wrapper">
                    <img src={recipe.image_url || DEFAULT_COLLECTION_IMAGE_URL} alt={recipe.title} className="pinterest-image" />
                    <div className="overlay" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                      <div className="recipe-info">
                        <h3>{recipe.title}</h3>
                        <p>{recipe.username}</p>
                        <p>${recipe.cost}</p>
                        <p>🕒 {recipe.prep_time + recipe.cook_time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">This user hasn't created any recipes yet.</p>
          )
        ) : (
          publicCollections.length > 0 ? (
            <div className="collections-grid">
              {publicCollections.map((collection) => (
                <div key={collection.id} 
                className="collection-card cursor-pointer"
                onClick={() => navigate(`/collection/${collection.id}`)}>
                  {collection.cover_img ? (
                    <img
                      src={collection.cover_img}
                      alt={collection.name}
                      className="w-full h-48 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-48 object-cover rounded mb-2 flex items-center justify-center bg-gray-200">
                      <TbBowlSpoonFilled className="placeholder-icon" />
                    </div>
                  )}
                  <div className="collection-info">
                    <h3 className="collection-title-card">{collection.name}</h3>
                    <p className="collection-recipe-count">
                      {collection.recipeCount} {collection.recipeCount === 1 ? "recipe" : "recipes"}
                    </p>
                  </div>
                </div>
              ))}
              {/* {publicCollections.map((col) => (
              <div
                key={col.id}
                className="collection-card cursor-pointer"
                onClick={() => navigate(`/collection/${col.id}`)}
              >
                <img
                  src={col.cover_img || DEFAULT_COLLECTION_IMAGE_URL}
                  alt={col.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="collection-info">
                  <h3 className="collection-title-card">{col.name}</h3>
                  <p className="collection-recipe-count">
                    {col.recipeCount} {col.recipeCount === 1 ? "recipe" : "recipes"}
                  </p>
                </div>
              </div>
            ))} */}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">This user has no public collections.</p>
          )
        )}
{/* 

        {showRecipes && userRecipes.length > 0 ? (
          <div className="pinterest-grid">
            {userRecipes.map((recipe) => (
              <div key={recipe.id} className="pinterest-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                <div className="image-wrapper relative">
                  <img src={recipe.image_url || DEFAULT_COLLECTION_IMAGE_URL} alt={recipe.title} className="pinterest-image" />
                  <div className="overlay absolute inset-0 bg-black bg-opacity-50 flex items-end p-3 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg">
                    <div className="recipe-info text-white">
                      <h3 className="font-bold text-lg mb-1">{recipe.title}</h3>
                      {recipe.cost && <p className="text-sm">${recipe.cost}</p>}
                      {(recipe.prep_time || recipe.cook_time) &&
                        <p className="text-sm">🕒 {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">This user hasn't created any recipes yet.</p>
        )} */}

{/* 
        <div className="collections-header mt-8">
          <h2 className="collection-title">Public Collections</h2>
        </div> */}
        {/* {!showRecipes && publicCollections.length > 0 ? (
          <div className="collections-grid">
            {publicCollections.map((col) => (
              <div
                key={col.id}
                className="collection-card cursor-pointer"
                onClick={() => navigate(`/collection/${col.id}`)}
              >
                <img
                  src={col.cover_img || DEFAULT_COLLECTION_IMAGE_URL}
                  alt={col.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="collection-info">
                  <h3 className="collection-title-card">{col.name}</h3>
                  <p className="collection-recipe-count">
                    {col.recipeCount} {col.recipeCount === 1 ? "recipe" : "recipes"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">This user has no public collections.</p>
        )} */}
      </div>

      <FollowDialog
        isOpen={showFollowerDialog}
        onClose={() => setShowFollowerDialog(false)}
        title={`${followersCount} ${followersCount === 1 ? "Follower" : "Followers"}`}
        users={followerUsers}
        currentUserId={session?.user?.id}
        profileUserId={profileUserId}
        onFollowStateChange={handleFollowStateUpdate}
      />

      <FollowDialog
        isOpen={showFollowingDialog}
        onClose={() => setShowFollowingDialog(false)}
        title={`${followingCount} Following`}
        users={followingUsers}
        currentUserId={session?.user?.id}
        profileUserId={profileUserId}
        onFollowStateChange={handleFollowStateUpdate}
      />
    </div>
  );
}
