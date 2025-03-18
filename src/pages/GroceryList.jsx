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

    // Toggle Dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        async function fetchGroceryLists() {
            const { data, error } = await supabase
                .from("Grocery List")
                .select("id, item, created_at");

            if (error) {
                console.error("Error fetching grocery lists:", error);
                return;
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
    }, []);

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
                            <p>Sort by:</p>
                            <ul>
                                <li>Oldest</li>
                                <li>Newest</li>
                                <li>Search for Date</li>
                            </ul>
                        </div>
                        )}
                    </button>
                </div>
                <button className="add-new-list">
                    <BsPlusCircle className="add-icon"  /> 
                    <div className="grocery-list-text">Create New Note or List</div>
                    {/* <CreateNote /> */}
                </button>
                
                <div className="list-container">
                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <div key={list.id} className="list-card">
                                <div className="list-card-header">Grocery List - {list.created_at}</div>
                                <ul className="list-card-text">
                                    {Array.isArray(list.item)
                                        ? list.item.map((item, index) => <li key={index}>{item}</li>)
                                        : <li>{list.item}</li>}
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
