import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileNavBar from "../components/ProfileNavBar";
import { BsPlusCircle } from "react-icons/bs";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { FaCircleMinus } from "react-icons/fa6";
import { PiDotsThreeCircleVertical } from "react-icons/pi";
import { supabase, AuthContext } from "../AuthProvider";
import CreateNote from "../components/CreateNote";
import "../pages/Profile.css";

export default function GroceryList() {
    const { id } = useParams();
    const { session } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lists, setLists] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [order, setOrder] = useState("oldest");
    const [showNotePopup, setShowNotePopup] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [showMenu, setShowMenu] = useState(null);

    // Toggle Dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const toggleMenu = (listId) => {
        setShowMenu(showMenu === listId ? null : listId);
    };

    const deleteGroceryList = async (id) => {
        const { error } = await supabase
            .from("Grocery List")
            .delete()
            .eq("id", id);
    
        if (error) {
            console.error("Error deleting grocery list:", error);
            return;
        }
    
        // Remove the deleted item from state
        setLists((prevLists) => prevLists.filter((list) => list.id !== id));
    };

    useEffect(() => {
        async function fetchGroceryLists() {
            if (!session || !session.user?.id) return;
            const { data, error } = await supabase
                .from("Grocery List")
                .select("id, items, title, created_at")
                .eq("user_id", session.user.id);

            if (error) {
                console.error("Error fetching grocery lists:", error);
                return;
            }
            if(order == "oldest"){
                data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } 
            if(order == "newest"){
                data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            }
            
            data.forEach((list) => {
                list.created_at = new Date(list.created_at).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }
                );
            });
            console.log("Grocery Lists:", data);
            setLists(data); 
        }

        fetchGroceryLists();
    }, [order, showNotePopup]);

    const handleEditClick = (listId) => {
        setSelectedNoteId(listId);
        setShowNotePopup(true);
    };

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <ProfileNavBar />
            <div className="vl"></div>
            
            <div className="grocery-container">
                {/* Header */}
                <div className="grocery-list-header">
                    Grocery Lists

                    {/* Icons (Add, Filter) */}
                    <div className="grocery-icons-container">

                        <button className="filter-icon" onClick={() => setShowNotePopup(!showNotePopup)}> 
                            <BsPlusCircle  />
                        </button>

                        {/* Filter */}
                        <button className="filter-icon" onClick={toggleDropdown}>
                            <HiOutlineAdjustmentsHorizontal />
                            {showDropdown && (
                            <div className="filter-dropdown">
                                <p className="filter-dropdown-header">Sort by:</p>
                                <ul>
                                    <li onClick={() => setOrder("oldest")}>Oldest</li>
                                    <li onClick={() => setOrder("newest")}>Newest</li>
                                </ul>
                            </div>
                            )}
                        </button>
                    </div>
                </div>

                {showNotePopup && (
                    <CreateNote
                    onClose={() => setShowNotePopup(false)}
                    listId={selectedNoteId} />
                )}
                
                <div className="list-container">
                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <div key={list.id} className="list-card">
                                <div className="list-card-header">
                                    {list.title || `Grocery List - ${list.created_at}`}
                                    <div className="relative">
                                        <PiDotsThreeCircleVertical 
                                            className="edit-icon" 
                                            onClick={() => toggleMenu(list.id)}
                                        />
                                        {showMenu === list.id && (
                                            <div className="filter-dropdown">
                                                <ul>
                                                    <li onClick={() => handleEditClick(list.id)}>Edit</li>
                                                    <li onClick={() => deleteGroceryList(list.id)}>Delete</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <hr className="w-full border-t-1 border-black" />
                                <ul className="list-card-text">
                                    {Array.isArray(list.items)
                                        ? list.items.map((items, index) => <li className="grocery-item" key={index}>{items}</li>)
                                        : <li className="grocery-item">{list.items}</li>}
                                </ul>
                                
                            </div>
                        ))
                    ) : (
                        <p className="list-card-text">No grocery lists found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
