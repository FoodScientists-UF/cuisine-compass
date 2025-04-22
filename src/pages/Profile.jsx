import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider";
import { Dialog } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import ProfileNavBar from "../components/ProfileNavBar";
import FollowDialog from "../components/FollowDialog";
import "./Profile.css";

export default function Profile() {
  const { id: profileIdParam } = useParams();
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();

  const profileUserId = profileIdParam || session?.user?.id;
  const isMe = !profileIdParam || profileIdParam === session?.user?.id;

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
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);

  const DEFAULT_IMAGE_URL =
    "https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/collection-picture//default.png";

  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedUserName, setEditedUserName] = useState("");
  const [editedBio, setEditedBio] = useState("");

  const [showFollowerDialog, setShowFollowerDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);

  const toggleCreateDropdown = () => {
    setShowCreateDropdown(!showCreateDropdown);
  };

  const openCollectionDialog = () => {
    setShowCreateDropdown(false);
    setIsCollectionDialogOpen(true);
    if (!selectedCollection) {
      setCollectionName("");
      setIsPrivate(false);
      setCollectionImage(null);
      setImageFile(null);
    } else {
      setCollectionName(selectedCollection.name);
      setIsPrivate(selectedCollection.is_private);
      setCollectionImage(selectedCollection.cover_img || null);
      setImageFile(null);
    }
  };

  const closeCollectionDialog = () => {
    setIsCollectionDialogOpen(false);
    setSelectedCollection(null);
    setCollectionName("");
    setIsPrivate(false);
    setCollectionImage(null);
    setImageFile(null);
  };

  const handleCreateOrUpdateCollection = async (e) => {
    e.preventDefault();

    if (!collectionName.trim()) {
      alert("Please enter a collection name");
      return;
    }

    let uploadedImageUrl = selectedCollection?.cover_img || null;

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

    const collectionData = {
      name: collectionName.trim(),
      user_id: session.user.id,
      is_private: isPrivate,
      cover_img: uploadedImageUrl,
      ...(selectedCollection && { id: selectedCollection.id }),
      ...(!selectedCollection && { id: crypto.randomUUID() }),
    };

    try {
      const { data, error } = await supabase
        .from("saved_collections")
        .upsert([collectionData])
        .select()
        .single();

      if (error) throw error;

      alert(
        `Collection ${selectedCollection ? "updated" : "created"} successfully!`
      );

      setFolders((prevFolders) => {
        if (selectedCollection) {
          return prevFolders.map((folder) =>
            folder.id === data.id
              ? { ...folder, ...data, recipeCount: folder.recipeCount }
              : folder
          );
        } else {
          return [...prevFolders, { ...data, recipeCount: 0 }];
        }
      });

      closeCollectionDialog();
    } catch (error) {
      alert(
        `Error ${selectedCollection ? "updating" : "creating"} collection: ${
          error.message
        }`
      );
    }
  };

  const handleFollowStateUpdate = (didFollow) => {
    if (didFollow) {
      setFollowersCount((prev) => prev + 1);
    } else {
      setFollowersCount((prev) => Math.max(0, prev - 1));
    }
    if (isMe) setIsFollowingProfile(didFollow);
  };

  const handleProfileFollowToggle = async () => {
    if (!session?.user?.id || isMe) return;

    try {
      const { data, error } = await supabase
        .from("Following")
        .upsert({ follower_id: session.user.id, following_id: profileUserId, is_following: !isFollowingProfile })
        .select();

      if (error) throw error;

      setIsFollowingProfile(!isFollowingProfile);
      setFollowersCount((prev) => isFollowingProfile ? Math.max(0, prev - 1) : prev + 1);
    } catch (error) {
      console.error("Error toggling profile follow:", error.message);
      alert("Failed to update follow status.");
    }
  };

  useEffect(() => {
    if (!profileUserId) {
      console.log("No user ID available to fetch profile.");
      return;
    }

    const fetchUserPicture = async () => {
      const { data, error } = await supabase.storage
        .from("profile_pictures")
        .getPublicUrl(profileUserId);
      if (error || !data?.publicUrl) {
        console.error(
          "Error fetching profile picture or URL is null:",
          error?.message
        );
        setPic(
          "https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/profile_pictures//default-avatar.png"
        );
      } else {
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
        return;
      }
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setUsername(data.username);
      setBio(data.biography);
      if (isMe) {
        setEditedFirstName(data.first_name);
        setEditedLastName(data.last_name);
        setEditedUserName(data.username);
        setEditedBio(data.biography);
      }
    };

    const fetchRecipeCount = async () => {
      const { count, error } = await supabase
        .from("Recipes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profileUserId);

      if (error) {
        console.error("Error fetching recipe count:", error.message);
        return;
      }
      setRecipeCount(count || 0);
    };

    const fetchFollowersCount = async () => {
      const { count, error } = await supabase
        .from("Following")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileUserId)
        .eq("is_following", true);

      if (error) {
        console.error("Error fetching followers count:", error.message);
        return;
      }
      setFollowersCount(count || 0);
    };

    const fetchFollowingCount = async () => {
      const { count, error } = await supabase
        .from("Following")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileUserId)
        .eq("is_following", true);

      if (error) {
        console.error("Error fetching following count:", error.message);
        return;
      }
      setFollowingCount(count || 0);
    };

    const fetchIsFollowing = async () => {
      if (isMe || !session?.user?.id) {
        setIsFollowingProfile(false);
        return;
      }
      const { data, error } = await supabase
        .from("Following")
        .select("*", { count: "exact", head: true })
        .match({ follower_id: session.user.id, following_id: profileUserId, is_following: true });

      if (error) {
        console.error("Error checking follow status:", error);
        setIsFollowingProfile(false);
      } else {
        setIsFollowingProfile(data.length > 0);
      }
    };

    const fetchCollections = async () => {
      try {
        const { data: collections, error: collectionsError } = await supabase
          .from("saved_collections")
          .select("id, name, cover_img, is_private")
          .eq("user_id", profileUserId);

        if (collectionsError) throw collectionsError;

        const collectionIds = collections.map((c) => c.id);
        if (collectionIds.length === 0) {
          setFolders(
            collections.map((c) => ({ ...c, recipeCount: 0 }))
          );
          return;
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

        const foldersWithCounts = collections.map((folder) => ({
          ...folder,
          recipeCount: recipeCounts[folder.id] || 0,
          cover_img: folder.cover_img || DEFAULT_IMAGE_URL,
        }));

        setFolders(foldersWithCounts);
      } catch (err) {
        console.error("Error fetching collections:", err.message);
      }
    };

    const fetchCookedRecipes = async () => {
      const { data, error } = await supabase
        .from("Cooked Recipes")
        .select("recipe_id", { count: "exact", head: true })
        .eq("user_id", profileUserId)
        .eq("have_cooked", true);

      if (error) {
        console.error("Error fetching cooked recipes count:", error.message);
        setCookedRecipes([]);
        return;
      }
      setCookedRecipes(data || []);
    };

    Promise.all([
      fetchUserPicture(),
      fetchUserProfile(),
      fetchRecipeCount(),
      fetchFollowersCount(),
      fetchFollowingCount(),
      fetchIsFollowing(),
      fetchCollections(),
      fetchCookedRecipes(),
      fetchFollowerUsers(),
      fetchFollowingUsers(),
    ]);
  }, [profileUserId, session?.user?.id, isMe]);

  const fetchFollowerUsers = async () => {
    const { data: followers, error } = await supabase
      .from("Following")
      .select("*")
      .eq("following_id", profileUserId)
      .eq("is_following", true);


    if (error) return console.error("Error fetching follower IDs:", error.message);
    console.log("Fetched followers:", followers);

    const ids = followers.map((f) => f.follower_id);
    if (ids.length === 0) return setFollowerUsers([]);

    const { data: profiles, error: profileError } = await supabase
      .from("Profiles")
      .select("id, first_name, last_name, username")
      .in("id", ids);

    if (profileError)
      return console.error("Error fetching follower profiles:", profileError.message);
    setFollowerUsers(profiles || []);
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

    if (profileError)
      return console.error("Error fetching following profiles:", profileError.message);
    setFollowingUsers(profiles || []);
  };

  const DEFAULT_COLLECTIONS = isMe
    ? [
        {
          id: "your-recipes",
          name: "Your Recipes",
          recipeCount: recipeCount,
          cover_img: DEFAULT_IMAGE_URL,
          isDefault: true,
          isOwner: true,
        },
        {
          id: "cooked",
          name: "Cooked Recipes",
          recipeCount: cookedRecipes.length,
          cover_img: DEFAULT_IMAGE_URL,
          isDefault: true,
          isOwner: true,
        },
      ]
    : [];

  const collectionsToShow = [...DEFAULT_COLLECTIONS, ...folders];

  return (
    <div className="profile-container">
      {isMe && <ProfileNavBar />}
      {isMe && <div className="vl"></div>}

      {isMe && (
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
      )}

     
      <div
        className={`profile-content ${!isMe ? "pt-10" : ""}`}
        style={{ marginLeft: isMe ? "0" : "-100px" }}
      >
        <img src={pic} alt={`${userName}'s profile`} className="profile-pic" />
        <h1 className="name">
          {firstName} {lastName}
        </h1>
        <h1 className="username">@{userName}</h1>

        <p className="stats">
          <span>
            {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
          </span>
          <span
            onClick={() => setShowFollowerDialog(true)}
            className="cursor-pointer hover:underline"
          >
            {followersCount} {followersCount === 1 ? "follower" : "followers"}
          </span>
          <span
            onClick={() => setShowFollowingDialog(true)}
            className="cursor-pointer hover:underline"
          >
            {followingCount} following
          </span>
        </p>

        <div className="bio">
          {bio ||
            (isMe
              ? "No bio yet. Click 'Edit Profile' to add one!"
              : "User hasn't added a bio yet.")}
        </div>

        {isMe && (
          <div className="collections-header">
            <h2 className="collection-title">Collections</h2>
            <div className="create-container">
              <button onClick={toggleCreateDropdown} className="create-btn">
                + Create
              </button>
              {showCreateDropdown && (
                <div className="create-dropdown">
                  <p
                    className="create-option"
                    onClick={() => navigate("/createrecipe")}
                  >
                    Recipe
                  </p>
                  <p className="create-option" onClick={openCollectionDialog}>
                    Collection
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="collections-grid">
          {collectionsToShow
            .filter(
              (col) => isMe || (!col.is_private && !col.isDefault)
            )
            .map((col) => (
              <div
                key={col.id}
                className="collection-card cursor-pointer"
                onClick={() => {
                  if (col.id === "your-recipes")
                    navigate(`/collection/your-recipes`);
                  else if (col.id === "cooked")
                    navigate(`/collection/cooked`);
                  else navigate(`/collection/${col.id}`);
                }}
              >
                {isMe && !col.isDefault && (
                  <div className="collection-options">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdownForId((prev) =>
                          prev === col.id ? null : col.id
                        );
                      }}
                      className="text-gray-600 hover:text-black"
                    >
                      <BsThreeDotsVertical size={20} />
                    </button>

                    {showDropdownForId === col.id && (
                      <div className="collection-actions-dropdown">
                        <div
                          className="dropdown-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCollection(col);
                            openCollectionDialog();
                            setShowDropdownForId(null);
                          }}
                        >
                          Edit
                        </div>
                        <div
                          className="dropdown-option text-red-600"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                `Are you sure you want to delete the collection "${col.name}"? This cannot be undone.`
                              )
                            ) {
                              const { error } = await supabase
                                .from("saved_collections")
                                .delete()
                                .eq("id", col.id);
                              if (!error) {
                                setFolders((prev) =>
                                  prev.filter((f) => f.id !== col.id)
                                );
                                alert("Collection deleted.");
                              } else {
                                alert(
                                  "Error deleting collection: " +
                                    error.message
                                );
                              }
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

                <img
                  src={col.cover_img || DEFAULT_IMAGE_URL}
                  alt={col.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />

                <div className="collection-info">
                  <h3 className="collection-title-card">{col.name}</h3>
                  <p className="collection-recipe-count">
                    {col.recipeCount}{" "}
                    {col.recipeCount === 1 ? "recipe" : "recipes"}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {isMe && (
        <Dialog
          open={isCollectionDialogOpen}
          onClose={closeCollectionDialog}
          className="dialog-overlay"
        >
          <div className="dialog-container">
            <Dialog.Panel className="dialog-box w-[500px]">
              <button className="close-btn" onClick={closeCollectionDialog}>
                ×
              </button>
              <Dialog.Title className="dialog-title">
                {selectedCollection ? "Edit Collection" : "Create Collection"}
              </Dialog.Title>

              <label className="dialog-label block mb-1 text-left">Title</label>
              <input
                type="text"
                placeholder="Name your collection"
                className="dialog-input"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
              />

              <label className="dialog-label block mb-1 text-left mt-4">
                Cover Image (Optional)
              </label>
              <label
                htmlFor="collectionImageInput"
                className="upload-placeholder cursor-pointer block w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-300 mb-4"
              >
                {collectionImage ? (
                  <img
                    src={collectionImage}
                    alt="Collection Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mx-auto mb-1"
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
                    <span>Click to upload</span>
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

              <div className="dialog-private flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="privateCollection"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(!isPrivate)}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
                <label
                  htmlFor="privateCollection"
                  className="dialog-label cursor-pointer"
                >
                  Make this collection private
                </label>
              </div>

              <button
                className="dialog-create-btn w-full"
                onClick={handleCreateOrUpdateCollection}
              >
                {selectedCollection ? "Save Changes" : "Create Collection"}
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {isMe && (
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          className="dialog-overlay"
        >
          <div className="dialog-container">
            <Dialog.Panel className="dialog-box">
              <button
                className="close-btn"
                onClick={() => setShowEditDialog(false)}
              >
                ×
              </button>
              <Dialog.Title className="dialog-title">Edit Profile</Dialog.Title>

              <label className="dialog-label block mb-1 text-left">
                First Name
              </label>
              <input
                className="dialog-input"
                value={editedFirstName}
                onChange={(e) => setEditedFirstName(e.target.value)}
              />

              <label className="dialog-label block mb-1 text-left">
                Last Name
              </label>
              <input
                className="dialog-input"
                value={editedLastName}
                onChange={(e) => setEditedLastName(e.target.value)}
              />

              <label className="dialog-label block mb-1 text-left">
                Username
              </label>
              <input
                className="dialog-input"
                value={editedUserName}
                onChange={(e) => setEditedUserName(e.target.value)}
              />

              <label className="dialog-label block mb-1 text-left">Bio</label>
              <textarea
                className="dialog-input h-24"
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
              />

              <button
                className="dialog-create-btn w-full mt-2"
                onClick={async () => {
                  const { error } = await supabase
                    .from("Profiles")
                    .update({
                      first_name: editedFirstName,
                      last_name: editedLastName,
                      username: editedUserName,
                      biography: editedBio,
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
                    alert("Profile updated successfully!");
                  }
                }}
              >
                Save Changes
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      <FollowDialog
        isOpen={showFollowerDialog}
        onClose={async () => {
          await Promise.all([fetchFollowerUsers(), fetchFollowingUsers()]);
          setShowFollowerDialog(false);
        }}
        title={"Followers"}
        users={followerUsers}
        currentUserId={session?.user?.id}
        profileUserId={profileUserId}
        onFollowStateChange={handleFollowStateUpdate}
      />

      <FollowDialog
        isOpen={showFollowingDialog}
        onClose={async () => {
          await Promise.all([fetchFollowerUsers(), fetchFollowingUsers()]);
          setShowFollowingDialog(false);
        }}
        title={"Following"}
        users={followingUsers}
        currentUserId={session?.user?.id}
        profileUserId={profileUserId}
        onFollowStateChange={handleFollowStateUpdate}
      />
    </div>
  );
}
