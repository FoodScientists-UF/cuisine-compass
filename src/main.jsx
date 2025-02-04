import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./Auth.jsx";
import "./index.css";
import App from "./App.jsx";
import Explore from "./Explore.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
