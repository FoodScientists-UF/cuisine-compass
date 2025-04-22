import React, { useState, useEffect, useContext } from "react";
import { Dialog } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { supabase, AuthContext } from "../AuthProvider";
import "../pages/Profile.css";

export default function FollowDialog({
  isOpen,
  onClose,
  title,
  users,
  currentUserId,
  profileUserId,
  onFollowStateChange,
}) {
  const navigate = useNavigate();
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    if (!currentUserId || users.length === 0) return;

    const fetchStatus = async () => {
      const userIds = users.map(u => u.id);
      const { data, error } = await supabase
        .from("Following")
        .select("following_id")
        .eq("follower_id", currentUserId)
        .eq("is_following", true)
        .in("following_id", userIds);

      if (error) {
        console.error("Error fetching following status:", error);
        return;
      }

      const statusMap = {};
      data.forEach(item => {
        statusMap[item.following_id] = true;
      });
      setFollowingStatus(statusMap);
    };

    fetchStatus();
  }, [users, currentUserId, isOpen]);

  const handleFollowToggle = async (targetUserId) => {
    if (!currentUserId) return;

    const isCurrentlyFollowing = followingStatus[targetUserId];

    try {
        const { data, error } = await supabase
            .from("Following")
            .upsert({ follower_id: currentUserId, following_id: targetUserId, is_following: !isCurrentlyFollowing })
            .select();
        if (error) throw error;
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: !isCurrentlyFollowing }));
        if (targetUserId === profileUserId || currentUserId === profileUserId) {
            onFollowStateChange(!isCurrentlyFollowing);
        }
    } catch (error) {
      console.error("Error toggling follow:", error.message);
      alert("Failed to update follow status.");
    }
  };

  const handleNavigate = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };


  return (
    <Dialog open={isOpen} onClose={onClose} className="dialog-overlay">
      <div className="dialog-container">
        <Dialog.Panel className="dialog-box">
          <button className="close-btn" onClick={onClose}>×</button>
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No users to display.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between mb-4">
                <div onClick={() => handleNavigate(user.id)} className="flex items-center gap-3 cursor-pointer">
                  <img
                    src={`https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/profile_pictures/${user.id}}`}
                    onError={(e) => e.target.src = 'https://gdjiogpkggjwcptkosdy.supabase.co/storage/v1/object/public/profile_pictures//default-avatar.png'}
                    alt={`${user.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.first_name} {user.last_name}</p>
                  </div>
                </div>
                {user.id !== currentUserId && (
                  <button
                    onClick={() => handleFollowToggle(user.id)}
                    className={`text-sm px-3 py-1 rounded ${
                      followingStatus[user.id]
                        ? "bg-gray-300 text-black"
                        : "bg-[#D75600] text-white"
                    }`}
                  >
                    {followingStatus[user.id] ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
