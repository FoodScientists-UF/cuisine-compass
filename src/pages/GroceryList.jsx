import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileNavBar from "../components/ProfileNavBar";
import { BsPlusCircle } from "react-icons/bs";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { supabase, AuthContext } from "../AuthProvider";
import CreateNote from "../components/CreateNote";
import "../pages/Profile.css";

export default function GroceryList() {
    const { id } = useParams();
    const { session } = useContext(AuthContext);
    const navigate = useNavigate();
    const [lists, setLists] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const[order, setOrder] = useState("oldest");
    const [showNotePopup, setShowNotePopup] = useState(false);

    // Toggle Dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        async function fetchGroceryLists() {
            const { data, error } = await supabase
                .from("Grocery List")
                .select("id, items, title, created_at");

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
    }, [order]);

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <ProfileNavBar />
            <div className="vl"></div>
            
            <div className="grocery-container">
                <div className="grocery-list-header">
                    Grocery Lists
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
                <button className="add-new-list">
                    <BsPlusCircle className="add-icon"  /> 
                    <div className="create-list-text"
                    onClick={() => setShowNotePopup(!showNotePopup)}
                    >Create New Note or List</div>
                    
                </button>
                {showNotePopup && (
                    <CreateNote
                    onClose={() => setShowNotePopup(false)} />
                )}
                
                <div className="list-container">
                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <div key={list.id} className="list-card">
                                <div className="list-card-header">{list.title || `Grocery List - ${list.created_at}`}</div>
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
