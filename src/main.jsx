import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Explore from "./pages/Explore.jsx";
import Following from "./pages/Following.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Signout from "./pages/Signout.jsx";
import CreateRecipe from "./pages/CreateRecipe.jsx";
import Onboarding from "./pages/Onboarding/Onboarding.jsx";
import ProfileSetup from "./pages/Onboarding/ProfileSetup.jsx";
import DietaryPreferences from "./pages/Onboarding/DietaryPreferences.jsx";
import Allergies from "./pages/Onboarding/Allergies.jsx";
import Goals from "./pages/Onboarding/Goals.jsx";
import FindFriends from "./pages/Onboarding/FindFriends.jsx";
import PageWrapper from "./components/PageWrapper";
import MenuBar from "./layouts/MenuBar";
import Profile from "./pages/Profile.jsx";
import ViewRecipe from "./pages/ViewRecipe.jsx";
import GroceryList from "./pages/GroceryList.jsx";
import { AuthProvider } from "./AuthProvider.jsx";
import Collection from "./pages/Collection.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PageWrapper>
                <MenuBar />
              </PageWrapper>
            }
          >
            <Route index element={<Explore />} />
            <Route path="explore" element={<Explore />} />
            <Route path="following" element={<Following />} />
            <Route path="about" element={<About />} />
            <Route path="createrecipe" element={<CreateRecipe />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/grocery-list" element={<GroceryList />} />
            <Route path="recipe/:id" element={<ViewRecipe />} />
            <Route path="collection/:collectionId" element={<Collection />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signout" element={<Signout />} />

          {/* Onboarding Nested Routes */}
          <Route path="/onboarding" element={<Onboarding />}>
            <Route index element={<ProfileSetup />} />
            <Route path="dietary" element={<DietaryPreferences />} />
            <Route path="allergies" element={<Allergies />} />
            <Route path="goals" element={<Goals />} />
            <Route path="friends" element={<FindFriends />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
