import { useState } from "react";
import { FaUser, FaRegUser } from "react-icons/fa6";
import { PiForkKnife, PiForkKnifeFill } from "react-icons/pi";
// import { BsCardChecklist } from "react-icons/bs";
import { RiFileList3Fill, RiFileList3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import "../pages/Profile.css";

export default function ProfileNavBar() {
    const navigate = useNavigate();
    const [active, setActive] = useState("profile");

    return (
        <div className="profile-sidebar">
            <div
                className="sidebar-icon"
                onClick={() => {
                    setActive("profile");
                    navigate("/profile");
                }}
            >
                {active === "profile" ? <FaUser /> : <FaRegUser />}
                <span className="sidebar-text">Profile</span>
            </div>

            <div
                className="sidebar-icon"
                onClick={() => setActive("tracker")}
            >
                {active === "tracker" ? <PiForkKnifeFill /> : <PiForkKnife />}
                <span className="sidebar-text">Nutrient Tracker</span>
            </div>

            <div
                className="sidebar-icon"
                onClick={() => {
                    setActive("grocery");
                    navigate("/grocery-list");
                }}
            >
                {active === "grocery" ? <RiFileList3Fill /> : <RiFileList3Line />}
                <span className="sidebar-text">Grocery List</span>
            </div>
        </div>        
    );
}
