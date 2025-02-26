import { useEffect, useState, useContext } from "react";
import { supabase, AuthContext } from "../AuthProvider";
import "./Profile.css"
export default function Profile() {
  const { session } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pic, setPic] = useState("");
  const [userName, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [recipeCount, setRecipeCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    const fetchUserProfile = async () => {
      const userId = session.user.id;

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
      setPic(data.avatar_url);
      setUsername(data.username);
      setBio(data.biography);
      
    };
    const fetchRecipeCount = async () => {
        const userId = session.user.id;
    
        // Query the Recipes table to count user's recipes
        const { count, error } = await supabase
          .from("Recipes")
          .select("*", { count: "exact" })
          .eq("user_id", userId);
    
        if (error) {
          console.error("Error fetching recipe count:", error.message);
          return;
        }
    
        setRecipeCount(count); // Store recipe count in state
      };

    fetchRecipeCount();
    fetchUserProfile();
  }, [session]);
  


  if (!session) return <p>Please log in to view your profile.</p>;
  if (!firstName && !lastName) return <p>Loading profile...</p>;


  return (
    <div className="profile-container">
    <div className="profile-sidebar"></div>
    <div className="vl"></div>

    <div className="profile-content">
       <img 
       src={pic}
       alt= "profile pic"
       className= "profile-pic"
       />
      <h1 className="name">
        {firstName} {lastName}
      </h1>
      <h1 className="username">
        @{userName} 
      </h1>
      <p className="stats">
        {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
    </p>
      <div className="bio"> 
        {bio}
      </div>
    </div>
  </div>
  );
};

