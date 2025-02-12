import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Onboarding from "./pages/Onboarding/Onboarding.jsx";
import ProfileSetup from "./pages/Onboarding/ProfileSetup.jsx";
import DietaryPreferences from "./pages/Onboarding/DietaryPreferences.jsx";
import Allergies from "./pages/Onboarding/Allergies.jsx";
import Goals from "./pages/Onboarding/Goals.jsx";
import FindFriends from "./pages/Onboarding/FindFriends.jsx";
import User from "./pages/User.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

         {/* Onboarding Nested Routes */}
         <Route path="/onboarding" element={<Onboarding />}>
          <Route index element={<ProfileSetup />} />
          <Route path="dietary" element={<DietaryPreferences />} />
          <Route path="allergies" element={<Allergies />} />
          <Route path="goals" element={<Goals />} />
          <Route path="friends" element={<FindFriends />} />
        </Route>

        <Route path="/user" element={<User />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
