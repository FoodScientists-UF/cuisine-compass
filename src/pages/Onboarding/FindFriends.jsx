import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../../AuthProvider";

export default function FriendsOnboarding() {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();
  const [topUsers, setTopUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    const { data: followData, error: followError } = await supabase
      .from('Following')
      .select('following_id');
  
    if (followError) {
      console.error("Error fetching follow data:", followError.message);
      return;
    }
  
    const followerCountMap = {};
    followData.forEach((row) => {
      if (row.following_id) {
        followerCountMap[row.following_id] = (followerCountMap[row.following_id] || 0) + 1;
      }
    });
  
    const sortedFollowingIds = Object.entries(followerCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  
    if (sortedFollowingIds.length === 0) return;
  
    const { data: profiles, error: profilesError } = await supabase
      .from('Profiles')
      .select('id, username, first_name, last_name, avatar_url')
      .in('id', sortedFollowingIds);
  
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError.message);
      return;
    }
  
    setTopUsers(profiles);
  };
  

  const toggleFollow = (userId) => {
    if (following.includes(userId)) {
      setFollowing(following.filter((id) => id !== userId));
    } else {
      setFollowing([...following, userId]);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
  
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
  
    const { data, error } = await supabase
      .from('Profiles')
      .select('id, username, first_name, last_name, avatar_url')
      .or(`username.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
  
    if (error) {
      console.error("Error searching profiles:", error.message);
      return;
    }
  
    setSearchResults(data);
  };
  

  const handleComplete = async () => {
    if (!session) {
      alert("User is not signed in");
      navigate("/login");
      return;
    }

    if (following.length > 0) {
      const followActions = following.map((followedId) => ({
        follower_id: session.user.id,
        following_id: followedId,
      }));

      const { error } = await supabase
        .from('Following')
        .insert(followActions);

      if (error) {
        alert("Error following users: " + error.message);
        return;
      }
    }

    navigate("/Explore");
  };

  return (
    <div className="h-screen flex flex-col justify-start items-center gap-y-5 pt-10 px-4">
      <span className="abhaya-libre-extrabold text-3xl text-center">Find your friends or favorite chefs</span>

      {/* Search bar */}
      <div className="flex justify-center w-full max-w-md mt-4">
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="border rounded-lg w-full py-2 px-4 text-gray-700"
        autoComplete="off"
      />
      </div>

      {/* Users */}
      <div className="flex flex-col gap-y-6 mt-6 w-full max-w-md">
          {(searchResults.length > 0 ? searchResults : topUsers).map((user) => (
            <div key={user.id} className="flex justify-between items-center border-b pb-4">
              <div className="flex items-center gap-x-4">
                <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-xl">👤</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{user.first_name} {user.last_name}</span>
                  <span className="text-gray-500">@{user.username}</span>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-4 py-2 rounded-full text-white font-bold transition ${
                  following.includes(user.id)
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-[#D75600] hover:bg-orange-700"
                }`}
              >
                {following.includes(user.id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>


      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={following.length === 0}
        className={`mt-8 w-80 py-3 rounded-xl font-bold text-lg transition ${
          following.length > 0
            ? "bg-[#D75600] text-white hover:bg-orange-700"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
      >
        Complete Account Setup
      </button>


      {/* Skip Button */}
      <button
        onClick={() => navigate("/Explore")}
        className="mt-2 text-gray-500 underline text-sm"
      >
        Skip for Now
      </button>
    </div>
  );
}
