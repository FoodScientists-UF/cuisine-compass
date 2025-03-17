import { FaUser } from "react-icons/fa";
import { PiForkKnife } from "react-icons/pi";
import { BsCardChecklist } from "react-icons/bs";
import "../pages/Profile.css";

export default function ProfileNavBar() {
    return (
        <div className="profile-sidebar">
            <div className="sidebar-icon"><FaUser /><span className="sidebar-text">Profile</span></div>
            <div className="sidebar-icon"><PiForkKnife /><span className="sidebar-text">Nutrient Tracker</span></div>
            <div className="sidebar-icon"><BsCardChecklist /><span className="sidebar-text">Grocery List</span></div>
        </div>        
    );
}
