import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileNavBar from "../components/ProfileNavBar";
import { BsPlusCircle } from "react-icons/bs";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { FaCircleMinus } from "react-icons/fa6";
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
    const [edit, setEdit] = useState(false);

    // Toggle Dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
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
                {/* Header */}
                <div className="grocery-list-header">
                    Grocery Lists

                    {/* Icons (Add, Edit, Filter) */}
                    <div className="grocery-icons-container">
                        {/* Edit button */}
                        <button className="filter-icon" onClick={() => setEdit(!edit)}> 
                            <MdOutlineModeEditOutline />
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
                <button className="add-new-list">
                    <BsPlusCircle className="add-icon"  /> 
                    <div className="create-list-text"
                        onClick={() => setShowNotePopup(!showNotePopup)}
                        >Create New Note or List
                    </div>
                </button>
                {showNotePopup && (
                    <CreateNote
                    onClose={() => setShowNotePopup(false)} />
                )}
                
                <div className="list-container">
                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <div key={list.id} className="list-card">
                                <div className="list-card-header">
                                    {list.title || `Grocery List - ${list.created_at}`}
                                    {edit && <FaCircleMinus className="delete-icon" onClick={() => deleteGroceryList(list.id)}/>}
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
