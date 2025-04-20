import React from "react";
import { Container } from "semantic-ui-react";
import { Outlet } from "react-router-dom";
import MenuBar from "../layouts/MenuBar";

const PageWrapper = () => {
  return (
    <div style={wrapperStyle}>
      <Container style={containerStyle}>
        <MenuBar /> {/* Add MenuBar inside the container */}
        <Outlet /> {/* Render page content below the MenuBar */}
      </Container>
    </div>
  );
};

const wrapperStyle = {
  display: "flex",
  justifyContent: "center", // Centers content horizontally
  alignItems: "flex-start", // Align content to the top
  minHeight: "100vh",
  width: "100%",
  padding: "20px",
  boxSizing: "border-box",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1728px", // Maximum width for large screens
  minHeight: '95vh',
  backgroundColor: "#fff",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional shadow for better visuals
  display: "flex",
  flexDirection: "column", // Ensure MenuBar and Outlet are stacked vertically
};

export default PageWrapper;
